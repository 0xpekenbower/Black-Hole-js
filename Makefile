DCM = docker compose -f docker-compose.yml

# Core Stack
core-build:
	$(DCM) --profile core build

core-up:
	$(DCM) --profile core up -d

core-down:
	$(DCM) --profile core down

core-restart:
	$(DCM) --profile core restart

core-clean:
	$(DCM) --profile core down -v

# Observability Stack
obsy-build:
	$(DCM) --profile obsy build

obsy-up:
	$(DCM) --profile obsy up -d

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

# Setup
setup-build:
	$(DCM) --profile setup build setup

setup-run:
	$(DCM) --profile setup up -d
	until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ]; do \
		sleep 1; \
	done
	docker rm setup

build: setup-build core-build obsy-build monitoring-build
up: setup-run core-up obsy-up monitoring-up
down:
	$(DCM) down
restart:
	$(DCM) restart
clean:
	$(DCM) down -v
logs:
	$(DCM) logs -f
all: build up

