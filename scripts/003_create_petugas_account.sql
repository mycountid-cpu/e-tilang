-- Script to create a petugas (officer) account
-- This account can be used to login to the petugas portal

-- Note: You need to manually create the auth.users entry first through Supabase Auth
-- Or use the demo-setup page at /demo-setup

-- Create a petugas profile that can be linked to an auth user
-- Replace 'YOUR_USER_ID' with the actual UUID from auth.users after creating the account

-- Option 1: Insert a new profile for an existing auth user
-- First, create the user via Supabase dashboard or use the script below

-- Example petugas account details:
-- Email: petugas@etilang.com
-- Password: Petugas123! (you can change this when creating)
-- Role: petugas

-- This is a manual insert if you already created the auth user
-- INSERT INTO public.profiles (id, nik, full_name, address, phone, role)
-- VALUES (
--   'YOUR_USER_ID_HERE', -- Replace with actual UUID from auth.users
--   '3201030303030003',
--   'Petugas Polisi',
--   'Polres Jakarta Pusat, Jl. Jenderal Sudirman',
--   '081234567999',
--   'petugas'
-- );

-- Alternative: Use the demo setup page
-- Visit: /demo-setup in your browser
-- Click "Buat Akun Petugas" to automatically create:
-- Email: demo.petugas@gmail.com
-- Password: demo123456
