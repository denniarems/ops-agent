# ZapGap Agent Docker Setup

This directory contains the Docker configuration for the ZapGap Agent service, including Dockerfile, docker-compose.yml, and environment configuration.

## Quick Start

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file with your AWS credentials:**
   ```bash
   # Required: Add your AWS credentials
   AWS_ACCESS_KEY_ID=your_actual_access_key_id
   AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key
   
   # Optional: Set your preferred AWS region
   AWS_DEFAULT_REGION=us-west-2
   ```

3. **Build and run with Docker Compose:**
   ```bash
   # Build the image
   docker-compose build
   
   # Start the service
   docker-compose up -d
   
   # View logs
   docker-compose logs -f zapgap-agent
   ```

4. **Access the application:**
   - Application: http://localhost:4111
   - Health check: http://localhost:4111/health

## Files Overview

- **`Dockerfile`** - Multi-language container with Python, Node.js, Bun, and AWS CLI
- **`docker-compose.yml`** - Service orchestration and configuration
- **`.env.example`** - Environment variables template
- **`.env`** - Your actual environment variables (not committed to git)

## Environment Variables

### Required Variables
- `AWS_ACCESS_KEY_ID` - Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret access key

### Optional Variables
- `AWS_DEFAULT_REGION` - AWS region (default: us-east-1)
- `AWS_SESSION_TOKEN` - For temporary credentials
- `NODE_ENV` - Node.js environment (default: production)
- `LOG_LEVEL` - Application log level (default: info)

## Docker Commands

### Using Docker Compose (Recommended)
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d

# Scale the service (if needed)
docker-compose up --scale zapgap-agent=2 -d
```

### Using Docker Directly
```bash
# Build the image
docker build -t zapgapapp:latest .

# Run with environment variables
docker run -d \
  --name zapgap-agent \
  -p 4111:4111 \
  -e AWS_ACCESS_KEY_ID=your_key_id \
  -e AWS_SECRET_ACCESS_KEY=your_secret_key \
  -e AWS_DEFAULT_REGION=us-west-2 \
  zapgapapp:latest

# Run with env file
docker run -d \
  --name zapgap-agent \
  -p 4111:4111 \
  --env-file .env \
  zapgapapp:latest
```

## Development Mode

For development with hot reloading, uncomment the volume mounts in docker-compose.yml:

```yaml
volumes:
  - ./src:/app/src:ro
  - ./scripts:/app/scripts:ro
  - ./examples:/app/examples:ro
```

Then restart the service:
```bash
docker-compose down
docker-compose up -d
```

## Production Considerations

1. **Security:**
   - Use AWS IAM roles instead of access keys when possible
   - Store secrets in AWS Secrets Manager or similar
   - Enable resource limits in docker-compose.yml

2. **Monitoring:**
   - Health checks are configured and enabled
   - Consider adding logging aggregation
   - Monitor resource usage

3. **Scaling:**
   - Use Docker Swarm or Kubernetes for multi-instance deployment
   - Configure load balancing if running multiple instances
   - Consider using AWS ECS or EKS for managed container orchestration

## Troubleshooting

### Common Issues

1. **AWS credentials not working:**
   ```bash
   # Check if credentials are loaded
   docker-compose exec zapgap-agent env | grep AWS
   
   # Test AWS connectivity
   docker-compose exec zapgap-agent aws sts get-caller-identity
   ```

2. **Port already in use:**
   ```bash
   # Change the port in docker-compose.yml
   ports:
     - "4112:4111"  # Use different external port
   ```

3. **Container won't start:**
   ```bash
   # Check logs for errors
   docker-compose logs zapgap-agent
   
   # Check container status
   docker-compose ps
   ```

4. **Build failures:**
   ```bash
   # Clean build (no cache)
   docker-compose build --no-cache
   
   # Remove old images
   docker system prune -a
   ```

### Health Check

The container includes a health check that verifies the application is responding:
```bash
# Check health status
docker-compose ps

# Manual health check
curl -f http://localhost:4111/health
```

## Support

For issues related to:
- **Docker configuration:** Check this README and docker-compose.yml comments
- **AWS connectivity:** Verify credentials and IAM permissions
- **Application errors:** Check application logs with `docker-compose logs`
