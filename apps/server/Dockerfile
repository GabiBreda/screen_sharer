FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm install
COPY . .
RUN npm run build -w @screenshare/shared && npm run build -w @screenshare/server
CMD ["npm", "run", "start", "-w", "@screenshare/server"]
