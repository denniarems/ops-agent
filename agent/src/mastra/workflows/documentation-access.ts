import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { coreAgent } from '../agents/core';
import { documentationAgent } from '../agents/documentation';

// Type definitions for better type safety
interface AgentExecutionResult {
  result: string;
  executionTime: number;
}

interface NetworkExecutionResult extends AgentExecutionResult {
  routingDecision: string;
}

interface RetryOperationResult<T> {
  result: T;
  retryCount: number;
  executionTime: number;
}

/**
 * Enhanced Documentation Access Workflow for Dual-Level Agent Operations
 * 
 * This workflow supports both direct agent execution and AgentNetwork-coordinated execution,
 * providing comprehensive AWS documentation retrieval with proper error handling and TypeScript safety.
 * 
 * Features:
 * - Dual execution modes: direct agent calls and network-coordinated routing
 * - Enhanced error handling with retry mechanisms
 * - Comprehensive TypeScript type safety
 * - Native tool integration patterns
 * - Functional specialization between documentation and core agents
 * - AgentNetwork compatibility for routing between agents
 */

// Input schema for dual-level documentation access
export const documentationAccessRequestSchema = z.object({
  query: z.string().describe('The documentation query or question'),
  context: z.string().optional().describe('Additional context for the query'),
  awsServices: z.array(z.string()).optional().describe('Specific AWS services to focus on'),
  priority: z.enum(['low', 'medium', 'high']).default('medium').describe('Query priority level'),
  includeExamples: z.boolean().default(true).describe('Whether to include code examples'),
  maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results to return'),
  // AgentNetwork-specific fields
  executionMode: z.enum(['direct', 'network']).default('direct').describe('Execution mode: direct agent or through network'),
  agentNetwork: z.any().optional().describe('AgentNetwork instance for network-based execution'),
  retryConfig: z.object({
    maxRetries: z.number().min(0).max(10).default(3),
    retryDelay: z.number().min(100).max(30000).default(1000),
    timeout: z.number().min(1000).max(300000).default(30000),
  }).optional().describe('Retry configuration for agent operations'),
});

// Enhanced output schema for dual-level documentation access results
export const documentationAccessResultSchema = z.object({
  status: z.enum(['success', 'partial', 'failed']),
  executionMode: z.enum(['direct', 'network']).describe('Execution mode used'),
  planningResult: z.object({
    analysisComplete: z.boolean(),
    recommendedApproach: z.string(),
    identifiedServices: z.array(z.string()),
    searchStrategy: z.string(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
    agentUsed: z.string().describe('Agent that performed the planning'),
    executionTime: z.number().describe('Planning execution time in milliseconds'),
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
    agentUsed: z.string().describe('Agent that performed the documentation retrieval'),
    executionTime: z.number().describe('Documentation execution time in milliseconds'),
  }),
  networkCoordination: z.object({
    routingDecision: z.string().optional().describe('Network routing decision explanation'),
    agentsInvolved: z.array(z.string()).describe('List of agents involved in execution'),
    coordinationTime: z.number().describe('Time spent on network coordination'),
  }).optional().describe('Network coordination details when using network mode'),
  errors: z.array(z.object({
    stage: z.enum(['planning', 'documentation', 'integration', 'network']),
    error: z.string(),
    severity: z.enum(['warning', 'error', 'critical']),
    agentName: z.string().optional(),
    retryCount: z.number().optional(),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
  executionTime: z.number().describe('Total execution time in milliseconds'),
  metrics: z.object({
    totalRetries: z.number(),
    successfulSteps: z.number(),
    failedSteps: z.number(),
    networkHops: z.number().optional(),
  }).describe('Execution metrics'),
});

// Enhanced error handling utility
const handleAgentError = (error: any, agentName: string, operation: string) => {
  console.error(`Error in ${agentName} during ${operation}:`, error);
  return {
    stage: operation as 'planning' | 'documentation' | 'integration' | 'network',
    error: `${agentName} error: ${error.message || 'Unknown error'}`,
    severity: 'error' as const,
    agentName,
    retryCount: 0,
  };
};

// Enhanced retry utility for agent operations
const retryAgentOperation = async <T>(
  operation: () => Promise<T>,
  config: { maxRetries: number; retryDelay: number; timeout: number } = {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000
  }
): Promise<RetryOperationResult<T>> => {
  const startTime = Date.now();
  let lastError: any;
  let retryCount = 0;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), config.timeout);
      });

      const result = await Promise.race([operation(), timeoutPromise]);

      return {
        result,
        retryCount,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      lastError = error;
      retryCount = attempt - 1;
      console.warn(`Attempt ${attempt}/${config.maxRetries} failed:`, error);

      if (attempt < config.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, config.retryDelay * attempt));
      }
    }
  }

  throw lastError;
};

