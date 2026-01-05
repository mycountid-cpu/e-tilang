-- Seed violations master data
INSERT INTO public.violations (name, article, max_fine) VALUES
  ('Tidak Menggunakan Helm', 'UU No. 22 Tahun 2009 Pasal 106 Ayat 8', 250000),
  ('Melanggar Rambu Lalu Lintas', 'UU No. 22 Tahun 2009 Pasal 287', 500000),
  ('Tidak Memiliki SIM', 'UU No. 22 Tahun 2009 Pasal 281', 1000000),
  ('Tidak Memiliki STNK', 'UU No. 22 Tahun 2009 Pasal 288', 500000),
  ('Menggunakan HP Saat Berkendara', 'UU No. 22 Tahun 2009 Pasal 283', 750000),
  ('Parkir Sembarangan', 'UU No. 22 Tahun 2009 Pasal 287 Ayat 1', 250000),
  ('Melawan Arus', 'UU No. 22 Tahun 2009 Pasal 287 Ayat 2', 500000),
  ('Menerobos Lampu Merah', 'UU No. 22 Tahun 2009 Pasal 287 Ayat 3', 500000),
  ('Knalpot Tidak Standar', 'UU No. 22 Tahun 2009 Pasal 285', 250000),
  ('Tidak Menggunakan Sabuk Pengaman', 'UU No. 22 Tahun 2009 Pasal 289', 250000)
ON CONFLICT DO NOTHING;
