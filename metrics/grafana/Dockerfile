FROM grafana/grafana:12.0.1

ENV GF_SERVER_ROOT_URL=http://localhost/grafana/ \
    GF_SERVER_SERVE_FROM_SUB_PATH=true \
    GF_SERVER_PORT=7050 

COPY ./provisioning /etc/grafana/provisioning
