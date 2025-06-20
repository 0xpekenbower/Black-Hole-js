DCM = docker compose -f docker-compose.yml

all: build up

up:
	@echo "Starting all services..."
	docker compose -f ./docker-compose.yml up -d setup
	until [ "$$(docker inspect -f '{{.State.Status}}' setup 2>/dev/null)" = "exited" ]; do \
		sleep 1; \
	done;
	docker rm setup
	docker compose -f ./docker-compose.yml up -d

down:
	@echo "Stopping all services..."
	docker compose -f ./docker-compose.yml down

build:
	@echo "Building all services..."
	docker compose -f ./docker-compose.yml build
	docker compose -f ./docker-compose.yml build setup

restart:
	@echo "Restarting all services..."
	docker compose -f ./docker-compose.yml restart

logs:
	docker compose -f ./docker-compose.yml logs -f

clean:
	@echo "Cleaning up..."
	docker compose -f ./docker-compose.yml down -v