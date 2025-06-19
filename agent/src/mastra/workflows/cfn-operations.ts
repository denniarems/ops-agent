import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  createResourceTool,
  getResourceTool,
  updateResourceTool,
  deleteResourceTool,
  listResourcesTool,
  getRequestStatusTool,
  createTemplateTool,
  getResourceSchemaInformationTool
} from '../tools/cfn-tools';

// Input schema for CloudFormation resource lifecycle operations
export const cfnResourceLifecycleRequestSchema = z.object({
  operation: z.enum([
    'create-resource-lifecycle',
    'update-resource-lifecycle',
    'template-generation-flow',
    'delete-resource-lifecycle',
    'list-and-manage-resources'
  ]).describe('CloudFormation resource lifecycle operation to perform'),

  // Resource creation parameters
  resourceType: z.string().optional().describe('AWS resource type (e.g., AWS::S3::Bucket)'),
  resourceProperties: z.record(z.any()).optional().describe('Resource properties'),
  stackName: z.string().optional().describe('Custom stack name (auto-generated if not provided)'),

  // Update parameters
  stackId: z.string().optional().describe('Stack ID for update/delete operations'),
  updatedProperties: z.record(z.any()).optional().describe('Updated resource properties'),

  // Filtering and management parameters
  resourceTypeFilter: z.string().optional().describe('Filter resources by type'),
  maxResults: z.number().optional().default(10).describe('Maximum results to return'),

  // Template generation parameters
  templateFormat: z.enum(['JSON', 'YAML']).optional().default('JSON').describe('Template output format'),

  // General parameters
  region: z.string().optional().describe('AWS region for operations'),
  waitForCompletion: z.boolean().default(true).describe('Wait for operations to complete'),
  maxWaitTime: z.number().default(300).describe('Maximum wait time in seconds'),
});

