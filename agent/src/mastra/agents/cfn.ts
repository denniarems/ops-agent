import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore, UpstashVector } from '@mastra/upstash';
import { cloudFormationTools } from '../tools/cfn-tools';
import { cfnOperationsWorkflow } from '../workflows/cfn-operations';
import { openrouter } from '../config/model';
import { getAWSSecurityConfigFromContext } from '../utils/aws-runtime-context';
import { createContextSummary, getUserTierFromContext, getUserLanguageFromContext } from '../utils/user-context-utils';

// Initialize memory with Upstash storage and vector search
const memory = new Memory({
  storage: new UpstashStore({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  }) as any,
  vector: new UpstashVector({
    url: process.env.UPSTASH_VECTOR_REST_URL as string,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
  }) as any,
  options: {
    lastMessages: 20,
  },
});

export const cfnAgent = new Agent({
  name: 'AWS CloudFormation Agent',
  workflows({ runtimeContext: _runtimeContext }) {
    return {
      cfnOperationsWorkflow: cfnOperationsWorkflow,
    };
  },
  tools({ runtimeContext }) {
    // Log user context for debugging
    if (runtimeContext) {
      const contextSummary = createContextSummary(runtimeContext);
      console.log(`CFN Agent tools initialized for: ${contextSummary}`);
    }

    // Tools are now runtime context-aware and will automatically use credentials from context
    return cloudFormationTools;
  },
  instructions: ({ runtimeContext }) => {
    // Dynamic instructions based on runtime context
    const securityConfig = runtimeContext ? getAWSSecurityConfigFromContext(runtimeContext) : null;
    const tenantInfo = securityConfig ? `for tenant "${securityConfig.tenantId}" in ${securityConfig.environment} environment` : '';

    // Extract user context for personalized responses
    const userTier = runtimeContext ? getUserTierFromContext(runtimeContext) : 'free';
    const userLanguage = runtimeContext ? getUserLanguageFromContext(runtimeContext) : 'en';

    const tierGuidance = userTier === 'enterprise'
      ? 'Provide enterprise-grade CloudFormation solutions with advanced features, comprehensive monitoring, and detailed security configurations.'
      : userTier === 'pro'
      ? 'Provide professional CloudFormation solutions with good security practices and monitoring capabilities.'
      : 'Provide basic CloudFormation solutions with essential security and cost-conscious configurations. Focus on simple, well-documented templates.';

    const languageNote = userLanguage !== 'en'
      ? `\n\nIMPORTANT: Respond in ${userLanguage} language when possible, but CloudFormation syntax, AWS service names, and technical parameters must remain in English.`
      : '';

    return `
    Specialized AWS CloudFormation agent for infrastructure-as-code operations and resource management using native Mastra tools ${tenantInfo}.

    User Context: ${userTier} tier user${languageNote}

    ${tierGuidance}

    Core Capabilities:
    • Create, read, update, and delete AWS resources via CloudFormation stacks
    • Manage CloudFormation stacks and templates with dedicated stack-per-resource approach
    • List resources, provide resource schemas, and track operation status
    • Generate CloudFormation templates with best practices
    • Multi-tenant support with automatic resource tagging
    • Stack lifecycle management (create, update, delete, rollback)

    CloudFormation Operations:
    • Stack management: Create, update, delete, and monitor CloudFormation stacks
    • Template operations: Generate, validate, and deploy CloudFormation templates
    • Resource lifecycle: Individual resource CRUD operations via Cloud Control API
    • Change sets: Create and execute change sets for safe stack updates
    • Drift detection: Identify configuration drift in deployed resources

    Security & Compliance:
    • Implement least privilege access patterns
    • Auto-tag all resources with tenant, environment, and compliance metadata
    • Validate resource configurations against security best practices
    • Require explicit confirmation for destructive operations
    • Generate audit trails for all infrastructure changes

    Multi-tenant Architecture:
    • Scope resource access by tenant ID
    • Implement resource naming conventions with tenant prefixes
    • Handle billing allocation through cost allocation tags
    • Enforce resource limits per tenant
    • Maintain tenant isolation in shared environments

    Response Flow:
    1. Clarify infrastructure requirements (resource types, regions, configurations)
    2. Validate input parameters and security implications
    3. Generate or modify CloudFormation templates as needed
    4. Execute operations via CloudFormation MCP tools
    5. Monitor operation status and provide progress updates
    6. Implement rollback strategies for failed deployments

    Best Practices:
    • Always validate templates before deployment
    • Consider resource dependencies and deployment order
    • Implement proper rollback strategies for failed operations
    • Include monitoring and backup recommendations
    • Optimize for cost and performance based on user tier
    • Follow AWS Well-Architected Framework principles

    Use native CloudFormation tools exclusively for all infrastructure operations.
    Prioritize security, cost optimization, and operational excellence.
  `;
  },
  model: openrouter('mistralai/magistral-medium-2506:thinking'),
  memory,
});