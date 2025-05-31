MINIMAL_STACK = frontend gateway nginx postgres_db redis auth dashboard chat game
METRICS_STACK = grafana prometheus node_exporter cadvisor redis_exporter postgres_exporter
LOGS_STACK = elasticsearch kibana logstash vector
ALL_STACK = $(MINIMAL_STACK) $(METRICS_STACK) $(LOGS_STACK)
DC = docker compose -f ./docker-compose.yml -f ./infra/infra.yml -f ./services/services.yml -f ./metrics/metrics.yml -f ./logs/logs.yml -p blackholejs

all: build minimal_stack metrics_stack logs_stack

build:
	$(DC) build setup
	$(DC) build

logs_stack:
	$(DC) up -d elasticsearch
	$(DC) up -d setup
	@echo "Waiting for setup to complete..."
	@until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ] || [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "dead" ]; do \
		echo "Setup still running, waiting..."; \
		sleep 5; \
	done
	$(DC) up -d kibana logstash vector

metrics_stack:
	$(DC) up -d $(METRICS_STACK)


minimal_stack:
	$(DC) up -d $(MINIMAL_STACK)

down:
	$(DC) down $(MINIMAL_STACK) $(METRICS_STACK) $(LOGS_STACK)

fdown: 
	$(DC) down -v $(MINIMAL_STACK) $(METRICS_STACK) $(LOGS_STACK)

.PHONY: minimal_up minimal_down metrics_up metrics_down logs_up logs_down setup setup_postgres setup_elasticsearch setup_kibana up down fdown