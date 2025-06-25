FROM docker.elastic.co/elasticsearch/elasticsearch:9.0.0

COPY ./elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
#COPY ./log4j2.properties /usr/share/elasticsearch/config/log4j2.properties

ENV node.name=elasticsearch \
    ES_JAVA_OPTS="-Xms256m -Xmx256m" \
    discovery.type=single-node
