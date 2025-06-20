/**
 * Example usage of the Mastra Agent Streaming API
 * 
 * This file demonstrates how to use the streaming endpoints
 * from both client-side and server-side perspectives.
 */

import { ofetch } from 'ofetch'

// Example 1: Basic streaming request
export async function basicStreamingExample(authToken: string) {
  try {
    const response = await ofetch('http://localhost:8787/api/streaming/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        agentName: 'cfnAgent',
        messages: [
          {
            role: 'user',
            content: 'Create a simple S3 bucket with versioning enabled'
          }
        ],
        maxRetries: 2,
        maxSteps: 5,
        temperature: 0.5
      },
      responseType: 'stream'
    })
    
    console.log('Streaming response received:', response)
    return response
  } catch (error) {
    console.error('Streaming error:', error)
    throw error
  }
}

// Example 2: Advanced streaming with custom parameters
export async function advancedStreamingExample(authToken: string) {
  try {
    const threadId = `thread-${Date.now()}`
    
    const response = await ofetch('http://localhost:8787/api/streaming/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        agentName: 'cfnAgent',
        messages: [
          {
            role: 'system',
            content: 'You are an AWS CloudFormation expert. Always provide secure and best-practice configurations.'
          },
          {
            role: 'user',
            content: 'Create a VPC with public and private subnets, including NAT gateway and security groups'
          }
        ],
        threadId,
        runId: `cfn-vpc-${Date.now()}`,
        maxRetries: 3,
        maxSteps: 10,
        temperature: 0.3,
        topP: 0.9,
        resourceId: 'vpc-creation-task'
      },
      responseType: 'stream'
    })
    
    console.log('Advanced streaming response received:', response)
    return response
  } catch (error) {
    console.error('Advanced streaming error:', error)
    throw error
  }
}

// Example 3: Get available agents
export async function getAvailableAgents(authToken: string) {
  try {
    const response = await ofetch('http://localhost:8787/api/streaming/agents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    console.log('Available agents:', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching agents:', error)
    throw error
  }
}

// Example 4: Health check
export async function checkStreamingHealth() {
  try {
    const response = await ofetch('http://localhost:8787/api/streaming/health', {
      method: 'GET'
    })
    
    console.log('Streaming service health:', response)
    return response
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}

// Example 5: Frontend React component usage pattern
export const ReactStreamingExample = `
import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

function MastraAgentChat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (content: string) => {
    setIsStreaming(true);
    setStreamingContent('');
    
    try {
      const token = await getToken();
      
      const response = await fetch('/api/streaming/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({
          agentName: 'cfnAgent',
          messages: [
            ...messages,
            { role: 'user', content }
          ]
        })
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setStreamingContent(prev => prev + chunk);
      }
      
      // Add completed message to chat history
      setMessages(prev => [
        ...prev,
        { role: 'user', content },
        { role: 'assistant', content: streamingContent }
      ]);
      
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div>
      {/* Chat UI implementation */}
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={\`message \${msg.role}\`}>
            {msg.content}
          </div>
        ))}
        {isStreaming && (
          <div className="message assistant streaming">
            {streamingContent}
          </div>
        )}
      </div>
      
      <input 
        type="text" 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(e.target.value);
            e.target.value = '';
          }
        }}
        disabled={isStreaming}
        placeholder="Type your message..."
      />
    </div>
  );
}

export default MastraAgentChat;
`;

// Example 6: Error handling patterns
export async function robustStreamingExample(authToken: string) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await ofetch('http://localhost:8787/api/streaming/stream', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          agentName: 'cfnAgent',
          messages: [
            {
              role: 'user',
              content: 'Create a Lambda function with API Gateway'
            }
          ]
        },
        responseType: 'stream',
        timeout: 30000, // 30 second timeout
      })
      
      return response
    } catch (error) {
      attempt++
      console.error(\`Streaming attempt \${attempt} failed:\`, error)
      
      if (attempt >= maxRetries) {
        throw new Error(\`Failed after \${maxRetries} attempts: \${error.message}\`)
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}

// Example 7: Batch processing multiple requests
export async function batchStreamingExample(authToken: string, requests: Array<{agentName: string, content: string}>) {
  const results = []
  
  for (const request of requests) {
    try {
      const response = await ofetch('http://localhost:8787/api/streaming/stream', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${authToken}\`,
          'Content-Type': 'application/json'
        },
        body: {
          agentName: request.agentName,
          messages: [
            {
              role: 'user',
              content: request.content
            }
          ]
        },
        responseType: 'stream'
      })
      
      results.push({ success: true, response, request })
    } catch (error) {
      results.push({ success: false, error, request })
    }
    
    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  return results
}
