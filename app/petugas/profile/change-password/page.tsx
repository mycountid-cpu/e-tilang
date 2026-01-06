"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { changePassword } from "@/app/actions/auth"
import { Eye, EyeOff } from "lucide-react"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi
      if (!currentPassword || !newPassword || !confirmPassword) {
        triggerVibration()
        toast({
          title: "Error",
          description: "Semua field harus diisi",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        triggerVibration()
        toast({
          title: "Error",
          description: "Password baru tidak cocok",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (newPassword.length < 8) {
        triggerVibration()
        toast({
          title: "Error",
          description: "Password minimal 8 karakter",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const result = await changePassword(currentPassword, newPassword)

      if (result.error) {
        triggerVibration()
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Password berhasil diubah",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        router.push("/petugas/dashboard")
      }
    } catch (error) {
      triggerVibration()
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Password Saat Ini</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password Baru</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Masukkan password baru (min 8 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Konfirmasi Password Baru</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Konfirmasi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Memproses..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
