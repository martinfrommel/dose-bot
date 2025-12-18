# Build stage
FROM node:24-alpine AS builder

# Enable Corepack to use Yarn 4
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY api/package.json ./api/
COPY web/package.json ./web/

# Install dependencies
RUN yarn install --immutable

# Copy application code
COPY . .

# Generate Prisma client
RUN yarn prisma generate

# Build the application
RUN yarn cedar build

# Production stage
FROM node:24-alpine

# Enable Corepack to use Yarn 4
RUN corepack enable

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/api ./api
COPY --from=builder /app/web ./web
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/redwood.toml ./

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dev.db"

# Expose ports
EXPOSE 8910 8911

# Run migrations and start the application
CMD ["sh", "-c", "yarn prisma migrate deploy && yarn cedar serve"]
