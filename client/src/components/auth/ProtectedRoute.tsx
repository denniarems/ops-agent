import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: string
}

/**
 * Protected Route Component
 * 
 * Ensures that only authenticated users can access wrapped components.
 * Redirects unauthenticated users to the home page with return URL.
 */
export const ProtectedRoute = ({ children, fallback = '/' }: ProtectedRouteProps) => {
  const { isSignedIn, isLoaded } = useAuth()
  const location = useLocation()

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center animate-pulse mx-auto">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
            <p className="text-gray-400">Checking authentication status</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to fallback if not signed in
  if (!isSignedIn) {
    // Preserve the current location to redirect back after sign in
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    const redirectUrl = `${fallback}?returnUrl=${returnUrl}`
    return <Navigate to={redirectUrl} replace />
  }

  // Render protected content
  return <>{children}</>
}

export default ProtectedRoute
