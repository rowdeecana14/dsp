# Dockerfile for a standalone nginx container
# This container can be used to serve static content separately.

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
