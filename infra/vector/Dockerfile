FROM timberio/vector:0.47.0-alpine

COPY ./vector.yaml /etc/vector/vector.yaml

USER root

ENV DOCKER_HOST="unix:///var/run/docker.sock"