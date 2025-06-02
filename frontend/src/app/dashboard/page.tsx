'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

/**
 * Dashboard page component
 * @returns Dashboard UI
 */
export default function DashboardPage() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {/* <Button variant="outline" onClick={handleLogout}>Logout</Button> */}
      </div>
      <div className="grid grid-cols-1 gap-4">
      </div>
    </div>
  )
} 