-- Add username column for staff/owner usernames
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Seed the owner account if it doesn't exist
DO $$
BEGIN
  -- First create the auth user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@club.local') THEN
    -- Note: This would normally be done through Supabase Auth API
    -- For now, we'll create the users table entry and assume the auth user will be created manually
    INSERT INTO public.users (id, name, email, username, role, created_at) 
    VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'Hlavní administrátor',
      'admin@club.local',
      'admin',
      'owner',
      now()
    );
  END IF;
END $$;