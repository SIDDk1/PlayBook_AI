FROM node:20-alpine

WORKDIR /workspace

# Copy package descriptors first to take advantage of Docker cache
COPY package.json package-lock.json ./

# Install npm dependencies (using ci for deterministic installs)
RUN npm ci

# Copy the rest of the frontend source code
COPY . .

# Expose Vite's default dev server port
EXPOSE 5173

# Start the dev server bound to all interfaces so Docker can forward it
CMD ["npm", "run", "dev", "--", "--host"]
