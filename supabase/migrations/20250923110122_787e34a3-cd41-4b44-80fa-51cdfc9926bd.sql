-- Fix remaining security issues from linter

-- 1. Fix function search path issues by adding SET search_path to functions
-- Update the functions we just created to have proper search_path

DROP FUNCTION IF EXISTS public.log_sensitive_access() CASCADE;
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

DROP FUNCTION IF EXISTS public.prevent_role_escalation() CASCADE;
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Only allow role changes by staff/owners
  IF OLD.app_role != NEW.app_role AND 
     get_current_user_app_role() NOT IN ('staff', 'owner') THEN
    RAISE EXCEPTION 'Access denied: Only staff and owners can change user roles';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.log_role_changes() CASCADE;
CREATE OR REPLACE FUNCTION public.log_role_changes()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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
$$;

-- Recreate the triggers since we dropped the functions
CREATE TRIGGER audit_user_profiles_access
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_cash_ledger_access
  AFTER INSERT OR UPDATE OR DELETE ON public.cash_ledger
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER audit_sales_access
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER prevent_user_role_escalation
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation();

CREATE TRIGGER log_user_role_changes
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_changes();

-- 2. Check for any remaining views with SECURITY DEFINER and fix them
-- First let's see what views exist
-- (This will be checked in the next query)

-- 3. Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
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