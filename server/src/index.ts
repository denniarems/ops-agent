import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { ofetch } from 'ofetch'
import { z } from 'zod'

/**
 * ZapGap REST API Server
 *
 * Hono-based server that communicates with the Mastra agent server,
 * providing runtime context middleware and comprehensive error handling.
 */

// Runtime Context Types (following agent patterns)
const runtimeContextSchema = z.object({
  'user-tier': z.enum(['free', 'pro', 'enterprise']).default('free'),
  'language': z.string().min(2).max(10).default('en'),
  'user-id': z.string().min(1).default('anonymous'),
})

type RuntimeContext = z.infer<typeof runtimeContextSchema>

// Extend Hono context to include runtime context
type Variables = {
  runtimeContext: RuntimeContext
}

const app = new Hono<{ Variables: Variables }>()

// Mastra Agent Configuration
const MASTRA_AGENT_URL = process.env.MASTRA_AGENT_URL || 'http://localhost:4111'

/**
 * Runtime Context Middleware for Hono
 * Extracts user context from headers following the same pattern as the agent server
 */
const runtimeContextMiddleware = async (c: any, next: any) => {
  try {
    // Extract headers
    const userTier = c.req.header('X-User-Tier') || c.req.header('x-user-tier') || 'free'
    const language = c.req.header('X-Language') || c.req.header('x-language') ||
                    c.req.header('Accept-Language')?.split(',')[0] || 'en'
    const userId = c.req.header('X-User-ID') || c.req.header('x-user-id') || 'anonymous'

    // Validate and set runtime context
    const context = runtimeContextSchema.parse({
      'user-tier': userTier,
      'language': language,
      'user-id': userId,
    })

    // Store in Hono context
    c.set('runtimeContext', context)

    console.log(`Runtime context set:`, context)

    await next()
  } catch (error) {
    console.error('Error in runtime context middleware:', error)
    // Set default context and continue
    c.set('runtimeContext', {
      'user-tier': 'free',
      'language': 'en',
      'user-id': 'anonymous',
    })
    await next()
  }
}

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Tier', 'X-Language'],
  credentials: false,
}))

// Logger middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', logger())
}

// Runtime context middleware
app.use('*', runtimeContextMiddleware)

/**
 * Agent Communication Helper
 * Creates headers for forwarding to Mastra agent server
 */
function createMastraHeaders(runtimeContext: RuntimeContext): Record<string, string> {
  return {
    'X-User-ID': runtimeContext['user-id'],
    'X-User-Tier': runtimeContext['user-tier'],
    'X-Language': runtimeContext['language'],
    'Content-Type': 'application/json',
  }
}

/**
 * Error Handler Helper
 */
function handleError(error: any, operation: string) {
  console.error(`Error in ${operation}:`, error)

  if (error.status === 404) {
    return { error: `Agent or endpoint not found during ${operation}`, status: 404 }
  }
  if (error.status === 401) {
    return { error: `Authentication failed during ${operation}`, status: 401 }
  }
  if (error.status === 403) {
    return { error: `Insufficient permissions for ${operation}`, status: 403 }
  }
  if (error.status >= 500) {
    return { error: `Mastra agent server error during ${operation}`, status: 503 }
  }

  return { error: `Failed to ${operation}: ${error.message || error}`, status: 500 }
}

// Root endpoint
app.get('/', (c) => {
  const runtimeContext = c.get('runtimeContext') || {
    'user-tier': 'free',
    'language': 'en',
    'user-id': 'anonymous',
  }
  return c.json({
    status: 'ok',
    message: 'ZapGap REST API Server with Mastra Agent Communication',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    runtimeContext,
  })
})

// Health check endpoint
app.get('/health', async (c) => {
  try {
    // Test Mastra agent server connection
    const healthCheck = await ofetch(`${MASTRA_AGENT_URL}/health`, {
      timeout: 5000,
    }).catch(() => null)

    const isHealthy = !!healthCheck

    return c.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'zapgap-rest-api',
      timestamp: new Date().toISOString(),
      dependencies: {
        mastraAgent: {
          status: isHealthy ? 'connected' : 'disconnected',
          url: MASTRA_AGENT_URL,
          lastCheck: new Date().toISOString(),
        },
      },
    }, isHealthy ? 200 : 503)
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      service: 'zapgap-rest-api',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
})

// Chat endpoint - forwards to Mastra agent server
app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json()
    const runtimeContext = (c.get('runtimeContext') || {
      'user-tier': 'free',
      'language': 'en',
      'user-id': 'anonymous',
    }) as RuntimeContext

    // Validate request
    const { message, agentName = 'coreAgent' } = body
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required and must be a string' }, 400)
    }

    // Forward to Mastra agent server with runtime context
    const response = await ofetch(`${MASTRA_AGENT_URL}/chat`, {
      method: 'POST',
      headers: createMastraHeaders(runtimeContext),
      body: { message, agentName },
    })

    return c.json({
      ...response,
      runtimeContext,
    })
  } catch (error: any) {
    const errorInfo = handleError(error, 'send chat message')
    return c.json({
      error: errorInfo.error,
      timestamp: new Date().toISOString(),
    }, errorInfo.status as any)
  }
})

// Agents endpoint - get list of available agents
app.get('/api/agents', async (c) => {
  try {
    const runtimeContext = (c.get('runtimeContext') || {
      'user-tier': 'free',
      'language': 'en',
      'user-id': 'anonymous',
    }) as RuntimeContext

    // Forward to Mastra agent server
    const response = await ofetch(`${MASTRA_AGENT_URL}/agents`, {
      method: 'GET',
      headers: createMastraHeaders(runtimeContext),
    })

    return c.json(response)
  } catch (error: any) {
    const errorInfo = handleError(error, 'get agents')
    return c.json({
      error: errorInfo.error,
      timestamp: new Date().toISOString(),
    }, errorInfo.status as any)
  }
})

// Network endpoint - send message to agent network
app.post('/api/network', async (c) => {
  try {
    const body = await c.req.json()
    const runtimeContext = (c.get('runtimeContext') || {
      'user-tier': 'free',
      'language': 'en',
      'user-id': 'anonymous',
    }) as RuntimeContext

    // Validate request
    const { message, networkName = 'awsInfrastructureNetwork' } = body
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required and must be a string' }, 400)
    }

    // For now, route network requests to the chat endpoint with coreAgent
    // This can be enhanced when the agent server supports network endpoints
    const response = await ofetch(`${MASTRA_AGENT_URL}/chat`, {
      method: 'POST',
      headers: createMastraHeaders(runtimeContext),
      body: { message, agentName: 'coreAgent' },
    })

    return c.json({
      ...response,
      networkUsed: networkName,
      runtimeContext,
    })
  } catch (error: any) {
    const errorInfo = handleError(error, 'send network message')
    return c.json({
      error: errorInfo.error,
      timestamp: new Date().toISOString(),
    }, errorInfo.status as any)
  }
})

export default app
