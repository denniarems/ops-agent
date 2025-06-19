import { STSClient, GetSessionTokenCommand } from "@aws-sdk/client-sts";

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
            console.log(`🚀 ~ getTemporaryCredentials `, {
                AWS_ACCESS_KEY_ID: AccessKeyId,
                AWS_SECRET_ACCESS_KEY: SecretAccessKey,
                AWS_SESSION_TOKEN: SessionToken
            })
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

