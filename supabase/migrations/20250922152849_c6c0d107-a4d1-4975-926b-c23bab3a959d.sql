-- Backfill user_profiles for any users that might be missing
INSERT INTO public.user_profiles (user_id, full_name, phone, app_role)
SELECT 
  u.id, 
  COALESCE(u.raw_user_meta_data->>'full_name', u.email), 
  u.raw_user_meta_data->>'phone', 
  COALESCE(u.raw_user_meta_data->>'app_role', 'member')
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Ensure proper RLS policies for user_profiles
DROP POLICY IF EXISTS "user_profiles_read" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_self" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_admin" ON public.user_profiles;

-- Admin/Owner can read all profiles, users can read their own
CREATE POLICY "user_profiles_read" ON public.user_profiles
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) IN ('admin', 'owner')
);

-- Users can update their own profile
CREATE POLICY "user_profiles_update_self" ON public.user_profiles
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Admin/Owner can update any profile
CREATE POLICY "user_profiles_update_admin" ON public.user_profiles
FOR UPDATE 
USING (public.get_user_role(auth.uid()) IN ('admin', 'owner')) 
WITH CHECK (true);

-- Create a view for extended user information with email from auth.users
CREATE OR REPLACE VIEW public.v_users_extended AS
SELECT
  up.user_id,
  up.full_name,
  au.email,
  up.phone,
  up.app_role,
  up.created_at,
  up.updated_at
FROM public.user_profiles up
LEFT JOIN auth.users au ON au.id = up.user_id;

-- Enable RLS on the view (it will inherit from user_profiles)
ALTER VIEW public.v_users_extended OWNER TO postgres;
GRANT SELECT ON public.v_users_extended TO authenticated;
GRANT SELECT ON public.v_users_extended TO service_role;