FROM docker.elastic.co/logstash/logstash:9.0.0

COPY ./logstash.yml /usr/share/logstash/config/logstash.yml
COPY ./pipeline /usr/share/logstash/pipeline

ENV LS_JAVA_OPTS="-Xms128m -Xmx128m"