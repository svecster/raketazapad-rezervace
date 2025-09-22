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
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Rezervace kurtů</h1>
          <p className="text-muted-foreground">
            Vyberte si termíny a dokončete rezervaci
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 py-4">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <span className={currentStep >= 1 ? 'font-medium' : 'text-muted-foreground'}>
              Výběr termínu
            </span>
          </div>
          
          <div className={`w-8 h-px ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              <User className="w-4 h-4" />
            </div>
            <span className={currentStep >= 2 ? 'font-medium' : 'text-muted-foreground'}>
              Kontaktní údaje
            </span>
          </div>
        </div>

        {/* Step 1: Calendar */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Předchozí týden
              </Button>
              
              <h2 className="text-lg font-semibold">
                {format(currentWeek, 'dd.MM.yyyy', { locale: cs })} - {format(addDays(currentWeek, 6), 'dd.MM.yyyy', { locale: cs })}
              </h2>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                Další týden
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
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

        {/* Manage Reservations Link */}
        <div className="fixed bottom-4 right-4">
          <Button variant="outline" size="sm" className="shadow-lg">
            Správa vašich rezervací
          </Button>
        </div>
      </div>
    </Layout>
  );
};