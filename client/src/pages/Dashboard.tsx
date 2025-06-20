


import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ArrowLeft, MessageCircle, Shield, Cloud, CheckCircle,
  Clock, AlertCircle, Server, BarChart3
} from "lucide-react";
import {
  GCPIcon, AzureIcon, DigitalOceanIcon, LinodeIcon, VultrIcon, OCIIcon,
  HerokuIcon, RailwayIcon, FlyIcon, CloudflareIcon, VercelIcon, NetlifyIcon,
  SupabaseIcon, PlanetScaleIcon, RenderIcon, GitHubIcon, GitLabIcon, BitbucketIcon,
  DockerHubIcon
} from "@/components/icons";
import { SignedIn, UserButton } from "@clerk/clerk-react";

// Import custom hooks
import { useCloudConnections, useAWSManagement, useChat } from "@/hooks/dashboard";

// Import extracted components
import {
  AIAssistant,
  ConnectedServices,
  Analytics,
  useAnalyticsData,
  Connections,
  AWSCredentialsModal
} from "@/components/dashboard";

// Import types
import { CloudProvider, TabValue } from "@/types/dashboard";

/**
 * Optimized Dashboard component with extracted components and custom hooks
 * Implements performance optimizations including memoization and efficient data fetching
 */
const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("assistant");

  // Custom hooks for data management
  const {
    cloudConnections,
    isLoadingConnections,
    refreshConnections
  } = useCloudConnections();

  // Create a stable callback reference to prevent infinite loops
  const stableRefreshConnections = useCallback(() => {
    refreshConnections();
  }, [refreshConnections]);

  const awsManagement = useAWSManagement(stableRefreshConnections);
  const chat = useChat();
  const { metrics, activities } = useAnalyticsData();

  // Comprehensive cloud providers configuration
  const cloudProviders = useMemo<CloudProvider[]>(() => {
    const getProviderStatus = (providerId: string): 'connected' | 'disconnected' | 'coming-soon' | 'planned' => {
      switch (providerId) {
        case 'aws':
          return cloudConnections.aws ? 'connected' : 'disconnected';
        case 'gcp':
          return cloudConnections.gcp ? 'connected' : 'coming-soon';
        case 'azure':
          return cloudConnections.azure ? 'connected' : 'coming-soon';
        default:
          return 'coming-soon';
      }
    };

    return [
      // Infrastructure Providers
      {
        id: 'aws',
        name: 'Amazon Web Services',
        icon: Cloud,
        status: getProviderStatus('aws'),
        description: 'Complete AWS infrastructure management with EC2, S3, RDS, Lambda, and more',
        color: 'from-orange-500 to-yellow-500',
        category: 'infrastructure' as const,
        priority: 'high' as const,
        features: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFormation']
      },
      {
        id: 'gcp',
        name: 'Google Cloud Platform',
        icon: GCPIcon,
        status: getProviderStatus('gcp'),
        description: 'Comprehensive GCP integration with Compute Engine, Cloud Storage, and BigQuery support',
        color: 'from-blue-500 to-green-500',
        category: 'infrastructure' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['Compute Engine', 'Cloud Storage', 'BigQuery', 'Cloud Functions']
      },
      {
        id: 'azure',
        name: 'Microsoft Azure',
        icon: AzureIcon,
        status: getProviderStatus('azure'),
        description: 'Full Azure ecosystem integration with Virtual Machines, Blob Storage, and Azure Functions',
        color: 'from-blue-600 to-cyan-500',
        category: 'infrastructure' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['Virtual Machines', 'Blob Storage', 'Azure Functions', 'Cosmos DB']
      },
      {
        id: 'digitalocean',
        name: 'DigitalOcean',
        icon: DigitalOceanIcon,
        status: 'coming-soon',
        description: 'Manage Droplets, Kubernetes clusters, and Spaces with our intuitive interface',
        color: 'from-blue-500 to-blue-700',
        category: 'infrastructure' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Droplets', 'Kubernetes', 'Spaces', 'Load Balancers']
      },
      {
        id: 'linode',
        name: 'Linode (Akamai)',
        icon: LinodeIcon,
        status: 'coming-soon',
        description: 'Deploy and manage Linode instances, volumes, and networking configurations',
        color: 'from-green-500 to-teal-600',
        category: 'infrastructure' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Linodes', 'Block Storage', 'NodeBalancers', 'Object Storage']
      },
      {
        id: 'vultr',
        name: 'Vultr',
        icon: VultrIcon,
        status: 'coming-soon',
        description: 'High-performance cloud compute instances and bare metal servers management',
        color: 'from-purple-500 to-indigo-600',
        category: 'infrastructure' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q4 2024',
        features: ['Cloud Compute', 'Bare Metal', 'Block Storage', 'Load Balancers']
      },
      {
        id: 'oci',
        name: 'Oracle Cloud Infrastructure',
        icon: OCIIcon,
        status: 'coming-soon',
        description: 'Enterprise-grade Oracle Cloud services including compute, storage, and databases',
        color: 'from-red-500 to-orange-600',
        category: 'infrastructure' as const,
        priority: 'low' as const,
        estimatedRelease: 'Q4 2024',
        features: ['Compute', 'Object Storage', 'Autonomous Database', 'Container Engine']
      },

      // Platform Providers
      {
        id: 'heroku',
        name: 'Heroku',
        icon: HerokuIcon,
        status: 'coming-soon',
        description: 'Platform-as-a-Service for deploying and scaling applications effortlessly',
        color: 'from-purple-600 to-pink-600',
        category: 'platform' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Dynos', 'Add-ons', 'Pipelines', 'Review Apps']
      },
      {
        id: 'railway',
        name: 'Railway',
        icon: RailwayIcon,
        status: 'coming-soon',
        description: 'Modern deployment platform for developers with instant deployments',
        color: 'from-gray-600 to-gray-800',
        category: 'platform' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q4 2024',
        features: ['Instant Deployments', 'Database Hosting', 'Environment Variables', 'Custom Domains']
      },
      {
        id: 'fly',
        name: 'Fly.io',
        icon: FlyIcon,
        status: 'coming-soon',
        description: 'Global application platform that runs your code close to users worldwide',
        color: 'from-indigo-500 to-purple-600',
        category: 'platform' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Global Deployment', 'Edge Computing', 'Postgres', 'Redis']
      },
      {
        id: 'render',
        name: 'Render',
        icon: RenderIcon,
        status: 'coming-soon',
        description: 'Unified cloud platform for building and running apps and websites',
        color: 'from-green-400 to-blue-500',
        category: 'platform' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q4 2024',
        features: ['Web Services', 'Static Sites', 'Databases', 'Cron Jobs']
      },

      // Edge & CDN Providers
      {
        id: 'cloudflare',
        name: 'Cloudflare',
        icon: CloudflareIcon,
        status: 'coming-soon',
        description: 'Global CDN, security, and edge computing platform with Workers and Pages',
        color: 'from-orange-400 to-red-500',
        category: 'edge' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['CDN', 'Workers', 'Pages', 'R2 Storage', 'DNS']
      },
      {
        id: 'vercel',
        name: 'Vercel',
        icon: VercelIcon,
        status: 'coming-soon',
        description: 'Frontend cloud platform optimized for Next.js and modern web frameworks',
        color: 'from-black to-gray-800',
        category: 'edge' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Edge Functions', 'Static Sites', 'Serverless Functions', 'Analytics']
      },
      {
        id: 'netlify',
        name: 'Netlify',
        icon: NetlifyIcon,
        status: 'coming-soon',
        description: 'All-in-one platform for automating modern web projects with JAMstack',
        color: 'from-teal-400 to-cyan-500',
        category: 'edge' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Static Hosting', 'Serverless Functions', 'Forms', 'Identity']
      },

      // Database Providers
      {
        id: 'supabase',
        name: 'Supabase',
        icon: SupabaseIcon,
        status: 'coming-soon',
        description: 'Open source Firebase alternative with PostgreSQL, authentication, and real-time subscriptions',
        color: 'from-green-400 to-emerald-600',
        category: 'database' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['PostgreSQL', 'Authentication', 'Real-time', 'Storage', 'Edge Functions']
      },
      {
        id: 'planetscale',
        name: 'PlanetScale',
        icon: PlanetScaleIcon,
        status: 'coming-soon',
        description: 'Serverless MySQL platform with branching, non-blocking schema changes, and global replication',
        color: 'from-blue-400 to-purple-500',
        category: 'database' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['MySQL', 'Database Branching', 'Schema Changes', 'Global Replication']
      },

      // Source Control Providers
      {
        id: 'github',
        name: 'GitHub',
        icon: GitHubIcon,
        status: 'planned',
        description: 'World\'s leading development platform with Git repositories, CI/CD, and collaborative tools',
        color: 'from-gray-700 to-gray-900',
        category: 'source-control' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['Repositories', 'GitHub Actions', 'Issues', 'Pull Requests', 'Wiki', 'Projects']
      },
      {
        id: 'gitlab',
        name: 'GitLab',
        icon: GitLabIcon,
        status: 'coming-soon',
        description: 'Complete DevOps platform with Git repositories, CI/CD pipelines, and project management',
        color: 'from-orange-500 to-red-600',
        category: 'source-control' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Git Repositories', 'CI/CD Pipelines', 'Issue Tracking', 'Merge Requests', 'Container Registry']
      },
      {
        id: 'bitbucket',
        name: 'Bitbucket',
        icon: BitbucketIcon,
        status: 'coming-soon',
        description: 'Atlassian\'s Git solution with repositories, pipelines, and seamless Jira integration',
        color: 'from-blue-600 to-blue-800',
        category: 'source-control' as const,
        priority: 'medium' as const,
        estimatedRelease: 'Q3 2024',
        features: ['Git Repositories', 'Pipelines', 'Pull Requests', 'Jira Integration', 'Deployments']
      },

      // DevOps & Container Providers
      {
        id: 'dockerhub',
        name: 'Docker Hub',
        icon: DockerHubIcon,
        status: 'coming-soon',
        description: 'World\'s largest container registry for sharing and managing Docker images',
        color: 'from-blue-500 to-cyan-600',
        category: 'platform' as const,
        priority: 'high' as const,
        estimatedRelease: 'Q2 2024',
        features: ['Container Registry', 'Automated Builds', 'Webhooks', 'Organizations', 'Teams']
      }
    ];
  }, [cloudConnections]);

  // Memoized callback functions for component props
  const handleNavigateToConnections = useCallback(() => {
    setActiveTab("connections");
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as TabValue);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'coming-soon':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  }, []);

  return (
    <SignedIn>
      <div className="min-h-screen bg-black text-white">
        {/* Background gradient elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
          <div className="absolute top-[-300px] right-[-300px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-700/30 to-blue-700/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-gradient-to-r from-cyan-700/20 to-teal-700/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        </div>

        {/* Header */}
        <motion.header
          className="relative z-10 bg-black/60 backdrop-blur-xl border-b border-white/10 p-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full blur opacity-30"></div>
                  <motion.img
                    src="/lovable-uploads/145c593f-1a1b-45a8-914e-d151ce53c695.png"
                    alt="ZapGap Logo"
                    className="h-8 w-auto brightness-0 invert relative"
                  />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  ZapGap Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Infrastructure Control Center</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full border-2 border-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                  }
                }}
              />
            </div>
          </div>
        </motion.header>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger
                value="assistant"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <Server className="w-4 h-4 mr-2" />
                Connected Services
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="connections"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Connections
              </TabsTrigger>
            </TabsList>

            {/* AI Assistant Tab */}
            <TabsContent value="assistant" className="mt-8">
              <AIAssistant
                messages={chat.messages}
                inputValue={chat.inputValue}
                isTyping={chat.isTyping}
                selectedAgent={chat.selectedAgent}
                onSendMessage={chat.handleSendMessage}
                onInputChange={chat.setInputValue}
                onAgentChange={chat.setSelectedAgent}
                onClearChat={chat.handleClearChat}
                messagesEndRef={chat.messagesEndRef}
                inputRef={chat.inputRef}
              />
            </TabsContent>

            {/* Connected Services Tab */}
            <TabsContent value="services" className="mt-8">
              <ConnectedServices
                awsConnectionStatus={awsManagement.awsConnectionStatus}
                awsResources={awsManagement.awsResources}
                isLoadingResources={awsManagement.isLoadingResources}
                onRefreshResources={awsManagement.handleRefreshResources}
                onNavigateToConnections={handleNavigateToConnections}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-8">
              <Analytics metrics={metrics} activities={activities} />
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="mt-8">
              <Connections
                cloudProviders={cloudProviders}
                isLoadingConnections={isLoadingConnections}
                onRefreshConnections={refreshConnections}
                onConnectAWS={awsManagement.handleConnectAWS}
                onDisconnectAWS={awsManagement.handleDisconnectAWS}
                getStatusIcon={getStatusIcon}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* AWS Credentials Modal */}
        <AWSCredentialsModal
          isOpen={awsManagement.showAWSForm}
          onClose={() => awsManagement.setShowAWSForm(false)}
          onSubmit={awsManagement.handleAWSSubmit}
          credentials={awsManagement.awsCredentials}
          onCredentialsChange={awsManagement.setAwsCredentials}
          connectionStatus={awsManagement.awsConnectionStatus}
          error={awsManagement.awsError}
          awsDataError={null}
        />
      </div>
    </SignedIn>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
