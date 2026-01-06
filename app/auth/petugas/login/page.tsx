"use client"

import type React from "react"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PetugasLoginPage() {
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
      console.log("[v0] Login attempt with email:", email)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Sign in response - error:", signInError, "data:", data)

      if (signInError) {
        console.log("[v0] Sign in error occurred:", signInError.message)
        if (signInError.message === "Invalid login credentials") {
          throw new Error("Email atau password salah")
        }
        throw signInError
      }

      if (data.user) {
        console.log("[v0] User signed in successfully:", data.user.id)
        const roleFromMetadata = data.user.user_metadata?.role

        if (!roleFromMetadata) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.user.id)
              .single()

            console.log("[v0] Profile query result - error:", profileError, "profile:", profile)

            if (profileError) {
              console.log("[v0] Profile query failed, continuing with metadata role check")
            }

            if (profile && profile.role !== "petugas") {
              await supabase.auth.signOut()
              setError("Akun ini bukan akun petugas. Silakan gunakan portal masyarakat.")
              return
            }
          } catch (profileErr) {
            console.log("[v0] Profile check failed silently, allowing login to proceed")
          }
        } else if (roleFromMetadata !== "petugas") {
          await supabase.auth.signOut()
          setError("Akun ini bukan akun petugas. Silakan gunakan portal masyarakat.")
          return
        }
      }

      console.log("[v0] Login successful, redirecting to dashboard")
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      })

      router.replace("/petugas/dashboard")
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan saat login"
      console.log("[v0] Login error caught:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <Link
        href="/"
        title="Halaman Utama"
        className="absolute left-6 top-6 group inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/80 backdrop-blur-sm text-blue-700 hover:bg-blue-700 hover:text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900">E-Tilang</h1>
          <p className="mt-2 text-gray-600">Portal Petugas</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login Petugas</CardTitle>
            <CardDescription>Masuk ke sistem untuk mengelola tilang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="petugas@etilang.com"
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
                <Link href="/auth/user/login" className="text-gray-600 underline-offset-4 hover:underline">
                  Login sebagai Masyarakat
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
