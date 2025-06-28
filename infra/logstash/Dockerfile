FROM docker.elastic.co/logstash/logstash:9.0.0

COPY ./logstash.yml /usr/share/logstash/config/logstash.yml
COPY ./pipeline /usr/share/logstash/pipeline

ENV LS_JAVA_OPTS="-Xms256m -Xmx256m"

# RUN mkdir -p /usr/share/logstash/data/queue
