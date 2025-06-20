import { Hono } from 'hono'
import { z } from 'zod'
import { ofetch } from 'ofetch'
import { AWSDataService } from '../services/supabase'
import { requireAuth, type AuthVariables, type RuntimeContext } from '../middleware/auth'

/**
 * Mastra Agent API Routes
 *
 * Provides standard JSON communication with Mastra agents
 * with AWS credentials integration and proper authentication
 */

// Cloudflare Workers environment bindings
type CloudflareBindings = {
  MASTRA_AGENT_URL: string
  SUPABASE_KEY: string
  CLERK_SECRET_KEY: string
  CLERK_AUTHORIZED_PARTIES?: string
}

// Request validation schemas
const streamingRequestSchema = z.object({
  agentName: z.string().min(1, 'Agent name is required'),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Message content is required')
  })).min(1, 'At least one message is required'),
  threadId: z.string().optional(),
  runId: z.string().optional(),
  maxRetries: z.number().int().min(0).max(10).default(2),
  maxSteps: z.number().int().min(1).max(20).default(5),
  temperature: z.number().min(0).max(2).default(0.5),
  topP: z.number().min(0).max(1).default(1),
  resourceId: z.string().optional(),
})

// Generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Create API router
const streamingRouter = new Hono<{
  Variables: AuthVariables
  Bindings: CloudflareBindings
}>()

// Apply authentication middleware to all routes
streamingRouter.use('*', requireAuth)

/**
 * Build runtime context without AWS credentials (credentials will be passed via headers)
 */
function buildRuntimeContext(runtimeContext: RuntimeContext): Record<string, any> {
  return {
    'user-tier': runtimeContext['user-tier'],
    'language': runtimeContext['language'],
    'user-id': runtimeContext['user-id'],
    'is-authenticated': runtimeContext['is-authenticated'],
  }
}

/**
 * Build AWS headers for Mastra agent request
 */
async function buildAWSHeaders(
  runtimeContext: RuntimeContext,
  supabaseKey: string
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  }

  // Add AWS credentials via headers if user is authenticated
  if (runtimeContext['is-authenticated']) {
    try {
      const awsDataService = new AWSDataService(supabaseKey)
      const awsData = await awsDataService.getAWSData(runtimeContext['user-id'])

      if (awsData) {
        // Pass AWS credentials via headers for awsHeaderContextMiddleware
        headers['X-AWS-Access-Key-ID'] = awsData.key_id
        headers['X-AWS-Secret-Access-Key'] = awsData.access_key

        // Add region header if available
        if (awsData.region) {
          headers['X-AWS-Region'] = awsData.region
        }

        console.log('AWS credentials added to request headers')
      }
    } catch (error) {
      console.warn('Failed to retrieve AWS credentials for headers:', error)
      // Continue without AWS credentials - agent can handle this gracefully
    }
  }

  return headers
}

/**
 * POST /chat
 * Standard JSON communication with Mastra agents
 */
streamingRouter.post('/', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }
    
    const body = await c.req.json()
    
    // Validate request body
    const validatedData = streamingRequestSchema.parse(body)
    
    // Get Mastra agent URL from environment
    const baseUrl = c.env.MASTRA_AGENT_URL || 'http://localhost:4111'
    
    // Generate IDs if not provided
    const threadId = validatedData.threadId || generateUUID()
    const runId = validatedData.runId || validatedData.agentName
    const resourceId = validatedData.resourceId || validatedData.agentName
    
    // Build runtime context (without AWS credentials - they go in headers)
    const baseRuntimeContext = buildRuntimeContext(runtimeContext)
    
    // Build AWS headers with credentials
    const awsHeaders = await buildAWSHeaders(runtimeContext, c.env.SUPABASE_KEY)
    
    // Prepare request payload for Mastra agent
    const requestPayload = {
      messages: validatedData.messages,
      runId,
      maxRetries: validatedData.maxRetries,
      maxSteps: validatedData.maxSteps,
      temperature: validatedData.temperature,
      topP: validatedData.topP,
      runtimeContext: baseRuntimeContext,
      threadId,
      resourceId,
    }
    
    // Construct the generate endpoint URL
    const chatUrl = `${baseUrl}/api/agents/${validatedData.agentName}/generate`
    
    console.log(`Sending request to Mastra agent: ${chatUrl}`)
    console.log('Request payload:', JSON.stringify(requestPayload, null, 2))
    console.log('AWS headers:', Object.keys(awsHeaders).filter(k => k.startsWith('X-AWS')))
    
    // Make standard JSON request to Mastra agent with AWS credentials in headers
    const response = await ofetch(chatUrl, {
      method: 'POST',
      headers: awsHeaders,
      body: requestPayload,
    })
    
    // Extract message content from response
    const messageContent = response?.message || response?.content || response?.text || 'No response received from agent'

    // Return standard JSON response
    return c.json({
      message: messageContent,
      threadId,
      runId,
      success: true,
      agentName: validatedData.agentName,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in chat endpoint:', error)

    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation error',
        details: error.errors,
        success: false
      }, 400)
    }

    return c.json({
      error: 'Failed to communicate with Mastra agent',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, 500)
  }
})

/**
 * GET /health
 * Check connectivity to Mastra agent server
 */
streamingRouter.get('/health', async (c) => {
  try {
    const baseUrl = c.env.MASTRA_AGENT_URL || 'http://localhost:4111'

    // Test Mastra agent server connection
    const healthCheck = await ofetch(`${baseUrl}/health`, {
      timeout: 5000,
    }).catch(() => null)

    const isHealthy = !!healthCheck

    return c.json({
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'mastra-agent-api',
      timestamp: new Date().toISOString(),
      mastraAgent: {
        status: isHealthy ? 'connected' : 'disconnected',
        url: baseUrl,
        lastCheck: new Date().toISOString(),
      },
    }, isHealthy ? 200 : 503)
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      service: 'mastra-agent-api',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 503)
  }
})

export default streamingRouter
