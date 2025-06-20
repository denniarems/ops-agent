# Mastra Agent API

This module provides standard JSON communication with Mastra agents, including AWS credentials integration and proper authentication.

## Endpoints

### POST /api/streaming/stream

Standard JSON communication with a Mastra agent.

**Authentication:** Required (Clerk JWT token)

**Request Body:**
```json
{
  "agentName": "cfnAgent",
  "messages": [
    {
      "role": "user",
      "content": "Create a simple S3 bucket"
    }
  ],
  "threadId": "optional-thread-id",
  "runId": "optional-run-id",
  "maxRetries": 2,
  "maxSteps": 5,
  "temperature": 0.5,
  "topP": 1,
  "resourceId": "optional-resource-id"
}
```

**Response:** JSON response from the Mastra agent
```json
{
  "message": "I'll help you create a simple S3 bucket...",
  "success": true,
  "agentName": "cfnAgent",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

**Example using fetch:**
```javascript
const response = await fetch('/api/streaming/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${clerkToken}`
  },
  body: JSON.stringify({
    agentName: 'cfnAgent',
    messages: [
      {
        role: 'user',
        content: 'Create a simple S3 bucket'
      }
    ]
  })
});

// Handle JSON response
const data = await response.json();
console.log('Agent response:', data.message);
console.log('Success:', data.success);
```

### GET /api/streaming/agents

List available agents from the Mastra agent server.

**Authentication:** Required (Clerk JWT token)

**Response:**
```json
{
  "data": ["cfnAgent", "docAgent", "otherAgent"],
  "message": "Available agents retrieved successfully"
}
```

### GET /api/streaming/health

Check connectivity to the Mastra agent server.

**Authentication:** Not required

**Response:**
```json
{
  "status": "healthy",
  "service": "mastra-agent-api",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "mastraAgent": {
    "status": "connected",
    "url": "http://localhost:4111",
    "lastCheck": "2025-01-20T10:30:00.000Z"
  }
}
```

## Environment Variables

- `MASTRA_AGENT_URL`: Base URL for the Mastra agent server (default: http://localhost:4111)
- `SUPABASE_KEY`: Supabase service key for AWS credentials retrieval
- `CLERK_SECRET_KEY`: Clerk secret key for authentication

## AWS Credentials Integration

The API automatically retrieves AWS credentials from Supabase for authenticated users and passes them via HTTP headers to the Mastra agent:

**Headers sent to Mastra agent:**
```
X-AWS-Access-Key-ID: AKIA...
X-AWS-Secret-Access-Key: ...
X-AWS-Region: us-east-1
Content-Type: application/json
```

**Runtime context payload:**
```json
{
  "runtimeContext": {
    "user-tier": "pro",
    "language": "en",
    "user-id": "user_123",
    "is-authenticated": true
  }
}
```

The Mastra agent uses `awsHeaderContextMiddleware` to extract AWS credentials from headers and set them in the runtime context as `aws-credentials`.

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Validation errors in request body
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Server errors or Mastra agent communication failures

## Security Considerations

- All endpoints require authentication except `/health`
- AWS credentials are securely retrieved from Supabase
- JSON responses maintain secure headers
- Request validation prevents malformed payloads

## Usage Examples

### React Component Example

```typescript
import { useAuth } from '@clerk/nextjs';

function ChatWithAgent() {
  const { getToken } = useAuth();

  const chatWithAgent = async (message: string) => {
    const token = await getToken();

    const response = await fetch('/api/streaming/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        agentName: 'cfnAgent',
        messages: [{ role: 'user', content: message }]
      })
    });

    // Handle JSON response
    const data = await response.json();
    if (data.success) {
      // Update UI with agent response
      setAgentResponse(data.message);
    } else {
      console.error('Agent error:', data.error);
    }
  };

  return (
    // Your component JSX
  );
}
```

### Node.js Client Example

```javascript
import { ofetch } from 'ofetch';

async function chatWithMastraAgent(agentName, messages, authToken) {
  try {
    const response = await ofetch('/api/streaming/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: {
        agentName,
        messages,
        maxRetries: 3,
        maxSteps: 10,
        temperature: 0.7
      }
    });

    return response.message;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}
```

## Header-Based AWS Credentials Flow

The API uses a header-based approach for passing AWS credentials:

1. **Server retrieves** AWS credentials from Supabase for authenticated users
2. **Server adds** AWS credentials to HTTP headers when calling Mastra agent:
   - `X-AWS-Access-Key-ID`: AWS Access Key ID
   - `X-AWS-Secret-Access-Key`: AWS Secret Access Key
   - `X-AWS-Region`: AWS Region (optional)
3. **Agent middleware** (`awsHeaderContextMiddleware`) extracts credentials from headers
4. **Agent middleware** sets credentials in runtime context as `aws-credentials`
5. **Agent tools** access credentials via `runtimeContext.get('aws-credentials')`

This approach provides:
- **Security**: Credentials are not logged in request payloads
- **Flexibility**: Easy to modify or extend credential handling
- **Compatibility**: Works with existing agent middleware patterns
