#!/bin/bash
set -e

# Install bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Clear any bun cache to avoid stale workspace references
rm -rf ~/.bun/install/cache 2>/dev/null || true
rm -f bun.lock bun.lockb 2>/dev/null || true

# Install dependencies (no workspaces, standalone)
bun install --no-cache

# Build
bun run build
