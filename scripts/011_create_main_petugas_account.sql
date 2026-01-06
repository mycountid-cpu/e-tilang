-- ==============================================
-- BUAT AKUN PETUGAS UTAMA
-- Email: petugas@etilang.com
-- Password: root123
-- ==============================================

DO $$
DECLARE
  petugas_user_id UUID;
BEGIN
  -- 1. Cek apakah user sudah ada
  SELECT id INTO petugas_user_id
  FROM auth.users
  WHERE email = 'petugas@etilang.com';

  -- 2. Jika belum ada, buat user baru
  IF petugas_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'petugas@etilang.com',
      crypt('root123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"petugas","nama_petugas":"Petugas Utama","nrp_nip":"P001","satuan":"Satlantas Kota"}',
      NOW(),
      NOW(),
      '',
      ''
    )
    RETURNING id INTO petugas_user_id;

    RAISE NOTICE 'Akun petugas berhasil dibuat dengan ID: %', petugas_user_id;

    -- 3. Buat entry di tabel petugas
    INSERT INTO public.petugas (id, nama_petugas, nrp_nip, satuan)
    VALUES (
      petugas_user_id,
      'Petugas Utama',
      'P001',
      'Satlantas Kota'
    )
    ON CONFLICT (id) DO UPDATE
    SET nama_petugas = 'Petugas Utama',
        nrp_nip = 'P001',
        satuan = 'Satlantas Kota';

    RAISE NOTICE 'Entry petugas berhasil dibuat/diupdate';

  ELSE
    RAISE NOTICE 'Akun petugas@etilang.com sudah ada dengan ID: %', petugas_user_id;
    
    -- Update entry petugas jika belum ada
    INSERT INTO public.petugas (id, nama_petugas, nrp_nip, satuan)
    VALUES (
      petugas_user_id,
      'Petugas Utama',
      'P001',
      'Satlantas Kota'
    )
    ON CONFLICT (id) DO UPDATE
    SET nama_petugas = 'Petugas Utama',
        nrp_nip = 'P001',
        satuan = 'Satlantas Kota';
  END IF;

END $$;

-- Verify
SELECT 
  u.id,
  u.email,
  p.nama_petugas,
  p.nrp_nip,
  p.satuan
FROM auth.users u
LEFT JOIN public.petugas p ON u.id = p.id
WHERE u.email = 'petugas@etilang.com';
