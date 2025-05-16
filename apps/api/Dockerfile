FROM node:18-slim AS base

FROM base AS builder

# In Debian, glibc is already present so libc6-compat is not needed.
RUN apt-get update && apt-get install -y bash openssl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /server

RUN apt-get update && apt-get install -y curl openssl bash && rm -rf /var/lib/apt/lists/*
RUN curl -L https://unpkg.com/@pnpm/self-installer | node

ENV SHELL=/bin/bash

RUN pnpm setup
RUN pnpm init

ENV PNPM_HOME=/usr/local/bin

RUN pnpm install turbo --global

COPY . .

RUN turbo prune api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

# No need for libc6-compat in Debian; just update package lists.
RUN apt-get update && rm -rf /var/lib/apt/lists/*

WORKDIR /server

RUN apt-get update && apt-get install -y openssl curl bash && rm -rf /var/lib/apt/lists/*
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
ENV SHELL=/bin/bash
RUN pnpm setup
ENV PNPM_HOME=/usr/local/bin

RUN pnpm install turbo --global

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /server/out/json/ .
COPY --from=builder /server/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Build the project and its dependencies
COPY --from=builder /server/out/full/ .
RUN ls -l
COPY turbo.json turbo.json

RUN pnpm install

RUN turbo build --filter=@saas-monorepo/database
RUN turbo build --filter=api

FROM base AS runner

WORKDIR /server

# Install required packages using apt-get (glibc is built-in)
RUN apt-get update && apt-get install -y openssl openssh-client bash curl ca-certificates wget && rm -rf /var/lib/apt/lists/*

# Don't run production as root
RUN groupadd --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs fastify

USER fastify

COPY --from=installer /server .

EXPOSE 8000

CMD node apps/api/dist/index.js