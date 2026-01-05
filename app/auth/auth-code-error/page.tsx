import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Verifikasi Gagal</CardTitle>
          <CardDescription>
            Link konfirmasi tidak valid atau sudah kadaluarsa. Silakan coba daftar ulang atau minta link baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link href="/auth/user/register">Daftar Ulang</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/user/login">Kembali ke Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
