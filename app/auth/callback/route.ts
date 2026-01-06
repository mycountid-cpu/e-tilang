import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/user/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get user to check role
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const role = user.user_metadata?.role

        console.log("[v0] Auth callback - user role:", role) // <CHANGE> Added debug logging

        // Redirect based on role
        if (role === "petugas") {
          console.log("[v0] Redirecting to petugas dashboard") // <CHANGE> Added debug logging
          return NextResponse.redirect(`${origin}/petugas/dashboard`)
        }
        console.log("[v0] Redirecting to user dashboard") // <CHANGE> Added debug logging
        return NextResponse.redirect(`${origin}/user/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("[v0] Auth code exchange error:", error) // <CHANGE> Added error logging
    }
  }

  // Return to error page if code exchange fails
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
