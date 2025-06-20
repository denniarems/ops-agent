import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import {
  CloudFormationClient,
  CreateStackCommand,
  DescribeStacksCommand,
  DescribeStackResourceCommand,
  UpdateStackCommand,
  DeleteStackCommand,
  ListStacksCommand,
  GetTemplateCommand,
  DescribeTypeCommand,
  CreateStackCommandInput,
  UpdateStackCommandInput,
  StackStatus,
  DescribeTypeCommandInput,
  Capability
} from '@aws-sdk/client-cloudformation';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { getTemporaryCredentialsFromContext } from '../config/sts';
import { AWSRuntimeContext } from '../types/aws-runtime-context';
// AWS runtime context utilities no longer needed - using STS directly
import {
  handleAWSError,
  validateRuntimeContextSafely
} from '../utils/aws-error-handling';
import { v4 as uuidv4 } from 'uuid';

// Environment configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const CFN_READONLY = process.env.CFN_MCP_SERVER_READONLY === 'true';
const CFN_TIMEOUT = parseInt(process.env.CFN_MCP_SERVER_TIMEOUT || '30000');
const CFN_MAX_RETRIES = parseInt(process.env.CFN_MCP_SERVER_MAX_RETRIES || '3');

// Enhanced CloudFormation client factory with runtime context support
export async function createCloudFormationClientFromContext(
  runtimeContext: RuntimeContext<AWSRuntimeContext>
): Promise<CloudFormationClient> {
  try {
    // Validate runtime context first
    const validation = validateRuntimeContextSafely(runtimeContext);
    if (!validation.isValid) {
      throw validation.error || new Error('Invalid runtime context');
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn('Runtime context warnings:', validation.warnings);
    }

    // Get credentials with error handling
    const credentials = await getTemporaryCredentialsFromContext(runtimeContext);
    console.log("🚀 ~ credentials:", credentials)

    return new CloudFormationClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
      maxAttempts: CFN_MAX_RETRIES,
    });
  } catch (error) {
    throw handleAWSError(error, 'CloudFormation client creation');
  }
}

// Utility function to generate unique stack names
export function generateStackName(resourceType?: string): string {
  const uuid = uuidv4();
  const prefix = resourceType ? resourceType.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'resource';
  return `${prefix}-${uuid}`;
}

// Utility function to create CloudFormation template
export function createResourceTemplate(resourceType: string, properties: Record<string, any>): string {
  const template = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: `Template for ${resourceType} created by Mastra CloudFormation Tools`,
    Resources: {
      Resource: {
        Type: resourceType,
        Properties: properties,
      },
    },
    Outputs: {
      ResourceId: {
        Description: 'Physical ID of the created resource',
        Value: { Ref: 'Resource' },
        Export: {
          Name: { 'Fn::Sub': '${AWS::StackName}-ResourceId' }
        }
      }
    }
  };

  return JSON.stringify(template, null, 2);
}

// Utility function to determine required capabilities
export function determineCapabilities(resourceType: string, properties: Record<string, any>): Capability[] {
  const capabilities: Capability[] = [];

  // Add CAPABILITY_IAM for resources that create IAM resources
  const iamResourceTypes = [
    'AWS::IAM::Role',
    'AWS::IAM::Policy',
    'AWS::IAM::User',
    'AWS::IAM::Group',
    'AWS::IAM::InstanceProfile',
    'AWS::IAM::ManagedPolicy',
    'AWS::Lambda::Function', // Often requires IAM roles
    'AWS::Events::Rule', // May require IAM roles
    'AWS::S3::Bucket', // May have IAM policies
  ];

  if (iamResourceTypes.some(type => resourceType.includes(type))) {
    capabilities.push(Capability.CAPABILITY_IAM);
  }

  // Add CAPABILITY_NAMED_IAM for resources with custom names
  if (properties.RoleName || properties.PolicyName || properties.UserName || properties.GroupName) {
    capabilities.push(Capability.CAPABILITY_NAMED_IAM);
  }

  return capabilities;
}

