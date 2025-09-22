-- Create user_profiles table as requested
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  app_role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN 
  NEW.updated_at = now(); 
  return NEW; 
END $$;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS t_user_profiles_upd ON public.user_profiles;
CREATE TRIGGER t_user_profiles_upd 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.touch_updated_at();

-- Create bookings table as requested
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  court_id int NOT NULL,
  begins_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text CHECK (status IN ('new','confirmed','cancelled')) DEFAULT 'new',
  price numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper function for app_role
CREATE OR REPLACE FUNCTION public.app_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'app_role')::text,
    'member'
  );
$$;

-- RLS Policies for user_profiles
CREATE POLICY "profiles_self_read" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.app_role() IN ('admin','owner'));

CREATE POLICY "profiles_self_update" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_admin_update" ON public.user_profiles
  FOR UPDATE USING (public.app_role() IN ('admin','owner')) WITH CHECK (true);

CREATE POLICY "profiles_insert" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "bookings_member_read" ON public.bookings
  FOR SELECT USING (user_id = auth.uid() OR public.app_role() IN ('staff','coach','admin','owner'));

CREATE POLICY "bookings_member_write" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.app_role() IN ('staff','coach','admin','owner'));

CREATE POLICY "bookings_member_update" ON public.bookings
  FOR UPDATE USING (user_id = auth.uid() OR public.app_role() IN ('staff','coach','admin','owner'));

-- Create trigger to auto-create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, phone, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'app_role', 'member')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_profile();