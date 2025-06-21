FROM node:slim
ENV BUN_INSTALL=/usr/local
WORKDIR /app

# Install curl and other necessary packages, then install Bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://bun.sh/install | bash \
    && ln -s /usr/local/bin/bun /usr/bin/bun \
    && bun --version

# Copy package files and install all dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code (excluding files in .dockerignore)
COPY . ./

# Build the application
RUN bun run build

# Ensure .mastra/output directory exists
RUN mkdir -p /app/.mastra/output

EXPOSE 4111
CMD ["bun", "run", "start"]