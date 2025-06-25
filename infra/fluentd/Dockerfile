FROM fluent/fluent-bit:4.0.3
# USER root

# RUN gem install fluent-plugin-elasticsearch

COPY ./conf/ /etc/fluent-bit/

# Expose ports
EXPOSE 24224 24224/udp

# Health check
HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
  CMD nc -z localhost 24224 || exit 1

# USER fluent
