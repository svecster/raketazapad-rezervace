/**
 * Checkout Service
 * Manages checkout operations, accounts, items and payments
 */

import { supabase } from "@/integrations/supabase/client";
import { cashRegisterService } from "./cashRegisterService";
import { qrPaymentService } from "./qrPaymentService";
import { formatCurrency } from "@/lib/utils/currency";

export interface CheckoutPlayer {
  id: string;
  name: string;
  isGuest?: boolean;
  contact?: string;
}

export interface CheckoutItem {
  id?: string;
  type: 'court' | 'bar' | 'equipment' | 'surcharge' | 'discount';
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  plu_code?: string;
  discount_type?: 'amount' | 'percentage' | 'code';
  discount_value?: number;
  discount_code?: string;
  assigned_to_players?: string[];
}

export interface CheckoutAccount {
  id?: string;
  name: string;
  total_amount: number;
  paid_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  assigned_players: CheckoutPlayer[];
  split_type: 'equal' | 'percentage' | 'amounts' | 'items';
  split_config: any;
  payment_methods: any[];
}

export interface Checkout {
  id?: string;
  status: 'open' | 'partial' | 'completed' | 'cancelled';
  reservation_id?: string;
  total_amount: number;
  notes?: string;
  include_court_price: boolean;
  additional_reservations: string[];
  accounts: CheckoutAccount[];
  items: CheckoutItem[];
  players: CheckoutPlayer[];
}

export interface CheckoutPayment {
  id?: string;
  checkout_account_id: string;
  payment_method: 'cash' | 'qr';
  amount: number;
  cash_received?: number;
  cash_change?: number;
  qr_code_data?: string;
  qr_payment_string?: string;
  qr_variable_symbol?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  notes?: string;
}

export interface CourtPricing {
  base_price: number;
  peak_hour_multiplier?: number;
  peak_hours?: { start: string; end: string }[];
}

class CheckoutService {
  // Create new checkout from reservation
  async createCheckoutFromReservation(reservationId: string): Promise<Checkout> {
    // Get reservation details
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select(`
        *,
        courts!inner(name, type)
      `)
      .eq('id', reservationId)
      .single();

    if (resError) throw new Error(`Chyba při načítání rezervace: ${resError.message}`);

    // Get user details if not guest
    let userName = 'Host';
    if (reservation.user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('id', reservation.user_id)
        .single();
      userName = user?.name || 'Uživatel';
    } else if (reservation.guest_contact) {
      const guestContact = reservation.guest_contact as any;
      userName = guestContact.name || 'Host';
    }

    // Get players from reservation (for now, just the user)
    const players: CheckoutPlayer[] = [
      {
        id: reservation.user_id || 'guest',
        name: userName,
        isGuest: !reservation.user_id
      }
    ];

    // Create checkout
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .insert({
        reservation_id: reservationId,
        status: 'open',
        include_court_price: true,
        total_amount: 0
      })
      .select()
      .single();

    if (checkoutError) throw new Error(`Chyba při vytváření checkout: ${checkoutError.message}`);

    // Create default account
    const defaultAccount: CheckoutAccount = {
      name: 'Společný účet',
      total_amount: 0,
      paid_amount: 0,
      payment_status: 'unpaid',
      assigned_players: players,
      split_type: 'equal',
      split_config: {},
      payment_methods: []
    };

    const { data: account, error: accountError } = await supabase
      .from('checkout_accounts')
      .insert({
        checkout_id: checkout.id,
        ...defaultAccount,
        assigned_players: JSON.stringify(players)
      })
      .select()
      .single();

    if (accountError) throw new Error(`Chyba při vytváření účtu: ${accountError.message}`);

    // Add court item if enabled
    if (checkout.include_court_price) {
      const courtPrice = this.calculateCourtPrice(reservation);
      const courtData = reservation.courts as any;
      await this.addItem(checkout.id, {
        type: 'court',
        name: `Kurt ${courtData.name}`,
        description: `${new Date(reservation.start_time).toLocaleDateString('cs-CZ')} ${new Date(reservation.start_time).toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'})} - ${new Date(reservation.end_time).toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'})}`,
        quantity: 1,
        unit_price: courtPrice,
        total_price: courtPrice
      }, account.id);
    }

    return {
      ...checkout,
      status: checkout.status as 'open' | 'partial' | 'completed' | 'cancelled',
      additional_reservations: JSON.parse((checkout.additional_reservations as string) || '[]'),
      accounts: [{ ...defaultAccount, id: account.id }],
      items: [],
      players
    };
  }

