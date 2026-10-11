FROM nginx:alpine

# remove any old copy line like:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# fallback values in case Railway doesn't set them
ENV PORT=80

COPY --from=build /app/dist/<your-app-name>/browser /usr/share/nginx/html
