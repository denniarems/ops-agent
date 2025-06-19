/**
 * Example Usage of Middleware-Based RuntimeContext
 * 
 * This file demonstrates how to use the new server middleware approach
 * for setting RuntimeContext instead of manual context management.
 */

import { mastra } from '../index';

/**
 * Example 1: Using the Chat API with User Context Headers
 * 
 * The middleware automatically extracts user context from headers and
 * makes it available to agents via RuntimeContext.
 */
export async function exampleChatWithUserContext() {
  // Simulate a request with user context headers
  const headers = {
    'X-User-ID': 'user-123',
    'X-User-Tier': 'pro',
    'X-Language': 'en',
    'Content-Type': 'application/json',
  };

  // The middleware will automatically:
  // 1. Extract user context from headers
  // 2. Set RuntimeContext with user-tier, language, and user-id
  // 3. Make this context available to agents

  console.log('Example: Chat API with user context headers');
  console.log('Headers:', headers);
  console.log('The middleware will automatically set RuntimeContext for agents');
}

/**
 * Example 2: Different User Tiers
 * 
 * Shows how different user tiers get different levels of service
 */
export async function exampleDifferentUserTiers() {
  const examples = [
    {
      tier: 'free',
      userId: 'free-user-456',
      language: 'en',
      description: 'Free tier user gets basic responses'
    },
    {
      tier: 'pro',
      userId: 'pro-user-789',
      language: 'es',
      description: 'Pro tier user gets professional responses in Spanish'
    },
    {
      tier: 'enterprise',
      userId: 'enterprise-user-101',
      language: 'en',
      description: 'Enterprise user gets comprehensive responses'
    }
  ];

  console.log('Example: Different user tiers and languages');
  examples.forEach(example => {
    console.log(`${example.tier} user (${example.language}): ${example.description}`);
  });
}

/**
 * Example 3: API Endpoint Usage
 * 
 * Shows how to call the new API endpoints that use middleware-based context
 */
export async function exampleApiEndpoints() {
  const baseUrl = 'http://localhost:4111';
  
  // Example API calls with different user contexts
  const apiExamples = [
    {
      endpoint: '/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': 'demo-user',
        'X-User-Tier': 'pro',
        'X-Language': 'en'
      },
      body: {
        message: 'How do I set up an S3 bucket?',
        agentName: 'coreAgent'
      }
    },
    {
      endpoint: '/agents',
      method: 'GET',
      headers: {
        'X-User-ID': 'demo-user',
        'X-User-Tier': 'free',
        'X-Language': 'es'
      }
    }
  ];

  console.log('Example: API endpoints with user context');
  apiExamples.forEach((example, index) => {
    console.log(`\nAPI Call ${index + 1}:`);
    console.log(`${example.method} ${baseUrl}${example.endpoint}`);
    console.log('Headers:', example.headers);
    if (example.body) {
      console.log('Body:', example.body);
    }
  });
}

/**
 * Example 4: Testing User Context Utilities
 * 
 * Shows how to use the utility functions for working with user context
 */
export async function exampleUserContextUtilities() {
  // Import utilities
  const { 
    hasFeatureAccess, 
    getFeatureLimits, 
    createContextSummary 
  } = await import('../utils/user-context-utils');

  console.log('Example: User context utilities');
  
  // Test feature access
  console.log('\nFeature Access Tests:');
  console.log('Free user can access pro features:', hasFeatureAccess('free', 'pro'));
  console.log('Pro user can access pro features:', hasFeatureAccess('pro', 'pro'));
  console.log('Enterprise user can access pro features:', hasFeatureAccess('enterprise', 'pro'));

  // Test feature limits
  console.log('\nFeature Limits:');
  ['free', 'pro', 'enterprise'].forEach(tier => {
    const limits = getFeatureLimits(tier as any);
    console.log(`${tier} tier limits:`, limits);
  });
}

/**
 * Example 5: Migration Benefits
 * 
 * Shows the benefits of the new middleware approach vs. old manual approach
 */
export function exampleMigrationBenefits() {
  console.log('Migration Benefits:');
  console.log('');
  
  console.log('BEFORE (Manual Context Management):');
  console.log('- Complex context creation in each request handler');
  console.log('- Manual extraction of user data from various sources');
  console.log('- Inconsistent context setup across different endpoints');
  console.log('- Difficult to maintain and debug');
  console.log('- Code duplication for context management');
  
  console.log('');
  console.log('AFTER (Middleware-Based Context):');
  console.log('- Automatic context extraction from request headers');
  console.log('- Consistent context setup across all endpoints');
  console.log('- Clean separation of concerns');
  console.log('- Easy to maintain and extend');
  console.log('- Single source of truth for context management');
  console.log('- Built-in validation and error handling');
  console.log('- Seamless integration with existing AWS context');
}

// Run examples if this file is executed directly
if (import.meta.main) {
  console.log('=== Mastra Middleware-Based RuntimeContext Examples ===\n');
  
  await exampleChatWithUserContext();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exampleDifferentUserTiers();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exampleApiEndpoints();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await exampleUserContextUtilities();
  console.log('\n' + '='.repeat(50) + '\n');
  
  exampleMigrationBenefits();
}
