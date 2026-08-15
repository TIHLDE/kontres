FROM node:24-alpine AS base

RUN apk add --no-cache openssl

FROM base AS deps

WORKDIR /build

# pnpm-workspace.yaml må være med: den holder overrides, og uten den løser
# installasjonen andre versjoner enn pnpm-lock.yaml er skrevet for — da faller
# `--frozen-lockfile` og bygget stopper.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

# Samme versjon som `packageManager` i package.json. Uten versjonen henter
# npm nyeste pnpm, og nyere pnpm prøver da å selv-installere den pinnede
# versjonen via @pnpm/exe og verifisere den mot pnpm-lock.yaml. Den oppføringen
# finnes ikke i lockfila, så bygget dør på «Cannot verify the identity of the
# @pnpm/exe.linux-x64 native binary». Holdes i synk med package.json.
RUN npm i -g pnpm@10.33.0

RUN pnpm i --frozen-lockfile

COPY . .


FROM deps AS builder

ARG SKIP_ENV_VALIDATION=1

RUN pnpm build


FROM base AS runner

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /build/.next/standalone ./
COPY --from=builder --chown=app:app /build/.next/static ./.next/static

# Skjemaet og migrasjonene, så containeren kan migrere seg selv ved oppstart.
COPY --from=builder --chown=app:app /build/prisma ./prisma

# Prisma-CLI-en globalt i stedet for kopiert fra deps-steget: pnpm lager
# symlenker inn i .pnpm-mappa, og de overlever ikke en COPY --from.
# Samme versjon som pnpm-lock.yaml låser.
RUN npm i -g prisma@6.16.3

RUN rm -f .env* || true

# Kjører migrasjonene før serveren starter.
#
# Verken deploy.yml eller Drift gjør det: workflowen bygger imaget og varsler,
# og Drift henter og starter det. `prisma migrate deploy` fantes bare i
# deploy.sh, som er den manuelle veien. Da PhotonSession kom med
# Photon-innloggingen, ble tabellen derfor aldri opprettet i prod, og
# innloggingen stoppet stille i callbacket.
#
# `migrate deploy` kjører bare migrasjoner som mangler, og er en no-op når alt
# er på plass — trygt på hver eneste oppstart.
COPY --chown=app:app docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER app

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT [ "/usr/local/bin/docker-entrypoint.sh" ]
CMD [ "node", "server.js" ]