// Output schema for CloudFormation resource lifecycle operations
export const cfnResourceLifecycleResultSchema = z.object({
  status: z.enum(['success', 'failed', 'in-progress', 'completed']),
  operation: z.string(),

  // Resource creation results
  createdResource: z.object({
    stackId: z.string(),
    stackName: z.string(),
    resourceType: z.string(),
    status: z.string(),
  }).optional(),

  // Resource details
  resourceDetails: z.object({
    stackId: z.string(),
    stackName: z.string(),
    stackStatus: z.string(),
    resourceDetails: z.object({
      logicalResourceId: z.string(),
      physicalResourceId: z.string().optional(),
      resourceType: z.string(),
      resourceStatus: z.string(),
      timestamp: z.string(),
      metadata: z.record(z.any()).optional(),
    }),
    outputs: z.array(z.object({
      outputKey: z.string(),
      outputValue: z.string(),
      description: z.string().optional(),
    })).optional(),
  }).optional(),

  // Update results
  updateResult: z.object({
    stackId: z.string(),
    stackName: z.string(),
    status: z.string(),
    changeSetId: z.string().optional(),
  }).optional(),

  // List results
  resources: z.array(z.object({
    stackId: z.string(),
    stackName: z.string(),
    resourceType: z.string(),
    stackStatus: z.string(),
    creationTime: z.string().optional(),
    lastUpdatedTime: z.string().optional(),
    tags: z.record(z.string()).optional(),
  })).optional(),

  // Template generation results
  template: z.object({
    stackId: z.string(),
    stackName: z.string(),
    template: z.string(),
    templateFormat: z.string(),
    templateSize: z.number(),
  }).optional(),

  // Schema information
  schemaInfo: z.object({
    resourceType: z.string(),
    schema: z.record(z.any()),
    schemaVersion: z.string().optional(),
    documentation: z.string().optional(),
    properties: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })).optional(),
  }).optional(),

  // Status tracking
  statusChecks: z.array(z.object({
    timestamp: z.string(),
    stackStatus: z.string(),
    isComplete: z.boolean(),
    isSuccessful: z.boolean(),
  })).optional(),

  // General fields
  errors: z.array(z.object({
    code: z.string(),
    message: z.string(),
    severity: z.enum(['warning', 'error', 'critical']),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
  executionTime: z.number().describe('Total execution time in milliseconds'),
  stepsCompleted: z.array(z.string()).describe('List of completed workflow steps'),
});

// Error handling utility for native CloudFormation tools
const handleNativeCfnError = (error: any, operation: string, context?: string) => {
  console.error(`Native CloudFormation ${operation} error${context ? ` (${context})` : ''}:`, error);

  // Parse common CloudFormation error codes from native tools
  let severity: 'warning' | 'error' | 'critical' = 'error';
  let code = 'UNKNOWN_ERROR';

  if (error.message) {
    if (error.message.includes('CloudFormation validation error')) {
      code = 'VALIDATION_ERROR';
      severity = 'warning';
    } else if (error.message.includes('AWS credentials expired')) {
      code = 'CREDENTIALS_EXPIRED';
      severity = 'critical';
    } else if (error.message.includes('Resource already exists')) {
      code = 'RESOURCE_ALREADY_EXISTS';
      severity = 'warning';
    } else if (error.message.includes('Stack not found')) {
      code = 'STACK_NOT_FOUND';
      severity = 'error';
    } else if (error.message.includes('Insufficient capabilities')) {
      code = 'INSUFFICIENT_CAPABILITIES';
      severity = 'error';
    } else if (error.message.includes('AWS service limit exceeded')) {
      code = 'SERVICE_LIMIT_EXCEEDED';
      severity = 'error';
    } else if (error.message.includes('read-only mode')) {
      code = 'READ_ONLY_MODE';
      severity = 'warning';
    }
  }

  return {
    code,
    message: error.message || 'Unknown CloudFormation error',
    severity,
  };
};

// Utility to wait for stack operation completion
const waitForStackCompletion = async (
  stackId: string,
  runtimeContext: any,
  maxWaitTime: number = 300,
  pollInterval: number = 10
): Promise<{ isComplete: boolean; isSuccessful: boolean; finalStatus: string }> => {
  const startTime = Date.now();
  const maxWaitMs = maxWaitTime * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      const statusResult = await getRequestStatusTool.execute({
        context: { stackId },
        runtimeContext
      });

      if (statusResult.isComplete) {
        return {
          isComplete: true,
          isSuccessful: statusResult.isSuccessful,
          finalStatus: statusResult.stackStatus
        };
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));

    } catch (error) {
      console.warn(`Error checking stack status: ${error}`);
      // Continue polling unless it's a critical error
      if (error instanceof Error && error.message.includes('Stack not found')) {
        return { isComplete: true, isSuccessful: false, finalStatus: 'NOT_FOUND' };
      }
    }
  }

  // Timeout reached
  return { isComplete: false, isSuccessful: false, finalStatus: 'TIMEOUT' };
};

