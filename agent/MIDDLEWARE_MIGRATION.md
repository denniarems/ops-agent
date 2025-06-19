# Mastra Middleware-Based RuntimeContext Migration

This document describes the migration from complex manual RuntimeContext management to a clean server middleware pattern for handling user context in the ZapGap Mastra application.

## Overview

The migration introduces a server middleware approach that automatically extracts user context from HTTP request headers and sets it in the RuntimeContext, making it available to all agents and workflows.

## What Changed

### Before (Complex Manual Approach)
- Manual context creation in each request handler
- Complex utility functions for context management
- Inconsistent context setup across endpoints
- Difficult to maintain and debug

### After (Middleware-Based Approach)
- Automatic context extraction from request headers
- Consistent context setup across all endpoints
- Clean separation of concerns
- Easy to maintain and extend

## New Architecture

### 1. User Context Types (`src/mastra/types/user-runtime-context.ts`)
- Defines TypeScript types for user context data
- Includes validation schemas using Zod
- Provides utility functions for context extraction

### 2. Middleware (`src/mastra/middleware/user-context-middleware.ts`)
- Extracts user context from request headers
- Sets RuntimeContext for use by agents
- Includes error handling and fallbacks

### 3. Updated Mastra Configuration (`src/mastra/index.ts`)
- Includes server middleware configuration
- Adds API routes that use the middleware
- Maintains backward compatibility with existing AWS context

### 4. Context Utilities (`src/mastra/utils/user-context-utils.ts`)
- Helper functions for working with user context
- Feature access control based on user tier
- Context validation and summary functions

## Usage

### Request Headers
The middleware extracts user context from these headers:
- `X-User-ID`: Unique user identifier
- `X-User-Tier`: User subscription tier (free, pro, enterprise)
- `X-Language`: User language preference (e.g., en, es, fr)

### API Endpoints
New API endpoints are available:
- `POST /chat`: Chat with agents using user context
- `GET /agents`: List available agents

### Example Request
```bash
curl -X POST http://localhost:4111/chat \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user-123" \
  -H "X-User-Tier: pro" \
  -H "X-Language: en" \
  -d '{"message": "How do I set up an S3 bucket?", "agentName": "coreAgent"}'
```

## Agent Updates

All agents have been updated to be user-context aware:

### Core Agent
- Provides responses tailored to user tier
- Supports multiple languages
- Adjusts complexity based on subscription level

### CloudFormation Agent
- Offers tier-appropriate CloudFormation solutions
- Includes security practices based on user level
- Provides cost-conscious recommendations for free tier

### Documentation Agent
- Delivers documentation appropriate for user tier
- Supports multiple languages
- Adjusts detail level based on subscription

## User Tiers and Features

### Free Tier
- Basic responses with simple examples
- Cost-conscious recommendations
- Limited feature access
- 100 requests/month, 3 agents, 5 workflows

### Pro Tier
- Professional-level responses
- Practical implementation guidance
- Priority support
- 1,000 requests/month, 10 agents, 20 workflows

### Enterprise Tier
- Comprehensive enterprise solutions
- Advanced configurations and security
- Custom integrations
- 10,000 requests/month, 50 agents, 100 workflows

## Migration Benefits

1. **Simplified Context Management**: No more manual context creation
2. **Consistency**: Same context setup across all endpoints
3. **Maintainability**: Single source of truth for context logic
4. **Extensibility**: Easy to add new context fields
5. **Error Handling**: Built-in validation and fallbacks
6. **Performance**: Minimal overhead with efficient middleware
7. **Backward Compatibility**: Existing AWS context continues to work

## Development

### Running the Application
```bash
# Install dependencies
bun install

# Start development server
bun run dev:agent
```

### Testing the Middleware
```bash
# Run the example usage file
bun run agent/src/mastra/examples/middleware-usage.ts
```

### Adding New Context Fields
1. Update `user-runtime-context.ts` with new schema
2. Update middleware to extract new headers
3. Update agents to use new context data

## Deployment

The middleware-based approach works seamlessly with:
- Local development
- Docker containers
- Cloudflare Workers
- Vercel/Netlify serverless functions

## Security Considerations

- Headers are validated using Zod schemas
- Default values prevent injection attacks
- User context is scoped per request
- No sensitive data stored in context

## Future Enhancements

- Database integration for user tier lookup
- JWT token support for authentication
- Rate limiting based on user tier
- Advanced feature flags per user
- Audit logging for context usage

## Support

For questions about the middleware migration:
1. Check the examples in `src/mastra/examples/middleware-usage.ts`
2. Review the utility functions in `src/mastra/utils/user-context-utils.ts`
3. Examine the middleware implementation in `src/mastra/middleware/user-context-middleware.ts`
