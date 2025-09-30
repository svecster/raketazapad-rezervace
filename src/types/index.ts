// Main types for the tennis facility MVP

export interface UserProfile {
  user_id: string;
  app_role: string;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  status: 'available' | 'unavailable';
  seasonal_price_rules?: any;
}

export interface Reservation {
  id: string;
  user_id?: string;
  guest_token?: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: 'booked' | 'paid' | 'cancelled';
  guest_contact?: any;
  price: number;
  payment_method?: string;
  payment_confirmed_at?: string;
  payment_confirmed_by?: string;
  created_at: string;
}

export interface PriceRule {
  id: string;
  court_type: string;
  season: string;
  time_period: string;
  member_price: number;
  non_member_price: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku?: string;
  price_czk: number;
  vat: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarTab {
  id: number;
  reservation_id: string;
  status: 'open' | 'closed';
  opened_by?: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  created_at: string;
}

export interface BarItem {
  id: number;
  tab_id: number;
  product_id: number;
  qty: number;
  unit_price_czk: number;
  total_czk: number;
  created_at: string;
}

export interface CashRegister {
  id: number;
  opened_by?: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  opening_balance_czk: number;
  closing_balance_czk?: number;
  notes?: string;
}

export interface Payment {
  id: number;
  reservation_id?: string;
  tab_id?: number;
  method: 'cash' | 'card' | 'bank';
  amount_czk: number;
  created_at: string;
  created_by?: string;
  notes?: string;
}

export interface Shift {
  id: number;
  staff_id?: string;
  start_time: string;
  end_time: string;
  status: 'planned' | 'checked_in' | 'checked_out' | 'missed';
  created_at: string;
  updated_at: string;
}