FROM node:20-alpine AS base

RUN npm i -g pnpm

FROM base AS deps
WORKDIR /app


# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chmod +x ./entrypoint.sh

RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package.json
COPY --from=builder /app/dist ./



EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]