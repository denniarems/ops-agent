import { Context, Next } from 'hono';
import { extractUserContextFromHeaders } from '../types/user-runtime-context';
import { createAWSRuntimeContextFromEnv } from '../types/aws-runtime-context';

/**
 * User Context Middleware
 * 
 * Extracts user context from request headers and sets it in the RuntimeContext
 * for use by agents and workflows. This middleware follows the Mastra pattern
 * for server middleware as shown in the documentation.
 */

/**
 * Simulated user tier lookup function
 * In a real application, this would query your user database
 */
async function getUserTier(userId: string): Promise<string> {
  // TODO: Replace with actual database lookup
  // For now, return a default based on user ID patterns
  if (userId.includes('enterprise')) return 'enterprise';
  if (userId.includes('pro')) return 'pro';
  return 'free';
}

/**
 * Simulated user language lookup function
 * In a real application, this would query user preferences
 */
async function getUserLanguage(_userId: string): Promise<string> {
  // TODO: Replace with actual user preference lookup
  // For now, return default language
  return 'en';
}

/**
 * Main user context middleware function
 * Extracts user context from headers and sets RuntimeContext
 */
export const userContextMiddleware = async (c: Context, next: Next) => {
  try {
    // Extract user ID from headers
    const userId = c.req.header('X-User-ID') || c.req.header('x-user-id') || 'anonymous';
    
    // Get the runtime context from Hono context
    const runtimeContext = c.get('runtimeContext');
    
    if (runtimeContext) {
      // Set user tier based on subscription lookup
      const userTier = await getUserTier(userId);
      runtimeContext.set('user-tier', userTier);

      // Set language based on user preferences
      const language = await getUserLanguage(userId);
      runtimeContext.set('language', language);

      // Set user ID
      runtimeContext.set('user-id', userId);

      // Log context setting for debugging
      console.log(`User context set for ${userId}: tier=${userTier}, language=${language}`);
    } else {
      console.warn('RuntimeContext not available in Hono context');
    }

    await next();
  } catch (error) {
    console.error('Error in user context middleware:', error);
    // Continue processing even if context setting fails
    await next();
  }
};

/**
 * Alternative middleware that extracts context directly from headers
 * without external lookups (faster, but less dynamic)
 */
export const simpleUserContextMiddleware = async (c: Context, next: Next) => {
  try {
    // Extract all headers as a plain object
    const headers: Record<string, string | undefined> = {};
    c.req.raw.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Extract and validate user context
    const userContext = extractUserContextFromHeaders(headers);
    
    // Get the runtime context from Hono context
    const runtimeContext = c.get('runtimeContext');
    
    if (runtimeContext) {
      // Set user context in runtime context
      runtimeContext.set('user-tier', userContext['user-tier']);
      runtimeContext.set('language', userContext['language']);
      runtimeContext.set('user-id', userContext['user-id']);

      console.log(`Simple user context set:`, userContext);
    } else {
      console.warn('RuntimeContext not available in Hono context');
    }

    await next();
  } catch (error) {
    console.error('Error in simple user context middleware:', error);
    // Continue processing even if context setting fails
    await next();
  }
};

/**
 * Combined middleware that sets both AWS and user context
 * This ensures backward compatibility with existing AWS context usage
 */
export const combinedContextMiddleware = async (c: Context, next: Next) => {
  try {
    // Get the runtime context from Hono context
    const runtimeContext = c.get('runtimeContext');
    
    if (runtimeContext) {
      // Set AWS context from environment (existing pattern)
      const awsContext = createAWSRuntimeContextFromEnv();
      runtimeContext.set('aws-credentials', awsContext['aws-credentials']);
      runtimeContext.set('aws-config', awsContext['aws-config']);
      runtimeContext.set('aws-security', awsContext['aws-security']);
      
      // Extract and set user context from headers
      const headers: Record<string, string | undefined> = {};
      c.req.raw.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      const userContext = extractUserContextFromHeaders(headers);
      runtimeContext.set('user-tier', userContext['user-tier']);
      runtimeContext.set('language', userContext['language']);
      runtimeContext.set('user-id', userContext['user-id']);

      console.log(`Combined context set - AWS + User:`, {
        aws: { region: awsContext['aws-config'].region },
        user: userContext
      });
    }

    await next();
  } catch (error) {
    console.error('Error in combined context middleware:', error);
    await next();
  }
};
