import { createClerkClient } from '@clerk/backend'
import type { Context, Next } from 'hono'
import { z } from 'zod'

/**
 * Clerk Authentication Middleware for Hono
 *
 * Provides JWT verification and user session validation
 * while maintaining compatibility with existing runtime context patterns
 */

// Cloudflare Workers environment bindings
type CloudflareBindings = {
  CLERK_SECRET_KEY: string
  CLERK_PUBLISHABLE_KEY: string
  CLERK_AUTHORIZED_PARTIES?: string
}

// Enhanced runtime context schema with Clerk user data
export const authenticatedRuntimeContextSchema = z.object({
  'user-tier': z.enum(['free', 'pro', 'enterprise']).default('free'),
  'language': z.string().min(2).max(10).default('en'),
  'user-id': z.string().min(1),
  'clerk-user-id': z.string().min(1),
  'user-email': z.string().email().optional(),
  'user-name': z.string().optional(),
  'is-authenticated': z.literal(true),
})

export const unauthenticatedRuntimeContextSchema = z.object({
  'user-tier': z.literal('free'),
  'language': z.string().min(2).max(10).default('en'),
  'user-id': z.literal('anonymous'),
  'is-authenticated': z.literal(false),
})

export type AuthenticatedRuntimeContext = z.infer<typeof authenticatedRuntimeContextSchema>
export type UnauthenticatedRuntimeContext = z.infer<typeof unauthenticatedRuntimeContextSchema>
export type RuntimeContext = AuthenticatedRuntimeContext | UnauthenticatedRuntimeContext

// Extend Hono context to include enhanced runtime context and Cloudflare bindings
export type AuthVariables = {
  runtimeContext: RuntimeContext
  clerkUserId?: string
  userEmail?: string
  Bindings: CloudflareBindings
}

/**
 * Extract JWT token from Authorization header
 */
function extractJWTToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null

  // Support both "Bearer <token>" and just "<token>" formats
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i)
  if (bearerMatch && bearerMatch[1]) {
    return bearerMatch[1]
  }

  // If no "Bearer" prefix, assume the entire header is the token
  return authHeader.trim() || null
}

/**
 * Determine user tier based on Clerk user metadata
 * This can be customized based on your subscription logic
 */
function determineUserTier(clerkUser: any): 'free' | 'pro' | 'enterprise' {
  // Check user's public metadata for tier information
  const tier = clerkUser.publicMetadata?.tier || clerkUser.privateMetadata?.tier
  
  if (tier === 'pro' || tier === 'enterprise') {
    return tier as 'pro' | 'enterprise'
  }
  
  // Default to free tier
  return 'free'
}

/**
 * Clerk Authentication Middleware
 *
 * Attempts to authenticate users via Clerk JWT tokens while maintaining
 * backward compatibility with anonymous access patterns
 */
