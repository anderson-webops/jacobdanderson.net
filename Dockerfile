FROM node:22-alpine AS build-stage

WORKDIR /app

COPY .npmrc package.json package-lock.json ./
COPY front-end/package.json front-end/package.json
COPY back-end/package.json back-end/package.json
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/front-end/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
