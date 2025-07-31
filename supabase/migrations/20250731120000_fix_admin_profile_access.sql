-- =============================================
-- Fix admin access to user profiles
-- =============================================

-- Drop the existing policy that requires venue ownership
DROP POLICY IF EXISTS "Venue owners can view user profiles" ON public.profiles;

-- Create new policy that allows any admin to view user profiles
CREATE POLICY "Admins can view user profiles"
ON public.profiles
FOR SELECT
USING (
  auth.jwt() ->> 'role' = 'admin'
);