"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { validateNIK, validatePhone, validateFullName, validateAddress, triggerVibration } from "@/lib/validation"

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    nik: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/user/login")
          return
        }

        // Check if account is registered in profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.log("[v0] Profile not found - account not registered yet")
          toast({
            title: "Akun belum terdaftar",
            description: "Silakan lengkapi profil Anda terlebih dahulu",
            variant: "destructive",
          })
          router.push("/auth/user/register")
          return
        }

        setFormData({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          nik: profileData.nik || "",
        })
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Gagal memuat data profil",
          variant: "destructive",
        })
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    const nikValidation = validateNIK(formData.nik)
    if (!nikValidation.valid) newErrors.nik = nikValidation.error || ""

    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.valid) newErrors.phone = phoneValidation.error || ""

    const nameValidation = validateFullName(formData.full_name)
    if (!nameValidation.valid) newErrors.full_name = nameValidation.error || ""

    const addressValidation = validateAddress(formData.address)
    if (!addressValidation.valid) newErrors.address = addressValidation.error || ""

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      triggerVibration()
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/user/login")
        return
      }

      // Update profile data
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Update auth user metadata
      const { error: updateAuthError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          address: formData.address,
        },
      })

      if (updateAuthError) throw updateAuthError

      toast({
        title: "Profil berhasil diupdate",
        description: "Data pribadi Anda telah disimpan",
      })

      router.push("/user/profile")
    } catch (error: unknown) {
      triggerVibration()
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat update profil"
      console.error("[v0] Update profile error:", errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Memuat data profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/user/profile"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          title="Kembali"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Profil</h1>
          <p className="mt-1 text-muted-foreground">Perbarui informasi data pribadi Anda</p>
        </div>
      </div>

      <Card className="mx-auto max-w-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Perbarui Data Profil</CardTitle>
          <CardDescription>Pastikan data Anda sudah benar dan terkini</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nik">NIK (16 digit)</Label>
                <Input
                  id="nik"
                  name="nik"
                  type="text"
                  maxLength={16}
                  value={formData.nik}
                  onChange={handleInputChange}
                  disabled
                  className="bg-muted opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">NIK tidak dapat diubah</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={errors.full_name ? "border-red-500" : ""}
                />
                {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="08123456789 atau +62812345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Jl. Contoh No. 123"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" asChild>
                <Link href="/user/profile">Batal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
