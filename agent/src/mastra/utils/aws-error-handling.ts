import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials
} from '../types/aws-runtime-context';
import { 
  getAWSCredentialsFromContext,
  getAWSConfigFromContext,
  getAWSSecurityConfigFromContext,
  isValidAWSRuntimeContext,
  createAWSRuntimeContextFromEnvironment
} from './aws-runtime-context';

/**
 * AWS Runtime Context Error Handling and Validation
 * 
 * This module provides comprehensive error handling, validation, and fallback
 * mechanisms for AWS runtime context in Mastra agents.
 */

// Custom error classes for better error handling
export class AWSCredentialsError extends Error {
  constructor(message: string, public code: string = 'CREDENTIALS_ERROR') {
    super(message);
    this.name = 'AWSCredentialsError';
  }
}

export class AWSConfigurationError extends Error {
  constructor(message: string, public code: string = 'CONFIGURATION_ERROR') {
    super(message);
    this.name = 'AWSConfigurationError';
  }
}

export class AWSValidationError extends Error {
  constructor(message: string, public code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'AWSValidationError';
  }
}

export class AWSPermissionError extends Error {
  constructor(message: string, public code: string = 'PERMISSION_ERROR') {
    super(message);
    this.name = 'AWSPermissionError';
  }
}

/**
 * Validates AWS credentials with detailed error messages
 */
export function validateAWSCredentials(credentials: AWSCredentials): void {
  if (!credentials) {
    throw new AWSCredentialsError('AWS credentials are required but not provided');
  }

  if (!credentials.accessKeyId) {
    throw new AWSCredentialsError('AWS Access Key ID is required but missing');
  }

  if (!credentials.secretAccessKey) {
    throw new AWSCredentialsError('AWS Secret Access Key is required but missing');
  }

  // Validate access key format (should start with AKIA for long-term, ASIA for temporary)
  if (!credentials.accessKeyId.match(/^(AKIA|ASIA)[A-Z0-9]{16}$/)) {
    throw new AWSCredentialsError(
      `Invalid AWS Access Key ID format. Expected format: AKIA... or ASIA... followed by 16 alphanumeric characters. Got: ${credentials.accessKeyId.substring(0, 8)}...`
    );
  }

  // Validate secret key length (should be 40 characters)
  if (credentials.secretAccessKey.length !== 40) {
    throw new AWSCredentialsError(
      `Invalid AWS Secret Access Key length. Expected 40 characters, got ${credentials.secretAccessKey.length}`
    );
  }

  // If session token is provided, validate it's not empty
  if (credentials.sessionToken !== undefined && credentials.sessionToken.length === 0) {
    throw new AWSCredentialsError('AWS Session Token provided but is empty');
  }

  // Check for temporary credentials consistency
  const isTemporary = credentials.accessKeyId.startsWith('ASIA');
  if (isTemporary && !credentials.sessionToken) {
    throw new AWSCredentialsError(
      'Temporary credentials (ASIA...) require a session token, but none was provided'
    );
  }

  if (!isTemporary && credentials.sessionToken) {
    console.warn('Session token provided with long-term credentials (AKIA...). This is unusual but not necessarily an error.');
  }
}

/**
 * Validates runtime context with comprehensive error checking
 */
export function validateRuntimeContextSafely(
  runtimeContext: RuntimeContext<AWSRuntimeContext> | undefined
): { isValid: boolean; error?: Error; warnings: string[] } {
  const warnings: string[] = [];

  if (!runtimeContext) {
    return {
      isValid: false,
      error: new AWSValidationError('Runtime context is required but not provided'),
      warnings
    };
  }

  try {
    // Check if it's a valid AWS runtime context
    if (!isValidAWSRuntimeContext(runtimeContext)) {
      return {
        isValid: false,
        error: new AWSValidationError('Runtime context is not a valid AWS runtime context'),
        warnings
      };
    }

    // Validate credentials
    const credentials = getAWSCredentialsFromContext(runtimeContext);
    validateAWSCredentials(credentials);

    // Validate configuration
    const config = getAWSConfigFromContext(runtimeContext);
    if (!config.region) {
      warnings.push('AWS region not specified, using default');
    }

    if (config.maxRetries < 0 || config.maxRetries > 10) {
      warnings.push(`Max retries (${config.maxRetries}) is outside recommended range (0-10)`);
    }

    if (config.timeout < 1000 || config.timeout > 300000) {
      warnings.push(`Timeout (${config.timeout}ms) is outside recommended range (1000-300000ms)`);
    }

    // Validate security configuration
    const security = getAWSSecurityConfigFromContext(runtimeContext);
    if (!security.tenantId) {
      warnings.push('Tenant ID not specified, using default');
    }

    if (security.maxResourcesPerTenant > 1000) {
      warnings.push(`Max resources per tenant (${security.maxResourcesPerTenant}) is very high`);
    }

    return { isValid: true, warnings };

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error : new Error(String(error)),
      warnings
    };
  }
}

/**
 * Safe credential extraction with fallback mechanisms
 */
