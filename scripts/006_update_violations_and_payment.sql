-- Update violation fine amounts to match provided QR codes
-- 250k: Helm, Parkir, Sabuk, Knalpot
-- 500k: Rambu, STNK, Arus, Lampu Merah
-- 1000k: SIM

UPDATE public.violations SET max_fine = 250000 WHERE name IN ('Tidak Menggunakan Helm', 'Parkir Sembarangan', 'Knalpot Tidak Standar', 'Tidak Menggunakan Sabuk Pengaman');
UPDATE public.violations SET max_fine = 500000 WHERE name IN ('Melanggar Rambu Lalu Lintas', 'Tidak Memiliki STNK', 'Melawan Arus', 'Menerobos Lampu Merah');
UPDATE public.violations SET max_fine = 1000000 WHERE name IN ('Tidak Memiliki SIM');
UPDATE public.violations SET max_fine = 750000 WHERE name IN ('Menggunakan HP Saat Berkendara');

-- Ensure tickets always match the latest fine amount from violations
-- (In a real app, we'd do this at creation time, which the current code already does)
