import { MCPClient } from "@mastra/mcp";
import { getTemporaryCredentials } from "../config/sts";

// Environment config
const AWS_PROFILE =  'default';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const CFN_MCP_SERVER_READONLY = process.env.CFN_MCP_SERVER_READONLY === 'true';
const CFN_MCP_SERVER_TIMEOUT = parseInt(process.env.CFN_MCP_SERVER_TIMEOUT || '30000');
const CFN_MCP_SERVER_MAX_RETRIES = parseInt(process.env.CFN_MCP_SERVER_MAX_RETRIES || '3');

// CloudFormation MCP Client using uvx
export const cfnMcpClient = new MCPClient({
    servers: {
        "cfn-mcp-server": {
            command: "uvx",
            args: [
                "awslabs.cfn-mcp-server@latest",
                ...(CFN_MCP_SERVER_READONLY ? ["--readonly"] : [])
            ],
            env: {
                AWS_PROFILE: AWS_PROFILE,
                AWS_REGION: AWS_REGION,
                ... await getTemporaryCredentials()
            },
            timeout: CFN_MCP_SERVER_TIMEOUT,
        },
        "aws-core-mcp-server": {
            command: "uvx",
            args: [
                "awslabs.core-mcp-server@latest"
            ],
            env: {
                FASTMCP_LOG_LEVEL: "ERROR",
            }
        },
        "aws-documentation": {
            command: "uvx",
            args: [
                "awslabs.aws-documentation-mcp-server@latest"
            ],
            env: {
                FASTMCP_LOG_LEVEL: "ERROR",
                AWS_DOCUMENTATION_PARTITION: "aws",
            }
        }
    },
});

// Export config
export const cfnMcpConfig = {
    readonly: CFN_MCP_SERVER_READONLY,
    timeout: CFN_MCP_SERVER_TIMEOUT,
    maxRetries: CFN_MCP_SERVER_MAX_RETRIES,
    region: AWS_REGION,
    profile: AWS_PROFILE,
};