# Mock AWS Data System

This directory contains a comprehensive mock data system for AWS resources that can be safely used on the client side for development, testing, and demo purposes.

## Overview

The mock data system provides realistic sample data that matches the AWS service interfaces without requiring actual AWS credentials or making real API calls. This is perfect for:

- **Development**: Work on UI components without needing AWS access
- **Testing**: Consistent, predictable data for testing scenarios
- **Demos**: Show realistic data without exposing real infrastructure
- **Client-side safety**: No AWS SDK dependencies or credentials in browser

## Files Structure

```
client/src/data/
├── mockAWSData.ts          # Raw mock data and utility functions
├── README.md               # This documentation
└── ...

client/src/services/
├── mockAWSService.ts       # Client-safe mock service with TypeScript interfaces
└── ...

client/src/components/examples/
├── MockDataExample.tsx     # Example usage component
└── ...
```

## Usage Methods

### Method 1: Mock Service (Recommended for Development)

Use the mock service that simulates real AWS service behavior:

```typescript
import { mockAWSService } from '@/services/mockAWSService';

// Connect (simulates authentication)
await mockAWSService.connect({
  accessKeyId: 'MOCK_ACCESS_KEY',
  secretAccessKey: 'MOCK_SECRET_KEY',
  region: 'us-east-1'
});

// Fetch data (with realistic delays)
const resources = await mockAWSService.getAllResources();
```

### Method 2: Direct Data Access

Import and use mock data directly:

```typescript
import { getMockAWSData, getMockEC2Instances } from '@/data/mockAWSData';

// Get all resources with optional delay
const allResources = await getMockAWSData(500); // 500ms delay

// Get specific resource types
const ec2Instances = await getMockEC2Instances(200);
```

### Method 3: Quick Access (No Delays)

For instant access to data:

```typescript
import { getQuickMockData } from '@/services/mockAWSService';

// Instant access to all data
const resources = getQuickMockData.allResources();
const ec2Instances = getQuickMockData.ec2Instances();
```

### Method 4: Environment-Aware Service

Automatically switch between real and mock services:

```typescript
import { getAWSService } from '@/services/mockAWSService';

const awsService = getAWSService(); // Returns mock in dev, real in prod
```

## Available Mock Data

### Account Information
- Account ID: `123456789012`
- Region: `us-east-1` (or from credentials)
- User ARN and ID

### EC2 Instances (3 instances)
- **web-server-prod**: t3.medium, running, with public IP
- **dev-environment**: t3.small, stopped
- **api-server**: m5.large, running, with public IP

### S3 Buckets (4 buckets)
- **my-app-static-assets**: us-east-1
- **backup-storage-bucket**: us-west-2
- **user-uploads-prod**: us-east-1
- **logs-archive-2024**: eu-west-1

### RDS Instances (3 instances)
- **prod-database**: PostgreSQL, available, db.t3.medium
- **dev-mysql-db**: MySQL, available, db.t3.micro
- **analytics-warehouse**: PostgreSQL, stopped, db.r5.xlarge

### IAM Users (3 users)
- **development-user**: Recently active
- **ci-cd-service**: Recently active
- **backup-automation**: Service account

### Network Resources
- **VPCs**: 2 VPCs (main and dev)
- **Security Groups**: 3 groups (web, database, SSH)
- **Key Pairs**: 2 key pairs (production and development)

## Integration with Existing Components

The mock data is designed to work seamlessly with existing components like `AWSResourcesDisplay`:

```typescript
import { mockAWSService } from '@/services/mockAWSService';
import AWSResourcesDisplay from '@/components/AWSResourcesDisplay';

function MyComponent() {
  const [resources, setResources] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMockData = async () => {
    setIsLoading(true);
    try {
      await mockAWSService.connect({ /* mock credentials */ });
      const data = await mockAWSService.getAllResources();
      setResources(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AWSResourcesDisplay 
      resources={resources} 
      isLoading={isLoading}
      onRefresh={loadMockData}
    />
  );
}
```

## Environment Configuration

You can control mock data usage with environment variables:

```bash
# .env.local
VITE_USE_MOCK_AWS=true  # Force mock data usage
```

## Customizing Mock Data

To modify the mock data:

1. Edit `mockAWSData.ts` to change the sample data
2. Add new resource types by extending the interfaces
3. Modify delays in `mockAWSService.ts` for different simulation behavior

## Security Notes

- ✅ **Safe for client-side use**: No real credentials or AWS SDK dependencies
- ✅ **No sensitive data**: All data is fictional and safe to expose
- ✅ **Development only**: Clearly marked as mock data
- ⚠️ **Don't use in production**: Always use real AWS services for production

## Example Component

See `client/src/components/examples/MockDataExample.tsx` for a complete example showing all usage methods.

## TypeScript Support

All mock data is fully typed using comprehensive TypeScript interfaces:

```typescript
import type {
  AWSResourceSummary,
  EC2Instance,
  S3Bucket
} from '@/services/mockAWSService';
```

This ensures type safety and compatibility with existing components.
