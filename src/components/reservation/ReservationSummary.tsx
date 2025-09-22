import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

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

interface ReservationSummaryProps {
  selectedSlots: SelectedSlot[];
  totalPrice: number;
  onRemoveSlot: (slotId: string) => void;
  onNextStep: () => void;
}

export const ReservationSummary = ({ 
  selectedSlots, 
  totalPrice, 
  onRemoveSlot, 
  onNextStep 
}: ReservationSummaryProps) => {
  if (selectedSlots.length === 0) {
    return null;
  }

  // Group consecutive slots
  const formatSlotInfo = (slot: SelectedSlot) => {
    const dayName = format(slot.date, 'EEEE', { locale: cs });
    const dateStr = format(slot.date, 'dd.M.', { locale: cs });
    return `${slot.courtName} 2024/2025 (${slot.courtName} 2024/2025): ${dayName} ${dateStr} ${slot.startTime} až ${slot.endTime}`;
  };

  return (
    <div className="mt-8">
      {/* Selected slots summary */}
      <div className="space-y-2">
        {selectedSlots.map((slot) => (
          <div key={slot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <span className="text-sm text-gray-700">{formatSlotInfo(slot)}</span>
            <button
              onClick={() => onRemoveSlot(slot.id)}
              className="text-gray-500 hover:text-red-500 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Next step button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNextStep}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium flex items-center space-x-2"
        >
          <span>Další krok</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};