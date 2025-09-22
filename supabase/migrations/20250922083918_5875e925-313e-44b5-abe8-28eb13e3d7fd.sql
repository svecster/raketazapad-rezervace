-- Add stricter RLS policies for bookings
-- Members cannot delete their own bookings (only staff+)
CREATE POLICY "bookings_member_no_delete" ON public.bookings
  FOR DELETE USING (user_id = auth.uid() AND false); -- Members explicitly cannot delete

-- Staff and above can delete any booking
CREATE POLICY "bookings_staff_delete" ON public.bookings
  FOR DELETE USING (public.app_role() IN ('staff','coach','admin','owner'));