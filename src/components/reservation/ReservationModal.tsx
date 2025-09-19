import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  User,
  Phone,
  Mail,
  Users,
  MessageSquare,
  Wifi,
  Zap,
  CheckCircle
} from 'lucide-react';
import { CourtSelection } from './steps/CourtSelection';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { ContactInfo } from './steps/ContactInfo';
import { Summary } from './steps/Summary';

import { AccountOfferModal } from './AccountOfferModal';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CourtInfo {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  basePrice: number;
  features: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

export interface ReservationData {
  court?: CourtInfo;
  date?: string;
  startTime?: string;
  duration?: number; // in minutes
  contact?: {
    name: string;
    email: string;
    phone: string;
    playersCount?: string;
    notes?: string;
  };
  payment?: {
    method: 'cash' | 'card' | 'qr';
    totalPrice: number;
  };
}

const steps = [
  { id: 1, title: 'Vyberte kurt', icon: MapPin },
  { id: 2, title: 'Datum a čas', icon: Calendar },
  { id: 3, title: 'Kontaktní údaje', icon: User },
  { id: 4, title: 'Souhrn a platba', icon: CreditCard }
];

export const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({});
  const [showAccountOffer, setShowAccountOffer] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const handleStepChange = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataUpdate = (stepData: Partial<ReservationData>) => {
    setReservationData(prev => ({ ...prev, ...stepData }));
  };

  const handleReservationComplete = (id: string) => {
    setReservationId(id);
    setShowAccountOffer(true);
  };

  const handleAccountOfferClose = (createAccount: boolean) => {
    setShowAccountOffer(false);
    if (createAccount && reservationData.contact) {
      // Redirect to registration with prefilled data
      const queryParams = new URLSearchParams({
        name: reservationData.contact.name,
        email: reservationData.contact.email,
        phone: reservationData.contact.phone,
        fromReservation: 'true'
      });
      window.location.href = `/auth?tab=signup&${queryParams.toString()}`;
    } else {
      // Close modal and redirect to guest confirmation
      onClose();
      if (reservationId) {
        window.location.href = `/guest/r/${reservationId}`;
      }
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setReservationData({});
    setReservationId(null);
    setShowAccountOffer(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!reservationData.court;
      case 2:
        return !!reservationData.date && !!reservationData.startTime && !!reservationData.duration;
      case 3:
        return !!(reservationData.contact?.name && reservationData.contact?.email && reservationData.contact?.phone);
      default:
        return false;
    }
  };

  const CurrentStepIcon = steps[currentStep - 1]?.icon || MapPin;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center text-xl">
                <CurrentStepIcon className="mr-2 h-5 w-5 text-primary" />
                {steps[currentStep - 1]?.title || 'Rezervace'}
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center mt-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                      step.id === currentStep
                        ? 'border-primary bg-primary text-primary-foreground'
                        : step.id < currentStep
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        step.id < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[400px]">
            {currentStep === 1 && (
              <CourtSelection
                selectedCourt={reservationData.court}
                onCourtSelect={(court) => handleDataUpdate({ court })}
              />
            )}
            
            {currentStep === 2 && (
              <DateTimeSelection
                selectedCourt={reservationData.court}
                date={reservationData.date}
                startTime={reservationData.startTime}
                duration={reservationData.duration}
                onDateTimeSelect={(dateTime) => handleDataUpdate(dateTime)}
              />
            )}
            
            {currentStep === 3 && (
              <ContactInfo
                contactData={reservationData.contact}
                onContactUpdate={(contact) => handleDataUpdate({ contact })}
              />
            )}
            
            {currentStep === 4 && (
              <Summary
                reservationData={reservationData}
                onPaymentComplete={handleReservationComplete}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Zpět
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Krok {currentStep} ze {steps.length}
              </div>
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="btn-tennis flex items-center"
                >
                  Pokračovat
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <div className="w-24" /> // Placeholder to maintain layout
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AccountOfferModal
        isOpen={showAccountOffer}
        onClose={handleAccountOfferClose}
        contactData={reservationData.contact}
      />
    </>
  );
};