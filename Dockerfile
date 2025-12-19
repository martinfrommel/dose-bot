# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Ensure the expected Yarn version is available without vendoring .yarn
RUN corepack enable && corepack prepare "$(node -p "require('./package.json').packageManager")" --activate

# Install dependencies
RUN apt-get --assume-yes install yarn && apt-mark hold yarn

# Copy application code
COPY . .

# Generate Prisma client
RUN yarn cedar prisma generate

# Build the application
RUN yarn cedar build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/web ./web
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/redwood.toml ./

# Ensure Yarn is available at runtime for cedar commands
RUN corepack enable && corepack prepare "$(node -p "require('./package.json').packageManager")" --activate

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dosebot.db"

# Expose ports
EXPOSE 8910 8911

# Run migrations and start the application
CMD ["sh", "-c", "yarn cedar prisma migrate deploy && yarn cedar serve"]
