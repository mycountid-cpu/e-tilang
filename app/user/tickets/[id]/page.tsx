import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, Car, FileText, ShieldCheck, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PaymentSection } from "@/components/payment-section"

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/user/login")

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, vehicle:vehicles(*), violation:violations(*), petugas:profiles!tickets_petugas_id_fkey(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (!ticket) notFound()

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/user/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Detail Tilang</h1>
        <p className="mt-2 text-gray-600">Informasi lengkap tilang Anda</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{ticket.ticket_code}</CardTitle>
                  <CardDescription className="mt-2">
                    <Badge
                      variant={ticket.status === "paid" ? "default" : "destructive"}
                      className={
                        ticket.status === "paid"
                          ? "bg-green-600"
                          : ticket.status === "pending_confirmation"
                            ? "bg-yellow-600"
                            : ticket.status === "payment_rejected"
                              ? "bg-red-600"
                              : ""
                      }
                    >
                      {ticket.status === "paid"
                        ? "Lunas"
                        : ticket.status === "pending_confirmation"
                          ? "Menunggu Verifikasi"
                          : ticket.status === "payment_rejected"
                            ? "Pembayaran Ditolak"
                            : "Belum Dibayar"}
                    </Badge>
                  </CardDescription>
                </div>
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pelanggaran</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">{ticket.violation?.name}</p>
                <p className="mt-1 text-sm text-gray-600">{ticket.violation?.article}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Kendaraan</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">{ticket.vehicle?.plate_number}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {ticket.vehicle?.vehicle_type} • {ticket.vehicle?.brand}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Tilang</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      {new Date(ticket.ticket_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Lokasi</p>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{ticket.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Petugas</p>
                <div className="mt-1 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                  <p className="font-medium text-gray-900">{ticket.petugas?.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Photo */}
          {ticket.evidence_photo_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Bukti Foto Pelanggaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={ticket.evidence_photo_url || "/placeholder.svg"}
                    alt="Evidence"
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Section */}
        <div>
          <Card className={ticket.status === "unpaid" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <CardHeader>
              <CardTitle>Rincian Denda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Denda Tilang:</span>
                  <span className="font-medium text-gray-900">Rp {ticket.fine_amount.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rp {ticket.fine_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <PaymentSection
                ticketId={ticket.id}
                fineAmount={ticket.fine_amount}
                status={ticket.status}
                paidAt={ticket.paid_at}
                paymentMethod={ticket.payment_method}
                paymentProofUrl={ticket.payment_proof_url}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
