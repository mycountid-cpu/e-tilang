"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react"
import type { Ticket } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { toast } from "sonner"

function TicketsSkeleton() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-full md:w-48" />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ManageTicketsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    fetchTickets()
  }, [user, authLoading])

  useEffect(() => {
    filterTickets()
  }, [searchQuery, statusFilter, tickets])

  const fetchTickets = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("tickets")
      .select("*, vehicle:vehicles(*), violation:violations(*), user:profiles!tickets_user_id_fkey(*)")
      .order("ticket_date", { ascending: false })

    setTickets(data || [])
    setIsLoading(false)
  }

  const filterTickets = () => {
    let filtered = [...tickets]

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.vehicle?.plate_number.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTickets(filtered)
  }

  const handleVerifyPayment = async (ticketId: string, approve: boolean) => {
    setIsVerifying(true)
    const supabase = createClient()

    const updateData: any = {
      status: approve ? "paid" : "payment_rejected",
    }

    if (approve) {
      updateData.paid_at = new Date().toISOString()
    }

    const { error } = await supabase.from("tickets").update(updateData).eq("id", ticketId)

    setIsVerifying(false)

    if (!error) {
      toast.success(approve ? "Pembayaran disetujui" : "Pembayaran ditolak")
      setSelectedTicket(null)
      fetchTickets()
    } else {
      toast.error("Gagal memverifikasi: " + error.message)
    }
  }

  const handleStatusUpdate = async (ticketId: string, newStatus: "paid" | "unpaid") => {
    const supabase = createClient()
    const updateData: { status: string; paid_at?: string; payment_method?: string } = {
      status: newStatus,
    }

    if (newStatus === "paid") {
      updateData.paid_at = new Date().toISOString()
      updateData.payment_method = "Manual Update"
    }

    const { error } = await supabase.from("tickets").update(updateData).eq("id", ticketId)

    if (!error) {
      fetchTickets()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Lunas
          </Badge>
        )
      case "pending_confirmation":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="mr-1 h-3 w-3" />
            Perlu Verifikasi
          </Badge>
        )
      case "payment_rejected":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Ditolak
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <XCircle className="mr-1 h-3 w-3" />
            Belum Dibayar
          </Badge>
        )
    }
  }

  if (authLoading || isLoading) return <TicketsSkeleton />

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Kelola Tilang</h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">Daftar semua tilang yang telah dibuat</p>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-4 md:pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari kode, nama, atau plat..."
                className="h-11 pl-10 md:h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full md:h-10 md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="unpaid">Belum Dibayar</SelectItem>
                <SelectItem value="pending_confirmation">Perlu Verifikasi</SelectItem>
                <SelectItem value="paid">Sudah Dibayar</SelectItem>
                <SelectItem value="payment_rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base font-semibold md:text-lg">Daftar Tilang</CardTitle>
          <CardDescription className="text-xs md:text-sm">Total: {filteredTickets.length} tilang</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center md:py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted md:h-16 md:w-16">
                <FileText className="h-7 w-7 text-muted-foreground md:h-8 md:w-8" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Tidak ada tilang ditemukan</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredTickets.map((ticket: Ticket) => (
                <div key={ticket.id} className="rounded-lg border border-border p-3 md:p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground md:text-base">{ticket.ticket_code}</p>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="grid gap-1 text-xs md:text-sm">
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Pelanggar:</span> {ticket.user?.full_name}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Kendaraan:</span> {ticket.vehicle?.plate_number}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Pelanggaran:</span> {ticket.violation?.name}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-foreground">Lokasi:</span> {ticket.location}
                        </p>
                        <p className="text-[10px] text-muted-foreground md:text-xs">
                          {new Date(ticket.ticket_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3 md:flex-col md:items-end md:gap-2 md:border-0 md:pt-0">
                      <p className="text-lg font-bold text-foreground md:text-xl">
                        Rp {ticket.fine_amount.toLocaleString("id-ID")}
                      </p>
                      {ticket.status === "pending_confirmation" ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                          className="h-9 min-w-[120px] gap-1.5 bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Eye className="h-4 w-4" />
                          Verifikasi
                        </Button>
                      ) : ticket.status === "unpaid" || ticket.status === "payment_rejected" ? (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(ticket.id, "paid")}
                          className="h-9 min-w-[120px] gap-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Tandai Lunas
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(ticket.id, "unpaid")}
                          className="h-9 min-w-[120px] gap-1.5"
                        >
                          <XCircle className="h-4 w-4" />
                          Batalkan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Verifikasi Pembayaran</DialogTitle>
            <DialogDescription>Periksa bukti pembayaran dan setujui atau tolak transaksi</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kode Tilang:</span>
                  <span className="font-medium">{selectedTicket.ticket_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggar:</span>
                  <span className="font-medium">{selectedTicket.user?.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nominal:</span>
                  <span className="font-bold text-blue-600">
                    Rp {selectedTicket.fine_amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {selectedTicket.payment_proof_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Bukti Pembayaran:</p>
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border-2 border-gray-200">
                    <Image
                      src={selectedTicket.payment_proof_url || "/placeholder.svg"}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleVerifyPayment(selectedTicket.id, false)}
                  disabled={isVerifying}
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" /> Tolak
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleVerifyPayment(selectedTicket.id, true)}
                  disabled={isVerifying}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Setujui
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
