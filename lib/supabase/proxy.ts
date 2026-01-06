import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

  // Protect user and petugas routes - redirect to login if not authenticated
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

  // Only enforce role-based route access for protected routes
  if (user) {
    const role = user.user_metadata?.role

    // Redirect to wrong portal - petugas accessing user routes
    if (request.nextUrl.pathname.startsWith("/user") && role && role !== "user") {
      const url = request.nextUrl.clone()
      url.pathname = "/user/dashboard"
      return NextResponse.redirect(url)
    }

    // Redirect to wrong portal - user accessing petugas routes
    if (request.nextUrl.pathname.startsWith("/petugas") && role && role !== "petugas") {
      const url = request.nextUrl.clone()
      url.pathname = "/petugas/dashboard"
      return NextResponse.redirect(url)
    }

    // Only redirect from /auth routes if they're specifically mismatched
    if (request.nextUrl.pathname.startsWith("/auth/petugas") && role && role !== "petugas") {
      // Petugas user trying to access user login
      const url = request.nextUrl.clone()
      url.pathname = "/petugas/dashboard"
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname.startsWith("/auth/user") && role && role !== "user") {
      // User trying to access petugas login
      const url = request.nextUrl.clone()
      url.pathname = "/user/dashboard"
      return NextResponse.redirect(url)
    }

    // Don't force redirect from homepage or unrelated pages
  }

  return supabaseResponse
}
