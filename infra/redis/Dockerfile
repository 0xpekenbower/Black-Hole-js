FROM redis:8.0-alpine

VOLUME /data

COPY redis.conf /usr/local/etc/redis/redis.conf 
COPY setup.sh /usr/local/bin/setup.sh
RUN chmod +x /usr/local/bin/setup.sh
CMD ["/usr/local/bin/setup.sh"]