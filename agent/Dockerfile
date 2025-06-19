# Multi-language base image with Python, Node.js, uvx, and Bun
FROM python:3.12-slim-bookworm

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    ca-certificates \
    gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws

# Install uvx and bun from official sources
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
RUN ln -s /usr/local/bin/uv /usr/local/bin/uvx
COPY --from=oven/bun:latest /usr/local/bin/bun /usr/local/bin/bun

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /bin/bash appuser

# Set working directory and create app structure
WORKDIR /app

# AWS configuration (will be set at runtime for security)
ARG AWS_DEFAULT_REGION=us-east-1
ENV AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION \
    AWS_DEFAULT_OUTPUT=json \
    NODE_ENV=production

# Copy package files for dependency installation (layer optimization)
COPY package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

COPY . ./

# AWS Credentials Configuration
# =============================
# This container requires AWS credentials to be passed as environment variables at runtime.
#
# Required Environment Variables:
# - AWS_ACCESS_KEY_ID: Your AWS access key ID
# - AWS_SECRET_ACCESS_KEY: Your AWS secret access key
#
# Optional Environment Variables:
# - AWS_DEFAULT_REGION: AWS region (defaults to us-east-1)
# - AWS_SESSION_TOKEN: If using temporary credentials
#
# How to provide credentials when running the container:
#
# 1. Using docker run with -e flags:
#    docker run -e AWS_ACCESS_KEY_ID=your_key_id \
#               -e AWS_SECRET_ACCESS_KEY=your_secret_key \
#               -e AWS_DEFAULT_REGION=us-west-2 \
#               zapgapapp:latest
#
# 2. Using docker-compose environment section:
#    services:
#      zapgap:
#        image: zapgapapp:latest
#        environment:
#          - AWS_ACCESS_KEY_ID=your_key_id
#          - AWS_SECRET_ACCESS_KEY=your_secret_key
#          - AWS_DEFAULT_REGION=us-west-2
#
# 3. Using docker-compose env_file:
#    services:
#      zapgap:
#        image: zapgapapp:latest
#        env_file:
#          - .env  # Contains AWS_ACCESS_KEY_ID=... and AWS_SECRET_ACCESS_KEY=...
#
# Behavior when credentials are not provided:
# - The container will start successfully but display a warning message
# - AWS-dependent features will not function properly
# - The application will continue running in a degraded state
#
# Security Note:
# - Never hardcode credentials in the Dockerfile or image
# - Use environment variables, secrets management, or IAM roles
# - Consider using AWS IAM roles for containers in production environments

# Create startup script for session token generation
RUN echo '#!/bin/bash' > /usr/local/bin/aws-session.sh && \
    echo 'set -e' >> /usr/local/bin/aws-session.sh && \
    echo '' >> /usr/local/bin/aws-session.sh && \
    echo '# Check if AWS credentials are provided' >> /usr/local/bin/aws-session.sh && \
    echo 'if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then' >> /usr/local/bin/aws-session.sh && \
    echo '    echo "Warning: AWS credentials not provided. Skipping session token generation."' >> /usr/local/bin/aws-session.sh && \
    echo '    exec "$@"' >> /usr/local/bin/aws-session.sh && \
    echo 'fi' >> /usr/local/bin/aws-session.sh && \
    echo '' >> /usr/local/bin/aws-session.sh && \
    echo 'echo "Generating AWS session token..."' >> /usr/local/bin/aws-session.sh && \
    echo 'if CREDS=$(aws sts get-session-token \' >> /usr/local/bin/aws-session.sh && \
    echo '    --duration-seconds 3600 \' >> /usr/local/bin/aws-session.sh && \
    echo '    --query '"'"'Credentials.[AccessKeyId,SecretAccessKey,SessionToken]'"'"' \' >> /usr/local/bin/aws-session.sh && \
    echo '    --output text 2>/dev/null); then' >> /usr/local/bin/aws-session.sh && \
    echo '' >> /usr/local/bin/aws-session.sh && \
    echo '    export AWS_ACCESS_KEY_ID=$(echo $CREDS | cut -d'"'"' '"'"' -f1)' >> /usr/local/bin/aws-session.sh && \
    echo '    export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | cut -d'"'"' '"'"' -f2)' >> /usr/local/bin/aws-session.sh && \
    echo '    export AWS_SESSION_TOKEN=$(echo $CREDS | cut -d'"'"' '"'"' -f3)' >> /usr/local/bin/aws-session.sh && \
    echo '    echo "AWS session configured successfully"' >> /usr/local/bin/aws-session.sh && \
    echo 'else' >> /usr/local/bin/aws-session.sh && \
    echo '    echo "Warning: Failed to generate session token. Using provided credentials."' >> /usr/local/bin/aws-session.sh && \
    echo 'fi' >> /usr/local/bin/aws-session.sh && \
    echo '' >> /usr/local/bin/aws-session.sh && \
    echo 'exec "$@"' >> /usr/local/bin/aws-session.sh && \
    chmod +x /usr/local/bin/aws-session.sh

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 4111

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4111/health || exit 1

# Start the application
CMD ["/usr/local/bin/aws-session.sh", "bun", "run", "mastra", "start"]