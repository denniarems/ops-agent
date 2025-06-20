import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageCircle, Zap, ChevronRight, RotateCcw, Send
} from 'lucide-react';
import { ChatMessage } from '@/components/ChatMessage';
import { LoadingQuotes } from '@/components/LoadingQuotes';
import { AIAssistantProps } from '@/types/dashboard';

/**
 * AI Assistant component with chat interface
 * Memoized for performance optimization
 */
const AIAssistant = memo<AIAssistantProps>(({
  messages,
  inputValue,
  isTyping,
  onSendMessage,
  onInputChange,
  onClearChat,
  messagesEndRef,
  inputRef
}) => {
  // Memoized suggestion buttons to prevent unnecessary re-renders
  const suggestionButtons = React.useMemo(() => [
    "Show me my AWS EC2 instances",
    "What's my current AWS spending?",
    "Help me deploy a new application",
    "Check for security vulnerabilities"
  ], []);

  const handleSuggestionClick = React.useCallback((suggestion: string) => {
    onInputChange(suggestion);
  }, [onInputChange]);

  return (
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
                onClick={onClearChat}
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
              <WelcomeScreen 
                suggestions={suggestionButtons}
                onSuggestionClick={handleSuggestionClick}
              />
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
          <ChatInput
            inputValue={inputValue}
            isTyping={isTyping}
            onSendMessage={onSendMessage}
            onInputChange={onInputChange}
            inputRef={inputRef}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Memoized Welcome Screen component
const WelcomeScreen = memo<{
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}>(({ suggestions, onSuggestionClick }) => (
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
      {suggestions.map((suggestion, index) => (
        <SuggestionButton
          key={index}
          suggestion={suggestion}
          onClick={onSuggestionClick}
        />
      ))}
    </div>
  </motion.div>
));

// Memoized Suggestion Button component
const SuggestionButton = memo<{
  suggestion: string;
  onClick: (suggestion: string) => void;
}>(({ suggestion, onClick }) => {
  const handleClick = React.useCallback(() => {
    onClick(suggestion);
  }, [suggestion, onClick]);

  return (
    <motion.button
      onClick={handleClick}
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
  );
});

// Memoized Chat Input component
const ChatInput = memo<{
  inputValue: string;
  isTyping: boolean;
  onSendMessage: (e: React.FormEvent) => void;
  onInputChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}>(({ inputValue, isTyping, onSendMessage, onInputChange, inputRef }) => {
  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(e.target.value);
  }, [onInputChange]);

  return (
    <div className="border-t border-white/10 p-6 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
      <form onSubmit={onSendMessage} className="flex space-x-4">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
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
  );
});

AIAssistant.displayName = 'AIAssistant';
WelcomeScreen.displayName = 'WelcomeScreen';
SuggestionButton.displayName = 'SuggestionButton';
ChatInput.displayName = 'ChatInput';

export default AIAssistant;
