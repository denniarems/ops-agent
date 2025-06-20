import React, { memo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Cloud, RefreshCw, CheckCircle, AlertCircle, Clock, XCircle,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronRight,
  Activity, Server, Database, GitBranch, Monitor, Globe, Zap
} from 'lucide-react';
import AWSResourcesDisplay from '@/components/AWSResourcesDisplay';
import { ConnectedServicesProps, ConnectedService, ServiceSummary } from '@/types/dashboard';
import {
  getMockConnectedServicesData,
  getMockServiceSummary
} from '@/data/mockConnectedServicesData';

/**
 * Connected Services component for displaying comprehensive service information
 * Memoized for performance optimization
 */
const ConnectedServices = memo<ConnectedServicesProps>(({
  awsConnectionStatus,
  awsResources,
  isLoadingResources,
  onRefreshResources,
  onNavigateToConnections,
  connectedServices,
  serviceSummary,
  isLoadingServices = false,
  onRefreshServices
}) => {
  const [services, setServices] = useState<ConnectedService[]>([]);
  const [summary, setSummary] = useState<ServiceSummary | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['infrastructure']));

  // Load mock data if not provided via props
  useEffect(() => {
    const loadMockData = async () => {
      if (!connectedServices) {
        const mockServices = await getMockConnectedServicesData(500);
        setServices(mockServices);
      } else {
        setServices(connectedServices);
      }

      if (!serviceSummary) {
        const mockSummary = getMockServiceSummary();
        setSummary(mockSummary);
      } else {
        setSummary(serviceSummary);
      }
    };

    loadMockData();
  }, [connectedServices, serviceSummary]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Show comprehensive services view if we have connected services */}
      {services.length > 0 ? (
        <>
          <ServicesSummaryCard
            summary={summary}
            isLoading={isLoadingServices}
            onRefresh={onRefreshServices}
          />
          <ServicesGrid
            services={services}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
          />
        </>
      ) : awsConnectionStatus === 'connected' ? (
        awsResources ? (
          <AWSResourcesDisplay
            resources={awsResources}
            isLoading={isLoadingResources}
            onRefresh={onRefreshResources}
          />
        ) : (
          <LoadingResourcesCard
            isLoading={isLoadingResources}
            onRetry={onRefreshResources}
          />
        )
      ) : (
        <NoServicesConnectedCard onNavigateToConnections={onNavigateToConnections} />
      )}
    </motion.div>
  );
});

// Services Summary Card component
const ServicesSummaryCard = memo<{
  summary: ServiceSummary | null;
  isLoading: boolean;
  onRefresh?: () => void;
}>(({ summary, isLoading, onRefresh }) => {
  if (!summary) return null;



  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                   style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          Connected Services Overview
        </CardTitle>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-white">{summary.totalServices}</div>
                <div className="text-sm text-gray-400">Total Services</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">{summary.connectedServices}</div>
                <div className="text-sm text-gray-400">Connected</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">{summary.healthyServices}</div>
                <div className="text-sm text-gray-400">Healthy</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">{summary.servicesWithWarnings + summary.servicesWithErrors}</div>
                <div className="text-sm text-gray-400">Issues</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-400">
          Last updated: {summary.lastSyncTime.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
});

// Services Grid component
const ServicesGrid = memo<{
  services: ConnectedService[];
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
}>(({ services, expandedCategories, onToggleCategory }) => {
  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ConnectedService[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return Server;
      case 'database':
        return Database;
      case 'source-control':
        return GitBranch;
      case 'monitoring':
        return Monitor;
      case 'platform':
        return Globe;
      case 'serverless':
        return Zap;
      default:
        return Cloud;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'infrastructure':
        return 'from-blue-500 to-cyan-500';
      case 'database':
        return 'from-green-500 to-teal-500';
      case 'source-control':
        return 'from-purple-500 to-indigo-500';
      case 'monitoring':
        return 'from-orange-500 to-red-500';
      case 'platform':
        return 'from-pink-500 to-rose-500';
      case 'serverless':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
        const CategoryIcon = getCategoryIcon(category);
        const isExpanded = expandedCategories.has(category);

        return (
          <Card key={category} className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <button
                onClick={() => onToggleCategory(category)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryColor(category)}`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-white capitalize">
                      {category.replace('-', ' ')}
                    </CardTitle>
                    <div className="text-sm text-gray-400">
                      {categoryServices.length} service{categoryServices.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
});

// Individual Service Card component
const ServiceCard = memo<{
  service: ConnectedService;
}>(({ service }) => {
  const getStatusIcon = () => {
    switch (service.status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthBadgeColor = () => {
    switch (service.healthStatus) {
      case 'healthy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <service.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">{service.name}</h3>
              <p className="text-xs text-gray-400 line-clamp-2">{service.description}</p>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        <div className="flex items-center justify-between mb-3">
          <Badge className={`text-xs px-2 py-1 ${getHealthBadgeColor()}`}>
            {service.healthStatus}
          </Badge>
          {service.region && (
            <span className="text-xs text-gray-400">{service.region}</span>
          )}
        </div>

        {service.errorMessage && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {service.errorMessage}
          </div>
        )}

        {service.metrics.length > 0 && (
          <div className="space-y-2">
            {service.metrics.slice(0, 3).map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{metric.name}</span>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium text-white">{metric.value}</span>
                  {metric.trend && getTrendIcon(metric.trend)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400">
            Last sync: {service.lastSync.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Memoized Loading Resources Card component
const LoadingResourcesCard = memo<{
  isLoading: boolean;
  onRetry: () => void;
}>(({ isLoading, onRetry }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        Loading AWS Resources
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-16">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center animate-pulse">
          <Cloud className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Fetching AWS Resources</h3>
          <p className="text-gray-400 mb-4">Please wait while we retrieve your AWS infrastructure details...</p>
          <Button
            onClick={onRetry}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? 'Loading...' : 'Retry'}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized No Services Connected Card component
const NoServicesConnectedCard = memo<{
  onNavigateToConnections: () => void;
}>(({ onNavigateToConnections }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        Connected Services
      </CardTitle>
    </CardHeader>
    <CardContent className="text-center py-16">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
          <Cloud className="w-8 h-8 text-gray-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">No Services Connected</h3>
          <p className="text-gray-400 mb-4">Connect to your cloud providers to see detailed information about your infrastructure</p>
          <Button
            onClick={onNavigateToConnections}
            className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Connect Services
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

ConnectedServices.displayName = 'ConnectedServices';
ServicesSummaryCard.displayName = 'ServicesSummaryCard';
ServicesGrid.displayName = 'ServicesGrid';
ServiceCard.displayName = 'ServiceCard';
LoadingResourcesCard.displayName = 'LoadingResourcesCard';
NoServicesConnectedCard.displayName = 'NoServicesConnectedCard';

export default ConnectedServices;
