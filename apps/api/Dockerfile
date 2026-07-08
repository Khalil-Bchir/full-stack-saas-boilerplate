FROM node:22-slim AS base

FROM base AS builder

RUN apt-get update && apt-get install -y bash openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /server

RUN corepack enable && corepack prepare pnpm@10.12.4 --activate
RUN pnpm install turbo --global

COPY . .

RUN turbo prune @saas-boilerplate/api --docker

FROM base AS installer

RUN apt-get update && rm -rf /var/lib/apt/lists/*

WORKDIR /server

RUN apt-get update && apt-get install -y openssl bash && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.12.4 --activate
RUN pnpm install turbo --global

COPY .gitignore .gitignore
COPY --from=builder /server/out/json/ .
COPY --from=builder /server/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /server/out/full/ .
COPY turbo.json turbo.json

RUN pnpm install

RUN turbo build --filter=@saas-boilerplate/api

FROM base AS runner

WORKDIR /server

RUN apt-get update && apt-get install -y openssl openssh-client bash curl ca-certificates wget && rm -rf /var/lib/apt/lists/*

RUN groupadd --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs fastify

USER fastify

COPY --from=installer /server .

EXPOSE 8000

CMD ["node", "apps/api/dist/index.js"]
