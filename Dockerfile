# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend and backend
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
RUN npm install -g pnpm

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Copy source files needed for production
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# Install only production dependencies (without patches)
RUN pnpm install --prod --ignore-scripts

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]
