import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal visibility and state
 * Provides consistent modal state management patterns
 */
export const useModalState = (initialState = false) => {
  const [isVisible, setIsVisible] = useState(initialState);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showModal = useCallback((data = null) => {
    setModalData(data);
    setIsVisible(true);
    setError(null);
  }, []);

  const hideModal = useCallback(() => {
    setIsVisible(false);
    setError(null);
    // Clear data after animation completes
    setTimeout(() => {
      setModalData(null);
      setLoading(false);
    }, 300);
  }, []);

  const toggleModal = useCallback(() => {
    if (isVisible) {
      hideModal();
    } else {
      showModal();
    }
  }, [isVisible, hideModal, showModal]);

  const setModalLoading = useCallback((loadingState) => {
    setLoading(loadingState);
    if (loadingState) {
      setError(null);
    }
  }, []);

  const setModalError = useCallback((errorMessage) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  const clearModalError = useCallback(() => {
    setError(null);
  }, []);

  const updateModalData = useCallback((newData) => {
    setModalData(prevData => ({
      ...prevData,
      ...newData,
    }));
  }, []);

  // Submit handler wrapper that manages loading/error states
  const handleSubmit = useCallback(async (submitFn, closeOnSuccess = true) => {
    if (!submitFn) return;

    setLoading(true);
    setError(null);

    try {
      const result = await submitFn(modalData);
      if (closeOnSuccess) {
        hideModal();
      }
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [modalData, hideModal]);

  return {
    // State
    isVisible,
    modalData,
    loading,
    error,

    // Actions
    showModal,
    hideModal,
    toggleModal,
    setModalLoading,
    setModalError,
    clearModalError,
    updateModalData,
    handleSubmit,

    // Computed properties
    hasData: !!modalData,
    hasError: !!error,
    isReady: isVisible && !loading,
  };
};

/**
 * Hook for managing multiple modals
 */
export const useMultiModalState = (modalKeys = []) => {
  const [modals, setModals] = useState(() =>
    modalKeys.reduce((acc, key) => ({
      ...acc,
      [key]: {
        isVisible: false,
        data: null,
        loading: false,
        error: null,
      },
    }), {})
  );

  const getModalState = useCallback((key) => {
    return modals[key] || {
      isVisible: false,
      data: null,
      loading: false,
      error: null,
    };
  }, [modals]);

  const updateModal = useCallback((key, updates) => {
    setModals(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  }, []);

  const showModal = useCallback((key, data = null) => {
    updateModal(key, {
      isVisible: true,
      data,
      error: null,
    });
  }, [updateModal]);

  const hideModal = useCallback((key) => {
    updateModal(key, {
      isVisible: false,
      error: null,
    });
    // Clear data after animation
    setTimeout(() => {
      updateModal(key, {
        data: null,
        loading: false,
      });
    }, 300);
  }, [updateModal]);

  const setModalLoading = useCallback((key, loading) => {
    updateModal(key, {
      loading,
      error: loading ? null : modals[key]?.error,
    });
  }, [updateModal, modals]);

  const setModalError = useCallback((key, error) => {
    updateModal(key, {
      error,
      loading: false,
    });
  }, [updateModal]);

  // Create handlers for each modal
  const modalHandlers = modalKeys.reduce((acc, key) => ({
    ...acc,
    [key]: {
      ...getModalState(key),
      show: (data) => showModal(key, data),
      hide: () => hideModal(key),
      setLoading: (loading) => setModalLoading(key, loading),
      setError: (error) => setModalError(key, error),
      updateData: (data) => updateModal(key, { data }),
    },
  }), {});

  return {
    modals,
    getModalState,
    showModal,
    hideModal,
    setModalLoading,
    setModalError,
    ...modalHandlers,
  };
};

export default useModalState;