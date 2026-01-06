# E-Tilang Setup Guide

Panduan lengkap untuk mengatur dan menjalankan aplikasi E-Tilang dengan Supabase.

## Prasyarat

1. Akun Supabase (https://supabase.com/dashboard)
2. Node.js 18+ terinstall
3. Git terinstall

## Langkah 1: Setup Supabase

### 1.1 Buat Proyek Baru
1. Login ke [Dashboard Supabase](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Isi detail proyek:
   - **Name**: etilang (atau nama pilihan Anda)
   - **Database Password**: Simpan password ini dengan aman
   - **Region**: Pilih yang terdekat dengan lokasi Anda
4. Tunggu beberapa menit hingga proyek selesai dibuat

### 1.2 Ambil Kredensial API
1. Buka proyek Anda di dashboard
2. Pergi ke **Settings** (ikon gerigi) → **API**
3. Salin nilai berikut:
   - **Project URL**: `https://xyzabc.supabase.co`
   - **anon public** key (API Key publik)
   - **service_role** key (API Key admin) - **RAHASIA, jangan dibagikan!**

## Langkah 2: Setup Environment Variables

### 2.1 Buat File `.env.local`
Di folder root proyek, buat file `.env.local` dan isi dengan:

\`\`\`env
# Supabase Credentials (WAJIB)
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Development Redirect (OPSIONAL)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

**PENTING**: 
- Ganti `https://xyzabc.supabase.co` dengan Project URL Anda
- Ganti `your_anon_public_key_here` dengan anon key Anda
- Ganti `your_service_role_key_here` dengan service role key Anda
- Jangan commit file `.env.local` ke Git!

## Langkah 3: Setup Database

### 3.1 Jalankan SQL Scripts
1. Buka Supabase Dashboard → **SQL Editor**
2. Klik **"New Query"**
3. Jalankan skrip berikut **secara berurutan**:

#### Script 1: Buat Tabel
Copy dan paste isi dari `scripts/001_create_tables.sql`, lalu klik **Run**

#### Script 2: Seed Data (Opsional)
Copy dan paste isi dari `scripts/002_seed_data.sql`, lalu klik **Run**

#### Script 3: Fix RLS Policies
Copy dan paste isi dari `scripts/005_fix_infinite_recursion.sql`, lalu klik **Run**

**PENTING**: Script 005 adalah versi terbaru yang memperbaiki masalah infinite recursion di RLS policies. Gunakan script ini untuk menghindari error saat query.

### 3.2 Verifikasi Tabel
1. Pergi ke **Table Editor** di Supabase Dashboard
2. Pastikan tabel berikut sudah dibuat:
   - `profiles` (data pengguna dan petugas)
   - `vehicles` (data kendaraan)
   - `violations` (jenis pelanggaran)
   - `tickets` (tilang/e-tilang)

## Langkah 4: Buat Akun Petugas

Ada 2 cara untuk membuat akun petugas:

### Opsi A: Via API Route (Direkomendasikan)
1. Pastikan aplikasi sudah berjalan (lihat Langkah 5)
2. Buka browser dan akses: `http://localhost:3000/api/setup-petugas`
3. Atau gunakan curl:
   \`\`\`bash
   curl -X POST http://localhost:3000/api/setup-petugas
   \`\`\`
4. Akun petugas akan dibuat dengan kredensial:
   - Email: `petugas@etilang.com`
   - Password: `root`

### Opsi B: Via SQL
Copy dan paste script berikut di SQL Editor:

\`\`\`sql
-- Jalankan script ini untuk membuat profil petugas
INSERT INTO profiles (id, nik, full_name, role, phone)
SELECT id, '198501012010011001', 'Petugas Lapangan', 'petugas', '081234567890'
FROM auth.users
WHERE email = 'petugas@etilang.com'
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Petugas Lapangan', role = 'petugas';
\`\`\`

**CATATAN**: Untuk Opsi B, Anda harus membuat user terlebih dahulu di Supabase Authentication Dashboard atau via admin API.

## Langkah 5: Jalankan Aplikasi

### 5.1 Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 5.2 Jalankan Development Server
\`\`\`bash
npm run dev
\`\`\`

### 5.3 Buka Aplikasi
Aplikasi akan berjalan di: http://localhost:3000

## Langkah 6: Konfigurasi Authentication

### 6.1 Setup Redirect URLs
1. Buka Supabase Dashboard → **Authentication** → **URL Configuration**
2. Di **Site URL**, masukkan:
   - Development: `http://localhost:3000`
   - Production: `https://nama-app-anda.vercel.app`
3. Di **Redirect URLs**, tambahkan:
   - `http://localhost:3000/auth/callback` (development)
   - `https://nama-app-anda.vercel.app/auth/callback` (production)
   - `http://localhost:3000/**` (untuk development wildcard)
4. Klik **Save**

### 6.2 Enable Email Provider (Opsional)
Jika Anda ingin fitur email verification:
1. Pergi ke **Authentication** → **Providers**
2. Pastikan **Email** provider aktif
3. Konfigurasi SMTP settings jika diperlukan

## Langkah 7: Testing

### 7.1 Login Petugas
1. Buka: http://localhost:3000/auth/petugas/login
2. Login dengan:
   - Email: `petugas@etilang.com`
   - Password: `root`
3. Anda akan diarahkan ke dashboard petugas

### 7.2 Registrasi Masyarakat
1. Buka: http://localhost:3000/auth/user/register
2. Isi form pendaftaran dengan data valid
3. Cek email untuk verifikasi (jika email provider aktif)
4. Login di: http://localhost:3000/auth/user/login

## Troubleshooting

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- Pastikan file `.env.local` ada di folder root
- Restart development server setelah menambahkan environment variables

### Error: "Invalid login credentials"
- Periksa email dan password yang digunakan
- Pastikan akun sudah dibuat di Supabase (cek di Authentication → Users)

### Error: "infinite recursion detected in policy"
- Jalankan script `005_fix_infinite_recursion.sql` di SQL Editor
- Script ini mengganti RLS policies yang menyebabkan recursion

### Error: "relation 'profiles' does not exist"
- Jalankan script `001_create_tables.sql` di SQL Editor
- Pastikan semua tabel sudah dibuat dengan benar

### Error saat login petugas: "Akun ini bukan akun petugas"
- Pastikan user_metadata role di auth.users adalah `petugas`
- Atau pastikan role di tabel profiles adalah `petugas`
- Jalankan ulang `/api/setup-petugas` untuk memperbarui akun

## Deployment ke Vercel

### 1. Push ke GitHub
\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
\`\`\`

### 2. Deploy ke Vercel
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **"Add New"** → **"Project"**
3. Import repository GitHub Anda
4. Di **Environment Variables**, tambahkan semua variabel dari `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Klik **"Deploy"**
6. Setelah deploy selesai, update **Redirect URLs** di Supabase dengan URL produksi Anda

### 3. Setup Petugas di Production
Setelah deploy, buka:
\`\`\`
https://nama-app-anda.vercel.app/api/setup-petugas
\`\`\`

## Keamanan

### JANGAN LAKUKAN:
- ❌ Commit file `.env.local` ke Git
- ❌ Bagikan `SUPABASE_SERVICE_ROLE_KEY` ke publik
- ❌ Gunakan service_role key di client-side code
- ❌ Disable RLS (Row Level Security) di production

### WAJIB DILAKUKAN:
- ✅ Gunakan environment variables untuk semua kredensial
- ✅ Aktifkan RLS di semua tabel
- ✅ Validasi input di client dan server
- ✅ Gunakan HTTPS di production
- ✅ Backup database secara berkala

## Kontak Support

Jika Anda mengalami masalah:
1. Cek console browser untuk error messages
2. Cek Supabase logs di Dashboard → Logs
3. Periksa Network tab di DevTools untuk API calls yang gagal

---

**Selamat mencoba! Aplikasi E-Tilang siap digunakan.**
