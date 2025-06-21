FROM docker.elastic.co/logstash/logstash:9.0.0

COPY ./logstash.yml /usr/share/logstash/config/logstash.yml
COPY ./jvm.options /usr/share/logstash/config/jvm.options
COPY log4j2.file.properties /usr/share/logstash/config/log4j2.file.properties
COPY log4j2.file.properties /usr/share/logstash/config/log4j2.properties
COPY ./pipeline /usr/share/logstash/pipeline

ENV LS_JAVA_OPTS="-Xms128m -Xmx128m"

RUN mkdir -p /usr/share/logstash/data/queue
