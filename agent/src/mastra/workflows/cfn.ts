import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = anthropic('claude-4-sonnet-20250514');

// CloudFormation workflow agent for infrastructure planning
const cfnWorkflowAgent = new Agent({
  name: 'CloudFormation Workflow Agent',
  model: llm,
  instructions: `
    You are an expert AWS infrastructure architect specializing in CloudFormation and Infrastructure as Code.
    Your role is to help plan, validate, and execute infrastructure deployments using AWS CloudFormation.

    When working with infrastructure requests:
    - Always consider security best practices and least privilege principles
    - Implement proper resource tagging for cost management and organization
    - Consider dependencies between resources and plan deployment order accordingly
    - Validate resource configurations against AWS service limits and constraints
    - Provide clear explanations of what resources will be created and their purpose
    - Include rollback strategies for complex deployments

    For multi-step deployments:
    - Break down complex infrastructure into logical components
    - Ensure proper dependency management between resources
    - Validate each step before proceeding to the next
    - Provide status updates and progress tracking
  `,
});

// Schema definitions for workflow steps
const infrastructureRequestSchema = z.object({
  description: z.string().describe('Description of the infrastructure to deploy'),
  requirements: z.array(z.string()).describe('List of specific requirements'),
  environment: z.string().default('development').describe('Target environment (development, staging, production)'),
  region: z.string().optional().describe('AWS region for deployment'),
  budget: z.number().optional().describe('Budget constraints in USD'),
});

const deploymentPlanSchema = z.object({
  resources: z.array(z.object({
    type: z.string(),
    name: z.string(),
    properties: z.record(z.any()),
    dependencies: z.array(z.string()).optional(),
  })),
  deploymentOrder: z.array(z.string()),
  estimatedCost: z.number().optional(),
  securityConsiderations: z.array(z.string()),
  rollbackStrategy: z.string(),
  environment: z.string().optional(),
});

// Schema for deployment results (for future use)
// const deploymentResultSchema = z.object({
//   deployedResources: z.array(z.object({
//     type: z.string(),
//     identifier: z.string(),
//     status: z.string(),
//     requestToken: z.string().optional(),
//   })),
//   overallStatus: z.string(),
//   errors: z.array(z.string()),
//   nextSteps: z.array(z.string()),
// });

// Step 1: Analyze Infrastructure Requirements
const analyzeRequirements = createStep({
  id: 'analyze-requirements',
  description: 'Analyze infrastructure requirements and create deployment plan',
  inputSchema: infrastructureRequestSchema,
  outputSchema: deploymentPlanSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Infrastructure request data not found');
    }

    const prompt = `
      Analyze the following infrastructure request and create a detailed deployment plan:

      Description: ${inputData.description}
      Requirements: ${inputData.requirements.join(', ')}
      Environment: ${inputData.environment}
      Region: ${inputData.region || 'us-east-1'}
      Budget: ${inputData.budget ? `$${inputData.budget}` : 'No budget specified'}

      Create a deployment plan that includes:
      1. List of AWS resources needed with their types and properties
      2. Deployment order considering dependencies
      3. Security considerations and best practices
      4. Estimated costs (if possible)
      5. Rollback strategy

      Format the response as a structured plan with clear resource definitions.
    `;

    const response = await cfnWorkflowAgent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let planText = '';
    for await (const chunk of response.textStream) {
      planText += chunk;
    }

    // Parse the agent's response into a structured plan
    // This is a simplified parsing - in production, you'd want more robust parsing
    const plan: z.infer<typeof deploymentPlanSchema> = {
      resources: [
        // Example resource structure based on the request
        {
          type: 'AWS::S3::Bucket',
          name: 'example-bucket',
          properties: {
            BucketName: `${inputData.environment}-example-bucket`,
            VersioningConfiguration: { Status: 'Enabled' },
          },
          dependencies: [],
        },
      ],
      deploymentOrder: ['example-bucket'],
      environment: inputData.environment,
      securityConsiderations: [
        'Implement least privilege IAM policies',
        'Enable encryption at rest and in transit',
        'Configure proper VPC security groups',
        'Enable CloudTrail logging',
      ],
      rollbackStrategy: 'Use CloudFormation stack rollback on failure, with manual resource cleanup if needed',
    };

    return plan;
  },
});

// Additional workflow steps can be added here for validation and deployment
// For now, keeping the workflow simple with just the analysis step

// Simplified CloudFormation Workflow for resource deployment
export const cfnWorkflow = createWorkflow({
  id: 'cloudformation-deployment',
  inputSchema: infrastructureRequestSchema,
  outputSchema: z.object({
    status: z.string(),
    message: z.string(),
    deployedResources: z.array(z.object({
      type: z.string(),
      identifier: z.string(),
      status: z.string(),
    })),
  }),
})
  .then(analyzeRequirements);

cfnWorkflow.commit();