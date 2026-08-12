#!/usr/bin/env bash
# Run the SQL migration using psql. Set PG_CONN env var to your Postgres connection string.
# Example:
#   export PG_CONN="postgres://user:password@host:5432/postgres"
#   ./migrations/run_migration.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/20260818_one_to_one_requests.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "Migration file not found: $SQL_FILE"
  exit 1
fi

if [ -z "$PG_CONN" ]; then
  echo "PG_CONN is not set. Set it to your Postgres connection string, e.g. postgres://user:pass@host:5432/postgres"
  exit 1
fi

echo "Applying migration: $SQL_FILE"
psql "$PG_CONN" -f "$SQL_FILE"
EXIT=$?
if [ $EXIT -ne 0 ]; then
  echo "psql exited with $EXIT"
  exit $EXIT
fi
echo "Migration applied successfully."