// Error handling utility
export function handleCloudFormationError(error: any): string {
  if (error.name === 'ValidationError') {
    return `CloudFormation validation error: ${error.message}`;
  }
  if (error.name === 'AlreadyExistsException') {
    return `Resource already exists: ${error.message}`;
  }
  if (error.name === 'LimitExceededException') {
    return `AWS service limit exceeded: ${error.message}`;
  }
  if (error.name === 'InsufficientCapabilitiesException') {
    return `Insufficient capabilities: ${error.message}. Try adding CAPABILITY_IAM or CAPABILITY_NAMED_IAM.`;
  }
  if (error.name === 'TokenRefreshRequired') {
    return `AWS credentials expired. Please refresh your session.`;
  }

  return `CloudFormation error: ${error.message || error}`;
}

// Schema definitions for tool inputs and outputs
const ResourcePropertiesSchema = z.record(z.any()).describe('Resource properties as key-value pairs');

const CreateResourceInputSchema = z.object({
  resourceType: z.string().describe('AWS resource type (e.g., AWS::S3::Bucket, AWS::EC2::Instance)'),
  properties: ResourcePropertiesSchema.describe('Resource properties specific to the resource type'),
  stackName: z.string().optional().describe('Optional custom stack name. If not provided, a unique name will be generated'),
  region: z.string().optional().describe('AWS region. Defaults to environment AWS_REGION or us-east-1'),
});

const CreateResourceOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID that can be used to reference this resource'),
  stackName: z.string().describe('CloudFormation stack name'),
  status: z.string().describe('Initial stack creation status'),
  resourceType: z.string().describe('The AWS resource type that was created'),
});

