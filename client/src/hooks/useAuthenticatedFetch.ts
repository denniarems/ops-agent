import { useAuth } from '@clerk/clerk-react'
import { ofetch } from 'ofetch'
import { useCallback } from 'react'

/**
 * Custom hook for making authenticated API requests
 * 
 * Automatically includes Clerk JWT tokens in requests and handles
 * authentication errors gracefully
 */
export const useAuthenticatedFetch = () => {
  const { getToken, isSignedIn } = useAuth()

  const authenticatedFetch = useCallback(async (
    url: string,
    options: {
      method?: string
      body?: any
      headers?: Record<string, string>
      [key: string]: any
    } = {}
  ) => {
    try {
      // Get authentication token if user is signed in
      let authHeaders: Record<string, string> = {}
      
      if (isSignedIn) {
        const token = await getToken()
        if (token) {
          authHeaders.Authorization = `Bearer ${token}`
        }
      }

      // Merge headers
      const headers = {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      }

      // Make the request using ofetch
      const response = await ofetch(url, {
        ...options,
        headers,
      })

      return response
    } catch (error: any) {
      // Handle authentication errors
      if (error.status === 401) {
        console.warn('Authentication failed - user may need to sign in again')
        // You could trigger a sign-out or redirect here if needed
      }
      
      // Re-throw the error for the caller to handle
      throw error
    }
  }, [getToken, isSignedIn])

  return { authenticatedFetch, isSignedIn }
}

export default useAuthenticatedFetch
