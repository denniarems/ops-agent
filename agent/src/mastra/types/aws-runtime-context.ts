import { z } from 'zod';

/**
 * AWS Runtime Context Type Definitions
 * 
 * This module defines comprehensive TypeScript types for AWS runtime context
 * that enables dynamic credential injection across Mastra agents and tools.
 */

// Base AWS credential schema
export const awsCredentialsSchema = z.object({
  accessKeyId: z.string().min(1).describe('AWS Access Key ID'),
  secretAccessKey: z.string().min(1).describe('AWS Secret Access Key'),
  sessionToken: z.string().optional().describe('AWS Session Token for temporary credentials'),
});

// AWS configuration schema
export const awsConfigSchema = z.object({
  region: z.string().default('us-east-1').describe('AWS region'),
  profile: z.string().optional().describe('AWS profile name'),
  maxRetries: z.number().min(0).max(10).default(3).describe('Maximum retry attempts'),
  timeout: z.number().min(1000).max(60000).default(30000).describe('Request timeout in milliseconds'),
});

// Security and tenant configuration
export const awsSecurityConfigSchema = z.object({
  tenantId: z.string().min(1).describe('Tenant identifier for multi-tenant environments'),
  environment: z.enum(['development', 'staging', 'production']).describe('Deployment environment'),
  resourceTagPrefix: z.string().default('zapgap').describe('Prefix for resource tags'),
  maxResourcesPerTenant: z.number().min(1).max(1000).default(100).describe('Maximum resources per tenant'),
  allowedResourceTypes: z.array(z.string()).optional().describe('Allowed AWS resource types'),
  requiredTags: z.array(z.string()).default(['tenant', 'environment', 'created-by']).describe('Required resource tags'),
});

// Complete AWS Runtime Context schema
export const awsRuntimeContextSchema = z.object({
  // Core AWS credentials
  'aws-credentials': awsCredentialsSchema,
  
  // AWS configuration
  'aws-config': awsConfigSchema,
  
  // Security and multi-tenancy
  'aws-security': awsSecurityConfigSchema,
  
  // Optional service-specific configurations
  'cloudformation-config': z.object({
    stackNamePrefix: z.string().optional().describe('Prefix for CloudFormation stack names'),
    templateBucket: z.string().optional().describe('S3 bucket for storing templates'),
    enableTerminationProtection: z.boolean().default(false).describe('Enable stack termination protection'),
    capabilities: z.array(z.enum(['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'])).optional(),
  }).optional(),
  
  'documentation-config': z.object({
    preferredLanguage: z.enum(['en', 'es', 'fr', 'de', 'ja']).default('en').describe('Preferred documentation language'),
    includeExamples: z.boolean().default(true).describe('Include code examples in documentation'),
    maxResults: z.number().min(1).max(50).default(10).describe('Maximum search results'),
  }).optional(),
});

// TypeScript types derived from schemas
export type AWSCredentials = z.infer<typeof awsCredentialsSchema>;
export type AWSConfig = z.infer<typeof awsConfigSchema>;
export type AWSSecurityConfig = z.infer<typeof awsSecurityConfigSchema>;
export type AWSRuntimeContext = z.infer<typeof awsRuntimeContextSchema>;

// Utility type for partial AWS context (useful for optional configurations)
export type PartialAWSRuntimeContext = Partial<AWSRuntimeContext> & {
  'aws-credentials': AWSCredentials; // Credentials are always required
};

// Environment variable mapping for backward compatibility
export interface EnvironmentVariableMapping {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SESSION_TOKEN?: string;
  AWS_REGION?: string;
  AWS_PROFILE?: string;
  TENANT_ID?: string;
  NODE_ENV?: 'development' | 'staging' | 'production';
}

/**
 * Converts environment variables to AWS runtime context
 * Provides backward compatibility with existing environment-based configuration
 */
export function createAWSRuntimeContextFromEnv(env: Partial<EnvironmentVariableMapping> | NodeJS.ProcessEnv = process.env): AWSRuntimeContext {
  return {
    'aws-credentials': {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
      sessionToken: env.AWS_SESSION_TOKEN,
    },
    'aws-config': {
      region: env.AWS_REGION || 'us-east-1',
      profile: env.AWS_PROFILE,
      maxRetries: 3,
      timeout: 30000,
    },
    'aws-security': {
      tenantId: env.TENANT_ID || 'default',
      environment: (env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
      resourceTagPrefix: 'zapgap',
      maxResourcesPerTenant: 100,
      requiredTags: ['tenant', 'environment', 'created-by'],
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

/**
 * Merges multiple AWS runtime contexts with precedence
 * Later contexts override earlier ones
 */
export function mergeAWSRuntimeContexts(...contexts: Partial<AWSRuntimeContext>[]): AWSRuntimeContext {
  const merged: any = contexts.reduce((acc: any, context: any) => {
    const result: any = {
      ...acc,
      ...context,
    };

    // Deep merge nested objects only if they exist
    if (acc['aws-credentials'] || context['aws-credentials']) {
      result['aws-credentials'] = {
        ...acc['aws-credentials'],
        ...context['aws-credentials']
      };
    }

    if (acc['aws-config'] || context['aws-config']) {
      result['aws-config'] = {
        ...acc['aws-config'],
        ...context['aws-config']
      };
    }

    if (acc['aws-security'] || context['aws-security']) {
      result['aws-security'] = {
        ...acc['aws-security'],
        ...context['aws-security']
      };
    }

    if (acc['cloudformation-config'] || context['cloudformation-config']) {
      result['cloudformation-config'] = {
        ...acc['cloudformation-config'],
        ...context['cloudformation-config']
      };
    }

    if (acc['documentation-config'] || context['documentation-config']) {
      result['documentation-config'] = {
        ...acc['documentation-config'],
        ...context['documentation-config']
      };
    }

    return result;
  }, {});

  return validateAWSRuntimeContext(merged);
}

/**
 * Creates a default AWS runtime context for development
 * Uses environment variables as fallback
 */
export function createDefaultAWSRuntimeContext(): AWSRuntimeContext {
  return createAWSRuntimeContextFromEnv();
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
