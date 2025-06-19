import { MCPClient } from "@mastra/mcp";

// Environment configuration with defaults
const AWS_PROFILE = process.env.AWS_PROFILE || 'default';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const CFN_MCP_SERVER_READONLY = process.env.CFN_MCP_SERVER_READONLY === 'true';
const CFN_MCP_SERVER_TIMEOUT = parseInt(process.env.CFN_MCP_SERVER_TIMEOUT || '30000');
const CFN_MCP_SERVER_MAX_RETRIES = parseInt(process.env.CFN_MCP_SERVER_MAX_RETRIES || '3');

// CloudFormation MCP Client with enhanced configuration
export const cfnMcpClient = new MCPClient({
    servers: {
        "cfn-mcp-server": {
            command: "uvx",
            args: CFN_MCP_SERVER_READONLY
                ? ["awslabs.cfn-mcp-server@latest", "--readonly"]
                : ["awslabs.cfn-mcp-server@latest"],
            env: {
                AWS_PROFILE,
            },
            timeout: CFN_MCP_SERVER_TIMEOUT,
        }
    },
});

// Export configuration for use in other modules
export const cfnMcpConfig = {
    readonly: CFN_MCP_SERVER_READONLY,
    timeout: CFN_MCP_SERVER_TIMEOUT,
    maxRetries: CFN_MCP_SERVER_MAX_RETRIES,
    region: AWS_REGION,
    profile: AWS_PROFILE,
};