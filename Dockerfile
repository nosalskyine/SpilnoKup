FROM node:22-alpine
WORKDIR /app

# Backend deps
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Backend compiled code + prisma
COPY backend/dist ./backend/dist
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/
COPY backend/tsconfig.json ./backend/

# Generate prisma client
RUN cd backend && DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Frontend
COPY dist ./dist
COPY server.js ./

EXPOSE 3000
CMD ["node", "server.js"]
