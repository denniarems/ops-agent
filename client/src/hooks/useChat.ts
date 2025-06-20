import { useState, useRef, useEffect, useCallback } from 'react';
import useAuthenticatedFetch from './useAuthenticatedFetch';
import { Message, UseChatReturn, AgentType, AgentAPIResponse, ConversationContext } from '@/types/dashboard';
import {
  getThreadId,
  setThreadId,
  getConversationContext,
  updateConversationContext,
  startNewConversation,
  generateRunId,
  cleanupStaleConversations
} from '@/utils/conversationManager';

const ZAPGAP_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

// Agent API configuration (dynamic agent name)
const getAgentConfig = (agentName: AgentType) => ({
  agentName,
  maxRetries: 2,
  maxSteps: 5,
  temperature: 0.5,
  topP: 1,
  timeout: 30000, // 30 seconds timeout
});

/**
 * Custom hook for managing chat functionality
 * Handles message state, API calls, and chat operations with optimized performance
 */
export const useChat = (): UseChatReturn => {
  const { authenticatedFetch } = useAuthenticatedFetch();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('coreAgent');

  // Conversation management state
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize conversation context when agent changes
  useEffect(() => {
    const threadId = getThreadId(selectedAgent);
    const context = getConversationContext(selectedAgent);

    setCurrentThreadId(threadId);
    setConversationContext(context);

    // Clean up stale conversations on initialization
    cleanupStaleConversations();
  }, [selectedAgent]);

  // API call function to ZapGap Server (standard JSON response)
  const callAgentAPI = useCallback(async (
    userMessage: string,
    agentName: AgentType,
    signal?: AbortSignal
  ): Promise<AgentAPIResponse> => {
    try {
      const config = getAgentConfig(agentName);

      // Get current threadId and generate runId
      const threadId = getThreadId(agentName);
      const runId = generateRunId(agentName);

      const response = await authenticatedFetch(`${ZAPGAP_SERVER_URL}/api/chat`, {
        method: 'POST',
        body: {
          agentName: config.agentName,
          messages: [
            {
              role: 'user' as const,
              content: userMessage
            }
          ],
          threadId,
          runId,
          maxRetries: config.maxRetries,
          maxSteps: config.maxSteps,
          temperature: config.temperature,
          topP: config.topP,
        },
        signal,
      });

      // Update conversation context with new activity
      const currentContext = getConversationContext(agentName);
      const messageCount = (currentContext?.messageCount || 0) + 1;
      updateConversationContext(agentName, response.threadId, messageCount);

      // Update local state with returned threadId
      if (response.threadId !== threadId) {
        setThreadId(agentName, response.threadId);
        setCurrentThreadId(response.threadId);
      }

      return response;
    } catch (error) {
      console.error('Agent API call failed:', error);
      throw error;
    }
  }, [authenticatedFetch]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      threadId: currentThreadId || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Call agent API with standard JSON response
      const apiResponse = await callAgentAPI(
        currentInput,
        selectedAgent,
        abortController.signal
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: apiResponse.message,
        sender: 'assistant',
        timestamp: new Date(),
        threadId: apiResponse.threadId,
        runId: apiResponse.runId
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Agent API call failed:', error);

      // Handle API errors gracefully
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
      abortControllerRef.current = null;
    }
  }, [inputValue, isTyping, selectedAgent, callAgentAPI]);

  const handleClearChat = useCallback(() => {
    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setIsTyping(false);
  }, []);

  const handleStartNewConversation = useCallback(() => {
    // Clear current chat
    handleClearChat();

    // Start new conversation for current agent
    const newThreadId = startNewConversation(selectedAgent);
    setCurrentThreadId(newThreadId);
    setConversationContext(null);
  }, [selectedAgent, handleClearChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    inputValue,
    isTyping,
    selectedAgent,
    messagesEndRef,
    inputRef,
    setInputValue,
    setSelectedAgent,
    handleSendMessage,
    handleClearChat,
    // Conversation management
    currentThreadId,
    conversationContext,
    startNewConversation: handleStartNewConversation
  };
};
