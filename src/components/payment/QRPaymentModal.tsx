/**
 * QR Payment Modal Component
 * Displays QR code for payment with mobile-optimized view
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, Smartphone, Check, X } from 'lucide-react';
import { qrPaymentService, QRPaymentResult } from '@/services/qrPaymentService';
import { formatCurrency } from '@/lib/utils/currency';
import { useToast } from '@/hooks/use-toast';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed: () => void;
  amount: number;
  description: string;
  reservationId?: string;
  courtName?: string;
  date?: string;
}

export const QRPaymentModal = ({
  isOpen,
  onClose,
  onPaymentConfirmed,
  amount,
  description,
  reservationId,
  courtName,
  date
}: QRPaymentModalProps) => {
  const [qrData, setQRData] = useState<QRPaymentResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !qrData) {
      generateQRCode();
    }
  }, [isOpen, amount, description]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      let qrResult: QRPaymentResult;
      
      if (reservationId) {
        qrResult = await qrPaymentService.generateReservationQR(
          reservationId, 
          amount, 
          courtName, 
          date
        );
      } else {
        qrResult = await qrPaymentService.generateQRCode({
          amount,
          message: description
        });
      }
      
      setQRData(qrResult);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se vygenerovat QR kód",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.download = `qr-platba-${Date.now()}.png`;
    link.href = qrData.qrCode;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Staženo",
      description: "QR kód byl stažen"
    });
  };

  const copyPaymentDetails = async () => {
    if (!qrData) return;

    const details = qrPaymentService.formatPaymentDetails(qrData.paymentString);
    const detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(detailsText);
      toast({
        title: "Zkopírováno",
        description: "Platební údaje byly zkopírovány"
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se zkopírovat údaje",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setQRData(null);
    setIsFullscreen(false);
    onClose();
  };

  if (isFullscreen && qrData) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">QR Platba</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <img 
              src={qrData.qrCode} 
              alt="QR kód pro platbu" 
              className="w-full h-auto max-w-80 mx-auto"
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            <p className="text-xs text-muted-foreground">
              Naskenujte ve Vaší bankovní aplikaci
            </p>
          </div>

          <div className="flex gap-2 justify-center mt-6">
            <Button onClick={onPaymentConfirmed} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Zaplaceno
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Platba</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Generuji QR kód...</p>
            </div>
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            {/* Payment Amount */}
            <Card>
              <CardContent className="pt-4">
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-primary">{formatCurrency(amount)}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <img 
                  src={qrData.qrCode} 
                  alt="QR kód pro platbu" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>

            {/* Mobile View Button */}
            <Button 
              variant="outline" 
              onClick={() => setIsFullscreen(true)}
              className="w-full"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Zobrazit na celou obrazovku
            </Button>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Platební údaje:</h4>
              {Object.entries(qrPaymentService.formatPaymentDetails(qrData.paymentString)).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-mono">{value}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadQRCode} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Stáhnout
              </Button>
              <Button variant="outline" onClick={copyPaymentDetails} className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                Kopírovat
              </Button>
            </div>

            {/* Confirmation */}
            <div className="pt-2 space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">
                Čeká na platbu
              </Badge>
              <p className="text-xs text-center text-muted-foreground">
                Po zaplacení označte platbu jako přijatou
              </p>
              <Button onClick={onPaymentConfirmed} className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Označit jako zaplaceno
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Nepodařilo se vygenerovat QR kód</p>
            <Button onClick={generateQRCode} className="mt-2">
              Zkusit znovu
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};