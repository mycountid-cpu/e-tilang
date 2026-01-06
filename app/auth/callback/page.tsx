"use client"

import { Suspense } from "react"
import AuthCallbackContent from "./callback-content"

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoader />}>
      <AuthCallbackContent />
    </Suspense>
  )
}

function CallbackLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-4 text-gray-600">Memverifikasi email Anda...</p>
      </div>
    </div>
  )
}
