"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, CheckCircle, XCircle, TrendingUp, Plus, ArrowRight, Clock, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type TicketWithRelations = {
  id: string
  ticket_code: string
  ticket_date: string
  location: string
  fine_amount: number
  status: string
  vehicle: { plate_number: string } | null
  violation: { name: string } | null
  user: { full_name: string } | null
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="mt-2 h-8 w-12" />
                  <Skeleton className="mt-1 h-3 w-16" />
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
          <Skeleton className="h-4 w-48" />
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

export default function PetugasDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profileName, setProfileName] = useState("")
  const [stats, setStats] = useState({ total: 0, today: 0, paid: 0, unpaid: 0, pending: 0 })
  const [recentTickets, setRecentTickets] = useState<TicketWithRelations[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    async function loadData() {
      const supabase = createClient()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [profileRes, allTicketsRes, todayTicketsRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user!.id).single(),
        supabase.from("tickets").select("id, status"),
        supabase.from("tickets").select("id").gte("ticket_date", today.toISOString()),
        supabase
          .from("tickets")
          .select(
            "id, ticket_code, ticket_date, location, fine_amount, status, vehicle:vehicles(plate_number), violation:violations(name), user:profiles!tickets_user_id_fkey(full_name)",
          )
          .order("ticket_date", { ascending: false })
          .limit(5),
      ])

      setProfileName(profileRes.data?.full_name || user!.user_metadata?.full_name || "Petugas")

      const allTickets = allTicketsRes.data || []
      setStats({
        total: allTickets.length,
        today: todayTicketsRes.data?.length || 0,
        paid: allTickets.filter((t) => t.status === "paid").length,
        unpaid: allTickets.filter((t) => t.status === "unpaid").length,
        pending: allTickets.filter((t) => t.status === "pending_confirmation").length,
      })

      setRecentTickets((recentRes.data || []) as TicketWithRelations[])
      setIsLoading(false)
    }

    loadData()
  }, [user, authLoading])

  if (authLoading || isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Dashboard Petugas</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Selamat datang, {profileName}</p>
      </div>

      <Button asChild size="lg" className="w-full gap-2 md:hidden">
        <Link href="/petugas/tickets/create">
          <Plus className="h-5 w-5" />
          Buat Tilang Baru
        </Link>
      </Button>

      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4 md:items-center md:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-200 md:h-10 md:w-10">
              <Bell className="h-4 w-4 text-yellow-900 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-yellow-900 md:text-base">
                {stats.pending} pembayaran menunggu verifikasi
              </p>
              <p className="mt-0.5 text-xs text-yellow-800 md:text-sm">
                Periksa bukti pembayaran dan verifikasi transaksi
              </p>
            </div>
            <Button asChild size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              <Link href="/petugas/tickets">Verifikasi Sekarang</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Total Tilang</p>
                <p className="mt-1 text-2xl font-bold text-foreground md:mt-2 md:text-3xl">{stats.total}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">Semua waktu</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted md:h-12 md:w-12">
                <FileText className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Hari Ini</p>
                <p className="mt-1 text-2xl font-bold text-primary md:mt-2 md:text-3xl">{stats.today}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">Tilang baru</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
                <TrendingUp className="h-5 w-5 text-primary md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Lunas</p>
                <p className="mt-1 text-2xl font-bold text-success md:mt-2 md:text-3xl">{stats.paid}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">Sudah dibayar</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/10 md:h-12 md:w-12">
                <CheckCircle className="h-5 w-5 text-success md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Belum Lunas</p>
                <p className="mt-1 text-2xl font-bold text-destructive md:mt-2 md:text-3xl">{stats.unpaid}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">Menunggu</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 md:h-12 md:w-12">
                <XCircle className="h-5 w-5 text-destructive md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">Menunggu Verifikasi</p>
                <p className="mt-1 text-2xl font-bold text-warning md:mt-2 md:text-3xl">{stats.pending}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground md:text-xs">Belum diverifikasi</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 md:h-12 md:w-12">
                <Clock className="h-5 w-5 text-warning md:h-6 md:w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold md:text-lg">Tilang Terbaru</CardTitle>
              <CardDescription className="text-xs md:text-sm">5 tilang terakhir yang dibuat</CardDescription>
            </div>
            {recentTickets.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="hidden gap-1 md:flex">
                <Link href="/petugas/tickets">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted md:h-16 md:w-16">
                <FileText className="h-7 w-7 text-muted-foreground md:h-8 md:w-8" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Belum ada tilang dibuat</p>
              <Button asChild className="mt-4 gap-2">
                <Link href="/petugas/tickets/create">
                  <Plus className="h-4 w-4" />
                  Buat Tilang Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between md:p-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground md:text-base">{ticket.ticket_code}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          ticket.status === "paid"
                            ? "bg-success/10 text-success"
                            : ticket.status === "pending_confirmation"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {ticket.status === "paid" ? "Lunas" : ticket.status === "pending_confirmation" ? "Menunggu Verifikasi" : "Belum Dibayar"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      {ticket.user?.full_name} • {ticket.vehicle?.plate_number}
                    </p>
                    <p className="text-[10px] text-muted-foreground md:text-xs">
                      {new Date(ticket.ticket_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end md:text-right">
                    <p className="text-xs text-muted-foreground md:text-sm">{ticket.violation?.name}</p>
                    <p className="text-base font-bold text-foreground md:text-lg">
                      Rp {ticket.fine_amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full md:hidden bg-transparent">
                <Link href="/petugas/tickets">
                  Kelola Semua Tilang
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
