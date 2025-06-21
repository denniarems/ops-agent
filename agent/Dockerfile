FROM node:latest
ENV BUN_INSTALL=/usr/local
WORKDIR /app


# Install Bun runtime directly
RUN curl -fsSL https://bun.sh/install | bash \
    && bun --version

# Copy package files and install all dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source code and build
COPY . ./
RUN bun run build

# Ensure .mastra/output directory exists
RUN mkdir -p /app/.mastra/output

EXPOSE 4111
CMD ["bun", "run", "start"]