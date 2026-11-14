FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci
COPY . .
RUN npm run build -w @screenshare/shared && npm run build -w @screenshare/server
EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@screenshare/server"]
