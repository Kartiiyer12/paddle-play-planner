-- =============================================
-- Add is_admin column to profiles table
-- =============================================

-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update existing profiles to set is_admin based on user metadata
-- This will be handled by the trigger for new users
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' = 'admin'
);

-- Update the trigger function to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new profile record with the user's information
  INSERT INTO public.profiles (id, name, email, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;