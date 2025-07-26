# Use Node.js base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy backend files
COPY . .

# Install backend dependencies
RUN npm install

# Expose backend port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
