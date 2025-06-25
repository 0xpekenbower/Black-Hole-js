FROM docker.elastic.co/beats/filebeat:9.0.0

USER root

# Create log directory with proper permissions
RUN mkdir -p /var/log/filebeat && \
    chmod 777 /var/log/filebeat

# Copy configuration
COPY ./filebeat.yml /usr/share/filebeat/filebeat.yml
RUN chmod 644 /usr/share/filebeat/filebeat.yml

# Create directory for container logs
RUN mkdir -p /var/lib/docker/containers

# Set proper permissions for filebeat
RUN chown -R root:root /usr/share/filebeat/