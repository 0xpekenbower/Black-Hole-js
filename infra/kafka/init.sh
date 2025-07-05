#!/bin/bash

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Kafka initialization script..."

# Start Kafka in background
/__cacert_entrypoint.sh /etc/kafka/docker/run &

KAFKA_PID=$!
MAX_RETRIES=30
RETRY_INTERVAL=5

check_kafka() {
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list > /dev/null 2>&1
  return $?
}

# Wait for Kafka to be ready
for i in $(seq 1 $MAX_RETRIES); do
  log "Attempt $i/$MAX_RETRIES: Checking if Kafka is ready..."
  if check_kafka; then
    log "Kafka is ready!"
    break
  fi
  if [ $i -eq $MAX_RETRIES ]; then
    log "ERROR: Kafka failed to start after $MAX_RETRIES attempts"
    exit 1
  fi
  log "Kafka not ready yet. Waiting $RETRY_INTERVAL seconds..."
  sleep $RETRY_INTERVAL
done

create_topic() {
  local topic=$1
  log "Creating topic '$topic'..."
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create \
    --topic "$topic" \
    --partitions 1 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=43200000 \
    --config segment.bytes=104857600 \
    --if-not-exists
}

create_topics() {
  create_topic "newUser"
  create_topic "OTP"
  create_topic "notifications"
  create_topic "userEvents"
}

create_topics

log "Stopping Kafka to restart in foreground..."

# Stop Kafka cleanly
kill $KAFKA_PID
wait $KAFKA_PID

log "Kafka stopped. Starting Kafka in foreground with exec..."

# Exec Kafka so PID 1 stays Kafka process (important for Docker container)
exec /__cacert_entrypoint.sh /etc/kafka/docker/run
