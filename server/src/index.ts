import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Tier', 'X-Language'],
  credentials: false,
}))

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'ZapGap Server with Mastra Middleware',
    timestamp: new Date().toISOString()
  })
})

// Health endpoint for monitoring
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'zapgap-server',
    timestamp: new Date().toISOString()
  })
})

export default app
