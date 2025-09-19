import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GuestWizardStep1 } from '@/components/guest/GuestWizardStep1';
import { GuestWizardStep2 } from '@/components/guest/GuestWizardStep2';
import { GuestWizardStep3 } from '@/components/guest/GuestWizardStep3';

interface CourtSlot {
  courtId: string;
  courtName: string;
  courtType: 'indoor' | 'outdoor';
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export const GuestReservation = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState({
    courtType: '',
    date: '',
    startTime: '',
    duration: '1.5',
    selectedSlot: undefined as CourtSlot | undefined,
  });
  const [step2Data, setStep2Data] = useState({
    name: '',
    email: '',
    phone: '',
    playersCount: '2',
    notes: '',
  });

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const handleStep1Change = (data: typeof step1Data) => {
    setStep1Data(data);
  };

  const handleStep2Change = (data: typeof step2Data) => {
    setStep2Data(data);
  };

  const handleStep2Next = () => {
    setCurrentStep(3);
  };

  const handleStep2Previous = () => {
    setCurrentStep(1);
  };

  const handleStep3Previous = () => {
    setCurrentStep(2);
  };

  const handleReservationComplete = (reservationId: string) => {
    // Redirect to confirmation page
    window.location.href = `/guest/r/${reservationId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/auth" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přihlášení
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Rezervace bez registrace</h1>
          <p className="text-muted-foreground mt-2">Rychle a jednoduše si rezervujte kurt</p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step < currentStep
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-muted-foreground">
            {currentStep === 1 && 'Vyberte kurt a čas'}
            {currentStep === 2 && 'Kontaktní údaje'}
            {currentStep === 3 && 'Shrnutí a platba'}
          </div>
        </div>

        {currentStep === 1 && (
          <GuestWizardStep1
            data={step1Data}
            onChange={handleStep1Change}
            onNext={handleStep1Next}
          />
        )}

        {currentStep === 2 && (
          <GuestWizardStep2
            data={step2Data}
            onChange={handleStep2Change}
            onNext={handleStep2Next}
            onPrevious={handleStep2Previous}
          />
        )}

        {currentStep === 3 && (
          <GuestWizardStep3
            courtData={step1Data}
            contactData={step2Data}
            onPrevious={handleStep3Previous}
            onComplete={handleReservationComplete}
          />
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Provozní doba: 7:00 - 23:00</p>
          <p>Minimální doba rezervace: 30 minut</p>
          <p>Po vytvoření rezervace obdržíte email s potvrzením</p>
        </div>
      </div>
    </div>
  );
};