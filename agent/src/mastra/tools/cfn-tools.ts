import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateResourceTags, getSecurityConfig } from '../config/security';

// Common schemas
const resourceIdentifierSchema = z.object({
  resourceType: z.string().describe('AWS resource type'),
  identifier: z.string().describe('Resource identifier'),
});

const resourcePropertiesSchema = z.object({
  resourceType: z.string().describe('AWS resource type'),
  properties: z.record(z.any()).describe('Resource properties'),
  region: z.string().optional().describe('AWS region'),
  tags: z.record(z.string()).optional().describe('Resource tags'),
});

const stackOperationSchema = z.object({
  stackName: z.string().describe('Stack name'),
  region: z.string().optional().describe('AWS region'),
});

// CloudFormation Resource Helper
export const cfnResourceHelperTool = createTool({
  id: 'cfn-resource-helper',
  description: 'CloudFormation resource management with multi-tenant security',
  inputSchema: z.object({
    operation: z.enum(['create', 'get', 'update', 'delete', 'list', 'schema', 'status', 'template']).describe('Operation'),
    resourceType: z.string().describe('AWS resource type'),
    identifier: z.string().optional().describe('Resource identifier'),
    properties: z.record(z.any()).optional().describe('Properties'),
    region: z.string().optional().describe('Region'),
    tags: z.record(z.string()).optional().describe('Tags'),
    confirmDeletion: z.boolean().default(false).describe('Delete confirmation'),
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

      const resourceTags = generateResourceTags(securityConfig, context.tags);

      if (context.operation === 'delete' && !context.confirmDeletion) {
        return {
          success: false,
          operation: context.operation,
          resourceType: context.resourceType,
          message: 'Delete requires confirmDeletion: true',
          recommendations: ['Set confirmDeletion to true', 'Backup data', 'Review dependencies'],
        };
      }

      const recommendations = [];
      switch (context.operation) {
        case 'create':
          recommendations.push('Check service limits', 'Review security', 'Consider costs');
          break;
        case 'delete':
          recommendations.push('Backup data', 'Check dependencies', 'Review billing impact');
          break;
        case 'update':
          recommendations.push('Test in dev first', 'Review impact', 'Consider maintenance windows');
          break;
        default:
          recommendations.push('Use AWS CLI/SDK', 'Monitor CloudTrail', 'Follow Well-Architected');
      }

      return {
        success: true,
        operation: context.operation,
        resourceType: context.resourceType,
        message: `CloudFormation ${context.operation} prepared for ${context.resourceType}`,
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

// Export tools
export const cfnTools = [cfnResourceHelperTool];
