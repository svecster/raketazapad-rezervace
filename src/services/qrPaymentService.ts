/**
 * Czech QR Payment service
 * Generates QR codes for Czech "QR Platba" standard (SPAYD)
 */

import QRCode from 'qrcode';
import { supabase } from "@/integrations/supabase/client";

export interface QRPaymentData {
  amount: number;
  currency?: string;
  message?: string;
  variableSymbol?: string;
  constantSymbol?: string;
  specificSymbol?: string;
  recipientName?: string;
  recipientAccount?: string;
  recipientBank?: string;
}

export interface QRPaymentResult {
  qrCode: string;
  paymentString: string;
  displayAmount: string;
}

class QRPaymentService {
  private settings: any = null;

  async getSettings() {
    if (!this.settings) {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error loading payment settings:', error);
        // Fallback to defaults
        this.settings = {
          qr_iban: '',
          qr_bank_code: '0100',
          qr_recipient_name: 'Tenisový klub Raketa',
          qr_default_message: 'Tenisový klub - platba',
          qr_variable_symbol_prefix: 'TK'
        };
      } else {
        this.settings = data;
      }
    }
    return this.settings;
  }

  async generatePaymentString(data: QRPaymentData): Promise<string> {
    const settings = await this.getSettings();
    const {
      amount,
      currency = 'CZK',
      message = settings.qr_default_message,
      variableSymbol = '',
      constantSymbol = '',
      specificSymbol = '',
      recipientName = settings.qr_recipient_name,
      recipientAccount = settings.qr_iban,
      recipientBank = settings.qr_bank_code,
    } = data;

    // Czech QR Payment format (SPAYD) with IBAN format
    let paymentString = `SPD*1.0*ACC:${recipientAccount}*AM:${amount.toFixed(2)}*CC:${currency}`;
    
    if (recipientName) {
      paymentString += `*RN:${encodeURIComponent(recipientName)}`;
    }
    
    if (message) {
      paymentString += `*MSG:${encodeURIComponent(message)}`;
    }
    
    if (variableSymbol) {
      paymentString += `*X-VS:${variableSymbol}`;
    }
    
    if (constantSymbol) {
      paymentString += `*X-KS:${constantSymbol}`;
    }
    
    if (specificSymbol) {
      paymentString += `*X-SS:${specificSymbol}`;
    }

    return paymentString;
  }

  async generateQRCode(data: QRPaymentData): Promise<QRPaymentResult> {
    const paymentString = await this.generatePaymentString(data);
    
    // Generate actual QR code
    const qrCodeDataUrl = await QRCode.toDataURL(paymentString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    return {
      qrCode: qrCodeDataUrl,
      paymentString,
      displayAmount: `${data.amount.toFixed(2)} ${data.currency || 'CZK'}`,
    };
  }

  async generateReservationQR(reservationId: string, amount: number, courtName?: string, date?: string): Promise<QRPaymentResult> {
    const settings = await this.getSettings();
    const shortId = reservationId.slice(-8).toUpperCase();
    const message = courtName && date 
      ? `Raketa - ${courtName} ${date}`
      : `Raketa - Rezervace ${shortId}`;
    
    return this.generateQRCode({
      amount,
      currency: 'CZK',
      message,
      variableSymbol: `${settings.qr_variable_symbol_prefix}${shortId.replace('-', '')}`,
    });
  }

  async generateBarOrderQR(orderId: string, amount: number): Promise<QRPaymentResult> {
    const settings = await this.getSettings();
    const shortId = orderId.slice(-8).toUpperCase();
    
    return this.generateQRCode({
      amount,
      currency: 'CZK',
      message: `Raketa - Bar ${shortId}`,
      variableSymbol: `${settings.qr_variable_symbol_prefix}B${shortId.replace('-', '')}`,
    });
  }

  async generateSVGQRCode(data: QRPaymentData): Promise<string> {
    const paymentString = await this.generatePaymentString(data);
    
    // Generate SVG QR code for better scalability
    const svgString = await QRCode.toString(paymentString, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });
    
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  }

  formatPaymentDetails(paymentString: string): { [key: string]: string } {
    const details: { [key: string]: string } = {};
    const parts = paymentString.split('*');
    
    for (const part of parts) {
      const [key, value] = part.split(':');
      if (key && value) {
        switch (key) {
          case 'ACC':
            details['Účet'] = value;
            break;
          case 'AM':
            details['Částka'] = `${value} CZK`;
            break;
          case 'MSG':
            details['Zpráva'] = decodeURIComponent(value);
            break;
          case 'X-VS':
            details['Variabilní symbol'] = value;
            break;
          case 'RN':
            details['Příjemce'] = decodeURIComponent(value);
            break;
        }
      }
    }
    
    return details;
  }

  calculateEqualShares(totalAmount: number, numberOfPlayers: number): number[] {
    const baseAmount = Math.floor((totalAmount * 100) / numberOfPlayers) / 100;
    const remainder = Math.round((totalAmount - baseAmount * numberOfPlayers) * 100) / 100;
    
    const shares = new Array(numberOfPlayers).fill(baseAmount);
    
    // Distribute remainder to first few players (in cents)
    const remainderCents = Math.round(remainder * 100);
    for (let i = 0; i < remainderCents; i++) {
      shares[i] += 0.01;
    }
    
    return shares;
  }

  validateAmount(amount: number): { isValid: boolean; message?: string } {
    if (amount <= 0) {
      return { isValid: false, message: 'Částka musí být větší než 0 Kč' };
    }
    
    if (amount > 50000) {
      return { isValid: false, message: 'Částka nesmí být větší než 50 000 Kč' };
    }
    
    if (Math.round(amount * 100) !== amount * 100) {
      return { isValid: false, message: 'Částka může mít maximálně 2 desetinná místa' };
    }
    
    return { isValid: true };
  }
}

export const qrPaymentService = new QRPaymentService();