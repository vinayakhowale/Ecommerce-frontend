# ---- Build Angular ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# ---- Serve with nginx ----
FROM nginx:alpine
ENV PORT=80
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/social-commerce-frontend/browser /usr/share/nginx/html
