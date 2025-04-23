"use client"

import { Loader2 } from "lucide-react"
import { Skeleton } from "./skeleton"

export function LoadingSkeleton({
  height = "h-40",
  withSpinner = true,
}: {
  height?: string
  withSpinner?: boolean
}) {
  return (
    <div className={`w-full ${height} relative overflow-hidden rounded-md border`}>
      <Skeleton className="absolute inset-0" />
      {withSpinner && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/70" />
        </div>
      )}
    </div>
  )
}

export function CardSkeleton() {
  return <LoadingSkeleton height="h-32" />
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  )
}