// Step 1: Resource Creation Flow - Create → Status Check → Get Details
const resourceCreationFlow = createStep({
  id: 'resource-creation-flow',
  inputSchema: z.object({
    resourceType: z.string(),
    resourceProperties: z.record(z.any()),
    stackName: z.string().optional(),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: z.object({
    createdResource: z.object({
      stackId: z.string(),
      stackName: z.string(),
      resourceType: z.string(),
      status: z.string(),
    }),
    resourceDetails: z.object({
      stackId: z.string(),
      stackName: z.string(),
      stackStatus: z.string(),
      resourceDetails: z.object({
        logicalResourceId: z.string(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string(),
        resourceStatus: z.string(),
        timestamp: z.string(),
        metadata: z.record(z.any()).optional(),
      }),
      outputs: z.array(z.object({
        outputKey: z.string(),
        outputValue: z.string(),
        description: z.string().optional(),
      })).optional(),
    }).optional(),
    statusChecks: z.array(z.object({
      timestamp: z.string(),
      stackStatus: z.string(),
      isComplete: z.boolean(),
      isSuccessful: z.boolean(),
    })),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['warning', 'error', 'critical']),
    })).optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const errors: any[] = [];
    const statusChecks: any[] = [];

    try {
      // Step 1a: Create the resource
      console.log(`Creating resource: ${inputData.resourceType}`);
      const createResult = await createResourceTool.execute({
        context: {
          resourceType: inputData.resourceType,
          properties: inputData.resourceProperties,
          stackName: inputData.stackName,
        },
        runtimeContext,
      });

      const createdResource = {
        stackId: createResult.stackId,
        stackName: createResult.stackName,
        resourceType: createResult.resourceType,
        status: createResult.status,
      };

      // Step 1b: Wait for completion if requested
      let resourceDetails = undefined;
      if (inputData.waitForCompletion) {
        console.log(`Waiting for stack completion: ${createResult.stackId}`);
        const completionResult = await waitForStackCompletion(
          createResult.stackId,
          runtimeContext,
          inputData.maxWaitTime
        );

        statusChecks.push({
          timestamp: new Date().toISOString(),
          stackStatus: completionResult.finalStatus,
          isComplete: completionResult.isComplete,
          isSuccessful: completionResult.isSuccessful,
        });

        // Step 1c: Get detailed resource information if successful
        if (completionResult.isComplete && completionResult.isSuccessful) {
          console.log(`Getting resource details: ${createResult.stackId}`);
          const detailsResult = await getResourceTool.execute({
            context: { stackId: createResult.stackId },
            runtimeContext,
          });

          resourceDetails = detailsResult;
        }
      }

      return {
        createdResource,
        resourceDetails,
        statusChecks,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'resource-creation-flow');
      errors.push(cfnError);

      return {
        createdResource: {
          stackId: '',
          stackName: inputData.stackName || '',
          resourceType: inputData.resourceType,
          status: 'FAILED',
        },
        resourceDetails: undefined,
        statusChecks,
        errors,
      };
    }
  },
});

// Step 2: Resource Update Flow - List → Update → Status Check
const resourceUpdateFlow = createStep({
  id: 'resource-update-flow',
  inputSchema: z.object({
    stackId: z.string(),
    updatedProperties: z.record(z.any()),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: z.object({
    updateResult: z.object({
      stackId: z.string(),
      stackName: z.string(),
      status: z.string(),
      changeSetId: z.string().optional(),
    }),
    resourceDetails: z.object({
      stackId: z.string(),
      stackName: z.string(),
      stackStatus: z.string(),
      resourceDetails: z.object({
        logicalResourceId: z.string(),
        physicalResourceId: z.string().optional(),
        resourceType: z.string(),
        resourceStatus: z.string(),
        timestamp: z.string(),
        metadata: z.record(z.any()).optional(),
      }),
      outputs: z.array(z.object({
        outputKey: z.string(),
        outputValue: z.string(),
        description: z.string().optional(),
      })).optional(),
    }).optional(),
    statusChecks: z.array(z.object({
      timestamp: z.string(),
      stackStatus: z.string(),
      isComplete: z.boolean(),
      isSuccessful: z.boolean(),
    })),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['warning', 'error', 'critical']),
    })).optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const errors: any[] = [];
    const statusChecks: any[] = [];

    try {
      // Step 2a: Update the resource
      console.log(`Updating resource in stack: ${inputData.stackId}`);
      const updateResult = await updateResourceTool.execute({
        context: {
          stackId: inputData.stackId,
          properties: inputData.updatedProperties,
        },
        runtimeContext,
      });

      const updateResponse = {
        stackId: updateResult.stackId,
        stackName: updateResult.stackName,
        status: updateResult.status,
        changeSetId: updateResult.changeSetId,
      };

      // Step 2b: Wait for completion if requested
      let resourceDetails = undefined;
      if (inputData.waitForCompletion) {
        console.log(`Waiting for update completion: ${updateResult.stackId}`);
        const completionResult = await waitForStackCompletion(
          updateResult.stackId,
          runtimeContext,
          inputData.maxWaitTime
        );

        statusChecks.push({
          timestamp: new Date().toISOString(),
          stackStatus: completionResult.finalStatus,
          isComplete: completionResult.isComplete,
          isSuccessful: completionResult.isSuccessful,
        });

        // Step 2c: Get updated resource details if successful
        if (completionResult.isComplete && completionResult.isSuccessful) {
          console.log(`Getting updated resource details: ${updateResult.stackId}`);
          const detailsResult = await getResourceTool.execute({
            context: { stackId: updateResult.stackId },
            runtimeContext,
          });

          resourceDetails = detailsResult;
        }
      }

      return {
        updateResult: updateResponse,
        resourceDetails,
        statusChecks,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'resource-update-flow');
      errors.push(cfnError);

      return {
        updateResult: {
          stackId: inputData.stackId,
          stackName: '',
          status: 'FAILED',
          changeSetId: undefined,
        },
        resourceDetails: undefined,
        statusChecks,
        errors,
      };
    }
  },
});

