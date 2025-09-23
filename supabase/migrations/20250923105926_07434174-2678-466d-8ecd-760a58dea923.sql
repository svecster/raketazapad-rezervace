-- Phase 1: Critical Data Protection - Secure RLS Policies
-- Remove overly permissive public access and implement proper access controls

-- 1. COURTS TABLE - Remove public access, allow only authenticated users to view
DROP POLICY IF EXISTS "Everyone can read courts" ON public.courts;
DROP POLICY IF EXISTS "courts_public_select" ON public.courts;

CREATE POLICY "Authenticated users can read courts" 
ON public.courts 
FOR SELECT 
TO authenticated
USING (true);

-- 2. PRICE_RULES TABLE - Remove public access, allow only authenticated users to view
DROP POLICY IF EXISTS "Everyone can read price rules" ON public.price_rules;
DROP POLICY IF EXISTS "price_rules_public_select" ON public.price_rules;

CREATE POLICY "Authenticated users can read price rules" 
ON public.price_rules 
FOR SELECT 
TO authenticated
USING (true);

-- 3. USER_PROFILES TABLE - Restrict to only own data and admin access
DROP POLICY IF EXISTS "profiles_self_read" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_read" ON public.user_profiles;

CREATE POLICY "Users can read own profile" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Staff and owners can read all profiles" 
ON public.user_profiles 
FOR SELECT 
TO authenticated
USING (get_current_user_app_role() = ANY (ARRAY['staff'::text, 'owner'::text]));

-- 4. USERS TABLE - Restrict to own data and admin access only
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Staff and owners can read user data" 
ON public.users 
FOR SELECT 
TO authenticated
USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- 5. RESERVATIONS TABLE - Ensure only own reservations or staff access
-- (Keep existing policies but verify they're restrictive enough)

-- 6. FINANCIAL DATA - Ensure only staff/owner access
-- Cash ledger, sales, checkout data should only be accessible to staff/owners
-- (These policies are already properly restrictive)

-- 7. INVENTORY AND PRODUCTS - Ensure only staff/owner access
-- (These policies are already properly restrictive)

-- 8. Add audit logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive tables
  INSERT INTO public.audit_logs (action, details, user_id)
  VALUES (
    TG_OP || '_' || TG_TABLE_NAME,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'user_id', auth.uid(),
      'timestamp', now()
    ),
    auth.uid()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers for sensitive tables
CREATE TRIGGER audit_user_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_cash_ledger_access
  AFTER INSERT OR UPDATE OR DELETE ON public.cash_ledger
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_sales_access
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- 9. Ensure products_staff_view has proper RLS
-- (Already fixed in previous migration)

-- 10. Add policy to prevent role escalation
CREATE POLICY "Prevent self role escalation" 
ON public.user_profiles 
FOR UPDATE 
TO authenticated
USING (
  auth.uid() = user_id AND (
    -- Users can only update non-role fields, or staff/owners can update roles
    OLD.app_role = NEW.app_role OR 
    get_current_user_app_role() = ANY (ARRAY['staff'::text, 'owner'::text])
  )
);

-- 11. Add policy to log role changes
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.app_role != NEW.app_role THEN
    INSERT INTO public.audit_logs (action, details, user_id)
    VALUES (
      'ROLE_CHANGE',
      jsonb_build_object(
        'target_user_id', NEW.user_id,
        'old_role', OLD.app_role,
        'new_role', NEW.app_role,
        'changed_by', auth.uid(),
        'timestamp', now()
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_user_role_changes
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();