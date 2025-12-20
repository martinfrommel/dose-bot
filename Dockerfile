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

# Get Curl for health checks
RUN apk add --no-cache curl

ARG COPY_SCRIPTS=0
# Space-separated list of script names/paths to skip during COPY_SCRIPTS handling
ARG SCRIPT_EXCLUDES="buildImage.ts dockerUtils.ts lib/"
ARG DEMO_MODE=0

ENV YARN_VERSION=4.12.0 \
	COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
	COPY_SCRIPTS=${COPY_SCRIPTS} \
	SCRIPT_EXCLUDES=${SCRIPT_EXCLUDES} \
	DEMO_MODE=${DEMO_MODE}

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/web ./web
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/redwood.toml ./
COPY --from=builder /app/scripts /tmp/scripts

# Optionally copy scripts for cedar exec, excluding configured entries. Always copy seed script when DEMO_MODE=1.
RUN mkdir -p /app/scripts; \
	if [ "${COPY_SCRIPTS}" = "1" ]; then \
		for f in /tmp/scripts/.* /tmp/scripts/*; do \
			[ -e "$f" ] || continue; \
			name=$(basename "$f"); \
			case "$name" in "."|"..") continue;; esac; \
			skip=0; \
			for ex in ${SCRIPT_EXCLUDES}; do \
				if [ "$name" = "$ex" ]; then skip=1; break; fi; \
			done; \
			[ "$skip" -eq 1 ] && continue; \
			cp "$f" "/app/scripts/$name"; \
		done; \
	fi; \
	if [ "${DEMO_MODE}" = "1" ] && [ -f /tmp/scripts/seed.ts ]; then \
		cp /tmp/scripts/seed.ts /app/scripts/seed.ts; \
	fi; \
	rm -rf /tmp/scripts

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
ENV DEMO_MODE=${DEMO_MODE}

# Expose ports for web (8910) and API (8911)
EXPOSE 8910 8911

# Run migrations, optionally seed, and start the application
CMD ["sh", "-c", "yarn cedar prisma migrate deploy && if [ \"${RUN_SEED:-0}\" = \"1\" ]; then yarn cedar prisma db seed; fi && yarn cedar serve --webHost ${WEB_HOST} --apiHost ${API_HOST}"]
