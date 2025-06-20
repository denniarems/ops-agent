



import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, MessageCircle, Zap, ChevronRight,
  RotateCcw, Cloud, CheckCircle, Clock, AlertCircle,
  Shield, Database, Server, BarChart3, Activity,
  TrendingUp, HardDrive, RefreshCw
} from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { LoadingQuotes } from "@/components/LoadingQuotes";
import { SignedIn, UserButton } from "@clerk/clerk-react";
import { mockAWSService as awsService, AWSResourceSummary } from "@/services/mockAWSService";
import AWSResourcesDisplay from "@/components/AWSResourcesDisplay";
import useAuthenticatedFetch from "@/hooks/useAuthenticatedFetch";
import useAWSData from "@/hooks/useAWSData";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

interface CloudProvider {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: 'connected' | 'disconnected' | 'coming-soon';
  description: string;
  color: string;
}

// ZapGap Server API Configuration
const ZAPGAP_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

// Session management is now handled by Clerk authentication

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("connections");
  const { authenticatedFetch } = useAuthenticatedFetch();
  const {
    getAWSDataStatus,
    getAWSCredentials,
    saveAWSData,
    deleteAWSData,
    error: awsDataError,
    clearError: clearAWSDataError
  } = useAWSData();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Cloud connections state
  const [cloudConnections, setCloudConnections] = useState({
    aws: false,
    gcp: false,
    azure: false
  });
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  // AWS state
  const [showAWSForm, setShowAWSForm] = useState(false);
  const [awsCredentials, setAwsCredentials] = useState({
    accessKey: '',
    secretKey: '',
    region: 'us-east-1'
  });
  const [awsConnectionStatus, setAwsConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [awsResources, setAwsResources] = useState<AWSResourceSummary | null>(null);
  const [awsError, setAwsError] = useState<string | null>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch cloud connections status
  const fetchCloudConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/aws-data/credentials`);
      if (response.data) {
        setCloudConnections(response.data);

        // Update AWS connection status based on API response
        if (response.data.aws && awsConnectionStatus === 'disconnected') {
          setAwsConnectionStatus('connected');
        } else if (!response.data.aws && awsConnectionStatus === 'connected') {
          setAwsConnectionStatus('disconnected');
        }
      }
    } catch (error) {
      console.error('Failed to fetch cloud connections:', error);
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const getProviderStatus = (providerId: string): 'connected' | 'disconnected' | 'coming-soon' => {
    switch (providerId) {
      case 'aws':
        return cloudConnections.aws ? 'connected' : 'disconnected';
      case 'gcp':
        return cloudConnections.gcp ? 'connected' : 'coming-soon';
      case 'azure':
        return cloudConnections.azure ? 'connected' : 'coming-soon';
      default:
        return 'disconnected';
    }
  };

  const cloudProviders: CloudProvider[] = [
    {
      id: 'aws',
      name: 'Amazon Web Services',
      icon: Cloud,
      status: getProviderStatus('aws'),
      description: 'Connect your AWS account to manage EC2, S3, RDS, and more',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'gcp',
      name: 'Google Cloud Platform',
      icon: Database,
      status: getProviderStatus('gcp'),
      description: cloudConnections.gcp ? 'Google Cloud Platform connected' : 'Google Cloud integration coming soon',
      color: 'from-blue-500 to-green-500'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      icon: Server,
      status: getProviderStatus('azure'),
      description: cloudConnections.azure ? 'Microsoft Azure connected' : 'Azure integration coming soon',
      color: 'from-blue-600 to-cyan-500'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch cloud connections on component mount
  useEffect(() => {
    fetchCloudConnections();
  }, []);

  // Restore AWS connection on component mount from Supabase
  useEffect(() => {
    const restoreAWSConnection = async () => {
      try {
        // Check if user has AWS data in Supabase
        const status = await getAWSDataStatus();

        if (status?.hasAWSData) {
          // Get credentials from Supabase
          const credentials = await getAWSCredentials();

          if (credentials) {
            setAwsCredentials(credentials);
            setAwsConnectionStatus('connecting');

            // Reconnect to AWS service
            await awsService.connect({
              accessKeyId: credentials.accessKey,
              secretAccessKey: credentials.secretKey,
              region: credentials.region,
            });

            setAwsConnectionStatus('connected');

            // Fetch fresh resources
            await fetchAWSResources();

            // Refresh cloud connections to reflect restored connection
            await fetchCloudConnections();
          }
        }
      } catch (error) {
        console.warn('Could not restore AWS connection:', error);
        setAwsConnectionStatus('disconnected');
        setAwsResources(null);
        if (awsDataError) {
          console.error('AWS Data Error:', awsDataError);
        }
      }
    };

    restoreAWSConnection();
  }, []); // Only run on mount

  // API call function to ZapGap Server
  const callZapGapAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/chat`, {
        method: 'POST',
        body: { message: userMessage, agentName: 'coreAgent' },
      });

      return response.message || response.response || "I'm having trouble processing your request right now. Please try again.";
    } catch (error) {
      console.error('ZapGap API call failed:', error);
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await callZapGapAPI(currentInput);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleConnectAWS = () => {
    setShowAWSForm(true);
  };

  const handleAWSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAwsConnectionStatus('connecting');
    setAwsError(null);
    clearAWSDataError();

    try {
      // Connect to AWS with real credentials
      await awsService.connect({
        accessKeyId: awsCredentials.accessKey,
        secretAccessKey: awsCredentials.secretKey,
        region: awsCredentials.region,
      });

      // Save credentials to Supabase for persistence
      const savedData = await saveAWSData(awsCredentials);

      if (!savedData) {
        throw new Error(awsDataError || 'Failed to save AWS credentials');
      }

      setAwsConnectionStatus('connected');
      setShowAWSForm(false);

      // Fetch AWS resources after successful connection
      await fetchAWSResources();

      // Refresh cloud connections to reflect the new status
      await fetchCloudConnections();

    } catch (error) {
      console.error('AWS connection failed:', error);
      setAwsConnectionStatus('disconnected');
      setAwsError(error instanceof Error ? error.message : 'Failed to connect to AWS');
    }
  };

  const fetchAWSResources = async () => {
    if (awsConnectionStatus !== 'connected') return;

    setIsLoadingResources(true);
    try {
      const resources = await awsService.getAllResources();
      setAwsResources(resources);
    } catch (error) {
      console.error('Failed to fetch AWS resources:', error);
      setAwsError(error instanceof Error ? error.message : 'Failed to fetch AWS resources');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleRefreshResources = () => {
    fetchAWSResources();
  };

  const handleDisconnectAWS = async () => {
    awsService.disconnect();
    setAwsConnectionStatus('disconnected');
    setAwsResources(null);
    setAwsCredentials({ accessKey: '', secretKey: '', region: 'us-east-1' });

    // Clear AWS data from Supabase
    try {
      await deleteAWSData();
      // Refresh cloud connections after disconnecting
      await fetchCloudConnections();
    } catch (error) {
      console.warn('Could not clear AWS data from database:', error);
    }
  };

  const handleRefreshConnections = () => {
    fetchCloudConnections();
  };

  const getStatusIcon = (status: string) => {
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
  };

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
              <TabsTrigger
                value="connections"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <Cloud className="w-4 h-4 mr-2" />
                Connections
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <Server className="w-4 h-4 mr-2" />
                Connected Services
              </TabsTrigger>
              <TabsTrigger
                value="assistant"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3ABCF7] data-[state=active]:to-[#8B2FF8] data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Cloud Connections Tab */}
            <TabsContent value="connections" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                                   style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                          Cloud Provider Connections
                        </CardTitle>
                        <p className="text-gray-400">
                          Connect your cloud accounts to start managing your infrastructure
                          {isLoadingConnections && (
                            <span className="ml-2 text-sm text-blue-400">• Checking connections...</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={handleRefreshConnections}
                        disabled={isLoadingConnections}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Refresh connection status"
                      >
                        <RefreshCw className={`w-4 h-4 text-white ${isLoadingConnections ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cloudProviders.map((provider) => (
                      <motion.div
                        key={provider.id}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full bg-gradient-to-r ${provider.color}`}>
                              <provider.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{provider.name}</h3>
                              <p className="text-sm text-gray-400">{provider.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(provider.status)}
                            {provider.status === 'disconnected' && provider.id === 'aws' && (
                              <Button
                                onClick={handleConnectAWS}
                                className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                              >
                                Connect
                              </Button>
                            )}
                            {provider.status === 'coming-soon' && (
                              <span className="text-sm text-gray-500 px-4 py-2 bg-gray-800 rounded-lg">
                                Coming Soon
                              </span>
                            )}
                            {provider.status === 'connected' && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-green-500 px-3 py-1 bg-green-900/20 rounded-lg">
                                  Connected
                                </span>
                                {provider.id === 'aws' && (
                                  <Button
                                    onClick={handleDisconnectAWS}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-400 border-red-400/50 hover:bg-red-900/20 hover:text-red-300"
                                  >
                                    Disconnect
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Connected Services Tab */}
            <TabsContent value="services" className="mt-8">
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
                      onRefresh={handleRefreshResources}
                    />
                  ) : (
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
                              onClick={handleRefreshResources}
                              disabled={isLoadingResources}
                              className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                            >
                              {isLoadingResources ? 'Loading...' : 'Retry'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ) : (
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
                            onClick={() => setActiveTab("connections")}
                            className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                          >
                            Connect Services
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="assistant" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm flex-1 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                                 style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        AI Infrastructure Assistant
                      </CardTitle>
                      {messages.length > 0 && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleClearChat}
                          className="text-black hover:text-white transition-colors"
                          title="Clear chat and start new session"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Clear Chat
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[500px] max-h-[700px]">
                      {messages.length === 0 ? (
                        // Welcome Screen
                        <motion.div
                          className="flex flex-col items-center justify-center h-full text-center space-y-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                        >
                          <div className="relative">
                            <div className="absolute -inset-6 bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 rounded-full blur-xl"></div>
                            <div className="relative w-16 h-16 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center">
                              <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                                style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                              Your Infrastructure Assistant
                            </h3>
                            <p className="text-gray-400 max-w-md mx-auto leading-relaxed text-sm"
                               style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                              Ask questions about your connected cloud resources, get deployment help, or troubleshoot issues.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
                            {[
                              "Show me my AWS EC2 instances",
                              "What's my current AWS spending?",
                              "Help me deploy a new application",
                              "Check for security vulnerabilities"
                            ].map((suggestion, index) => (
                              <motion.button
                                key={index}
                                onClick={() => setInputValue(suggestion)}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#3ABCF7]/50 transition-all duration-300 text-left group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm"
                                        style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                                    {suggestion}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#3ABCF7] transition-colors flex-shrink-0 ml-2" />
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        // Messages
                        <div className="space-y-4">
                          <AnimatePresence>
                            {messages.map((message) => (
                              <ChatMessage
                                key={message.id}
                                message={message}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Loading State */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-start"
                        >
                          <LoadingQuotes />
                        </motion.div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-white/10 p-6 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
                      <form onSubmit={handleSendMessage} className="flex space-x-4">
                        <div className="flex-1 relative">
                          <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your infrastructure..."
                            className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-3 px-4 pr-12 focus:border-[#3ABCF7] focus:ring-[#3ABCF7] shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/15 focus:bg-white/15"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Zap className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={!inputValue.trim() || isTyping}
                          className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] hover:from-[#3ABCF7]/90 hover:to-[#8B2FF8]/90 text-white px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                          <Send className="w-5 h-5" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Analytics Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Total Resources", value: "247", change: "+12%", icon: Server, color: "from-blue-500 to-cyan-500" },
                    { title: "Monthly Cost", value: "$1,247", change: "-8%", icon: TrendingUp, color: "from-green-500 to-teal-500" },
                    { title: "Active Instances", value: "18", change: "+3", icon: Activity, color: "from-orange-500 to-red-500" },
                    { title: "Storage Used", value: "2.4TB", change: "+156GB", icon: HardDrive, color: "from-purple-500 to-pink-500" }
                  ].map((metric, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-sm">
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
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white">Resource Usage Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Interactive charts would be displayed here</p>
                          <p className="text-sm text-gray-500">CPU, Memory, Storage trends over time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white">Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <div className="text-center">
                          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Cost analytics would be displayed here</p>
                          <p className="text-sm text-gray-500">Service costs, trends, and optimization suggestions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white">Recent Infrastructure Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "EC2 instance i-1234567890abcdef0 started", time: "2 minutes ago", type: "success" },
                        { action: "S3 bucket 'production-logs' created", time: "15 minutes ago", type: "info" },
                        { action: "RDS instance 'prod-db' backup completed", time: "1 hour ago", type: "success" },
                        { action: "Security group sg-0123456789abcdef0 modified", time: "3 hours ago", type: "warning" },
                        { action: "Lambda function 'data-processor' deployed", time: "6 hours ago", type: "info" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'success' ? 'bg-green-500' :
                            activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.action}</p>
                            <p className="text-gray-400 text-xs">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AWS Credentials Modal */}
        <AnimatePresence>
          {showAWSForm && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Connect AWS Account
                </h3>

                {(awsError || awsDataError) && (
                  <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-400 text-sm">{awsError || awsDataError}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAWSSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AWS Access Key ID
                    </label>
                    <Input
                      type="text"
                      value={awsCredentials.accessKey}
                      onChange={(e) => setAwsCredentials(prev => ({ ...prev, accessKey: e.target.value }))}
                      placeholder="AKIA..."
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AWS Secret Access Key
                    </label>
                    <Input
                      type="password"
                      value={awsCredentials.secretKey}
                      onChange={(e) => setAwsCredentials(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="Enter your secret key"
                      className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AWS Region
                    </label>
                    <select
                      value={awsCredentials.region}
                      onChange={(e) => setAwsCredentials(prev => ({ ...prev, region: e.target.value }))}
                      className="w-full bg-gray-800 border border-white/20 text-white rounded-lg p-2 focus:border-[#3ABCF7] focus:ring-1 focus:ring-[#3ABCF7]"
                    >
                      <option value="us-east-1" className="bg-gray-800 text-white">US East (N. Virginia)</option>
                      <option value="us-west-2" className="bg-gray-800 text-white">US West (Oregon)</option>
                      <option value="eu-west-1" className="bg-gray-800 text-white">Europe (Ireland)</option>
                      <option value="ap-southeast-1" className="bg-gray-800 text-white">Asia Pacific (Singapore)</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAWSForm(false)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={awsConnectionStatus === 'connecting'}
                      className="flex-1 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white"
                    >
                      {awsConnectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SignedIn>
  );
};

export default Dashboard;
