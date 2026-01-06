import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ShieldCheck, Ticket } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-20">
        <div className="w-full max-w-6xl text-center text-white">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">E-Tilang</h1>
          <p className="mb-8 text-xl text-blue-100 md:text-2xl">
            Sistem Tilang Elektronik untuk Indonesia yang Lebih Tertib
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary">
              <Link href="/auth/user/login">Portal Masyarakat</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              <Link href="/auth/petugas/login">Portal Petugas</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">Fitur Layanan</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Ticket className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Cek Tilang</h3>
                <p className="text-gray-600">Pantau status tilang Anda secara real-time dan detail pelanggaran</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Pembayaran Digital</h3>
                <p className="text-gray-600">Bayar denda tilang dengan mudah melalui DANA atau Virtual Account</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <ShieldCheck className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Transparan & Aman</h3>
                <p className="text-gray-600">Data tersimpan aman dengan bukti digital yang dapat diverifikasi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-8 text-center text-white">
        <p className="text-sm">&copy; 2025 E-Tilang Indonesia. Sistem Tilang Elektronik.</p>
      </footer>
    </div>
  )
}
