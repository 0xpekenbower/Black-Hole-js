'use client'

import { PublicRoute } from "@/lib/auth/ProtectedRoute"

/**
 * Auth layout with public route protection for login, register, and forgot-password pages
 * @param props - Component props
 * @returns Public route auth layout
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  )
} 