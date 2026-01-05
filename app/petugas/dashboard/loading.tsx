import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PetugasDashboardLoading() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-48 md:h-9" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Mobile button skeleton */}
      <Skeleton className="h-11 w-full md:hidden" />

      {/* Stats cards skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <Skeleton className="h-3 w-16 md:h-4" />
                  <Skeleton className="mt-2 h-7 w-12 md:h-9" />
                  <Skeleton className="mt-1 h-2 w-14" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent tickets skeleton */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 md:pb-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-1 h-3 w-36" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg border p-3 md:p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
