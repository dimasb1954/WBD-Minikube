#!/bin/sh

# Initialize PostgreSQL data directory
mkdir -p /run/postgresql
chown postgres:postgres /run/postgresql
su postgres -c "initdb -D /var/lib/postgresql/data"

# Start PostgreSQL
su postgres -c "postgres -D /var/lib/postgresql/data &"

# Wait for PostgreSQL to be ready
until su postgres -c "psql -c '\q'" >/dev/null 2>&1; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 2
done

# Create database and user
su postgres -c "createdb ${POSTGRES_DB}"
su postgres -c "psql -c \"ALTER USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';\""

# Start Redis
redis-server --daemonize yes

# Run database migrations
npx prisma migrate deploy

# Start the Node.js application
npm run dev

