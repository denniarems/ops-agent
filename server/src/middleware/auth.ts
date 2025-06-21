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
  console.log('[TOKEN-EXTRACT] Processing authorization header:', {
    hasHeader: !!authHeader,
    headerLength: authHeader?.length || 0,
    headerPrefix: authHeader?.substring(0, 20) + '...' || 'none'
  })

  if (!authHeader) {
    console.log('[TOKEN-EXTRACT] No authorization header provided')
    return null
  }

  // Support both "Bearer <token>" and just "<token>" formats
  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i)
  if (bearerMatch && bearerMatch[1]) {
    console.log('[TOKEN-EXTRACT] Bearer token found, length:', bearerMatch[1].length)
    return bearerMatch[1]
  }

  // If no "Bearer" prefix, assume the entire header is the token
  const trimmedToken = authHeader.trim()
  console.log('[TOKEN-EXTRACT] No Bearer prefix, using raw header as token, length:', trimmedToken.length)
  return trimmedToken || null
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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[AUTH-${requestId}] Starting authentication for ${c.req.method} ${c.req.url}`)

  try {
    // Log environment variables (without exposing secrets)
    console.log(`[AUTH-${requestId}] Environment check:`, {
      hasClerkSecretKey: !!Bun.env.CLERK_SECRET_KEY,
      hasClerkPublishableKey: !!Bun.env.CLERK_PUBLISHABLE_KEY,
      clerkSecretKeyPrefix: Bun.env.CLERK_SECRET_KEY?.substring(0, 8) + '...',
      clerkPublishableKeyPrefix: Bun.env.CLERK_PUBLISHABLE_KEY?.substring(0, 8) + '...',
      authorizedParties: Bun.env.CLERK_AUTHORIZED_PARTIES || 'http://localhost:8080'
    })

    // Create Clerk client using environment bindings
    const clerkClient = createClerkClient({
      secretKey: Bun.env.CLERK_SECRET_KEY,
      publishableKey: Bun.env.CLERK_PUBLISHABLE_KEY,
    })
    console.log(`[AUTH-${requestId}] Clerk client created successfully`)

    // Extract JWT token from Authorization header
    const authHeader = c.req.header('Authorization')
    console.log(`[AUTH-${requestId}] Authorization header present:`, !!authHeader)
    console.log(`[AUTH-${requestId}] Authorization header format:`, authHeader?.substring(0, 20) + '...')

    const token = extractJWTToken(authHeader)
    console.log(`[AUTH-${requestId}] Token extraction result:`, !!token)

    if (!token) {
      // No token provided - set anonymous context
      console.log(`[AUTH-${requestId}] No token provided, setting anonymous context`)
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
      console.log(`[AUTH-${requestId}] Anonymous access - no authentication token provided`)
      await next()
      return
    }

    console.log(`[AUTH-${requestId}] Token extracted:`, token.substring(0, 20) + '...')
    console.log(`[AUTH-${requestId}] Token length:`, token.length)

    // Create a proper request object for Clerk's authenticateRequest
    console.log(`[AUTH-${requestId}] Creating request with URL:`, c.req.url)
    console.log(`[AUTH-${requestId}] Request method:`, c.req.method)
    console.log(`[AUTH-${requestId}] Request headers:`, {
      userAgent: c.req.header('user-agent'),
      host: c.req.header('host'),
      authorizationPrefix: `Bearer ${token.substring(0, 20)}...`
    })

    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: {
        'authorization': `Bearer ${token}`,
        'user-agent': c.req.header('user-agent') || 'ZapGap-Server/1.0',
        'host': c.req.header('host') || 'localhost:8787',
      }
    })

    console.log(`[AUTH-${requestId}] Request created, calling Clerk authenticateRequest...`)

    // Authenticate request with Clerk
    const requestState = await clerkClient.authenticateRequest(request, {
      authorizedParties: [Bun.env.CLERK_AUTHORIZED_PARTIES || 'http://localhost:8080','https://zapgap.buildverse.app'],
    })
    console.log(`[AUTH-${requestId}] Clerk authenticateRequest completed`)

    const auth = requestState.toAuth()
    console.log(`[AUTH-${requestId}] Auth object created:`, {
      hasAuth: !!auth,
      hasUserId: !!auth?.userId,
      userId: auth?.userId?.substring(0, 8) + '...' || 'none',
      sessionId: auth?.sessionId?.substring(0, 8) + '...' || 'none'
    })

    if (!auth || !auth.userId) {
      console.log(`[AUTH-${requestId}] Authentication failed - no auth or userId`)
      console.log(`[AUTH-${requestId}] Auth details:`, {
        auth: !!auth,
        userId: auth?.userId,
        sessionId: auth?.sessionId,
        orgId: auth?.orgId
      })
      throw new Error('Invalid or expired token')
    }

    console.log(`[AUTH-${requestId}] Authentication successful, fetching user details...`)

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(auth.userId)
    console.log(`[AUTH-${requestId}] User details fetched:`, {
      hasUser: !!clerkUser,
      userId: clerkUser?.id?.substring(0, 8) + '...' || 'none',
      emailCount: clerkUser?.emailAddresses?.length || 0,
      hasFirstName: !!clerkUser?.firstName,
      hasLastName: !!clerkUser?.lastName,
      hasUsername: !!clerkUser?.username
    })

    if (!clerkUser) {
      console.log(`[AUTH-${requestId}] User not found in Clerk database`)
      throw new Error('User not found')
    }

    // Extract user information
    const userEmail = clerkUser.emailAddresses?.[0]?.emailAddress
    const userName = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser.username || clerkUser.firstName || undefined

    // Determine user tier from Clerk metadata
    const userTier = determineUserTier(clerkUser)
    console.log(`[AUTH-${requestId}] User tier determined:`, userTier)

    // Extract language preference
    const language = c.req.header('X-Language') ||
                    c.req.header('x-language') ||
                    c.req.header('Accept-Language')?.split(',')[0] || 'en'

    console.log(`[AUTH-${requestId}] Creating authenticated context:`, {
      userTier,
      language,
      userId: clerkUser.id.substring(0, 8) + '...',
      userEmail: userEmail?.substring(0, 3) + '***' || 'none',
      userName: userName?.substring(0, 3) + '***' || 'none'
    })

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
    console.log(`[AUTH-${requestId}] Context validation successful`)

    // Set context in Hono
    c.set('runtimeContext', validatedContext)
    c.set('clerkUserId', clerkUser.id)
    c.set('userEmail', userEmail)

    console.log(`[AUTH-${requestId}] Authenticated user: ${clerkUser.id.substring(0, 8)}... (${userEmail?.substring(0, 3)}***) - Tier: ${userTier}`)
    console.log(`[AUTH-${requestId}] Authentication completed successfully`)

    await next()
  } catch (error) {
    console.error(`[AUTH-${requestId}] Authentication error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      requestUrl: c.req.url,
      requestMethod: c.req.method,
      hasAuthHeader: !!c.req.header('Authorization'),
      authHeaderPrefix: c.req.header('Authorization')?.substring(0, 20) + '...' || 'none'
    })

    // Log additional context for debugging
    console.error(`[AUTH-${requestId}] Error context:`, {
      clerkSecretKeyPresent: !!Bun.env.CLERK_SECRET_KEY,
      clerkPublishableKeyPresent: !!Bun.env.CLERK_PUBLISHABLE_KEY,
      authorizedParties: Bun.env.CLERK_AUTHORIZED_PARTIES || 'http://localhost:8080',
      userAgent: c.req.header('user-agent'),
      host: c.req.header('host')
    })

    // On authentication failure, fall back to anonymous context
    console.log(`[AUTH-${requestId}] Falling back to anonymous context due to authentication failure`)
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
    console.log(`[AUTH-${requestId}] Anonymous context set, proceeding with request`)

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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[REQUIRE-AUTH-${requestId}] Checking authentication for ${c.req.method} ${c.req.url}`)

  const runtimeContext = c.get('runtimeContext')
  console.log(`[REQUIRE-AUTH-${requestId}] Runtime context:`, {
    hasContext: !!runtimeContext,
    isAuthenticated: runtimeContext?.['is-authenticated'] || false,
    userId: runtimeContext?.['user-id']?.substring(0, 8) + '...' || 'none',
    userTier: runtimeContext?.['user-tier'] || 'none'
  })

  if (!runtimeContext || !runtimeContext['is-authenticated']) {
    console.log(`[REQUIRE-AUTH-${requestId}] Authentication required - rejecting request`)
    return c.json({
      error: 'Authentication required',
      message: 'This endpoint requires a valid authentication token',
      timestamp: new Date().toISOString(),
    }, 401)
  }

  console.log(`[REQUIRE-AUTH-${requestId}] Authentication verified, proceeding`)
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
