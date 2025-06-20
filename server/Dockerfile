FROM oven/bun:latest

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json bun.lock* ./
RUN bun install

# Copy source code
COPY . ./

EXPOSE 3000
CMD ["bun", "run", "start"]