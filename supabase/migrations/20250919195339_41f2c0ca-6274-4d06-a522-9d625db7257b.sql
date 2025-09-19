-- Create checkout tables for tennis club cash register system

-- Checkout main table
CREATE TABLE public.checkouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open',
  reservation_id UUID REFERENCES public.reservations(id),
  staff_user_id UUID REFERENCES public.users(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  -- Auto-include court price
  include_court_price BOOLEAN NOT NULL DEFAULT true,
  -- Multiple reservations support
  additional_reservations JSONB DEFAULT '[]'::jsonb
);

-- Checkout accounts (sub-accounts for splitting bills)
CREATE TABLE public.checkout_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id UUID NOT NULL REFERENCES public.checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'partial', 'paid'
  -- Players assigned to this account
  assigned_players JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Split configuration
  split_type TEXT NOT NULL DEFAULT 'equal', -- 'equal', 'percentage', 'amounts', 'items'
  split_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Payment methods used
  payment_methods JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Checkout items (court, bar, equipment rental, surcharges)
CREATE TABLE public.checkout_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id UUID NOT NULL REFERENCES public.checkouts(id) ON DELETE CASCADE,
  checkout_account_id UUID REFERENCES public.checkout_accounts(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'court', 'bar', 'equipment', 'surcharge', 'discount'
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- For bar items
  plu_code TEXT,
  -- For discounts
  discount_type TEXT, -- 'amount', 'percentage', 'code'
  discount_value NUMERIC,
  discount_code TEXT,
  -- Assigned to specific players within account
  assigned_to_players JSONB DEFAULT '[]'::jsonb
);

-- Checkout payments (track partial payments per account)
CREATE TABLE public.checkout_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_account_id UUID NOT NULL REFERENCES public.checkout_accounts(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL, -- 'cash', 'qr'
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_by UUID REFERENCES public.users(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  -- For cash payments
  cash_received NUMERIC,
  cash_change NUMERIC,
  -- For QR payments
  qr_code_data TEXT,
  qr_payment_string TEXT,
  qr_variable_symbol TEXT,
  -- Reference to cash ledger
  ledger_entry_id UUID REFERENCES public.cash_ledger(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Staff and owners can manage checkouts
CREATE POLICY "Staff can manage checkouts"
  ON public.checkouts
  FOR ALL
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can manage checkout accounts"
  ON public.checkout_accounts
  FOR ALL
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can manage checkout items"
  ON public.checkout_items
  FOR ALL
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can manage checkout payments"
  ON public.checkout_payments
  FOR ALL
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- Indexes for performance
CREATE INDEX idx_checkouts_reservation_id ON public.checkouts(reservation_id);
CREATE INDEX idx_checkouts_status ON public.checkouts(status);
CREATE INDEX idx_checkout_accounts_checkout_id ON public.checkout_accounts(checkout_id);
CREATE INDEX idx_checkout_items_checkout_id ON public.checkout_items(checkout_id);
CREATE INDEX idx_checkout_items_account_id ON public.checkout_items(checkout_account_id);
CREATE INDEX idx_checkout_payments_account_id ON public.checkout_payments(checkout_account_id);

-- Triggers for updated_at
CREATE TRIGGER update_checkouts_updated_at
  BEFORE UPDATE ON public.checkouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_update_column();

-- Functions for checkout calculations
CREATE OR REPLACE FUNCTION public.calculate_checkout_totals(checkout_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_amount NUMERIC := 0;
  account_record RECORD;
  account_total NUMERIC;
BEGIN
  -- Calculate total for each account
  FOR account_record IN 
    SELECT id FROM public.checkout_accounts WHERE checkout_id = checkout_uuid
  LOOP
    SELECT COALESCE(SUM(total_price), 0) INTO account_total
    FROM public.checkout_items 
    WHERE checkout_account_id = account_record.id;
    
    UPDATE public.checkout_accounts 
    SET total_amount = account_total
    WHERE id = account_record.id;
    
    total_amount := total_amount + account_total;
  END LOOP;
  
  -- Update checkout total
  UPDATE public.checkouts 
  SET total_amount = total_amount
  WHERE id = checkout_uuid;
END;
$$;