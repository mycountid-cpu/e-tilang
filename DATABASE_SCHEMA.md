# E-Tilang Database Schema

Dokumentasi lengkap struktur database untuk aplikasi E-Tilang.

## Overview

Database menggunakan PostgreSQL melalui Supabase dengan 4 tabel utama:
1. **profiles** - Data pengguna dan petugas
2. **vehicles** - Data kendaraan
3. **violations** - Master data pelanggaran
4. **tickets** - Data tilang/e-tilang

## Tabel: profiles

Menyimpan informasi pengguna dan petugas. Extends dari `auth.users`.

\`\`\`sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik VARCHAR(16) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'petugas')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Kolom
- `id` (UUID, PK): Foreign key ke auth.users, auto-generated oleh Supabase Auth
- `nik` (VARCHAR(16), UNIQUE): Nomor Induk Kependudukan (16 digit)
- `full_name` (VARCHAR(255)): Nama lengkap pengguna
- `address` (TEXT): Alamat lengkap
- `phone` (VARCHAR(20)): Nomor telepon
- `role` (VARCHAR(20)): Role pengguna, hanya `'user'` atau `'petugas'`
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

### Indexes
- `idx_profiles_nik` pada `nik`
- `idx_profiles_role` pada `role`

### RLS Policies
- `profiles_select_own`: Users dapat melihat profil mereka sendiri
- `profiles_select_petugas`: Petugas dapat melihat semua profil
- `profiles_insert_own`: Users dapat insert profil mereka sendiri
- `profiles_update_own`: Users dapat update profil mereka sendiri

## Tabel: vehicles

Menyimpan data kendaraan milik masyarakat.

\`\`\`sql
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Kolom
- `id` (UUID, PK): Primary key, auto-generated
- `user_id` (UUID, FK): Foreign key ke profiles.id
- `plate_number` (VARCHAR(20), UNIQUE): Nomor plat kendaraan
- `vehicle_type` (VARCHAR(50)): Jenis kendaraan (Motor, Mobil, dll)
- `brand` (VARCHAR(100)): Merek kendaraan
- `color` (VARCHAR(50)): Warna kendaraan
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

### Indexes
- `idx_vehicles_user_id` pada `user_id`
- `idx_vehicles_plate_number` pada `plate_number`

### RLS Policies
- `vehicles_select_own`: Users dapat melihat kendaraan mereka, petugas dapat melihat semua
- `vehicles_insert_own`: Users dapat menambah kendaraan mereka
- `vehicles_update_own`: Users dapat update kendaraan mereka
- `vehicles_delete_own`: Users dapat menghapus kendaraan mereka

## Tabel: violations

Master data jenis pelanggaran lalu lintas.

\`\`\`sql
CREATE TABLE public.violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  article VARCHAR(100) NOT NULL,
  max_fine DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

### Kolom
- `id` (UUID, PK): Primary key, auto-generated
- `name` (VARCHAR(255)): Nama pelanggaran
- `article` (VARCHAR(100)): Pasal yang dilanggar (contoh: Pasal 287 UU No. 22/2009)
- `max_fine` (DECIMAL(12,2)): Denda maksimal dalam Rupiah
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

### RLS Policies
- `violations_select_all`: Semua authenticated users dapat membaca
- `violations_manage_petugas`: Hanya petugas yang dapat insert/update/delete

## Tabel: tickets

Menyimpan data tilang/e-tilang.

\`\`\`sql
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  violation_id UUID NOT NULL REFERENCES public.violations(id) ON DELETE RESTRICT,
  petugas_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
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
\`\`\`

### Kolom
- `id` (UUID, PK): Primary key, auto-generated
- `ticket_code` (VARCHAR(50), UNIQUE): Kode tilang unik
- `user_id` (UUID, FK): Foreign key ke profiles (pelanggar)
- `vehicle_id` (UUID, FK): Foreign key ke vehicles
- `violation_id` (UUID, FK): Foreign key ke violations
- `petugas_id` (UUID, FK): Foreign key ke profiles (petugas yang menilang)
- `location` (TEXT): Lokasi pelanggaran
- `evidence_photo_url` (TEXT): URL foto bukti pelanggaran
- `fine_amount` (DECIMAL(12,2)): Jumlah denda dalam Rupiah
- `status` (VARCHAR(20)): Status pembayaran (`'unpaid'` atau `'paid'`)
- `ticket_date` (TIMESTAMP): Tanggal tilang diterbitkan
- `paid_at` (TIMESTAMP): Tanggal pembayaran (null jika belum bayar)
- `payment_method` (VARCHAR(50)): Metode pembayaran
- `created_at` (TIMESTAMP): Waktu pembuatan record
- `updated_at` (TIMESTAMP): Waktu update terakhir

### Indexes
- `idx_tickets_user_id` pada `user_id`
- `idx_tickets_petugas_id` pada `petugas_id`
- `idx_tickets_status` pada `status`
- `idx_tickets_ticket_code` pada `ticket_code`
- `idx_tickets_ticket_date` pada `ticket_date`

### RLS Policies
- `tickets_select_own`: Users dapat melihat tilang mereka, petugas dapat melihat semua
- `tickets_insert_petugas`: Hanya petugas yang dapat membuat tilang baru
- `tickets_update_petugas`: Hanya petugas yang dapat update tilang

## Relationships

\`\`\`
auth.users (Supabase Auth)
    ↓
profiles (id, role)
    ↓
    ├─→ vehicles (user_id)
    │       ↓
    │   tickets (vehicle_id)
    │
    └─→ tickets (user_id, petugas_id)
    
violations
    ↓
tickets (violation_id)
\`\`\`

## Row Level Security (RLS)

Semua tabel menggunakan RLS untuk keamanan data:

### Strategi RLS
1. **JWT-based role checking**: Menggunakan `auth.jwt() -> 'user_metadata' ->> 'role'` untuk menghindari infinite recursion
2. **User isolation**: Users hanya bisa akses data mereka sendiri
3. **Petugas privileges**: Petugas memiliki akses penuh ke semua data

### Contoh Policy

\`\`\`sql
-- Users dapat melihat profil mereka sendiri
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Petugas dapat melihat semua profil (menggunakan JWT claim)
CREATE POLICY "profiles_select_petugas" ON profiles
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
  );
\`\`\`

## Triggers

### handle_new_user()
Trigger function yang otomatis membuat profil saat user baru register.

\`\`\`sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
\`\`\`

Trigger ini dijalankan `AFTER INSERT` pada `auth.users`.

## Migrasi

Script SQL untuk setup database tersedia di folder `/scripts`:

1. `001_create_tables.sql` - Buat semua tabel dan RLS policies
2. `002_seed_data.sql` - Insert data sample (opsional)
3. `005_fix_infinite_recursion.sql` - Perbaikan RLS policies (PENTING)

Jalankan secara berurutan di Supabase SQL Editor.

## Query Examples

### Get user with their vehicles
\`\`\`sql
SELECT p.*, v.*
FROM profiles p
LEFT JOIN vehicles v ON v.user_id = p.id
WHERE p.id = auth.uid();
\`\`\`

### Get tickets for a user with all related data
\`\`\`sql
SELECT 
  t.*,
  v.name as violation_name,
  v.article,
  veh.plate_number,
  veh.vehicle_type,
  p_petugas.full_name as petugas_name
FROM tickets t
JOIN violations v ON t.violation_id = v.id
JOIN vehicles veh ON t.vehicle_id = veh.id
JOIN profiles p_petugas ON t.petugas_id = p_petugas.id
WHERE t.user_id = auth.uid()
ORDER BY t.ticket_date DESC;
\`\`\`

### Get all unpaid tickets (petugas view)
\`\`\`sql
SELECT 
  t.*,
  p_user.full_name as user_name,
  p_user.phone as user_phone,
  v.name as violation_name,
  veh.plate_number
FROM tickets t
JOIN profiles p_user ON t.user_id = p_user.id
JOIN violations v ON t.violation_id = v.id
JOIN vehicles veh ON t.vehicle_id = veh.id
WHERE t.status = 'unpaid'
AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'petugas'
ORDER BY t.ticket_date DESC;
