import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { ofetch } from 'ofetch'
import {
  clerkAuthMiddleware,
  type AuthVariables
} from './middleware/auth'
import awsDataRouter from './routes/aws-data'
import streamingRouter from './routes/streaming'

/**
 * ZapGap REST API Server
 *
 * Hono-based server that communicates with the Mastra agent server,
 * providing runtime context middleware and comprehensive error handling.
 */

// Cloudflare Workers environment bindings
type CloudflareBindings = {
  MASTRA_AGENT_URL: string
  NODE_ENV: string
  CLERK_SECRET_KEY: string
  CLERK_AUTHORIZED_PARTIES?: string
  SUPABASE_KEY: string
}

// Use enhanced authentication variables from middleware and Cloudflare bindings
const app = new Hono<{
  Variables: AuthVariables
  Bindings: CloudflareBindings
}>()

// Legacy runtime context middleware is replaced by Clerk authentication middleware

// CORS middleware with environment-based configuration
app.use('*', cors({
  origin: '*',
}))

// Logger middleware (only in development)
app.use('*', async (c, next) => {
  const nodeEnv = Bun.env.NODE_ENV || 'development'
  if (nodeEnv !== 'production') {
    return logger()(c, next)
  }
  await next()
})

// Clerk authentication middleware (replaces legacy runtime context middleware)
app.use('*', clerkAuthMiddleware)

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
    // Get Mastra agent URL from environment bindings
    const mastraAgentUrl = Bun.env.MASTRA_AGENT_URL || 'http://localhost:4111'

    // Test Mastra agent server connection
    const healthCheck = await ofetch(`${mastraAgentUrl}/health`, {
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
          url: mastraAgentUrl,
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

// Mount AWS data routes
app.route('/api/aws-data', awsDataRouter)

// Mount streaming routes
app.route('/api/chat', streamingRouter)

export default app
