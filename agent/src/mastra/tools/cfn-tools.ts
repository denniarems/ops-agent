import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateResourceTags, getSecurityConfig } from '../config/security';

// Common schemas for CloudFormation operations
const resourceIdentifierSchema = z.object({
  resourceType: z.string().describe('AWS resource type (e.g., AWS::S3::Bucket)'),
  identifier: z.string().describe('Resource identifier or ARN'),
});

const resourcePropertiesSchema = z.object({
  resourceType: z.string().describe('AWS resource type (e.g., AWS::S3::Bucket)'),
  properties: z.record(z.any()).describe('Resource properties as key-value pairs'),
  region: z.string().optional().describe('AWS region (defaults to configured region)'),
  tags: z.record(z.string()).optional().describe('Resource tags for organization and billing'),
});

const stackOperationSchema = z.object({
  stackName: z.string().describe('CloudFormation stack name'),
  region: z.string().optional().describe('AWS region (defaults to configured region)'),
});

// CloudFormation Resource Management Helper Tool
export const cfnResourceHelperTool = createTool({
  id: 'cfn-resource-helper',
  description: 'Helper tool for CloudFormation resource management with multi-tenant security and tagging',
  inputSchema: z.object({
    operation: z.enum(['create', 'get', 'update', 'delete', 'list', 'schema', 'status', 'template']).describe('Operation type'),
    resourceType: z.string().describe('AWS resource type (e.g., AWS::S3::Bucket)'),
    identifier: z.string().optional().describe('Resource identifier or ARN'),
    properties: z.record(z.any()).optional().describe('Resource properties'),
    region: z.string().optional().describe('AWS region'),
    tags: z.record(z.string()).optional().describe('Additional resource tags'),
    confirmDeletion: z.boolean().default(false).describe('Confirmation for delete operations'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    operation: z.string(),
    resourceType: z.string(),
    message: z.string(),
    tags: z.record(z.string()).optional(),
    recommendations: z.array(z.string()).optional(),
  }),
  execute: async ({ context }) => {
    try {
      const securityConfig = getSecurityConfig();

      // Generate multi-tenant tags
      const resourceTags = generateResourceTags(securityConfig, context.tags);

      // Security validations
      if (context.operation === 'delete' && !context.confirmDeletion) {
        return {
          success: false,
          operation: context.operation,
          resourceType: context.resourceType,
          message: 'Delete operation requires explicit confirmation (confirmDeletion: true) for safety',
          recommendations: [
            'Set confirmDeletion to true if you want to proceed with deletion',
            'Consider backing up any important data before deletion',
            'Review resource dependencies before deletion',
          ],
        };
      }

      // Operation-specific recommendations
      const recommendations = [];

      switch (context.operation) {
        case 'create':
          recommendations.push(
            'Ensure resource properties comply with AWS service limits',
            'Review security group and IAM configurations',
            'Consider cost implications of the resource',
            'Verify the resource is created in the correct region'
          );
          break;
        case 'delete':
          recommendations.push(
            'Backup any important data before deletion',
            'Check for dependent resources that might be affected',
            'Review billing implications of resource deletion',
            'Consider using resource lifecycle policies instead'
          );
          break;
        case 'update':
          recommendations.push(
            'Test configuration changes in development first',
            'Review the impact on dependent resources',
            'Consider maintenance windows for critical updates',
            'Backup current configuration before changes'
          );
          break;
        default:
          recommendations.push(
            'Use appropriate AWS CLI or SDK commands for complex operations',
            'Monitor CloudTrail logs for audit purposes',
            'Follow AWS Well-Architected Framework principles'
          );
      }

      return {
        success: true,
        operation: context.operation,
        resourceType: context.resourceType,
        message: `CloudFormation ${context.operation} operation prepared for ${context.resourceType} with multi-tenant security`,
        tags: resourceTags,
        recommendations,
      };
    } catch (error) {
      return {
        success: false,
        operation: context.operation || 'unknown',
        resourceType: context.resourceType || 'unknown',
        message: `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

// Export the CloudFormation tools
export const cfnTools = [
  cfnResourceHelperTool,
];
