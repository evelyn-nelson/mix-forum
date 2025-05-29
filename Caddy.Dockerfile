FROM caddy:2.10.0-builder-alpine AS builder

RUN xcaddy build \
    --with github.com/WeidiDeng/caddy-cloudflare-ip

FROM caddy:2.10.0-alpine

COPY --from=builder /usr/bin/caddy /usr/bin/caddy
