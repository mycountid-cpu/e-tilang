-- ==============================================
-- SKEMA BARU: Tabel Petugas dan Masyarakat Terpisah
-- ==============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- 1. TABEL PETUGAS
-- ==============================================
CREATE TABLE IF NOT EXISTS public.petugas (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_petugas VARCHAR(255) NOT NULL,
  nrp_nip VARCHAR(50) UNIQUE NOT NULL,
  satuan VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. TABEL MASYARAKAT
-- ==============================================
CREATE TABLE IF NOT EXISTS public.masyarakat (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama VARCHAR(255) NOT NULL,
  nik VARCHAR(20) UNIQUE NOT NULL,
  alamat TEXT,
  no_hp VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. TABEL KENDARAAN (milik masyarakat)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.kendaraan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  masyarakat_id UUID NOT NULL REFERENCES public.masyarakat(id) ON DELETE CASCADE,
  plat_nomor VARCHAR(20) UNIQUE NOT NULL,
  jenis_kendaraan VARCHAR(50) NOT NULL,
  merk VARCHAR(100) NOT NULL,
  warna VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 4. TABEL PELANGGARAN (master data)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.pelanggaran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_pelanggaran VARCHAR(255) NOT NULL,
  pasal VARCHAR(100) NOT NULL,
  denda_maksimal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 5. TABEL TILANG (relasi petugas <-> masyarakat)
-- ==============================================
CREATE TABLE IF NOT EXISTS public.tilang (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_tilang VARCHAR(50) UNIQUE NOT NULL,
  petugas_id UUID NOT NULL REFERENCES public.petugas(id) ON DELETE RESTRICT,
  masyarakat_id UUID NOT NULL REFERENCES public.masyarakat(id) ON DELETE CASCADE,
  kendaraan_id UUID REFERENCES public.kendaraan(id) ON DELETE SET NULL,
  pelanggaran_id UUID NOT NULL REFERENCES public.pelanggaran(id) ON DELETE RESTRICT,
  lokasi TEXT NOT NULL,
  foto_bukti_url TEXT,
  nominal_denda DECIMAL(12, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'menunggu_verifikasi', 'lunas')),
  tanggal_tilang TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tanggal_bayar TIMESTAMP WITH TIME ZONE,
  foto_bukti_bayar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES untuk performa
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_petugas_nrp_nip ON public.petugas(nrp_nip);
CREATE INDEX IF NOT EXISTS idx_masyarakat_nik ON public.masyarakat(nik);
CREATE INDEX IF NOT EXISTS idx_kendaraan_masyarakat_id ON public.kendaraan(masyarakat_id);
CREATE INDEX IF NOT EXISTS idx_kendaraan_plat_nomor ON public.kendaraan(plat_nomor);
CREATE INDEX IF NOT EXISTS idx_tilang_petugas_id ON public.tilang(petugas_id);
CREATE INDEX IF NOT EXISTS idx_tilang_masyarakat_id ON public.tilang(masyarakat_id);
CREATE INDEX IF NOT EXISTS idx_tilang_status ON public.tilang(status);
CREATE INDEX IF NOT EXISTS idx_tilang_kode_tilang ON public.tilang(kode_tilang);

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================
ALTER TABLE public.petugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masyarakat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tilang ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS POLICIES - PETUGAS
-- ==============================================
-- Petugas bisa lihat semua petugas dan bisa edit data sendiri
DROP POLICY IF EXISTS "petugas_select_all" ON public.petugas;
CREATE POLICY "petugas_select_all" ON public.petugas
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "petugas_insert_own" ON public.petugas;
CREATE POLICY "petugas_insert_own" ON public.petugas
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "petugas_update_own" ON public.petugas;
CREATE POLICY "petugas_update_own" ON public.petugas
  FOR UPDATE USING (auth.uid() = id);

-- ==============================================
-- RLS POLICIES - MASYARAKAT
-- ==============================================
-- Masyarakat bisa lihat data sendiri, petugas bisa lihat semua
DROP POLICY IF EXISTS "masyarakat_select_own_or_petugas" ON public.masyarakat;
CREATE POLICY "masyarakat_select_own_or_petugas" ON public.masyarakat
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "masyarakat_insert_own" ON public.masyarakat;
CREATE POLICY "masyarakat_insert_own" ON public.masyarakat
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "masyarakat_update_own" ON public.masyarakat;
CREATE POLICY "masyarakat_update_own" ON public.masyarakat
  FOR UPDATE USING (auth.uid() = id);

-- ==============================================
-- RLS POLICIES - KENDARAAN
-- ==============================================
-- Masyarakat kelola kendaraan sendiri, petugas bisa lihat semua
DROP POLICY IF EXISTS "kendaraan_select_own_or_petugas" ON public.kendaraan;
CREATE POLICY "kendaraan_select_own_or_petugas" ON public.kendaraan
  FOR SELECT USING (
    masyarakat_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "kendaraan_insert_own" ON public.kendaraan;
CREATE POLICY "kendaraan_insert_own" ON public.kendaraan
  FOR INSERT WITH CHECK (masyarakat_id = auth.uid());

DROP POLICY IF EXISTS "kendaraan_update_own" ON public.kendaraan;
CREATE POLICY "kendaraan_update_own" ON public.kendaraan
  FOR UPDATE USING (masyarakat_id = auth.uid());

DROP POLICY IF EXISTS "kendaraan_delete_own" ON public.kendaraan;
CREATE POLICY "kendaraan_delete_own" ON public.kendaraan
  FOR DELETE USING (masyarakat_id = auth.uid());

-- ==============================================
-- RLS POLICIES - PELANGGARAN
-- ==============================================
-- Semua orang bisa baca, hanya petugas bisa kelola
DROP POLICY IF EXISTS "pelanggaran_select_all" ON public.pelanggaran;
CREATE POLICY "pelanggaran_select_all" ON public.pelanggaran
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "pelanggaran_manage_petugas" ON public.pelanggaran;
CREATE POLICY "pelanggaran_manage_petugas" ON public.pelanggaran
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

-- ==============================================
-- RLS POLICIES - TILANG (PENTING!)
-- ==============================================
-- Masyarakat HANYA bisa lihat tilang miliknya
-- Petugas bisa lihat semua dan kelola tilang
DROP POLICY IF EXISTS "tilang_select_own_or_petugas" ON public.tilang;
CREATE POLICY "tilang_select_own_or_petugas" ON public.tilang
  FOR SELECT USING (
    masyarakat_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "tilang_insert_petugas" ON public.tilang;
CREATE POLICY "tilang_insert_petugas" ON public.tilang
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "tilang_update_petugas_or_own_payment" ON public.tilang;
CREATE POLICY "tilang_update_petugas_or_own_payment" ON public.tilang
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.petugas WHERE id = auth.uid()) OR
    (masyarakat_id = auth.uid() AND status = 'belum_bayar')
  );

-- ==============================================
-- TRIGGER FUNCTIONS untuk auto-create entries
-- ==============================================

-- Function untuk membuat entry petugas/masyarakat otomatis
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Ambil role dari raw_user_meta_data
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'masyarakat');
  
  IF user_role = 'petugas' THEN
    -- Buat entry di tabel petugas
    INSERT INTO public.petugas (id, nama_petugas, nrp_nip, satuan)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'nama_petugas', 'Petugas'),
      COALESCE(new.raw_user_meta_data->>'nrp_nip', 'NRP' || substring(new.id::text from 1 for 8)),
      COALESCE(new.raw_user_meta_data->>'satuan', 'Satlantas')
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Buat entry di tabel masyarakat
    INSERT INTO public.masyarakat (id, nama, nik, alamat, no_hp)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'full_name', 'User'),
      COALESCE(new.raw_user_meta_data->>'nik', '0000000000000000'),
      COALESCE(new.raw_user_meta_data->>'alamat', new.raw_user_meta_data->>'address', ''),
      COALESCE(new.raw_user_meta_data->>'no_hp', new.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================
-- SEED DATA - Pelanggaran umum
-- ==============================================
INSERT INTO public.pelanggaran (nama_pelanggaran, pasal, denda_maksimal)
VALUES
  ('Melanggar Rambu Lalu Lintas', 'Pasal 287 UU No. 22/2009', 250000),
  ('Tidak Menggunakan Helm', 'Pasal 291 UU No. 22/2009', 250000),
  ('Tidak Memiliki SIM', 'Pasal 281 UU No. 22/2009', 1000000),
  ('Melawan Arus', 'Pasal 287 UU No. 22/2009', 500000),
  ('Parkir Sembarangan', 'Pasal 287 UU No. 22/2009', 500000),
  ('Melanggar Marka Jalan', 'Pasal 287 UU No. 22/2009', 500000),
  ('Tidak Membawa STNK', 'Pasal 288 UU No. 22/2009', 500000),
  ('Berboncengan Lebih dari 2 Orang', 'Pasal 291 UU No. 22/2009', 250000),
  ('Melampaui Batas Kecepatan', 'Pasal 287 UU No. 22/2009', 750000),
  ('Menggunakan HP saat Berkendara', 'Pasal 283 UU No. 22/2009', 750000)
ON CONFLICT DO NOTHING;
