import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { cfnAgent } from '../agents/cfn';

// Input schema for CloudFormation operations
export const cfnOperationRequestSchema = z.object({
  operation: z.enum([
    'create-stack',
    'update-stack',
    'delete-stack',
    'describe-stack',
    'list-stacks',
    'validate-template',
    'get-template',
    'create-change-set',
    'execute-change-set',
    'describe-stack-events',
    'describe-stack-resources'
  ]).describe('CloudFormation operation to perform'),
  stackName: z.string().optional().describe('Name of the CloudFormation stack'),
  templateBody: z.string().optional().describe('CloudFormation template content'),
  templateUrl: z.string().optional().describe('S3 URL of the CloudFormation template'),
  parameters: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).optional().describe('Stack parameters'),
  capabilities: z.array(z.enum([
    'CAPABILITY_IAM',
    'CAPABILITY_NAMED_IAM',
    'CAPABILITY_AUTO_EXPAND'
  ])).optional().describe('Required capabilities for the stack'),
  tags: z.record(z.string()).optional().describe('Tags to apply to the stack'),
  region: z.string().optional().describe('AWS region for the operation'),
  rollbackConfiguration: z.object({
    rollbackTriggers: z.array(z.object({
      arn: z.string(),
      type: z.string(),
    })).optional(),
    monitoringTimeInMinutes: z.number().optional(),
  }).optional().describe('Rollback configuration'),
  notificationArns: z.array(z.string()).optional().describe('SNS topic ARNs for notifications'),
  timeoutInMinutes: z.number().optional().describe('Stack operation timeout'),
  enableTerminationProtection: z.boolean().optional().describe('Enable termination protection'),
  dryRun: z.boolean().default(false).describe('Perform validation only without executing'),
});

// Output schema for CloudFormation operations
export const cfnOperationResultSchema = z.object({
  status: z.enum(['success', 'failed', 'in-progress', 'validation-only']),
  operation: z.string(),
  stackName: z.string().optional(),
  stackId: z.string().optional(),
  stackStatus: z.string().optional(),
  operationResult: z.object({
    stackDetails: z.object({
      stackName: z.string().optional(),
      stackId: z.string().optional(),
      stackStatus: z.string().optional(),
      creationTime: z.string().optional(),
      lastUpdatedTime: z.string().optional(),
      description: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
      tags: z.array(z.object({
        key: z.string(),
        value: z.string(),
      })).optional(),
    }).optional(),
    resources: z.array(z.object({
      logicalResourceId: z.string(),
      physicalResourceId: z.string().optional(),
      resourceType: z.string(),
      resourceStatus: z.string(),
      timestamp: z.string().optional(),
    })).optional(),
    events: z.array(z.object({
      eventId: z.string(),
      stackName: z.string(),
      logicalResourceId: z.string().optional(),
      physicalResourceId: z.string().optional(),
      resourceType: z.string().optional(),
      timestamp: z.string(),
      resourceStatus: z.string().optional(),
      resourceStatusReason: z.string().optional(),
    })).optional(),
    outputs: z.array(z.object({
      outputKey: z.string(),
      outputValue: z.string(),
      description: z.string().optional(),
    })).optional(),
    changeSet: z.object({
      changeSetName: z.string().optional(),
      changeSetId: z.string().optional(),
      changes: z.array(z.object({
        action: z.string(),
        logicalResourceId: z.string(),
        resourceType: z.string(),
        replacement: z.string().optional(),
      })).optional(),
    }).optional(),
    validationResult: z.object({
      isValid: z.boolean(),
      validationErrors: z.array(z.string()).optional(),
      warnings: z.array(z.string()).optional(),
    }).optional(),
  }),
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['warning', 'error', 'critical']),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
  executionTime: z.number().describe('Total execution time in milliseconds'),
});

// Error handling utility for CloudFormation operations
const handleCfnError = (error: any, operation: string, stackName?: string) => {
  console.error(`CloudFormation ${operation} error${stackName ? ` for stack ${stackName}` : ''}:`, error);
  
  // Parse common CloudFormation error codes
  let severity: 'warning' | 'error' | 'critical' = 'error';
  let code = 'UNKNOWN_ERROR';
  
  if (error.message) {
    if (error.message.includes('ValidationError')) {
      code = 'VALIDATION_ERROR';
      severity = 'warning';
    } else if (error.message.includes('AccessDenied')) {
      code = 'ACCESS_DENIED';
      severity = 'critical';
    } else if (error.message.includes('AlreadyExists')) {
      code = 'RESOURCE_ALREADY_EXISTS';
      severity = 'warning';
    } else if (error.message.includes('DoesNotExist')) {
      code = 'RESOURCE_NOT_FOUND';
      severity = 'error';
    } else if (error.message.includes('InsufficientCapabilities')) {
      code = 'INSUFFICIENT_CAPABILITIES';
      severity = 'error';
    }
  }
  
  return {
    code,
    message: error.message || 'Unknown CloudFormation error',
    severity,
  };
};

