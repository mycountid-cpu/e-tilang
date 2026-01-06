export const validateNIK = (nik: string): { valid: boolean; error?: string } => {
  if (!nik) return { valid: false, error: "NIK tidak boleh kosong" }
  if (!/^\d{16}$/.test(nik)) return { valid: false, error: "NIK harus 16 digit angka" }
  return { valid: true }
}

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) return { valid: false, error: "Nomor HP tidak boleh kosong" }
  // Indonesian phone number format: 08xx or +628xx
  if (!/^(\+62|0)8\d{7,11}$/.test(phone.replace(/\D/g, ""))) {
    return { valid: false, error: "Format nomor HP tidak valid (gunakan 08xx atau +628xx)" }
  }
  return { valid: true }
}

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) return { valid: false, error: "Email tidak boleh kosong" }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: "Format email tidak valid" }
  }
  return { valid: true }
}

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) return { valid: false, error: "Password tidak boleh kosong" }
  if (password.length < 8) return { valid: false, error: "Password minimal 8 karakter" }
  if (!/[A-Z]/.test(password)) return { valid: false, error: "Password harus mengandung huruf besar" }
  if (!/[0-9]/.test(password)) return { valid: false, error: "Password harus mengandung angka" }
  return { valid: true }
}

export const validateFullName = (name: string): { valid: boolean; error?: string } => {
  if (!name) return { valid: false, error: "Nama lengkap tidak boleh kosong" }
  if (name.trim().length < 3) return { valid: false, error: "Nama minimal 3 karakter" }
  return { valid: true }
}

export const validateAddress = (address: string): { valid: boolean; error?: string } => {
  if (!address) return { valid: false, error: "Alamat tidak boleh kosong" }
  if (address.trim().length < 5) return { valid: false, error: "Alamat minimal 5 karakter" }
  return { valid: true }
}

// Trigger vibration effect for errors
export const triggerVibration = () => {
  if ("vibrate" in navigator) {
    navigator.vibrate([50, 30, 50])
  }
}
