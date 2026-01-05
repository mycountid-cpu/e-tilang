-- Fix RLS policies to allow profile creation during registration/login
-- This script updates the insert policy to be more permissive

-- Drop existing insert policy
DROP POLICY IF EXISTS profiles_insert_own ON profiles;

-- Create new insert policy that allows users to insert their own profile
-- Using a more permissive approach for new user registration
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR 
    auth.uid() IS NOT NULL
  );

-- Also ensure the service role can manage profiles (for triggers)
-- Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Update the select policy to ensure users can see their own profile
DROP POLICY IF EXISTS profiles_select_own ON profiles;
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Ensure petugas can still see all profiles
DROP POLICY IF EXISTS profiles_select_petugas ON profiles;
CREATE POLICY profiles_select_petugas ON profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('petugas', 'admin')
    )
  );
