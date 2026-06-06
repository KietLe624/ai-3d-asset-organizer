# Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve với Nginx
FROM nginx:alpine

# Copy build output vào nginx web root
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
# Nginx config để hỗ trợ Angular routing (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
