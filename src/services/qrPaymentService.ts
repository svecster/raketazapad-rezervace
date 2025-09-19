/**
 * Czech QR Payment service
 * Generates QR codes for Czech "QR Platba" standard
 */

export interface QRPaymentData {
  amount: number;
  currency: string;
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
  private readonly defaultRecipient = {
    name: 'Tenisový klub Raketa',
    account: '123456789',
    bank: '0100', // Komerční banka
  };

  generatePaymentString(data: QRPaymentData): string {
    const {
      amount,
      currency = 'CZK',
      message = '',
      variableSymbol = '',
      constantSymbol = '',
      specificSymbol = '',
      recipientName = this.defaultRecipient.name,
      recipientAccount = this.defaultRecipient.account,
      recipientBank = this.defaultRecipient.bank,
    } = data;

    // Czech QR Payment format (simplified version of SPAYD)
    let paymentString = `SPD*1.0*ACC:${recipientAccount}/${recipientBank}*AM:${amount.toFixed(2)}*CC:${currency}`;
    
    if (recipientName) {
      paymentString += `*RN:${recipientName}`;
    }
    
    if (message) {
      paymentString += `*MSG:${message}`;
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
    const paymentString = this.generatePaymentString(data);
    
    // In a real implementation, you would use a QR code library like qrcode
    // For now, we'll create a data URL that represents the QR code
    const qrCodeDataUrl = await this.createQRCodeDataUrl(paymentString);
    
    return {
      qrCode: qrCodeDataUrl,
      paymentString,
      displayAmount: `${data.amount.toFixed(2)} ${data.currency}`,
    };
  }

  async generateSplitPayments(
    totalAmount: number,
    playerShares: { playerId: string; playerName: string; amount: number }[],
    reservationId: string
  ): Promise<{ playerId: string; playerName: string; qrPayment: QRPaymentResult }[]> {
    const results = [];

    for (const share of playerShares) {
      const qrPayment = await this.generateQRCode({
        amount: share.amount,
        currency: 'CZK',
        message: `Tenisový klub - Rezervace ${reservationId.slice(-8)}`,
        variableSymbol: reservationId.replace('-', '').slice(-8),
      });

      results.push({
        playerId: share.playerId,
        playerName: share.playerName,
        qrPayment,
      });
    }

    return results;
  }

  private async createQRCodeDataUrl(data: string): Promise<string> {
    // This is a placeholder implementation
    // In a real app, you would use a QR code library like:
    // import QRCode from 'qrcode';
    // return await QRCode.toDataURL(data);
    
    // For now, return a placeholder SVG
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          QR kód pro platbu
        </text>
        <text x="100" y="120" text-anchor="middle" font-family="Arial" font-size="10">
          ${data.substring(0, 30)}...
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
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