export function safeGetAWSCredentials(
  runtimeContext?: RuntimeContext<AWSRuntimeContext>
): { credentials?: AWSCredentials; error?: Error; usedFallback: boolean } {
  try {
    if (runtimeContext) {
      const validation = validateRuntimeContextSafely(runtimeContext);
      if (validation.isValid) {
        return {
          credentials: getAWSCredentialsFromContext(runtimeContext),
          usedFallback: false
        };
      } else {
        console.warn('Runtime context validation failed, attempting fallback:', validation.error?.message);
      }
    }

    // Fallback to environment variables
    try {
      const fallbackContext = createAWSRuntimeContextFromEnvironment();
      const fallbackCredentials = getAWSCredentialsFromContext(fallbackContext);
      
      // Validate fallback credentials
      validateAWSCredentials(fallbackCredentials);
      
      console.info('Using fallback credentials from environment variables');
      return {
        credentials: fallbackCredentials,
        usedFallback: true
      };
    } catch (fallbackError) {
      return {
        error: new AWSCredentialsError(
          `Failed to get credentials from runtime context and environment fallback: ${fallbackError instanceof Error ? fallbackError.message : fallbackError}`
        ),
        usedFallback: true
      };
    }

  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
      usedFallback: false
    };
  }
}

/**
 * Enhanced error handler for AWS operations
 */
export function handleAWSError(error: any, operation: string): Error {
  // Handle AWS SDK errors
  if (error.name === 'CredentialsError' || error.code === 'CredentialsError') {
    return new AWSCredentialsError(
      `AWS credentials error during ${operation}: ${error.message}`,
      'CREDENTIALS_ERROR'
    );
  }

  if (error.name === 'UnauthorizedOperation' || error.code === 'UnauthorizedOperation') {
    return new AWSPermissionError(
      `Insufficient permissions for ${operation}: ${error.message}`,
      'PERMISSION_ERROR'
    );
  }

  if (error.name === 'AccessDenied' || error.code === 'AccessDenied') {
    return new AWSPermissionError(
      `Access denied for ${operation}: ${error.message}`,
      'ACCESS_DENIED'
    );
  }

  if (error.name === 'InvalidUserID.NotFound' || error.code === 'InvalidUserID.NotFound') {
    return new AWSCredentialsError(
      `Invalid AWS credentials for ${operation}: User not found`,
      'INVALID_USER'
    );
  }

  if (error.name === 'SignatureDoesNotMatch' || error.code === 'SignatureDoesNotMatch') {
    return new AWSCredentialsError(
      `Invalid AWS credentials for ${operation}: Signature mismatch`,
      'SIGNATURE_MISMATCH'
    );
  }

  if (error.name === 'TokenRefreshRequired' || error.code === 'TokenRefreshRequired') {
    return new AWSCredentialsError(
      `AWS credentials expired for ${operation}: Token refresh required`,
      'TOKEN_EXPIRED'
    );
  }

  if (error.name === 'ValidationError' || error.code === 'ValidationError') {
    return new AWSValidationError(
      `AWS validation error during ${operation}: ${error.message}`,
      'VALIDATION_ERROR'
    );
  }

  if (error.name === 'NetworkingError' || error.code === 'NetworkingError') {
    return new AWSConfigurationError(
      `Network error during ${operation}: ${error.message}`,
      'NETWORK_ERROR'
    );
  }

  if (error.name === 'TimeoutError' || error.code === 'TimeoutError') {
    return new AWSConfigurationError(
      `Timeout error during ${operation}: ${error.message}`,
      'TIMEOUT_ERROR'
    );
  }

  // Handle region-specific errors
  if (error.message && error.message.includes('region')) {
    return new AWSConfigurationError(
      `Region configuration error during ${operation}: ${error.message}`,
      'REGION_ERROR'
    );
  }

  // Generic error handling
  return new Error(`AWS operation failed during ${operation}: ${error.message || error}`);
}

/**
 * Retry mechanism for AWS operations with exponential backoff
 */
export async function retryAWSOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleAWSError(error, operationName);

      // Don't retry on certain errors
      if (lastError instanceof AWSCredentialsError || 
          lastError instanceof AWSPermissionError ||
          lastError instanceof AWSValidationError) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`AWS operation ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Development environment fallback for missing credentials
 */
export function createDevelopmentFallback(): RuntimeContext<AWSRuntimeContext> {
  console.warn('Creating development fallback credentials. DO NOT USE IN PRODUCTION!');
  
  const mockCredentials: AWSCredentials = {
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    sessionToken: 'development-session-token'
  };

  const mockContext: AWSRuntimeContext = {
    'aws-credentials': mockCredentials,
    'aws-config': {
      region: 'us-east-1',
      maxRetries: 3,
      timeout: 30000
    },
    'aws-security': {
      tenantId: 'development',
      environment: 'development',
      resourceTagPrefix: 'dev',
      maxResourcesPerTenant: 10,
      requiredTags: ['environment', 'tenant']
    }
  };

  const runtimeContext = new RuntimeContext<AWSRuntimeContext>();
  runtimeContext.set('aws-credentials', mockContext['aws-credentials']);
  runtimeContext.set('aws-config', mockContext['aws-config']);
  runtimeContext.set('aws-security', mockContext['aws-security']);

  return runtimeContext;
}

/**
 * Comprehensive validation and error reporting
 */
export function validateAndReportErrors(
  runtimeContext?: RuntimeContext<AWSRuntimeContext>
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!runtimeContext) {
    errors.push('Runtime context is required but not provided');
    return { isValid: false, errors, warnings };
  }

  const validation = validateRuntimeContextSafely(runtimeContext);
  
  if (!validation.isValid) {
    errors.push(validation.error?.message || 'Unknown validation error');
  }

  warnings.push(...validation.warnings);

  return {
    isValid: validation.isValid,
    errors,
    warnings
  };
}
