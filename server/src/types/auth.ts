/**
 * Authentication and Runtime Context Types
 * 
 * Shared types for authentication and user context management
 * across the ZapGap server application
 */

export interface ClerkUser {
  id: string
  emailAddresses: Array<{
    emailAddress: string
    id: string
  }>
  firstName?: string
  lastName?: string
  username?: string
  publicMetadata?: Record<string, any>
  privateMetadata?: Record<string, any>
}

export interface AuthenticatedUser {
  clerkId: string
  email?: string
  name?: string
  tier: 'free' | 'pro' | 'enterprise'
}

export interface AuthenticationContext {
  isAuthenticated: boolean
  user?: AuthenticatedUser
  token?: string
}

export interface RuntimeContextBase {
  'user-tier': 'free' | 'pro' | 'enterprise'
  'language': string
  'user-id': string
  'is-authenticated': boolean
}

export interface AuthenticatedRuntimeContext extends RuntimeContextBase {
  'clerk-user-id': string
  'user-email'?: string
  'user-name'?: string
  'is-authenticated': true
}

export interface UnauthenticatedRuntimeContext extends RuntimeContextBase {
  'user-tier': 'free'
  'user-id': 'anonymous'
  'is-authenticated': false
}

export type RuntimeContext = AuthenticatedRuntimeContext | UnauthenticatedRuntimeContext

export interface MastraHeaders {
  'X-User-ID': string
  'X-User-Tier': string
  'X-Language': string
  'X-Is-Authenticated': string
  'X-User-Email'?: string
  'X-User-Name'?: string
  'X-Clerk-User-ID'?: string
  'Content-Type': string
}

export interface APIErrorResponse {
  error: string
  message?: string
  timestamp: string
  status?: number
}
