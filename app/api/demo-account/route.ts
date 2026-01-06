import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// API route to create demo accounts using admin API (bypasses rate limiting and email confirmation)
export async function POST(request: Request) {
  try {
    const { type } = await request.json()

    if (!type || !["masyarakat", "petugas"].includes(type)) {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 })
    }

    // Use service role key to create admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { error: tableCheckError } = await supabaseAdmin.from("profiles").select("id").limit(1)

    if (tableCheckError && tableCheckError.code === "PGRST204") {
      // Table doesn't exist - still continue with auth user creation
      console.log("Profiles table not found, will create user without profile")
    }

    const email = type === "masyarakat" ? "demo.masyarakat@gmail.com" : "demo.petugas@gmail.com"
    const password = "demo123456"
    const role = type === "masyarakat" ? "user" : "petugas"
    const nik = type === "masyarakat" ? "3201010101010001" : "3201020202020002"
    const fullName = type === "masyarakat" ? "Demo Masyarakat" : "Demo Petugas"
    const address = type === "masyarakat" ? "Jl. Demo Masyarakat No. 1, Jakarta" : "Polres Jakarta Pusat"
    const phone = type === "masyarakat" ? "081234567890" : "081298765432"

    // Check if user already exists by listing users
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u) => u.email === email)

    if (existingUser) {
      // User exists - update password and confirm email
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: password,
        email_confirm: true,
        user_metadata: {
          role: role,
          nik: nik,
          full_name: fullName,
          address: address,
          phone: phone,
        },
      })

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 })
      }

      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: existingUser.id,
        nik: nik,
        full_name: fullName,
        address: address,
        phone: phone,
        role: role,
        updated_at: new Date().toISOString(),
      })

      // Log profile error but don't fail - auth user is still valid
      if (profileError) {
        console.log("Profile upsert error (table may not exist):", profileError.message)
      }

      return NextResponse.json({
        success: true,
        message: `Akun ${type} sudah ada dan telah diperbarui`,
        email: email,
        password: password,
        exists: true,
        profileCreated: !profileError,
      })
    }

    // Create new user with email_confirm: true (no email verification needed)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email - no verification needed
      user_metadata: {
        role: role,
        nik: nik,
        full_name: fullName,
        address: address,
        phone: phone,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    let profileCreated = false
    if (newUser?.user) {
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: newUser.user.id,
        nik: nik,
        full_name: fullName,
        address: address,
        phone: phone,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      profileCreated = !profileError
      if (profileError) {
        console.log("Profile creation error (table may not exist):", profileError.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${type} berhasil dibuat`,
      email: email,
      password: password,
      exists: false,
      profileCreated,
    })
  } catch (error) {
    console.error("Demo account setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
