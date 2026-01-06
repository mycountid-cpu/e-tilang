"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const code = searchParams.get("code")

      if (!code) {
        console.log("[v0] No confirmation code found, redirecting to error")
        router.push("/auth/auth-code-error")
        return
      }

      try {
        const supabase = createClient()

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          console.log("[v0] Email confirmation error:", error.message)
          router.push("/auth/auth-code-error")
          return
        }

        if (data.user) {
          console.log("[v0] Email verified successfully for user:", data.user.id)
          router.push("/auth/register-success")
        }
      } catch (error) {
        console.log("[v0] Callback error:", error instanceof Error ? error.message : "Unknown error")
        router.push("/auth/auth-code-error")
      }
    }

    handleEmailConfirmation()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Memverifikasi email Anda...</p>
      </div>
    </div>
  )
}
