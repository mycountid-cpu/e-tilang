"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Car } from "lucide-react"
import Link from "next/link"

export default function AddVehiclePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    plateNumber: "",
    vehicleType: "",
    brand: "",
    color: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("User tidak ditemukan")
      setIsLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("vehicles").insert({
      user_id: user.id,
      plate_number: formData.plateNumber.toUpperCase(),
      vehicle_type: formData.vehicleType,
      brand: formData.brand,
      color: formData.color,
    })

    if (insertError) {
      setError(insertError.message)
      setIsLoading(false)
      return
    }

    router.push("/user/vehicles")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" asChild className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/user/vehicles">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tambah Kendaraan</h1>
        <p className="mt-1 text-muted-foreground">Daftarkan kendaraan baru Anda</p>
      </div>

      {/* Form Card */}
      <Card className="mx-auto max-w-2xl shadow-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Car className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4">Informasi Kendaraan</CardTitle>
          <CardDescription>Masukkan data kendaraan yang akan didaftarkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="plateNumber">Nomor Plat</Label>
              <Input
                id="plateNumber"
                placeholder="B 1234 XYZ"
                required
                className="uppercase"
                value={formData.plateNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plateNumber: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Jenis Kendaraan</Label>
              <Select
                required
                value={formData.vehicleType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    vehicleType: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Mobil">Mobil</SelectItem>
                  <SelectItem value="Truk">Truk</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Merk</Label>
              <Input
                id="brand"
                placeholder="Honda, Toyota, dll."
                required
                value={formData.brand}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    brand: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Warna</Label>
              <Input
                id="color"
                placeholder="Hitam, Putih, dll."
                required
                value={formData.color}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    color: e.target.value,
                  })
                }
              />
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Menyimpan..." : "Simpan Kendaraan"}
              </Button>
              <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
                <Link href="/user/vehicles">Batal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
