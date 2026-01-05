import type React from "react"
import { PetugasSidebar, PetugasMobileNav, PetugasMobileHeader } from "@/components/petugas-sidebar"

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background md:flex-row md:overflow-hidden">
      {/* Desktop Sidebar */}
      <PetugasSidebar />

      {/* Mobile Header */}
      <PetugasMobileHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <PetugasMobileNav />
    </div>
  )
}
