import { Context, Next } from 'hono';

/**
 * AWS Context Middleware
 * 
 * Simplified middleware that only sets AWS credentials in the RuntimeContext.
 * Removes all user session management fields to focus solely on AWS operations.
 */

/**
 * AWS context middleware function
 * Sets AWS credentials only from runtime context - no environment fallbacks
 */
export const awsContextMiddleware = async (c: Context, next: Next) => {
  try {
    // Get the runtime context from Hono context
    const runtimeContext = c.get('runtimeContext');

    if (runtimeContext) {
      // AWS credentials should be set by the calling application
      // This middleware just ensures the runtime context is available
      // No automatic credential loading from environment

      console.log('AWS context middleware initialized - credentials should be set by caller');
    } else {
      console.warn('RuntimeContext not available in Hono context');
    }

    await next();
  } catch (error) {
    console.error('Error in AWS context middleware:', error);
    // Continue processing even if context setting fails
    await next();
  }
};

/**
 * Alternative middleware that extracts AWS credentials from request headers only
 * Only extracts permanent credentials - sessionToken generated via STS when needed
 * No environment variable fallbacks - credentials must be provided via headers
 */
export const awsHeaderContextMiddleware = async (c: Context, next: Next) => {
  try {
    // Get the runtime context from Hono context
    const runtimeContext = c.get('runtimeContext');

    if (runtimeContext) {
      // Extract AWS permanent credentials from headers only (no env fallbacks)
      const accessKeyId = c.req.header('X-AWS-Access-Key-ID') ||
      c.req.header('x-aws-access-key-id') || '';
      
      const secretAccessKey = c.req.header('X-AWS-Secret-Access-Key') ||
      c.req.header('x-aws-secret-access-key') || '';
      
      // Only set credentials if both are provided via headers
      if (accessKeyId && secretAccessKey) {
        runtimeContext.set('aws-credentials', {
          accessKeyId,
          secretAccessKey,
        });

        console.log('AWS context set from headers (permanent credentials only)');
      }
    } else {
      console.warn('RuntimeContext not available in Hono context');
    }

    await next();
  } catch (error) {
    console.error('Error in AWS header context middleware:', error);
    // Continue processing even if context setting fails
    await next();
  }
};
