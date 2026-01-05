import type React from "react"
import { UserSidebar, UserMobileNav, UserMobileHeader } from "@/components/user-sidebar"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-background md:flex-row md:overflow-hidden">
      {/* Desktop Sidebar */}
      <UserSidebar />

      {/* Mobile Header */}
      <UserMobileHeader />

      {/* Main Content - Added padding bottom for mobile nav, max-width for desktop */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <UserMobileNav />
    </div>
  )
}
