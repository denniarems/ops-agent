import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Server, BarChart3, Activity, TrendingUp, HardDrive
} from 'lucide-react';
import { AnalyticsProps, AnalyticsMetric, ActivityItem } from '@/types/dashboard';

/**
 * Analytics component with metrics cards, charts, and activity feed
 * Memoized for performance optimization with static data
 */
const Analytics = memo<AnalyticsProps>(({ metrics, activities }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Analytics Overview Cards */}
      <MetricsGrid metrics={metrics} />

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Activity */}
      <ActivityFeed activities={activities} />
    </motion.div>
  );
});

// Memoized Metrics Grid component
const MetricsGrid = memo<{ metrics: AnalyticsMetric[] }>(({ metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {metrics.map((metric, index) => (
      <MetricCard key={index} metric={metric} />
    ))}
  </div>
));

// Memoized individual Metric Card component
const MetricCard = memo<{ metric: AnalyticsMetric }>(({ metric }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{metric.title}</p>
          <p className="text-2xl font-bold text-white">{metric.value}</p>
          <p className="text-sm text-green-400">{metric.change}</p>
        </div>
        <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
          <metric.icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized Charts Section component
const ChartsSection = memo(() => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <ChartCard
      title="Resource Usage Trends"
      icon={BarChart3}
      description="CPU, Memory, Storage trends over time"
    />
    <ChartCard
      title="Cost Breakdown"
      icon={TrendingUp}
      description="Service costs, trends, and optimization suggestions"
    />
  </div>
));

// Memoized Chart Card component
const ChartCard = memo<{
  title: string;
  icon: React.ComponentType<any>;
  description: string;
}>(({ title, icon: Icon, description }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-white">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Interactive charts would be displayed here</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
));

// Memoized Activity Feed component
const ActivityFeed = memo<{ activities: ActivityItem[] }>(({ activities }) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="text-xl font-bold text-white">Recent Infrastructure Activity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
    </CardContent>
  </Card>
));

// Memoized individual Activity Item component
const ActivityItem = memo<{ activity: ActivityItem }>(({ activity }) => {
  const statusColor = useMemo(() => {
    switch (activity.type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  }, [activity.type]);

  return (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
      <div className="flex-1">
        <p className="text-white text-sm">{activity.action}</p>
        <p className="text-gray-400 text-xs">{activity.time}</p>
      </div>
    </div>
  );
});

// Hook to provide default analytics data
export const useAnalyticsData = () => {
  const metrics = useMemo<AnalyticsMetric[]>(() => [
    { 
      title: "Total Resources", 
      value: "247", 
      change: "+12%", 
      icon: Server, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      title: "Monthly Cost", 
      value: "$1,247", 
      change: "-8%", 
      icon: TrendingUp, 
      color: "from-green-500 to-teal-500" 
    },
    { 
      title: "Active Instances", 
      value: "18", 
      change: "+3", 
      icon: Activity, 
      color: "from-orange-500 to-red-500" 
    },
    { 
      title: "Storage Used", 
      value: "2.4TB", 
      change: "+156GB", 
      icon: HardDrive, 
      color: "from-purple-500 to-pink-500" 
    }
  ], []);

  const activities = useMemo<ActivityItem[]>(() => [
    { 
      action: "EC2 instance i-1234567890abcdef0 started", 
      time: "2 minutes ago", 
      type: "success" 
    },
    { 
      action: "S3 bucket 'production-logs' created", 
      time: "15 minutes ago", 
      type: "info" 
    },
    { 
      action: "RDS instance 'prod-db' backup completed", 
      time: "1 hour ago", 
      type: "success" 
    },
    { 
      action: "Security group sg-0123456789abcdef0 modified", 
      time: "3 hours ago", 
      type: "warning" 
    },
    { 
      action: "Lambda function 'data-processor' deployed", 
      time: "6 hours ago", 
      type: "info" 
    }
  ], []);

  return { metrics, activities };
};

Analytics.displayName = 'Analytics';
MetricsGrid.displayName = 'MetricsGrid';
MetricCard.displayName = 'MetricCard';
ChartsSection.displayName = 'ChartsSection';
ChartCard.displayName = 'ChartCard';
ActivityFeed.displayName = 'ActivityFeed';
ActivityItem.displayName = 'ActivityItem';

export default Analytics;
