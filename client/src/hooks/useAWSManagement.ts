import { useState, useCallback, useEffect } from 'react';
import { mockAWSService as awsService } from '@/services/mockAWSService';
import useAWSData from './useAWSData';
import { AWSCredentials, AWSConnectionStatus, UseAWSManagementReturn } from '@/types/dashboard';

/**
 * Custom hook for managing AWS connections and resources
 * Consolidates AWS-related state and operations with optimized data fetching
 */
export const useAWSManagement = (
  onConnectionsRefresh?: () => void
): UseAWSManagementReturn => {
  const {
    getAWSDataStatus,
    getAWSCredentials,
    saveAWSData,
    deleteAWSData,
    error: awsDataError,
    clearError: clearAWSDataError
  } = useAWSData();

  // AWS state
  const [showAWSForm, setShowAWSForm] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState<AWSCredentials>({
    accessKey: '',
    secretKey: '',
    region: 'us-east-1'
  });
  const [awsConnectionStatus, setAwsConnectionStatus] = useState<AWSConnectionStatus>('disconnected');
  const [awsResources, setAwsResources] = useState<any>(null);
  const [awsError, setAwsError] = useState<string | null>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const fetchAWSResources = useCallback(async () => {
    if (awsConnectionStatus !== 'connected') return;

    setIsLoadingResources(true);
    try {
      const resources = await awsService.getAllResources();
      setAwsResources(resources);
    } catch (error) {
      console.error('Failed to fetch AWS resources:', error);
      setAwsError(error instanceof Error ? error.message : 'Failed to fetch AWS resources');
    } finally {
      setIsLoadingResources(false);
    }
  }, [awsConnectionStatus]);

  const handleRefreshResources = useCallback(() => {
    fetchAWSResources();
  }, [fetchAWSResources]);

  const handleConnectAWS = useCallback(() => {
    setShowAWSForm(true);
  }, []);

  const handleAWSSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAwsConnectionStatus('connecting');
    setAwsError(null);
    clearAWSDataError();

    try {
      // Connect to AWS with real credentials
      await awsService.connect({
        accessKeyId: awsCredentials.accessKey,
        secretAccessKey: awsCredentials.secretKey,
        region: awsCredentials.region,
      });

      // Save credentials to Supabase for persistence
      const savedData = await saveAWSData(awsCredentials);

      if (!savedData) {
        throw new Error(awsDataError || 'Failed to save AWS credentials');
      }

      setAwsConnectionStatus('connected');
      setShowAWSForm(false);

      // Fetch AWS resources after successful connection
      await fetchAWSResources();

      // Refresh cloud connections to reflect the new status
      // Use setTimeout to avoid immediate re-render loop
      setTimeout(() => {
        onConnectionsRefresh?.();
      }, 100);

    } catch (error) {
      console.error('AWS connection failed:', error);
      setAwsConnectionStatus('disconnected');
      setAwsError(error instanceof Error ? error.message : 'Failed to connect to AWS');
    }
  }, [awsCredentials, saveAWSData, awsDataError, clearAWSDataError, fetchAWSResources, onConnectionsRefresh]);

  const handleDisconnectAWS = useCallback(async () => {
    awsService.disconnect();
    setAwsConnectionStatus('disconnected');
    setAwsResources(null);
    setAwsCredentials({ accessKey: '', secretKey: '', region: 'us-east-1' });

    // Clear AWS data from Supabase
    try {
      await deleteAWSData();
      // Refresh cloud connections after disconnecting
      // Use setTimeout to avoid immediate re-render loop
      setTimeout(() => {
        onConnectionsRefresh?.();
      }, 100);
    } catch (error) {
      console.warn('Could not clear AWS data from database:', error);
    }
  }, [deleteAWSData, onConnectionsRefresh]);

  // Restore AWS connection on mount - only run once
  useEffect(() => {
    let isMounted = true;

    const restoreAWSConnection = async () => {
      try {
        // Check if user has AWS data in Supabase
        const status = await getAWSDataStatus();

        if (!isMounted) return; // Component unmounted, don't continue

        if (status?.hasAWSData) {
          // Get credentials from Supabase
          const credentials = await getAWSCredentials();

          if (!isMounted) return; // Component unmounted, don't continue

          if (credentials) {
            setAwsCredentials(credentials);
            setAwsConnectionStatus('connecting');

            // Reconnect to AWS service
            await awsService.connect({
              accessKeyId: credentials.accessKey,
              secretAccessKey: credentials.secretKey,
              region: credentials.region,
            });

            if (!isMounted) return; // Component unmounted, don't continue

            setAwsConnectionStatus('connected');

            // Fetch fresh resources
            await fetchAWSResources();

            // Refresh cloud connections to reflect restored connection
            // Use setTimeout to avoid immediate re-render loop
            setTimeout(() => {
              if (isMounted && onConnectionsRefresh) {
                onConnectionsRefresh();
              }
            }, 100);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Could not restore AWS connection:', error);
          setAwsConnectionStatus('disconnected');
          setAwsResources(null);
        }
      }
    };

    restoreAWSConnection();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run on mount

  return {
    awsConnectionStatus,
    awsCredentials,
    awsResources,
    awsError,
    isLoadingResources,
    showAWSForm,
    setAwsCredentials,
    setShowAWSForm,
    handleAWSSubmit,
    handleDisconnectAWS,
    fetchAWSResources,
    handleRefreshResources,
    handleConnectAWS
  };
};
