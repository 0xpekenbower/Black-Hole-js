FROM nginx:1.28-alpine

ENV NGINX_ENTRYPOINT_QUIET_LOGS=0

# RUN mkdir -p /var/log/nginx
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY ./502.html /etc/nginx/conf.d/502.html

CMD ["sh", "-c", "mkdir -p /var/log/nginx && \
     rm -f /var/log/nginx/access.log /var/log/nginx/error.log && \
     touch /var/log/nginx/access.log /var/log/nginx/frontend-error.log /var/log/nginx/api-access.log /var/log/nginx/api-error.log /var/log/nginx/error.log && \
     chmod 666 /var/log/nginx/*.log && \
     chown -R nginx:nginx /var/log/nginx && \
     ls -la /var/log/nginx && \
     nginx -g 'daemon off;'"]
