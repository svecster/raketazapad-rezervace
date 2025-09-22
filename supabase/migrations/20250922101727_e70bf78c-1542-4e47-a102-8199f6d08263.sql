-- Vytvoření tabulky price_rules pro cenové pravidla
CREATE TABLE IF NOT EXISTS public.price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_type TEXT NOT NULL CHECK (court_type IN ('indoor', 'outdoor')),
  season TEXT NOT NULL CHECK (season IN ('summer', 'winter')),
  time_period TEXT NOT NULL CHECK (time_period IN ('morning', 'afternoon', 'evening')),
  member_price NUMERIC NOT NULL DEFAULT 0,
  non_member_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_rules ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read price rules
CREATE POLICY "Everyone can read price rules" 
ON public.price_rules 
FOR SELECT 
USING (true);

-- Only owners can manage price rules
CREATE POLICY "Owners can manage price rules" 
ON public.price_rules 
FOR ALL 
USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- Insert default price rules
INSERT INTO public.price_rules (court_type, season, time_period, member_price, non_member_price) VALUES
('indoor', 'winter', 'morning', 400, 500),
('indoor', 'winter', 'afternoon', 450, 550),
('indoor', 'winter', 'evening', 500, 600),
('indoor', 'summer', 'morning', 350, 450),
('indoor', 'summer', 'afternoon', 400, 500),
('indoor', 'summer', 'evening', 450, 550),
('outdoor', 'winter', 'morning', 250, 350),
('outdoor', 'winter', 'afternoon', 300, 400),
('outdoor', 'winter', 'evening', 350, 450),
('outdoor', 'summer', 'morning', 200, 300),
('outdoor', 'summer', 'afternoon', 250, 350),
('outdoor', 'summer', 'evening', 300, 400);

-- Add updated_at trigger
CREATE TRIGGER update_price_rules_updated_at
    BEFORE UPDATE ON public.price_rules
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();