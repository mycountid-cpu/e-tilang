-- increased NIK column size to prevent "value too long" error
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN nik TYPE VARCHAR(20);

-- Script to create petugas account via SQL if API isn't used
-- Note: This is a backup method, the API route is preferred for production
INSERT INTO profiles (id, nik, full_name, role, phone)
SELECT id, '198501012010011001', 'Petugas Lapangan', 'petugas', '081234567890'
FROM auth.users
WHERE email = 'petugas@etilang.com'
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Petugas Lapangan', role = 'petugas';
