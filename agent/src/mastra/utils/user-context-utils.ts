import { RuntimeContext } from '@mastra/core/runtime-context';
import { UserRuntimeContext, UserTier, Language, UserId } from '../types/user-runtime-context';

/**
 * User Context Utility Functions
 * 
 * This module provides utility functions for extracting and managing
 * user context from RuntimeContext instances in Mastra agents and tools.
 */

/**
 * Extracts user tier from runtime context
 */
export function getUserTierFromContext(runtimeContext: RuntimeContext<any>): UserTier {
  try {
    const tier = runtimeContext.get('user-tier');
    return tier || 'free';
  } catch (error) {
    console.warn('Failed to get user tier from context:', error);
    return 'free';
  }
}

/**
 * Extracts user language from runtime context
 */
export function getUserLanguageFromContext(runtimeContext: RuntimeContext<any>): Language {
  try {
    const language = runtimeContext.get('language');
    return language || 'en';
  } catch (error) {
    console.warn('Failed to get user language from context:', error);
    return 'en';
  }
}

/**
 * Extracts user ID from runtime context
 */
export function getUserIdFromContext(runtimeContext: RuntimeContext<any>): UserId {
  try {
    const userId = runtimeContext.get('user-id');
    return userId || 'anonymous';
  } catch (error) {
    console.warn('Failed to get user ID from context:', error);
    return 'anonymous';
  }
}

/**
 * Extracts complete user context from runtime context
 */
export function getUserContextFromRuntimeContext(runtimeContext: RuntimeContext<any>): UserRuntimeContext {
  return {
    'user-tier': getUserTierFromContext(runtimeContext),
    'language': getUserLanguageFromContext(runtimeContext),
    'user-id': getUserIdFromContext(runtimeContext),
  };
}

/**
 * Checks if user has access to a feature based on their tier
 */
export function hasFeatureAccess(userTier: UserTier, requiredTier: UserTier): boolean {
  const tierLevels = {
    'free': 0,
    'pro': 1,
    'enterprise': 2,
  };

  return tierLevels[userTier] >= tierLevels[requiredTier];
}

/**
 * Checks if user has access to a feature using runtime context
 */
export function hasFeatureAccessFromContext(
  runtimeContext: RuntimeContext<any>, 
  requiredTier: UserTier
): boolean {
  const userTier = getUserTierFromContext(runtimeContext);
  return hasFeatureAccess(userTier, requiredTier);
}

/**
 * Gets feature limits based on user tier
 */
export function getFeatureLimits(userTier: UserTier) {
  switch (userTier) {
    case 'enterprise':
      return {
        maxRequests: 10000,
        maxAgents: 50,
        maxWorkflows: 100,
        prioritySupport: true,
        customIntegrations: true,
      };
    case 'pro':
      return {
        maxRequests: 1000,
        maxAgents: 10,
        maxWorkflows: 20,
        prioritySupport: true,
        customIntegrations: false,
      };
    case 'free':
    default:
      return {
        maxRequests: 100,
        maxAgents: 3,
        maxWorkflows: 5,
        prioritySupport: false,
        customIntegrations: false,
      };
  }
}

/**
 * Gets feature limits from runtime context
 */
export function getFeatureLimitsFromContext(runtimeContext: RuntimeContext<any>) {
  const userTier = getUserTierFromContext(runtimeContext);
  return getFeatureLimits(userTier);
}

/**
 * Creates a user-friendly context summary for logging
 */
export function createContextSummary(runtimeContext: RuntimeContext<any>): string {
  const userContext = getUserContextFromRuntimeContext(runtimeContext);
  return `User: ${userContext['user-id']} (${userContext['user-tier']}, ${userContext['language']})`;
}

/**
 * Validates that required user context is present
 */
export function validateUserContextPresent(runtimeContext: RuntimeContext<any>): boolean {
  try {
    const userId = runtimeContext.get('user-id');
    const userTier = runtimeContext.get('user-tier');
    const language = runtimeContext.get('language');
    
    return !!(userId && userTier && language);
  } catch {
    return false;
  }
}

/**
 * Sets user context in runtime context (for testing or manual setup)
 */
export function setUserContextInRuntimeContext(
  runtimeContext: RuntimeContext<any>,
  userContext: UserRuntimeContext
): void {
  runtimeContext.set('user-tier', userContext['user-tier']);
  runtimeContext.set('language', userContext['language']);
  runtimeContext.set('user-id', userContext['user-id']);
}
