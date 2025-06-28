DCM = docker compose -f docker-compose.yml

# Core Stack
core-build:
	$(DCM) --profile core build

core-up:
	$(DCM) --profile core up -d

core-down:
	$(DCM) --profile core down gateway
	$(DCM) --profile core down 

core-restart:
	$(DCM) --profile core restart

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
	$(DCM) --profile obsy up -d logstash apm-server

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
	$(DCM) --profile infra up -d postgres_db
	until [ "$$(docker inspect -f '{{.State.Status}}' postgres_db 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	$(DCM) --profile infra up -d kafka
	until [ "$$(docker inspect -f '{{.State.Status}}' kafka 2>/dev/null)" = "running" ]; do \
		sleep 1; \
	done
	$(DCM) --profile infra up -d redis nginx

infra-down:
	$(DCM) --profile infra down postgres_db
	$(DCM) --profile infra down -v kafka
	$(DCM) --profile infra down redis
	$(DCM) --profile infra down nginx
	$(DCM) --profile infra down fluentd

infra-restart:
	$(DCM) --profile infra restart

infra-clean: infra-down
	$(DCM) --profile infra down -v

# setup-run:
# 	$(DCM) --profile setup up -d
# 	until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ]; do \
# 		sleep 1; \
# 	done
# 	docker rm setup

build: infra-build core-build obsy-build monitoring-build

up: infra-up core-up obsy-up monitoring-up

down: monitoring-down obsy-down core-down infra-down

restart: monitoring-restart obsy-restart core-restart infra-restart

clean: monitoring-clean obsy-clean core-clean infra-clean
	docker volume prune -a

logs:
	$(DCM) logs -f

all: build up

fclean: clean
	docker system prune -a
	docker network prune -f 