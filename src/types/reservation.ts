// Core types for the Reservanto-style reservation system

export interface Slot {
  courtId: string;
  startsAt: string; // ISO string
  endsAt: string; // ISO string  
  price: number;
  isBusy: boolean;
  date: string; // YYYY-MM-DD format
}

export interface Block {
  courtId: string;
  courtName: string;
  date: string; // YYYY-MM-DD format
  start: string; // HH:MM format
  end: string; // HH:MM format
  slots: Slot[];
  totalPrice: number;
}

export interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  status: 'available' | 'unavailable';
  seasonal_price_rules: Record<string, any>;
}

export interface Reservation {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}