export const clerkAuthMiddleware = async (c: Context<{ Variables: AuthVariables; Bindings: CloudflareBindings }>, next: Next) => {
  try {
    // Create Clerk client using environment bindings
    const clerkClient = createClerkClient({
      secretKey: Bun.env.CLERK_SECRET_KEY,
      publishableKey: Bun.env.CLERK_PUBLISHABLE_KEY,
    })

    // Extract JWT token from Authorization header
    const authHeader = c.req.header('Authorization')
    const token = extractJWTToken(authHeader)

    if (!token) {
      // No token provided - set anonymous context
      const language = c.req.header('X-Language') ||
                      c.req.header('x-language') ||
                      c.req.header('Accept-Language')?.split(',')[0] || 'en'

      const unauthenticatedContext: UnauthenticatedRuntimeContext = {
        'user-tier': 'free',
        'language': language,
        'user-id': 'anonymous',
        'is-authenticated': false,
      }

      c.set('runtimeContext', unauthenticatedContext)
      await next()
      return
    }

    // Create a proper request object for Clerk's authenticateRequest
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: {
        'authorization': `Bearer ${token}`,
        'user-agent': c.req.header('user-agent') || 'ZapGap-Server/1.0',
        'host': c.req.header('host') || 'localhost:8787',
      }
    })

    // Authenticate request with Clerk
    const requestState = await clerkClient.authenticateRequest(request, {
      authorizedParties: [Bun.env.CLERK_AUTHORIZED_PARTIES || 'http://localhost:8080','https://zapgap.buildverse.app'],
    })

    const auth = requestState.toAuth()

    if (!auth || !auth.userId) {
      throw new Error('Invalid or expired token')
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(auth.userId)

    if (!clerkUser) {
      throw new Error('User not found')
    }

    // Extract user information
    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress
    const userName = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser.username || clerkUser.firstName || undefined

    // Determine user tier from Clerk metadata
    const userTier = determineUserTier(clerkUser)

    // Extract language preference
    const language = c.req.header('X-Language') ||
                    c.req.header('x-language') ||
                    c.req.header('Accept-Language')?.split(',')[0] || 'en'

    // Create authenticated runtime context
    const authenticatedContext: AuthenticatedRuntimeContext = {
      'user-tier': userTier,
      'language': language,
      'user-id': clerkUser.id,
      'clerk-user-id': clerkUser.id,
      'user-email': userEmail,
      'user-name': userName,
      'is-authenticated': true,
    }

    // Validate the context
    const validatedContext = authenticatedRuntimeContextSchema.parse(authenticatedContext)

    // Set context in Hono
    c.set('runtimeContext', validatedContext)
    c.set('clerkUserId', clerkUser.id)
    c.set('userEmail', userEmail)

    await next()
  } catch (error) {
    console.error('Authentication error:', error)

    // On authentication failure, fall back to anonymous context
    const language = c.req.header('X-Language') ||
                    c.req.header('x-language') ||
                    c.req.header('Accept-Language')?.split(',')[0] || 'en'

    const unauthenticatedContext: UnauthenticatedRuntimeContext = {
      'user-tier': 'free',
      'language': language,
      'user-id': 'anonymous',
      'is-authenticated': false,
    }

    c.set('runtimeContext', unauthenticatedContext)

    // For protected routes, you might want to return 401 instead
    // For now, we'll allow anonymous access to maintain compatibility
    await next()
  }
}

/**
 * Protected Route Middleware
 *
 * Ensures that only authenticated users can access certain endpoints
 */
export const requireAuth = async (c: Context<{ Variables: AuthVariables; Bindings: CloudflareBindings }>, next: Next) => {
  const runtimeContext = c.get('runtimeContext')

  if (!runtimeContext || !runtimeContext['is-authenticated']) {
    return c.json({
      error: 'Authentication required',
      message: 'This endpoint requires a valid authentication token',
      timestamp: new Date().toISOString(),
    }, 401)
  }

  await next()
}

/**
 * Helper function to create Mastra headers with authenticated context
 */
export function createAuthenticatedMastraHeaders(runtimeContext: RuntimeContext): Record<string, string> {
  const headers: Record<string, string> = {
    'X-User-ID': runtimeContext['user-id'],
    'X-User-Tier': runtimeContext['user-tier'],
    'X-Language': runtimeContext['language'],
    'Content-Type': 'application/json',
  }

  // Add authentication status
  headers['X-Is-Authenticated'] = runtimeContext['is-authenticated'].toString()

  // Add additional user context for authenticated users
  if (runtimeContext['is-authenticated']) {
    const authContext = runtimeContext as AuthenticatedRuntimeContext
    if (authContext['user-email']) {
      headers['X-User-Email'] = authContext['user-email']
    }
    if (authContext['user-name']) {
      headers['X-User-Name'] = authContext['user-name']
    }
    headers['X-Clerk-User-ID'] = authContext['clerk-user-id']
  }

  return headers
}
