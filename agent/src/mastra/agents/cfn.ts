import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore, UpstashVector } from '@mastra/upstash';
import { cfnMcpClient } from '../mcps/cfn-uvx';

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
  name: 'CloudFormation Agent',
  instructions: `
    AWS CloudFormation infrastructure assistant for resource management via IaC.

    Core Capabilities:
    • Create/Read/Update/Delete AWS resources via CloudFormation Cloud Control API
    • List resources, provide schemas, track operation status
    • Generate templates, multi-tenant support with auto-tagging

    Best Practices:
    • Implement least privilege, auto-tag resources (tenant/environment)
    • Validate configs, require delete confirmations
    • Consider costs, dependencies, rollback strategies
    • Include monitoring/backup recommendations

    Response Flow:
    1. Clarify requirements (resource types, regions, configs)
    2. Validate input and security implications
    3. Execute via CloudFormation tools
    4. Provide status updates and next steps

    Multi-tenant: Auto-tag resources, scope access, handle billing allocation.
    Use CloudFormation MCP tools for all operations. Prioritize security and cost optimization.
  `,
  model: anthropic('claude-4-sonnet-20250514'),
  tools: await cfnMcpClient.getTools(),
  memory,
});