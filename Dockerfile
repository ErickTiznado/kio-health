# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for monorepo
COPY package.json package-lock.json turbo.json ./

# Copy workspace package.json files
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Copy shared packages package.json files
COPY packages/ packages/

# Install all dependencies
RUN npm ci

# Copy API source code and Prisma files
COPY apps/api/ apps/api/

# Generate Prisma client and build NestJS
RUN npx turbo run build --filter=api

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json turbo.json ./

# Copy workspace package.json files
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/ packages/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built output from builder
COPY --from=builder /app/apps/api/dist apps/api/dist

# Copy Prisma schema, migrations, and generated client
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts apps/api/prisma.config.ts

# Set working directory to api
WORKDIR /app/apps/api

# Expose port
EXPOSE ${PORT:-3000}

# Run migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
