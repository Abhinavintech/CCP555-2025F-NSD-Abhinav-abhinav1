# Multi-stage Dockerfile for the fragments node.js microservice
# Updated for Assignment 2 Docker Hub integration
# Stage 1: Build dependencies
FROM node:22.12.0-alpine AS dependencies

# Metadata
LABEL maintainer="Abhinav <abhinavintech@gmail.com>"
LABEL description="Fragments node.js microservice"

# Use /app as our working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production && npm cache clean --force

# Stage 2: Production image
FROM node:22.12.0-alpine AS production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fragments -u 1001

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
ENV NPM_CONFIG_COLOR=false

# Set NODE_ENV to production
ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy dependencies from build stage
COPY --from=dependencies --chown=fragments:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=fragments:nodejs /app/package*.json ./

# Copy application source
COPY --chown=fragments:nodejs ./src ./src

# Copy our HTPASSWD file so basic auth works when using env.jest
COPY --chown=fragments:nodejs ./tests/.htpasswd ./tests/.htpasswd

# Create data directory with proper permissions before switching user
RUN mkdir -p /app/data && chown fragments:nodejs /app/data

# Switch to non-root user
USER fragments

# Document the port the app runs on
EXPOSE 8080

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["npm", "start"]

# End of Dockerfile