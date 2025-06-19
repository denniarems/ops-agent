FROM oven/bun:latest

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source code and build
COPY . ./
RUN bun run build

EXPOSE 4111
CMD ["bun", "run", "start"]