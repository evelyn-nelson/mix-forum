FROM node:22-alpine AS base
WORKDIR /app

COPY server/package.json server/package-lock.json* ./server/

RUN cd server && npm install

COPY server/ ./server/

RUN cd server && npm run build

FROM node:22-alpine AS production
WORKDIR /app

COPY server/package.json server/package-lock.json* ./server/

COPY --from=base /app/server/dist ./server/dist

RUN cd server && npm install --omit=dev && npm prune --production

EXPOSE 3001
CMD ["npm", "run", "start", "--prefix", "server"]
