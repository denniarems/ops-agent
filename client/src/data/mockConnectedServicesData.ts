/**
 * Mock Connected Services Data for Client-Side Development
 * 
 * This file contains realistic sample data for connected services including
 * cloud providers, DevOps platforms, and source control systems. This data
 * is safe to use on the client side as it contains no real credentials.
 */

import type { ComponentType } from 'react';
import {
  Cloud, Server, Database, GitBranch, Package, Shield,
  Zap, Globe, Container, Settings, Monitor, Activity,
  CheckCircle, AlertCircle, Clock, XCircle
} from 'lucide-react';

// Service connection status types
export type ServiceConnectionStatus = 'connected' | 'disconnected' | 'error' | 'pending' | 'syncing';

// Service category types
export type ServiceCategory = 
  | 'infrastructure' 
  | 'platform' 
  | 'database' 
  | 'source-control' 
  | 'devops' 
  | 'monitoring' 
  | 'security' 
  | 'edge'
  | 'serverless';

// Service health status
export type ServiceHealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

// Service metric interface
export interface ServiceMetric {
  name: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

// Connected service interface
export interface ConnectedService {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<any>;
  category: ServiceCategory;
  status: ServiceConnectionStatus;
  healthStatus: ServiceHealthStatus;
  lastSync: Date;
  connectedAt: Date;
  region?: string;
  endpoint?: string;
  version?: string;
  metrics: ServiceMetric[];
  features: string[];
  configuration?: Record<string, any>;
  errorMessage?: string;
  tags?: string[];
}

// Mock timestamps for realistic data
const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

// AWS Services (Connected)
export const mockAWSServices: ConnectedService[] = [
  {
    id: 'aws-ec2',
    name: 'Amazon EC2',
    description: 'Elastic Compute Cloud - Virtual servers in the cloud',
    icon: Server,
    category: 'infrastructure',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    connectedAt: oneMonthAgo,
    region: 'us-east-1',
    metrics: [
      { name: 'Running Instances', value: '12', trend: 'stable', color: 'green' },
      { name: 'Stopped Instances', value: '3', trend: 'down', color: 'yellow' },
      { name: 'Monthly Cost', value: '$284.50', unit: 'USD', trend: 'up', color: 'blue' }
    ],
    features: ['Auto Scaling', 'Load Balancing', 'Spot Instances', 'Reserved Instances'],
    tags: ['production', 'compute']
  },
  {
    id: 'aws-s3',
    name: 'Amazon S3',
    description: 'Simple Storage Service - Object storage built to store and retrieve any amount of data',
    icon: Database,
    category: 'infrastructure',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutes ago
    connectedAt: oneMonthAgo,
    region: 'us-east-1',
    metrics: [
      { name: 'Total Buckets', value: '8', trend: 'stable', color: 'green' },
      { name: 'Total Objects', value: '1.2M', trend: 'up', color: 'blue' },
      { name: 'Storage Used', value: '2.4TB', trend: 'up', color: 'purple' }
    ],
    features: ['Versioning', 'Encryption', 'Lifecycle Policies', 'Cross-Region Replication'],
    tags: ['storage', 'backup']
  },
  {
    id: 'aws-rds',
    name: 'Amazon RDS',
    description: 'Relational Database Service - Managed relational database service',
    icon: Database,
    category: 'database',
    status: 'connected',
    healthStatus: 'warning',
    lastSync: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutes ago
    connectedAt: oneMonthAgo,
    region: 'us-east-1',
    metrics: [
      { name: 'DB Instances', value: '4', trend: 'stable', color: 'green' },
      { name: 'CPU Utilization', value: '78%', trend: 'up', color: 'orange' },
      { name: 'Storage Used', value: '156GB', trend: 'up', color: 'blue' }
    ],
    features: ['Multi-AZ', 'Read Replicas', 'Automated Backups', 'Performance Insights'],
    tags: ['database', 'mysql', 'postgresql']
  }
];

// Google Cloud Platform Services
export const mockGCPServices: ConnectedService[] = [
  {
    id: 'gcp-compute',
    name: 'Google Compute Engine',
    description: 'Virtual machines running in Google\'s data centers',
    icon: Server,
    category: 'infrastructure',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 8 * 60 * 1000),
    connectedAt: oneWeekAgo,
    region: 'us-central1',
    metrics: [
      { name: 'VM Instances', value: '6', trend: 'stable', color: 'green' },
      { name: 'vCPUs Used', value: '24', trend: 'stable', color: 'blue' },
      { name: 'Monthly Cost', value: '$156.30', unit: 'USD', trend: 'down', color: 'green' }
    ],
    features: ['Preemptible VMs', 'Custom Machine Types', 'Live Migration', 'Sustained Use Discounts'],
    tags: ['compute', 'development']
  },
  {
    id: 'gcp-storage',
    name: 'Google Cloud Storage',
    description: 'Unified object storage for developers and enterprises',
    icon: Database,
    category: 'infrastructure',
    status: 'syncing',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 1 * 60 * 1000),
    connectedAt: oneWeekAgo,
    region: 'us-central1',
    metrics: [
      { name: 'Buckets', value: '12', trend: 'up', color: 'green' },
      { name: 'Objects', value: '847K', trend: 'up', color: 'blue' },
      { name: 'Storage Used', value: '1.8TB', trend: 'up', color: 'purple' }
    ],
    features: ['Multi-Regional', 'Nearline', 'Coldline', 'Archive'],
    tags: ['storage', 'backup', 'archive']
  }
];

