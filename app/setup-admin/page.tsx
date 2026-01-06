"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    email?: string
    password?: string
  } | null>(null)

  const setupPetugas = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/setup-petugas", { method: "POST" })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to setup petugas account" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">Setup Akun Admin</CardTitle>
          <CardDescription>Buat akun petugas untuk aplikasi E-Tilang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={setupPetugas} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Akun...
              </>
            ) : (
              "Buat Akun Petugas"
            )}
          </Button>

          {result?.success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <p className="font-medium">{result.message}</p>
                <div className="mt-2 p-3 bg-white rounded border text-sm">
                  <p>
                    <strong>Email:</strong> {result.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {result.password}
                  </p>
                </div>
                <p className="mt-2 text-sm">
                  Silakan login di halaman{" "}
                  <a href="/auth/petugas/login" className="text-blue-600 underline">
                    Login Petugas
                  </a>
                </p>
              </AlertDescription>
            </Alert>
          )}

          {result?.error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{result.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
