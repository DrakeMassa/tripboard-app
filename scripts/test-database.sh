#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:=postgresql://postgres:postgres@localhost:5432/tripboard_test}"
command -v psql >/dev/null || { echo 'psql is required (CI provides PostgreSQL 16)'; exit 2; }
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/bootstrap.sql
for migration in supabase/migrations/*.sql; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration"
done
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
echo 'Database migration and security tests passed.'
