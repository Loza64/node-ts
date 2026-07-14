FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++ libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm test

RUN pnpm build

FROM node:22-alpine AS runner

ENV NODE_ENV=production

RUN addgroup -S nodejs && adduser -S nodets -G nodejs
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nodets
EXPOSE 4000

CMD ["node", "build/index"]