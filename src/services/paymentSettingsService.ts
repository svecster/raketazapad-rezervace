/**
 * Payment Settings Service
 * Manages payment configuration and preferences
 */

import { supabase } from "@/integrations/supabase/client";

export interface PaymentSettings {
  id: string;
  created_at: string;
  updated_at: string;
  cash_enabled: boolean;
  qr_enabled: boolean;
  qr_iban?: string;
  qr_bank_code?: string;
  qr_recipient_name?: string;
  qr_default_message?: string;
  qr_variable_symbol_prefix?: string;
  qr_enabled_for_reservations: boolean;
  qr_enabled_for_bar: boolean;
  qr_enabled_for_wallet: boolean;
}

class PaymentSettingsService {
  private cachedSettings: PaymentSettings | null = null;

  async getSettings(): Promise<PaymentSettings> {
    if (!this.cachedSettings) {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading payment settings:', error);
        throw new Error(`Chyba při načítání nastavení plateb: ${error.message}`);
      }

      this.cachedSettings = data;
    }

    return this.cachedSettings;
  }

  async updateSettings(settings: Partial<PaymentSettings>): Promise<PaymentSettings> {
    const { data, error } = await supabase
      .from('payment_settings')
      .update(settings)
      .select()
      .single();

    if (error) {
      throw new Error(`Chyba při ukládání nastavení plateb: ${error.message}`);
    }

    // Clear cache to force reload
    this.cachedSettings = null;
    return data;
  }

  async validateQRSettings(): Promise<{ isValid: boolean; errors: string[] }> {
    const settings = await this.getSettings();
    const errors: string[] = [];

    if (settings.qr_enabled) {
      if (!settings.qr_iban || settings.qr_iban.trim() === '') {
        errors.push('IBAN je povinný pro QR platby');
      }

      if (!settings.qr_recipient_name || settings.qr_recipient_name.trim() === '') {
        errors.push('Jméno příjemce je povinné pro QR platby');
      }

      // Basic IBAN validation for Czech format
      if (settings.qr_iban && !this.isValidIBAN(settings.qr_iban)) {
        errors.push('IBAN má neplatný formát');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidIBAN(iban: string): boolean {
    // Basic IBAN validation - remove spaces and check format
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    
    // Czech IBAN should be 24 characters long and start with CZ
    if (cleanIban.length !== 24 || !cleanIban.startsWith('CZ')) {
      return false;
    }

    // Basic character validation (should contain only letters and numbers)
    return /^[A-Z0-9]+$/.test(cleanIban);
  }

  async getAvailablePaymentMethods(): Promise<{ cash: boolean; qr: boolean }> {
    const settings = await this.getSettings();
    
    return {
      cash: settings.cash_enabled,
      qr: settings.qr_enabled
    };
  }

  async isQREnabledForType(type: 'reservations' | 'bar' | 'wallet'): Promise<boolean> {
    const settings = await this.getSettings();
    
    if (!settings.qr_enabled) return false;

    switch (type) {
      case 'reservations':
        return settings.qr_enabled_for_reservations;
      case 'bar':
        return settings.qr_enabled_for_bar;
      case 'wallet':
        return settings.qr_enabled_for_wallet;
      default:
        return false;
    }
  }

  // Clear cache when settings are updated externally
  clearCache(): void {
    this.cachedSettings = null;
  }
}

export const paymentSettingsService = new PaymentSettingsService();