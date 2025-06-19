import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials,
  AWSConfig,
  AWSSecurityConfig,
  createAWSRuntimeContextFromEnv,
  mergeAWSRuntimeContexts,
  hasValidAWSCredentials
} from '../types/aws-runtime-context';

/**
 * AWS Runtime Context Utility Functions
 * 
 * This module provides utility functions for creating, validating, and managing
 * AWS runtime context instances in Mastra agents and tools.
 */

/**
 * Creates a new RuntimeContext instance with AWS configuration
 */
export function createAWSRuntimeContext(awsContext: AWSRuntimeContext): RuntimeContext<AWSRuntimeContext> {
  const runtimeContext = new RuntimeContext<AWSRuntimeContext>();
  
  // Set AWS credentials
  runtimeContext.set('aws-credentials', awsContext['aws-credentials']);
  
  // Set AWS configuration
  runtimeContext.set('aws-config', awsContext['aws-config']);
  
  // Set security configuration
  runtimeContext.set('aws-security', awsContext['aws-security']);
  
  // Set optional service-specific configurations
  if (awsContext['cloudformation-config']) {
    runtimeContext.set('cloudformation-config', awsContext['cloudformation-config']);
  }
  
  if (awsContext['documentation-config']) {
    runtimeContext.set('documentation-config', awsContext['documentation-config']);
  }
  
  return runtimeContext;
}

/**
 * Creates AWS runtime context from environment variables
 * Useful for backward compatibility and development environments
 */
export function createAWSRuntimeContextFromEnvironment(): RuntimeContext<AWSRuntimeContext> {
  const awsContext = createAWSRuntimeContextFromEnv();
  return createAWSRuntimeContext(awsContext);
}

/**
 * Creates AWS runtime context with custom credentials
 * Useful for dynamic credential injection
 */
export function createAWSRuntimeContextWithCredentials(
  credentials: AWSCredentials,
  config?: Partial<AWSConfig>,
  security?: Partial<AWSSecurityConfig>
): RuntimeContext<AWSRuntimeContext> {
  const defaultContext = createAWSRuntimeContextFromEnv();
  
  const awsContext = mergeAWSRuntimeContexts(defaultContext, {
    'aws-credentials': credentials,
    'aws-config': config ? { ...defaultContext['aws-config'], ...config } : defaultContext['aws-config'],
    'aws-security': security ? { ...defaultContext['aws-security'], ...security } : defaultContext['aws-security'],
  });
  
  return createAWSRuntimeContext(awsContext);
}

/**
 * Extracts AWS credentials from runtime context
 * Throws error if credentials are missing or invalid
 */
export function getAWSCredentialsFromContext(runtimeContext: RuntimeContext<AWSRuntimeContext>): AWSCredentials {
  const credentials = runtimeContext.get('aws-credentials');
  
  if (!credentials) {
    throw new Error('AWS credentials not found in runtime context');
  }
  
  if (!hasValidAWSCredentials({ 'aws-credentials': credentials })) {
    throw new Error('Invalid AWS credentials in runtime context');
  }
  
  return credentials;
}

/**
 * Extracts AWS configuration from runtime context
 */
export function getAWSConfigFromContext(runtimeContext: RuntimeContext<AWSRuntimeContext>): AWSConfig {
  const config = runtimeContext.get('aws-config');
  
  if (!config) {
    throw new Error('AWS configuration not found in runtime context');
  }
  
  return config;
}

/**
 * Extracts AWS security configuration from runtime context
 */
export function getAWSSecurityConfigFromContext(runtimeContext: RuntimeContext<AWSRuntimeContext>): AWSSecurityConfig {
  const security = runtimeContext.get('aws-security');
  
  if (!security) {
    throw new Error('AWS security configuration not found in runtime context');
  }
  
  return security;
}

/**
 * Validates that runtime context contains all required AWS configuration
 */
export function validateAWSRuntimeContextComplete(runtimeContext: RuntimeContext<AWSRuntimeContext>): void {
  try {
    getAWSCredentialsFromContext(runtimeContext);
    getAWSConfigFromContext(runtimeContext);
    getAWSSecurityConfigFromContext(runtimeContext);
  } catch (error) {
    throw new Error(`Incomplete AWS runtime context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a runtime context for testing with mock credentials
 */
export function createMockAWSRuntimeContext(): RuntimeContext<AWSRuntimeContext> {
  const mockContext: AWSRuntimeContext = {
    'aws-credentials': {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      sessionToken: 'mock-session-token',
    },
    'aws-config': {
      region: 'us-east-1',
      profile: 'test',
      maxRetries: 3,
      timeout: 30000,
    },
    'aws-security': {
      tenantId: 'test-tenant',
      environment: 'development',
      resourceTagPrefix: 'test',
      maxResourcesPerTenant: 10,
      requiredTags: ['tenant', 'environment', 'test'],
    },
  };
  
  return createAWSRuntimeContext(mockContext);
}

/**
 * Clones an existing runtime context with new credentials
 */
export function cloneAWSRuntimeContextWithCredentials(
  sourceContext: RuntimeContext<AWSRuntimeContext>,
  newCredentials: AWSCredentials
): RuntimeContext<AWSRuntimeContext> {
  const config = getAWSConfigFromContext(sourceContext);
  const security = getAWSSecurityConfigFromContext(sourceContext);
  
  return createAWSRuntimeContextWithCredentials(newCredentials, config, security);
}

/**
 * Converts runtime context back to environment variable format
 * Useful for legacy integrations
 */
export function convertRuntimeContextToEnvVars(runtimeContext: RuntimeContext<AWSRuntimeContext>): Record<string, string> {
  const credentials = getAWSCredentialsFromContext(runtimeContext);
  const config = getAWSConfigFromContext(runtimeContext);
  const security = getAWSSecurityConfigFromContext(runtimeContext);
  
  const envVars: Record<string, string> = {
    AWS_ACCESS_KEY_ID: credentials.accessKeyId,
    AWS_SECRET_ACCESS_KEY: credentials.secretAccessKey,
    AWS_REGION: config.region,
    TENANT_ID: security.tenantId,
    NODE_ENV: security.environment,
  };
  
  if (credentials.sessionToken) {
    envVars.AWS_SESSION_TOKEN = credentials.sessionToken;
  }
  
  if (config.profile) {
    envVars.AWS_PROFILE = config.profile;
  }
  
  return envVars;
}

/**
 * Type guard to check if a runtime context is properly configured for AWS
 */
export function isValidAWSRuntimeContext(runtimeContext: any): runtimeContext is RuntimeContext<AWSRuntimeContext> {
  try {
    validateAWSRuntimeContextComplete(runtimeContext);
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates a runtime context with temporary credentials
 * Useful for STS-based authentication
 */
export function createAWSRuntimeContextWithTemporaryCredentials(
  accessKeyId: string,
  secretAccessKey: string,
  sessionToken: string,
  region?: string,
  tenantId?: string
): RuntimeContext<AWSRuntimeContext> {
  const credentials: AWSCredentials = {
    accessKeyId,
    secretAccessKey,
    sessionToken,
  };
  
  const config: Partial<AWSConfig> | undefined = region ? { region } : undefined;
  const security: Partial<AWSSecurityConfig> | undefined = tenantId ? { tenantId } : undefined;
  
  return createAWSRuntimeContextWithCredentials(credentials, config, security);
}
