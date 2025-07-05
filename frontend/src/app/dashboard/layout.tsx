'use client'

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"
import DashboardHeader from "@/components/DashboardHeader"
import DashboardSidebar from "@/components/layouts/DashboardSidebar"
import { WalletProvider } from "@/context/walletContext"
import { ReactNode } from "react"

/**
 * Dashboard layout with authentication protection
 * @param props - Component props
 * @returns Protected Dashboard layout
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ProtectedRoute>
      <WalletProvider>
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          <div className="flex flex-1">
            <DashboardSidebar />
            <main className="flex-1 pt-4 pb-16 px-4 md:px-6 md:pr-20">
              {children}
            </main>
          </div>
        </div>
      </WalletProvider>
    </ProtectedRoute>
  )
} 