# Dev image with hot-reload
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Install dev tools (e.g., nodemon) if not already in package.json
# RUN npm i -D nodemon

# Start dev server (ensure "dev" script uses nodemon)
CMD ["npm", "run", "dev"]