// Step 3: Template Generation Flow - Schema → Template
const templateGenerationFlow = createStep({
  id: 'template-generation-flow',
  inputSchema: z.object({
    resourceType: z.string(),
    stackId: z.string().optional(),
    templateFormat: z.enum(['JSON', 'YAML']).default('JSON'),
  }),
  outputSchema: z.object({
    schemaInfo: z.object({
      resourceType: z.string(),
      schema: z.record(z.any()),
      schemaVersion: z.string().optional(),
      documentation: z.string().optional(),
      properties: z.array(z.object({
        name: z.string(),
        type: z.string(),
        required: z.boolean(),
        description: z.string().optional(),
      })).optional(),
    }).optional(),
    template: z.object({
      stackId: z.string(),
      stackName: z.string(),
      template: z.string(),
      templateFormat: z.string(),
      templateSize: z.number(),
    }).optional(),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['warning', 'error', 'critical']),
    })).optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const errors: any[] = [];

    try {
      // Step 3a: Get resource schema information
      console.log(`Getting schema information for: ${inputData.resourceType}`);
      const schemaResult = await getResourceSchemaInformationTool.execute({
        context: { resourceType: inputData.resourceType },
        runtimeContext,
      });

      // Step 3b: Generate template if stack ID provided
      let templateResult = undefined;
      if (inputData.stackId) {
        console.log(`Generating template for stack: ${inputData.stackId}`);
        const templateResponse = await createTemplateTool.execute({
          context: {
            stackId: inputData.stackId,
            templateFormat: inputData.templateFormat,
          },
          runtimeContext,
        });

        templateResult = templateResponse;
      }

      return {
        schemaInfo: schemaResult,
        template: templateResult,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'template-generation-flow');
      errors.push(cfnError);

      return {
        schemaInfo: undefined,
        template: undefined,
        errors,
      };
    }
  },
});

// Step 4: Resource Deletion Flow - Delete → Status Check
const resourceDeletionFlow = createStep({
  id: 'resource-deletion-flow',
  inputSchema: z.object({
    stackId: z.string(),
    retainResources: z.array(z.string()).optional(),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: z.object({
    deletionResult: z.object({
      stackId: z.string(),
      stackName: z.string(),
      status: z.string(),
      deletionTime: z.string(),
    }),
    statusChecks: z.array(z.object({
      timestamp: z.string(),
      stackStatus: z.string(),
      isComplete: z.boolean(),
      isSuccessful: z.boolean(),
    })),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['warning', 'error', 'critical']),
    })).optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const errors: any[] = [];
    const statusChecks: any[] = [];

    try {
      // Step 4a: Delete the resource
      console.log(`Deleting resource stack: ${inputData.stackId}`);
      const deleteResult = await deleteResourceTool.execute({
        context: {
          stackId: inputData.stackId,
          retainResources: inputData.retainResources,
        },
        runtimeContext,
      });

      const deletionResponse = {
        stackId: deleteResult.stackId,
        stackName: deleteResult.stackName,
        status: deleteResult.status,
        deletionTime: deleteResult.deletionTime,
      };

      // Step 4b: Wait for completion if requested
      if (inputData.waitForCompletion) {
        console.log(`Waiting for deletion completion: ${deleteResult.stackId}`);
        const completionResult = await waitForStackCompletion(
          deleteResult.stackId,
          runtimeContext,
          inputData.maxWaitTime
        );

        statusChecks.push({
          timestamp: new Date().toISOString(),
          stackStatus: completionResult.finalStatus,
          isComplete: completionResult.isComplete,
          isSuccessful: completionResult.isSuccessful,
        });
      }

      return {
        deletionResult: deletionResponse,
        statusChecks,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'resource-deletion-flow');
      errors.push(cfnError);

      return {
        deletionResult: {
          stackId: inputData.stackId,
          stackName: '',
          status: 'FAILED',
          deletionTime: new Date().toISOString(),
        },
        statusChecks,
        errors,
      };
    }
  },
});

