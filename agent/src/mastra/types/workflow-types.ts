import { z } from 'zod';

// Common types for workflow operations
export type WorkflowStatus = 'success' | 'failed' | 'in-progress' | 'partial' | 'validation-only';
export type ErrorSeverity = 'warning' | 'error' | 'critical';
export type Priority = 'low' | 'medium' | 'high';
export type Complexity = 'low' | 'medium' | 'high';

// Base error interface
export interface WorkflowError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  stage?: string;
  agentName?: string;
  operation?: string;
}

// Base workflow result interface
export interface BaseWorkflowResult {
  status: WorkflowStatus;
  errors?: WorkflowError[];
  recommendations?: string[];
  executionTime: number;
}

// Documentation Access Workflow Types
export interface DocumentationQuery {
  query: string;
  context?: string;
  awsServices?: string[];
  priority: Priority;
  includeExamples: boolean;
  maxResults: number;
}

export interface PlanningResult {
  analysisComplete: boolean;
  recommendedApproach: string;
  identifiedServices: string[];
  searchStrategy: string;
  estimatedComplexity: Complexity;
}

export interface DocumentationSection {
  service: string;
  section: string;
  relevance: number;
  summary: string;
}

export interface CodeExample {
  service: string;
  example: string;
  description: string;
}

export interface DocumentationResult {
  documentsFound: number;
  relevantSections: DocumentationSection[];
  codeExamples?: CodeExample[];
  bestPractices?: string[];
}

export interface DocumentationAccessResult extends BaseWorkflowResult {
  planningResult: PlanningResult;
  documentationResult: DocumentationResult;
}

// CloudFormation Operations Workflow Types
export type CloudFormationOperation = 
  | 'create-stack'
  | 'update-stack'
  | 'delete-stack'
  | 'describe-stack'
  | 'list-stacks'
  | 'validate-template'
  | 'get-template'
  | 'create-change-set'
  | 'execute-change-set'
  | 'describe-stack-events'
  | 'describe-stack-resources';

export type CloudFormationCapability = 
  | 'CAPABILITY_IAM'
  | 'CAPABILITY_NAMED_IAM'
  | 'CAPABILITY_AUTO_EXPAND';

export interface StackParameter {
  key: string;
  value: string;
}

export interface StackTag {
  key: string;
  value: string;
}

export interface RollbackTrigger {
  arn: string;
  type: string;
}

export interface RollbackConfiguration {
  rollbackTriggers?: RollbackTrigger[];
  monitoringTimeInMinutes?: number;
}

export interface CloudFormationRequest {
  operation: CloudFormationOperation;
  stackName?: string;
  templateBody?: string;
  templateUrl?: string;
  parameters?: StackParameter[];
  capabilities?: CloudFormationCapability[];
  tags?: Record<string, string>;
  region?: string;
  rollbackConfiguration?: RollbackConfiguration;
  notificationArns?: string[];
  timeoutInMinutes?: number;
  enableTerminationProtection?: boolean;
  dryRun: boolean;
}

export interface StackDetails {
  stackName?: string;
  stackId?: string;
  stackStatus?: string;
  creationTime?: string;
  lastUpdatedTime?: string;
  description?: string;
  capabilities?: string[];
  tags?: StackTag[];
}

export interface StackResource {
  logicalResourceId: string;
  physicalResourceId?: string;
  resourceType: string;
  resourceStatus: string;
  timestamp?: string;
}

export interface StackEvent {
  eventId: string;
  stackName: string;
  logicalResourceId?: string;
  physicalResourceId?: string;
  resourceType?: string;
  timestamp: string;
  resourceStatus?: string;
  resourceStatusReason?: string;
}

export interface StackOutput {
  outputKey: string;
  outputValue: string;
  description?: string;
}

export interface ChangeSetChange {
  action: string;
  logicalResourceId: string;
  resourceType: string;
  replacement?: string;
}

export interface ChangeSet {
  changeSetName?: string;
  changeSetId?: string;
  changes?: ChangeSetChange[];
}

