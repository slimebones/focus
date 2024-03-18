# BUILD
FROM node:20 AS build

WORKDIR /solution/projects/client

COPY projects/client/package*.json ./
COPY projects/client/tailwind.config.js ./
COPY projects/client/svelte.config.js ./
COPY projects/client/tsconfig.json ./
COPY projects/client/vite.config.ts ./
COPY projects/client/Makefile ./
COPY projects/client/.env ./

RUN yarn install --network-timeout 30000000

COPY projects/client/src ./src
COPY projects/client/static ./static

RUN yarn build

# NGINX
FROM nginx:1.19-alpine AS prod

# Copy build folder from build stage to nginx
COPY --from=build /solution/projects/client/build /usr/share/nginx/html
