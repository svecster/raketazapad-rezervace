/**
 * Cash Register Service
 * Manages cash flow, shifts, and ledger entries
 */

import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils/currency";

export interface CashLedgerEntry {
  id: string;
  created_at: string;
  transaction_type: 'cash_in' | 'cash_out' | 'qr_in' | 'sale_cash' | 'refund_cash' | 'shift_payout';
  amount: number;
  description: string;
  reference_type?: string;
  reference_id?: string;
  user_id?: string;
  shift_id?: string;
  notes?: string;
  receipt_number?: string;
}

export interface Shift {
  id: string;
  created_at: string;
  closed_at?: string;
  status: 'open' | 'closed';
  opening_balance: number;
  closing_balance?: number;
  staff_user_id?: string;
  notes?: string;
}

export interface CashSummary {
  currentBalance: number;
  todayIncome: number;
  todayExpenses: number;
  openShift?: Shift;
}

class CashRegisterService {
  async getCurrentShift(): Promise<Shift | null> {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching current shift:', error);
      return null;
    }

    return data;
  }

  async openShift(openingBalance: number, notes?: string): Promise<Shift> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        opening_balance: openingBalance,
        staff_user_id: user.user?.id,
        notes,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Chyba při otevírání směny: ${error.message}`);
    }

    // Log the opening
    await this.addLedgerEntry({
      transaction_type: 'cash_in',
      amount: openingBalance,
      description: 'Otevření směny',
      shift_id: data.id,
      notes: `Počáteční stav pokladny: ${formatCurrency(openingBalance)}`
    });

    return data;
  }

  async closeShift(closingBalance: number, notes?: string): Promise<Shift> {
    const currentShift = await this.getCurrentShift();
    if (!currentShift) {
      throw new Error('Žádná otevřená směna');
    }

    const { data, error } = await supabase
      .from('shifts')
      .update({
        closed_at: new Date().toISOString(),
        closing_balance: closingBalance,
        status: 'closed',
        notes: notes || currentShift.notes
      })
      .eq('id', currentShift.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Chyba při uzavírání směny: ${error.message}`);
    }

    // Log the closing
    await this.addLedgerEntry({
      transaction_type: 'cash_out',
      amount: closingBalance,
      description: 'Uzavření směny',
      shift_id: data.id,
      notes: `Konečný stav pokladny: ${formatCurrency(closingBalance)}`
    });

    return data;
  }

  async addLedgerEntry(entry: Omit<CashLedgerEntry, 'id' | 'created_at' | 'user_id'>): Promise<CashLedgerEntry> {
    const { data: user } = await supabase.auth.getUser();
    const currentShift = await this.getCurrentShift();

    const { data, error } = await supabase
      .from('cash_ledger')
      .insert({
        ...entry,
        user_id: user.user?.id,
        shift_id: entry.shift_id || currentShift?.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Chyba při zápisu do pokladní knihy: ${error.message}`);
    }

    return data;
  }

  async recordSale(amount: number, description: string, referenceType?: string, referenceId?: string): Promise<void> {
    await this.addLedgerEntry({
      transaction_type: 'sale_cash',
      amount,
      description,
      reference_type: referenceType,
      reference_id: referenceId,
      notes: `Prodej hotově: ${formatCurrency(amount)}`
    });
  }

  async recordQRPayment(amount: number, description: string, referenceType?: string, referenceId?: string): Promise<void> {
    await this.addLedgerEntry({
      transaction_type: 'qr_in',
      amount,
      description,
      reference_type: referenceType,
      reference_id: referenceId,
      notes: `Platba QR kódem: ${formatCurrency(amount)}`
    });
  }

  async recordRefund(amount: number, description: string, reason: string, referenceType?: string, referenceId?: string): Promise<void> {
    await this.addLedgerEntry({
      transaction_type: 'refund_cash',
      amount,
      description,
      reference_type: referenceType,
      reference_id: referenceId,
      notes: `Vrácení hotově - Důvod: ${reason}`
    });
  }

  async recordShiftPayout(amount: number, employeeName: string, shiftId: string, receiptNumber?: string): Promise<void> {
    await this.addLedgerEntry({
      transaction_type: 'shift_payout',
      amount,
      description: `Výplata směny - ${employeeName}`,
      reference_type: 'shift',
      reference_id: shiftId,
      receipt_number: receiptNumber,
      notes: `Výplata zaměstnance z pokladny`
    });
  }

  async getCashSummary(): Promise<CashSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();

    const openShift = await this.getCurrentShift();

    // Get today's transactions
    const { data: todayTransactions, error } = await supabase
      .from('cash_ledger')
      .select('transaction_type, amount')
      .gte('created_at', todayISOString);

    if (error) {
      console.error('Error fetching cash summary:', error);
      return {
        currentBalance: 0,
        todayIncome: 0,
        todayExpenses: 0,
        openShift
      };
    }

    const todayIncome = todayTransactions
      .filter(t => ['cash_in', 'sale_cash', 'qr_in'].includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const todayExpenses = todayTransactions
      .filter(t => ['cash_out', 'refund_cash', 'shift_payout'].includes(t.transaction_type))
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentBalance = (openShift?.opening_balance || 0) + todayIncome - todayExpenses;

    return {
      currentBalance,
      todayIncome,
      todayExpenses,
      openShift
    };
  }

  async getLedgerEntries(limit = 50, offset = 0): Promise<CashLedgerEntry[]> {
    const { data, error } = await supabase
      .from('cash_ledger')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching ledger entries:', error);
      return [];
    }

    return data || [];
  }

  async generateReceiptNumber(): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
    return `PD${dateStr}${timeStr}`;
  }
}

export const cashRegisterService = new CashRegisterService();