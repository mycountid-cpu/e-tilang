import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Use service role key to create admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create petugas user using admin API
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: "petugas@etilang.com",
      password: "petugas123",
      email_confirm: true,
      user_metadata: {
        role: "petugas",
        full_name: "Petugas Demo",
        nip: "123456789",
      },
    })

    if (createError) {
      // If user already exists, try to update password
      if (createError.message.includes("already been registered")) {
        // Get user by email
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = users?.users?.find((u) => u.email === "petugas@etilang.com")

        if (existingUser) {
          // Update password
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: "petugas123",
            email_confirm: true,
            user_metadata: {
              role: "petugas",
              full_name: "Petugas Demo",
              nip: "123456789",
            },
          })

          if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 })
          }

          // Update or create profile
          const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
            id: existingUser.id,
            nik: "123456789",
            full_name: "Petugas Demo",
            phone: "081234567890",
            role: "petugas",
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Profile error:", profileError)
          }

          return NextResponse.json({
            success: true,
            message: "Petugas account updated",
            email: "petugas@etilang.com",
            password: "petugas123",
          })
        }
      }
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Create profile for new user
    if (user?.user) {
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: user.user.id,
        nik: "123456789",
        full_name: "Petugas Demo",
        phone: "081234567890",
        role: "petugas",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile error:", profileError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Petugas account created",
      email: "petugas@etilang.com",
      password: "petugas123",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
