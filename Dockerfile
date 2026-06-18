# Use a smaller base image for production
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files 
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code (excluding .env files that might interfere with NODE_ENV)
COPY . .

# Build the application - NODE_ENV will be set by the build environment
RUN NODE_ENV=production pnpm build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy built application and node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/node_modules ./node_modules

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/index.js"]
