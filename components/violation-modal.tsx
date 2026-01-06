"use client"

import { useState, useEffect } from "react"
import type { Violation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ViolationModalProps {
  isOpen: boolean
  violations: Violation[]
  onSelect: (violation: Violation) => void
  onClose: () => void
}

export function ViolationModal({ isOpen, violations, onSelect, onClose }: ViolationModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const safeViolations = Array.isArray(violations) ? violations : []

  const filteredViolations = safeViolations.filter((v) => {
    if (!v || !v.name || !v.article) return false
    return (
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleSelect = (violation: Violation) => {
    try {
      if (!violation?.id) {
        console.error("[v0] Invalid violation selected:", violation)
        return
      }
      onSelect(violation)
      setSearchQuery("")
      onClose()
    } catch (error) {
      console.error("[v0] Error selecting violation:", error)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={onClose} aria-label="Modal backdrop" />

      <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden">
        <div className="flex items-center justify-between bg-background px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Pilih Jenis Pelanggaran</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="border-b bg-background px-4 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pelanggaran..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="text"
              aria-label="Search violations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="space-y-2 p-3 pb-24">
            {filteredViolations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Pelanggaran tidak ditemukan</div>
            ) : (
              filteredViolations.map((violation) => {
                if (!violation?.id) return null

                return (
                  <button
                    key={violation.id}
                    onClick={() => handleSelect(violation)}
                    className="w-full text-left rounded-lg border border-border p-3 transition-colors hover:bg-muted active:bg-muted/80"
                    type="button"
                    aria-label={`Select ${violation.name}`}
                  >
                    <p className="font-medium text-sm truncate">{violation.name || "Pelanggaran"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{violation.article || "-"}</p>
                    <p className="text-xs font-semibold text-primary mt-2">
                      Rp {(violation.max_fine || 0).toLocaleString("id-ID")}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}
