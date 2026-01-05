"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Ticket } from "@/lib/types"

function TicketsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UserTicketsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    async function loadData() {
      const supabase = createClient()
      const { data } = await supabase
        .from("tickets")
        .select("*, vehicle:vehicles(*), violation:violations(*)")
        .eq("user_id", user!.id)
        .order("ticket_date", { ascending: false })

      setTickets(data || [])
      setIsLoading(false)
    }

    loadData()
  }, [user, authLoading])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="h-3 w-3" />
            Lunas
          </span>
        )
      case "pending_confirmation":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
            <Clock className="h-3 w-3" />
            Verifikasi
          </span>
        )
      case "payment_rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            <XCircle className="h-3 w-3" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
            <AlertCircle className="h-3 w-3" />
            Belum Dibayar
          </span>
        )
    }
  }

  if (authLoading || isLoading) return <TicketsSkeleton />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Tilang Saya</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Daftar semua tilang dan status pembayaran</p>
      </div>

      {tickets.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">Tidak ada tilang</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Anda belum memiliki catatan tilang. Tetap patuhi aturan lalu lintas!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Daftar Tilang ({tickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket: Ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{ticket.ticket_code}</p>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{ticket.violation?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.ticket_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {ticket.vehicle?.plate_number}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                    <p className="text-lg font-bold text-foreground">Rp {ticket.fine_amount.toLocaleString("id-ID")}</p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/user/tickets/${ticket.id}`}>Detail</Link>
                      </Button>
                      {(ticket.status === "unpaid" || ticket.status === "payment_rejected") && (
                        <Button asChild size="sm">
                          <Link href={`/user/tickets/${ticket.id}`}>
                            {ticket.status === "payment_rejected" ? "Upload Ulang" : "Bayar"}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
