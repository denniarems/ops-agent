import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { ConnectionsProps, CloudProvider } from '@/types/dashboard';

/**
 * Unified Connections component for all cloud provider management
 * Displays both connected and coming soon providers in organized categories
 */
const Connections = memo<ConnectionsProps>(({
  cloudProviders,
  isLoadingConnections,
  onRefreshConnections,
  onConnectAWS,
  onDisconnectAWS
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Group providers by category
  const categorizedProviders = useMemo(() => {
    const categories = {
      all: cloudProviders,
      infrastructure: cloudProviders.filter(p => p.category === 'infrastructure'),
      platform: cloudProviders.filter(p => p.category === 'platform'),
      edge: cloudProviders.filter(p => p.category === 'edge'),
      database: cloudProviders.filter(p => p.category === 'database'),
      serverless: cloudProviders.filter(p => p.category === 'serverless'),
      'source-control': cloudProviders.filter(p => p.category === 'source-control'),
    };
    return categories;
  }, [cloudProviders]);

  const categoryLabels = {
    all: 'All Providers',
    infrastructure: 'Infrastructure',
    platform: 'Platform',
    edge: 'Edge & CDN',
    database: 'Database',
    serverless: 'Serverless',
    'source-control': 'Source Control'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <ConnectionsHeader
            isLoading={isLoadingConnections}
            onRefresh={onRefreshConnections}
          />
          <CategoryFilter
            categories={categoryLabels}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            providerCounts={categorizedProviders}
          />
        </CardHeader>
        <CardContent>
          <ProvidersGrid
            providers={categorizedProviders[selectedCategory as keyof typeof categorizedProviders]}
            onConnectAWS={onConnectAWS}
            onDisconnectAWS={onDisconnectAWS}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Memoized Connections Header component
const ConnectionsHeader = memo<{
  isLoading: boolean;
  onRefresh: () => void;
}>(({ isLoading, onRefresh }) => (
  <div className="flex items-center justify-between">
    <div>
      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        Cloud Providers
      </CardTitle>
      <p className="text-gray-400">
        Connect and manage your cloud infrastructure across multiple providers
        {isLoading && (
          <span className="ml-2 text-sm text-blue-400">• Checking connections...</span>
        )}
      </p>
    </div>
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
      title="Refresh connection status"
    >
      <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  </div>
));

// Category Filter component
const CategoryFilter = memo<{
  categories: Record<string, string>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  providerCounts: Record<string, CloudProvider[]>;
}>(({ categories, selectedCategory, onCategoryChange, providerCounts }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {Object.entries(categories).map(([key, label]) => (
      <button
        key={key}
        onClick={() => onCategoryChange(key)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          selectedCategory === key
            ? 'bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white shadow-lg'
            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
        }`}
      >
        {label}
        <span className="ml-1.5 text-xs opacity-75">
          ({providerCounts[key]?.length || 0})
        </span>
      </button>
    ))}
  </div>
));

// Providers Grid component
const ProvidersGrid = memo<{
  providers: CloudProvider[];
  onConnectAWS: () => void;
  onDisconnectAWS: () => void;
}>(({ providers, onConnectAWS, onDisconnectAWS }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {providers.map((provider, index) => (
      <ProviderCard
        key={provider.id}
        provider={provider}
        index={index}
        onConnectAWS={onConnectAWS}
        onDisconnectAWS={onDisconnectAWS}
      />
    ))}
  </div>
));

// Enhanced Provider Card component
const ProviderCard = memo<{
  provider: CloudProvider;
  index: number;
  onConnectAWS: () => void;
  onDisconnectAWS: () => void;
}>(({ provider, index, onConnectAWS, onDisconnectAWS }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <Star className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">High Priority</span>
          </div>
        );
      case 'medium':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-900/30 border border-yellow-500/30 rounded-full">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Medium Priority</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-900/30 border border-gray-500/30 rounded-full">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Planned</span>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400 font-medium">Connected</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-gray-900/30 border border-gray-500/30 rounded-full">
            <AlertCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Available</span>
          </div>
        );
      case 'coming-soon':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">Coming Soon</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full">
            <Clock className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400 font-medium">Planned</span>
          </div>
        );
    }
  };

  const actionButtons = useMemo(() => {
    if (provider.status === 'disconnected' && provider.id === 'aws') {
      return (
        <Button
          onClick={onConnectAWS}
          className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-3 py-1.5 text-sm rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Connect
        </Button>
      );
    }

    if (provider.status === 'connected' && provider.id === 'aws') {
      return (
        <Button
          onClick={onDisconnectAWS}
          variant="outline"
          size="sm"
          className="text-red-400 border-red-400/50 hover:bg-red-900/20 hover:text-red-300 text-xs"
        >
          Disconnect
        </Button>
      );
    }

    return null;
  }, [provider.status, provider.id, onConnectAWS, onDisconnectAWS]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
           style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>

      <div className="relative z-10">
        {/* Provider Icon and Name */}
        <div className="flex items-center space-x-3 mb-3">
          <div className={`p-2.5 rounded-lg bg-gradient-to-r ${provider.color} shadow-lg`}>
            <provider.icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{provider.name}</h3>
            {provider.estimatedRelease && (
              <p className="text-xs text-gray-500">{provider.estimatedRelease}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 mb-3 line-clamp-3 leading-relaxed">
          {provider.description}
        </p>

        {/* Status and Priority Badges */}
        <div className="flex justify-between items-center mb-3">
          {getStatusBadge(provider.status)}
          {(provider.status === 'coming-soon' || provider.status === 'planned') &&
           getPriorityBadge(provider.priority)}
        </div>

        {/* Action Buttons */}
        {actionButtons && (
          <div className="flex justify-center">
            {actionButtons}
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#3ABCF7]/5 to-[#8B2FF8]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
});

Connections.displayName = 'Connections';
ConnectionsHeader.displayName = 'ConnectionsHeader';
CategoryFilter.displayName = 'CategoryFilter';
ProvidersGrid.displayName = 'ProvidersGrid';
ProviderCard.displayName = 'ProviderCard';

export default Connections;
