import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function UserVehiclesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/user/login")

  let vehicles: any[] = []
  let errorMsg: string | null = null

  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Supabase error fetching vehicles:", error)
      if (error.code === "42P17") {
        errorMsg = "Terjadi kesalahan sistem (RLS recursion). Tim kami sedang memperbaikinya."
      } else {
        errorMsg = error.message
      }
    } else if (data) {
      vehicles = data
    }
  } catch (e) {
    console.error("[v0] Exception fetching vehicles:", e)
    errorMsg = "Gagal memuat data kendaraan."
  }

  return (
    <div className="space-y-8">
      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Kendaraan Saya</h1>
          <p className="mt-1 text-muted-foreground">Kelola daftar kendaraan yang terdaftar</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/user/vehicles/add">
            <Plus className="h-4 w-4" />
            Tambah Kendaraan
          </Link>
        </Button>
      </div>

      {/* Content */}
      {!vehicles || vehicles.length === 0 ? (
        /* Empty State */
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Car className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">Belum ada kendaraan</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Anda belum mendaftarkan kendaraan. Tambahkan kendaraan Anda untuk memulai.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link href="/user/vehicles/add">
                <Plus className="h-4 w-4" />
                Tambah Kendaraan
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Vehicle List */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{vehicle.plate_number}</h3>
                      <p className="text-sm text-muted-foreground">{vehicle.vehicle_type}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Merk</span>
                    <span className="font-medium text-foreground">{vehicle.brand}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Warna</span>
                    <span className="font-medium text-foreground">{vehicle.color}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Terdaftar {new Date(vehicle.created_at).toLocaleDateString("id-ID")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
