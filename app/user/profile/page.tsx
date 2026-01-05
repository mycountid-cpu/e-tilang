import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, CreditCard, Pencil, MapPin } from "lucide-react"

export default async function UserProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/user/login")

  const profile = {
    full_name: user.user_metadata?.full_name || "User",
    nik: user.user_metadata?.nik || "-",
    phone: user.user_metadata?.phone || "-",
    address: user.user_metadata?.address || "-",
  }

  // Get initials for avatar
  const initials =
    profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profil Saya</h1>
        <p className="mt-1 text-muted-foreground">Informasi data pribadi Anda</p>
      </div>

      {/* Profile Card */}
      <Card className="mx-auto max-w-2xl shadow-sm">
        <CardContent className="p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">{profile.full_name}</h2>
            <p className="text-sm text-muted-foreground">Masyarakat</p>
          </div>

          {/* Profile Fields */}
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nama Lengkap
                  </Label>
                  <p className="mt-0.5 font-medium text-foreground">{profile.full_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">NIK</Label>
                  <p className="mt-0.5 font-medium text-foreground">{profile.nik}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                  <p className="mt-0.5 font-medium text-foreground">{user.email || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nomor HP</Label>
                  <p className="mt-0.5 font-medium text-foreground">{profile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Alamat</Label>
                  <p className="mt-0.5 font-medium text-foreground">{profile.address}</p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex justify-center pt-4">
              <Button className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profil
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
