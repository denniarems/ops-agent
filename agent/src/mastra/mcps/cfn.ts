import { MCPClient } from "@mastra/mcp";

// Environment configuration with defaults
const AWS_PROFILE = process.env.AWS_PROFILE || 'default';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN;
const CFN_MCP_SERVER_READONLY = process.env.CFN_MCP_SERVER_READONLY === 'true';
const CFN_MCP_SERVER_TIMEOUT = parseInt(process.env.CFN_MCP_SERVER_TIMEOUT || '30000');
const CFN_MCP_SERVER_MAX_RETRIES = parseInt(process.env.CFN_MCP_SERVER_MAX_RETRIES || '3');

// CloudFormation MCP Client with enhanced configuration using Docker
export const cfnMcpClient = new MCPClient({
    servers: {
        "cfn-mcp-server": {
            command: "docker",
            args: [
                "run",
                "--interactive",
                ...(AWS_ACCESS_KEY_ID ? ["--env", `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}`] : []),
                ...(AWS_SECRET_ACCESS_KEY ? ["--env", `AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}`] : []),
                ...(AWS_SESSION_TOKEN ? ["--env", `AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN}`] : []),
                "--env", `AWS_REGION=${AWS_REGION}`,
                "--env", `AWS_PROFILE=${AWS_PROFILE}`,
                "awslabs/cfn-mcp-server:latest",
                ...(CFN_MCP_SERVER_READONLY ? ["--readonly"] : [])
            ],
            env: {},
            timeout: CFN_MCP_SERVER_TIMEOUT,
        },
        "aws-core-mcp-server": {
            command: "docker",
            args: [
                "run",
                "-i",
                "mcp/aws-core-mcp-server"
            ]
        },
        "aws-documentation": {
            command: "docker",
            args: [
                "run",
                "-i",
                "mcp/aws-documentation"
            ]
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