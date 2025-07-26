# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nimble

# Copy the built application
COPY --from=builder --chown=nimble:nodejs /app/dist ./dist
COPY --from=builder --chown=nimble:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nimble:nodejs /app/package.json ./package.json

# Copy drizzle config and schema for database operations
COPY --from=builder --chown=nimble:nodejs /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder --chown=nimble:nodejs /app/shared ./shared

USER nimble

EXPOSE 5000

ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "dist/index.js"]