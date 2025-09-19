-- Create enums
CREATE TYPE user_role AS ENUM ('player', 'staff', 'owner');
CREATE TYPE court_type AS ENUM ('indoor', 'outdoor');
CREATE TYPE court_status AS ENUM ('available', 'unavailable');
CREATE TYPE reservation_status AS ENUM ('booked', 'paid', 'cancelled');
CREATE TYPE payment_status AS ENUM ('open', 'paid');

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'player',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create courts table
CREATE TABLE public.courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type court_type NOT NULL,
    seasonal_price_rules JSONB DEFAULT '{}',
    status court_status DEFAULT 'available'
);

-- Create reservations table
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    court_id UUID REFERENCES public.courts(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    status reservation_status DEFAULT 'booked',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bar_orders table
CREATE TABLE public.bar_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
    items JSONB DEFAULT '[]',
    total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status payment_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cash_register table
CREATE TABLE public.cash_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id TEXT,
    cash_in NUMERIC(10,2) DEFAULT 0,
    cash_out NUMERIC(10,2) DEFAULT 0,
    balance NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    unit_price NUMERIC(10,2) NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_register ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT role FROM public.users WHERE id = user_uuid;
$$;

-- RLS Policies for users table
CREATE POLICY "Users can read their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff can read all users" ON public.users
FOR SELECT USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

CREATE POLICY "Owner can manage all users" ON public.users
FOR ALL USING (public.get_user_role(auth.uid()) = 'owner');

-- RLS Policies for courts table
CREATE POLICY "Everyone can read courts" ON public.courts
FOR SELECT USING (true);

CREATE POLICY "Staff can manage courts" ON public.courts
FOR ALL USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- RLS Policies for reservations table
CREATE POLICY "Users can read their own reservations" ON public.reservations
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations" ON public.reservations
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations" ON public.reservations
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage all reservations" ON public.reservations
FOR ALL USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- RLS Policies for bar_orders table
CREATE POLICY "Users can read bar orders for their reservations" ON public.bar_orders
FOR SELECT USING (
    reservation_id IN (
        SELECT id FROM public.reservations WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Staff can manage all bar orders" ON public.bar_orders
FOR ALL USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- RLS Policies for cash_register table
CREATE POLICY "Staff can manage cash register" ON public.cash_register
FOR ALL USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- RLS Policies for inventory table
CREATE POLICY "Staff can read inventory" ON public.inventory
FOR SELECT USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

CREATE POLICY "Staff can manage inventory" ON public.inventory
FOR ALL USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- RLS Policies for audit_logs table
CREATE POLICY "Staff can read audit logs" ON public.audit_logs
FOR SELECT USING (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

CREATE POLICY "Staff can create audit logs" ON public.audit_logs
FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) IN ('staff', 'owner'));

-- Seed data for courts
INSERT INTO public.courts (name, type, seasonal_price_rules) VALUES
('Hala 1', 'indoor', '{"winter": 800, "summer": 600, "spring": 700, "autumn": 700}'),
('Hala 2', 'indoor', '{"winter": 800, "summer": 600, "spring": 700, "autumn": 700}'),
('Kurt 1', 'outdoor', '{"winter": 400, "summer": 500, "spring": 450, "autumn": 450}'),
('Kurt 2', 'outdoor', '{"winter": 400, "summer": 500, "spring": 450, "autumn": 450}'),
('Kurt 3', 'outdoor', '{"winter": 400, "summer": 500, "spring": 450, "autumn": 450}'),
('Kurt 4', 'outdoor', '{"winter": 400, "summer": 500, "spring": 450, "autumn": 450}');

-- Seed some inventory items
INSERT INTO public.inventory (item_name, stock, unit_price) VALUES
('Pivo 0.5l', 50, 45.00),
('Víno bílé 0.2l', 20, 80.00),
('Víno červené 0.2l', 20, 85.00),
('Kofola 0.5l', 30, 35.00),
('Voda 0.5l', 40, 25.00),
('Guláš s knedlíkem', 15, 180.00),
('Schnitzel s bramborami', 10, 220.00),
('Salát Caesar', 12, 150.00);

-- Create trigger function for automatic profiles creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        'player'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();