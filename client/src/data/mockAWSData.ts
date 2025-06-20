/**
 * Mock AWS Data for Client-Side Development
 * 
 * This file contains realistic sample data that matches the AWS service interfaces
 * for use in development and testing environments. This data is safe to use on the
 * client side as it contains no real credentials or sensitive information.
 */

import type {
  AWSAccountInfo,
  EC2Instance,
  S3Bucket,
  RDSInstance,
  IAMUser,
  AWSResourceSummary
} from '@/services/mockAWSService';

// Mock Account Information
export const mockAccountInfo: AWSAccountInfo = {
  accountId: '123456789012',
  userId: 'AIDACKCEVSQ6C2EXAMPLE',
  arn: 'arn:aws:iam::123456789012:user/development-user',
  region: 'us-east-1'
};

// Mock EC2 Instances
export const mockEC2Instances: EC2Instance[] = [
  {
    instanceId: 'i-1234567890abcdef0',
    instanceType: 't3.medium',
    state: 'running',
    publicIpAddress: '54.123.45.67',
    privateIpAddress: '10.0.1.15',
    launchTime: new Date('2024-01-15T10:30:00Z'),
    name: 'web-server-prod',
    vpcId: 'vpc-12345678',
    subnetId: 'subnet-12345678'
  },
  {
    instanceId: 'i-0987654321fedcba0',
    instanceType: 't3.small',
    state: 'stopped',
    publicIpAddress: undefined,
    privateIpAddress: '10.0.2.22',
    launchTime: new Date('2024-01-10T14:20:00Z'),
    name: 'dev-environment',
    vpcId: 'vpc-12345678',
    subnetId: 'subnet-87654321'
  },
  {
    instanceId: 'i-abcdef1234567890',
    instanceType: 'm5.large',
    state: 'running',
    publicIpAddress: '34.567.89.123',
    privateIpAddress: '10.0.1.45',
    launchTime: new Date('2024-02-01T09:15:00Z'),
    name: 'api-server',
    vpcId: 'vpc-12345678',
    subnetId: 'subnet-12345678'
  }
];

// Mock S3 Buckets
export const mockS3Buckets: S3Bucket[] = [
  {
    name: 'my-app-static-assets',
    creationDate: new Date('2023-12-01T08:00:00Z'),
    region: 'us-east-1'
  },
  {
    name: 'backup-storage-bucket',
    creationDate: new Date('2023-11-15T12:30:00Z'),
    region: 'us-west-2'
  },
  {
    name: 'user-uploads-prod',
    creationDate: new Date('2024-01-05T16:45:00Z'),
    region: 'us-east-1'
  },
  {
    name: 'logs-archive-2024',
    creationDate: new Date('2024-01-01T00:00:00Z'),
    region: 'eu-west-1'
  }
];

// Mock RDS Instances
export const mockRDSInstances: RDSInstance[] = [
  {
    dbInstanceIdentifier: 'prod-database',
    dbInstanceClass: 'db.t3.medium',
    engine: 'postgres',
    dbInstanceStatus: 'available',
    endpoint: 'prod-database.cluster-xyz.us-east-1.rds.amazonaws.com',
    port: 5432,
    allocatedStorage: 100
  },
  {
    dbInstanceIdentifier: 'dev-mysql-db',
    dbInstanceClass: 'db.t3.micro',
    engine: 'mysql',
    dbInstanceStatus: 'available',
    endpoint: 'dev-mysql-db.xyz.us-east-1.rds.amazonaws.com',
    port: 3306,
    allocatedStorage: 20
  },
  {
    dbInstanceIdentifier: 'analytics-warehouse',
    dbInstanceClass: 'db.r5.xlarge',
    engine: 'postgres',
    dbInstanceStatus: 'stopped',
    endpoint: 'analytics-warehouse.cluster-abc.us-west-2.rds.amazonaws.com',
    port: 5432,
    allocatedStorage: 500
  }
];

