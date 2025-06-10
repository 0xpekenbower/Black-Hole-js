import { useState, useEffect } from 'react'
import { dashboardService } from '@/lib/api'
import { handleApiError } from '@/utils/errorHandler'
import { Achievement } from '@/types/Dashboard'

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getAchievements();
      
      if (!response.status.success || !response.data) {
        throw new Error(response.status.message);
      }
      
      if (response.data.msg && Array.isArray(response.data.msg)) {
        setAchievements(response.data.msg);
      } else {
        setAchievements([]);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'Achievements');
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    achievements,
    isLoading,
    error,
    refreshAchievements: fetchAchievements
  };
} 