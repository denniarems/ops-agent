import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud } from 'lucide-react';
import AWSResourcesDisplay from '@/components/AWSResourcesDisplay';
import { ConnectedServicesProps } from '@/types/dashboard';

/**
 * Connected Services component for displaying AWS resources and connection status
 * Memoized for performance optimization
 */
const ConnectedServices = memo<ConnectedServicesProps>(({
  awsConnectionStatus,
  awsResources,
  isLoadingResources,
  onRefreshResources,
  onNavigateToConnections
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {awsConnectionStatus === 'connected' ? (
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
LoadingResourcesCard.displayName = 'LoadingResourcesCard';
NoServicesConnectedCard.displayName = 'NoServicesConnectedCard';

export default ConnectedServices;
