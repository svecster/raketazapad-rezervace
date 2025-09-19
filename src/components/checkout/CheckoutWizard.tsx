/**
 * Checkout Wizard - Main 3-step checkout process
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ShoppingCart, CreditCard, Receipt, ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { checkoutService, type Checkout } from '@/services/checkoutService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/currency';

export interface CheckoutWizardProps {
  reservationId?: string;
  onComplete?: (checkoutId: string) => void;
  onCancel?: () => void;
}

const STEPS = [
  { 
    id: 1, 
    title: 'Košík & Účty', 
    description: 'Přidat položky a vytvořit účty',
    icon: ShoppingCart 
  },
  { 
    id: 2, 
    title: 'Platby', 
    description: 'Zvolit způsob platby',
    icon: CreditCard 
  },
  { 
    id: 3, 
    title: 'Dokončení', 
    description: 'Doklady a uzavření',
    icon: Receipt 
  }
];

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  reservationId,
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = async () => {
    setIsLoading(true);
    try {
      let newCheckout: Checkout;
      
      if (reservationId) {
        newCheckout = await checkoutService.createCheckoutFromReservation(reservationId);
        toast({
          title: "Checkout vytvořen",
          description: "Checkout byl úspěšně vytvořen z rezervace"
        });
      } else {
        newCheckout = await checkoutService.createEmptyCheckout();
        toast({
          title: "Nový checkout",
          description: "Prázdný checkout byl vytvořen"
        });
      }
      
      setCheckout(newCheckout);
      validateCurrentStep(newCheckout, 1);
    } catch (error) {
      console.error('Error initializing checkout:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se vytvořit checkout",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCheckout = async () => {
    if (!checkout?.id) return;
    
    try {
      const updated = await checkoutService.getCheckout(checkout.id);
      setCheckout(updated);
      validateCurrentStep(updated, currentStep);
    } catch (error) {
      console.error('Error refreshing checkout:', error);
    }
  };

  const validateCurrentStep = (checkoutData: Checkout, step: number) => {
    switch (step) {
      case 1:
        // Step 1: Must have at least one item and balanced accounts
        const hasItems = checkoutData.items.length > 0;
        const hasValidAccounts = checkoutData.accounts.every(acc => acc.total_amount >= 0);
        setCanProceed(hasItems && hasValidAccounts);
        break;
        
      case 2:
        // Step 2: All accounts must have payment method selected
        const allAccountsHavePayment = checkoutData.accounts.every(acc => 
          acc.payment_status === 'paid' || acc.payment_methods.length > 0
        );
        setCanProceed(allAccountsHavePayment);
        break;
        
      case 3:
        // Step 3: All accounts must be paid
        const allAccountsPaid = checkoutData.accounts.every(acc => 
          acc.payment_status === 'paid'
        );
        setCanProceed(allAccountsPaid);
        break;
        
      default:
        setCanProceed(false);
    }
  };

  const handleStepChange = (step: number) => {
    if (step > currentStep && !canProceed) {
      toast({
        title: "Nelze pokračovat",
        description: getStepValidationMessage(),
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(step);
    if (checkout) {
      validateCurrentStep(checkout, step);
    }
  };

  const getStepValidationMessage = (): string => {
    switch (currentStep) {
      case 1:
        return "Přidejte alespoň jednu položku a vyrovnejte všechny účty";
      case 2:
        return "Vyberte způsob platby pro všechny účty";
      case 3:
        return "Dokončete platbu všech účtů";
      default:
        return "Dokončete aktuální krok";
    }
  };

  const handleComplete = () => {
    if (checkout?.id && onComplete) {
      onComplete(checkout.id);
    }
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Načítám checkout...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!checkout) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nepodařilo se načíst checkout</p>
            <Button onClick={initializeCheckout} className="mt-4">
              Zkusit znovu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pokladna - Checkout
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {reservationId ? 'Checkout z rezervace' : 'Ruční checkout'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Celkem: {formatCurrency(checkout.total_amount)}
              </Badge>
              <Badge 
                variant={checkout.status === 'completed' ? 'default' : 'secondary'}
              >
                {checkout.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Dokončeno
                  </>
                ) : (
                  'Otevřeno'
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Steps indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const status = getStepStatus(step.id);
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div className={`flex-1 h-0.5 ${
                          status === 'completed' ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                      
                      <button
                        onClick={() => handleStepChange(step.id)}
                        className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2 mx-2
                          transition-colors
                          ${status === 'completed' ? 'bg-primary border-primary text-primary-foreground' : ''}
                          ${status === 'current' ? 'border-primary bg-background text-primary' : ''}
                          ${status === 'upcoming' ? 'border-muted bg-background text-muted-foreground' : ''}
                        `}
                      >
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </button>
                      
                      {index < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 ${
                          step.id < currentStep ? 'bg-primary' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        status === 'current' ? 'text-primary' : 
                        status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <div className="min-h-[600px]">
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Košík & Účty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Položky</h3>
                    {checkout.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.total_price)}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}x {formatCurrency(item.unit_price)}</p>
                        </div>
                      </div>
                    ))}
                    <Button size="sm" className="w-full mt-3">
                      <Plus className="h-4 w-4 mr-2" />
                      Přidat položku
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Účty</h3>
                    {checkout.accounts.map((account, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{account.name}</p>
                          <Badge variant={account.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {formatCurrency(account.total_amount)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {account.assigned_players.length} hráčů
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Platby</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkout.accounts.map((account, index) => (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{account.name}</h4>
                      <p className="text-lg font-bold">{formatCurrency(account.total_amount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Hotově
                      </Button>
                      <Button size="sm" variant="outline">
                        QR platba
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Dokončení</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-xl font-semibold">Checkout dokončen!</h3>
                <p className="text-muted-foreground">
                  Celková částka: {formatCurrency(checkout.total_amount)}
                </p>
                <Button onClick={handleComplete}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Vytisknout doklad
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? handleStepChange(currentStep - 1) : onCancel?.()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep > 1 ? 'Předchozí' : 'Zrušit'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Krok {currentStep} z {STEPS.length}
              </p>
            </div>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={() => handleStepChange(currentStep + 1)}
                disabled={!canProceed}
              >
                Pokračovat
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Dokončit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};