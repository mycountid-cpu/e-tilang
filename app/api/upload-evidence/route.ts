import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const petugasId = formData.get("petugas_id") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!bucket) {
      return NextResponse.json({ error: "No bucket specified" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Cookies can throw in middleware
          }
        },
      },
    })

    const fileExt = file.name.split(".").pop()
    const uniqueId = uuidv4()
    const fileName = `${uniqueId}-${Date.now()}.${fileExt}`
    const filePath = `${bucket === "evidence" ? "evidence" : "payment-proofs"}/${fileName}`

    const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("[v0] Storage upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)

    console.log("[v0] File uploaded successfully:", filePath)
    return NextResponse.json({ publicUrl, path: filePath })
  } catch (error: any) {
    console.error("[v0] Upload API error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
