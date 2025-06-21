# Caddy Reverse Proxy Setup

This document explains the Caddy reverse proxy configuration for the ZapGap application.

## Overview

Caddy is configured as a reverse proxy that:
- Handles SSL/TLS termination automatically with Let's Encrypt
- Routes incoming requests to the backend server service
- Provides security headers and error handling
- Includes health checks and proper logging
- Manages CORS for development

## Architecture

```
Internet → Caddy (Port 80/443) → Server Service (Port 3000) → Agent Service (Port 4111)
```

## Files

- `Caddyfile` - Development configuration (HTTP only, localhost)
- `Caddyfile.production` - Production configuration (HTTPS with Let's Encrypt)
- `docker-compose.yml` - Updated with Caddy service

## Development Setup

The default `Caddyfile` is configured for development:

- **HTTP only** (no HTTPS)
- **Port 80** exposed
- **CORS enabled** for development
- **Local certificates** disabled
- **Admin interface** disabled for security

### Starting the Services

```bash
# Start all services including Caddy
docker-compose up -d

# Check Caddy logs
docker-compose logs -f caddy

# Check service health
docker-compose ps
```

### Accessing the Application

- **Application**: http://localhost
- **Health Check**: http://localhost/health

## Production Setup

For production deployment:

1. **Copy the production Caddyfile**:
   ```bash
   cp Caddyfile.production Caddyfile
   ```

2. **Update the domain**:
   - Replace `your-domain.com` with your actual domain
   - Replace `your-email@example.com` with your email for Let's Encrypt

3. **Environment Variables** (optional):
   Create a `.env.production` file:
   ```env
   CADDY_DOMAIN=your-domain.com
   CADDY_EMAIL=your-email@example.com
   ```

4. **Deploy**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## Security Features

### Headers Applied

- **HSTS**: HTTP Strict Transport Security
- **CSP**: Content Security Policy
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **CORS**: Configured for development

### SSL/TLS

- **Automatic certificates** via Let's Encrypt
- **HTTP to HTTPS redirect**
- **Modern TLS configuration**

## Health Checks

Caddy includes health checks for:
- **Upstream server** (server:3000/health)
- **Caddy itself** (localhost:80/health)

## Logging

Logs are configured to:
- **Output to stdout** for Docker logging
- **Console format** for readability
- **INFO level** for production

View logs:
```bash
# All services
docker-compose logs -f

# Caddy only
docker-compose logs -f caddy

# Server only
docker-compose logs -f server
```

## Troubleshooting

### Common Issues

1. **Port 80/443 already in use**:
   ```bash
   # Check what's using the ports
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :443
   
   # Stop conflicting services
   sudo systemctl stop apache2
   sudo systemctl stop nginx
   ```

2. **Certificate issues**:
   ```bash
   # Clear Caddy data
   docker-compose down
   docker volume rm zapgap-caddy-data zapgap-caddy-config
   docker-compose up -d
   ```

3. **Backend connection issues**:
   ```bash
   # Check server health
   docker-compose exec server curl http://localhost:3000/health
   
   # Check network connectivity
   docker-compose exec caddy wget -O- http://server:3000/health
   ```

### Debug Mode

Enable debug logging:

1. Edit `Caddyfile` and change:
   ```
   level INFO
   ```
   to:
   ```
   level DEBUG
   ```

2. Restart Caddy:
   ```bash
   docker-compose restart caddy
   ```

## Customization

### Adding Rate Limiting

Uncomment the rate limiting section in `Caddyfile.production`:

```caddyfile
rate_limit {
    zone static {
        key {remote_host}
        events 100
        window 1m
    }
}
```

### Custom Error Pages

Add custom error handling:

```caddyfile
handle_errors {
    rewrite * /error.html
    file_server
}
```

### Additional Security Headers

Add more security headers as needed:

```caddyfile
header {
    # Add your custom headers here
    X-Custom-Header "value"
}
```

## Monitoring

### Health Check Endpoints

- **Caddy**: http://localhost/health
- **Server**: http://localhost/health (proxied)
- **Direct Server**: http://localhost:3001/health (development only)

### Metrics

Caddy can be configured with metrics endpoints for monitoring tools like Prometheus.

## Backup and Recovery

### Certificate Backup

Certificates are stored in Docker volumes:
- `zapgap-caddy-data`
- `zapgap-caddy-config`

Backup:
```bash
docker run --rm -v zapgap-caddy-data:/data -v $(pwd):/backup alpine tar czf /backup/caddy-data.tar.gz -C /data .
docker run --rm -v zapgap-caddy-config:/config -v $(pwd):/backup alpine tar czf /backup/caddy-config.tar.gz -C /config .
```

Restore:
```bash
docker run --rm -v zapgap-caddy-data:/data -v $(pwd):/backup alpine tar xzf /backup/caddy-data.tar.gz -C /data
docker run --rm -v zapgap-caddy-config:/config -v $(pwd):/backup alpine tar xzf /backup/caddy-config.tar.gz -C /config
```