  // Create empty checkout for manual setup
  async createEmptyCheckout(): Promise<Checkout> {
    const { data: checkout, error } = await supabase
      .from('checkouts')
      .insert({
        status: 'open',
        include_court_price: false,
        total_amount: 0
      })
      .select()
      .single();

    if (error) throw new Error(`Chyba při vytváření checkout: ${error.message}`);

    // Create default account
    const { data: account, error: accountError } = await supabase
      .from('checkout_accounts')
      .insert({
        checkout_id: checkout.id,
        name: 'Společný účet',
        total_amount: 0,
        paid_amount: 0,
        payment_status: 'unpaid',
        assigned_players: JSON.stringify([]),
        split_type: 'equal',
        split_config: JSON.stringify({}),
        payment_methods: JSON.stringify([])
      })
      .select()
      .single();

    if (accountError) throw new Error(`Chyba při vytváření účtu: ${accountError.message}`);

    return {
      ...checkout,
      status: checkout.status as 'open' | 'partial' | 'completed' | 'cancelled',
      additional_reservations: JSON.parse((checkout.additional_reservations as string) || '[]'),
      accounts: [{
        id: account.id,
        name: 'Společný účet',
        total_amount: 0,
        paid_amount: 0,
        payment_status: 'unpaid' as 'unpaid' | 'partial' | 'paid',
        assigned_players: [],
        split_type: 'equal' as 'equal' | 'percentage' | 'amounts' | 'items',
        split_config: {},
        payment_methods: []
      }],
      items: [],
      players: []
    };
  }

  // Get checkout with all related data
  async getCheckout(checkoutId: string): Promise<Checkout> {
    const { data: checkout, error: checkoutError } = await supabase
      .from('checkouts')
      .select('*')
      .eq('id', checkoutId)
      .single();

    if (checkoutError) throw new Error(`Checkout nenalezen: ${checkoutError.message}`);

    const { data: accounts, error: accountsError } = await supabase
      .from('checkout_accounts')
      .select('*')
      .eq('checkout_id', checkoutId);

    if (accountsError) throw new Error(`Chyba při načítání účtů: ${accountsError.message}`);

    const { data: items, error: itemsError } = await supabase
      .from('checkout_items')
      .select('*')
      .eq('checkout_id', checkoutId);

    if (itemsError) throw new Error(`Chyba při načítání položek: ${itemsError.message}`);

    // Parse players from accounts
    const allPlayers = new Map<string, CheckoutPlayer>();
    accounts.forEach(account => {
      const players = JSON.parse((account.assigned_players as string) || '[]');
      players.forEach((player: CheckoutPlayer) => {
        allPlayers.set(player.id, player);
      });
    });

    return {
      ...checkout,
      status: checkout.status as 'open' | 'partial' | 'completed' | 'cancelled',
      additional_reservations: JSON.parse((checkout.additional_reservations as string) || '[]'),
      accounts: accounts.map(account => ({
        ...account,
        payment_status: account.payment_status as 'unpaid' | 'partial' | 'paid',
        split_type: account.split_type as 'equal' | 'percentage' | 'amounts' | 'items',
        assigned_players: JSON.parse((account.assigned_players as string) || '[]'),
        split_config: JSON.parse((account.split_config as string) || '{}'),
        payment_methods: JSON.parse((account.payment_methods as string) || '[]')
      })),
      items: items.map(item => ({
        ...item,
        type: item.type as 'court' | 'bar' | 'equipment' | 'surcharge' | 'discount',
        discount_type: item.discount_type as 'amount' | 'percentage' | 'code' | undefined,
        assigned_to_players: JSON.parse((item.assigned_to_players as string) || '[]')
      })),
      players: Array.from(allPlayers.values())
    };
  }

