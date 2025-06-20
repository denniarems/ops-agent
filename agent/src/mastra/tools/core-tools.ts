import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Static content from PROMPT_UNDERSTANDING.md
const PROMPT_UNDERSTANDING = `# AWSLABS.CORE-MCP-SERVER - How to translate a user query into AWS expert advice

## 1. Initial Query Analysis

When a user presents a query, follow these steps to break it down:

### 1.1 Core Components Identification
- Extract key technical requirements
- Identify business objectives
- Identify industry and use-case requirements
- Note any specific constraints or preferences
- Determine if it's a new project or enhancement

### 1.2 Architecture Patterns
- Identify the type of application (web, mobile, serverless, etc.)
- Determine data storage requirements
- Identify integration points
- Note security and compliance needs

## 2. AWS Service Mapping

### 2.1 Available Tools for Analysis

#### Core MCP Server
- Use \`awslabs.core-mcp-server\` tools for:
  - prompt_understanding: Initial query analysis and guidance on using MCP servers

#### CDK MCP Server
- Use \`awslabs.cdk-mcp-server\` for infrastructure patterns and CDK guidance:
  - CDKGeneralGuidance: Get prescriptive CDK advice for building applications on AWS
  - ExplainCDKNagRule: Explain a specific CDK Nag rule with AWS Well-Architected guidance
  - CheckCDKNagSuppressions: Check if CDK code contains Nag suppressions that require human review
  - GenerateBedrockAgentSchema: Generate OpenAPI schema for Bedrock Agent Action Groups
  - GetAwsSolutionsConstructPattern: Search and discover AWS Solutions Constructs patterns
  - SearchGenAICDKConstructs: Search for GenAI CDK constructs by name or type
  - LambdaLayerDocumentationProvider: Provide documentation sources for Lambda layers

#### Bedrock KB Retrieval MCP Server
- Use \`awslabs.bedrock-kb-retrieval-mcp-server\` to query user-defined knowledge bases:
  - QueryKnowledgeBases: Query an Amazon Bedrock Knowledge Base using natural language

#### Nova Canvas MCP Server
- Use \`awslabs.nova-canvas-mcp-server\` to generate images:
  - generate_image: Generate an image using Amazon Nova Canvas with text prompt
  - generate_image_with_colors: Generate an image using Amazon Nova Canvas with color guidance

#### Cost Analysis MCP Server
- Use \`awslabs.cost-analysis-mcp-server\` for analyzing AWS service costs:
  - analyze_cdk_project: Analyze a CDK project to identify AWS services used
  - get_pricing_from_web: Get pricing information from AWS pricing webpage
  - get_pricing_from_api: Get pricing information from AWS Price List API
  - get_bedrock_patterns: Get architecture patterns for Amazon Bedrock applications
  - generate_cost_report: Generate a detailed cost analysis report based on pricing data

#### AWS Documentation MCP Server
- Use \`awslabs.aws-documentation-mcp-server\` for requesting specific AWS documentation:
  - read_documentation: Fetch and convert an AWS documentation page to markdown format
  - search_documentation: Search AWS documentation using the official AWS Documentation Search API
  - recommend: Get content recommendations for an AWS documentation page

#### AWS Diagram MCP Server
- Use \`awslabs.aws-diagram-mcp-server\` fir creating diagrams to support the solution:
  - generate_diagram: Generate a diagram from Python code using the diagrams package.
  - get_diagram_examples: Get example code for different types of diagrams.
  - list_icons: This tool dynamically inspects the diagrams package to find all available
    providers, services, and icons that can be used in diagrams

#### Terraform MCP Server
- Use \`awslabs.terraform-mcp-server\` for Terraform infrastructure management and analysis:
  - ExecuteTerraformCommand: Execute Terraform workflow commands (init, plan, validate, apply, destroy) against an AWS account
  - SearchAwsProviderDocs: Search AWS provider documentation for resources and attributes
  - SearchAwsccProviderDocs: Search AWSCC provider documentation for resources and attributes
  - SearchSpecificAwsIaModules: Search for specific AWS-IA Terraform modules (Bedrock, OpenSearch Serverless, SageMaker, Streamlit)
  - RunCheckovScan: Run Checkov security scan on Terraform code to identify vulnerabilities and misconfigurations
  - SearchUserProvidedModule: Search for a user-provided Terraform registry module and understand its inputs, outputs, and usage

### 2.2 Modern AWS Service Categories

Map user requirements to these AWS categories:

#### Compute
- AWS Lambda (serverless functions)
- ECS Fargate (containerized applications)
- EC2 (virtual machines)
- App Runner (containerized web apps)
- Batch (batch processing)
- Lightsail (simplified virtual servers)
- Elastic Beanstalk (PaaS)

#### Storage
- DynamoDB (NoSQL data)
- Aurora Serverless v2 (relational data)
- S3 (object storage)
- OpenSearch Serverless (search and analytics)
- RDS (relational databases)
- DocumentDB
- ElastiCache (in-memory caching)
- FSx (file systems)
- EFS (elastic file system)
- S3 Glacier (long-term archival)

#### AI/ML
- Bedrock (foundation models)
- Bedrock Knowledge Base (knowledge base)
- SageMaker (custom ML models)
- Bedrock Data Automation (IDP)
- Rekognition (image and video analysis)
- Comprehend (natural language processing)
- Transcribe (speech-to-text)
- Polly (text-to-speech)
- Kendra (intelligent search)
- Personalize (personalization and recommendations)
- Forecast (time-series forecasting)

#### Data & Analytics
- Redshift (data warehousing)
- Athena (serverless SQL queries)
- Glue (ETL service)
- EMR (big data processing)
- Kinesis (real-time data streaming)
- QuickSight (business intelligence)
- Lake Formation (data lake)
- DataZone (data management)
- MSK (managed Kafka)

#### Frontend
- Amplify Gen2 (full-stack applications)
- CloudFront (content delivery)
- AppSync (GraphQL APIs)
- API Gateway (REST APIs)
- S3 (static assets)
- Location Service (maps and location)
- Pinpoint (customer engagement)

#### Security
- Cognito (authentication)
- IAM (access control)
- KMS (encryption)
- WAF (web security)
- Shield (DDoS protection)
- GuardDuty (threat detection)
- Security Hub (security posture)
- Macie (data security)
- Inspector (vulnerability management)
- Verified Permissions (fine-grained permissions)
- Certificate Manager (SSL/TLS certificates)

#### Networking
- VPC (virtual private cloud)
- Route 53 (DNS service)
- CloudFront (CDN)
- Global Accelerator (network performance)
- Transit Gateway (network transit hub)
- Direct Connect (dedicated network connection)
- VPN (secure connection)
- App Mesh (service mesh)

#### DevOps
- CodePipeline (CI/CD pipeline)
- CodeBuild (build service)
- CodeDeploy (deployment service)
- CodeCommit (git repository)
- CodeArtifact (artifact repository)
- CloudFormation (infrastructure as code)
- CDK (infrastructure as code)
- CloudWatch (monitoring)
- X-Ray (distributed tracing)

## 3. Example Translation

User Query:
"How do I make an application with a radio log database that I can chat with using natural language?"

Analysis:

1. Components:
- Web application interface
- Database for radio logs
- Natural language chat interface
- Data retrieval system

2. AWS Solution Mapping:
- Frontend: Vite, React, Mantine v7, TanStack Query, TanStack Router, TypeScript, Amplify libraries for authentication, authorization, and storage
- Database: DynamoDB for radio logs
- API: AppSync for GraphQL data access
- Chat: Amplify Gen2 AI Conversation data model
- Authentication: Cognito user pools

3. Implementation Approach:
- Use CDK for infrastructure setup
- Set up Amplify Gen2 AI Conversation data model for chat capabilities

## 4. Best Practices

1. Always consider:
- Serverless-first architecture
- Pay-per-use pricing models
- Managed services over self-hosted
- Built-in security features
- Scalability requirements

2. Documentation:
- Reference AWS well-architected framework
- Include cost optimization strategies
- Note security best practices
- Document compliance considerations

## 5. Tool Usage Strategy

1. Initial Analysis:
\`\`\`md
# Understanding the user's requirements
<use_mcp_tool>
<server_name>awslabs.core-mcp-server</server_name>
<tool_name>prompt_understanding</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
\`\`\`

2. Domain Research:
\`\`\`md
# Getting domain guidance
<use_mcp_tool>
<server_name>awslabs.bedrock-kb-retrieval-mcp-server</server_name>
<tool_name>QueryKnowledgeBases</tool_name>
<arguments>
{
  "query": "what services are allowed internally on aws",
  "knowledge_base_id": "KBID",
  "number_of_results": 10
}
</arguments>
</use_mcp_tool>
\`\`\`

3. Architecture Planning:
\`\`\`md
# Getting CDK infrastructure guidance
<use_mcp_tool>
<server_name>awslabs.cdk-mcp-server</server_name>
<tool_name>CDKGeneralGuidance</tool_name>
<arguments>
{}
</arguments>
</use_mcp_tool>
\`\`\`

Remember: The goal is to translate general application requirements into specific, modern AWS services and patterns while considering scalability, security, and cost-effectiveness. if any MCP server referenced here is not avalaible, ask the user if they would like to install it`;

// Schema definitions
const PromptUnderstandingInputSchema = z.object({}).describe('No input parameters required');
const PromptUnderstandingOutputSchema = z.string().describe('Comprehensive guide for understanding user queries and translating them into AWS expert advice');

// Prompt Understanding Tool
const promptUnderstandingTool = createTool({
  id: 'prompt_understanding',
  description: 'MCP-CORE Prompt Understanding. ALWAYS use this tool first to understand the user\'s query and translate it into AWS expert advice.',
  inputSchema: PromptUnderstandingInputSchema,
  outputSchema: PromptUnderstandingOutputSchema,
  execute: async () => {
    return PROMPT_UNDERSTANDING;
  },
});

// Export all tools as an object for Mastra agent integration
export const coreTools = {
  promptUnderstanding: promptUnderstandingTool,
};

// Export individual tools for selective use
export {
  promptUnderstandingTool,
};
