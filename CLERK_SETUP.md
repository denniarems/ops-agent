# Clerk Authentication Setup Guide

This guide walks you through setting up Clerk authentication for both the client and server applications in the ZapGap workspace.

## Prerequisites

1. **Clerk Account**: Sign up at [https://clerk.com](https://clerk.com)
2. **Bun Package Manager**: Ensure bun is installed and configured
3. **Environment Variables**: Access to set environment variables for both client and server

## 1. Clerk Dashboard Configuration

### Create a New Application
1. Log into your Clerk Dashboard
2. Click "Add application"
3. Choose your application name (e.g., "ZapGap")
4. Select the authentication methods you want to enable:
   - Email/Password
   - Google OAuth (recommended)
   - GitHub OAuth (optional)
   - Other providers as needed

### Get Your Keys
After creating the application, you'll need these keys:
- **Publishable Key**: Starts with `pk_test_` or `pk_live_`
- **Secret Key**: Starts with `sk_test_` or `sk_live_`

## 2. Environment Configuration

### Client Environment Variables
Create or update `client/.env.local`:

```bash
# Clerk Authentication Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Server Configuration
VITE_SERVER_URL=http://localhost:8787

# Development Configuration
VITE_NODE_ENV=development
```

### Server Environment Variables
Create or update `server/.env`:

```bash
# Clerk Authentication Configuration
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Authorized parties for JWT verification (comma-separated)
CLERK_AUTHORIZED_PARTIES=http://localhost:8080,https://yourdomain.com

# Mastra Agent Configuration
MASTRA_AGENT_URL=http://localhost:4111

# Environment Configuration
NODE_ENV=development
```

## 3. Installation Verification

The required packages should already be installed:

### Client Dependencies
- `@clerk/clerk-react` - Already installed in client/package.json

### Server Dependencies
- `@clerk/backend` - Installed during setup

## 4. Authentication Flow

### Client-Side Authentication
The client application now includes:

1. **ClerkProvider**: Wraps the entire app in `main.tsx`
2. **AuthButton Component**: Unified authentication UI component
3. **ProtectedRoute Component**: Protects routes requiring authentication
4. **useAuthenticatedFetch Hook**: Makes authenticated API requests

### Server-Side Authentication
The server application includes:

1. **Clerk Middleware**: Validates JWT tokens and extracts user context
2. **Enhanced Runtime Context**: Includes user authentication status and details
3. **Protected Endpoints**: Can be secured using the `requireAuth` middleware

## 5. Usage Examples

### Protecting a Route (Client)
```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute'

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Making Authenticated Requests (Client)
```tsx
import useAuthenticatedFetch from '@/hooks/useAuthenticatedFetch'

const { authenticatedFetch } = useAuthenticatedFetch()

const response = await authenticatedFetch('/api/protected-endpoint', {
  method: 'POST',
  body: { data: 'example' }
})
```

### Accessing User Context (Server)
```typescript
app.get('/api/user-info', async (c) => {
  const runtimeContext = c.get('runtimeContext')
  
  if (runtimeContext['is-authenticated']) {
    const userEmail = runtimeContext['user-email']
    const userTier = runtimeContext['user-tier']
    // Use authenticated user data
  }
  
  return c.json({ context: runtimeContext })
})
```

## 6. User Tiers and Metadata

### Setting User Tiers
User tiers can be set in Clerk's user metadata:

1. Go to Clerk Dashboard → Users
2. Select a user
3. Add to Public Metadata:
```json
{
  "tier": "pro"
}
```

Supported tiers: `free`, `pro`, `enterprise`

### Accessing User Metadata
The server middleware automatically extracts the user tier from Clerk metadata and includes it in the runtime context.

## 7. Testing the Integration

### Test Authentication Flow
1. Start both client and server applications
2. Navigate to the client application
3. Try accessing the dashboard (should redirect to sign-in)
4. Sign up/sign in with your configured methods
5. Verify you can access protected routes
6. Check server logs for authentication context

### Test API Communication
1. Make requests to server endpoints
2. Verify JWT tokens are being passed correctly
3. Check that user context is properly extracted
4. Test both authenticated and anonymous access

## 8. Troubleshooting

### Common Issues

**"Missing Clerk Publishable Key" Error**
- Ensure `VITE_CLERK_PUBLISHABLE_KEY` is set in client environment
- Restart the client development server after adding the variable

**"Authentication failed" on Server**
- Verify `CLERK_SECRET_KEY` is correct in server environment
- Check that the JWT token is being passed in the Authorization header
- Ensure `CLERK_AUTHORIZED_PARTIES` includes your client URL

**CORS Issues**
- Verify the server CORS configuration includes your client URL
- Check that the Authorization header is allowed in CORS settings

### Debug Mode
Enable debug logging by setting:
```bash
# Server
DEBUG=clerk:*

# Client
VITE_DEBUG=true
```

## 9. Production Deployment

### Environment Variables
- Replace `pk_test_` and `sk_test_` keys with production keys (`pk_live_`, `sk_live_`)
- Update `CLERK_AUTHORIZED_PARTIES` with your production domain
- Set `NODE_ENV=production` on the server

### Security Considerations
- Never expose secret keys in client-side code
- Use HTTPS in production
- Regularly rotate your Clerk secret keys
- Monitor authentication logs for suspicious activity

## 10. Next Steps

### Enhanced Features
- Implement role-based access control
- Add organization support
- Set up webhooks for user events
- Integrate with your billing system for tier management

### Monitoring
- Set up Clerk webhook endpoints for user events
- Monitor authentication metrics in Clerk Dashboard
- Implement logging for authentication failures

For more information, refer to the [Clerk Documentation](https://clerk.com/docs).
