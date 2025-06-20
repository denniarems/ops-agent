# 🛠️ Ephemeral Pods Implementation Guide

## 🚀 Quick Start Implementation

This guide provides step-by-step instructions to implement ephemeral AI agent pods in your ZapGap project.

### Prerequisites

- Cloudflare Workers account with Durable Objects enabled
- Fly.io account for container hosting
- Docker installed for building container images
- Current ZapGap monorepo setup

---

## Step 1: Update Server Infrastructure

### 1.1 Install Dependencies

```bash
cd server
bun add @cloudflare/workers-types
```

### 1.2 Create Durable Object

Create `server/src/durable-objects/AgentSession.ts`:

```typescript
export interface Env {
  AGENT_SESSION: DurableObjectNamespace
  FLY_API_TOKEN: string
  ANTHROPIC_API_KEY: string
}

export class AgentSession {
  private state: DurableObjectState
  private env: Env

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.env = env
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    
    switch (url.pathname) {
      case '/create':
        return this.handleCreate()
      case '/message':
        return this.handleMessage(request)
      case '/terminate':
        return this.handleTerminate()
      default:
        return new Response('Not Found', { status: 404 })
    }
  }

  private async handleCreate(): Promise<Response> {
    const sessionId = crypto.randomUUID()
    
    // For now, return mock data - we'll implement container spawning later
    const sessionData = {
      id: sessionId,
      status: 'active',
      createdAt: Date.now(),
      endpoint: `mock-endpoint-${sessionId}`
    }
    
    await this.state.storage.put('session', sessionData)
    
    return new Response(JSON.stringify(sessionData), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  private async handleMessage(request: Request): Promise<Response> {
    const { message } = await request.json()
    const sessionData = await this.state.storage.get('session')
    
    if (!sessionData) {
      return new Response('Session not found', { status: 404 })
    }

    // Mock response for now
    const response = {
      response: `Echo: ${message}`,
      sessionId: sessionData.id
    }
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  private async handleTerminate(): Promise<Response> {
    await this.state.storage.delete('session')
    return new Response(JSON.stringify({ status: 'terminated' }))
  }
}
```

### 1.3 Update Main Server File

Update `server/src/index.ts`:

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

export { AgentSession } from './durable-objects/AgentSession'

interface Env {
  AGENT_SESSION: DurableObjectNamespace
  FLY_API_TOKEN: string
  ANTHROPIC_API_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

// Health check
app.get('/', (c) => {
  return c.text('ZapGap Server with Ephemeral Pods')
})

// Session management endpoints
app.post('/api/sessions', async (c) => {
  const id = c.env.AGENT_SESSION.idFromName(crypto.randomUUID())
  const obj = c.env.AGENT_SESSION.get(id)
  
  const response = await obj.fetch('http://localhost/create', {
    method: 'POST'
  })
  
  return response
})

app.post('/api/sessions/:sessionId/messages', async (c) => {
  const sessionId = c.req.param('sessionId')
  const body = await c.req.json()
  
  const id = c.env.AGENT_SESSION.idFromName(sessionId)
  const obj = c.env.AGENT_SESSION.get(id)
  
  const response = await obj.fetch('http://localhost/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  return response
})

app.delete('/api/sessions/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId')
  
  const id = c.env.AGENT_SESSION.idFromName(sessionId)
  const obj = c.env.AGENT_SESSION.get(id)
  
  const response = await obj.fetch('http://localhost/terminate', {
    method: 'DELETE'
  })
  
  return response
})

export default app
```

### 1.4 Update Wrangler Configuration

Update `server/wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "zapgap-server",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-15",
  "durable_objects": {
    "bindings": [
      {
        "name": "AGENT_SESSION",
        "class_name": "AgentSession",
        "script_name": "zapgap-server"
      }
    ]
  },
  "vars": {
    "FLY_API_TOKEN": "",
    "ANTHROPIC_API_KEY": ""
  }
}
```

---

## Step 2: Update Frontend Integration

### 2.1 Create Session Service

Create `client/src/services/SessionService.ts`:

```typescript
export interface Session {
  id: string
  status: string
  createdAt: number
  endpoint: string
}

export interface AgentResponse {
  response: string
  sessionId: string
}

export class SessionService {
  private baseUrl = '/api'
  
  async createSession(): Promise<Session> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error('Failed to create session')
    }
    
    return response.json()
  }
  
  async sendMessage(sessionId: string, message: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    
    if (!response.ok) {
      throw new Error('Failed to send message')
    }
    
    return response.json()
  }
  
  async terminateSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('Failed to terminate session')
    }
  }
}
```

### 2.2 Update Demo Page

Update `client/src/pages/Demo.tsx` to use the new session service:

```typescript
import { useState, useEffect } from 'react'
import { SessionService } from '@/services/SessionService'

const sessionService = new SessionService()

export default function Demo() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{id: string, content: string, sender: 'user' | 'assistant'}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Create session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await sessionService.createSession()
        setSessionId(session.id)
        console.log('Session created:', session.id)
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    }
    
    initSession()
    
    // Cleanup session on unmount
    return () => {
      if (sessionId) {
        sessionService.terminateSession(sessionId).catch(console.error)
      }
    }
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isLoading) return
    
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user' as const
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      const response = await sessionService.sendMessage(sessionId, input)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'assistant' as const
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant' as const
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ZapGap AI Agent Demo</h1>
        
        {sessionId && (
          <div className="mb-4 text-sm text-gray-400">
            Session ID: {sessionId}
          </div>
        )}
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6 h-96 overflow-y-auto">
          {messages.map(message => (
            <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg max-w-xs ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block p-3 rounded-lg bg-gray-700 text-gray-100">
                Thinking...
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            disabled={!sessionId || isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!sessionId || isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## Step 3: Test the Basic Implementation

### 3.1 Deploy and Test

```bash
# Deploy the server
cd server
bun run deploy

# Start the client
cd ../client
bun run dev
```

### 3.2 Test Session Creation

Visit the demo page and check the browser console. You should see:
- Session creation logs
- Session ID displayed
- Echo responses when sending messages

---

## Step 4: Next Steps

Once the basic implementation is working:

1. **Implement Container Integration**: Replace mock responses with actual Fly.io container spawning
2. **Add Mastra Agent**: Create containerized version of your Mastra agents
3. **Implement TTL Cleanup**: Add automatic session termination
4. **Add Monitoring**: Implement health checks and metrics
5. **Performance Testing**: Test with multiple concurrent sessions

This basic implementation provides the foundation for ephemeral agent pods while maintaining your existing architecture.
