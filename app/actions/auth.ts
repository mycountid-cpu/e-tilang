"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function changePassword(currentPassword: string, newPassword: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById((await supabase.auth.getUser()).data.user?.id || "")

    if (userError || !user) {
      return { error: "Pengguna tidak ditemukan" }
    }

    // Verify current password by attempting sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password: currentPassword,
    })

    if (signInError) {
      return { error: "Password saat ini salah" }
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    return { success: true }
  } catch (error) {
    return { error: "Terjadi kesalahan saat mengubah password" }
  }
}
