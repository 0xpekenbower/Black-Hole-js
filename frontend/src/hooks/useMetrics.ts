import { useEffect } from 'react';

/**
 * Hook to track user interactions and update metrics
 */
export const useMetrics = () => {
  /**
   * Track a user interaction
   * @param action - The action performed (e.g., 'click', 'submit')
   * @param component - The component where the action occurred
   */
  const trackInteraction = async (action: string, component: string) => {
    try {
      await fetch('/api/metrics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'interaction',
          action, 
          component 
        }),
      });
    } catch (error) {
      // Silent fail - metrics should not disrupt user experience
      console.error('Failed to track interaction:', error);
    }
  };

  /**
   * Update active users count
   * @param isActive - Whether the user is active or not
   */
  const updateActiveUsers = async (isActive: boolean) => {
    try {
      await fetch('/api/metrics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          type: 'activeUser',
          isActive 
        }),
      });
    } catch (error) {
      // Silent fail - metrics should not disrupt user experience
      console.error('Failed to update active users:', error);
    }
  };

  // Track user activity on mount and cleanup on unmount
  useEffect(() => {
    // Mark user as active when component mounts
    updateActiveUsers(true);

    // Mark user as inactive when component unmounts
    return () => {
      updateActiveUsers(false);
    };
  }, []);

  return {
    trackInteraction,
    updateActiveUsers,
  };
};

export default useMetrics; 