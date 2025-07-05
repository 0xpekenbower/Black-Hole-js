DCM = docker compose -f docker-compose.yml

all: build up
# Core Stack
core-build:
	$(DCM) --profile core build

core-up:
	$(DCM) --profile core up -d

core-down:
	$(DCM) --profile core down gateway
	$(DCM) --profile core down 

core-restart:
	$(DCM) --profile core down frontend auth dash
	$(DCM) --profile core build frontend auth dash
	$(DCM) --profile core up -d frontend auth dash

core-clean: core-down
	$(DCM) --profile core down -v

# Observability Stack
obsy-build:
	$(DCM) --profile obsy build

obsy-up:
	$(DCM) --profile obsy up -d elasticsearch kibana
	until [ "$$(docker inspect -f '{{.State.Status}}' elasticsearch 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	until [ "$$(docker inspect -f '{{.State.Status}}' kibana 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	$(DCM) --profile obsy up -d setup
	until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ]; do \
		sleep 1; \
	done
	docker rm setup
	$(DCM) --profile obsy up -d apm-server logstash

obsy-down:
	$(DCM) --profile obsy down

obsy-restart:
	$(DCM) --profile obsy restart

obsy-clean:
	$(DCM) --profile obsy down -v

# Monitoring Stack
monitoring-build:
	$(DCM) --profile monitoring build

monitoring-up:
	$(DCM) --profile monitoring up -d

monitoring-down:
	$(DCM) --profile monitoring down

monitoring-restart:
	$(DCM) --profile monitoring restart

monitoring-clean:
	$(DCM) --profile monitoring down -v

infra-build:
	$(DCM) --profile infra build 

infra-up:
	$(DCM) --profile infra up -d fluentd
	until [ "$$(docker inspect -f '{{.State.Status}}' fluentd 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	$(DCM) --profile infra up -d

infra-down:
	$(DCM) --profile infra down 

infra-restart:
	$(DCM) --profile infra restart

infra-clean: infra-down
	$(DCM) --profile infra down -v


build: infra-build core-build obsy-build monitoring-build

up: infra-up obsy-up monitoring-up core-up 

down: monitoring-down obsy-down core-down infra-down

restart: infra-restart obsy-restart monitoring-restart core-restart 

clean: monitoring-clean obsy-clean core-clean infra-clean
	docker volume prune -a

logs:
	$(DCM) logs -f

fclean: clean
	docker system prune -a
	docker network prune -f 