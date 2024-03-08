# BUILD
FROM node:20 AS build

WORKDIR /solution/projects/focusf

COPY projects/focusf/package*.json ./
COPY projects/focusf/tailwind.config.js ./
COPY projects/focusf/svelte.config.js ./
COPY projects/focusf/tsconfig.json ./
COPY projects/focusf/vite.config.ts ./
COPY projects/focusf/Makefile ./
COPY projects/focusf/.env ./

RUN yarn install --network-timeout 30000000

COPY projects/focusf/src ./src
COPY projects/focusf/static ./static

RUN yarn build

# NGINX
FROM nginx:1.19-alpine AS prod

# Copy build folder from build stage to nginx
COPY --from=build /solution/projects/focusf/build /usr/share/nginx/html
