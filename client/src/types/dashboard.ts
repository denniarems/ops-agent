import { ComponentType } from 'react';

// Message interface for chat functionality
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

// Cloud provider interface
export interface CloudProvider {
  id: string;
  name: string;
  icon: ComponentType<any>;
  status: 'connected' | 'disconnected' | 'coming-soon' | 'planned';
  description: string;
  color: string;
  category: 'infrastructure' | 'platform' | 'edge' | 'database' | 'serverless' | 'source-control';
  priority: 'high' | 'medium' | 'low';
  estimatedRelease?: string;
  features?: string[];
}

// AWS credentials interface
export interface AWSCredentials {
  accessKey: string;
  secretKey: string;
  region: string;
}

// AWS connection status type
export type AWSConnectionStatus = 'disconnected' | 'connecting' | 'connected';

// Cloud connections state
export interface CloudConnections {
  aws: boolean;
  gcp: boolean;
  azure: boolean;
}

// Analytics metric interface
export interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  icon: ComponentType<any>;
  color: string;
}

// Activity item interface
export interface ActivityItem {
  action: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

// Tab value type
export type TabValue = 'assistant' | 'services' | 'analytics' | 'connections';

// Component props interfaces
export interface AIAssistantProps {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  onInputChange: (value: string) => void;
  onClearChat: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
}

export interface ConnectedServicesProps {
  awsConnectionStatus: AWSConnectionStatus;
  awsResources: any; // AWSResourceSummary from mockAWSService
  isLoadingResources: boolean;
  onRefreshResources: () => void;
  onNavigateToConnections: () => void;
}

export interface AnalyticsProps {
  metrics: AnalyticsMetric[];
  activities: ActivityItem[];
}

export interface ConnectionsProps {
  cloudProviders: CloudProvider[];
  isLoadingConnections: boolean;
  onRefreshConnections: () => void;
  onConnectAWS: () => void;
  onDisconnectAWS: () => void;
  getStatusIcon: (status: string) => React.ReactNode;
}

export interface AWSCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  credentials: AWSCredentials;
  onCredentialsChange: (credentials: AWSCredentials) => void;
  connectionStatus: AWSConnectionStatus;
  error: string | null;
  awsDataError: string | null;
}

// Hook return types
export interface UseCloudConnectionsReturn {
  cloudConnections: CloudConnections;
  isLoadingConnections: boolean;
  fetchCloudConnections: () => Promise<void>;
  refreshConnections: () => void;
}

export interface UseAWSManagementReturn {
  awsConnectionStatus: AWSConnectionStatus;
  awsCredentials: AWSCredentials;
  awsResources: any; // AWSResourceSummary
  awsError: string | null;
  isLoadingResources: boolean;
  showAWSForm: boolean;
  setAwsCredentials: (credentials: AWSCredentials) => void;
  setShowAWSForm: (show: boolean) => void;
  handleAWSSubmit: (e: React.FormEvent) => Promise<void>;
  handleDisconnectAWS: () => Promise<void>;
  fetchAWSResources: () => Promise<void>;
  handleRefreshResources: () => void;
  handleConnectAWS: () => void;
}

export interface UseChatReturn {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  setInputValue: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  handleClearChat: () => void;
}