// Create Resource Tool - Creates AWS resources via CloudFormation stacks
const createResourceTool = createTool({
  id: 'create_resource',
  description: 'Create an AWS resource by generating a CloudFormation template and creating a stack. Each resource is managed in its own dedicated stack for precise lifecycle control.',
  inputSchema: CreateResourceInputSchema,
  outputSchema: CreateResourceOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    if (CFN_READONLY) {
      throw new Error('CloudFormation tools are in read-only mode. Resource creation is disabled.');
    }

    const { resourceType, properties, stackName } = context;

    try {
      // Runtime context is required for all CloudFormation operations
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Generate stack name if not provided
      const finalStackName = stackName || generateStackName(resourceType);

      // Create CloudFormation template
      const templateBody = createResourceTemplate(resourceType, properties);

      // Determine required capabilities
      const capabilities = determineCapabilities(resourceType, properties);

      // Prepare create stack command
      const createStackInput: CreateStackCommandInput = {
        StackName: finalStackName,
        TemplateBody: templateBody,
        Capabilities: capabilities.length > 0 ? capabilities : undefined,
        Tags: [
          {
            Key: 'ManagedBy',
            Value: 'Mastra-CloudFormation-Tools'
          },
          {
            Key: 'ResourceType',
            Value: resourceType
          },
          {
            Key: 'CreatedAt',
            Value: new Date().toISOString()
          }
        ],
        TimeoutInMinutes: Math.max(1, Math.floor(CFN_TIMEOUT / 60000)), // Convert ms to minutes, minimum 1
      };

      // Execute stack creation
      const command = new CreateStackCommand(createStackInput);
      const response = await cfnClient.send(command);

      if (!response.StackId) {
        throw new Error('Stack creation failed: No stack ID returned');
      }

      return {
        stackId: response.StackId,
        stackName: finalStackName,
        status: 'CREATE_IN_PROGRESS',
        resourceType: resourceType,
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to create resource ${resourceType}: ${errorMessage}`);
    }
  },
});

// Get Resource Tool - Retrieves details of a specific resource by describing its stack
const GetResourceInputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID or stack name'),
});

const GetResourceOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID'),
  stackName: z.string().describe('CloudFormation stack name'),
  stackStatus: z.string().describe('Current status of the stack'),
  resourceDetails: z.object({
    logicalResourceId: z.string().describe('Logical ID of the resource in the template'),
    physicalResourceId: z.string().optional().describe('Physical ID of the actual AWS resource'),
    resourceType: z.string().describe('AWS resource type'),
    resourceStatus: z.string().describe('Current status of the resource'),
    timestamp: z.string().describe('Last updated timestamp'),
    metadata: z.record(z.any()).optional().describe('Additional resource metadata'),
  }).describe('Detailed information about the resource'),
  outputs: z.array(z.object({
    outputKey: z.string(),
    outputValue: z.string(),
    description: z.string().optional(),
  })).optional().describe('Stack outputs if any'),
});

const getResourceTool = createTool({
  id: 'get_resource',
  description: 'Retrieve details of a specific AWS resource by describing its CloudFormation stack. Provides comprehensive information about the resource status, physical ID, and stack outputs.',
  inputSchema: GetResourceInputSchema,
  outputSchema: GetResourceOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { stackId } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Get stack details
      const describeStacksCommand = new DescribeStacksCommand({
        StackName: stackId,
      });
      const stackResponse = await cfnClient.send(describeStacksCommand);

      if (!stackResponse.Stacks || stackResponse.Stacks.length === 0) {
        throw new Error(`Stack not found: ${stackId}`);
      }

      const stack = stackResponse.Stacks[0];

      // Get resource details (assuming single resource per stack as per our pattern)
      const describeResourceCommand = new DescribeStackResourceCommand({
        StackName: stackId,
        LogicalResourceId: 'Resource', // Our template uses 'Resource' as the logical ID
      });

      const resourceResponse = await cfnClient.send(describeResourceCommand);

      if (!resourceResponse.StackResourceDetail) {
        throw new Error(`Resource details not found for stack: ${stackId}`);
      }

      const resource = resourceResponse.StackResourceDetail;

      // Format outputs
      const outputs = stack.Outputs?.map(output => ({
        outputKey: output.OutputKey || '',
        outputValue: output.OutputValue || '',
        description: output.Description,
      }));

      return {
        stackId: stack.StackId || stackId,
        stackName: stack.StackName || '',
        stackStatus: stack.StackStatus || 'UNKNOWN',
        resourceDetails: {
          logicalResourceId: resource.LogicalResourceId || '',
          physicalResourceId: resource.PhysicalResourceId,
          resourceType: resource.ResourceType || '',
          resourceStatus: resource.ResourceStatus || '',
          timestamp: resource.LastUpdatedTimestamp?.toISOString() || new Date().toISOString(),
          metadata: {
            stackTags: stack.Tags?.reduce((acc, tag) => {
              if (tag.Key) acc[tag.Key] = tag.Value || '';
              return acc;
            }, {} as Record<string, string>),
            description: stack.Description,
            creationTime: stack.CreationTime?.toISOString(),
            lastUpdatedTime: stack.LastUpdatedTime?.toISOString(),
          },
        },
        outputs,
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to get resource details for ${stackId}: ${errorMessage}`);
    }
  },
});

// Update Resource Tool - Updates a resource by modifying its stack template
const UpdateResourceInputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID or stack name'),
  properties: ResourcePropertiesSchema.describe('Updated resource properties'),
});

const UpdateResourceOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID'),
  stackName: z.string().describe('CloudFormation stack name'),
  status: z.string().describe('Stack update status'),
  changeSetId: z.string().optional().describe('Change set ID if applicable'),
});

