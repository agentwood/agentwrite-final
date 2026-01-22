# HARBOR Dashboard - Nginx Dockerfile

FROM nginx:alpine

COPY . /usr/share/nginx/html/
RUN rm -f /usr/share/nginx/html/Dockerfile

RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
