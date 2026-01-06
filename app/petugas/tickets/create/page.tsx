"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle, Camera, ImageIcon as ImageIconLucide } from "lucide-react"
import Link from "next/link"
import type { Profile, Vehicle, Violation } from "@/lib/types"

export default function CreateTicketPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFetchingUsers, setIsFetchingUsers] = useState(true)

  // Data lists
  const [users, setUsers] = useState<Profile[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])

  // Form data
  const [formData, setFormData] = useState({
    userId: "",
    vehicleId: "",
    violationId: "",
    location: "",
    evidencePhoto: "",
  })

  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      console.log("[v0] Memulai pengambilan data masyarakat...")
      setIsFetchingUsers(true)

      try {
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "user")
          .order("full_name", { ascending: true })

        if (usersError) {
          console.error("[v0] Error mengambil masyarakat:", usersError)
        } else {
          console.log("[v0] Data masyarakat ditemukan:", usersData?.length || 0)
          setUsers(usersData || [])
        }

        const { data: vehiclesData } = await supabase.from("vehicles").select("*").order("plate_number")
        const { data: violationsData } = await supabase.from("violations").select("*").order("name")

        setVehicles(vehiclesData || [])
        setViolations(violationsData || [])
      } catch (err) {
        console.error("[v0] Kesalahan tak terduga saat fetch data:", err)
      } finally {
        setIsFetchingUsers(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (formData.userId) {
      const userVehicles = vehicles.filter((v) => v.user_id === formData.userId)
      setFilteredVehicles(userVehicles)
    } else {
      setFilteredVehicles([])
    }
  }, [formData.userId, vehicles])

  useEffect(() => {
    if (formData.violationId) {
      const violation = violations.find((v) => v.id === formData.violationId)
      setSelectedViolation(violation || null)
    } else {
      setSelectedViolation(null)
    }
  }, [formData.violationId, violations])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan (JPG/PNG)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("bucket", "evidence")

      const uploadResponse = await fetch("/api/upload-evidence", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { publicUrl } = await uploadResponse.json()
      setFormData((prev) => ({ ...prev, evidencePhoto: publicUrl }))
    } catch (err: any) {
      console.error("[v0] Upload error:", err)
      setError("Gagal mengupload foto: " + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.evidencePhoto) {
      setError("Foto bukti pelanggaran wajib diupload")
      setIsLoading(false)
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("User tidak ditemukan")
      setIsLoading(false)
      return
    }

    const ticketCode = `TLG-${Date.now()}`

    const { error: insertError } = await supabase.from("tickets").insert({
      ticket_code: ticketCode,
      user_id: formData.userId,
      vehicle_id: formData.vehicleId,
      violation_id: formData.violationId,
      petugas_id: user.id,
      location: formData.location,
      evidence_photo_url: formData.evidencePhoto || null,
      fine_amount: selectedViolation?.max_fine || 0,
      status: "unpaid",
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push("/petugas/tickets")
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-2 gap-2">
          <Link href="/petugas/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Buat Tilang Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Catat pelanggaran lalu lintas</p>
      </div>

      <Card className="shadow-sm md:max-w-3xl">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle className="text-base md:text-lg">Formulir Tilang</CardTitle>
          <CardDescription className="text-xs md:text-sm">Lengkapi data pelanggaran dengan benar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium">
                Pilih Masyarakat
              </Label>
              <Select
                required
                value={formData.userId}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    userId: value,
                    vehicleId: "",
                  })
                }}
              >
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder={isFetchingUsers ? "Memuat masyarakat..." : "Pilih masyarakat"} />
                </SelectTrigger>
                <SelectContent>
                  {isFetchingUsers ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">Memuat data...</div>
                  ) : users.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">Tidak ada masyarakat ditemukan</div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} - {user.nik}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleId" className="text-sm font-medium">
                Pilih Kendaraan
              </Label>
              <Select
                required
                value={formData.vehicleId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    vehicleId: value,
                  })
                }
                disabled={!formData.userId}
              >
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder={formData.userId ? "Pilih kendaraan" : "Pilih masyarakat terlebih dahulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_number} - {vehicle.vehicle_type} {vehicle.brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="violationId" className="text-sm font-medium">
                Jenis Pelanggaran
              </Label>
              <Select
                required
                value={formData.violationId}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    violationId: value,
                  })
                }
              >
                <SelectTrigger className="h-11 md:h-10">
                  <SelectValue placeholder="Pilih pelanggaran" />
                </SelectTrigger>
                <SelectContent>
                  {violations.map((violation) => (
                    <SelectItem key={violation.id} value={violation.id}>
                      {violation.name} ({violation.article}) - Rp {violation.max_fine.toLocaleString("id-ID")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedViolation && (
                <div className="rounded-lg bg-primary/5 p-3 text-sm">
                  <p className="font-medium text-primary">{selectedViolation.article}</p>
                  <p className="text-primary/80">
                    Denda Maksimal: Rp {selectedViolation.max_fine.toLocaleString("id-ID")}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Lokasi Pelanggaran
              </Label>
              <Input
                id="location"
                placeholder="Contoh: Jl. Sudirman, Jakarta Pusat"
                required
                className="h-11 md:h-10"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Bukti Foto Pelanggaran <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-col gap-4">
                {previewUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                    <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setPreviewUrl(null)
                        setFormData((prev) => ({ ...prev, evidencePhoto: "" }))
                      }}
                    >
                      Hapus
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Label
                      htmlFor="camera-upload"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:bg-muted/50"
                    >
                      <Camera className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-medium">Ambil Foto</span>
                      <input
                        id="camera-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </Label>
                    <Label
                      htmlFor="file-upload"
                      className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:bg-muted/50"
                    >
                      <ImageIconLucide className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-medium">Upload Galeri</span>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </Label>
                  </div>
                )}
                {uploading && <p className="text-xs text-primary animate-pulse">Sedang mengupload...</p>}
                <p className="text-xs text-muted-foreground">
                  Format: JPG/PNG, Maksimal 5MB. Foto digunakan sebagai bukti dan akan ditampilkan kepada masyarakat.
                </p>
              </div>
            </div>

            {selectedViolation && (
              <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Denda</p>
                    <p className="text-2xl font-bold text-primary md:text-3xl">
                      Rp {selectedViolation.max_fine.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 md:flex-row md:gap-4">
              <Button type="submit" disabled={isLoading} className="h-11 md:h-10">
                {isLoading ? "Menyimpan..." : "Buat Tilang"}
              </Button>
              <Button type="button" variant="outline" asChild className="h-11 md:h-10 bg-transparent">
                <Link href="/petugas/dashboard">Batal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
