-- Create enums for payment system
CREATE TYPE public.transaction_type AS ENUM ('cash_in', 'cash_out', 'qr_in', 'sale_cash', 'refund_cash', 'shift_payout');
CREATE TYPE public.shift_status AS ENUM ('open', 'closed');

-- Create cash_ledger table for all monetary transactions
CREATE TABLE public.cash_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_type public.transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT, -- 'reservation', 'bar_order', 'shift_payout', etc.
  reference_id UUID,
  user_id UUID REFERENCES public.users(id),
  shift_id UUID,
  notes TEXT,
  receipt_number TEXT
);

-- Create shifts table for managing work shifts and cash register sessions
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  status public.shift_status NOT NULL DEFAULT 'open',
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  staff_user_id UUID REFERENCES public.users(id),
  notes TEXT
);

-- Create payment_settings table for QR payment configuration
CREATE TABLE public.payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cash_enabled BOOLEAN NOT NULL DEFAULT true,
  qr_enabled BOOLEAN NOT NULL DEFAULT true,
  qr_iban TEXT,
  qr_bank_code TEXT,
  qr_recipient_name TEXT DEFAULT 'Tenisový klub Raketa',
  qr_default_message TEXT DEFAULT 'Tenisový klub - platba',
  qr_variable_symbol_prefix TEXT DEFAULT 'TK',
  qr_enabled_for_reservations BOOLEAN NOT NULL DEFAULT true,
  qr_enabled_for_bar BOOLEAN NOT NULL DEFAULT false,
  qr_enabled_for_wallet BOOLEAN NOT NULL DEFAULT true
);

-- Insert default payment settings
INSERT INTO public.payment_settings (
  cash_enabled, qr_enabled, qr_recipient_name, qr_default_message, qr_variable_symbol_prefix
) VALUES (
  true, true, 'Tenisový klub Raketa', 'Tenisový klub - platba', 'TK'
);

-- Add payment_method to reservations
ALTER TABLE public.reservations ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE public.reservations ADD COLUMN payment_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.reservations ADD COLUMN payment_confirmed_by UUID REFERENCES public.users(id);

-- Add payment_method to bar_orders
ALTER TABLE public.bar_orders ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE public.bar_orders ADD COLUMN payment_confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.bar_orders ADD COLUMN payment_confirmed_by UUID REFERENCES public.users(id);

-- Create indexes for better performance
CREATE INDEX idx_cash_ledger_created_at ON public.cash_ledger(created_at);
CREATE INDEX idx_cash_ledger_transaction_type ON public.cash_ledger(transaction_type);
CREATE INDEX idx_cash_ledger_reference ON public.cash_ledger(reference_type, reference_id);
CREATE INDEX idx_shifts_created_at ON public.shifts(created_at);
CREATE INDEX idx_shifts_status ON public.shifts(status);

-- Enable RLS
ALTER TABLE public.cash_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for cash_ledger
CREATE POLICY "Staff can manage cash ledger" ON public.cash_ledger
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- RLS policies for shifts
CREATE POLICY "Staff can manage shifts" ON public.shifts
  FOR ALL USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- RLS policies for payment_settings
CREATE POLICY "Staff can read payment settings" ON public.payment_settings
  FOR SELECT USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owners can manage payment settings" ON public.payment_settings
  FOR ALL USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- Create trigger for updated_at on payment_settings
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_update_column();