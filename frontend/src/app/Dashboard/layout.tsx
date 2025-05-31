'use client'

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"

/**
 * Dashboard layout with authentication protection
 * @param props - Component props
 * @returns Protected Dashboard layout
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 