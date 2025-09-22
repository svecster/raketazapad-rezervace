import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { WeeklyCalendar } from '@/components/reservation/WeeklyCalendar';
import { ReservationSummary } from '@/components/reservation/ReservationSummary';
import { ReservationForm } from '@/components/reservation/ReservationForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addDays, subDays, startOfWeek, format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  seasonal_price_rules: Record<string, number>;
  status: 'available' | 'unavailable';
}

interface TimeSlot {
  courtId: string;
  courtName: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  isOccupied: boolean;
}

interface SelectedSlot extends TimeSlot {
  id: string;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export const ReservantoReservation = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'available')
        .order('name');

      if (error) throw error;
      setCourts((data || []) as Court[]);
    } catch (error: any) {
      toast({
        title: 'Chyba při načítání kurtů',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' 
      ? subDays(currentWeek, 7) 
      : addDays(currentWeek, 7)
    );
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    const slotId = `${slot.courtId}-${slot.date.toISOString()}-${slot.startTime}`;
    
    const existingSlot = selectedSlots.find(s => s.id === slotId);
    if (existingSlot) {
      // Remove slot if already selected
      setSelectedSlots(selectedSlots.filter(s => s.id !== slotId));
    } else {
      // Add slot
      setSelectedSlots([...selectedSlots, { ...slot, id: slotId }]);
    }
  };

  const handleRemoveSlot = (slotId: string) => {
    setSelectedSlots(selectedSlots.filter(s => s.id !== slotId));
  };

  const handleNextStep = () => {
    if (selectedSlots.length === 0) {
      toast({
        title: 'Vyberte termín',
        description: 'Prosím vyberte alespoň jeden časový slot.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleContactDataChange = (data: ContactData) => {
    setContactData(data);
  };

  const handleConfirmReservation = async () => {
    try {
      // Here you would implement the reservation creation logic
      // For now, just show success message
      toast({
        title: 'Rezervace vytvořena!',
        description: `Vaše rezervace na ${selectedSlots.length} termín${selectedSlots.length > 1 ? 'y' : ''} byla úspěšně vytvořena.`,
      });
      
      // Reset form
      setSelectedSlots([]);
      setContactData({ name: '', email: '', phone: '', notes: '' });
      setCurrentStep(1);
    } catch (error: any) {
      toast({
        title: 'Chyba při vytváření rezervace',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const totalPrice = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Načítání...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-normal text-blue-400">ONLINE REZERVACE</h1>
          </div>
          <div className="text-right">
            <div className="text-blue-500 font-bold text-lg">tenis<span className="bg-blue-500 text-white px-1 rounded">a</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-800">
              ←
            </button>
            <h2 className="text-lg font-semibold">Vyberte rezervaci</h2>
            <button className="text-gray-600 hover:text-gray-800">
              →
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm">
              📅 Kalendář
            </button>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Nepřihlášen (</span>
            <button className="text-blue-500 text-sm hover:underline">přihlášení</button>
            <span className="text-sm text-gray-600">)</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">Rezervovaná služba:</label>
          <select className="ml-2 border border-gray-300 rounded px-3 py-1 text-sm">
            <option>HALA 2024/2025</option>
          </select>
        </div>


        {/* Step 1: Calendar */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-lg font-semibold mb-4">
              {format(addDays(currentWeek, 0), 'EEEE dd. MMMM yyyy', { locale: cs })}
            </div>

            {/* Calendar Grid */}
            <WeeklyCalendar
              courts={courts}
              currentWeek={currentWeek}
              selectedSlots={selectedSlots}
              onSlotSelect={handleSlotSelect}
            />

            {/* Summary */}
            <ReservationSummary
              selectedSlots={selectedSlots}
              totalPrice={totalPrice}
              onRemoveSlot={handleRemoveSlot}
              onNextStep={handleNextStep}
            />
          </div>
        )}

        {/* Step 2: Contact Form */}
        {currentStep === 2 && (
          <ReservationForm
            contactData={contactData}
            selectedSlots={selectedSlots}
            totalPrice={totalPrice}
            onContactDataChange={handleContactDataChange}
            onPreviousStep={handlePreviousStep}
            onConfirmReservation={handleConfirmReservation}
          />
        )}

        {/* Footer */}
        <div className="fixed bottom-4 left-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="bg-black text-white px-2 py-1 rounded font-bold">
              <span className="text-white">⚡</span> RESERVANTO
            </div>
            <button className="text-blue-500 hover:underline text-sm">
              📋 Správa vašich rezervací
            </button>
          </div>
        </div>

        <div className="fixed bottom-4 right-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium">
            Další krok →
          </button>
        </div>
      </div>
    </Layout>
  );
};