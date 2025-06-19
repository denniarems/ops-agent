import { MCPClient } from "@mastra/mcp";

// Environment config for documentation
const AWS_DOCUMENTATION_PARTITION = process.env.AWS_DOCUMENTATION_PARTITION || 'aws';
const AWS_DOCUMENTATION_TIMEOUT = parseInt(process.env.AWS_DOCUMENTATION_TIMEOUT || '30000');

// AWS Documentation MCP Client - focused on documentation and knowledge retrieval
export const documentationMcpClient = new MCPClient({
    servers: {
        "aws-documentation": {
            command: "uvx",
            args: [
                "awslabs.aws-documentation-mcp-server@latest"
            ],
            env: {
                FASTMCP_LOG_LEVEL: "ERROR",
                AWS_DOCUMENTATION_PARTITION: AWS_DOCUMENTATION_PARTITION,
            },
            timeout: AWS_DOCUMENTATION_TIMEOUT,
        }
    },
});

// Export config
export const documentationMcpConfig = {
    partition: AWS_DOCUMENTATION_PARTITION,
    timeout: AWS_DOCUMENTATION_TIMEOUT,
};
