import { useState, useCallback } from 'react';
import { dashboardService } from '@/lib/api';
import { handleApiError } from '@/utils/errorHandler';
import { 
  EditProfileRequest, 
  ChangePasswordRequest, 
  UserCard, 
  UserData,
  UseSettingsProps,
  UseSettingsReturn
} from '@/types/Dashboard';

export function useSettings({ onSuccess }: UseSettingsProps = {}): UseSettingsReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.getCard();
      
      if (!response.status.success || !response.data) {
        throw new Error(response.status.message);
      }
      
      const userCardData = response.data;        
      setUserData({
        first_name: userCardData.User.first_name || '',
        last_name: userCardData.User.last_name || '',
        username: userCardData.User.username,
        email: '', // TODO: remove it from the card wla dash service will add it in response
        avatar: userCardData.User.avatar || '',
        is_oauth: userCardData.User.is_oauth,
        is_otp_active: false, // place holder
        is_otp_verified: false // place holder
      });
    } catch (err) {
      const errorMessage = handleApiError(err, 'Settings');
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = async (data: EditProfileRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.editProfile(data);
      
      if (!response.status.success) {
        throw new Error(response.status.message);
      }      
      setUserData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          first_name: data.first_name || prevData.first_name,
          last_name: data.last_name || prevData.last_name
        };
      });
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = handleApiError(err, 'Profile Update');
      setError(errorMessage);
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await dashboardService.changePassword(data);
      
      if (!response.status.success) {
        throw new Error(response.status.message);
      }
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = handleApiError(err, 'Password Update');
      setError(errorMessage);
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOTP = async (isActive: boolean) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Later ba9i not implemented 
      setUserData(prev => prev ? {
        ...prev,
        is_otp_active: isActive
      } : null);
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = handleApiError(err, 'OTP Toggle');
      setError(errorMessage);
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userData,
    isLoading,
    error,
    updateProfile,
    changePassword,
    toggleOTP,
    fetchUserData
  };
} 