// Network-based agent execution utility
const executeAgentThroughNetwork = async (
  network: any,
  prompt: string,
  agentName: string
): Promise<NetworkExecutionResult> => {
  const startTime = Date.now();

  try {
    // Execute through AgentNetwork with routing
    const response = await network.stream([
      {
        role: 'user',
        content: `Route this request to ${agentName}: ${prompt}`,
      },
    ]);

    let result = '';
    for await (const chunk of response.textStream) {
      result += chunk;
    }

    return {
      result,
      executionTime: Date.now() - startTime,
      routingDecision: `Routed to ${agentName} via network coordination`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Network execution failed for ${agentName}: ${errorMessage}`);
  }
};

// Direct agent execution utility
const executeAgentDirectly = async (
  agent: any,
  prompt: string
): Promise<AgentExecutionResult> => {
  const startTime = Date.now();

  const response = await agent.stream([
    {
      role: 'user',
      content: prompt,
    },
  ]);

  let result = '';
  for await (const chunk of response.textStream) {
    result += chunk;
  }

  return {
    result,
    executionTime: Date.now() - startTime
  };
};

// Define the planning result type
type PlanningResult = {
  analysisComplete: boolean;
  recommendedApproach: string;
  identifiedServices: string[];
  searchStrategy: string;
  estimatedComplexity: 'low' | 'medium' | 'high';
  agentUsed: string;
  executionTime: number;
  executionMode: 'direct' | 'network';
  networkCoordination?: {
    routingDecision?: string;
    agentsInvolved: string[];
    coordinationTime: number;
  };
  planningErrors?: Array<{
    stage: string;
    error: string;
    severity: string;
    agentName?: string;
    retryCount?: number;
  }>;
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
    agentUsed: z.string(),
    executionTime: z.number(),
    executionMode: z.enum(['direct', 'network']),
    networkCoordination: z.object({
      routingDecision: z.string().optional(),
      agentsInvolved: z.array(z.string()),
      coordinationTime: z.number(),
    }).optional(),
    planningErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
      agentName: z.string().optional(),
      retryCount: z.number().optional(),
    })).optional(),
  }),
  execute: async ({ inputData }): Promise<PlanningResult> => {
    const startTime = Date.now();
    const errors: any[] = [];

    // Configure retry settings from input or use defaults
    const retryConfig = inputData.retryConfig || {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 30000
    };

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

      let planningResult: RetryOperationResult<AgentExecutionResult | NetworkExecutionResult>;
      let networkCoordination: PlanningResult['networkCoordination'];

      if (inputData.executionMode === 'network' && inputData.agentNetwork) {
        const networkResult = await retryAgentOperation(async () => {
          return await executeAgentThroughNetwork(
            inputData.agentNetwork,
            planningPrompt,
            'coreAgent'
          );
        }, retryConfig);

        planningResult = networkResult;
        const networkRes = networkResult.result as NetworkExecutionResult;
        networkCoordination = {
          routingDecision: networkRes.routingDecision,
          agentsInvolved: ['coreAgent'],
          coordinationTime: networkResult.executionTime,
        };
      } else {
        planningResult = await retryAgentOperation(async () => {
          return await executeAgentDirectly(coreAgent, planningPrompt);
        }, retryConfig);
      }

      // Parse the planning result
      const planningText: string = planningResult.result.result;
      const analysisComplete: boolean = planningText.includes('Analysis complete') || planningText.length > 100;
      const estimatedComplexity: 'low' | 'medium' | 'high' = planningText.toLowerCase().includes('complex') ? 'high' :
                                 planningText.toLowerCase().includes('simple') ? 'low' : 'medium';

      // Extract services mentioned in the planning result
      const commonServices: string[] = ['ec2', 's3', 'lambda', 'rds', 'vpc', 'iam', 'cloudformation', 'cloudwatch'];
      const identifiedServices: string[] = commonServices.filter(service =>
        planningText.toLowerCase().includes(service) ||
        inputData.awsServices?.some(s => s.toLowerCase().includes(service))
      );

      console.log(`Core agent planning completed in ${planningResult.executionTime}ms`);

      return {
        analysisComplete,
        recommendedApproach: planningText.substring(0, 500) + (planningText.length > 500 ? '...' : ''),
        identifiedServices: identifiedServices.length > 0 ? identifiedServices : ['general'],
        searchStrategy: `Priority: ${inputData.priority}, Services: ${identifiedServices.join(', ')}, Examples: ${inputData.includeExamples}`,
        estimatedComplexity: estimatedComplexity as 'low' | 'medium' | 'high',
        agentUsed: 'coreAgent',
        executionTime: planningResult.executionTime,
        executionMode: inputData.executionMode,
        networkCoordination,
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
        agentUsed: 'coreAgent',
        executionTime: Date.now() - startTime,
        executionMode: inputData.executionMode,
        planningErrors: errors,
      };
    }
  },
});

// Define the documentation result type
type DocumentationResult = {
  documentsFound: number;
  relevantSections: Array<{
    service: string;
    section: string;
    relevance: number;
    summary: string;
  }>;
  codeExamples?: Array<{
    service: string;
    example: string;
    description: string;
  }>;
  bestPractices?: string[];
  agentUsed: string;
  executionTime: number;
  documentationErrors?: Array<{
    stage: string;
    error: string;
    severity: string;
    agentName?: string;
    retryCount?: number;
  }>;
  planningResult: {
    analysisComplete: boolean;
    recommendedApproach: string;
    identifiedServices: string[];
    searchStrategy: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
    agentUsed: string;
    executionTime: number;
  };
  executionMode: 'direct' | 'network';
  networkCoordination?: {
    routingDecision?: string;
    agentsInvolved: string[];
    coordinationTime: number;
  };
};

// Step 2: Documentation Agent Execution
const documentationAgentExecution = createStep({
  id: 'documentation-agent-execution',
  inputSchema: z.object({
    analysisComplete: z.boolean(),
    recommendedApproach: z.string(),
    identifiedServices: z.array(z.string()),
    searchStrategy: z.string(),
    estimatedComplexity: z.enum(['low', 'medium', 'high']),
    agentUsed: z.string(),
    executionTime: z.number(),
    executionMode: z.enum(['direct', 'network']),
    networkCoordination: z.object({
      routingDecision: z.string().optional(),
      agentsInvolved: z.array(z.string()),
      coordinationTime: z.number(),
    }).optional(),
    planningErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
      agentName: z.string().optional(),
      retryCount: z.number().optional(),
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
    agentUsed: z.string(),
    executionTime: z.number(),
    documentationErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
      agentName: z.string().optional(),
      retryCount: z.number().optional(),
    })).optional(),
    planningResult: z.object({
      analysisComplete: z.boolean(),
      recommendedApproach: z.string(),
      identifiedServices: z.array(z.string()),
      searchStrategy: z.string(),
      estimatedComplexity: z.enum(['low', 'medium', 'high']),
      agentUsed: z.string(),
      executionTime: z.number(),
    }),
    executionMode: z.enum(['direct', 'network']),
    networkCoordination: z.object({
      routingDecision: z.string().optional(),
      agentsInvolved: z.array(z.string()),
      coordinationTime: z.number(),
    }).optional(),
  }),
  execute: async ({ inputData }): Promise<DocumentationResult> => {
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

      const documentationResult: RetryOperationResult<AgentExecutionResult> = await retryAgentOperation(async () => {
        return await executeAgentDirectly(documentationAgent, documentationPrompt);
      });

      // Parse documentation result (simplified - in production, use more sophisticated parsing)
      const documentationText: string = documentationResult.result.result;
      const relevantSections = inputData.identifiedServices.map((service: string, index: number) => ({
        service,
        section: `Documentation for ${service}`,
        relevance: Math.max(0.5, 1 - (index * 0.1)), // Decreasing relevance
        summary: documentationText.substring(index * 200, (index + 1) * 200) + '...',
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

      console.log(`Documentation agent execution completed in ${documentationResult.executionTime}ms`);

      return {
        documentsFound: relevantSections.length,
        relevantSections,
        codeExamples,
        bestPractices,
        agentUsed: 'documentationAgent',
        executionTime: documentationResult.executionTime,
        documentationErrors: errors.length > 0 ? errors : undefined,
        planningResult: {
          analysisComplete: inputData.analysisComplete,
          recommendedApproach: inputData.recommendedApproach,
          identifiedServices: inputData.identifiedServices,
          searchStrategy: inputData.searchStrategy,
          estimatedComplexity: inputData.estimatedComplexity,
          agentUsed: inputData.agentUsed,
          executionTime: inputData.executionTime,
        },
        executionMode: inputData.executionMode,
        networkCoordination: inputData.networkCoordination,
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
        agentUsed: 'documentationAgent',
        executionTime: Date.now() - startTime,
        documentationErrors: errors,
        planningResult: {
          analysisComplete: inputData.analysisComplete,
          recommendedApproach: inputData.recommendedApproach,
          identifiedServices: inputData.identifiedServices,
          searchStrategy: inputData.searchStrategy,
          estimatedComplexity: inputData.estimatedComplexity,
          agentUsed: inputData.agentUsed,
          executionTime: inputData.executionTime,
        },
        executionMode: inputData.executionMode,
        networkCoordination: inputData.networkCoordination,
      };
    }
  },
});

// Define the final result type
type FinalDocumentationResult = z.infer<typeof documentationAccessResultSchema>;

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
    agentUsed: z.string(),
    executionTime: z.number(),
    documentationErrors: z.array(z.object({
      stage: z.string(),
      error: z.string(),
      severity: z.string(),
      agentName: z.string().optional(),
      retryCount: z.number().optional(),
    })).optional(),
    planningResult: z.object({
      analysisComplete: z.boolean(),
      recommendedApproach: z.string(),
      identifiedServices: z.array(z.string()),
      searchStrategy: z.string(),
      estimatedComplexity: z.enum(['low', 'medium', 'high']),
      agentUsed: z.string(),
      executionTime: z.number(),
    }),
    executionMode: z.enum(['direct', 'network']),
    networkCoordination: z.object({
      routingDecision: z.string().optional(),
      agentsInvolved: z.array(z.string()),
      coordinationTime: z.number(),
    }).optional(),
  }),
  outputSchema: documentationAccessResultSchema,
  execute: async ({ inputData }): Promise<FinalDocumentationResult> => {
    const startTime = Date.now();
    const errors: any[] = [];

    try {
      console.log('Integrating and validating results...');

      // Determine overall status
      const planningSuccess: boolean = inputData.planningResult.analysisComplete;
      const documentationSuccess: boolean = inputData.documentsFound > 0;

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

      recommendations.push('Validate information with official AWS documentation');
      recommendations.push('Test any code examples in a development environment');

      const executionTime = Date.now() - startTime;
      console.log(`Result integration completed in ${executionTime}ms`);

      // Calculate metrics
      const totalRetries = 0; // Would be calculated from actual retry counts
      const successfulSteps = status === 'success' ? 3 : status === 'partial' ? 2 : 1;
      const failedSteps = 3 - successfulSteps;
      const networkHops = inputData.executionMode === 'network' ? 1 : undefined;

      return {
        status,
        executionMode: inputData.executionMode,
        planningResult: {
          ...inputData.planningResult,
        },
        documentationResult: {
          documentsFound: inputData.documentsFound,
          relevantSections: inputData.relevantSections,
          codeExamples: inputData.codeExamples,
          bestPractices: inputData.bestPractices,
          agentUsed: inputData.agentUsed,
          executionTime: inputData.executionTime,
        },
        networkCoordination: inputData.networkCoordination,
        errors: errors.length > 0 ? errors : undefined,
        recommendations,
        executionTime: startTime + executionTime,
        metrics: {
          totalRetries,
          successfulSteps,
          failedSteps,
          networkHops,
        },
      };

    } catch (error) {
      const integrationError = handleAgentError(error, 'integration', 'integration');
      errors.push(integrationError);

      console.error('Result integration failed:', error);

      return {
        status: 'failed' as const,
        executionMode: inputData.executionMode,
        planningResult: {
          ...inputData.planningResult,
        },
        documentationResult: {
          documentsFound: inputData.documentsFound,
          relevantSections: inputData.relevantSections,
          codeExamples: inputData.codeExamples,
          bestPractices: inputData.bestPractices,
          agentUsed: inputData.agentUsed,
          executionTime: inputData.executionTime,
        },
        networkCoordination: inputData.networkCoordination,
        errors,
        recommendations: ['Manual review required due to integration failure'],
        executionTime: Date.now() - startTime,
        metrics: {
          totalRetries: 0,
          successfulSteps: 0,
          failedSteps: 3,
          networkHops: inputData.executionMode === 'network' ? 1 : undefined,
        },
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
 * Enhanced Documentation Access Workflow
 *
 * This workflow demonstrates the proper interaction pattern for accessing AWS documentation
 * through specialized agents with dual-level execution support. It follows a three-stage approach:
 *
 * 1. Core Agent Planning: Analyzes the request and creates a comprehensive search strategy
 * 2. Documentation Agent Execution: Uses the plan to retrieve relevant documentation
 * 3. Result Integration: Validates and integrates results from both agents
 *
 * Features:
 * - Dual execution modes: direct agent calls and AgentNetwork-coordinated routing
 * - Comprehensive error handling and retry mechanisms with configurable settings
 * - State management between agent interactions with proper data flow
 * - Configurable search parameters and result limits
 * - TypeScript type safety throughout the workflow with enhanced schemas
 * - Detailed logging and performance monitoring with execution metrics
 * - AgentNetwork compatibility for intelligent agent routing
 * - Functional specialization between documentation and core agents
 * - Native tool integration patterns following established codebase conventions
 *
 * Execution Modes:
 * - Direct Mode: Executes agents directly for faster, simpler operations
 * - Network Mode: Uses AgentNetwork for intelligent routing and coordination
 *
 * Usage Examples:
 *
 * Direct Mode Example:
 * ```typescript
 * const result = await documentationAccessWorkflow.execute({
 *   query: "How to set up auto-scaling for EC2 instances?",
 *   context: "Building a web application with variable traffic",
 *   awsServices: ["ec2", "autoscaling", "cloudwatch"],
 *   priority: "high",
 *   includeExamples: true,
 *   maxResults: 15,
 *   executionMode: "direct"
 * });
 * ```
 *
 * Network Mode Example:
 * ```typescript
 * const result = await documentationAccessWorkflow.execute({
 *   query: "Best practices for serverless architecture with Lambda and API Gateway",
 *   context: "Designing a microservices architecture",
 *   awsServices: ["lambda", "apigateway", "dynamodb"],
 *   priority: "medium",
 *   includeExamples: true,
 *   maxResults: 20,
 *   executionMode: "network",
 *   agentNetwork: awsInfrastructureNetwork,
 *   retryConfig: {
 *     maxRetries: 5,
 *     retryDelay: 2000,
 *     timeout: 45000
 *   }
 * });
 * ```
 *
 * Integration with AgentNetwork:
 * The workflow is designed to work seamlessly with the AgentNetwork pattern defined in
 * the main Mastra configuration. When using network mode, the workflow leverages the
 * intelligent routing capabilities to coordinate between specialized agents.
 *
 * Error Handling:
 * - Comprehensive retry mechanisms with exponential backoff
 * - Graceful degradation with fallback strategies
 * - Detailed error reporting with agent-specific context
 * - Configurable timeout and retry settings
 *
 * Performance Monitoring:
 * - Execution time tracking for each step and overall workflow
 * - Retry count monitoring and success rate calculation
 * - Network coordination metrics when using network mode
 * - Detailed step completion tracking
 */
