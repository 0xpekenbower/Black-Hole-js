MINIMAL_STACK = frontend gateway nginx postgres_db redis auth dashboard chat game
METRICS_STACK = grafana prometheus node_exporter cadvisor redis_exporter postgres_exporter
LOGS_STACK = elasticsearch kibana logstash vector
ALL_STACK = $(MINIMAL_STACK) $(METRICS_STACK) $(LOGS_STACK)
DC = docker compose -f ./docker-compose.yml -f ./infra/infra.yml -f ./services/services.yml -f ./metrics/metrics.yml -f ./logs/logs.yml -p blackholejs

# Function to check if all services are running
define check_services_running
	@for service in frontend gateway nginx redis postgres_db auth dashboard chat game; do \
		if [ -z "$$(docker ps -q -f name=$$service)" ]; then \
			echo "Service $$service is not running"; \
			exit 1; \
		fi; \
	done
endef

all: build minimal_stack metrics_stack logs_stack

build:
	@$(DC) build setup 
	@$(DC) build
	@clear

logs_stack:
	$(call check_services_running)
	@$(DC) up -d elasticsearch kibana logstash vector
	@$(DC) up setup
	@until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ] || [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "dead" ]; do \
		echo "Setup still running, waiting..."; \
		sleep 5; \
	done
	@$(DC) rm -f setup

metrics_stack:
	$(call check_services_running)
	@$(DC) up -d $(METRICS_STACK)

minimal_stack:
	@$(DC) up -d $(MINIMAL_STACK)

#up all services no need build
up:
	@$(DC) up -d $(ALL_STACK)

down:
	@$(DC) down 
fdown: 
	@$(DC) down -v $(MINIMAL_STACK) 
	@$(DC) down -v $(METRICS_STACK)
	@$(DC) down -v $(LOGS_STACK)


ressource_usage:


.PHONY: minimal_up minimal_down metrics_up metrics_down logs_up logs_down setup setup_postgres setup_elasticsearch setup_kibana up down fdown