#!/usr/bin/env bash

set -e

COMMIT_HASH=$(git rev-parse --short HEAD)

echo "-> Building new Docker image"
docker build --no-cache -t dev-kontres.tihlde.org:$COMMIT_HASH .

echo "-> Migrating database"
prisma migrate deploy

echo "-> Stopping and removing old container"
docker rm -f dev-kontres.tihlde.org || true

echo "-> Starting new container"
docker run --env-file .env -p 9000:3000 --name dev-kontres.tihlde.org --restart unless-stopped -d dev-kontres.tihlde.org:$COMMIT_HASH
