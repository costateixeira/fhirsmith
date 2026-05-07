# Stage 1: Build native modules
FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt, sqlite3)
RUN apk add --no-cache python3 make g++

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Runtime image (no build tools)
FROM node:24-alpine

WORKDIR /app

# Copy installed node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Bundle app source
COPY package*.json ./
COPY . .

# Define build argument for version
ARG VERSION=development
ENV APP_VERSION=$VERSION

# Expose port and define command
EXPOSE 3000
CMD ["node", "server.js"]