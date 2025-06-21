FROM oven/bun:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source code
COPY . ./

EXPOSE 3000
CMD ["bun", "run", "start"]