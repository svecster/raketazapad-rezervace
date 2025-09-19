-- Add guest support to reservations table
ALTER TABLE public.reservations 
ADD COLUMN guest_token uuid,
ADD COLUMN guest_contact jsonb DEFAULT '{}'::jsonb;

-- Create index for guest token lookups
CREATE INDEX idx_reservations_guest_token ON public.reservations(guest_token) WHERE guest_token IS NOT NULL;

-- Update RLS policies for guest access
-- Guest reservations can be accessed via token (handled in application layer)
-- Staff and owners can see all reservations including guest ones
CREATE POLICY "Staff can view guest reservations" 
ON public.reservations 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- Allow guest reservations to be created without authentication
CREATE POLICY "Allow guest reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (guest_token IS NOT NULL OR auth.uid() = user_id);

-- Allow guest reservations to be updated via token validation (application layer)
CREATE POLICY "Allow guest reservation updates" 
ON public.reservations 
FOR UPDATE 
USING (
  (auth.uid() = user_id) OR 
  (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])) OR
  (guest_token IS NOT NULL AND user_id IS NULL)
);

-- Create function to generate secure guest tokens
CREATE OR REPLACE FUNCTION public.generate_guest_token()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gen_random_uuid();
$$;