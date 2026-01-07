# ==============================================================================
# Campus OS - Auth Service Dockerfile
# ==============================================================================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# ==============================================================================
# Dependencies Stage
# ==============================================================================
FROM base AS deps

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json tsconfig.base.json ./

# Copy package.json files for all needed packages
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
COPY packages/auth/package.json ./packages/auth/
COPY services/auth/package.json ./services/auth/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ==============================================================================
# Builder Stage
# ==============================================================================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/*/node_modules ./packages/
COPY --from=deps /app/services/auth/node_modules ./services/auth/

# Copy source files
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/database ./packages/database
COPY packages/auth ./packages/auth
COPY services/auth ./services/auth
COPY tsconfig.base.json ./

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build auth service
WORKDIR /app/services/auth
RUN pnpm build

# ==============================================================================
# Production Stage
# ==============================================================================
FROM node:20-alpine AS production

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 campus

WORKDIR /app

# Copy built files
COPY --from=builder --chown=campus:nodejs /app/services/auth/dist ./dist
COPY --from=builder --chown=campus:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=campus:nodejs /app/packages/database/node_modules/.prisma ./node_modules/.prisma

# Set environment
ENV NODE_ENV=production
ENV AUTH_PORT=4300

# Switch to non-root user
USER campus

# Expose port
EXPOSE 4300

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4300/health || exit 1

# Start the service
CMD ["node", "dist/index.js"]
