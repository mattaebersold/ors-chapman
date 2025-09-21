import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing API call states
 * Provides consistent loading, error, and data management
 */
export const useApiState = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const execute = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      setLastUpdated(new Date());

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setLastUpdated(null);
  }, [initialData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateData = useCallback((newData) => {
    setData(newData);
    setLastUpdated(new Date());
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    execute,
    reset,
    clearError,
    updateData,
    hasData: data !== null && data !== undefined,
    hasError: !!error,
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime()) > 5 * 60 * 1000 : false, // 5 minutes
  };
};

/**
 * Hook for managing paginated API calls
 */
export const usePaginatedApiState = (pageSize = 10) => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadPage = useCallback(async (apiCall, page = 1, append = false) => {
    if (page === 1) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await apiCall({
        page,
        limit: pageSize,
      });

      const newItems = result.entries || result.data || [];
      const total = result.total || 0;

      if (append && page > 1) {
        setItems(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(item => item._id || item.id));
          const filteredNewItems = newItems.filter(item => !existingIds.has(item._id || item.id));
          return [...prev, ...filteredNewItems];
        });
      } else {
        setItems(newItems);
      }

      setTotalItems(total);
      setCurrentPage(page);
      setHasMore((page * pageSize) < total);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  const loadMore = useCallback(async (apiCall) => {
    if (loading || !hasMore) return;

    return loadPage(apiCall, currentPage + 1, true);
  }, [loading, hasMore, currentPage, loadPage]);

  const refresh = useCallback(async (apiCall) => {
    return loadPage(apiCall, 1, false);
  }, [loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(1);
    setTotalItems(0);
    setHasMore(true);
    setLoading(false);
    setRefreshing(false);
    setError(null);
  }, []);

  const addItem = useCallback((item) => {
    setItems(prev => [item, ...prev]);
    setTotalItems(prev => prev + 1);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev =>
      prev.map(item =>
        (item._id === id || item.id === id)
          ? { ...item, ...updates }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item._id !== id && item.id !== id));
    setTotalItems(prev => Math.max(0, prev - 1));
  }, []);

  return {
    items,
    currentPage,
    totalItems,
    hasMore,
    loading,
    refreshing,
    error,
    loadPage,
    loadMore,
    refresh,
    reset,
    addItem,
    updateItem,
    removeItem,
    isEmpty: items.length === 0,
    hasError: !!error,
    totalPages: Math.ceil(totalItems / pageSize),
  };
};

export default useApiState;