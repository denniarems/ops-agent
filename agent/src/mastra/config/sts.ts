import { STSClient, GetSessionTokenCommand } from "@aws-sdk/client-sts";
import { RuntimeContext } from '@mastra/core/runtime-context';
import {
  AWSRuntimeContext,
  AWSCredentials
} from '../types/aws-runtime-context';
import {
  getAWSCredentialsFromContext,
  getAWSConfigFromContext
} from '../utils/aws-runtime-context';

/**
 * Enhanced STS credential management with runtime context support
 */

// Legacy function for backward compatibility
export async function getTemporaryCredentials() {
    const client = new STSClient({
        region: process.env.AWS_REGION as string,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
    });

    const command = new GetSessionTokenCommand({
        DurationSeconds: 3600, // Duration in seconds (e.g., 1 hour)
    });

    try {
        const response = await client.send(command);
        if (response.Credentials) {
            const { AccessKeyId, SecretAccessKey, SessionToken } = response.Credentials;
            return {
                AWS_ACCESS_KEY_ID: AccessKeyId,
                AWS_SECRET_ACCESS_KEY: SecretAccessKey,
                AWS_SESSION_TOKEN: SessionToken
            };
        }
    } catch (error) {
        console.error("Error getting session token:", error);
        throw error;
    }
}

/**
 * Get temporary credentials using runtime context
 * This is the preferred method for dynamic credential management
 */
export async function getTemporaryCredentialsFromContext(
  runtimeContext: RuntimeContext<AWSRuntimeContext>,
  durationSeconds: number = 3600
): Promise<AWSCredentials> {
  const credentials = getAWSCredentialsFromContext(runtimeContext);
  const config = getAWSConfigFromContext(runtimeContext);

  const client = new STSClient({
    region: config.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    maxAttempts: config.maxRetries,
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
 */
export function createSTSClientFromContext(runtimeContext: RuntimeContext<AWSRuntimeContext>): STSClient {
  const credentials = getAWSCredentialsFromContext(runtimeContext);
  const config = getAWSConfigFromContext(runtimeContext);

  return new STSClient({
    region: config.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    maxAttempts: config.maxRetries,
  });
}

