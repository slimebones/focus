# BUILD
FROM node:14 AS build

WORKDIR /solution/projects/focusf

COPY package*.json ./
COPY tailwind.config.js ./
COPY svelte.config.js ./
COPY tsconfig.json ./
COPY vite.config.ts ./

RUN yarn install

COPY projects/focusf/src ./src
COPY projects/focusf/static ./static

RUN yarn build

# NGINX
FROM nginx:1.19-alpine AS prod

# Copy build folder from build stage to nginx
COPY –from=build /solutions/projects/focusf/build /usr/share/nginx/html

# Start Nginx server
CMD [“nginx”, “-g”, “daemon off;”]
