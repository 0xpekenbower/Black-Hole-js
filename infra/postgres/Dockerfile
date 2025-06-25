FROM postgres:17.5-alpine

# VOLUME /var/lib/postgresql/data
COPY init.sh /docker-entrypoint-initdb.d/
COPY ./postgresql.conf /var/lib/postgresql/postgresql.conf
# var/lib/postgresql/data/log/*.log
RUN chmod +x /docker-entrypoint-initdb.d/init.sh
