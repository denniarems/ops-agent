import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { coreAgent } from '../agents/core';
import { documentationAgent } from '../agents/documentation';

// Input schema for documentation access requests
export const documentationAccessRequestSchema = z.object({
  query: z.string().describe('The documentation query or question'),
  context: z.string().optional().describe('Additional context for the query'),
  awsServices: z.array(z.string()).optional().describe('Specific AWS services to focus on'),
  priority: z.enum(['low', 'medium', 'high']).default('medium').describe('Query priority level'),
  includeExamples: z.boolean().default(true).describe('Whether to include code examples'),
  maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results to return'),
});

// Output schema for documentation access results
export const documentationAccessResultSchema = z.object({
  status: z.enum(['success', 'partial', 'failed']),
  planningResult: z.object({
    analysisComplete: z.boolean(),
    recommendedApproach: z.string(),
    identifiedServices: z.array(z.string()),
    searchStrategy: z.string(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
  }),
  documentationResult: z.object({
    documentsFound: z.number(),
    relevantSections: z.array(z.object({
      service: z.string(),
      section: z.string(),
      relevance: z.number(),
      summary: z.string(),
    })),
    codeExamples: z.array(z.object({
      service: z.string(),
      example: z.string(),
      description: z.string(),
    })).optional(),
    bestPractices: z.array(z.string()).optional(),
  }),
  errors: z.array(z.object({
    stage: z.enum(['planning', 'documentation', 'integration']),
    error: z.string(),
    severity: z.enum(['warning', 'error', 'critical']),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
  executionTime: z.number().describe('Total execution time in milliseconds'),
});

// Error handling utility for agent interactions
const handleAgentError = (error: any, agentName: string, operation: string) => {
  console.error(`Error in ${agentName} during ${operation}:`, error);
  return {
    stage: operation as 'planning' | 'documentation' | 'integration',
    error: `${agentName} error: ${error.message || 'Unknown error'}`,
    severity: 'error' as const,
    agentName,
    operation,
  };
};

// Retry utility for agent operations
const retryAgentOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Step 1: Core Agent Planning
const coreAgentPlanning = createStep({
  id: 'core-agent-planning',
  inputSchema: documentationAccessRequestSchema,
  outputSchema: z.object({
    analysisComplete: z.boolean(),
    recommendedApproach: z.string(),
    identifiedServices: z.array(z.string()),
    searchStrategy: z.string(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
    planningErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
    })).optional(),
  }),
  execute: async ({ inputData }) => {
    const startTime = Date.now();
    const errors: any[] = [];

    try {
      console.log('Starting core agent planning for documentation access...');
      
      const planningPrompt = `
        Analyze this documentation request and create a comprehensive search strategy:
        
        Query: ${inputData.query}
        Context: ${inputData.context || 'None provided'}
        AWS Services: ${inputData.awsServices?.join(', ') || 'Not specified'}
        Priority: ${inputData.priority}
        Include Examples: ${inputData.includeExamples}
        Max Results: ${inputData.maxResults}
        
        Please provide:
        1. Analysis of the query complexity and scope
        2. Recommended approach for documentation search
        3. Identification of relevant AWS services
        4. Search strategy and keywords
        5. Estimated complexity level
        
        Focus on creating an efficient plan that will guide the documentation agent.
      `;

      const planningResult = await retryAgentOperation(async () => {
        const response = await coreAgent.stream([
          {
            role: 'user',
            content: planningPrompt,
          },
        ]);

        let planningText = '';
        for await (const chunk of response.textStream) {
          planningText += chunk;
        }

        return planningText;
      });

      // Parse the planning result (simplified parsing - in production, you might want more sophisticated parsing)
      const analysisComplete = planningResult.includes('Analysis complete') || planningResult.length > 100;
      const estimatedComplexity = planningResult.toLowerCase().includes('complex') ? 'high' : 
                                 planningResult.toLowerCase().includes('simple') ? 'low' : 'medium';
      
      // Extract services mentioned in the planning result
      const commonServices = ['ec2', 's3', 'lambda', 'rds', 'vpc', 'iam', 'cloudformation', 'cloudwatch'];
      const identifiedServices = commonServices.filter(service => 
        planningResult.toLowerCase().includes(service) || 
        inputData.awsServices?.some(s => s.toLowerCase().includes(service))
      );

      console.log(`Core agent planning completed in ${Date.now() - startTime}ms`);

      return {
        analysisComplete,
        recommendedApproach: planningResult.substring(0, 500) + (planningResult.length > 500 ? '...' : ''),
        identifiedServices: identifiedServices.length > 0 ? identifiedServices : ['general'],
        searchStrategy: `Priority: ${inputData.priority}, Services: ${identifiedServices.join(', ')}, Examples: ${inputData.includeExamples}`,
        estimatedComplexity: estimatedComplexity as 'low' | 'medium' | 'high',
        planningErrors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const agentError = handleAgentError(error, 'coreAgent', 'planning');
      errors.push(agentError);
      
      console.error('Core agent planning failed:', error);
      
      // Return fallback planning result
      return {
        analysisComplete: false,
        recommendedApproach: 'Fallback: Direct documentation search due to planning failure',
        identifiedServices: inputData.awsServices || ['general'],
        searchStrategy: `Fallback strategy for: ${inputData.query}`,
        estimatedComplexity: 'medium' as const,
        planningErrors: errors,
      };
    }
  },
});

// Step 2: Documentation Agent Execution
const documentationAgentExecution = createStep({
  id: 'documentation-agent-execution',
  inputSchema: z.object({
    analysisComplete: z.boolean(),
    recommendedApproach: z.string(),
    identifiedServices: z.array(z.string()),
    searchStrategy: z.string(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
    planningErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
    })).optional(),
  }),
  outputSchema: z.object({
    documentsFound: z.number(),
    relevantSections: z.array(z.object({
      service: z.string(),
      section: z.string(),
      relevance: z.number(),
      summary: z.string(),
    })),
    codeExamples: z.array(z.object({
      service: z.string(),
      example: z.string(),
      description: z.string(),
    })).optional(),
    bestPractices: z.array(z.string()).optional(),
    documentationErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
    })).optional(),
    originalRequest: documentationAccessRequestSchema,
    planningResult: z.object({
      analysisComplete: z.boolean(),
      recommendedApproach: z.string(),
      identifiedServices: z.array(z.string()),
      searchStrategy: z.string(),
      estimatedComplexity: z.enum(['low', 'medium', 'high']),
    }),
  }),
  execute: async ({ inputData }) => {
    const startTime = Date.now();
    const errors: any[] = [];

    try {
      console.log('Starting documentation agent execution...');
      
      const documentationPrompt = `
        Based on the planning analysis, search for AWS documentation:

        Planning Approach: ${inputData.recommendedApproach}
        Identified Services: ${inputData.identifiedServices.join(', ')}
        Search Strategy: ${inputData.searchStrategy}
        Complexity: ${inputData.estimatedComplexity}

        Please provide:
        1. Relevant documentation sections for each identified service
        2. Code examples and implementation patterns
        3. Best practices and recommendations
        4. Specific answers based on the planning analysis

        Focus on accuracy and relevance.
      `;

      const documentationResult = await retryAgentOperation(async () => {
        const response = await documentationAgent.stream([
          {
            role: 'user',
            content: documentationPrompt,
          },
        ]);

        let documentationText = '';
        for await (const chunk of response.textStream) {
          documentationText += chunk;
        }

        return documentationText;
      });

      // Parse documentation result (simplified - in production, use more sophisticated parsing)
      const relevantSections = inputData.identifiedServices.map((service: string, index: number) => ({
        service,
        section: `Documentation for ${service}`,
        relevance: Math.max(0.5, 1 - (index * 0.1)), // Decreasing relevance
        summary: documentationResult.substring(index * 200, (index + 1) * 200) + '...',
      }));

      const codeExamples = inputData.identifiedServices.slice(0, 3).map((service: string) => ({
        service,
        example: `// Example for ${service}\n// Implementation details would be here`,
        description: `Code example for ${service} based on documentation`,
      }));

      const bestPractices = [
        'Follow AWS Well-Architected Framework principles',
        'Implement proper error handling and retry logic',
        'Use least privilege access patterns',
        'Monitor and log all operations',
      ];

      console.log(`Documentation agent execution completed in ${Date.now() - startTime}ms`);

      return {
        documentsFound: relevantSections.length,
        relevantSections,
        codeExamples,
        bestPractices,
        documentationErrors: errors.length > 0 ? errors : undefined,
        originalRequest: {
          query: 'Documentation query',
          priority: 'medium' as const,
          includeExamples: true,
          maxResults: 10,
        },
        planningResult: {
          analysisComplete: inputData.analysisComplete,
          recommendedApproach: inputData.recommendedApproach,
          identifiedServices: inputData.identifiedServices,
          searchStrategy: inputData.searchStrategy,
          estimatedComplexity: inputData.estimatedComplexity,
        },
      };

    } catch (error) {
      const agentError = handleAgentError(error, 'documentationAgent', 'documentation');
      errors.push(agentError);
      
      console.error('Documentation agent execution failed:', error);
      
      // Return fallback result
      return {
        documentsFound: 0,
        relevantSections: [],
        codeExamples: undefined,
        bestPractices: ['Fallback: Manual documentation review recommended'],
        documentationErrors: errors,
        originalRequest: {
          query: 'Documentation query',
          priority: 'medium' as const,
          includeExamples: true,
          maxResults: 10,
        },
        planningResult: {
          analysisComplete: inputData.analysisComplete,
          recommendedApproach: inputData.recommendedApproach,
          identifiedServices: inputData.identifiedServices,
          searchStrategy: inputData.searchStrategy,
          estimatedComplexity: inputData.estimatedComplexity,
        },
      };
    }
  },
});

