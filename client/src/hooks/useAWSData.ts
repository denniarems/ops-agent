import { useState, useCallback } from 'react'
import useAuthenticatedFetch from './useAuthenticatedFetch'

/**
 * AWS Data Management Hook
 * 
 * Provides functions to manage AWS credentials through the server API
 * instead of localStorage, with proper authentication and error handling
 */

export interface AWSCredentials {
  accessKey: string
  secretKey: string
  region: string
}

export interface AWSDataResponse {
  id?: number
  created_at?: string
  user_id: string
  key_id: string
  region: string | null
  access_key_masked?: string
}

export interface AWSDataStatus {
  hasAWSData: boolean
  message: string
}

const ZAPGAP_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787'

export const useAWSData = () => {
  const { authenticatedFetch, isSignedIn } = useAuthenticatedFetch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Clear any existing error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Get AWS data status (whether user has AWS data configured)
   */
  const getAWSDataStatus = useCallback(async (): Promise<AWSDataStatus | null> => {
    if (!isSignedIn) {
      setError('User must be signed in to check AWS data status')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data/status`)
      return response as AWSDataStatus
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check AWS data status'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedFetch, isSignedIn])

  /**
   * Get AWS data (masked for security)
   */
  const getAWSData = useCallback(async (): Promise<AWSDataResponse | null> => {
    if (!isSignedIn) {
      setError('User must be signed in to get AWS data')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data`)
      return response.data as AWSDataResponse | null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AWS data'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedFetch, isSignedIn])

  /**
   * Get full AWS credentials (including secret key) for AWS operations
   */
  const getAWSCredentials = useCallback(async (): Promise<AWSCredentials | null> => {
    if (!isSignedIn) {
      setError('User must be signed in to get AWS credentials')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data/credentials`)
      return response.data as AWSCredentials | null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AWS credentials'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedFetch, isSignedIn])

  /**
   * Save AWS credentials
   */
  const saveAWSData = useCallback(async (credentials: AWSCredentials): Promise<AWSDataResponse | null> => {
    if (!isSignedIn) {
      setError('User must be signed in to save AWS data')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data`, {
        method: 'POST',
        body: JSON.stringify({
          key_id: credentials.accessKey,
          access_key: credentials.secretKey,
          region: credentials.region,
        }),
      })
      return response.data as AWSDataResponse
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save AWS data'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedFetch, isSignedIn])

  /**
   * Delete AWS data
   */
  const deleteAWSData = useCallback(async (): Promise<boolean> => {
    if (!isSignedIn) {
      setError('User must be signed in to delete AWS data')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data`, {
        method: 'DELETE',
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete AWS data'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [authenticatedFetch, isSignedIn])

  return {
    // State
    isLoading,
    error,
    isSignedIn,
    
    // Actions
    getAWSDataStatus,
    getAWSData,
    getAWSCredentials,
    saveAWSData,
    deleteAWSData,
    clearError,
  }
}

export default useAWSData
