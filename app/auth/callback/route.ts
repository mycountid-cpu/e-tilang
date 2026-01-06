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

        if (role === "petugas") {
          return NextResponse.redirect(`${origin}/petugas/dashboard`)
        }
        return NextResponse.redirect(`${origin}/user/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
