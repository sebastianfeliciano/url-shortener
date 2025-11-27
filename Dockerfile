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
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/server.js ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/src ./src
COPY --from=builder /app/client/build ./client/build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Expose port (Render sets PORT via environment variable)
EXPOSE ${PORT:-5000}

# Health check (uses PORT from environment)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 5000; require('http').get(\`http://localhost:\${port}/api/health\`, (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

