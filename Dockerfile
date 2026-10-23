# Multi-stage build for PathVN (React + Vite + Express)
FROM node:25-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Install production dependencies only in a clean folder
RUN npm ci --only=production --ignore-scripts

# Rebuild better-sqlite3 for production
RUN npm rebuild better-sqlite3

# Production stage
FROM node:25-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server code and shared modules
COPY server/ ./server/
COPY shared/ ./shared/
COPY setup-admin.cjs ./

# Create data directory for SQLite
RUN mkdir -p data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Run the application
CMD ["node", "server/index.js"]
