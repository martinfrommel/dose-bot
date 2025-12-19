# Build stage
FROM node:24-alpine AS builder

ENV YARN_VERSION=4.12.0 \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY api/package.json ./api/
COPY web/package.json ./web/

# Ensure the expected Yarn version is available without relying on external tarball mirrors
RUN corepack enable \
	&& corepack prepare "yarn@${YARN_VERSION}" --activate \
	|| (npm install -g "yarn@${YARN_VERSION}" && yarn --version)

# Copy application code
COPY . .

# Install dependencies
RUN yarn install --immutable --inline-builds

# Generate Prisma client
RUN yarn cedar prisma generate

# Build the application
RUN yarn cedar build

# Production stage
FROM node:24-alpine

ENV YARN_VERSION=4.12.0 \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/web ./web
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/redwood.toml ./

# Ensure Yarn is available at runtime for cedar commands
RUN corepack enable \
	&& corepack prepare "yarn@${YARN_VERSION}" --activate \
	|| (npm install -g "yarn@${YARN_VERSION}" && yarn --version)

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dosebot.db"
ENV WEB_HOST=0.0.0.0
ENV API_HOST=0.0.0.0
ENV RUN_SEED=0

# Expose ports
EXPOSE 8910
# EXPOSE 8911  # Uncomment if you want to expose the API on a separate port

# Run migrations, optionally seed, and start the application
CMD ["sh", "-c", "yarn cedar prisma migrate deploy && if [ \"${RUN_SEED:-0}\" = \"1\" ]; then yarn cedar prisma db seed; fi && yarn cedar serve --webHost ${WEB_HOST} --apiHost ${API_HOST}"]
