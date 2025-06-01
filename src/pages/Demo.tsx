import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Sparkles, MessageCircle,
  Zap, User, Bot, ChevronRight, AlertCircle, RotateCcw
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

// ZapGap Chat API Configuration
const ZAPGAP_API = {
  endpoint: 'https://zapgap-api.deno.dev/chat',
  // No authentication required for the demo API
};

// API Request/Response Types based on OpenAPI spec
interface ChatRequest {
  msg: string;
}

interface SimplifiedChatResponse {
  message: string;
  session_id: string;
}

interface ChatError {
  error: string;
  message?: string;
  status?: number;
}

// Generate unique session ID for each demo session
const generateSessionId = () => `demo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

// Session storage key for persistence
const SESSION_STORAGE_KEY = 'zapgap_session_id';

// Get or create session ID with persistence
const getOrCreateSessionId = (): string => {
  try {
    // Check if sessionStorage is available
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (existingSessionId) {
        console.log('Retrieved existing session ID:', existingSessionId);
        return existingSessionId;
      }
    }
  } catch (error) {
    console.warn('SessionStorage not available:', error);
  }

  // Generate new session ID if none exists or sessionStorage unavailable
  const newSessionId = generateSessionId();
  console.log('Generated new session ID:', newSessionId);

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
    }
  } catch (error) {
    console.warn('Could not store session ID:', error);
  }

  return newSessionId;
};

const Demo = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  // API call function to ZapGap Chat API
  const callZapGapAPI = async (userMessage: string): Promise<string> => {
    try {
      console.log('Calling ZapGap Chat API with message:', userMessage);
      console.log('Using session ID:', sessionId);

      // Use chatId query parameter to get simplified response
      const url = new URL(ZAPGAP_API.endpoint);
      url.searchParams.set('chatId', sessionId);

      const requestBody: ChatRequest = {
        msg: userMessage
      };

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `API request failed with status ${response.status}`;
        try {
          const errorData: ChatError = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If we can't parse the error, use the default message
        }
        throw new Error(errorMessage);
      }

      const data: SimplifiedChatResponse = await response.json();

      // Debug: Log the response structure
      console.log('ZapGap API response:', JSON.stringify(data, null, 2));

      // Synchronize session ID with server response
      if (data.session_id && data.session_id !== sessionId) {
        console.log('Updating session ID from server:', data.session_id);
        setSessionId(data.session_id);
        try {
          if (typeof window !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
          }
        } catch (error) {
          console.warn('Could not update stored session ID:', error);
        }
      }

      // Extract the AI response from the simplified response
      const aiResponse = data.message || "I'm having trouble processing your request right now. Please try again.";

      return aiResponse;
    } catch (error) {
      console.error('ZapGap API call failed:', error);
      throw error;
    }
  };

  // Clear chat and start new session
  const handleClearChat = () => {
    console.log('Clearing chat and starting new session');

    // Clear all messages
    setMessages([]);

    // Generate new session ID
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // Update sessionStorage with new session ID
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      }
    } catch (error) {
      console.warn('Could not store new session ID:', error);
    }

    console.log('New session started with ID:', newSessionId);
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
      // Call the ZapGap Chat API
      const aiResponse = await callZapGapAPI(currentInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Handle API errors gracefully
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties right now. Please try again in a moment. If the problem persists, our AI infrastructure assistant will be back online shortly.",
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <motion.header 
        className="bg-black/60 backdrop-blur-xl border-b border-white/10 p-4"
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
                ZapGap Demo
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Infrastructure Assistant</span>
            </div>
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
        </div>
      </motion.header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-[#3ABCF7]/20 to-[#8B2FF8]/20 rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Welcome to ZapGap Demo
                </h2>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed"
                   style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Experience our AI-powered infrastructure assistant. Ask questions about cloud operations, 
                  deployments, or troubleshooting - just like you would with ChatGPT.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {[
                  "How do I deploy to staging?",
                  "Check AWS costs this month",
                  "Restart the payment service",
                  "Show me recent alerts"
                ].map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputValue(suggestion)}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#3ABCF7]/50 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 group-hover:text-white transition-colors"
                            style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {suggestion}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#3ABCF7] transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            // Messages
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : 'bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8]'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : message.isError ? (
                        <AlertCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] text-white'
                        : message.isError
                        ? 'bg-red-500/20 border border-red-500/40 text-red-200'
                        : 'bg-white/10 border border-white/20 text-gray-100'
                    }`}>
                      <p className="text-sm leading-relaxed" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div 
          className="border-t border-white/10 p-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask ZapGap about your infrastructure..."
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-gray-400 rounded-xl py-4 px-6 pr-12 focus:border-[#3ABCF7] focus:ring-[#3ABCF7] text-base"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-[#3ABCF7] to-[#8B2FF8] hover:from-[#3ABCF7]/90 hover:to-[#8B2FF8]/90 text-white px-6 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Demo;
