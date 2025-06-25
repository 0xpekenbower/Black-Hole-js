#!/bin/bash

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting Kafka initialization script..."

log "Running original Kafka entrypoint..."
/__cacert_entrypoint.sh /etc/kafka/docker/run &

KAFKA_PID=$!

log "Waiting for Kafka to be ready..."
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

create_topics() {
  log "Creating Kafka topics..."
  
  log "Creating 'newUser' topic..."
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create \
    --topic newUser \
    --partitions 1 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=43200000 \
    --config segment.bytes=104857600 \
    --if-not-exists
  
  log "Creating 'OTP' topic..."
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create \
    --topic OTP \
    --partitions 1 \
    --replication-factor 1 \
    --config cleanup.policy=delete \
    --config retention.ms=43200000 \
    --config segment.bytes=104857600 \
    --if-not-exists

  log "Verifying topics created:"
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
  
  log "Topic details:"
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic newUser
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic OTP
}

create_topics

log "Kafka setup completed successfully. Waiting for the Kafka process..."

wait $KAFKA_PID
