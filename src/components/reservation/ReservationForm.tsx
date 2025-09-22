import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface ReservationFormProps {
  contactData: ContactData;
  selectedSlots: SelectedSlot[];
  totalPrice: number;
  onContactDataChange: (data: ContactData) => void;
  onPreviousStep: () => void;
  onConfirmReservation: () => void;
}

export const ReservationForm = ({
  contactData,
  selectedSlots,
  totalPrice,
  onContactDataChange,
  onPreviousStep,
  onConfirmReservation
}: ReservationFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberData, setRememberData] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!contactData.name.trim()) {
      newErrors.name = 'Jméno je povinné';
    }

    if (!contactData.email.trim()) {
      newErrors.email = 'E-mail je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }

    if (!contactData.phone.trim()) {
      newErrors.phone = 'Telefon je povinný';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirmReservation();
    }
  };

  const handleInputChange = (field: keyof ContactData, value: string) => {
    onContactDataChange({
      ...contactData,
      [field]: value
    });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white">
      <h2 className="text-xl font-medium mb-6">Rezervace bez přihlášení</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Jméno a příjmení *
            </Label>
            <Input
              id="name"
              value={contactData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`border border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder=""
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail *
            </Label>
            <Input
              id="email"
              type="email"
              value={contactData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`border border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              placeholder=""
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Telefon *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`border border-blue-300 focus:border-blue-500 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : ''
            }`}
            placeholder=""
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Poznámka
          </Label>
          <Textarea
            id="notes"
            value={contactData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="border border-blue-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
            placeholder=""
            rows={4}
          />
        </div>

        <div className="text-sm text-gray-600">
          * Položky označené jsou povinné.
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberData}
            onCheckedChange={(checked) => setRememberData(checked as boolean)}
          />
          <Label htmlFor="remember" className="text-sm text-gray-700">
            Pamatovat si zadané údaje na tomto počítači
          </Label>
        </div>

        {/* Account buttons */}
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 px-8"
          >
            Přihlášení
          </Button>
          <Button
            variant="outline"
            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500 px-8"
          >
            Vytvoření účtu
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
        <button
          onClick={onPreviousStep}
          className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Zpět</span>
        </button>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium flex items-center space-x-2"
        >
          <span>Další krok</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};