'use client'

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"
import DashboardHeader from "@/components/DashboardHeader"

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
      <DashboardHeader />
      <div className="pt-16">
        {children}
      </div>
    </ProtectedRoute>
  )
} 