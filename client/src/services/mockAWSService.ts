/**
 * Mock AWS Service for Client-Side Development
 *
 * This service provides the same interface as the real AWS service but returns
 * mock data instead. It's safe to use on the client side and perfect for
 * development, testing, and demo purposes.
 */

// AWS Service Interfaces (moved from awsService.ts)
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface AWSAccountInfo {
  accountId: string;
  userId: string;
  arn: string;
  region: string;
}

export interface EC2Instance {
  instanceId: string;
  instanceType: string;
  state: string;
  publicIpAddress?: string;
  privateIpAddress?: string;
  launchTime?: Date;
  name?: string;
  vpcId?: string;
  subnetId?: string;
}

export interface S3Bucket {
  name: string;
  creationDate?: Date;
  region?: string;
}

export interface RDSInstance {
  dbInstanceIdentifier: string;
  dbInstanceClass: string;
  engine: string;
  dbInstanceStatus: string;
  endpoint?: string;
  port?: number;
  allocatedStorage?: number;
}

export interface IAMUser {
  userName: string;
  userId: string;
  arn: string;
  createDate?: Date;
  passwordLastUsed?: Date;
}

export interface AWSResourceSummary {
  accountInfo: AWSAccountInfo;
  ec2Instances: EC2Instance[];
  s3Buckets: S3Bucket[];
  rdsInstances: RDSInstance[];
  iamUsers: IAMUser[];
  vpcs: any[];
  securityGroups: any[];
  keyPairs: any[];
}

import {
  mockAccountInfo,
  mockEC2Instances,
  mockS3Buckets,
  mockRDSInstances,
  mockIAMUsers,
  mockVPCs,
  mockSecurityGroups,
  mockKeyPairs,
  mockAWSResourceSummary
} from '@/data/mockAWSData';

/**
 * Mock AWS Service Class
 * 
 * Provides the same interface as the real AWSService but returns mock data.
 * Includes realistic delays to simulate network requests.
 */
class MockAWSService {
  private isConnected: boolean = false;
  private mockCredentials: AWSCredentials | null = null;

  /**
   * Simulate connection to AWS with mock credentials
   * Always succeeds unless invalid credentials format is provided
   */
  async connect(credentials: AWSCredentials): Promise<boolean> {
    // Simulate network delay
    await this.delay(500);

    // Basic validation
    if (!credentials.accessKeyId || !credentials.secretAccessKey || !credentials.region) {
      throw new Error('Invalid credentials: All fields are required');
    }

    // Simulate connection failure for specific test cases
    if (credentials.accessKeyId === 'INVALID') {
      throw new Error('Invalid AWS credentials');
    }

    this.mockCredentials = credentials;
    this.isConnected = true;
    return true;
  }

  /**
   * Disconnect from AWS (mock)
   */
  disconnect(): void {
    this.isConnected = false;
    this.mockCredentials = null;
  }

  /**
   * Get mock account information
   */
  async getAccountInfo(): Promise<AWSAccountInfo> {
    this.ensureConnected();
    await this.delay(200);
    
    // Return account info with the region from credentials if available
    return {
      ...mockAccountInfo,
      region: this.mockCredentials?.region || mockAccountInfo.region
    };
  }

  /**
   * Get mock EC2 instances
   */
  async getEC2Instances(): Promise<EC2Instance[]> {
    this.ensureConnected();
    await this.delay(800);
    return [...mockEC2Instances];
  }

  /**
   * Get mock S3 buckets
   */
  async getS3Buckets(): Promise<S3Bucket[]> {
    this.ensureConnected();
    await this.delay(600);
    return [...mockS3Buckets];
  }

  /**
   * Get mock RDS instances
   */
  async getRDSInstances(): Promise<RDSInstance[]> {
    this.ensureConnected();
    await this.delay(700);
    return [...mockRDSInstances];
  }

  /**
   * Get mock IAM users
   */
  async getIAMUsers(): Promise<IAMUser[]> {
    this.ensureConnected();
    await this.delay(500);
    return [...mockIAMUsers];
  }

  /**
   * Get mock VPCs
   */
  async getVPCs(): Promise<any[]> {
    this.ensureConnected();
    await this.delay(400);
    return [...mockVPCs];
  }

  /**
   * Get mock security groups
   */
  async getSecurityGroups(): Promise<any[]> {
    this.ensureConnected();
    await this.delay(450);
    return [...mockSecurityGroups];
  }

  /**
   * Get mock key pairs
   */
  async getKeyPairs(): Promise<any[]> {
    this.ensureConnected();
    await this.delay(300);
    return [...mockKeyPairs];
  }

  /**
   * Get all mock resources
   * Simulates the parallel fetching behavior of the real service
   */
  async getAllResources(): Promise<AWSResourceSummary> {
    this.ensureConnected();
    
    // Simulate parallel requests with Promise.allSettled
    const [
      accountInfo,
      ec2Instances,
      s3Buckets,
      rdsInstances,
      iamUsers,
      vpcs,
      securityGroups,
      keyPairs
    ] = await Promise.allSettled([
      this.getAccountInfo(),
      this.getEC2Instances(),
      this.getS3Buckets(),
      this.getRDSInstances(),
      this.getIAMUsers(),
      this.getVPCs(),
      this.getSecurityGroups(),
      this.getKeyPairs()
    ]);

    return {
      accountInfo: accountInfo.status === 'fulfilled' ? accountInfo.value : {} as AWSAccountInfo,
      ec2Instances: ec2Instances.status === 'fulfilled' ? ec2Instances.value : [],
      s3Buckets: s3Buckets.status === 'fulfilled' ? s3Buckets.value : [],
      rdsInstances: rdsInstances.status === 'fulfilled' ? rdsInstances.value : [],
      iamUsers: iamUsers.status === 'fulfilled' ? iamUsers.value : [],
      vpcs: vpcs.status === 'fulfilled' ? vpcs.value : [],
      securityGroups: securityGroups.status === 'fulfilled' ? securityGroups.value : [],
      keyPairs: keyPairs.status === 'fulfilled' ? keyPairs.value : [],
    };
  }

  /**
   * Check if the service is connected
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Get current mock credentials (for debugging)
   */
  getCurrentCredentials(): AWSCredentials | null {
    return this.mockCredentials;
  }

  /**
   * Private helper methods
   */
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('AWS not connected');
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockAWSService = new MockAWSService();

/**
 * Environment-aware service selector
 * 
 * This function returns the appropriate service based on environment.
 * Use this in your components to automatically switch between real and mock services.
 */
export const getAWSService = () => {
  const isDevelopment = import.meta.env.DEV;
  const useMockData = import.meta.env.VITE_USE_MOCK_AWS === 'true';
  
  if (isDevelopment || useMockData) {
    return mockAWSService;
  }
  
  // In production or when explicitly disabled, you would import and return the real service
  // For now, we'll return the mock service as the real service has AWS SDK dependencies
  // that shouldn't be used on the client side
  console.warn('Real AWS service should not be used on client side. Using mock service.');
  return mockAWSService;
};

/**
 * Quick data access functions for components that just need the data
 * without the service interface
 */
export const getQuickMockData = {
  accountInfo: () => mockAccountInfo,
  ec2Instances: () => mockEC2Instances,
  s3Buckets: () => mockS3Buckets,
  rdsInstances: () => mockRDSInstances,
  iamUsers: () => mockIAMUsers,
  vpcs: () => mockVPCs,
  securityGroups: () => mockSecurityGroups,
  keyPairs: () => mockKeyPairs,
  allResources: () => mockAWSResourceSummary
};
