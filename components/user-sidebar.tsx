"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Car, FileText, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { name: "Profil Saya", href: "/user/profile", icon: User },
  { name: "Kendaraan Saya", href: "/user/vehicles", icon: Car },
  { name: "Tilang Saya", href: "/user/tickets", icon: FileText },
]

export function UserSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/user/login")
  }

  return (
    <aside className="hidden h-full w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Logo Section */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">E-Tilang</span>
      </div>

      <div className="border-b border-sidebar-border px-6 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Portal Masyarakat</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "")} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  )
}

export function UserMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.name.split(" ")[0]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function UserMobileHeader() {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/auth/user/login")
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <FileText className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-primary">E-Tilang</span>
      </div>
      <button
        onClick={handleLogout}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  )
}
