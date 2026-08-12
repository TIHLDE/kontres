FROM node:24-alpine AS base

RUN apk add --no-cache openssl

FROM base AS deps

WORKDIR /build

COPY package.json pnpm-lock.yaml ./
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

USER app

ENV NODE_ENV=production

EXPOSE 3000

RUN rm -f .env* || true

CMD [ "node", "server.js" ]