// Mock IAM Users
export const mockIAMUsers: IAMUser[] = [
  {
    userName: 'development-user',
    userId: 'AIDACKCEVSQ6C2EXAMPLE',
    arn: 'arn:aws:iam::123456789012:user/development-user',
    createDate: new Date('2023-10-15T10:00:00Z'),
    passwordLastUsed: new Date('2024-02-10T14:30:00Z')
  },
  {
    userName: 'ci-cd-service',
    userId: 'AIDACKCEVSQ6C2EXAMPLE2',
    arn: 'arn:aws:iam::123456789012:user/ci-cd-service',
    createDate: new Date('2023-11-01T09:15:00Z'),
    passwordLastUsed: new Date('2024-02-11T08:45:00Z')
  },
  {
    userName: 'backup-automation',
    userId: 'AIDACKCEVSQ6C2EXAMPLE3',
    arn: 'arn:aws:iam::123456789012:user/backup-automation',
    createDate: new Date('2023-12-05T11:20:00Z'),
    passwordLastUsed: undefined
  }
];

// Mock VPCs
export const mockVPCs = [
  {
    VpcId: 'vpc-12345678',
    CidrBlock: '10.0.0.0/16',
    State: 'available',
    IsDefault: true,
    Tags: [
      { Key: 'Name', Value: 'main-vpc' }
    ]
  },
  {
    VpcId: 'vpc-87654321',
    CidrBlock: '172.16.0.0/16',
    State: 'available',
    IsDefault: false,
    Tags: [
      { Key: 'Name', Value: 'dev-vpc' }
    ]
  }
];

// Mock Security Groups
export const mockSecurityGroups = [
  {
    GroupId: 'sg-12345678',
    GroupName: 'web-servers',
    Description: 'Security group for web servers',
    VpcId: 'vpc-12345678',
    Tags: [
      { Key: 'Name', Value: 'web-servers-sg' }
    ]
  },
  {
    GroupId: 'sg-87654321',
    GroupName: 'database-servers',
    Description: 'Security group for database servers',
    VpcId: 'vpc-12345678',
    Tags: [
      { Key: 'Name', Value: 'database-sg' }
    ]
  },
  {
    GroupId: 'sg-abcdef12',
    GroupName: 'ssh-access',
    Description: 'SSH access from office',
    VpcId: 'vpc-12345678',
    Tags: [
      { Key: 'Name', Value: 'ssh-access-sg' }
    ]
  }
];

// Mock Key Pairs
export const mockKeyPairs = [
  {
    KeyName: 'production-key',
    KeyFingerprint: '1f:51:ae:28:bf:89:e9:d8:1f:25:5d:37:2d:7d:b8:ca:9f:f5:f1:6f',
    Tags: [
      { Key: 'Environment', Value: 'production' }
    ]
  },
  {
    KeyName: 'development-key',
    KeyFingerprint: '2a:62:bf:39:cg:9a:fa:e9:2g:36:6e:48:3e:8e:c9:db:ag:g6:g2:7g',
    Tags: [
      { Key: 'Environment', Value: 'development' }
    ]
  }
];

// Complete Mock Resource Summary
export const mockAWSResourceSummary: AWSResourceSummary = {
  accountInfo: mockAccountInfo,
  ec2Instances: mockEC2Instances,
  s3Buckets: mockS3Buckets,
  rdsInstances: mockRDSInstances,
  iamUsers: mockIAMUsers,
  vpcs: mockVPCs,
  securityGroups: mockSecurityGroups,
  keyPairs: mockKeyPairs
};

/**
 * Utility function to get mock data with optional delay simulation
 * Useful for testing loading states in components
 */
export const getMockAWSData = async (delayMs: number = 0): Promise<AWSResourceSummary> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockAWSResourceSummary;
};

/**
 * Individual data getters for specific resource types
 * Useful when components only need specific types of data
 */
export const getMockAccountInfo = async (delayMs: number = 0): Promise<AWSAccountInfo> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockAccountInfo;
};

export const getMockEC2Instances = async (delayMs: number = 0): Promise<EC2Instance[]> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockEC2Instances;
};

export const getMockS3Buckets = async (delayMs: number = 0): Promise<S3Bucket[]> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockS3Buckets;
};

export const getMockRDSInstances = async (delayMs: number = 0): Promise<RDSInstance[]> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockRDSInstances;
};

export const getMockIAMUsers = async (delayMs: number = 0): Promise<IAMUser[]> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockIAMUsers;
};
