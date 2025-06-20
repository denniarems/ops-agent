import { AgentType, ConversationContext } from '@/types/dashboard';

/**
 * Conversation Management Utility
 * 
 * Handles threadId persistence, conversation context tracking,
 * and session management for Mastra agent interactions
 */

// Storage keys for conversation persistence
const STORAGE_KEYS = {
  THREAD_ID: 'zapgap_thread_id',
  CONVERSATION_CONTEXT: 'zapgap_conversation_context',
  AGENT_CONVERSATIONS: 'zapgap_agent_conversations',
} as const;

// Generate a UUID v4 (matching server implementation)
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get the current threadId for the specified agent
 * Returns existing threadId from localStorage or generates a new one
 */
export function getThreadId(agentName: AgentType): string {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.THREAD_ID}_${agentName}`);
    if (stored) {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read threadId from localStorage:', error);
  }
  
  // Generate new threadId if none exists
  const newThreadId = generateUUID();
  setThreadId(agentName, newThreadId);
  return newThreadId;
}

/**
 * Set the threadId for the specified agent
 */
export function setThreadId(agentName: AgentType, threadId: string): void {
  try {
    localStorage.setItem(`${STORAGE_KEYS.THREAD_ID}_${agentName}`, threadId);
  } catch (error) {
    console.warn('Failed to save threadId to localStorage:', error);
  }
}

/**
 * Clear the threadId for the specified agent (start new conversation)
 */
export function clearThreadId(agentName: AgentType): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.THREAD_ID}_${agentName}`);
  } catch (error) {
    console.warn('Failed to clear threadId from localStorage:', error);
  }
}

/**
 * Get conversation context for the specified agent
 */
export function getConversationContext(agentName: AgentType): ConversationContext | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.CONVERSATION_CONTEXT}_${agentName}`);
    if (stored) {
      const context = JSON.parse(stored);
      // Convert lastActivity back to Date object
      context.lastActivity = new Date(context.lastActivity);
      return context;
    }
  } catch (error) {
    console.warn('Failed to read conversation context from localStorage:', error);
  }
  return null;
}

/**
 * Update conversation context for the specified agent
 */
export function updateConversationContext(
  agentName: AgentType, 
  threadId: string, 
  messageCount: number
): void {
  try {
    const context: ConversationContext = {
      threadId,
      agentName,
      lastActivity: new Date(),
      messageCount,
    };
    
    localStorage.setItem(
      `${STORAGE_KEYS.CONVERSATION_CONTEXT}_${agentName}`, 
      JSON.stringify(context)
    );
  } catch (error) {
    console.warn('Failed to save conversation context to localStorage:', error);
  }
}

/**
 * Clear conversation context for the specified agent
 */
export function clearConversationContext(agentName: AgentType): void {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.CONVERSATION_CONTEXT}_${agentName}`);
  } catch (error) {
    console.warn('Failed to clear conversation context from localStorage:', error);
  }
}

/**
 * Start a new conversation for the specified agent
 * Clears existing threadId and context, returns new threadId
 */
export function startNewConversation(agentName: AgentType): string {
  clearThreadId(agentName);
  clearConversationContext(agentName);
  return getThreadId(agentName); // This will generate a new one
}

/**
 * Generate a runId for individual agent executions
 * Format: {agentName}_{timestamp}_{random}
 */
export function generateRunId(agentName: AgentType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${agentName}_${timestamp}_${random}`;
}

/**
 * Check if a conversation is stale (older than specified hours)
 */
export function isConversationStale(context: ConversationContext, maxAgeHours: number = 24): boolean {
  const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
  const age = Date.now() - context.lastActivity.getTime();
  return age > maxAge;
}

/**
 * Clean up stale conversations across all agents
 */
export function cleanupStaleConversations(maxAgeHours: number = 24): void {
  const agents: AgentType[] = ['coreAgent', 'cfnAgent', 'documentationAgent'];
  
  agents.forEach(agentName => {
    const context = getConversationContext(agentName);
    if (context && isConversationStale(context, maxAgeHours)) {
      console.log(`Cleaning up stale conversation for ${agentName}`);
      clearThreadId(agentName);
      clearConversationContext(agentName);
    }
  });
}
