"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, Users, Shield, AlertTriangle } from "lucide-react"

export default function DemoSetupPage() {
  const [loading, setLoading] = useState<"masyarakat" | "petugas" | null>(null)
  const [status, setStatus] = useState<string>("")
  const [warning, setWarning] = useState<string>("")
  const [created, setCreated] = useState<{ masyarakat: boolean; petugas: boolean }>({
    masyarakat: false,
    petugas: false,
  })
  const router = useRouter()

  const createDemoAccount = async (type: "masyarakat" | "petugas") => {
    setLoading(type)
    setStatus(`Membuat akun demo ${type}...`)
    setWarning("")

    try {
      const response = await fetch("/api/demo-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat akun")
      }

      if (data.profileCreated === false) {
        setWarning("Tabel profiles belum dibuat. Jalankan script SQL 001_create_tables.sql terlebih dahulu.")
      }

      if (data.exists) {
        setStatus(
          `Akun ${data.email} sudah ada! Password telah direset. Silakan login dengan password: ${data.password}`,
        )
      } else {
        setStatus(`Akun ${type} berhasil dibuat! Email: ${data.email}, Password: ${data.password}`)
      }
      setCreated((prev) => ({ ...prev, [type]: true }))
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setStatus(`Error: ${errorMessage}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">Demo Setup E-Tilang</CardTitle>
          <CardDescription className="text-lg mt-2">Buat akun demo untuk testing aplikasi E-Tilang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Klik tombol di bawah untuk membuat akun demo. Setiap akun menggunakan password:{" "}
              <strong>demo123456</strong>
              <br />
              <span className="text-sm text-muted-foreground mt-1 block">
                Akun demo tidak memerlukan verifikasi email.
              </span>
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-blue-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Akun Masyarakat</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Email: demo.masyarakat@gmail.com
                  <br />
                  Password: demo123456
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => createDemoAccount("masyarakat")}
                  disabled={loading !== null}
                  className="w-full"
                  variant={created.masyarakat ? "outline" : "default"}
                >
                  {loading === "masyarakat" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : created.masyarakat ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : null}
                  {created.masyarakat ? "Sudah Dibuat" : "Buat Akun Masyarakat"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-600" />
                  <CardTitle className="text-lg">Akun Petugas</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Email: demo.petugas@gmail.com
                  <br />
                  Password: demo123456
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => createDemoAccount("petugas")}
                  disabled={loading !== null}
                  className="w-full"
                  variant={created.petugas ? "outline" : "default"}
                >
                  {loading === "petugas" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : created.petugas ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  ) : null}
                  {created.petugas ? "Sudah Dibuat" : "Buat Akun Petugas"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {warning && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">{warning}</AlertDescription>
            </Alert>
          )}

          {status && (
            <Alert className={status.includes("Error") ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}>
              <AlertDescription className="text-center font-medium">{status}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-center pt-4 flex-wrap">
            <Button onClick={() => router.push("/auth/user/login")} variant="outline">
              Login Masyarakat
            </Button>
            <Button onClick={() => router.push("/auth/petugas/login")} variant="outline">
              Login Petugas
            </Button>
            <Button onClick={() => router.push("/")} variant="ghost">
              Kembali ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
