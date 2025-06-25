#!/usr/bin/env bash
set -e

echo "🛠️ Initializing Postgres..."

# Set timezone
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c \
  "SET TIME ZONE 'Africa/Casablanca';"

# === Create users ===
declare -A USERS=(
  ["auth"]=$AUTH_DB_PASSWORD
  ["chat"]=$CHAT_DB_PASSWORD
  ["game"]=$GAME_DB_PASSWORD
  ["dash"]=$DASH_DB_PASSWORD
  ["monitor"]=$MONITOR_DB_PASSWORD
)

for user in "${!USERS[@]}"; do
  PASSWORD="${USERS[$user]}"
  echo "🔧 Creating user: $user"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$user') THEN
        CREATE USER "$user" WITH PASSWORD '$PASSWORD';
      END IF;
    END
    \$\$;
EOSQL
done

# === Create admin user ===
echo "🔧 Creating admin user..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
      CREATE USER "admin" WITH 
        SUPERUSER CREATEDB CREATEROLE REPLICATION BYPASSRLS
        PASSWORD '$ADMIN_DB_PASSWORD';
    END IF;
  END
  \$\$;
EOSQL

# === Create databases ===
declare -A DBS=(
  ["auth_db"]="auth"
  ["chat_db"]="chat"
  ["game_db"]="game"
  ["dash_db"]="dash"
)

for db in "${!DBS[@]}"; do
  OWNER="${DBS[$db]}"
  echo "🗄️ Creating database: $db (owner: $OWNER)"
  if ! psql -U "$POSTGRES_USER" -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
    createdb -U "$POSTGRES_USER" -O "$OWNER" "$db"
    echo "✅ Created database $db"
  else
    echo "ℹ️ Database $db already exists"
  fi
done

# === Grant privileges ===
echo "🔐 Granting privileges..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  GRANT ALL PRIVILEGES ON DATABASE "auth_db" TO "admin";
  GRANT ALL PRIVILEGES ON DATABASE "chat_db" TO "admin";
  GRANT ALL PRIVILEGES ON DATABASE "game_db" TO "admin";
  GRANT ALL PRIVILEGES ON DATABASE "dash_db" TO "admin";

  GRANT pg_monitor, pg_read_all_settings, pg_read_all_stats, pg_stat_scan_tables TO "monitor";
EOSQL

echo "✅ PostgreSQL setup complete!"
