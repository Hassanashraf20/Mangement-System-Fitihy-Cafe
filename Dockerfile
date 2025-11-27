# Use Node 18 (matches your package.json engines)
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your code
COPY . .

# Expose your server port (change if your app uses another)
EXPOSE 5000

# Start your app
CMD ["node", "server.js"]
