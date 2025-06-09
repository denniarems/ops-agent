#!/bin/bash

# Install bun if not available
if ! command -v bun &> /dev/null; then
    echo "Installing bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Install dependencies with bun
echo "Installing dependencies with bun..."
bun install

# Build the project
echo "Building the project..."
bun run build

echo "Build completed successfully!"
