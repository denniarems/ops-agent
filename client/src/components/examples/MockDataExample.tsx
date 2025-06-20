/**
 * Example Component: Using Mock AWS Data
 * 
 * This component demonstrates how to use the mock AWS data in your React components.
 * It shows different approaches for consuming the mock data.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, Server, HardDrive, Users } from 'lucide-react';

// Import the mock service and data
import { mockAWSService, getQuickMockData } from '@/services/mockAWSService';
import { getMockAWSData } from '@/data/mockAWSData';
import type { AWSResourceSummary } from '@/services/mockAWSService';

const MockDataExample: React.FC = () => {
  const [resources, setResources] = useState<AWSResourceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Method 1: Using the mock service (simulates real service behavior)
  const connectAndFetchWithService = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Connect to mock service
      await mockAWSService.connect({
        accessKeyId: 'MOCK_ACCESS_KEY',
        secretAccessKey: 'MOCK_SECRET_KEY',
        region: 'us-east-1'
      });
      
      setIsConnected(true);
      
      // Fetch all resources
      const data = await mockAWSService.getAllResources();
      setResources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Method 2: Using direct mock data access (instant)
  const fetchWithDirectAccess = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get mock data with simulated delay
      const data = await getMockAWSData(500);
      setResources(data);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Method 3: Using quick access (no delays, instant)
  const fetchWithQuickAccess = () => {
    setError(null);
    const data = getQuickMockData.allResources();
    setResources(data);
    setIsConnected(true);
  };

  // Disconnect
  const disconnect = () => {
    mockAWSService.disconnect();
    setIsConnected(false);
    setResources(null);
    setError(null);
  };

  // Auto-connect on mount (optional)
  useEffect(() => {
    // Uncomment to auto-load data on component mount
    // fetchWithDirectAccess();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Mock AWS Data Example</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={connectAndFetchWithService}
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Method 1: Service with Delays
            </Button>
            
            <Button 
              onClick={fetchWithDirectAccess}
              disabled={isLoading}
              variant="outline"
            >
              Method 2: Direct Access
            </Button>
            
            <Button 
              onClick={fetchWithQuickAccess}
              disabled={isLoading}
              variant="outline"
            >
              Method 3: Quick Access
            </Button>
            
            <Button 
              onClick={disconnect}
              disabled={isLoading}
              variant="destructive"
            >
              Disconnect
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {resources && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span>EC2 Instances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.ec2Instances.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {resources.ec2Instances.filter(i => i.state === 'running').length} running
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <HardDrive className="w-4 h-4" />
                <span>S3 Buckets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.s3Buckets.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                Across {new Set(resources.s3Buckets.map(b => b.region)).size} regions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>RDS Instances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.rdsInstances.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {resources.rdsInstances.filter(i => i.dbInstanceStatus === 'available').length} available
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>IAM Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.iamUsers.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                {resources.iamUsers.filter(u => u.passwordLastUsed).length} recently active
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {resources && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Account ID:</span>
                <span className="ml-2 font-mono">{resources.accountInfo.accountId}</span>
              </div>
              <div>
                <span className="font-medium">Region:</span>
                <span className="ml-2">{resources.accountInfo.region}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">ARN:</span>
                <span className="ml-2 font-mono text-xs break-all">{resources.accountInfo.arn}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Method 1 - Service with Delays:</strong> Uses the mock service that simulates real AWS API behavior with network delays. Good for testing loading states.
          </div>
          <div>
            <strong>Method 2 - Direct Access:</strong> Directly imports and uses mock data with optional simulated delays. Good for development.
          </div>
          <div>
            <strong>Method 3 - Quick Access:</strong> Instant access to mock data without any delays. Good for demos and quick prototyping.
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <strong>Note:</strong> All methods return the same data structure, so you can easily switch between them or use them in different parts of your application.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockDataExample;
