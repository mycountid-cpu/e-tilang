import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default async function ViolationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/petugas/login")

  const { data: violations } = await supabase.from("violations").select("*").order("name", { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Pelanggaran</h1>
        <p className="mt-2 text-gray-600">Master data jenis pelanggaran lalu lintas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {violations?.map((violation) => (
          <Card key={violation.id}>
            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span className="flex-1">{violation.name}</span>
                <AlertCircle className="h-5 w-5 text-red-500" />
              </CardTitle>
              <CardDescription>{violation.article}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Denda Maksimal:</span>
                <span className="text-xl font-bold text-gray-900">Rp {violation.max_fine.toLocaleString("id-ID")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
