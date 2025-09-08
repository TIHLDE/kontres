#!/usr/bin/env bash

set -e

COMMIT_HASH=$(git rev-parse --short HEAD)

echo "-> Building new Docker image"
docker build --no-cache -t kontres.tihlde.org:$COMMIT_HASH .

echo "-> Migrating database"
prisma migrate deploy

echo "-> Stopping and removing old container"
docker rm -f kontres.tihlde.org || true

echo "-> Starting new container"
docker run --env-file .env -p 9000:3000 --name kontres.tihlde.org --restart unless-stopped -d kontres.tihlde.org:$COMMIT_HASH
