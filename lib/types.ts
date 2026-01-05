export interface Profile {
  id: string
  nik: string
  full_name: string
  address: string | null
  phone: string | null
  role: "user" | "petugas"
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  user_id: string
  plate_number: string
  vehicle_type: string
  brand: string
  color: string
  created_at: string
  updated_at: string
}

export interface Violation {
  id: string
  name: string
  article: string
  max_fine: number
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  ticket_code: string
  user_id: string
  vehicle_id: string
  violation_id: string
  petugas_id: string
  location: string
  evidence_photo_url: string | null
  fine_amount: number
  status: "unpaid" | "pending_confirmation" | "paid" | "payment_rejected"
  ticket_date: string
  paid_at: string | null
  payment_method: string | null
  payment_proof_url?: string | null
  created_at: string
  updated_at: string
  // Joined data
  vehicle?: Vehicle
  violation?: Violation
  user?: Profile
  petugas?: Profile
}
