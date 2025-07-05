#!/bin/bash

# setup basic auth
setup_basic_auth() {
    python3 /etc/prometheus/genpass.py $PROMETHEUS_USER $PROMETHEUS_PASSWORD > /etc/prometheus/web.yml || exit 1
}

setup_basic_auth

exec /bin/prometheus \
    "--config.file=/etc/prometheus/prometheus.yml" \
    "--storage.tsdb.path=/prometheus" \
    "--web.console.libraries=/etc/prometheus/console_libraries" \
    "--web.console.templates=/etc/prometheus/consoles" \
    "--web.external-url=http://blackholejs.art/prometheus/" \
    "--web.config.file=/etc/prometheus/web.yml"
