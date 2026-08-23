# syntax=docker/dockerfile:1
#
# @shoply/panel — Next.js standalone app (not a pnpm workspace).
# Build context = panel/ directory itself.
#
# Coolify settings for this service:
#   Build Pack:          Dockerfile
#   Base Directory:      /panel
#   Dockerfile Location: /Dockerfile

# ---- build ----
FROM node:22-bookworm-slim AS build
RUN npm install -g pnpm@10.25.0
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars are inlined into the bundle at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DIRECTUS_URL
ARG NEXT_PUBLIC_CENTRIFUGO_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_DIRECTUS_URL=$NEXT_PUBLIC_DIRECTUS_URL \
    NEXT_PUBLIC_CENTRIFUGO_URL=$NEXT_PUBLIC_CENTRIFUGO_URL

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- runtime ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0

# Next.js standalone output (server.js + minimal node_modules)
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=3s --retries=3 --start-period=15s \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
