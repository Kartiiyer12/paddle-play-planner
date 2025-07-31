-- =============================================
-- Debug admin access - make policy more permissive temporarily
-- =============================================

-- Drop the existing policy
DROP POLICY IF EXISTS "Admins can view non-admin user profiles" ON public.profiles;

-- Create a more permissive policy for debugging
CREATE POLICY "Debug admin access to profiles"
ON public.profiles
FOR SELECT
USING (
  -- Allow users to see their own profile
  auth.uid() = id
  OR
  -- Allow any authenticated user with admin in metadata to see all profiles
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
);