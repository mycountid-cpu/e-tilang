-- Create Petugas Account
-- Email: petugas@etilang.com
-- Password: root123

-- First, check if user already exists
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if email already exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'petugas@etilang.com';
  
  IF user_id IS NULL THEN
    -- Create new user ID
    user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      created_at,
      updated_at,
      last_sign_in_at,
      aud,
      role,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'petugas@etilang.com',
      crypt('root123', gen_salt('bf')),
      now(),
      now(),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated',
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '',
      ''
    );

    -- Insert into profiles
    INSERT INTO profiles (
      id,
      full_name,
      nik,
      address,
      phone,
      role
    ) VALUES (
      user_id,
      'Petugas Polisi',
      '3201040404040004',
      'Polres Jakarta Pusat, Jl. Jenderal Sudirman',
      '081234567999',
      'petugas'
    );

    -- Insert into auth.identities for email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'petugas@etilang.com',
      'email',
      json_build_object('sub', user_id::text, 'email', 'petugas@etilang.com')::jsonb,
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Petugas account created successfully with ID: %', user_id;
  ELSE
    RAISE NOTICE 'Petugas account already exists with ID: %', user_id;
  END IF;
END $$;
