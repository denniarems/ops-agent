# ZapGap Agent Architecture

## Overview

The ZapGap agent system is built using the Mastra framework and consists of specialized agents that connect to AWS MCP (Model Context Protocol) servers for different AWS operations.

## Agent Architecture

### 1. Core Planning Agent (`coreAgent`)
- **Purpose**: Intelligent planning and orchestration of AWS solutions
- **MCP Server**: `awslabs.core-mcp-server`
- **Capabilities**:
  - Planning and guidance for orchestrating AWS Labs MCP Servers
  - Prompt understanding and intelligent task decomposition
  - Centralized configuration and coordination
  - Federation to other specialized MCP servers as needed

### 2. CloudFormation Agent (`cfnAgent`)
- **Purpose**: Specialized AWS CloudFormation operations and infrastructure-as-code management
- **Implementation**: Native TypeScript tools with AWS SDK integration
- **Capabilities**:
  - Create, read, update, and delete AWS resources via CloudFormation stacks
  - Manage CloudFormation stacks with dedicated stack-per-resource approach
  - Stack lifecycle management (create, update, delete, rollback)
  - Multi-tenant support with automatic resource tagging
  - Security and compliance enforcement
  - Enhanced error handling and AWS service limit management
  - Native tool integration for improved performance and debugging

### 3. Documentation Agent (`documentationAgent`)
- **Purpose**: AWS documentation and knowledge retrieval
- **MCP Server**: `awslabs.aws-documentation-mcp-server`
- **Capabilities**:
  - Access real-time AWS documentation and API references
  - Search AWS service documentation and best practices
  - Provide contextual help and recommendations
  - Retrieve AWS service information and usage patterns
  - Offer architectural guidance and design patterns

## MCP Client Structure

### Core MCP Client (`coreMcpClient`)
```typescript
// File: agent/src/mastra/mcps/core.ts
- Server: awslabs.core-mcp-server
- Purpose: Planning and orchestration
```

### CloudFormation Native Tools (`cloudFormationTools`)
```typescript
// File: agent/src/mastra/tools/cfn-tools.ts
- Implementation: Native TypeScript tools with AWS SDK
- Purpose: CloudFormation operations via direct AWS API calls
- Features: AWS STS credentials, region config, readonly mode, enhanced error handling
- Tools: create_resource, get_resource, update_resource, delete_resource,
         list_resources, get_request_status, create_template, get_resource_schema_information
```

### Documentation MCP Client (`documentationMcpClient`)
```typescript
// File: agent/src/mastra/mcps/documentation.ts
- Server: awslabs.aws-documentation-mcp-server
- Purpose: Documentation and knowledge retrieval
```

## Agent Specialization Benefits

1. **Separation of Concerns**: Each agent focuses on its specific domain
2. **Optimized Performance**: Agents only load tools relevant to their purpose
3. **Scalability**: Easy to add new specialized agents for other AWS services
4. **Maintainability**: Clear boundaries between different functionalities
5. **Security**: Each agent can have specific security configurations

## Usage Patterns

### For Infrastructure Operations
Use the **CloudFormation Agent** for:
- Creating and managing AWS resources
- Infrastructure-as-code operations
- Stack management and deployments

### For Documentation and Guidance
Use the **Documentation Agent** for:
- Looking up AWS service information
- Getting best practices and recommendations
- Understanding AWS APIs and configurations

### For Planning and Coordination
Use the **Core Planning Agent** for:
- Breaking down complex AWS requirements
- Coordinating between multiple services
- High-level architectural planning

## Configuration

All agents share the same memory configuration using Upstash for storage and vector search, ensuring consistent context and learning across the system.

Environment variables control agent behavior:
- `AWS_REGION`: AWS region for operations
- `CFN_MCP_SERVER_READONLY`: Enable readonly mode for CloudFormation operations
- `CFN_MCP_SERVER_TIMEOUT`: Timeout for CloudFormation operations (default: 30000ms)
- `CFN_MCP_SERVER_MAX_RETRIES`: Maximum retry attempts for failed operations (default: 3)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials for STS token generation
- `AWS_DOCUMENTATION_PARTITION`: Documentation partition (default: 'aws')
