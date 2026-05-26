# Use official Node.js LTS slim image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies (use package.json present in backend)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port and start app
EXPOSE 3000
CMD ["node", "index.js"]