// Azure Services
export const mockAzureServices: ConnectedService[] = [
  {
    id: 'azure-vms',
    name: 'Azure Virtual Machines',
    description: 'On-demand, scalable computing resources',
    icon: Server,
    category: 'infrastructure',
    status: 'error',
    healthStatus: 'critical',
    lastSync: new Date(now.getTime() - 45 * 60 * 1000),
    connectedAt: oneDayAgo,
    region: 'East US',
    errorMessage: 'Authentication failed. Please check your credentials.',
    metrics: [
      { name: 'VM Instances', value: '0', trend: 'down', color: 'red' },
      { name: 'Status', value: 'Error', color: 'red' }
    ],
    features: ['Scale Sets', 'Availability Sets', 'Managed Disks', 'Azure Monitor'],
    tags: ['compute', 'error']
  }
];

// Source Control Services
export const mockSourceControlServices: ConnectedService[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Development platform with Git repositories and collaboration tools',
    icon: GitBranch,
    category: 'source-control',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 3 * 60 * 1000),
    connectedAt: oneMonthAgo,
    metrics: [
      { name: 'Repositories', value: '24', trend: 'up', color: 'green' },
      { name: 'Active PRs', value: '8', trend: 'stable', color: 'blue' },
      { name: 'Issues Open', value: '15', trend: 'down', color: 'orange' },
      { name: 'Contributors', value: '12', trend: 'up', color: 'purple' }
    ],
    features: ['Actions', 'Issues', 'Pull Requests', 'Wiki', 'Projects', 'Security'],
    tags: ['git', 'collaboration', 'ci-cd']
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Complete DevOps platform with Git repositories and CI/CD',
    icon: GitBranch,
    category: 'source-control',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 7 * 60 * 1000),
    connectedAt: oneWeekAgo,
    metrics: [
      { name: 'Projects', value: '18', trend: 'stable', color: 'green' },
      { name: 'Pipelines', value: '156', trend: 'up', color: 'blue' },
      { name: 'Merge Requests', value: '6', trend: 'stable', color: 'orange' }
    ],
    features: ['CI/CD Pipelines', 'Container Registry', 'Issue Tracking', 'Wiki'],
    tags: ['git', 'devops', 'ci-cd']
  }
];

