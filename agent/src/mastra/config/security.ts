import { z } from 'zod';

// Security configuration schema
export const securityConfigSchema = z.object({
  tenantId: z.string().min(1).describe('Unique tenant identifier'),
  environment: z.enum(['development', 'staging', 'production']).describe('Deployment environment'),
  region: z.string().default('us-east-1').describe('AWS region'),
  resourceTagPrefix: z.string().default('zapgap').describe('Prefix for resource tags'),
  maxResourcesPerTenant: z.number().default(100).describe('Maximum resources per tenant'),
  allowedResourceTypes: z.array(z.string()).optional().describe('Allowed AWS resource types'),
  requiredTags: z.array(z.string()).default(['tenant', 'environment', 'created-by']).describe('Required resource tags'),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

// Default security configuration
export const getSecurityConfig = (): SecurityConfig => {
  return {
    tenantId: process.env.TENANT_ID || 'default',
    environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
    region: process.env.AWS_REGION || 'us-east-1',
    resourceTagPrefix: process.env.RESOURCE_TAG_PREFIX || 'zapgap',
    maxResourcesPerTenant: parseInt(process.env.MAX_RESOURCES_PER_TENANT || '100'),
    allowedResourceTypes: process.env.ALLOWED_RESOURCE_TYPES?.split(','),
    requiredTags: ['tenant', 'environment', 'created-by', 'created-at'],
  };
};

// Generate standard resource tags for multi-tenancy
export const generateResourceTags = (config: SecurityConfig, additionalTags: Record<string, string> = {}): Record<string, string> => {
  const timestamp = new Date().toISOString();
  
  return {
    [`${config.resourceTagPrefix}:tenant`]: config.tenantId,
    [`${config.resourceTagPrefix}:environment`]: config.environment,
    [`${config.resourceTagPrefix}:created-by`]: 'zapgap-agent',
    [`${config.resourceTagPrefix}:created-at`]: timestamp,
    [`${config.resourceTagPrefix}:region`]: config.region,
    ...additionalTags,
  };
};

// Validate resource type against allowed types
export const validateResourceType = (resourceType: string, config: SecurityConfig): boolean => {
  if (!config.allowedResourceTypes || config.allowedResourceTypes.length === 0) {
    return true; // No restrictions
  }
  
  return config.allowedResourceTypes.includes(resourceType);
};

// Generate unique resource name with tenant prefix
export const generateResourceName = (baseName: string, config: SecurityConfig): string => {
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `${config.resourceTagPrefix}-${config.tenantId}-${sanitizedBaseName}`;
};

// Validate resource limits for tenant
export const validateResourceLimits = async (resourceType: string, config: SecurityConfig): Promise<{ allowed: boolean; reason?: string }> => {
  // This would typically check against a database or external service
  // For now, implementing basic validation
  
  if (!validateResourceType(resourceType, config)) {
    return {
      allowed: false,
      reason: `Resource type ${resourceType} is not allowed for this tenant`,
    };
  }
  
  // Additional limit checks could be implemented here
  // e.g., checking current resource count against maxResourcesPerTenant
  
  return { allowed: true };
};

// Security validation for resource operations
export const validateResourceOperation = (
  operation: 'create' | 'read' | 'update' | 'delete',
  resourceType: string,
  config: SecurityConfig
): { allowed: boolean; reason?: string } => {
  // Check if resource type is allowed
  if (!validateResourceType(resourceType, config)) {
    return {
      allowed: false,
      reason: `Resource type ${resourceType} is not allowed for this tenant`,
    };
  }
  
  // Environment-specific restrictions
  if (config.environment === 'production' && operation === 'delete') {
    // In production, require additional confirmation for deletions
    // This would be handled by the calling code
  }
  
  // Additional security checks can be added here
  return { allowed: true };
};

// IAM policy recommendations for CloudFormation operations
export const getRecommendedIAMPolicy = (config: SecurityConfig) => {
  return {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'cloudcontrol:ListResources',
          'cloudcontrol:GetResource',
          'cloudcontrol:CreateResource',
          'cloudcontrol:UpdateResource',
          'cloudcontrol:DeleteResource',
          'cloudformation:CreateGeneratedTemplate',
          'cloudformation:DescribeGeneratedTemplate',
          'cloudformation:GetGeneratedTemplate',
        ],
        Resource: '*',
        Condition: {
          StringEquals: {
            'aws:RequestedRegion': config.region,
          },
          StringLike: {
            'aws:ResourceTag/zapgap:tenant': config.tenantId,
          },
        },
      },
      {
        Effect: 'Allow',
        Action: [
          'tag:GetResources',
          'tag:TagResources',
          'tag:UntagResources',
        ],
        Resource: '*',
        Condition: {
          StringEquals: {
            'aws:RequestedRegion': config.region,
          },
        },
      },
    ],
  };
};

// Audit logging configuration
export interface AuditLogEntry {
  timestamp: string;
  tenantId: string;
  operation: string;
  resourceType: string;
  resourceIdentifier?: string;
  status: 'success' | 'failure' | 'pending';
  error?: string;
  userId?: string;
  sessionId?: string;
}

export const createAuditLogEntry = (
  operation: string,
  resourceType: string,
  status: 'success' | 'failure' | 'pending',
  config: SecurityConfig,
  additionalData: Partial<AuditLogEntry> = {}
): AuditLogEntry => {
  return {
    timestamp: new Date().toISOString(),
    tenantId: config.tenantId,
    operation,
    resourceType,
    status,
    ...additionalData,
  };
};

// Cost management helpers
export const getCostAllocationTags = (config: SecurityConfig): Record<string, string> => {
  return {
    [`${config.resourceTagPrefix}:cost-center`]: config.tenantId,
    [`${config.resourceTagPrefix}:environment`]: config.environment,
    [`${config.resourceTagPrefix}:service`]: 'zapgap-infrastructure',
  };
};

// Resource naming conventions
export const getResourceNamingConvention = (config: SecurityConfig) => {
  return {
    prefix: `${config.resourceTagPrefix}-${config.tenantId}`,
    pattern: `${config.resourceTagPrefix}-${config.tenantId}-{resource-type}-{unique-id}`,
    examples: {
      s3Bucket: `${config.resourceTagPrefix}-${config.tenantId}-bucket-data-lake`,
      ec2Instance: `${config.resourceTagPrefix}-${config.tenantId}-instance-web-server`,
      rdsInstance: `${config.resourceTagPrefix}-${config.tenantId}-db-primary`,
    },
  };
};

export default {
  getSecurityConfig,
  generateResourceTags,
  validateResourceType,
  generateResourceName,
  validateResourceLimits,
  validateResourceOperation,
  getRecommendedIAMPolicy,
  createAuditLogEntry,
  getCostAllocationTags,
  getResourceNamingConvention,
};
