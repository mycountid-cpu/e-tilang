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

export default function UserLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const roleFromMetadata = data.user.user_metadata?.role

        if (roleFromMetadata && roleFromMetadata !== "user") {
          await supabase.auth.signOut()
          setError("Akun ini bukan akun masyarakat. Silakan gunakan portal petugas.")
          return
        }

        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        })

        router.push("/user/dashboard")
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat login"
      setError(errorMessage)
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
            <CardTitle className="text-2xl">Login Masyarakat</CardTitle>
            <CardDescription>Masuk ke akun Anda untuk melihat tilang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@etilang.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Belum punya akun?{" "}
                <Link
                  href="/auth/user/register"
                  className="font-medium text-blue-600 underline-offset-4 hover:underline"
                >
                  Daftar
                </Link>
              </div>
              <div className="mt-2 text-center text-sm">
                <Link href="/auth/petugas/login" className="text-gray-600 underline-offset-4 hover:underline">
                  Login sebagai Petugas
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
