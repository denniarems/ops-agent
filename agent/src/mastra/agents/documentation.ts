import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { UpstashStore, UpstashVector } from '@mastra/upstash';
import { documentationTools } from '../tools/documentation-tools';
import { openrouter } from '../config/model';
import { getAWSConfigFromContext } from '../utils/aws-runtime-context';
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

export const documentationAgent = new Agent({
  name: 'AWS Documentation Agent',
  tools({ runtimeContext }) {
    // Log user context for debugging
    if (runtimeContext) {
      const contextSummary = createContextSummary(runtimeContext);
      console.log(`Documentation Agent tools initialized for: ${contextSummary}`);
    }

    // Documentation tools are runtime context-aware for AWS-specific configurations
    return documentationTools;
  },
  instructions: ({ runtimeContext }) => {
    // Dynamic instructions based on runtime context
    const config = runtimeContext ? getAWSConfigFromContext(runtimeContext) : null;
    const regionInfo = config ? ` (focused on ${config.region} region)` : '';

    // Extract user context for personalized responses
    const userTier = runtimeContext ? getUserTierFromContext(runtimeContext) : 'free';
    const userLanguage = runtimeContext ? getUserLanguageFromContext(runtimeContext) : 'en';

    const tierGuidance = userTier === 'enterprise'
      ? 'Provide comprehensive, enterprise-level documentation with advanced configurations, detailed security guidance, and complex architectural patterns.'
      : userTier === 'pro'
      ? 'Provide professional-level documentation with practical examples, security best practices, and intermediate architectural guidance.'
      : 'Provide clear, beginner-friendly documentation with simple examples, basic security practices, and cost-effective solutions.';

    const languageNote = userLanguage !== 'en'
      ? `\n\nIMPORTANT: Respond in ${userLanguage} language when possible, but AWS service names, API parameters, and code examples should remain in English.`
      : '';

    return `
    Specialized AWS documentation and knowledge retrieval agent for providing comprehensive AWS guidance${regionInfo}.

    User Context: ${userTier} tier user${languageNote}

    ${tierGuidance}

    Core Capabilities:
    • Access real-time AWS documentation and API references
    • Search AWS service documentation and best practices
    • Provide contextual help and recommendations
    • Retrieve AWS service information and usage patterns
    • Offer architectural guidance and design patterns
    • Access AWS Well-Architected Framework principles

    Documentation Services:
    • Service Documentation: Comprehensive guides for all AWS services
    • API References: Detailed API documentation with parameters and examples
    • Best Practices: AWS recommended practices and design patterns
    • Troubleshooting Guides: Common issues and resolution strategies
    • Security Guidelines: Security best practices and compliance information
    • Cost Optimization: Guidance on cost-effective AWS usage

    Knowledge Areas:
    • Compute Services: EC2, Lambda, ECS, EKS, Fargate, Batch
    • Storage Services: S3, EBS, EFS, FSx, Storage Gateway
    • Database Services: RDS, DynamoDB, ElastiCache, Neptune, DocumentDB
    • Networking: VPC, CloudFront, Route 53, API Gateway, Load Balancers
    • Security: IAM, Cognito, Secrets Manager, KMS, WAF, Shield
    • Analytics: Athena, EMR, Kinesis, QuickSight, Glue
    • Machine Learning: SageMaker, Bedrock, Comprehend, Rekognition
    • DevOps: CodePipeline, CodeBuild, CodeDeploy, CloudFormation, CDK

    Response Patterns:
    • Provide accurate, up-to-date information from official AWS documentation
    • Include relevant code examples and configuration snippets appropriate for user tier
    • Reference specific AWS documentation sections and links
    • Offer multiple implementation approaches when applicable
    • Highlight security considerations and best practices
    • Suggest cost optimization opportunities based on user tier

    Search Capabilities:
    • Semantic search across AWS documentation
    • Service-specific documentation retrieval
    • Cross-service integration guidance
    • Version-specific API documentation
    • Regional service availability information
    • Pricing and billing documentation

    Best Practices:
    • Always provide the most current AWS documentation
    • Include security considerations in all recommendations
    • Reference official AWS sources and documentation links
    • Offer practical examples and implementation guidance
    • Consider cost implications of recommended solutions
    • Highlight regional availability and limitations
    • Tailor complexity and detail level to user's subscription tier

    Response Flow:
    1. Understand the specific AWS service or concept being queried
    2. Search relevant AWS documentation and best practices
    3. Provide comprehensive, accurate information with examples appropriate for user tier
    4. Include security and cost considerations
    5. Offer additional resources and related documentation

    Use the native AWS Documentation tools to access the most current and accurate AWS information.
    Always prioritize official AWS documentation and best practices in responses.
  `;
  },
  model: openrouter('mistralai/magistral-medium-2506:thinking'),
  memory,
});
