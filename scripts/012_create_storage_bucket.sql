-- ==============================================
-- STORAGE BUCKET untuk bukti pembayaran
-- ==============================================

-- Insert storage bucket jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies untuk storage
CREATE POLICY IF NOT EXISTS "payment_proofs_select_all"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY IF NOT EXISTS "payment_proofs_insert_authenticated"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "payment_proofs_update_own"
ON storage.objects FOR UPDATE
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "payment_proofs_delete_own"
ON storage.objects FOR DELETE
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