export interface ValidationResult {
  isValid: boolean;
  validationErrors?: string[];
  warnings?: string[];
}

export interface CloudFormationOperationResult {
  stackDetails?: StackDetails;
  resources?: StackResource[];
  events?: StackEvent[];
  outputs?: StackOutput[];
  changeSet?: ChangeSet;
  validationResult?: ValidationResult;
}

export interface CloudFormationResult extends BaseWorkflowResult {
  operation: string;
  stackName?: string;
  stackId?: string;
  stackStatus?: string;
  operationResult: CloudFormationOperationResult;
}

// Agent Interaction Patterns
export interface AgentInteractionConfig {
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
  enableLogging: boolean;
}

export interface AgentExecutionContext {
  agentName: string;
  operation: string;
  startTime: number;
  config: AgentInteractionConfig;
}

export interface AgentExecutionResult<T = any> {
  success: boolean;
  result?: T;
  error?: WorkflowError;
  executionTime: number;
  retryCount: number;
}

// Workflow Configuration Types
export interface WorkflowConfig {
  enableRetries: boolean;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface WorkflowMetrics {
  totalExecutionTime: number;
  stepExecutionTimes: Record<string, number>;
  retryCount: number;
  errorCount: number;
  successRate: number;
}

export interface WorkflowContext {
  workflowId: string;
  runId: string;
  config: WorkflowConfig;
  metrics: WorkflowMetrics;
  startTime: number;
}

// Utility types for workflow step chaining
export type StepInput<T> = T;
export type StepOutput<T> = Promise<T>;

export interface StepExecutionInfo {
  stepId: string;
  stepName: string;
  startTime: number;
  endTime?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: WorkflowError;
}

export interface WorkflowExecutionInfo {
  workflowId: string;
  runId: string;
  status: WorkflowStatus;
  startTime: number;
  endTime?: number;
  steps: StepExecutionInfo[];
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
}

// Export schemas for runtime validation
export const documentationQuerySchema = z.object({
  query: z.string(),
  context: z.string().optional(),
  awsServices: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']),
  includeExamples: z.boolean(),
  maxResults: z.number().min(1).max(50),
});

export const cloudFormationRequestSchema = z.object({
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
  ]),
  stackName: z.string().optional(),
  templateBody: z.string().optional(),
  templateUrl: z.string().optional(),
  parameters: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).optional(),
  capabilities: z.array(z.enum([
    'CAPABILITY_IAM',
    'CAPABILITY_NAMED_IAM',
    'CAPABILITY_AUTO_EXPAND'
  ])).optional(),
  tags: z.record(z.string()).optional(),
  region: z.string().optional(),
  rollbackConfiguration: z.object({
    rollbackTriggers: z.array(z.object({
      arn: z.string(),
      type: z.string(),
    })).optional(),
    monitoringTimeInMinutes: z.number().optional(),
  }).optional(),
  notificationArns: z.array(z.string()).optional(),
  timeoutInMinutes: z.number().optional(),
  enableTerminationProtection: z.boolean().optional(),
  dryRun: z.boolean().default(false),
});

export const workflowConfigSchema = z.object({
  enableRetries: z.boolean().default(true),
  maxRetries: z.number().min(0).max(10).default(3),
  retryDelay: z.number().min(100).max(30000).default(1000),
  timeout: z.number().min(1000).max(300000).default(30000),
  enableLogging: z.boolean().default(true),
  enableMetrics: z.boolean().default(true),
});

// Type guards for runtime type checking
export const isDocumentationQuery = (obj: any): obj is DocumentationQuery => {
  return documentationQuerySchema.safeParse(obj).success;
};

export const isCloudFormationRequest = (obj: any): obj is CloudFormationRequest => {
  return cloudFormationRequestSchema.safeParse(obj).success;
};

export const isWorkflowConfig = (obj: any): obj is WorkflowConfig => {
  return workflowConfigSchema.safeParse(obj).success;
};
