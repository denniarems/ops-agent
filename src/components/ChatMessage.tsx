import { motion } from "framer-motion";
import { User, Bot, AlertCircle, Clock } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isError?: boolean;
}

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isTyping = false }: ChatMessageProps) => {
  const isAssistant = message.sender === 'assistant';
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={cn(
        "flex items-start space-x-2 sm:space-x-3 max-w-[95%] sm:max-w-[85%]",
        isUser ? "flex-row-reverse space-x-reverse" : ""
      )}>
        {/* Enhanced Avatar */}
        <div className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
          "ring-2 ring-white/10 transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
            : message.isError
            ? "bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400"
            : "bg-gradient-to-br from-[#3ABCF7] to-[#8B2FF8] hover:from-[#3ABCF7]/90 hover:to-[#8B2FF8]/90"
        )}>
          {isUser ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : message.isError ? (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col space-y-1 min-w-0 flex-1">
          {/* Message Header with Timestamp */}
          <div className={cn(
            "flex items-center space-x-1 sm:space-x-2 text-xs",
            isUser ? "justify-end" : "justify-start"
          )}>
            <span className="text-gray-400 font-medium text-xs">
              {isUser ? "You" : message.isError ? "System" : "ZapGap AI"}
            </span>
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
            <span className="text-gray-500 text-xs">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>

          {/* Enhanced Message Bubble */}
          <div className={cn(
            "rounded-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-lg transition-all duration-300",
            "backdrop-blur-sm border",
            isUser
              ? "bg-gradient-to-br from-[#3ABCF7] to-[#8B2FF8] text-white border-white/20 shadow-[#3ABCF7]/20"
              : message.isError
              ? "bg-red-500/20 border-red-500/40 text-red-200 shadow-red-500/10"
              : "bg-white/10 border-white/20 text-gray-100 shadow-black/20 hover:bg-white/15"
          )}>
            {/* Content Rendering */}
            {isAssistant && !message.isError ? (
              <div className="reply-message-content">
                <MarkdownRenderer
                  content={message.content}
                  className="text-xs sm:text-sm"
                  isReply={true}
                />
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <p
                  className="text-xs sm:text-sm leading-relaxed flex-1"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {message.content}
                </p>
                {isTyping && (
                  <div className="flex space-x-1 ml-2">
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Assistant Message Footer (for additional context) */}
          {isAssistant && !message.isError && (
            <div className="flex items-center justify-start space-x-2 text-xs text-gray-500 ml-2">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI Response</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
