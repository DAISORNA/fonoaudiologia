# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend /app
RUN npm ci || npm i
RUN npm run build

# Nginx serve & proxy
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