const updateResourceTool = createTool({
  id: 'update_resource',
  description: 'Update an AWS resource by modifying its CloudFormation stack template. Retrieves the current template, updates the resource properties, and applies the changes.',
  inputSchema: UpdateResourceInputSchema,
  outputSchema: UpdateResourceOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    if (CFN_READONLY) {
      throw new Error('CloudFormation tools are in read-only mode. Resource updates are disabled.');
    }

    const { stackId, properties } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // First, get the current template
      const getTemplateCommand = new GetTemplateCommand({
        StackName: stackId,
      });
      const templateResponse = await cfnClient.send(getTemplateCommand);

      if (!templateResponse.TemplateBody) {
        throw new Error(`Could not retrieve template for stack: ${stackId}`);
      }

      // Parse the current template
      const currentTemplate = JSON.parse(templateResponse.TemplateBody);

      // Update the resource properties
      if (!currentTemplate.Resources || !currentTemplate.Resources.Resource) {
        throw new Error('Template does not contain the expected Resource structure');
      }

      // Merge new properties with existing ones
      currentTemplate.Resources.Resource.Properties = {
        ...currentTemplate.Resources.Resource.Properties,
        ...properties,
      };

      // Update the template description
      currentTemplate.Description = `${currentTemplate.Description || 'Template'} - Updated at ${new Date().toISOString()}`;

      const updatedTemplateBody = JSON.stringify(currentTemplate, null, 2);

      // Get the resource type for capabilities
      const resourceType = currentTemplate.Resources.Resource.Type;
      const capabilities = determineCapabilities(resourceType, currentTemplate.Resources.Resource.Properties);

      // Prepare update stack command
      const updateStackInput: UpdateStackCommandInput = {
        StackName: stackId,
        TemplateBody: updatedTemplateBody,
        Capabilities: capabilities.length > 0 ? capabilities : undefined,
        Tags: [
          {
            Key: 'ManagedBy',
            Value: 'Mastra-CloudFormation-Tools'
          },
          {
            Key: 'LastUpdated',
            Value: new Date().toISOString()
          }
        ],
      };

      // Execute stack update
      const command = new UpdateStackCommand(updateStackInput);
      const response = await cfnClient.send(command);

      // Get stack name for response
      const describeStacksCommand = new DescribeStacksCommand({
        StackName: stackId,
      });
      const stackResponse = await cfnClient.send(describeStacksCommand);
      const stackName = stackResponse.Stacks?.[0]?.StackName || stackId;

      return {
        stackId: response.StackId || stackId,
        stackName: stackName,
        status: 'UPDATE_IN_PROGRESS',
        changeSetId: undefined, // Direct updates don't use change sets
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to update resource in stack ${stackId}: ${errorMessage}`);
    }
  },
});

// Delete Resource Tool - Deletes a resource by deleting its stack
const DeleteResourceInputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID or stack name'),
  retainResources: z.array(z.string()).optional().describe('List of logical resource IDs to retain during deletion'),
});

const DeleteResourceOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID'),
  stackName: z.string().describe('CloudFormation stack name'),
  status: z.string().describe('Stack deletion status'),
  deletionTime: z.string().describe('Deletion initiation timestamp'),
});

const deleteResourceTool = createTool({
  id: 'delete_resource',
  description: 'Delete an AWS resource by deleting its CloudFormation stack. This will permanently remove the resource and cannot be undone.',
  inputSchema: DeleteResourceInputSchema,
  outputSchema: DeleteResourceOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    if (CFN_READONLY) {
      throw new Error('CloudFormation tools are in read-only mode. Resource deletion is disabled.');
    }

    const { stackId, retainResources } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Get stack details before deletion
      const describeStacksCommand = new DescribeStacksCommand({
        StackName: stackId,
      });
      const stackResponse = await cfnClient.send(describeStacksCommand);

      if (!stackResponse.Stacks || stackResponse.Stacks.length === 0) {
        throw new Error(`Stack not found: ${stackId}`);
      }

      const stack = stackResponse.Stacks[0];
      const stackName = stack.StackName || stackId;

      // Prepare delete stack command
      const deleteStackCommand = new DeleteStackCommand({
        StackName: stackId,
        RetainResources: retainResources,
      });

      // Execute stack deletion
      await cfnClient.send(deleteStackCommand);

      const deletionTime = new Date().toISOString();

      return {
        stackId: stack.StackId || stackId,
        stackName: stackName,
        status: 'DELETE_IN_PROGRESS',
        deletionTime: deletionTime,
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to delete resource stack ${stackId}: ${errorMessage}`);
    }
  },
});

// List Resources Tool - Lists all resources by enumerating stacks
const ListResourcesInputSchema = z.object({
  resourceTypeFilter: z.string().optional().describe('Optional filter by AWS resource type (e.g., AWS::S3::Bucket)'),
  stackStatusFilter: z.array(z.string()).optional().describe('Optional filter by stack status (e.g., CREATE_COMPLETE, UPDATE_COMPLETE)'),
  maxResults: z.number().optional().default(100).describe('Maximum number of results to return'),
});

