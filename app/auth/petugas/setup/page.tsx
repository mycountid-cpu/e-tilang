"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SetupPetugasPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleCreateAccount = async () => {
    setIsCreating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/setup-petugas-account", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat akun")
      }

      setMessage({
        type: "success",
        text: "Akun petugas berhasil dibuat! Email: petugas@etilang.com, Password: root123",
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/petugas/login")
      }, 2000)
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Terjadi kesalahan",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">E-Tilang</h1>
          <p className="mt-2 text-gray-600">Setup Akun Petugas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Buat Akun Petugas</CardTitle>
            <CardDescription>Klik tombol di bawah untuk membuat akun petugas utama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-sm">
                <p className="font-semibold text-blue-900">Akun yang akan dibuat:</p>
                <ul className="mt-2 space-y-1 text-blue-700">
                  <li>• Email: petugas@etilang.com</li>
                  <li>• Password: root123</li>
                  <li>• Role: Petugas</li>
                </ul>
              </div>

              {message && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Button
                onClick={handleCreateAccount}
                disabled={isCreating || message?.type === "success"}
                className="w-full"
              >
                {isCreating ? "Membuat Akun..." : "Buat Akun Petugas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
