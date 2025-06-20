import { useState, useRef, useEffect, useCallback } from 'react';
import useAuthenticatedFetch from './useAuthenticatedFetch';
import { Message, UseChatReturn } from '@/types/dashboard';

const ZAPGAP_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8787';

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // API call function to ZapGap Server
  const callZapGapAPI = useCallback(async (userMessage: string): Promise<string> => {
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
  }, [authenticatedFetch]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
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
  }, [inputValue, isTyping, callZapGapAPI]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    inputValue,
    isTyping,
    messagesEndRef,
    inputRef,
    setInputValue,
    handleSendMessage,
    handleClearChat
  };
};
