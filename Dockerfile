FROM oven/bun:1 as build

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine as production

WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bun -u 1001

USER bun

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]