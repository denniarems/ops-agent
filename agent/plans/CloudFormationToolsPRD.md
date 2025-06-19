Product Requirements Document (PRD) for CloudFormation-Based Tools Replacing AWS Labs MCP Server
1. Introduction
This PRD defines the requirements for a TypeScript-based system that implements tools equivalent to those provided by the AWS Labs MCP Server (as described in https://awslabs.github.io/mcp/servers/cfn-mcp-server/#tools), using the @aws-sdk/client-cloudformation package. The goal is to replace the MCP Server’s AWS Cloud Control API-based resource management with CloudFormation’s stack-based approach, leveraging temporary credentials from @aws-sdk/client-sts for secure authentication. The system will support tools like create_resource, get_resource, update_resource, delete_resource, list_resources, get_resource_schema_information, get_request_status, and create_template, ensuring alignment with Infrastructure as Code (IaC) best practices.
2. Product Overview
The system is a programmatic solution that:

Replicates the MCP Server’s resource management tools using CloudFormation stacks, where each resource is managed in a dedicated stack.
Uses @aws-sdk/client-cloudformation to perform stack operations (create, update, describe, delete).
Authenticates via AWS STS temporary credentials, supporting secure role assumption.
Generates CloudFormation templates dynamically for resource creation and management.
Provides a TypeScript API for developers to manage AWS resources programmatically.

This approach trades the directness of Cloud Control API for CloudFormation’s versioning and rollback capabilities, introducing stack management overhead but ensuring robust IaC workflows.
3. Functional Requirements
3.1. create_resource

Purpose: Create an AWS resource by generating a CloudFormation template and creating a stack.
Inputs:
Resource type (e.g., AWS::S3::Bucket, AWS::EC2::Instance).
Resource properties (e.g., { BucketName: "my-bucket-123" } for S3).
Optional: Region, stack name (auto-generated if not provided).


Process:
Generate a unique stack name (e.g., resource-<uuid>).
Create a template with the specified resource type and properties.
Use CreateStackCommand to create the stack.


Outputs: Stack ID (as resource identifier).
Behavior:
Handle asynchronous stack creation with status tracking.
Support capabilities like CAPABILITY_IAM for resources requiring IAM permissions.


Example: Create an S3 bucket with versioning enabled.

3.2. get_resource

Purpose: Retrieve details of a specific resource by describing its stack.
Inputs: Stack ID (from create_resource).
Process: Use DescribeStackResourceCommand to get resource details (e.g., physical ID, status).
Outputs: Resource details (e.g., StackResourceDetail object).
Behavior: Handle cases where the stack or resource does not exist.
Example: Get details of an S3 bucket’s stack.

3.3. update_resource

Purpose: Update a resource by modifying its stack template.
Inputs:
Stack ID.
Updated resource properties.


Process:
Retrieve current template using GetTemplateCommand.
Update resource properties in the template.
Apply changes using UpdateStackCommand.


Outputs: Confirmation of update initiation.
Behavior: Handle asynchronous updates and validate new properties.
Example: Update an S3 bucket’s versioning status.

3.4. delete_resource

Purpose: Delete a resource by deleting its stack.
Inputs: Stack ID.
Process: Use DeleteStackCommand to delete the stack.
Outputs: Confirmation of deletion initiation.
Behavior: Ensure no unintended resource deletions.
Example: Delete an S3 bucket’s stack.

3.5. list_resources

Purpose: List all resources by enumerating stacks and extracting resource types.
Inputs: Optional filter by resource type.
Process:
Use ListStacksCommand to get all stacks.
For each stack, retrieve template via DescribeStacksCommand and extract resource type.


Outputs: Array of { stackId, resourceType } objects.
Behavior: Optimize for performance with many stacks.
Example: List all S3 buckets.

3.6. get_resource_schema_information

Purpose: Retrieve schema for a CloudFormation resource type.
Inputs: Resource type (e.g., AWS::S3::Bucket).
Process: Use DescribeTypeCommand to get schema details.
Outputs: Schema object (JSON).
Behavior: Validate resource type support.
Example: Get schema for AWS::Lambda::Function.

3.7. get_request_status

Purpose: Check the status of a stack operation (create/update/delete).
Inputs: Stack ID.
Process: Use DescribeStacksCommand to get stack status.
Outputs: Stack status (e.g., CREATE_COMPLETE, UPDATE_IN_PROGRESS).
Behavior: Handle non-existent stacks.
Example: Check status of an S3 bucket creation.

3.8. create_template

Purpose: Generate a CloudFormation template for a resource’s stack.
Inputs: Stack ID.
Process: Use GetTemplateCommand to retrieve the stack’s template.
Outputs: Template (JSON/YAML string).
Behavior: Ensure template is valid for reuse.
Example: Get template for an EC2 instance’s stack.

3.9. Security and Authentication

Authentication: Use STS temporary credentials via @aws-sdk/client-sts for all operations.
Permissions: Require IAM permissions for CloudFormation (cloudformation:CreateStack, cloudformation:DescribeStacks, etc.) and resource-specific actions.
Best Practices: Avoid hardcoding credentials; use environment variables or AWS CLI profiles.

3.10. Error Handling

Scenarios: Handle errors for:
Invalid templates or resource properties.
Insufficient IAM permissions.
AWS service limits (e.g., stack quotas).


Feedback: Provide detailed error messages with resolution steps.

4. Non-Functional Requirements
4.1. Performance

Efficiency: Minimize API calls for operations like list_resources.
Monitoring: Track operation times to identify bottlenecks, respecting AWS throttling limits.

4.2. Scalability

Concurrency: Support multiple simultaneous operations within AWS stack limits (500 per region, adjustable).
Optimization: Cache stack lists for list_resources to reduce API overhead.

4.3. Usability

API Design: Provide a clear TypeScript API with typed inputs/outputs.
Documentation: Include examples for each tool (e.g., creating an S3 bucket, updating an RDS instance).

4.4. Maintainability

Modularity: Structure code to support adding new resource types.
Standards: Follow TypeScript and AWS SDK best practices.

5. Use Cases
5.1. Create an S3 Bucket

Input: { Type: "AWS::S3::Bucket", Properties: { BucketName: "my-bucket-123", VersioningConfiguration: { Status: "Enabled" } } }
Behavior: Generate template, create stack, return stack ID.
Outcome: S3 bucket provisioned.

5.2. List All EC2 Instances

Input: Filter for AWS::EC2::Instance.
Behavior: List stacks, filter by resource type, return stack IDs and types.
Outcome: List of EC2 instance stacks.

5.3. Update RDS Instance Storage

Input: Stack ID, new properties { AllocatedStorage: 500 }.
Behavior: Update stack template, apply changes.
Outcome: RDS instance storage updated.

6. Acceptance Criteria

All tools (create_resource, etc.) function as specified, mapping to CloudFormation operations.
Resources are managed in dedicated stacks, with correct lifecycle handling.
Secure authentication via STS credentials is implemented.
Errors are handled with clear feedback.
Performance stays within AWS service limits.

7. Dependencies

AWS SDK for JavaScript v3:
@aws-sdk/client-cloudformation for stack operations.
@aws-sdk/client-sts for credentials.


Environment: Node.js, TypeScript, UUID library (e.g., uuid for stack names).
AWS Account: IAM permissions for CloudFormation and resources.

8. Trade-Offs and Considerations

Stack Overhead: Each resource in a separate stack increases management complexity and may hit stack limits (500 per region).
Alternative: Grouping resources in single stacks could reduce overhead but complicates individual resource management.
Performance: Stack operations are slower than Cloud Control API but provide IaC benefits.
Dependencies: Managing dependent resources (e.g., S3 bucket with IAM role) requires careful template design.

9. Implementation Example
Below is a sample TypeScript implementation for create_resource:
import { CloudFormationClient, CreateStackCommand } from '@aws-sdk/client-cloudformation';
import { v4 as uuidv4 } from 'uuid';

async function createResource(resourceType: string, properties: object): Promise<string> {
  const credentials = {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    sessionToken: 'YOUR_SESSION_TOKEN',
  };
  const client = new CloudFormationClient({ region: 'us-east-1', credentials });

  const stackName = `resource-${uuidv4()}`;
  const template = {
    Resources: {
      Resource: {
        Type: resourceType,
        Properties: properties,
      },
    },
  };

  const command = new CreateStackCommand({
    StackName: stackName,
    TemplateBody: JSON.stringify(template),
    Capabilities: ['CAPABILITY_IAM'],
  });

  try {
    await client.send(command);
    return stackName;
  } catch (error) {
    throw new Error(`Failed to create resource: ${error.message}`);
  }
}

// Example usage
createResource('AWS::S3::Bucket', { BucketName: 'my-bucket-123' })
  .then(stackId => console.log(`Stack created: ${stackId}`))
  .catch(error => console.error(error));

10. Comparison with MCP Server



Feature
MCP Server (Cloud Control API)
CloudFormation Implementation



Resource Creation
Direct API call
Stack creation with template


Resource Retrieval
Detailed properties
Stack resource details


Resource Update
Direct update
Stack update with new template


Resource Deletion
Direct deletion
Stack deletion


Resource Listing
List by type
List stacks, extract types


Schema Information
Via Cloud Control API
Via DescribeType


Request Status
Operation status
Stack status


Template Generation
From resources
From stack template


11. Future Enhancements

Support multi-resource stacks for dependent resources.
Integrate with AWS CDK for advanced template generation.
Add CLI interface for easier interaction.
Implement template validation before stack operations.

