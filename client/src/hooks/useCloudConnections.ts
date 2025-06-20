import { useState, useCallback, useRef, useEffect } from 'react';
import useAuthenticatedFetch from './useAuthenticatedFetch';
import { CloudConnections, UseCloudConnectionsReturn } from '@/types/dashboard';

const ZAPGAP_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

/**
 * Custom hook for managing cloud provider connections
 * Handles fetching connection status and provides optimized refresh functionality
 */
export const useCloudConnections = (): UseCloudConnectionsReturn => {
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cloudConnections, setCloudConnections] = useState<CloudConnections>({
    aws: false,
    gcp: false,
    azure: false
  });
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // Use ref to track ongoing requests and prevent duplicates
  const fetchingRef = useRef(false);
  // Use ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);

  const fetchCloudConnections = useCallback(async () => {
    // Prevent duplicate requests
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setIsLoadingConnections(true);

    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data/credentials`);
      if (response.data) {
        setCloudConnections(prevConnections => {
          // Only update if data has actually changed to prevent unnecessary re-renders
          const newConnections = response.data;
          if (JSON.stringify(prevConnections) !== JSON.stringify(newConnections)) {
            return newConnections;
          }
          return prevConnections;
        });
      }
    } catch (error) {
      console.error('Failed to fetch cloud connections:', error);
    } finally {
      setIsLoadingConnections(false);
      fetchingRef.current = false;
    }
  }, [authenticatedFetch]);

  // Stable refresh function that doesn't change on every render
  const refreshConnections = useCallback(() => {
    if (!fetchingRef.current) {
      fetchCloudConnections();
    }
  }, [fetchCloudConnections]);

  // Initial fetch on mount - only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCloudConnections();
    }
  }, []); // Empty dependency array - only run on mount

  return {
    cloudConnections,
    isLoadingConnections,
    fetchCloudConnections,
    refreshConnections
  };
};
