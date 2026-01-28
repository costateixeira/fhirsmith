FROM node:20-alpine

# Install build tools for native modules (sqlite3, bcrypt)
RUN apk add --no-cache python3 make g++

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Define build argument for version
ARG VERSION=development
ENV APP_VERSION=$VERSION

# Expose port and define command
EXPOSE 3000
CMD ["node", "server.js"]
