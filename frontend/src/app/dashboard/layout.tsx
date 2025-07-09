'use client'

import { ProtectedRoute } from "@/lib/auth/ProtectedRoute"
import DashboardSidebar from "@/components/layouts/DashboardSidebar"
import { WalletProvider } from "@/context/walletContext"
import { ReactNode, createContext, useState } from "react"
import LayoutContext from '@/context/LayoutContext';
import { NotificationProvider } from '@/context/NotificationContext'

/**
 * Dashboard layout with authentication protection
 * @param props - Component props
 * @returns Protected Dashboard layout
 */
export default function DashboardLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	const [showSidebar, setShowSidebar] = useState(true);
	return (
		<ProtectedRoute>
			<WalletProvider>
				<NotificationProvider>
					<div className="flex flex-col min-h-screen">
						<div className="flex flex-1 pt-14"> 
							{showSidebar && <DashboardSidebar />}
							<main className="flex-1 pt-4 pb-16 px-4 md:px-6 md:pr-20">
								<LayoutContext.Provider value={{ showSidebar, setShowSidebar }}>
									{children}
								</LayoutContext.Provider>
							</main>
						</div>
					</div>
				</NotificationProvider>
			</WalletProvider>
		</ProtectedRoute>
	)
} 