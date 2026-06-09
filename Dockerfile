# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Backend & Production Image
FROM node:18-alpine
WORKDIR /app

# Copy backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy backend source
COPY server/ ./server/

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
