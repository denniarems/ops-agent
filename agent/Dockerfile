# Multi-stage build for optimized ZapGap AI agent with Docker support
# Stage 1: Extract Docker binaries from official Docker image
FROM docker:latest AS docker-source

# Stage 2: Minimal Alpine Linux base with Node.js
FROM alpine:latest AS base

# Set environment variables for non-interactive installation
ENV NODE_ENV=production
ENV BUN_INSTALL=/usr/local

# Install essential system packages and Node.js
RUN apk add --no-cache \
    # Core system utilities
    curl \
    wget \
    unzip \
    ca-certificates \
    bash \
    # Security and networking
    openssl \
    # Build tools (minimal set for native modules)
    build-base \
    python3 \
    # Process management and monitoring
    procps \
    htop \
    # Git for potential repository operations
    git \
    # Node.js 20.x (LTS) for compatibility
    nodejs \
    npm \
    # Required for Docker functionality
    iptables \
    device-mapper \
    && rm -rf /var/cache/apk/*

# Stage 3: Runtime with Docker binaries and Bun
FROM base AS runtime

# Copy Docker binaries from official Docker image
COPY --from=docker-source /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker-source /usr/local/bin/dockerd /usr/local/bin/dockerd
COPY --from=docker-source /usr/local/bin/containerd /usr/local/bin/containerd
COPY --from=docker-source /usr/local/bin/runc /usr/local/bin/runc
COPY --from=docker-source /usr/local/bin/docker-init /usr/local/bin/docker-init
COPY --from=docker-source /usr/local/bin/docker-proxy /usr/local/bin/docker-proxy

# Install Bun runtime directly
RUN curl -fsSL https://bun.sh/install | bash \
    && bun --version

# Create non-root user for security (multi-tenant requirement)
RUN addgroup -g 1000 zapgap && adduser -D -u 1000 -G zapgap zapgap \
    && mkdir -p /app \
    && chown -R zapgap:zapgap /app

# Set working directory
WORKDIR /app

# Stage 4: Dependencies installation (optimized layer caching)
FROM runtime AS dependencies

# Copy package files for dependency installation (layer caching optimization)
COPY --chown=zapgap:zapgap package.json bun.lock* ./

# Switch to non-root user for dependency installation
USER zapgap

# Install dependencies with frozen lockfile for reproducible builds
RUN bun install --frozen-lockfile \
    && bun pm cache clean

# Stage 5: Application build and final image
FROM dependencies AS application

# Copy source code
COPY --chown=zapgap:zapgap . ./

# Build the application
RUN bun run build

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4111/health || exit 1

# Expose port for ZapGap agent services
EXPOSE 4111

# Set proper signal handling for graceful shutdown
STOPSIGNAL SIGTERM

# Run as non-root user for security
USER zapgap

# Start the application
CMD ["bun", "run", "start"]