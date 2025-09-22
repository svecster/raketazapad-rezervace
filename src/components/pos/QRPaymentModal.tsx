import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

interface QRPaymentModalProps {
  amount: number;
  onClose: () => void;
  onComplete: () => void;
}

export function QRPaymentModal({ amount, onClose, onComplete }: QRPaymentModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [paymentString, setPaymentString] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [amount]);

  const generateQRCode = async () => {
    try {
      // For now, create a simple bank transfer string
      // This should use the actual QR payment service when implemented
      const paymentData = {
        amount: amount,
        currency: 'CZK',
        message: 'Platba za nákup - Tenis Nisa',
        recipient: 'Tenis Nisa'
      };

      const paymentStr = `Příjemce: ${paymentData.recipient}\nČástka: ${formatCurrency(paymentData.amount)}\nZpráva: ${paymentData.message}`;
      
      setPaymentString(paymentStr);
      
      // Generate QR code (placeholder - would use actual QR generation)
      setQrCodeDataUrl('data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="10" y="10" width="180" height="180" fill="black"/>
          <rect x="20" y="20" width="160" height="160" fill="white"/>
          <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">QR Code</text>
          <text x="100" y="120" text-anchor="middle" fill="black" font-size="10">${formatCurrency(amount)}</text>
        </svg>
      `));
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Chyba při generování QR kódu');
      onClose();
    }
  };

  const copyPaymentString = () => {
    navigator.clipboard.writeText(paymentString);
    setCopied(true);
    toast.success('Údaje zkopírovány');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentComplete = () => {
    onComplete();
    toast.success('Platba potvrzena');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Platba
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Amount */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(amount)}
            </div>
            <Badge variant="secondary" className="mt-2">
              CZK - Česká koruna
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg border">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code pro platbu" 
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Platební údaje:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyPaymentString}
                    className="h-8"
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                  {paymentString}
                </pre>
              </div>

              {/* Instructions */}
              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Naskenujte QR kód bankovní aplikací</p>
                <p>2. Potvrďte platbu v aplikaci</p>
                <p>3. Po úspěšné platbě klikněte na "Platba dokončena"</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={handlePaymentComplete}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Platba dokončena
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}