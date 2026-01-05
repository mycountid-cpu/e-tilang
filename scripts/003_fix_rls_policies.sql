-- Fix infinite recursion in RLS policies
-- Run this script to fix the RLS policy issues

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Petugas can view all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Petugas can view all vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Petugas can view all tickets" ON tickets;
DROP POLICY IF EXISTS "Petugas can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Petugas can update tickets" ON tickets;

DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert own payments" ON payments;
DROP POLICY IF EXISTS "Petugas can view all payments" ON payments;
DROP POLICY IF EXISTS "Petugas can update payments" ON payments;

-- Recreate simple, non-recursive policies for profiles
-- Using auth.uid() directly without subqueries to other tables
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Petugas can view all profiles - check role from auth.jwt() not from profiles table
CREATE POLICY "profiles_select_petugas" ON profiles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Recreate simple policies for vehicles
CREATE POLICY "vehicles_select_own" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vehicles_insert_own" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vehicles_update_own" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vehicles_delete_own" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- Petugas can view all vehicles
CREATE POLICY "vehicles_select_petugas" ON vehicles
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Recreate simple policies for tickets
CREATE POLICY "tickets_select_own" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Petugas full access to tickets
CREATE POLICY "tickets_select_petugas" ON tickets
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

CREATE POLICY "tickets_insert_petugas" ON tickets
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

CREATE POLICY "tickets_update_petugas" ON tickets
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

-- Recreate simple policies for payments
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Petugas full access to payments
CREATE POLICY "payments_select_petugas" ON payments
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );

CREATE POLICY "payments_update_petugas" ON payments
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );
