'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { DashboardService } from '@/lib/api/DashboardService'

interface WalletContextProps {
  budget: number
  isLoading: boolean
  error: string | null
  fetchBudget: () => Promise<void>
  updateBudget: (newBudget: number) => void
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [budget, setBudget] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const dashboardService = new DashboardService()
  
  const fetchBudget = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await dashboardService.getCard()
      
      if (response.status.success && response.data?.User) {
        setBudget(response.data.User.budget || 0)
      } else {
        setError('Failed to fetch wallet information')
        setBudget(0)
      }
    } catch (err) {
      setError('An error occurred while fetching wallet information')
      console.error(err)
      setBudget(0)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  const updateBudget = (newBudget: number) => {
    setBudget(newBudget)
  }
  
  // Fetch budget on initial load
  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])
  
  return (
    <WalletContext.Provider
      value={{
        budget,
        isLoading,
        error,
        fetchBudget,
        updateBudget
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextProps => {
  const context = useContext(WalletContext)
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  
  return context
}

export default WalletContext 