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
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CreateTicketPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [masyarakat, setMasyarakat] = useState<any[]>([])
  const [kendaraan, setKendaraan] = useState<any[]>([])
  const [pelanggaran, setPelanggaran] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("")
  const [selectedViolation, setSelectedViolation] = useState("")
  const [location, setLocation] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()

      const { data: m } = await supabase.from("masyarakat").select("*")
      if (m) setMasyarakat(m)

      const { data: k } = await supabase.from("kendaraan").select("*")
      if (k) setKendaraan(k)

      const { data: p } = await supabase.from("pelanggaran").select("*")
      if (p) setPelanggaran(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = kendaraan.filter((k) => k.masyarakat_id === selectedUser)
  const selectedViolationData = pelanggaran.find((p) => p.id === selectedViolation)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User tidak ditemukan")

      const { error: insertError } = await supabase.from("tickets").insert({
        ticket_code: `TLG-${Date.now()}`,
        user_id: selectedUser,
        vehicle_id: selectedVehicle,
        violation_id: selectedViolation,
        petugas_id: user.id,
        location,
        fine_amount: selectedViolationData?.denda_maksimal || 0,
        status: "unpaid",
      })

      if (insertError) throw insertError
      router.push("/petugas/tickets")
    } catch (err: any) {
      setError(err.message || "Gagal membuat tilang")
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Memuat data...</div>
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
        <h1 className="text-2xl font-bold">Buat Tilang Baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">Catat pelanggaran lalu lintas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Tilang</CardTitle>
          <CardDescription>Lengkapi data pelanggaran</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Pilih Masyarakat</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih masyarakat" />
                </SelectTrigger>
                <SelectContent>
                  {masyarakat.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nama} - {m.nik}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pilih Kendaraan</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle} required disabled={!selectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedUser ? "Pilih kendaraan" : "Pilih masyarakat dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.plat_nomor} - {k.merk}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Jenis Pelanggaran</Label>
              <Select value={selectedViolation} onValueChange={setSelectedViolation} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pelanggaran" />
                </SelectTrigger>
                <SelectContent>
                  {pelanggaran.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nama_pelanggaran} - Rp {p.denda_maksimal.toLocaleString("id-ID")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Lokasi Pelanggaran</Label>
              <Input
                placeholder="Jl. Sudirman, Jakarta Pusat"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {selectedViolationData && (
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium">Total Denda</p>
                <p className="text-2xl font-bold text-primary">
                  Rp {selectedViolationData.denda_maksimal.toLocaleString("id-ID")}
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Buat Tilang"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/petugas/dashboard">Batal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