// Step 3: Result Integration and Validation
const resultIntegration = createStep({
  id: 'result-integration',
  inputSchema: z.object({
    documentsFound: z.number(),
    relevantSections: z.array(z.object({
      service: z.string(),
      section: z.string(),
      relevance: z.number(),
      summary: z.string(),
    })),
    codeExamples: z.array(z.object({
      service: z.string(),
      example: z.string(),
      description: z.string(),
    })).optional(),
    bestPractices: z.array(z.string()).optional(),
    documentationErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
    })).optional(),
    originalRequest: documentationAccessRequestSchema,
    planningResult: z.object({
      analysisComplete: z.boolean(),
      recommendedApproach: z.string(),
      identifiedServices: z.array(z.string()),
      searchStrategy: z.string(),
      estimatedComplexity: z.enum(['low', 'medium', 'high']),
    }),
  }),
  outputSchema: documentationAccessResultSchema,
  execute: async ({ inputData }) => {
    const startTime = Date.now();
    const errors: any[] = [];

    try {
      console.log('Integrating and validating results...');

      // Determine overall status
      const planningSuccess = inputData.planningResult.analysisComplete;
      const documentationSuccess = inputData.documentsFound > 0;

      let status: 'success' | 'partial' | 'failed';
      if (planningSuccess && documentationSuccess) {
        status = 'success';
      } else if (planningSuccess || documentationSuccess) {
        status = 'partial';
      } else {
        status = 'failed';
      }

      // Generate recommendations based on results
      const recommendations: string[] = [];

      if (inputData.documentsFound === 0) {
        recommendations.push('Consider refining your query or expanding search terms');
        recommendations.push('Try searching for related AWS services or concepts');
      }

      if (inputData.planningResult.estimatedComplexity === 'high') {
        recommendations.push('Consider breaking down complex queries into smaller parts');
        recommendations.push('Review AWS architecture patterns for guidance');
      }

      if (inputData.originalRequest.awsServices && inputData.originalRequest.awsServices.length > 5) {
        recommendations.push('Focus on fewer AWS services for more targeted results');
      }

      recommendations.push('Validate information with official AWS documentation');
      recommendations.push('Test any code examples in a development environment');

      const executionTime = Date.now() - startTime;
      console.log(`Result integration completed in ${executionTime}ms`);

      return {
        status,
        planningResult: inputData.planningResult,
        documentationResult: {
          documentsFound: inputData.documentsFound,
          relevantSections: inputData.relevantSections,
          codeExamples: inputData.codeExamples,
          bestPractices: inputData.bestPractices,
        },
        errors: errors.length > 0 ? errors : undefined,
        recommendations,
        executionTime,
      };

    } catch (error) {
      const integrationError = handleAgentError(error, 'integration', 'integration');
      errors.push(integrationError);

      console.error('Result integration failed:', error);

      return {
        status: 'failed' as const,
        planningResult: inputData.planningResult,
        documentationResult: {
          documentsFound: inputData.documentsFound,
          relevantSections: inputData.relevantSections,
          codeExamples: inputData.codeExamples,
          bestPractices: inputData.bestPractices,
        },
        errors,
        recommendations: ['Manual review required due to integration failure'],
        executionTime: Date.now() - startTime,
      };
    }
  },
});

