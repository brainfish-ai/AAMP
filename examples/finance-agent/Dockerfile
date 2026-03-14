# ── Stage 1: build the monorepo packages ────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/core/package.json       ./packages/core/
COPY packages/identity/package.json   ./packages/identity/
COPY packages/sdk-ts/package.json     ./packages/sdk-ts/
COPY examples/finance-agent/package.json ./examples/finance-agent/

RUN pnpm install --frozen-lockfile

# Copy source and build in dependency order
COPY packages/core       ./packages/core
COPY packages/identity   ./packages/identity
COPY packages/sdk-ts     ./packages/sdk-ts
COPY examples/finance-agent ./examples/finance-agent

RUN pnpm --filter @aamp/core build && \
    pnpm --filter @aamp/identity build && \
    pnpm --filter @aamp/sdk build && \
    pnpm --filter @aamp/example-finance-agent build

# ── Stage 2: lean runtime image with Cloudflare Sandbox binary ───────────────
FROM node:22-alpine

# Inject the Cloudflare Sandbox agent binary (exposes exec, file, WebSocket APIs)
COPY --from=cloudflare/sandbox /container-server/sandbox /sandbox

WORKDIR /app

# Copy compiled output only
COPY --from=builder /app/packages/core/dist            ./packages/core/dist
COPY --from=builder /app/packages/core/package.json    ./packages/core/package.json
COPY --from=builder /app/packages/identity/dist        ./packages/identity/dist
COPY --from=builder /app/packages/identity/package.json ./packages/identity/package.json
COPY --from=builder /app/packages/sdk-ts/dist          ./packages/sdk-ts/dist
COPY --from=builder /app/packages/sdk-ts/package.json  ./packages/sdk-ts/package.json
COPY --from=builder /app/examples/finance-agent/dist   ./examples/finance-agent/dist
COPY --from=builder /app/examples/finance-agent/package.json ./examples/finance-agent/package.json
COPY --from=builder /app/node_modules                  ./node_modules

# Environment — override at runtime via Cloudflare Sandbox env vars
ENV RELAY_A_URL=""
ENV RELAY_B_URL=""
ENV NATS_URL=""
ENV RESEARCH_AGENT_ID="research-bot-01"

ENTRYPOINT ["/sandbox"]
CMD ["node", "examples/finance-agent/dist/index.js"]