// Step 5: List and Manage Resources Flow
const listAndManageResourcesFlow = createStep({
  id: 'list-and-manage-resources-flow',
  inputSchema: z.object({
    resourceTypeFilter: z.string().optional(),
    maxResults: z.number().default(10),
  }),
  outputSchema: z.object({
    resources: z.array(z.object({
      stackId: z.string(),
      stackName: z.string(),
      resourceType: z.string(),
      stackStatus: z.string(),
      creationTime: z.string().optional(),
      lastUpdatedTime: z.string().optional(),
      tags: z.record(z.string()).optional(),
    })),
    totalCount: z.number(),
    hasMore: z.boolean(),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      severity: z.enum(['warning', 'error', 'critical']),
    })).optional(),
  }),
  execute: async ({ inputData, runtimeContext }) => {
    const errors: any[] = [];

    try {
      console.log('Listing managed CloudFormation resources...');
      const listResult = await listResourcesTool.execute({
        context: {
          resourceTypeFilter: inputData.resourceTypeFilter,
          maxResults: inputData.maxResults,
        },
        runtimeContext,
      });

      return {
        resources: listResult.resources,
        totalCount: listResult.totalCount,
        hasMore: listResult.hasMore,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'list-and-manage-resources-flow');
      errors.push(cfnError);

      return {
        resources: [],
        totalCount: 0,
        hasMore: false,
        errors,
      };
    }
  },
});

