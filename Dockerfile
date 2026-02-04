FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install build dependencies for native modules (bcrypt, sqlite3)
RUN apk add --no-cache python3 make g++

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Define build argument for version
ARG VERSION=development
ENV APP_VERSION=$VERSION

# Expose port and define command
EXPOSE 3000
CMD ["node", "server.js"]
