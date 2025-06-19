# 🏗️ ZapGap CloudFormation Integration

## Overview

This directory contains a comprehensive CloudFormation workflow integration for the ZapGap AI agent system. The integration provides AWS infrastructure management capabilities through natural language interfaces, built on top of the AWS CloudFormation MCP (Model Context Protocol) server.

## 🚀 Quick Start

### Prerequisites

1. **Node.js/Bun**: Ensure you have Bun installed
2. **Python/uvx**: Required for the CloudFormation MCP server
3. **AWS Credentials**: Valid AWS credentials configured
4. **Environment Variables**: Properly configured `.env` file

### Installation

```bash
# Install dependencies
bun install

# Install uvx (if not already installed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test the CloudFormation integration
bun run test-cfn.ts
```

### Configuration

Copy and configure your environment variables:

```bash
# Copy the example environment file
cp .env .env.local

# Edit the environment variables
# Set your AWS credentials, Anthropic API key, and Upstash credentials
```

## 📁 Project Structure

```
agent/
├── src/mastra/
│   ├── agents/
│   │   └── cfn.ts              # CloudFormation agent with enhanced instructions
│   ├── mcps/
│   │   └── cfn.ts              # CloudFormation MCP client configuration
│   ├── tools/
│   │   └── cfn-tools.ts        # CloudFormation helper tools
│   ├── workflows/
│   │   └── cfn.ts              # CloudFormation deployment workflows
│   ├── config/
│   │   └── security.ts         # Multi-tenant security configuration
│   └── index.ts                # Main Mastra configuration
├── examples/
│   └── cloudformation-examples.ts  # Usage examples
├── docs/
│   └── cloudformation-integration.md  # Comprehensive documentation
├── test-cfn.ts                 # Test script
└── README-CloudFormation.md    # This file
```

## 🔧 Key Components

### 1. CloudFormation Agent (`src/mastra/agents/cfn.ts`)
- Expert AWS infrastructure assistant
- Comprehensive instructions for CloudFormation operations
- Multi-tenant security and tagging
- Integration with Mastra memory system

### 2. MCP Client (`src/mastra/mcps/cfn.ts`)
- Enhanced CloudFormation MCP server configuration
- Environment-based configuration
- Error handling and timeout management

### 3. Security Configuration (`src/mastra/config/security.ts`)
- Multi-tenant resource tagging
- Security validation and recommendations
- Cost allocation and resource naming conventions
- IAM policy recommendations

### 4. Helper Tools (`src/mastra/tools/cfn-tools.ts`)
- CloudFormation resource management helper
- Security validations and recommendations
- Multi-tenant tagging automation

### 5. Workflows (`src/mastra/workflows/cfn.ts`)
- Infrastructure deployment planning
- Multi-step resource deployment
- Validation and rollback strategies

## 🎯 Features

### Core Capabilities
- **Resource Management**: Create, read, update, delete, and list AWS resources
- **Schema Information**: Get CloudFormation resource schemas and property details
- **Template Generation**: Create CloudFormation templates from existing resources
- **Request Tracking**: Monitor the status of resource operations
- **Multi-tenant Support**: Automatic resource tagging and isolation
- **Security Controls**: IAM policy recommendations and validation

### Advanced Features
- **Workflow Automation**: Multi-step infrastructure deployments
- **Cost Management**: Resource tagging for billing and cost allocation
- **Audit Logging**: Comprehensive operation tracking
- **Error Recovery**: Rollback strategies and error handling
- **Environment Management**: Development, staging, and production isolation

## 🔒 Security & Multi-tenancy

### Automatic Resource Tagging
All resources are automatically tagged with:
- `zapgap:tenant`: Tenant identifier
- `zapgap:environment`: Environment (dev/staging/prod)
- `zapgap:created-by`: Creator identification
- `zapgap:created-at`: Creation timestamp
- `zapgap:cost-center`: Cost allocation

### Security Features
- Tenant-scoped resource access
- Environment-specific restrictions
- Operation-level permissions
- Audit logging for compliance
- IAM policy recommendations

## 📖 Usage Examples

### Basic Resource Operations

```typescript
// Create an S3 bucket
const response = await mastra.agents.cfnAgent.stream([
  {
    role: 'user',
    content: 'Create an S3 bucket for storing application logs with encryption enabled'
  }
]);

// List EC2 instances
const response = await mastra.agents.cfnAgent.stream([
  {
    role: 'user',
    content: 'Show me all EC2 instances in us-west-2'
  }
]);

// Get resource schema
const response = await mastra.agents.cfnAgent.stream([
  {
    role: 'user',
    content: 'Show me the CloudFormation schema for AWS::RDS::DBInstance'
  }
]);
```

### Advanced Infrastructure Deployment

```typescript
const response = await mastra.agents.cfnAgent.stream([
  {
    role: 'user',
    content: `Deploy a web application infrastructure with:
      1. VPC with public and private subnets
      2. Application Load Balancer
      3. Auto Scaling Group with t3.micro instances
      4. RDS MySQL database in private subnet
      5. S3 bucket for static assets
      
      Environment: development
      Region: us-east-1`
  }
]);
```

## 🧪 Testing

Run the test script to verify the integration:

```bash
bun run test-cfn.ts
```

The test script will:
1. Test basic agent response
2. Test resource schema requests
3. Test resource creation guidance

## 🚨 Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   ```bash
   # Check if uvx is installed
   uvx --version
   
   # Verify AWS credentials
   aws sts get-caller-identity
   ```

2. **Permission Denied Errors**
   - Verify IAM permissions match required policy
   - Check AWS credential configuration
   - Ensure region is correctly set

3. **Environment Variable Issues**
   - Verify all required environment variables are set
   - Check `.env` file configuration
   - Ensure AWS credentials are valid

### Debug Mode

Enable debug logging:
```bash
export DEBUG=true
export LOG_LEVEL=debug
```

## 📚 Documentation

For comprehensive documentation, see:
- [CloudFormation Integration Guide](../docs/cloudformation-integration.md)
- [Usage Examples](./examples/cloudformation-examples.ts)
- [Security Configuration](./src/mastra/config/security.ts)

## 🔗 Integration with ZapGap

The CloudFormation integration seamlessly integrates with the ZapGap ecosystem:
- **Ephemeral Pods**: Each agent pod has isolated AWS credentials
- **Session Management**: Infrastructure operations are tracked per session
- **Multi-tenancy**: Automatic tenant isolation and resource tagging
- **Audit Logging**: All operations are logged for compliance
- **Cost Tracking**: Resource costs are allocated to appropriate tenants

## 🤝 Contributing

When contributing to the CloudFormation integration:
1. Follow the existing code patterns and conventions
2. Add appropriate tests for new functionality
3. Update documentation for any new features
4. Ensure security best practices are followed
5. Test with multiple AWS regions and environments

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the comprehensive documentation
- Consult AWS CloudFormation documentation
- Open an issue in the ZapGap repository
