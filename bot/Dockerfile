FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY bot/package.json bot/pnpm-lock.yaml bot/pnpm-workspace.yaml ./

RUN corepack enable \
  && corepack prepare pnpm@11.0.8 --activate \
  && pnpm install --frozen-lockfile --prod

FROM node:22-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable \
  && corepack prepare pnpm@11.0.8 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY bot/package.json bot/pnpm-lock.yaml bot/pnpm-workspace.yaml ./
COPY bot/commands ./commands
COPY bot/utils ./utils
COPY bot/deploy-commands.js bot/index.js ./

CMD ["pnpm", "start"]
