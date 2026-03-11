FROM node:20-alpine
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server ./server

# Expose port
EXPOSE 5001

# Run the application
CMD ["node", "server/server.js"]
