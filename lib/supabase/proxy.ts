import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[v0] Supabase not configured in middleware - skipping auth checks")
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user

  // Protect user and petugas routes
  if (request.nextUrl.pathname.startsWith("/user") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/user/login"
    return NextResponse.redirect(url)
  }

  if (request.nextUrl.pathname.startsWith("/petugas") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/petugas/login"
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role

    if (request.nextUrl.pathname.startsWith("/petugas") && role && role !== "petugas") {
      const url = request.nextUrl.clone()
      url.pathname = "/user/dashboard"
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith("/user") && role && role !== "user") {
      const url = request.nextUrl.clone()
      url.pathname = "/petugas/dashboard"
      return NextResponse.redirect(url)
    }

    if (user && request.nextUrl.pathname.startsWith("/auth")) {
      const role = user.user_metadata?.role
      const url = request.nextUrl.clone()
      url.pathname = role === "petugas" ? "/petugas/dashboard" : "/user/dashboard"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
