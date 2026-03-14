# ── Stage 1: install Python dependencies ────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

COPY packages/sdk-py ./packages/sdk-py
COPY examples/research-agent/requirements.txt ./examples/research-agent/requirements.txt

RUN pip install --no-cache-dir \
    --target /app/site-packages \
    ./packages/sdk-py \
    -r ./examples/research-agent/requirements.txt

# ── Stage 2: lean runtime image with Cloudflare Sandbox binary ───────────────
FROM python:3.11-slim

# Inject the Cloudflare Sandbox agent binary
COPY --from=cloudflare/sandbox /container-server/sandbox /sandbox

WORKDIR /app

COPY --from=builder /app/site-packages /app/site-packages
COPY examples/research-agent/main.py ./main.py

ENV PYTHONPATH="/app/site-packages"

# Environment — override at runtime via Cloudflare Sandbox env vars
ENV RELAY_B_URL=""
ENV NATS_URL=""
ENV RELAY_DOMAIN="company-b.aamp.workers.dev"
ENV AGENT_ID="research-bot-01"

ENTRYPOINT ["/sandbox"]
CMD ["python", "main.py"]
