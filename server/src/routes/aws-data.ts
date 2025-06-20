import { Hono } from 'hono'
import { z } from 'zod'
import { AWSDataService } from '../services/supabase'
import { requireAuth, type AuthVariables } from '../middleware/auth'

/**
 * AWS Data API Routes
 * 
 * Provides CRUD operations for AWS credentials storage
 * with proper authentication and user isolation
 */

// Cloudflare Workers environment bindings
type CloudflareBindings = {
  SUPABASE_KEY: string
  CLERK_SECRET_KEY: string
  CLERK_AUTHORIZED_PARTIES?: string
}

// Request validation schemas
const createAWSDataSchema = z.object({
  key_id: z.string().min(1, 'Access Key ID is required'),
  access_key: z.string().min(1, 'Secret Access Key is required'),
  region: z.string().nullable().default('us-east-1'),
})

// Note: updateAWSDataSchema removed as it's not currently used
// Can be added back when update functionality is implemented

// Create AWS data router
const awsDataRouter = new Hono<{
  Variables: AuthVariables
  Bindings: CloudflareBindings
}>()

// Apply authentication middleware to all routes
awsDataRouter.use('*', requireAuth)

/**
 * GET /aws-data
 * Get AWS data for the authenticated user
 */
awsDataRouter.get('/', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const userId = runtimeContext['user-id']
    const awsDataService = new AWSDataService(c.env.SUPABASE_KEY)
    
    const awsData = await awsDataService.getAWSData(userId)
    
    if (!awsData) {
      return c.json({ 
        data: null,
        message: 'No AWS data found for user'
      })
    }

    // Don't return the actual secret access key for security
    const safeAwsData = {
      id: awsData.id,
      created_at: awsData.created_at,
      user_id: awsData.user_id,
      key_id: awsData.key_id,
      region: awsData.region,
      // Mask the access key for security
      access_key_masked: awsData.access_key ? 
        awsData.access_key.substring(0, 4) + '*'.repeat(awsData.access_key.length - 4) : 
        null
    }

    return c.json({
      data: safeAwsData,
      message: 'AWS data retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting AWS data:', error)
    return c.json({
      error: 'Failed to get AWS data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * POST /aws-data
 * Create or update AWS data for the authenticated user
 */
awsDataRouter.post('/', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const userId = runtimeContext['user-id']
    const body = await c.req.json()
    
    // Validate request body
    const validatedData = createAWSDataSchema.parse(body)
    
    const awsDataService = new AWSDataService(c.env.SUPABASE_KEY)
    
    const awsData = await awsDataService.upsertAWSData({
      user_id: userId,
      key_id: validatedData.key_id,
      access_key: validatedData.access_key,
      region: validatedData.region,
    })

    // Return safe data without the actual secret key
    const safeAwsData = {
      id: awsData.id,
      created_at: awsData.created_at,
      user_id: awsData.user_id,
      key_id: awsData.key_id,
      region: awsData.region,
      access_key_masked: awsData.access_key ? 
        awsData.access_key.substring(0, 4) + '*'.repeat(awsData.access_key.length - 4) : 
        null
    }

    return c.json({
      data: safeAwsData,
      message: 'AWS data saved successfully'
    }, 201)
  } catch (error) {
    console.error('Error creating/updating AWS data:', error)
    
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation error',
        details: error.errors
      }, 400)
    }
    
    return c.json({
      error: 'Failed to save AWS data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /aws-data/credentials
 * Get full AWS credentials for the authenticated user (including secret key)
 * This endpoint should be used carefully and only when needed for AWS operations
 */
awsDataRouter.get('/credentials', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const userId = runtimeContext['user-id']
    const awsDataService = new AWSDataService(c.env.SUPABASE_KEY)
    
    const awsData = await awsDataService.getAWSData(userId)
    
    if (!awsData) {
      return c.json({ 
        data: null,
        message: 'No AWS credentials found for user'
      })
    }

    // Return full credentials for AWS operations
    const credentials = {
      accessKey: '***************************',
      secretKey: '***************************',
      region: awsData.region || 'us-east-1'
    }

    return c.json({
      data: credentials,
      message: 'AWS credentials retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting AWS credentials:', error)
    return c.json({
      error: 'Failed to get AWS credentials',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * DELETE /aws-data
 * Delete AWS data for the authenticated user
 */
awsDataRouter.delete('/', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const userId = runtimeContext['user-id']
    const awsDataService = new AWSDataService(c.env.SUPABASE_KEY)
    
    await awsDataService.deleteAWSData(userId)

    return c.json({
      message: 'AWS data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting AWS data:', error)
    return c.json({
      error: 'Failed to delete AWS data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /aws-data/status
 * Check if user has AWS data configured
 */
awsDataRouter.get('/status', async (c) => {
  try {
    const runtimeContext = c.get('runtimeContext')
    
    if (!runtimeContext || !runtimeContext['is-authenticated']) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    const userId = runtimeContext['user-id']
    const awsDataService = new AWSDataService(c.env.SUPABASE_KEY)
    
    const hasData = await awsDataService.hasAWSData(userId)

    return c.json({
      hasAWSData: hasData,
      message: hasData ? 'User has AWS data configured' : 'No AWS data found for user'
    })
  } catch (error) {
    console.error('Error checking AWS data status:', error)
    return c.json({
      error: 'Failed to check AWS data status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default awsDataRouter
