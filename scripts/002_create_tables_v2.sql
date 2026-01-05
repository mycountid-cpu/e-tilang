-- Run this script to create all required tables
-- This is a simplified version that handles existing tables gracefully

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik VARCHAR(16) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'petugas')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create violations master data table
CREATE TABLE IF NOT EXISTS public.violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  article VARCHAR(100) NOT NULL,
  max_fine DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  violation_id UUID NOT NULL REFERENCES public.violations(id) ON DELETE RESTRICT,
  petugas_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  location TEXT NOT NULL,
  evidence_photo_url TEXT,
  fine_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
  ticket_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_nik ON public.profiles(nik);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_petugas" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_petugas" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'petugas')
);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "vehicles_select_own" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_insert_own" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_update_own" ON public.vehicles;
DROP POLICY IF EXISTS "vehicles_delete_own" ON public.vehicles;

CREATE POLICY "vehicles_select_own" ON public.vehicles FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'petugas')
);
CREATE POLICY "vehicles_insert_own" ON public.vehicles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "vehicles_update_own" ON public.vehicles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "vehicles_delete_own" ON public.vehicles FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "violations_select_all" ON public.violations;
CREATE POLICY "violations_select_all" ON public.violations FOR SELECT USING (true);

DROP POLICY IF EXISTS "tickets_select_own" ON public.tickets;
DROP POLICY IF EXISTS "tickets_insert_petugas" ON public.tickets;
DROP POLICY IF EXISTS "tickets_update_petugas" ON public.tickets;

CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (
  user_id = auth.uid() OR petugas_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'petugas')
);
CREATE POLICY "tickets_insert_petugas" ON public.tickets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'petugas')
);
CREATE POLICY "tickets_update_petugas" ON public.tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'petugas')
);

-- Create trigger function for auto profile creation
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
