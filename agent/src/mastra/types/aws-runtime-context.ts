import { z } from 'zod';

/**
 * AWS Runtime Context Type Definitions
 * 
 * This module defines comprehensive TypeScript types for AWS runtime context
 * that enables dynamic credential injection across Mastra agents and tools.
 */

// Base AWS credential schema - only permanent credentials stored
export const awsCredentialsSchema = z.object({
  accessKeyId: z.string().min(1).describe('AWS Access Key ID'),
  secretAccessKey: z.string().min(1).describe('AWS Secret Access Key'),
});

// Complete AWS Runtime Context schema - simplified to only include credentials
export const awsRuntimeContextSchema = z.object({
  // Core AWS credentials only
  'aws-credentials': awsCredentialsSchema,
});

// TypeScript types derived from schemas
export type AWSCredentials = z.infer<typeof awsCredentialsSchema>;
export type AWSRuntimeContext = z.infer<typeof awsRuntimeContextSchema>;

// Utility type for partial AWS context (useful for optional configurations)
export type PartialAWSRuntimeContext = Partial<AWSRuntimeContext> & {
  'aws-credentials': AWSCredentials; // Credentials are always required
};

/**
 * Creates AWS runtime context data object with provided credentials
 * Credentials must be explicitly provided - no environment variable access
 * Returns the data object, not the RuntimeContext instance
 */
export function createAWSRuntimeContextData(
  accessKeyId: string,
  secretAccessKey: string
): AWSRuntimeContext {
  return {
    'aws-credentials': {
      accessKeyId,
      secretAccessKey,
    },
  };
}

/**
 * Validates AWS runtime context
 * Throws detailed validation errors if context is invalid
 */
export function validateAWSRuntimeContext(context: unknown): AWSRuntimeContext {
  try {
    return awsRuntimeContextSchema.parse(context);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Invalid AWS Runtime Context: ${errorMessages}`);
    }
    throw error;
  }
}

// Type guard to check if context has valid AWS credentials
export function hasValidAWSCredentials(context: any): context is { 'aws-credentials': AWSCredentials } {
  return context && 
         context['aws-credentials'] && 
         typeof context['aws-credentials'].accessKeyId === 'string' &&
         context['aws-credentials'].accessKeyId.length > 0 &&
         typeof context['aws-credentials'].secretAccessKey === 'string' &&
         context['aws-credentials'].secretAccessKey.length > 0;
}
