-- IMPORTANT: Run this script to completely reset all RLS policies
-- This fixes the "infinite recursion detected in policy" error

-- Step 1: Disable RLS temporarily
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets DISABLE ROW LEVEL SECURITY;
-- removed payments table reference as it does not exist

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    -- Drop all policies on profiles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
    
    -- Drop all policies on vehicles
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'vehicles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON vehicles', pol.policyname);
    END LOOP;
    
    -- Drop all policies on tickets
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'tickets'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON tickets', pol.policyname);
    END LOOP;
    
    -- removed payments loop
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
-- removed payments table re-enable

-- Step 4: Create simple, non-recursive policies

-- PROFILES: Simple self-access only (no cross-table queries)
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- VEHICLES: User can manage their own vehicles, petugas can view all
CREATE POLICY "vehicles_select" ON vehicles
    FOR SELECT USING (
        auth.uid() = user_id 
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
    );

CREATE POLICY "vehicles_insert_own" ON vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "vehicles_update_own" ON vehicles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "vehicles_delete_own" ON vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- TICKETS: User can view their own, petugas can manage all
CREATE POLICY "tickets_select" ON tickets
    FOR SELECT USING (
        auth.uid() = user_id 
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
    );

CREATE POLICY "tickets_insert_petugas" ON tickets
    FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas');

CREATE POLICY "tickets_update" ON tickets
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
    );

-- removed payments policies