// DevOps and Monitoring Services
export const mockDevOpsServices: ConnectedService[] = [
  {
    id: 'docker-hub',
    name: 'Docker Hub',
    description: 'Cloud-based registry service for Docker containers',
    icon: Container,
    category: 'devops',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 15 * 60 * 1000),
    connectedAt: oneWeekAgo,
    metrics: [
      { name: 'Repositories', value: '32', trend: 'up', color: 'green' },
      { name: 'Total Pulls', value: '2.4K', trend: 'up', color: 'blue' },
      { name: 'Images', value: '128', trend: 'up', color: 'purple' }
    ],
    features: ['Automated Builds', 'Webhooks', 'Organizations', 'Teams'],
    tags: ['containers', 'registry']
  },
  {
    id: 'datadog',
    name: 'Datadog',
    description: 'Monitoring and analytics platform for cloud applications',
    icon: Monitor,
    category: 'monitoring',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 1 * 60 * 1000),
    connectedAt: oneMonthAgo,
    metrics: [
      { name: 'Hosts', value: '45', trend: 'stable', color: 'green' },
      { name: 'Metrics/sec', value: '12.5K', trend: 'up', color: 'blue' },
      { name: 'Alerts', value: '3', trend: 'down', color: 'orange' }
    ],
    features: ['APM', 'Log Management', 'Infrastructure Monitoring', 'Synthetics'],
    tags: ['monitoring', 'observability', 'apm']
  }
];

// Platform Services
export const mockPlatformServices: ConnectedService[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Frontend cloud platform for static sites and serverless functions',
    icon: Zap,
    category: 'platform',
    status: 'connected',
    healthStatus: 'healthy',
    lastSync: new Date(now.getTime() - 4 * 60 * 1000),
    connectedAt: oneWeekAgo,
    metrics: [
      { name: 'Projects', value: '8', trend: 'stable', color: 'green' },
      { name: 'Deployments', value: '142', trend: 'up', color: 'blue' },
      { name: 'Functions', value: '24', trend: 'up', color: 'purple' }
    ],
    features: ['Edge Functions', 'Analytics', 'Preview Deployments', 'Custom Domains'],
    tags: ['frontend', 'serverless', 'edge']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'All-in-one platform for automating modern web projects',
    icon: Globe,
    category: 'platform',
    status: 'pending',
    healthStatus: 'unknown',
    lastSync: new Date(now.getTime() - 60 * 60 * 1000),
    connectedAt: oneDayAgo,
    metrics: [
      { name: 'Sites', value: '5', trend: 'stable', color: 'green' },
      { name: 'Build Minutes', value: '1.2K', trend: 'up', color: 'blue' }
    ],
    features: ['Forms', 'Identity', 'Functions', 'Split Testing'],
    tags: ['jamstack', 'forms', 'identity']
  }
];

// All connected services combined
export const mockConnectedServices: ConnectedService[] = [
  ...mockAWSServices,
  ...mockGCPServices,
  ...mockAzureServices,
  ...mockSourceControlServices,
  ...mockDevOpsServices,
  ...mockPlatformServices
];

// Service summary statistics
export interface ServiceSummary {
  totalServices: number;
  connectedServices: number;
  healthyServices: number;
  servicesWithWarnings: number;
  servicesWithErrors: number;
  lastSyncTime: Date;
  categories: Record<ServiceCategory, number>;
}

export const mockServiceSummary: ServiceSummary = {
  totalServices: mockConnectedServices.length,
  connectedServices: mockConnectedServices.filter(s => s.status === 'connected').length,
  healthyServices: mockConnectedServices.filter(s => s.healthStatus === 'healthy').length,
  servicesWithWarnings: mockConnectedServices.filter(s => s.healthStatus === 'warning').length,
  servicesWithErrors: mockConnectedServices.filter(s => s.healthStatus === 'critical').length,
  lastSyncTime: now,
  categories: mockConnectedServices.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {} as Record<ServiceCategory, number>)
};

/**
 * Utility function to get mock connected services data with optional delay simulation
 */
export const getMockConnectedServicesData = async (delayMs: number = 0): Promise<ConnectedService[]> => {
  if (delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return mockConnectedServices;
};

/**
 * Get services by category
 */
export const getMockServicesByCategory = (category: ServiceCategory): ConnectedService[] => {
  return mockConnectedServices.filter(service => service.category === category);
};

/**
 * Get services by status
 */
export const getMockServicesByStatus = (status: ServiceConnectionStatus): ConnectedService[] => {
  return mockConnectedServices.filter(service => service.status === status);
};

/**
 * Get service summary
 */
export const getMockServiceSummary = (): ServiceSummary => {
  return mockServiceSummary;
};