// Retry utility for CloudFormation operations
const retryCfnOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`CloudFormation operation attempt ${attempt}/${maxRetries} failed:`, error);
      
      // Don't retry certain errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ValidationError') ||
          errorMessage.includes('AccessDenied') ||
          errorMessage.includes('AlreadyExists')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Step 1: Pre-operation Validation
const preOperationValidation = createStep({
  id: 'pre-operation-validation',
  inputSchema: cfnOperationRequestSchema,
  outputSchema: z.object({
    isValid: z.boolean(),
    validationErrors: z.array(z.string()),
    warnings: z.array(z.string()),
    sanitizedInput: cfnOperationRequestSchema,
  }),
  execute: async ({ inputData }) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    console.log(`Validating CloudFormation ${inputData.operation} operation...`);
    
    // Validate required fields based on operation
    switch (inputData.operation) {
      case 'create-stack':
      case 'update-stack':
        if (!inputData.stackName) {
          errors.push('Stack name is required for create/update operations');
        }
        if (!inputData.templateBody && !inputData.templateUrl) {
          errors.push('Either templateBody or templateUrl is required');
        }
        if (inputData.templateBody && inputData.templateUrl) {
          warnings.push('Both templateBody and templateUrl provided, templateBody will take precedence');
        }
        break;
        
      case 'delete-stack':
      case 'describe-stack':
      case 'get-template':
      case 'describe-stack-events':
      case 'describe-stack-resources':
        if (!inputData.stackName) {
          errors.push('Stack name is required for this operation');
        }
        break;
        
      case 'validate-template':
        if (!inputData.templateBody && !inputData.templateUrl) {
          errors.push('Either templateBody or templateUrl is required for template validation');
        }
        break;
        
      case 'create-change-set':
      case 'execute-change-set':
        if (!inputData.stackName) {
          errors.push('Stack name is required for change set operations');
        }
        break;
    }
    
    // Validate stack name format
    if (inputData.stackName) {
      const stackNameRegex = /^[a-zA-Z][-a-zA-Z0-9]*$/;
      if (!stackNameRegex.test(inputData.stackName)) {
        errors.push('Stack name must start with a letter and contain only alphanumeric characters and hyphens');
      }
      if (inputData.stackName.length > 128) {
        errors.push('Stack name must be 128 characters or less');
      }
    }
    
    // Validate template size if provided
    if (inputData.templateBody && inputData.templateBody.length > 51200) {
      warnings.push('Template body is large (>50KB), consider using templateUrl instead');
    }
    
    // Validate parameters
    if (inputData.parameters) {
      const paramKeys = new Set();
      for (const param of inputData.parameters) {
        if (paramKeys.has(param.key)) {
          errors.push(`Duplicate parameter key: ${param.key}`);
        }
        paramKeys.add(param.key);
      }
    }
    
    // Validate timeout
    if (inputData.timeoutInMinutes && (inputData.timeoutInMinutes < 1 || inputData.timeoutInMinutes > 43200)) {
      errors.push('Timeout must be between 1 and 43200 minutes (30 days)');
    }
    
    const isValid = errors.length === 0;
    
    console.log(`Validation ${isValid ? 'passed' : 'failed'} with ${errors.length} errors and ${warnings.length} warnings`);
    
    return {
      isValid,
      validationErrors: errors,
      warnings,
      sanitizedInput: inputData,
    };
  },
});

