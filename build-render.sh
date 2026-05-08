#!/bin/bash
set -e

# Install bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Remove any lockfiles to avoid workspace conflicts
rm -f bun.lock bun.lockb package-lock.json yarn.lock 2>/dev/null || true

# Install with npm (more stable on Render, avoids bun workspace resolution)
npm install --legacy-peer-deps

# Build with bun (faster)
bun run build
