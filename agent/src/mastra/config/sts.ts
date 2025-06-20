import { STSClient, GetSessionTokenCommand } from "@aws-sdk/client-sts";
import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials
} from '../types/aws-runtime-context';
import {
  getAWSCredentialsFromContext
} from '../utils/aws-runtime-context';

// Type for temporary credentials that include sessionToken
export interface TemporaryAWSCredentials extends AWSCredentials {
  sessionToken: string;
}

/**
 * Enhanced STS credential management with runtime context support
 */

/**
 * Get temporary credentials using runtime context
 * This is the preferred method for dynamic credential management
 * Returns temporary credentials with sessionToken
 */
export async function getTemporaryCredentialsFromContext(
  runtimeContext: RuntimeContext<AWSRuntimeContext>,
  durationSeconds: number = 3600,
  region: string = 'us-east-1'
): Promise<TemporaryAWSCredentials> {
  const credentials = getAWSCredentialsFromContext(runtimeContext);

  const client = new STSClient({
    region: region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      // No sessionToken needed for base credentials
    },
    maxAttempts: 3,
  });

  const command = new GetSessionTokenCommand({
    DurationSeconds: durationSeconds,
  });

  try {
    const response = await client.send(command);
    if (response.Credentials) {
      const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials;

      return {
        accessKeyId: AccessKeyId!,
        secretAccessKey: SecretAccessKey!,
        sessionToken: SessionToken!,
      };
    }
    throw new Error('No credentials returned from STS');
  } catch (error) {
    console.error("Error getting session token from runtime context:", error);
    throw error;
  }
}

/**
 * Create STS client using runtime context credentials
 * Uses only permanent credentials from runtime context
 */
export function createSTSClientFromContext(
  runtimeContext: RuntimeContext<AWSRuntimeContext>,
  region: string = 'us-east-1'
): STSClient {
  const credentials = getAWSCredentialsFromContext(runtimeContext);

  return new STSClient({
    region: region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      // No sessionToken needed for base credentials
    },
    maxAttempts: 3,
  });
}

/**
 * Create AWS SDK client credentials object with sessionToken
 * Useful for initializing AWS SDK clients that require temporary credentials
 */
export async function createAWSSDKCredentials(
  runtimeContext: RuntimeContext<AWSRuntimeContext>,
  durationSeconds: number = 3600,
  region: string = 'us-east-1'
): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}> {
  const tempCredentials = await getTemporaryCredentialsFromContext(runtimeContext, durationSeconds, region);

  return {
    accessKeyId: tempCredentials.accessKeyId,
    secretAccessKey: tempCredentials.secretAccessKey,
    sessionToken: tempCredentials.sessionToken,
  };
}

/**
 * Example usage:
 *
 * // 1. Create runtime context with permanent credentials
 * const runtimeContext = new RuntimeContext<AWSRuntimeContext>();
 * runtimeContext.set('aws-credentials', {
 *   accessKeyId: 'AKIA...',
 *   secretAccessKey: 'your-secret-key'
 * });
 *
 * // 2. Get temporary credentials when needed for AWS SDK clients
 * const tempCredentials = await getTemporaryCredentialsFromContext(runtimeContext);
 *
 * // 3. Use temporary credentials with AWS SDK
 * const s3Client = new S3Client({
 *   region: 'us-east-1',
 *   credentials: tempCredentials
 * });
 */