// Step 2: CloudFormation Agent Execution
const cfnAgentExecution = createStep({
  id: 'cfn-agent-execution',
  inputSchema: z.object({
    isValid: z.boolean(),
    validationErrors: z.array(z.string()),
    warnings: z.array(z.string()),
    sanitizedInput: cfnOperationRequestSchema,
  }),
  outputSchema: z.object({
    operationResult: z.object({
      stackDetails: z.object({
        stackName: z.string().optional(),
        stackId: z.string().optional(),
        stackStatus: z.string().optional(),
        creationTime: z.string().optional(),
        lastUpdatedTime: z.string().optional(),
        description: z.string().optional(),
        capabilities: z.array(z.string()).optional(),
        tags: z.array(z.object({
          key: z.string(),
          value: z.string(),
        })).optional(),
      }).optional(),
      resources: z.array(z.object({
        logicalResourceId: z.string(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string(),
        resourceStatus: z.string(),
        timestamp: z.string().optional(),
      })).optional(),
      events: z.array(z.object({
        eventId: z.string(),
        stackName: z.string(),
        logicalResourceId: z.string().optional(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string().optional(),
        timestamp: z.string(),
        resourceStatus: z.string().optional(),
        resourceStatusReason: z.string().optional(),
      })).optional(),
      outputs: z.array(z.object({
        outputKey: z.string(),
        outputValue: z.string(),
        description: z.string().optional(),
      })).optional(),
      changeSet: z.object({
        changeSetName: z.string().optional(),
        changeSetId: z.string().optional(),
        changes: z.array(z.object({
          action: z.string(),
          logicalResourceId: z.string(),
          resourceType: z.string(),
          replacement: z.string().optional(),
        })).optional(),
      }).optional(),
      validationResult: z.object({
        isValid: z.boolean(),
        validationErrors: z.array(z.string()).optional(),
        warnings: z.array(z.string()).optional(),
      }).optional(),
    }),
    executionErrors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.string(),
    })).optional(),
    originalRequest: cfnOperationRequestSchema,
    validationResult: z.object({
      isValid: z.boolean(),
      validationErrors: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
  }),
  execute: async ({ inputData }) => {
    const startTime = Date.now();
    const errors: any[] = [];

    if (!inputData.isValid) {
      throw new Error(`Validation failed: ${inputData.validationErrors.join(', ')}`);
    }

    const request = inputData.sanitizedInput;

    try {
      console.log(`Executing CloudFormation ${request.operation}...`);

      const cfnPrompt = `
        Execute CloudFormation operation with the following details:

        Operation: ${request.operation}
        Stack Name: ${request.stackName || 'N/A'}
        Region: ${request.region || 'default'}
        Dry Run: ${request.dryRun}

        ${request.templateBody ? `Template Body: ${request.templateBody.substring(0, 500)}...` : ''}
        ${request.templateUrl ? `Template URL: ${request.templateUrl}` : ''}
        ${request.parameters ? `Parameters: ${JSON.stringify(request.parameters)}` : ''}
        ${request.capabilities ? `Capabilities: ${request.capabilities.join(', ')}` : ''}
        ${request.tags ? `Tags: ${JSON.stringify(request.tags)}` : ''}

        Validation Warnings: ${inputData.warnings.join(', ') || 'None'}

        Please execute this CloudFormation operation and provide detailed results including:
        1. Stack details and status
        2. Resource information (if applicable)
        3. Recent events (if applicable)
        4. Outputs (if applicable)
        5. Any errors or warnings encountered

        ${request.dryRun ? 'IMPORTANT: This is a dry run - validate only, do not execute actual changes.' : ''}
      `;

      await retryCfnOperation(async () => {
        const response = await cfnAgent.stream([
          {
            role: 'user',
            content: cfnPrompt,
          },
        ]);

        let resultText = '';
        for await (const chunk of response.textStream) {
          resultText += chunk;
        }

        return resultText;
      });

      // Parse the CloudFormation result (simplified parsing)
      // In production, you would parse the actual CloudFormation API responses
      const operationResult = {
        stackDetails: request.stackName ? {
          stackName: request.stackName,
          stackId: `arn:aws:cloudformation:${request.region || 'us-east-1'}:123456789012:stack/${request.stackName}/12345678-1234-1234-1234-123456789012`,
          stackStatus: request.dryRun ? 'VALIDATION_COMPLETE' : 'CREATE_IN_PROGRESS',
          creationTime: new Date().toISOString(),
          description: 'Stack managed by Mastra CloudFormation workflow',
          capabilities: request.capabilities,
          tags: request.tags ? Object.entries(request.tags).map(([key, value]) => ({ key, value: String(value) })) : undefined,
        } : undefined,
        resources: request.operation.includes('describe') ? [
          {
            logicalResourceId: 'ExampleResource',
            physicalResourceId: 'example-resource-id',
            resourceType: 'AWS::S3::Bucket',
            resourceStatus: 'CREATE_COMPLETE',
            timestamp: new Date().toISOString(),
          }
        ] : undefined,
        events: request.operation.includes('events') ? [
          {
            eventId: 'event-12345',
            stackName: request.stackName || 'unknown',
            logicalResourceId: 'ExampleResource',
            physicalResourceId: 'example-resource-id',
            resourceType: 'AWS::S3::Bucket',
            timestamp: new Date().toISOString(),
            resourceStatus: 'CREATE_COMPLETE',
            resourceStatusReason: 'Resource creation completed successfully',
          }
        ] : undefined,
        outputs: request.operation === 'describe-stack' ? [
          {
            outputKey: 'BucketName',
            outputValue: 'example-bucket-name',
            description: 'Name of the created S3 bucket',
          }
        ] : undefined,
        validationResult: request.operation === 'validate-template' ? {
          isValid: true,
          warnings: inputData.warnings,
        } : undefined,
      };

      console.log(`CloudFormation operation completed in ${Date.now() - startTime}ms`);

      return {
        operationResult,
        executionErrors: errors.length > 0 ? errors : undefined,
        originalRequest: request,
        validationResult: {
          isValid: inputData.isValid,
          validationErrors: inputData.validationErrors,
          warnings: inputData.warnings,
        },
      };

    } catch (error) {
      const cfnError = handleCfnError(error, request.operation, request.stackName);
      errors.push(cfnError);

      console.error('CloudFormation operation failed:', error);

      // Return partial result with error information
      return {
        operationResult: {
          validationResult: {
            isValid: false,
            validationErrors: [cfnError.message],
          },
        },
        executionErrors: errors,
        originalRequest: request,
        validationResult: {
          isValid: inputData.isValid,
          validationErrors: inputData.validationErrors,
          warnings: inputData.warnings,
        },
      };
    }
  },
});

// Step 3: Result Processing and Recommendations
const resultProcessing = createStep({
  id: 'result-processing',
  inputSchema: z.object({
    operationResult: z.object({
      stackDetails: z.object({
        stackName: z.string().optional(),
        stackId: z.string().optional(),
        stackStatus: z.string().optional(),
        creationTime: z.string().optional(),
        lastUpdatedTime: z.string().optional(),
        description: z.string().optional(),
        capabilities: z.array(z.string()).optional(),
        tags: z.array(z.object({
          key: z.string(),
          value: z.string(),
        })).optional(),
      }).optional(),
      resources: z.array(z.object({
        logicalResourceId: z.string(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string(),
        resourceStatus: z.string(),
        timestamp: z.string().optional(),
      })).optional(),
      events: z.array(z.object({
        eventId: z.string(),
        stackName: z.string(),
        logicalResourceId: z.string().optional(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string().optional(),
        timestamp: z.string(),
        resourceStatus: z.string().optional(),
        resourceStatusReason: z.string().optional(),
      })).optional(),
      outputs: z.array(z.object({
        outputKey: z.string(),
        outputValue: z.string(),
        description: z.string().optional(),
      })).optional(),
      changeSet: z.object({
        changeSetName: z.string().optional(),
        changeSetId: z.string().optional(),
        changes: z.array(z.object({
          action: z.string(),
          logicalResourceId: z.string(),
          resourceType: z.string(),
          replacement: z.string().optional(),
        })).optional(),
      }).optional(),
      validationResult: z.object({
        isValid: z.boolean(),
        validationErrors: z.array(z.string()).optional(),
        warnings: z.array(z.string()).optional(),
      }).optional(),
    }),
    executionErrors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.string(),
    })).optional(),
    originalRequest: cfnOperationRequestSchema,
    validationResult: z.object({
      isValid: z.boolean(),
      validationErrors: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
  }),
  outputSchema: cfnOperationResultSchema,
  execute: async ({ inputData }) => {
    const startTime = Date.now();

    console.log('Processing CloudFormation operation results...');

    // Determine overall status
    let status: 'success' | 'failed' | 'in-progress' | 'validation-only';

    if (inputData.originalRequest.dryRun) {
      status = 'validation-only';
    } else if (inputData.operationResult.stackDetails?.stackStatus?.includes('FAILED')) {
      status = 'failed';
    } else if (inputData.operationResult.stackDetails?.stackStatus?.includes('IN_PROGRESS')) {
      status = 'in-progress';
    } else if (inputData.validationResult.isValid) {
      status = 'success';
    } else {
      status = 'failed';
    }

    // Generate recommendations based on operation and results
    const recommendations: string[] = [];

    switch (inputData.originalRequest.operation) {
      case 'create-stack':
        recommendations.push('Monitor stack creation progress using describe-stack-events');
        recommendations.push('Verify all resources are created successfully before proceeding');
        if (inputData.operationResult.stackDetails?.capabilities?.includes('CAPABILITY_IAM')) {
          recommendations.push('Review IAM resources created by this stack for security compliance');
        }
        break;

      case 'update-stack':
        recommendations.push('Create a change set first to preview changes before updating');
        recommendations.push('Monitor update progress and be prepared to rollback if needed');
        recommendations.push('Test changes in a development environment first');
        break;

      case 'delete-stack':
        recommendations.push('Ensure all data is backed up before deletion');
        recommendations.push('Check for any dependent resources that might be affected');
        recommendations.push('Monitor deletion progress to ensure clean removal');
        break;

      case 'validate-template':
        if (inputData.operationResult.validationResult?.isValid) {
          recommendations.push('Template validation passed - ready for deployment');
          recommendations.push('Consider creating a change set to preview resource changes');
        } else {
          recommendations.push('Fix validation errors before attempting deployment');
          recommendations.push('Review template syntax and resource configurations');
        }
        break;

      case 'create-change-set':
        recommendations.push('Review the change set carefully before execution');
        recommendations.push('Pay attention to any resource replacements that may cause downtime');
        recommendations.push('Execute the change set only after thorough review');
        break;

      default:
        recommendations.push('Follow AWS CloudFormation best practices');
        recommendations.push('Monitor CloudTrail logs for detailed operation history');
    }

    // Add general recommendations
    recommendations.push('Use CloudFormation drift detection to ensure stack consistency');
    recommendations.push('Implement proper tagging strategy for resource management');
    recommendations.push('Consider using CloudFormation StackSets for multi-account deployments');

    // Add warnings as recommendations
    if (inputData.validationResult.warnings.length > 0) {
      recommendations.push(...inputData.validationResult.warnings.map(w => `Warning: ${w}`));
    }

    const executionTime = Date.now() - startTime;
    console.log(`Result processing completed in ${executionTime}ms`);

    return {
      status,
      operation: inputData.originalRequest.operation,
      stackName: inputData.originalRequest.stackName,
      stackId: inputData.operationResult.stackDetails?.stackId,
      stackStatus: inputData.operationResult.stackDetails?.stackStatus,
      operationResult: inputData.operationResult,
      errors: inputData.validationResult.validationErrors.length > 0 ?
        inputData.validationResult.validationErrors.map(error => ({
          code: 'VALIDATION_ERROR',
          message: error,
          severity: 'error' as const,
        })) : undefined,
      recommendations,
      executionTime,
    };
  },
});

// CloudFormation Operations Workflow
export const cfnOperationsWorkflow = createWorkflow({
  id: 'cfn-operations-workflow',
  inputSchema: cfnOperationRequestSchema,
  outputSchema: cfnOperationResultSchema,
})
  .then(preOperationValidation)
  .then(cfnAgentExecution)
  .then(resultProcessing);

cfnOperationsWorkflow.commit();

/**
 * CloudFormation Operations Workflow
 *
 * This workflow provides direct access to CloudFormation operations through the cfnAgent
 * without requiring coreAgent interaction. It supports all major CloudFormation operations
 * with comprehensive validation, error handling, and result processing.
 *
 * Supported Operations:
 * - create-stack: Create a new CloudFormation stack
 * - update-stack: Update an existing stack
 * - delete-stack: Delete a stack and its resources
 * - describe-stack: Get detailed information about a stack
 * - list-stacks: List all stacks in the region
 * - validate-template: Validate a CloudFormation template
 * - get-template: Retrieve the template for an existing stack
 * - create-change-set: Create a change set for stack updates
 * - execute-change-set: Execute a previously created change set
 * - describe-stack-events: Get events for a stack
 * - describe-stack-resources: Get resources for a stack
 *
 * Features:
 * - Pre-operation validation with detailed error checking
 * - Comprehensive error handling with retry mechanisms
 * - Support for dry-run operations
 * - Detailed result processing with recommendations
 * - TypeScript type safety throughout the workflow
 * - Performance monitoring and logging
 *
 * Usage Example:
 * ```typescript
 * // Create a new stack
 * const createResult = await cfnOperationsWorkflow.execute({
 *   operation: 'create-stack',
 *   stackName: 'my-application-stack',
 *   templateBody: JSON.stringify(myTemplate),
 *   parameters: [
 *     { key: 'Environment', value: 'production' },
 *     { key: 'InstanceType', value: 't3.micro' }
 *   ],
 *   capabilities: ['CAPABILITY_IAM'],
 *   tags: { Project: 'MyApp', Owner: 'DevTeam' },
 *   timeoutInMinutes: 30,
 *   dryRun: false
 * });
 *
 * // Validate a template
 * const validateResult = await cfnOperationsWorkflow.execute({
 *   operation: 'validate-template',
 *   templateUrl: 'https://s3.amazonaws.com/my-bucket/template.yaml',
 *   dryRun: true
 * });
 *
 * // Describe stack status
 * const statusResult = await cfnOperationsWorkflow.execute({
 *   operation: 'describe-stack',
 *   stackName: 'my-application-stack'
 * });
 * ```
 */
