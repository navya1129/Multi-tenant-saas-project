FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Start backend server
CMD ["node", "src/server.js"]