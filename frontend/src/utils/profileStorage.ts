/**
 * Utility for storing and retrieving user profile data securely
 */

import { UserCard } from '@/types/Dashboard';
import crypto from 'crypto';

const PROFILE_STORAGE_KEY = 'blackhole_user_profile';
const INTEGRITY_KEY = 'blackhole_profile_integrity';

interface StoredProfile {
  username: string;
  avatar: string | null;
  timestamp: number;
}

/**
 * Generate a simple integrity hash for profile data
 */
const generateIntegrityHash = (data: StoredProfile): string => {
  const payload = `${data.username}:${data.avatar || ''}:${data.timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
};

/**
 * Store essential user profile data in sessionStorage with integrity check
 */
export const storeProfileData = (data: UserCard): void => {
  if (!data || !data.User) return;
  
  const profileData: StoredProfile = {
    username: data.User.username,
    avatar: data.User.avatar,
    timestamp: Date.now()
  };
  
  try {
    const integrityHash = generateIntegrityHash(profileData);
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    sessionStorage.setItem(INTEGRITY_KEY, integrityHash);
  } catch (error) {
    console.error('Failed to store profile data:', error);
  }
};

/**
 * Get stored profile data from sessionStorage with integrity verification
 */
export const getStoredProfile = (): StoredProfile | null => {
  try {
    const data = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    const storedHash = sessionStorage.getItem(INTEGRITY_KEY);
    
    if (!data || !storedHash) return null;
    
    const profileData = JSON.parse(data) as StoredProfile;
    const calculatedHash = generateIntegrityHash(profileData);
    
    // Verify data integrity
    if (calculatedHash !== storedHash) {
      console.warn('Profile data integrity check failed');
      clearProfileData();
      return null;
    }
    
    return profileData;
  } catch (error) {
    console.error('Failed to retrieve profile data:', error);
    return null;
  }
};

/**
 * Check if stored profile data is still valid (not expired)
 * @param maxAge Maximum age in milliseconds (default: 1 hour)
 */
export const isProfileDataValid = (maxAge: number = 3600000): boolean => {
  const profile = getStoredProfile();
  if (!profile) return false;
  
  const now = Date.now();
  return (now - profile.timestamp) < maxAge;
};

/**
 * Clear stored profile data
 */
export const clearProfileData = (): void => {
  try {
    sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    sessionStorage.removeItem(INTEGRITY_KEY);
  } catch (error) {
    console.error('Failed to clear profile data:', error);
  }
}; 