FROM python:3.12-slim

RUN pip install bcrypt

RUN apt-get update && \
    apt-get install -y wget tar && \
    wget https://github.com/prometheus/prometheus/releases/download/v3.4.0/prometheus-3.4.0.linux-amd64.tar.gz && \
    tar xvf prometheus-3.4.0.linux-amd64.tar.gz && \
    mv prometheus-3.4.0.linux-amd64 /opt/prometheus && \
    ln -s /opt/prometheus/prometheus /bin/prometheus

COPY ./prometheus.yml /etc/prometheus/prometheus.yml
COPY ./alert_rules.yml /etc/prometheus/alert_rules.yml
COPY ./genpass.py /etc/prometheus/genpass.py
COPY ./init.sh /etc/prometheus/init.sh

RUN chmod +x /etc/prometheus/init.sh

ENTRYPOINT ["/etc/prometheus/init.sh"]
