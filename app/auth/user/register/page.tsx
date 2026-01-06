"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  validateNIK,
  validatePhone,
  validateEmail,
  validatePassword,
  validateFullName,
  validateAddress,
  triggerVibration,
} from "@/lib/validation"

export default function UserRegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nik: "",
    fullName: "",
    address: "",
    phone: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    const newErrors: Record<string, string> = {}

    const nikValidation = validateNIK(formData.nik)
    if (!nikValidation.valid) newErrors.nik = nikValidation.error || ""

    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) newErrors.phone = phoneValidation.error || ""

    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.valid) newErrors.email = emailValidation.error || ""

    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) newErrors.password = passwordValidation.error || ""

    const nameValidation = validateFullName(formData.fullName)
    if (!nameValidation.valid) newErrors.fullName = nameValidation.error || ""

    const addressValidation = validateAddress(formData.address)
    if (!addressValidation.valid) newErrors.address = addressValidation.error || ""

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok"
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      triggerVibration()
      setIsLoading(false)
      return
    }

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`

      const { data: existingUser } = await supabase.from("profiles").select("nik").eq("nik", formData.nik).single()

      if (existingUser) {
        setError("NIK sudah terdaftar di sistem. Gunakan NIK lain atau login jika sudah memiliki akun.")
        triggerVibration()
        setIsLoading(false)
        return
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nik: formData.nik,
            full_name: formData.fullName,
            address: formData.address,
            phone: formData.phone,
            role: "user",
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          nik: formData.nik,
          full_name: formData.fullName,
          address: formData.address,
          phone: formData.phone,
          role: "user",
        })

        if (profileError) {
          console.log("[v0] Profile creation error:", profileError)
        }
      }

      toast({
        title: "Pendaftaran berhasil",
        description: "Silakan cek email untuk verifikasi akun Anda",
      })

      router.push("/auth/register-success")
    } catch (error: unknown) {
      triggerVibration()
      const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat pendaftaran"
      setError(errorMsg)
      console.error("[v0] Registration error:", errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-900">E-Tilang</h1>
          <p className="mt-2 text-gray-600">Portal Masyarakat</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Daftar Akun</CardTitle>
            <CardDescription>Buat akun baru untuk mengakses layanan E-Tilang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nik">NIK (16 digit)</Label>
                  <Input
                    id="nik"
                    name="nik"
                    type="text"
                    placeholder="3201234567890001"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={handleInputChange}
                    className={fieldErrors.nik ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.nik && <p className="text-sm text-red-500">{fieldErrors.nik}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nama Lengkap Anda"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={fieldErrors.fullName ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.fullName && <p className="text-sm text-red-500">{fieldErrors.fullName}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08123456789 atau +62812345678"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={fieldErrors.phone ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Jl. Contoh No. 123"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className={fieldErrors.address ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.address && <p className="text-sm text-red-500">{fieldErrors.address}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@gmail.com"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={fieldErrors.email ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min 8 karakter, 1 huruf besar, 1 angka"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={fieldErrors.password ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={fieldErrors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}
                  />
                  {fieldErrors.confirmPassword && <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>}
                </div>

                {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Daftar"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Sudah punya akun?{" "}
                <Link href="/auth/user/login" className="font-medium text-blue-600 underline-offset-4 hover:underline">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
