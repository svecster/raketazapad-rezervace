-- Fix function search path security warnings

-- Fix search path for existing functions that lack proper security settings
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_last_update_column() SET search_path = public;