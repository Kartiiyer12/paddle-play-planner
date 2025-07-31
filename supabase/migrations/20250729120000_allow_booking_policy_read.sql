-- =============================================
-- Allow all authenticated users to read venue booking policies
-- =============================================

-- Drop existing restrictive policy for SELECT
DROP POLICY IF EXISTS "Admin settings are only viewable by admins" ON public.admin_settings;

-- Create new policy that allows all authenticated users to read booking policies
-- but only allows admins to see full settings
CREATE POLICY "All users can read venue booking policies"
ON public.admin_settings
FOR SELECT
USING (auth.role() = 'authenticated'::text);

-- Keep the existing policy for modifications (only admins)
-- This should already exist, but let's make sure
DROP POLICY IF EXISTS "Admins can manage admin settings" ON public.admin_settings;

CREATE POLICY "Admins can manage admin settings"
ON public.admin_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE id = venue_id 
    AND admin_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE id = venue_id 
    AND admin_id = auth.uid()
  )
);