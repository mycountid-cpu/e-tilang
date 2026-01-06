"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Global error caught:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <h2 className="text-lg font-semibold text-destructive">Terjadi Kesalahan</h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Aplikasi mengalami kesalahan yang tidak terduga. Coba lagi atau hubungi administrator jika masalah
              berlanjut.
            </p>
            {process.env.NODE_ENV === "development" && (
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer font-mono">Error Details</summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">{error.message}</pre>
              </details>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              Coba Lagi
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => (window.location.href = "/")}>
              Kembali Ke Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
