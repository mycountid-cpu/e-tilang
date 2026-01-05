-- Fix the trigger function to properly create profiles with SECURITY DEFINER
-- This ensures profiles are created even if RLS policies would normally block it

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nik, full_name, role, address, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nik', '0000000000000000'),
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'address', ''),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    nik = COALESCE(EXCLUDED.nik, profiles.nik),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    address = COALESCE(EXCLUDED.address, profiles.address),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();
  
  RETURN new;
END;
$$;

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also add a policy to allow service_role to insert profiles (bypass RLS)
-- This is already handled by SECURITY DEFINER but adding for clarity

-- Update the insert policy to be more permissive for new signups
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);
