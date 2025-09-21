import { useState } from 'react';
import { useBannerWithFallback } from './useBannerWithFallback';
import { createFormData } from '../utils/formUtils';

/**
 * Custom hook for handling form submissions with loading, success, and error states
 * This eliminates duplicate submission logic across form modals
 */
export const useFormSubmission = (apiMutation, successMessage = 'Success!') => {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useBannerWithFallback();

  const handleSubmit = async (formData, onSubmit, onSuccess) => {
    setLoading(true);
    try {
      if (onSubmit) {
        // Use provided onSubmit handler
        await onSubmit(formData);
      } else if (apiMutation) {
        // Use direct API mutation
        const apiFormData = createFormData(formData);
        await apiMutation(apiFormData).unwrap();
      } else {
        throw new Error('No submission method provided');
      }
      
      showSuccess(successMessage);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      showError(error.message || 'Submission failed');
      throw error; // Re-throw so caller can handle if needed
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleSubmit,
  };
};