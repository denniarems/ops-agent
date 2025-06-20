import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore, UpstashVector } from '@mastra/upstash';
import { coreTools } from '../tools/core-tools';
import { openrouter } from '../config/model';
import { documentationAccessWorkflow } from '../workflows/documentation-access';

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


export const coreAgent = new Agent({
  name: 'AWS Core Planning Agent',
  tools({ runtimeContext }) {
    // Log AWS context for debugging
    if (runtimeContext) {
      const hasCredentials = runtimeContext.get('aws-credentials');
      console.log(`Core Agent tools initialized with AWS credentials: ${!!hasCredentials}`);
    }

    // Core tools are runtime context-aware for AWS coordination and user context
    return coreTools;
  },
  instructions: ({ runtimeContext }) => {
    // Dynamic instructions based on AWS runtime context only
    const hasCredentials = runtimeContext && runtimeContext.get('aws-credentials');
    const credentialInfo = hasCredentials ? ' with AWS credentials configured' : ' (no AWS credentials available)';

    return `
    AWS Core Planning agent for intelligent planning and orchestration of AWS solutions${credentialInfo}.

    Provide clear, practical AWS solutions with step-by-step guidance and implementation details.

    Core Capabilities:
    • Planning and guidance for orchestrating AWS solutions
    • Prompt understanding and intelligent task decomposition
    • Centralized configuration and coordination
    • Federation to other specialized agents and services as needed

    Planning Process:
    • Analyze user requirements and break down complex AWS tasks
    • Recommend appropriate AWS services and tools for specific use cases
    • Provide step-by-step guidance for AWS solution implementation
    • Coordinate between multiple agents and services when needed

    Best Practices:
    • Start with understanding the full scope of user requirements
    • Recommend the most appropriate AWS services and tools
    • Provide clear, actionable plans with proper sequencing
    • Consider security, cost optimization, and best practices
    • Guide users through proper AWS resource management
    • Tailor complexity and detail level to user's subscription tier

    Response Flow:
    1. Understand and analyze the user's AWS requirements
    2. Create a comprehensive plan using appropriate AWS services and tools
    3. Provide clear guidance and next steps appropriate for user's tier
    4. Coordinate with specialized agents and services as needed

    Use the native Core tools as the starting point for every AWS project and orchestrate other specialized services based on specific needs.
  `;
  },
  model: openrouter('mistralai/magistral-medium-2506:thinking'),
  workflows: {
    documentationAccessWorkflow,
  },
  memory,
});