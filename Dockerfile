# Multi-stage build for Node.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies
RUN npm ci

# Install client dependencies
WORKDIR /app/client
RUN npm ci

# Copy source code
WORKDIR /app
COPY . .

# Build client
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Copy package files
COPY package*.json ./

# Install only production dependencies (skip postinstall script to avoid client install)
RUN npm install --production --no-audit --no-fund --ignore-scripts && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/client/build ./client/build

# Use the existing node user (already exists in node:18-alpine)
RUN chown -R node:node /app
USER node

# Expose port (Render sets PORT via environment variable)
EXPOSE ${PORT:-5000}

# Health check (uses PORT from environment, curl is more reliable)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

