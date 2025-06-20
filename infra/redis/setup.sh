#!/bin/sh

# Set the password for Redis
sed -i "s/REDIS_PASSWORD/${REDIS_PASSWORD}/g" /usr/local/etc/redis/redis.conf

# Start Redis
redis-server /usr/local/etc/redis/redis.conf