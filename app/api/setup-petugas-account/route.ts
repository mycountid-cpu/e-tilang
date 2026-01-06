import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Create admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create petugas user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "petugas@etilang.com",
      password: "root123",
      email_confirm: true,
      user_metadata: {
        role: "petugas",
        full_name: "Petugas E-Tilang",
      },
    })

    if (authError) {
      console.error("[v0] Error creating petugas account:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("[v0] Petugas account created successfully:", authData.user.id)

    return NextResponse.json({
      success: true,
      message: "Akun petugas berhasil dibuat",
      userId: authData.user.id,
    })
  } catch (error: any) {
    console.error("[v0] Setup petugas account error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
