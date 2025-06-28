# FROM debian:bookworm


# RUN apt-get update -y \
# && apt-get install curl dpkg -y


# CMD ["tail", "/dev/stdout", "-f"]


FROM elastic/apm-server:9.0.0


COPY ./apm-server.yml /usr/share/apm-server/apm-server.yml