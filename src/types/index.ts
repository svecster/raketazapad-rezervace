// Main types for the tennis facility MVP

export interface UserProfile {
  user_id: string;
  app_role: 'guest' | 'player' | 'trainer' | 'staff' | 'owner' | 'admin';
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'inside' | 'outside';
  status: 'available' | 'maintenance' | 'hidden';
  seasonal_price_rules: Record<string, number>;
}

export interface Reservation {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: 'new' | 'confirmed' | 'checked_in' | 'completed' | 'no_show' | 'canceled';
  created_by?: string;
  guest_contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  price_czk: number;
  note?: string;
  created_at: string;
}

export interface PriceRule {
  id: number;
  name: string;
  court_type: 'inside' | 'outside';
  day_of_week?: number; // 0-6, 0 = Sunday
  start_hour?: number;
  end_hour?: number;
  price_per_hour_czk: number;
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