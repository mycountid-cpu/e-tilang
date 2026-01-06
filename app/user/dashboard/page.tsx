"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Car, FileText, AlertCircle, CheckCircle2, Bell, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

type TicketWithRelations = {
  id: string
  ticket_code: string
  ticket_date: string
  location: string
  fine_amount: number
  status: string
  vehicle: { plate_number: string } | null
  violation: { name: string } | null
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className={cn("shadow-sm", i === 2 && "col-span-2 lg:col-span-1")}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-8 w-12" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [profileName, setProfileName] = useState("")
  const [stats, setStats] = useState({ vehicles: 0, tickets: 0, unpaid: 0, pending: 0 })
  const [recentTickets, setRecentTickets] = useState<TicketWithRelations[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/user/login")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()

      if (profileError || !profileData) {
        router.replace("/auth/user/login")
        return
      }

      if (profileData.role !== "user") {
        await supabase.auth.signOut()
        router.replace("/auth/user/login")
        return
      }

      setProfileName(profileData.full_name || user.user_metadata?.full_name || "User")

      const [vehiclesRes, ticketsRes] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase
          .from("tickets")
          .select(
            "id, ticket_code, ticket_date, location, fine_amount, status, vehicle:vehicles(plate_number), violation:violations(name)",
          )
          .eq("user_id", user.id)
          .order("ticket_date", { ascending: false })
          .limit(5),
      ])

      const tickets = (ticketsRes.data || []) as TicketWithRelations[]

      const { count: unpaidCount } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "unpaid")

      const { count: pendingCount } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending_confirmation")

      const { count: totalTickets } = await supabase
        .from("tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)

      setStats({
        vehicles: vehiclesRes.count || 0,
        tickets: totalTickets || 0,
        unpaid: unpaidCount || 0,
        pending: pendingCount || 0,
      })

      setRecentTickets(tickets)
      setError(null)
    } catch (err) {
      console.error("[v0] Dashboard load error:", err)
      setError("Gagal memuat data dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => loadData()} className="mt-4 w-full">
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Selamat datang kembali, {profileName}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Total Kendaraan</p>
                <p className="mt-1 text-2xl font-bold text-foreground md:mt-2 md:text-3xl">{stats.vehicles}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
                <Car className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Total Tilang</p>
                <p className="mt-1 text-2xl font-bold text-foreground md:mt-2 md:text-3xl">{stats.tickets}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted md:h-12 md:w-12">
                <FileText className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 shadow-sm lg:col-span-1">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Belum Dibayar</p>
                <p
                  className={cn(
                    "mt-1 text-2xl font-bold md:mt-2 md:text-3xl",
                    stats.unpaid > 0 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {stats.unpaid}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-12 md:w-12",
                  stats.unpaid > 0 ? "bg-destructive/10" : "bg-success/10",
                )}
              >
                {stats.unpaid > 0 ? (
                  <AlertCircle className="h-5 w-5 text-destructive md:h-6 md:w-6" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success md:h-6 md:w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4 md:items-center md:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-200 md:h-10 md:w-10">
              <Clock className="h-4 w-4 text-yellow-900 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-yellow-900 md:text-base">
                {stats.pending} pembayaran sedang diverifikasi
              </p>
              <p className="mt-0.5 text-xs text-yellow-800 md:text-sm">
                Bukti pembayaran Anda sedang diperiksa oleh petugas
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.unpaid > 0 && (
        <Card className="border-warning/50 bg-warning/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4 md:items-center md:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/20 md:h-10 md:w-10">
              <Bell className="h-4 w-4 text-warning-foreground md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-warning-foreground md:text-base">
                Anda memiliki {stats.unpaid} tilang belum dibayar
              </p>
              <p className="mt-0.5 text-xs text-warning-foreground/80 md:text-sm">
                Segera lakukan pembayaran untuk menghindari denda tambahan
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 md:hidden">
        <Button asChild className="flex-1 gap-2" size="lg">
          <Link href="/user/vehicles/add">
            <Car className="h-4 w-4" />
            Tambah Kendaraan
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 gap-2 bg-transparent" size="lg">
          <Link href="/user/tickets">
            <FileText className="h-4 w-4" />
            Lihat Tilang
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold md:text-lg">Tilang Terbaru</CardTitle>
              <CardDescription className="text-xs md:text-sm">5 tilang terakhir Anda</CardDescription>
            </div>
            {recentTickets.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="hidden gap-1 md:flex">
                <Link href="/user/tickets">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center md:py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 md:h-16 md:w-16">
                <CheckCircle2 className="h-7 w-7 text-success md:h-8 md:w-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground md:text-lg">Tidak ada tilang</h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground md:text-sm">
                Anda belum memiliki catatan tilang. Tetap patuhi aturan lalu lintas!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between md:p-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground md:text-base">{ticket.ticket_code}</p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          ticket.status === "paid"
                            ? "bg-success/10 text-success"
                            : ticket.status === "pending_confirmation"
                              ? "bg-yellow-100 text-yellow-700"
                              : ticket.status === "payment_rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {ticket.status === "paid"
                          ? "Lunas"
                          : ticket.status === "pending_confirmation"
                            ? "Diverifikasi"
                            : ticket.status === "payment_rejected"
                              ? "Ditolak"
                              : "Belum Dibayar"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">{ticket.violation?.name}</p>
                    <p className="text-[10px] text-muted-foreground md:text-xs">
                      {new Date(ticket.ticket_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {ticket.location}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:text-right">
                    <span className="text-xs text-muted-foreground md:hidden">{ticket.vehicle?.plate_number}</span>
                    <p className="text-base font-bold text-foreground md:text-lg">
                      Rp {ticket.fine_amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full md:hidden bg-transparent">
                <Link href="/user/tickets">
                  Lihat Semua Tilang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