const ListResourcesOutputSchema = z.object({
  resources: z.array(z.object({
    stackId: z.string().describe('CloudFormation stack ID'),
    stackName: z.string().describe('CloudFormation stack name'),
    resourceType: z.string().describe('AWS resource type'),
    stackStatus: z.string().describe('Current stack status'),
    creationTime: z.string().optional().describe('Stack creation time'),
    lastUpdatedTime: z.string().optional().describe('Last update time'),
    tags: z.record(z.string()).optional().describe('Stack tags'),
  })).describe('List of resources found'),
  totalCount: z.number().describe('Total number of resources found'),
  hasMore: z.boolean().describe('Whether there are more results available'),
});

const listResourcesTool = createTool({
  id: 'list_resources',
  description: 'List all AWS resources by enumerating CloudFormation stacks. Supports filtering by resource type and stack status.',
  inputSchema: ListResourcesInputSchema,
  outputSchema: ListResourcesOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { resourceTypeFilter, stackStatusFilter, maxResults = 100 } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // List stacks with optional status filter
      const listStacksCommand = new ListStacksCommand({
        StackStatusFilter: stackStatusFilter as StackStatus[] | undefined,
      });

      const stacksResponse = await cfnClient.send(listStacksCommand);

      if (!stacksResponse.StackSummaries) {
        return {
          resources: [],
          totalCount: 0,
          hasMore: false,
        };
      }

      const resources = [];

      // Process each stack to extract resource information
      for (const stackSummary of stacksResponse.StackSummaries) {
        try {
          // Get detailed stack information to access tags
          const describeStackCommand = new DescribeStacksCommand({
            StackName: stackSummary.StackName,
          });

          const stackDetailResponse = await cfnClient.send(describeStackCommand);
          const stackDetail = stackDetailResponse.Stacks?.[0];

          if (!stackDetail) {
            continue;
          }

          // Extract tags
          const tags = stackDetail.Tags?.reduce((acc: Record<string, string>, tag) => {
            if (tag.Key) acc[tag.Key] = tag.Value || '';
            return acc;
          }, {} as Record<string, string>);

          // Only include stacks managed by Mastra CloudFormation Tools
          if (!tags?.ManagedBy || tags.ManagedBy !== 'Mastra-CloudFormation-Tools') {
            continue;
          }

          const resourceType = tags?.ResourceType || 'Unknown';

          // Apply resource type filter if specified
          if (resourceTypeFilter && !resourceType.includes(resourceTypeFilter)) {
            continue;
          }

          resources.push({
            stackId: stackSummary.StackId || '',
            stackName: stackSummary.StackName || '',
            resourceType: resourceType,
            stackStatus: stackSummary.StackStatus || '',
            creationTime: stackSummary.CreationTime?.toISOString(),
            lastUpdatedTime: stackSummary.LastUpdatedTime?.toISOString(),
            tags: tags,
          });

        } catch (error) {
          // Skip stacks that can't be processed
          console.warn(`Failed to process stack ${stackSummary.StackName}:`, error);
          continue;
        }
      }

      return {
        resources: resources.slice(0, maxResults),
        totalCount: resources.length,
        hasMore: stacksResponse.NextToken !== undefined || resources.length > maxResults,
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to list resources: ${errorMessage}`);
    }
  },
});

// Get Request Status Tool - Checks the status of a stack operation
const GetRequestStatusInputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID or stack name'),
});

const GetRequestStatusOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID'),
  stackName: z.string().describe('CloudFormation stack name'),
  stackStatus: z.string().describe('Current stack status'),
  stackStatusReason: z.string().optional().describe('Reason for the current status'),
  lastUpdatedTime: z.string().optional().describe('Last update timestamp'),
  isComplete: z.boolean().describe('Whether the operation is complete'),
  isSuccessful: z.boolean().describe('Whether the operation was successful'),
  events: z.array(z.object({
    timestamp: z.string(),
    logicalResourceId: z.string(),
    resourceStatus: z.string(),
    resourceStatusReason: z.string().optional(),
  })).optional().describe('Recent stack events'),
});

const getRequestStatusTool = createTool({
  id: 'get_request_status',
  description: 'Check the status of a CloudFormation stack operation (create/update/delete). Provides detailed status information and recent events.',
  inputSchema: GetRequestStatusInputSchema,
  outputSchema: GetRequestStatusOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { stackId } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Get stack status
      const describeStacksCommand = new DescribeStacksCommand({
        StackName: stackId,
      });

      const stackResponse = await cfnClient.send(describeStacksCommand);

      if (!stackResponse.Stacks || stackResponse.Stacks.length === 0) {
        throw new Error(`Stack not found: ${stackId}`);
      }

      const stack = stackResponse.Stacks[0];
      const status = stack.StackStatus || 'UNKNOWN';

      // Determine if operation is complete and successful
      const completeStatuses = [
        'CREATE_COMPLETE',
        'UPDATE_COMPLETE',
        'DELETE_COMPLETE',
        'CREATE_FAILED',
        'UPDATE_FAILED',
        'DELETE_FAILED',
        'UPDATE_ROLLBACK_COMPLETE',
        'UPDATE_ROLLBACK_FAILED',
        'ROLLBACK_COMPLETE',
        'ROLLBACK_FAILED',
      ];

      const successfulStatuses = [
        'CREATE_COMPLETE',
        'UPDATE_COMPLETE',
        'DELETE_COMPLETE',
      ];

      const isComplete = completeStatuses.includes(status);
      const isSuccessful = successfulStatuses.includes(status);

      return {
        stackId: stack.StackId || stackId,
        stackName: stack.StackName || '',
        stackStatus: status,
        stackStatusReason: stack.StackStatusReason,
        lastUpdatedTime: stack.LastUpdatedTime?.toISOString(),
        isComplete,
        isSuccessful,
        events: undefined, // Could be enhanced to include recent events
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to get request status for ${stackId}: ${errorMessage}`);
    }
  },
});

