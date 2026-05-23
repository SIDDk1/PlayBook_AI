FROM node:18-alpine

WORKDIR /app

# Copy dependency configs
COPY package.json package-lock.json ./
RUN npm ci

# Copy frontend source and build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

EXPOSE 3000

ENV PORT 3000
CMD ["npm", "run", "start"]
