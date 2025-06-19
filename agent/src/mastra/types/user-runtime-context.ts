import { z } from 'zod';

/**
 * User Runtime Context Types
 * 
 * Defines the structure for user-specific context data that gets extracted
 * from request headers and made available to agents via RuntimeContext.
 */

// User tier schema for subscription-based access control
export const userTierSchema = z.enum(['free', 'pro', 'enterprise']).describe('User subscription tier');

// Language preference schema
export const languageSchema = z.string().min(2).max(10).describe('User language preference (e.g., en, es, fr)');

// User ID schema
export const userIdSchema = z.string().min(1).describe('Unique user identifier');

// Complete user runtime context schema
export const userRuntimeContextSchema = z.object({
  'user-tier': userTierSchema,
  'language': languageSchema,
  'user-id': userIdSchema,
});

// TypeScript types derived from schemas
export type UserTier = z.infer<typeof userTierSchema>;
export type Language = z.infer<typeof languageSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type UserRuntimeContext = z.infer<typeof userRuntimeContextSchema>;

// Combined runtime context that includes both AWS and user context
export interface CombinedRuntimeContext extends UserRuntimeContext {
  // AWS context keys from existing types
  'aws-credentials'?: any;
  'aws-config'?: any;
  'aws-security'?: any;
  'cloudformation-config'?: any;
}

/**
 * Default user context for fallback scenarios
 */
export const defaultUserContext: UserRuntimeContext = {
  'user-tier': 'free',
  'language': 'en',
  'user-id': 'anonymous',
};

/**
 * Validates user runtime context data
 * Throws detailed validation errors if context is invalid
 */
export function validateUserRuntimeContext(context: unknown): UserRuntimeContext {
  try {
    return userRuntimeContextSchema.parse(context);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Invalid User Runtime Context: ${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Safely extracts user context from request headers with validation
 */
export function extractUserContextFromHeaders(headers: Record<string, string | undefined>): UserRuntimeContext {
  const userTier = headers['x-user-tier'] || headers['X-User-Tier'] || 'free';
  const language = headers['x-language'] || headers['X-Language'] || 'en';
  const userId = headers['x-user-id'] || headers['X-User-ID'] || 'anonymous';

  const context = {
    'user-tier': userTier,
    'language': language,
    'user-id': userId,
  };

  try {
    return validateUserRuntimeContext(context);
  } catch (error) {
    console.warn('Invalid user context from headers, using defaults:', error);
    return defaultUserContext;
  }
}