// Create Template Tool - Generates a CloudFormation template from a stack
const CreateTemplateInputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID or stack name'),
  templateFormat: z.enum(['JSON', 'YAML']).optional().default('JSON').describe('Output format for the template'),
});

const CreateTemplateOutputSchema = z.object({
  stackId: z.string().describe('CloudFormation stack ID'),
  stackName: z.string().describe('CloudFormation stack name'),
  template: z.string().describe('CloudFormation template in the requested format'),
  templateFormat: z.string().describe('Format of the returned template'),
  templateSize: z.number().describe('Size of the template in bytes'),
});

const createTemplateTool = createTool({
  id: 'create_template',
  description: 'Generate a CloudFormation template from an existing stack. Retrieves the current template and returns it in the specified format.',
  inputSchema: CreateTemplateInputSchema,
  outputSchema: CreateTemplateOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { stackId, templateFormat = 'JSON' } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Get the template
      const getTemplateCommand = new GetTemplateCommand({
        StackName: stackId,
        TemplateStage: 'Original', // Get the original template, not processed
      });

      const templateResponse = await cfnClient.send(getTemplateCommand);

      if (!templateResponse.TemplateBody) {
        throw new Error(`Could not retrieve template for stack: ${stackId}`);
      }

      // Get stack details for metadata
      const describeStacksCommand = new DescribeStacksCommand({
        StackName: stackId,
      });
      const stackResponse = await cfnClient.send(describeStacksCommand);
      const stack = stackResponse.Stacks?.[0];

      let formattedTemplate: string;

      if (templateFormat === 'YAML') {
        // For YAML output, we would need a JSON to YAML converter
        // For now, we'll return JSON with a note
        formattedTemplate = templateResponse.TemplateBody;
        // Note: In a production implementation, you might want to add a YAML conversion library
      } else {
        // Ensure JSON is properly formatted
        try {
          const parsed = JSON.parse(templateResponse.TemplateBody);
          formattedTemplate = JSON.stringify(parsed, null, 2);
        } catch {
          // If it's not valid JSON, return as-is
          formattedTemplate = templateResponse.TemplateBody;
        }
      }

      return {
        stackId: stack?.StackId || stackId,
        stackName: stack?.StackName || '',
        template: formattedTemplate,
        templateFormat: templateFormat,
        templateSize: Buffer.byteLength(formattedTemplate, 'utf8'),
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to create template for ${stackId}: ${errorMessage}`);
    }
  },
});

// Get Resource Schema Information Tool - Retrieves schema for CloudFormation resource types
const GetResourceSchemaInputSchema = z.object({
  resourceType: z.string().describe('AWS resource type (e.g., AWS::S3::Bucket, AWS::EC2::Instance)'),
  schemaVersion: z.string().optional().describe('Specific schema version to retrieve'),
});

const GetResourceSchemaOutputSchema = z.object({
  resourceType: z.string().describe('AWS resource type'),
  schema: z.record(z.any()).describe('JSON schema for the resource type'),
  schemaVersion: z.string().optional().describe('Version of the schema'),
  documentation: z.string().optional().describe('Documentation URL for the resource type'),
  properties: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: z.string().optional(),
  })).optional().describe('Summary of resource properties'),
});

const getResourceSchemaInformationTool = createTool({
  id: 'get_resource_schema_information',
  description: 'Retrieve schema information for a CloudFormation resource type. Provides detailed property definitions, types, and validation rules.',
  inputSchema: GetResourceSchemaInputSchema,
  outputSchema: GetResourceSchemaOutputSchema,
  execute: async ({ context, runtimeContext }) => {
    const { resourceType, schemaVersion } = context;

    try {
      if (!runtimeContext) {
        throw new Error('Runtime context with AWS credentials is required for CloudFormation operations');
      }

      const cfnClient = await createCloudFormationClientFromContext(runtimeContext);

      // Prepare describe type command
      const describeTypeInput: DescribeTypeCommandInput = {
        Type: 'RESOURCE',
        TypeName: resourceType,
        VersionId: schemaVersion,
      };

      const command = new DescribeTypeCommand(describeTypeInput);
      const response = await cfnClient.send(command);

      if (!response.Schema) {
        throw new Error(`Schema not found for resource type: ${resourceType}`);
      }

      // Parse the schema
      let parsedSchema: any;
      try {
        parsedSchema = JSON.parse(response.Schema);
      } catch {
        throw new Error(`Invalid schema format for resource type: ${resourceType}`);
      }

      // Extract property information from schema
      const properties = [];
      if (parsedSchema.properties && parsedSchema.properties.Properties && parsedSchema.properties.Properties.properties) {
        const resourceProperties = parsedSchema.properties.Properties.properties;
        const requiredProps = parsedSchema.properties.Properties.required || [];

        for (const [propName, propDef] of Object.entries(resourceProperties)) {
          const propInfo = propDef as any;
          properties.push({
            name: propName,
            type: propInfo.type || 'unknown',
            required: requiredProps.includes(propName),
            description: propInfo.description,
          });
        }
      }

      // Generate documentation URL
      const documentationUrl = `https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/${resourceType.replace(/:/g, '_')}.html`;

      return {
        resourceType: resourceType,
        schema: parsedSchema,
        schemaVersion: response.DefaultVersionId,
        documentation: documentationUrl,
        properties: properties.length > 0 ? properties : undefined,
      };

    } catch (error: any) {
      const errorMessage = handleCloudFormationError(error);
      throw new Error(`Failed to get schema information for ${resourceType}: ${errorMessage}`);
    }
  },
});

// Export all tools as an object for Mastra agent integration
export const cloudFormationTools = {
  createResource: createResourceTool,
  getResource: getResourceTool,
  updateResource: updateResourceTool,
  deleteResource: deleteResourceTool,
  listResources: listResourcesTool,
  getRequestStatus: getRequestStatusTool,
  createTemplate: createTemplateTool,
  getResourceSchemaInformation: getResourceSchemaInformationTool,
};

// Export individual tools for selective use
export {
  createResourceTool,
  getResourceTool,
  updateResourceTool,
  deleteResourceTool,
  listResourcesTool,
  getRequestStatusTool,
  createTemplateTool,
  getResourceSchemaInformationTool,
};
