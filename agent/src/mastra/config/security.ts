import { z } from 'zod';

// Security config schema
export const securityConfigSchema = z.object({
  tenantId: z.string().min(1).describe('Tenant ID'),
  environment: z.enum(['development', 'staging', 'production']).describe('Environment'),
  region: z.string().default('us-east-1').describe('AWS region'),
  resourceTagPrefix: z.string().default('zapgap').describe('Tag prefix'),
  maxResourcesPerTenant: z.number().default(100).describe('Max resources'),
  allowedResourceTypes: z.array(z.string()).optional().describe('Allowed types'),
  requiredTags: z.array(z.string()).default(['tenant', 'environment', 'created-by']).describe('Required tags'),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

// Default config
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

// Generate resource tags
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

// Validate resource type
export const validateResourceType = (resourceType: string, config: SecurityConfig): boolean => {
  if (!config.allowedResourceTypes || config.allowedResourceTypes.length === 0) {
    return true; // No restrictions
  }
  return config.allowedResourceTypes.includes(resourceType);
};

// Generate resource name with tenant prefix
export const generateResourceName = (baseName: string, config: SecurityConfig): string => {
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `${config.resourceTagPrefix}-${config.tenantId}-${sanitizedBaseName}`;
};

// Validate resource limits
export const validateResourceLimits = async (resourceType: string, config: SecurityConfig): Promise<{ allowed: boolean; reason?: string }> => {
  if (!validateResourceType(resourceType, config)) {
    return {
      allowed: false,
      reason: `Resource type ${resourceType} is not allowed for this tenant`,
    };
  }
  return { allowed: true };
};

// Validate resource operation
export const validateResourceOperation = (
  operation: 'create' | 'read' | 'update' | 'delete',
  resourceType: string,
  config: SecurityConfig
): { allowed: boolean; reason?: string } => {
  if (!validateResourceType(resourceType, config)) {
    return {
      allowed: false,
      reason: `Resource type ${resourceType} is not allowed for this tenant`,
    };
  }
  return { allowed: true };
};

// IAM policy recommendations
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

// Audit logging
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

// Cost allocation tags
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
