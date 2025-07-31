-- =============================================
-- Fix admin access to view non-admin users
-- =============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can view user profiles" ON public.profiles;

-- Create new policy that allows admins to view non-admin user profiles
CREATE POLICY "Admins can view non-admin user profiles"
ON public.profiles
FOR SELECT
USING (
  -- Allow users to see their own profile
  auth.uid() = id
  OR
  -- Allow admins to see non-admin users
  (auth.jwt() ->> 'role' = 'admin' AND is_admin = false)
);