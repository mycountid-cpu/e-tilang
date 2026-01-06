"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Download, QrCode, Upload, CheckCircle, XCircle, Clock } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentSectionProps {
  ticketId: string
  fineAmount: number
  status: string
  paidAt: string | null
  paymentMethod: string | null
  paymentProofUrl?: string | null
}

const QR_MAPPING: Record<number, string> = {
  250000: "/images/250.jpg",
  500000: "/images/500.jpg",
  1000000: "/images/1.jpg",
}

export function PaymentSection({
  ticketId,
  fineAmount,
  status,
  paidAt,
  paymentMethod,
  paymentProofUrl,
}: PaymentSectionProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDownloadQR = async () => {
    try {
      const qrUrl = QR_MAPPING[fineAmount] || QR_MAPPING[500000]
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `QR-DANA-Tilang-${fineAmount}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("QR Code berhasil diunduh!")
    } catch (err) {
      toast.error("Gagal mengunduh QR Code")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error("Format file harus JPG atau PNG")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB")
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUploadProof = async () => {
    if (!selectedFile) {
      toast.error("Pilih foto bukti pembayaran terlebih dahulu")
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    try {
      console.log("[v0] Starting payment proof upload for ticket:", ticketId)

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split(".").pop()
      const fileName = `${ticketId}-${Date.now()}.${fileExt}`
      const filePath = `payment-proofs/${fileName}`

      console.log("[v0] Uploading file to storage:", filePath)
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(filePath, selectedFile)

      if (uploadError) {
        console.log("[v0] Storage upload error:", uploadError)
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath)

      console.log("[v0] Generated public URL:", publicUrl)

      const { error: updateError } = await supabase
        .from("tickets")
        .update({
          payment_proof_url: publicUrl,
          status: "pending_confirmation",
          payment_method: "DANA (QR Scan)",
          paid_at: new Date().toISOString(),
        })
        .eq("id", ticketId)

      if (updateError) {
        console.log("[v0] Database update error:", updateError)
        throw updateError
      }

      console.log("[v0] Payment proof uploaded successfully and ticket updated")
      toast.success("Bukti pembayaran berhasil diunggah! Menunggu verifikasi petugas.")
      setIsOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      router.refresh()
    } catch (error: any) {
      console.log("[v0] Upload error:", error.message)
      toast.error("Gagal mengunggah bukti: " + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  if (status === "paid") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">Pembayaran Berhasil</p>
            <p className="mt-1 text-xs text-green-700">
              Dibayar: {paidAt && new Date(paidAt).toLocaleDateString("id-ID")}
            </p>
            {paymentMethod && <p className="text-xs text-green-700">Via: {paymentMethod}</p>}
          </div>
        </div>
      </div>
    )
  }

  if (status === "pending_confirmation") {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900">Menunggu Verifikasi</p>
            <p className="mt-1 text-xs text-yellow-700">Bukti pembayaran Anda sedang diverifikasi oleh petugas</p>
          </div>
        </div>
        {paymentProofUrl && (
          <div className="mt-3">
            <p className="text-xs font-medium text-yellow-900 mb-2">Bukti yang diunggah:</p>
            <div className="relative h-32 w-full overflow-hidden rounded-lg border-2 border-yellow-200">
              <Image
                src={paymentProofUrl || "/placeholder.svg"}
                alt="Bukti Pembayaran"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  if (status === "payment_rejected") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Pembayaran Ditolak</p>
              <p className="mt-1 text-xs text-red-700">
                Bukti pembayaran Anda ditolak. Silakan unggah bukti yang valid.
              </p>
            </div>
          </div>
        </div>
        {/* Allow re-upload after rejection */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start border-blue-200 bg-blue-50/50 hover:bg-blue-50">
              <Upload className="mr-2 h-4 w-4 text-blue-600" />
              Upload Ulang Bukti Pembayaran
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Bukti Pembayaran DANA</DialogTitle>
              <DialogDescription>
                Upload screenshot/foto bukti transfer DANA sebesar{" "}
                <span className="font-bold text-gray-900">Rp {fineAmount.toLocaleString("id-ID")}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="payment-proof">Pilih Foto Bukti</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">Format: JPG/PNG, Maksimal 5MB</p>
              </div>
              {previewUrl && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg border-2 border-gray-200">
                  <Image
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview Bukti Pembayaran"
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <Button
              onClick={handleUploadProof}
              disabled={!selectedFile || isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Bukti Pembayaran
                </>
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white border p-3">
        <p className="mb-2 text-sm font-medium text-gray-700">Metode Pembayaran</p>
        <div className="space-y-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start border-blue-200 bg-blue-50/50 hover:bg-blue-50">
                <QrCode className="mr-2 h-4 w-4 text-blue-600" />
                Bayar via DANA (Scan QR)
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Pembayaran via DANA</DialogTitle>
                <DialogDescription>
                  Scan QR code di bawah ini menggunakan aplikasi DANA, lalu upload bukti pembayaran
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center space-y-4 py-4">
                {/* QR Code Display */}
                <div className="relative h-64 w-64 overflow-hidden rounded-xl border-4 border-white shadow-lg bg-white">
                  <Image
                    src={QR_MAPPING[fineAmount] || QR_MAPPING[500000]}
                    alt={`DANA QR Code Rp ${fineAmount}`}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Total Tagihan:</p>
                  <p className="text-2xl font-bold text-blue-600">Rp {fineAmount.toLocaleString("id-ID")}</p>
                  <p className="text-xs text-muted-foreground mt-1">*Nominal tidak dapat diubah</p>
                </div>

                <Button variant="outline" onClick={handleDownloadQR} className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR DANA
                </Button>

                {/* Upload Proof Section */}
                <div className="w-full border-t pt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="payment-proof">Upload Bukti Pembayaran</Label>
                    <Input
                      id="payment-proof"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                    <p className="text-xs text-muted-foreground">Format: JPG/PNG, Maksimal 5MB</p>
                  </div>
                  {previewUrl && (
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border-2 border-gray-200">
                      <Image
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview Bukti Pembayaran"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                  <Button
                    onClick={handleUploadProof}
                    disabled={!selectedFile || isUploading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Bukti Pembayaran
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <p className="text-xs text-center text-gray-600">Scan QR lalu upload bukti pembayaran untuk verifikasi</p>
    </div>
  )
}
