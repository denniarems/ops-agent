import { 
  EC2Client, 
  DescribeInstancesCommand, 
  DescribeVpcsCommand,
  DescribeSecurityGroupsCommand,
  DescribeKeyPairsCommand 
} from '@aws-sdk/client-ec2';
import { 
  IAMClient, 
  GetUserCommand, 
  ListUsersCommand,
  GetAccountSummaryCommand 
} from '@aws-sdk/client-iam';
import { 
  S3Client, 
  ListBucketsCommand,
  GetBucketLocationCommand 
} from '@aws-sdk/client-s3';
import { 
  STSClient, 
  GetCallerIdentityCommand 
} from '@aws-sdk/client-sts';
import { 
  RDSClient, 
  DescribeDBInstancesCommand 
} from '@aws-sdk/client-rds';

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

class AWSService {
  private ec2Client: EC2Client | null = null;
  private iamClient: IAMClient | null = null;
  private s3Client: S3Client | null = null;
  private stsClient: STSClient | null = null;
  private rdsClient: RDSClient | null = null;
  private credentials: AWSCredentials | null = null;

  async connect(credentials: AWSCredentials): Promise<boolean> {
    try {
      this.credentials = credentials;
      
      const clientConfig = {
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      };

      // Initialize AWS service clients
      this.ec2Client = new EC2Client(clientConfig);
      this.iamClient = new IAMClient(clientConfig);
      this.s3Client = new S3Client(clientConfig);
      this.stsClient = new STSClient(clientConfig);
      this.rdsClient = new RDSClient(clientConfig);

      // Test connection by getting caller identity
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error('AWS connection failed:', error);
      this.disconnect();
      throw error;
    }
  }

  disconnect(): void {
    this.ec2Client = null;
    this.iamClient = null;
    this.s3Client = null;
    this.stsClient = null;
    this.rdsClient = null;
    this.credentials = null;
  }

  async getAccountInfo(): Promise<AWSAccountInfo> {
    if (!this.stsClient) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new GetCallerIdentityCommand({});
      const response = await this.stsClient.send(command);
      
      return {
        accountId: response.Account || '',
        userId: response.UserId || '',
        arn: response.Arn || '',
        region: this.credentials?.region || '',
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  async getEC2Instances(): Promise<EC2Instance[]> {
    if (!this.ec2Client) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new DescribeInstancesCommand({});
      const response = await this.ec2Client.send(command);
      
      const instances: EC2Instance[] = [];
      
      response.Reservations?.forEach(reservation => {
        reservation.Instances?.forEach(instance => {
          const nameTag = instance.Tags?.find(tag => tag.Key === 'Name');
          
          instances.push({
            instanceId: instance.InstanceId || '',
            instanceType: instance.InstanceType || '',
            state: instance.State?.Name || '',
            publicIpAddress: instance.PublicIpAddress,
            privateIpAddress: instance.PrivateIpAddress,
            launchTime: instance.LaunchTime,
            name: nameTag?.Value,
            vpcId: instance.VpcId,
            subnetId: instance.SubnetId,
          });
        });
      });
      
      return instances;
    } catch (error) {
      console.error('Failed to get EC2 instances:', error);
      throw error;
    }
  }

  async getS3Buckets(): Promise<S3Bucket[]> {
    if (!this.s3Client) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      
      const buckets: S3Bucket[] = [];
      
      if (response.Buckets) {
        for (const bucket of response.Buckets) {
          let region = 'us-east-1'; // Default region
          
          try {
            // Get bucket region
            const locationCommand = new GetBucketLocationCommand({
              Bucket: bucket.Name!,
            });
            const locationResponse = await this.s3Client.send(locationCommand);
            region = locationResponse.LocationConstraint || 'us-east-1';
          } catch (error) {
            // If we can't get the region, use default
            console.warn(`Could not get region for bucket ${bucket.Name}:`, error);
          }
          
          buckets.push({
            name: bucket.Name || '',
            creationDate: bucket.CreationDate,
            region,
          });
        }
      }
      
      return buckets;
    } catch (error) {
      console.error('Failed to get S3 buckets:', error);
      throw error;
    }
  }

  async getRDSInstances(): Promise<RDSInstance[]> {
    if (!this.rdsClient) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new DescribeDBInstancesCommand({});
      const response = await this.rdsClient.send(command);
      
      const instances: RDSInstance[] = [];
      
      response.DBInstances?.forEach(instance => {
        instances.push({
          dbInstanceIdentifier: instance.DBInstanceIdentifier || '',
          dbInstanceClass: instance.DBInstanceClass || '',
          engine: instance.Engine || '',
          dbInstanceStatus: instance.DBInstanceStatus || '',
          endpoint: instance.Endpoint?.Address,
          port: instance.Endpoint?.Port,
          allocatedStorage: instance.AllocatedStorage,
        });
      });
      
      return instances;
    } catch (error) {
      console.error('Failed to get RDS instances:', error);
      throw error;
    }
  }

  async getIAMUsers(): Promise<IAMUser[]> {
    if (!this.iamClient) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new ListUsersCommand({});
      const response = await this.iamClient.send(command);
      
      const users: IAMUser[] = [];
      
      response.Users?.forEach(user => {
        users.push({
          userName: user.UserName || '',
          userId: user.UserId || '',
          arn: user.Arn || '',
          createDate: user.CreateDate,
          passwordLastUsed: user.PasswordLastUsed,
        });
      });
      
      return users;
    } catch (error) {
      console.error('Failed to get IAM users:', error);
      throw error;
    }
  }

  async getVPCs(): Promise<any[]> {
    if (!this.ec2Client) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new DescribeVpcsCommand({});
      const response = await this.ec2Client.send(command);
      return response.Vpcs || [];
    } catch (error) {
      console.error('Failed to get VPCs:', error);
      throw error;
    }
  }

  async getSecurityGroups(): Promise<any[]> {
    if (!this.ec2Client) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new DescribeSecurityGroupsCommand({});
      const response = await this.ec2Client.send(command);
      return response.SecurityGroups || [];
    } catch (error) {
      console.error('Failed to get security groups:', error);
      throw error;
    }
  }

  async getKeyPairs(): Promise<any[]> {
    if (!this.ec2Client) {
      throw new Error('AWS not connected');
    }

    try {
      const command = new DescribeKeyPairsCommand({});
      const response = await this.ec2Client.send(command);
      return response.KeyPairs || [];
    } catch (error) {
      console.error('Failed to get key pairs:', error);
      throw error;
    }
  }

  async getAllResources(): Promise<AWSResourceSummary> {
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
}

export const awsService = new AWSService();
