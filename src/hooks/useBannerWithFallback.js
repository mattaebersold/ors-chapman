import { Alert } from 'react-native';
import { useBanner } from '../contexts/BannerContext';

/**
 * Custom hook that provides banner functionality with Alert fallback
 * This eliminates the duplicate try-catch pattern across components
 */
export const useBannerWithFallback = () => {
  try {
    const banner = useBanner();
    return {
      showSuccess: banner.showSuccess,
      showError: banner.showError,
    };
  } catch (error) {
    // Fallback to Alert if BannerProvider is not available
    return {
      showSuccess: (message) => Alert.alert('Success', message),
      showError: (message) => Alert.alert('Error', message),
    };
  }
};