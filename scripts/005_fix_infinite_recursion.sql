-- Fix infinite recursion in RLS policies
-- The problem: policies on profiles table query profiles table, causing infinite loop
-- Solution: Use auth.jwt() to get user role from JWT claims instead of querying profiles

-- First, drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_select_petugas ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- Create simple, non-recursive policies for profiles table
-- Users can always see their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Petugas can see all profiles - use JWT claim to avoid recursion
-- We check the role from user metadata in the JWT token
CREATE POLICY "profiles_select_petugas" ON profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Anyone authenticated can insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Also fix other tables that reference profiles for role check
-- Fix vehicles policies
DROP POLICY IF EXISTS vehicles_select_own ON vehicles;
CREATE POLICY "vehicles_select_own" ON vehicles
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Fix violations policies  
DROP POLICY IF EXISTS violations_manage_petugas ON violations;
CREATE POLICY "violations_manage_petugas" ON violations
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Fix tickets policies
DROP POLICY IF EXISTS tickets_select_own ON tickets;
CREATE POLICY "tickets_select_own" ON tickets
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    petugas_id = auth.uid() OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

DROP POLICY IF EXISTS tickets_insert_petugas ON tickets;
CREATE POLICY "tickets_insert_petugas" ON tickets
  FOR INSERT
  WITH CHECK (
    petugas_id = auth.uid() AND
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

DROP POLICY IF EXISTS tickets_update_petugas ON tickets;
CREATE POLICY "tickets_update_petugas" ON tickets
  FOR UPDATE
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON violations TO authenticated;
GRANT ALL ON tickets TO authenticated;
