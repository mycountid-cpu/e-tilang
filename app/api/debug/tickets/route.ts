import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get latest tickets with their evidence status
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("id, ticket_code, evidence_photo_url, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const summary = {
      total: tickets?.length || 0,
      with_evidence: tickets?.filter((t) => t.evidence_photo_url).length || 0,
      without_evidence: tickets?.filter((t) => !t.evidence_photo_url).length || 0,
      tickets: tickets,
    }

    return NextResponse.json(summary)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