// CloudFormation Resource Lifecycle Workflows
export const cfnResourceCreationWorkflow = createWorkflow({
  id: 'cfn-resource-creation-workflow',
  inputSchema: z.object({
    resourceType: z.string(),
    resourceProperties: z.record(z.any()),
    stackName: z.string().optional(),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(resourceCreationFlow);

export const cfnResourceUpdateWorkflow = createWorkflow({
  id: 'cfn-resource-update-workflow',
  inputSchema: z.object({
    stackId: z.string(),
    updatedProperties: z.record(z.any()),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(resourceUpdateFlow);

export const cfnTemplateGenerationWorkflow = createWorkflow({
  id: 'cfn-template-generation-workflow',
  inputSchema: z.object({
    resourceType: z.string(),
    stackId: z.string().optional(),
    templateFormat: z.enum(['JSON', 'YAML']).default('JSON'),
  }),
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(templateGenerationFlow);

export const cfnResourceDeletionWorkflow = createWorkflow({
  id: 'cfn-resource-deletion-workflow',
  inputSchema: z.object({
    stackId: z.string(),
    retainResources: z.array(z.string()).optional(),
    waitForCompletion: z.boolean().default(true),
    maxWaitTime: z.number().default(300),
  }),
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(resourceDeletionFlow);

export const cfnResourceListingWorkflow = createWorkflow({
  id: 'cfn-resource-listing-workflow',
  inputSchema: z.object({
    resourceTypeFilter: z.string().optional(),
    maxResults: z.number().default(10),
  }),
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(listAndManageResourcesFlow);

// Main operation router step
const operationRouter = createStep({
  id: 'operation-router',
  inputSchema: cfnResourceLifecycleRequestSchema,
  outputSchema: cfnResourceLifecycleResultSchema,
  execute: async ({ inputData, runtimeContext }) => {
    const startTime = Date.now();
    const { operation } = inputData;

    try {
      let result: any;

      switch (operation) {
        case 'create-resource-lifecycle':
          // Create → Status Check → Get Details flow
          const createResult = await createResourceTool.execute({
            context: {
              resourceType: inputData.resourceType!,
              properties: inputData.resourceProperties!,
              stackName: inputData.stackName,
            },
            runtimeContext,
          });

          let resourceDetails = undefined;
          const statusChecks = [];

          if (inputData.waitForCompletion) {
            const completionResult = await waitForStackCompletion(
              createResult.stackId,
              runtimeContext,
              inputData.maxWaitTime
            );

            statusChecks.push({
              timestamp: new Date().toISOString(),
              stackStatus: completionResult.finalStatus,
              isComplete: completionResult.isComplete,
              isSuccessful: completionResult.isSuccessful,
            });

            if (completionResult.isComplete && completionResult.isSuccessful) {
              resourceDetails = await getResourceTool.execute({
                context: { stackId: createResult.stackId },
                runtimeContext,
              });
            }
          }

          result = {
            createdResource: createResult,
            resourceDetails,
            statusChecks,
          };
          break;

        case 'update-resource-lifecycle':
          // Update → Status Check flow
          const updateResult = await updateResourceTool.execute({
            context: {
              stackId: inputData.stackId!,
              properties: inputData.updatedProperties!,
            },
            runtimeContext,
          });

          let updatedResourceDetails = undefined;
          const updateStatusChecks = [];

          if (inputData.waitForCompletion) {
            const updateCompletionResult = await waitForStackCompletion(
              updateResult.stackId,
              runtimeContext,
              inputData.maxWaitTime
            );

            updateStatusChecks.push({
              timestamp: new Date().toISOString(),
              stackStatus: updateCompletionResult.finalStatus,
              isComplete: updateCompletionResult.isComplete,
              isSuccessful: updateCompletionResult.isSuccessful,
            });

            if (updateCompletionResult.isComplete && updateCompletionResult.isSuccessful) {
              updatedResourceDetails = await getResourceTool.execute({
                context: { stackId: updateResult.stackId },
                runtimeContext,
              });
            }
          }

          result = {
            updateResult,
            resourceDetails: updatedResourceDetails,
            statusChecks: updateStatusChecks,
          };
          break;

        case 'template-generation-flow':
          // Schema → Template flow
          const schemaResult = await getResourceSchemaInformationTool.execute({
            context: { resourceType: inputData.resourceType! },
            runtimeContext,
          });

          let templateResult = undefined;
          if (inputData.stackId) {
            templateResult = await createTemplateTool.execute({
              context: {
                stackId: inputData.stackId,
                templateFormat: inputData.templateFormat,
              },
              runtimeContext,
            });
          }

          result = {
            schemaInfo: schemaResult,
            template: templateResult,
          };
          break;

        case 'delete-resource-lifecycle':
          // Delete → Status Check flow
          const deleteResult = await deleteResourceTool.execute({
            context: {
              stackId: inputData.stackId!,
              retainResources: [],
            },
            runtimeContext,
          });

          const deleteStatusChecks = [];

          if (inputData.waitForCompletion) {
            const deleteCompletionResult = await waitForStackCompletion(
              deleteResult.stackId,
              runtimeContext,
              inputData.maxWaitTime
            );

            deleteStatusChecks.push({
              timestamp: new Date().toISOString(),
              stackStatus: deleteCompletionResult.finalStatus,
              isComplete: deleteCompletionResult.isComplete,
              isSuccessful: deleteCompletionResult.isSuccessful,
            });
          }

          result = {
            deletionResult: deleteResult,
            statusChecks: deleteStatusChecks,
          };
          break;

        case 'list-and-manage-resources':
          // List resources flow
          const listResult = await listResourcesTool.execute({
            context: {
              resourceTypeFilter: inputData.resourceTypeFilter,
              maxResults: inputData.maxResults,
            },
            runtimeContext,
          });

          result = {
            resources: listResult.resources,
            totalCount: listResult.totalCount,
            hasMore: listResult.hasMore,
          };
          break;

        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      return {
        ...result,
        status: 'completed' as const,
        operation,
        executionTime: Date.now() - startTime,
        stepsCompleted: [operation],
      };

    } catch (error) {
      const cfnError = handleNativeCfnError(error, 'operation-router');

      return {
        status: 'failed' as const,
        operation,
        executionTime: Date.now() - startTime,
        stepsCompleted: [],
        errors: [cfnError],
      };
    }
  },
});

// Main comprehensive workflow that can handle all operations
export const cfnOperationsWorkflow = createWorkflow({
  id: 'cfn-operations-workflow',
  inputSchema: cfnResourceLifecycleRequestSchema,
  outputSchema: cfnResourceLifecycleResultSchema,
})
  .then(operationRouter);

// Commit all workflows
cfnResourceCreationWorkflow.commit();
cfnResourceUpdateWorkflow.commit();
cfnTemplateGenerationWorkflow.commit();
cfnResourceDeletionWorkflow.commit();
cfnResourceListingWorkflow.commit();
cfnOperationsWorkflow.commit();

/**
 * CloudFormation Resource Lifecycle Workflows
 *
 * This module provides comprehensive CloudFormation resource lifecycle management through
 * native TypeScript tools instead of MCP-based implementations. It demonstrates the complete
 * CloudFormation resource lifecycle using iterative flows that showcase how the 8 native tools
 * work together in realistic Infrastructure-as-Code scenarios.
 *
 * Supported Operations:
 * - create-resource-lifecycle: Create → Status Check → Get Details flow
 * - update-resource-lifecycle: Update → Status Check → Get Details flow
 * - template-generation-flow: Schema → Template generation flow
 * - delete-resource-lifecycle: Delete → Status Check flow
 * - list-and-manage-resources: List and filter managed resources
 *
 * Native Tools Used:
 * - createResource: Create AWS resources via CloudFormation stacks
 * - getResource: Retrieve resource details from stacks
 * - updateResource: Update resources by modifying stack templates
 * - deleteResource: Delete resources by deleting stacks
 * - listResources: List all managed resources with filtering
 * - getRequestStatus: Check stack operation status
 * - createTemplate: Generate CloudFormation templates from stacks
 * - getResourceSchemaInformation: Retrieve CloudFormation resource schemas
 *
 * Features:
 * - Native TypeScript tool integration (no MCP dependencies)
 * - Stack-per-resource architecture for precise lifecycle control
 * - Comprehensive error handling with detailed feedback
 * - Asynchronous operation tracking with status polling
 * - Enhanced AWS service limit and credential management
 * - TypeScript type safety throughout all workflows
 * - Performance monitoring and execution tracking
 *
 * Usage Examples:
 * ```typescript
 * // Create a new S3 bucket resource
 * const createResult = await cfnOperationsWorkflow.execute({
 *   operation: 'create-resource-lifecycle',
 *   resourceType: 'AWS::S3::Bucket',
 *   resourceProperties: {
 *     BucketName: 'my-application-bucket',
 *     VersioningConfiguration: { Status: 'Enabled' },
 *     PublicAccessBlockConfiguration: {
 *       BlockPublicAcls: true,
 *       BlockPublicPolicy: true,
 *       IgnorePublicAcls: true,
 *       RestrictPublicBuckets: true
 *     }
 *   },
 *   waitForCompletion: true,
 *   maxWaitTime: 300
 * });
 *
 * // Update an existing resource
 * const updateResult = await cfnOperationsWorkflow.execute({
 *   operation: 'update-resource-lifecycle',
 *   stackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/my-stack/uuid',
 *   updatedProperties: {
 *     VersioningConfiguration: { Status: 'Suspended' }
 *   },
 *   waitForCompletion: true
 * });
 *
 * // Generate template and get schema information
 * const templateResult = await cfnOperationsWorkflow.execute({
 *   operation: 'template-generation-flow',
 *   resourceType: 'AWS::S3::Bucket',
 *   stackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/my-stack/uuid',
 *   templateFormat: 'JSON'
 * });
 *
 * // List managed resources
 * const listResult = await cfnOperationsWorkflow.execute({
 *   operation: 'list-and-manage-resources',
 *   resourceTypeFilter: 'AWS::S3::Bucket',
 *   maxResults: 20
 * });
 *
 * // Delete a resource
 * const deleteResult = await cfnOperationsWorkflow.execute({
 *   operation: 'delete-resource-lifecycle',
 *   stackId: 'arn:aws:cloudformation:us-east-1:123456789012:stack/my-stack/uuid',
 *   waitForCompletion: true
 * });
 * ```
 */
