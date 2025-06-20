import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials,
  hasValidAWSCredentials
} from '../types/aws-runtime-context';

/**
 * AWS Runtime Context Utility Functions
 * 
 * This module provides utility functions for creating, validating, and managing
 * AWS runtime context instances in Mastra agents and tools.
 */

/**
 * Creates AWS runtime context with custom credentials
 * Simplified to only handle credentials
 */
export function createAWSRuntimeContextWithCredentials(
  credentials: AWSCredentials
): RuntimeContext<AWSRuntimeContext> {
  const runtimeContext = new RuntimeContext<AWSRuntimeContext>();
  runtimeContext.set('aws-credentials', credentials);
  return runtimeContext;
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
 * Validates that runtime context contains all required AWS configuration
 */
export function validateAWSRuntimeContextComplete(runtimeContext: RuntimeContext<AWSRuntimeContext>): void {
  try {
    getAWSCredentialsFromContext(runtimeContext);
  } catch (error) {
    throw new Error(`Incomplete AWS runtime context: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