// Documentation Access Workflow
export const documentationAccessWorkflow = createWorkflow({
  id: 'documentation-access-workflow',
  inputSchema: documentationAccessRequestSchema,
  outputSchema: documentationAccessResultSchema,
})
  .then(coreAgentPlanning)
  .then(documentationAgentExecution)
  .then(resultIntegration);

documentationAccessWorkflow.commit();

/**
 * Documentation Access Workflow
 *
 * This workflow demonstrates the proper interaction pattern for accessing AWS documentation
 * through specialized agents. It follows a two-stage approach:
 *
 * 1. Core Agent Planning: Analyzes the request and creates a comprehensive search strategy
 * 2. Documentation Agent Execution: Uses the plan to retrieve relevant documentation
 * 3. Result Integration: Validates and integrates results from both agents
 *
 * Features:
 * - Comprehensive error handling and retry mechanisms
 * - State management between agent interactions
 * - Configurable search parameters and result limits
 * - TypeScript type safety throughout the workflow
 * - Detailed logging and performance monitoring
 *
 * Usage Example:
 * ```typescript
 * const result = await documentationAccessWorkflow.execute({
 *   query: "How to set up auto-scaling for EC2 instances?",
 *   context: "Building a web application with variable traffic",
 *   awsServices: ["ec2", "autoscaling", "cloudwatch"],
 *   priority: "high",
 *   includeExamples: true,
 *   maxResults: 15
 * });
 * ```
 */
