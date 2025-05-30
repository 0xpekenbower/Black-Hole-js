create_network:
	docker network create --driver bridge blackholejs || true

slogs_up: create_network
	docker compose -f ./docker-compose.yml -f ./logs/logs.yml -p blackholejs up -d

smetrics_up: create_network
	docker compose -f ./docker-compose.yml -f ./metrics/metrics.yml -p blackholejs up -d

sinfra_up: create_network
	docker compose -f ./docker-compose.yml -f ./infra/infra.yml -p blackholejs up -d

slogs_down:
	docker compose -f ./docker-compose.yml -f ./logs/logs.yml -p blackholejs down -v

smetrics_down:
	docker compose -f ./docker-compose.yml -f ./metrics/metrics.yml -p blackholejs down -v

sinfra_down:
	docker compose -f ./docker-compose.yml -f ./infra/infra.yml -p blackholejs down -v


up: create_network
	make sinfra_up
	make slogs_up
	make smetrics_up

down:
	sinfra_down
	slogs_down
	smetrics_down

clean:
	sinfra_down -v
	slogs_down -v
	smetrics_down -v

.PHONY: up down clean slogs_up smetrics_up sinfra_up slogs_down smetrics_down sinfra_down create_network