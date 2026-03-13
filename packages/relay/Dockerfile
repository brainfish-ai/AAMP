FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/core/package.json ./packages/core/
COPY packages/identity/package.json ./packages/identity/
COPY packages/relay/package.json ./packages/relay/
RUN pnpm install --frozen-lockfile

COPY packages/core/ ./packages/core/
COPY packages/identity/ ./packages/identity/
COPY packages/relay/ ./packages/relay/
COPY tsconfig.base.json ./

RUN pnpm --filter @aamp/core build
RUN pnpm --filter @aamp/identity build
RUN pnpm --filter @aamp/relay build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/identity/dist ./packages/identity/dist
COPY --from=builder /app/packages/identity/package.json ./packages/identity/
COPY --from=builder /app/packages/relay/dist ./packages/relay/dist
COPY --from=builder /app/packages/relay/package.json ./packages/relay/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/node_modules ./packages/core/node_modules
COPY --from=builder /app/packages/identity/node_modules ./packages/identity/node_modules
COPY --from=builder /app/packages/relay/node_modules ./packages/relay/node_modules

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "packages/relay/dist/index.js"]
