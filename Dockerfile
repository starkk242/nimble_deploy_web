# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy app files
COPY . .

# Install only production dependencies
RUN npm install --no-cache

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nimble

# Set permissions (optional, for uploads or other dirs)
# RUN chown -R nimble:nodejs /app

USER nimble

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "dist/index.js"]