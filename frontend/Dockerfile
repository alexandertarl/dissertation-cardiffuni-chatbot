FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app/

COPY package.json pnpm-lock.yaml /app/

RUN --mount=type=cache,target=/root/.local/share/pnpm/store --mount=type=cache,target=/root/.cache/pnpm/metadata \
    pnpm install

COPY . /app/

RUN pnpm build

CMD ["node", ".output/server/index.mjs"]
EXPOSE 3000
