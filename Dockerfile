# ---- Build Angular ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ---- Serve with nginx ----
FROM nginx:alpine
ENV PORT=80
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/YOUR_PROJECT_NAME/browser /usr/share/nginx/html
