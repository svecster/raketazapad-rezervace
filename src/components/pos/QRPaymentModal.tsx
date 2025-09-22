import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, QrCode } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import { qrPaymentService } from '@/services/qrPaymentService';

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
      const result = await qrPaymentService.generateBarOrderQR(
        `POS-${Date.now()}`, 
        amount
      );
      
      setPaymentString(result.paymentString);
      setQrCodeDataUrl(result.qrCode);
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