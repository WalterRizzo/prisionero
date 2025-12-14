FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

# Create data directory for SQLite database
RUN mkdir -p ./data

EXPOSE 5000

CMD ["node", "src/server.js"]
