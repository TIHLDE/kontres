#!/bin/sh
set -e

# Migrer før serveren tar imot trafikk.
#
# `migrate deploy` kjører bare det som mangler og er en no-op ellers, så dette
# koster et par sekunder på en oppstart der alt allerede er på plass.
#
# Feiler migrasjonen, stopper vi. En app som kjører mot et skjema den ikke
# forventer feiler uansett — men da én forespørsel om gangen, på et tidspunkt
# ingen kobler til deployet.
echo "-> prisma migrate deploy"
prisma migrate deploy

echo "-> starter appen"
exec "$@"
