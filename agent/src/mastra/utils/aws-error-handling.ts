import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials
} from '../types/aws-runtime-context';
import {
  getAWSCredentialsFromContext,
  isValidAWSRuntimeContext
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
 * Simplified for permanent credentials only - sessionToken generated via STS
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

  // Validate access key format (should start with AKIA for long-term credentials)
  if (!credentials.accessKeyId.match(/^AKIA[A-Z0-9]{16}$/)) {
    throw new AWSCredentialsError(
      `Invalid AWS Access Key ID format. Expected format: AKIA... followed by 16 alphanumeric characters. Got: ${credentials.accessKeyId.substring(0, 8)}...`
    );
  }

  // Validate secret key length (should be 40 characters)
  if (credentials.secretAccessKey.length !== 40) {
    throw new AWSCredentialsError(
      `Invalid AWS Secret Access Key length. Expected 40 characters, got ${credentials.secretAccessKey.length}`
    );
  }

  // Warn if temporary credentials are provided (should use permanent credentials)
  if (credentials.accessKeyId.startsWith('ASIA')) {
    console.warn('Temporary credentials (ASIA...) detected. Consider using permanent credentials (AKIA...) in runtime context and generate temporary credentials via STS when needed.');
  }
}

/**
 * Validates runtime context with simplified credential checking
 * Only validates AWS credentials - no config or security validation
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

    // Validate credentials only
    const credentials = getAWSCredentialsFromContext(runtimeContext);
    validateAWSCredentials(credentials);

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
