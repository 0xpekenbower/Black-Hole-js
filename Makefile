DC = docker compose -f ./docker-compose.yml -f ./infra/infra.yml -f ./services/services.yml -f ./metrics/metrics.yml -f ./logs/logs.yml -p blackholejs


all: build up

build:
	@$(DC) build setup
	@$(DC) build

up:
	@$(DC) up -d postgres_db elasticsearch kibana grafana kafka
	sleep 20
	@$(DC) up -d setup
	sleep 20
	@$(DC) up -d nginx redis pgadmin
	sleep 20
	@$(DC) up -d logstash vector prometheus node_exporter cadvisor redis_exporter postgres_exporter kafka-exporter nginx-exporter
	sleep 30
	@$(DC) up -d frontend gateway auth dash chat game

logs:
	@$(DC) logs -f

down:
	@$(DC) down

fdown:
	@$(DC) down -v