  // Add item to checkout
  async addItem(checkoutId: string, item: CheckoutItem, accountId?: string): Promise<CheckoutItem> {
    const itemData = {
      checkout_id: checkoutId,
      checkout_account_id: accountId,
      ...item,
      assigned_to_players: JSON.stringify(item.assigned_to_players || [])
    };

    const { data, error } = await supabase
      .from('checkout_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(`Chyba při přidávání položky: ${error.message}`);

    await this.recalculateCheckout(checkoutId);
    return { 
      ...data,
      type: data.type as 'court' | 'bar' | 'equipment' | 'surcharge' | 'discount',
      discount_type: data.discount_type as 'amount' | 'percentage' | 'code' | undefined,
      assigned_to_players: JSON.parse((data.assigned_to_players as string) || '[]') 
    };
  }

  // Create new account
  async createAccount(checkoutId: string, name: string, players: CheckoutPlayer[]): Promise<CheckoutAccount> {
    const accountData = {
      checkout_id: checkoutId,
      name,
      total_amount: 0,
      paid_amount: 0,
      payment_status: 'unpaid',
      assigned_players: JSON.stringify(players),
      split_type: 'equal',
      split_config: JSON.stringify({}),
      payment_methods: JSON.stringify([])
    };

    const { data, error } = await supabase
      .from('checkout_accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) throw new Error(`Chyba při vytváření účtu: ${error.message}`);

    return {
      ...data,
      payment_status: data.payment_status as 'unpaid' | 'partial' | 'paid',
      split_type: data.split_type as 'equal' | 'percentage' | 'amounts' | 'items',
      assigned_players: players,
      split_config: {},
      payment_methods: []
    };
  }

  // Move item to different account
  async moveItemToAccount(itemId: string, accountId: string | null): Promise<void> {
    const { error } = await supabase
      .from('checkout_items')
      .update({ checkout_account_id: accountId })
      .eq('id', itemId);

    if (error) throw new Error(`Chyba při přesunu položky: ${error.message}`);
  }

  // Update account split configuration
  async updateAccountSplit(accountId: string, splitType: string, splitConfig: any): Promise<void> {
    const { error } = await supabase
      .from('checkout_accounts')
      .update({
        split_type: splitType,
        split_config: JSON.stringify(splitConfig)
      })
      .eq('id', accountId);

    if (error) throw new Error(`Chyba při aktualizaci rozdělení: ${error.message}`);
  }

  // Process cash payment
  async processCashPayment(accountId: string, amount: number, cashReceived: number): Promise<CheckoutPayment> {
    const cashChange = cashReceived - amount;
    
    const paymentData = {
      checkout_account_id: accountId,
      payment_method: 'cash',
      amount,
      cash_received: cashReceived,
      cash_change: cashChange,
      confirmed_at: new Date().toISOString()
    };

    const { data: payment, error } = await supabase
      .from('checkout_payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw new Error(`Chyba při zpracování platby: ${error.message}`);

    // Record in cash ledger
    await cashRegisterService.recordSale(
      amount, 
      `Checkout platba - účet ${accountId.slice(-8)}`,
      'checkout_account',
      accountId
    );

    // Update account paid amount
    await this.updateAccountPaidAmount(accountId, amount);

    return {
      ...payment,
      payment_method: payment.payment_method as 'cash' | 'qr'
    };
  }

  // Generate QR payment
  async generateQRPayment(accountId: string, amount: number): Promise<{ qrCode: string; paymentString: string }> {
    const qrResult = await qrPaymentService.generateQRCode({
      amount,
      currency: 'CZK',
      message: `Tenisový klub - Checkout ${accountId.slice(-8)}`,
      variableSymbol: `CK${accountId.slice(-8).replace('-', '')}`
    });

    const paymentData = {
      checkout_account_id: accountId,
      payment_method: 'qr',
      amount,
      qr_code_data: qrResult.qrCode,
      qr_payment_string: qrResult.paymentString,
      qr_variable_symbol: `CK${accountId.slice(-8).replace('-', '')}`
    };

    const { error } = await supabase
      .from('checkout_payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) throw new Error(`Chyba při vytváření QR platby: ${error.message}`);

    return qrResult;
  }

  // Confirm QR payment
  async confirmQRPayment(paymentId: string): Promise<void> {
    const { data: payment, error: paymentError } = await supabase
      .from('checkout_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError) throw new Error(`Platba nenalezena: ${paymentError.message}`);

    // Update payment as confirmed
    const { error: updateError } = await supabase
      .from('checkout_payments')
      .update({ confirmed_at: new Date().toISOString() })
      .eq('id', paymentId);

    if (updateError) throw new Error(`Chyba při potvrzování platby: ${updateError.message}`);

    // Record in cash ledger
    await cashRegisterService.recordQRPayment(
      payment.amount,
      `QR platba - Checkout ${payment.checkout_account_id.slice(-8)}`,
      'checkout_account',
      payment.checkout_account_id
    );

    // Update account paid amount
    await this.updateAccountPaidAmount(payment.checkout_account_id, payment.amount);
  }

  // Update account paid amount and status
  private async updateAccountPaidAmount(accountId: string, additionalAmount: number): Promise<void> {
    const { data: account, error: getError } = await supabase
      .from('checkout_accounts')
      .select('paid_amount, total_amount')
      .eq('id', accountId)
      .single();

    if (getError) throw new Error(`Účet nenalezen: ${getError.message}`);

    const newPaidAmount = account.paid_amount + additionalAmount;
    const paymentStatus = newPaidAmount >= account.total_amount ? 'paid' : 'partial';

    const { error: updateError } = await supabase
      .from('checkout_accounts')
      .update({
        paid_amount: newPaidAmount,
        payment_status: paymentStatus
      })
      .eq('id', accountId);

    if (updateError) throw new Error(`Chyba při aktualizaci účtu: ${updateError.message}`);
  }

  // Recalculate checkout totals
  private async recalculateCheckout(checkoutId: string): Promise<void> {
    // Use the database function we created
    const { error } = await supabase.rpc('calculate_checkout_totals', {
      checkout_uuid: checkoutId
    });

    if (error) {
      console.error('Error recalculating checkout:', error);
    }
  }

  // Calculate court price based on reservation
  private calculateCourtPrice(reservation: any): number {
    // Simplified pricing - you can extend this based on your pricing rules
    const duration = new Date(reservation.end_time).getTime() - new Date(reservation.start_time).getTime();
    const hours = duration / (1000 * 60 * 60);
    
    return reservation.price || (hours * 500); // Default 500 CZK per hour
  }

  // Get checkout summary for reporting
  async getCheckoutSummary(checkoutId: string): Promise<any> {
    const checkout = await this.getCheckout(checkoutId);
    
    return {
      total_amount: checkout.total_amount,
      accounts: checkout.accounts.length,
      items: checkout.items.length,
      players: checkout.players.length,
      payment_status: checkout.status,
      cash_payments: checkout.accounts.reduce((sum, acc) => 
        sum + acc.payment_methods.filter(pm => pm.method === 'cash').length, 0),
      qr_payments: checkout.accounts.reduce((sum, acc) => 
        sum + acc.payment_methods.filter(pm => pm.method === 'qr').length, 0)
    };
  }
}

export const checkoutService = new CheckoutService();