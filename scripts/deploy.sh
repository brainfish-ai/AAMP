#!/usr/bin/env bash
# =============================================================================
# AAMP — Full stack deployment: Synadia Cloud + Cloudflare Workers + Vercel
#
# Usage:
#   cp .env.deploy.example .env.deploy   # fill in your values
#   source .env.deploy
#   bash scripts/deploy.sh
#
# What this script deploys:
#   1. Relay A  →  Cloudflare Worker  (aamp-relay-a)
#   2. Relay B  →  Cloudflare Worker  (aamp-relay-b)
#   3. Demo UI  →  Vercel             (Next.js, with Vercel Sandbox for agents)
#
# Pre-requisites (installed automatically if missing):
#   - wrangler  (Cloudflare Workers CLI)
#   - vercel    (Vercel CLI)
# =============================================================================

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[deploy]${NC} $*"; }
success() { echo -e "${GREEN}[deploy]${NC} ✓ $*"; }
warn()    { echo -e "${YELLOW}[deploy]${NC} ⚠ $*"; }
fatal()   { echo -e "${RED}[deploy]${NC} ✗ $*"; exit 1; }

# ── 0. Prerequisites ──────────────────────────────────────────────────────────

info "Checking prerequisites..."

if ! command -v node &>/dev/null; then fatal "Node.js not found. Install from https://nodejs.org"; fi
if ! command -v pnpm &>/dev/null; then fatal "pnpm not found. Run: corepack enable"; fi

# Install wrangler if missing
if ! command -v wrangler &>/dev/null; then
  info "Installing wrangler..."
  pnpm add -g wrangler
fi

# Install vercel CLI if missing
if ! command -v vercel &>/dev/null; then
  info "Installing vercel CLI..."
  pnpm add -g vercel
fi

# ── 1. Validate required env vars ─────────────────────────────────────────────

info "Validating environment variables..."

REQUIRED_VARS=(NATS_URL NATS_CREDS REPO_URL)
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    fatal "$var is not set. Run: source .env.deploy (copy from .env.deploy.example)"
  fi
done

success "Environment variables OK"

# ── 2. Synadia Cloud (informational) ─────────────────────────────────────────

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN} Step 1/3: Synadia Cloud (NATS)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  NATS_URL is set to: ${NATS_URL}"
echo ""
echo "  If you haven't set up Synadia Cloud yet:"
echo "  1. Go to  https://cloud.synadia.com/register  (free, no credit card)"
echo "  2. Create a new NATS Account"
echo "  3. Download the credentials file (.creds)"
echo "  4. Set NATS_CREDS to the file contents in .env.deploy"
echo "  5. Set NATS_URL to your wss:// endpoint (default: wss://connect.ngs.global)"
echo ""
read -r -p "  Press Enter to continue to Cloudflare deployment..."

# ── 3. Cloudflare Workers — Relay A and Relay B ───────────────────────────────

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN} Step 2/3: Cloudflare Workers (Relay A + Relay B)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

cd packages/relay

info "Authenticating with Cloudflare..."
wrangler whoami 2>/dev/null || wrangler login

# ── Create KV namespaces ──────────────────────────────────────────────────────

info "Creating KV namespace for relay-a..."
KV_A_OUTPUT=$(wrangler kv:namespace create KV_AGENTS 2>&1)
echo "$KV_A_OUTPUT"
KV_A_ID=$(echo "$KV_A_OUTPUT" | grep -oE 'id = "[a-f0-9]+"' | grep -oE '[a-f0-9]{32}' | head -1)
if [[ -z "$KV_A_ID" ]]; then
  warn "Could not auto-extract KV namespace ID for relay-a."
  warn "Please paste the 'id' value shown above:"
  read -r KV_A_ID
fi
success "KV relay-a: $KV_A_ID"

info "Creating KV namespace for relay-b..."
KV_B_OUTPUT=$(wrangler kv:namespace create KV_AGENTS --env relay-b 2>&1)
echo "$KV_B_OUTPUT"
KV_B_ID=$(echo "$KV_B_OUTPUT" | grep -oE 'id = "[a-f0-9]+"' | grep -oE '[a-f0-9]{32}' | head -1)
if [[ -z "$KV_B_ID" ]]; then
  warn "Could not auto-extract KV namespace ID for relay-b."
  warn "Please paste the 'id' value shown above:"
  read -r KV_B_ID
fi
success "KV relay-b: $KV_B_ID"

# ── Patch wrangler.toml with actual KV IDs ────────────────────────────────────

info "Patching wrangler.toml with KV namespace IDs..."
# macOS-compatible sed (works on both macOS and Linux)
sed -i.bak \
  -e "s/REPLACE_WITH_KV_NAMESPACE_ID/${KV_A_ID}/" \
  -e "s/REPLACE_WITH_RELAY_B_KV_NAMESPACE_ID/${KV_B_ID}/" \
  wrangler.toml
rm -f wrangler.toml.bak
success "wrangler.toml updated"

# ── Set Worker secrets ────────────────────────────────────────────────────────

info "Setting secrets for relay-a..."
echo "$NATS_URL"          | wrangler secret put NATS_URL
# NATS_CREDS accepts either a plain access token (Synadia free tier)
# or a full .creds file (paid) — the relay auto-detects which format.
printf '%s' "$NATS_CREDS" | wrangler secret put NATS_CREDS

info "Setting secrets for relay-b..."
echo "$NATS_URL"          | wrangler secret put NATS_URL  --env relay-b
printf '%s' "$NATS_CREDS" | wrangler secret put NATS_CREDS --env relay-b

# ── Deploy ────────────────────────────────────────────────────────────────────

info "Deploying relay-a..."
RELAY_A_URL=$(wrangler deploy 2>&1 | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | head -1)
success "relay-a deployed: ${RELAY_A_URL:-<check Cloudflare dashboard>}"

info "Deploying relay-b..."
RELAY_B_URL=$(wrangler deploy --env relay-b 2>&1 | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | head -1)
success "relay-b deployed: ${RELAY_B_URL:-<check Cloudflare dashboard>}"

if [[ -z "$RELAY_A_URL" || -z "$RELAY_B_URL" ]]; then
  warn "Could not auto-detect relay URLs. Please enter them manually:"
  [[ -z "$RELAY_A_URL" ]] && { read -r -p "  Relay A URL: " RELAY_A_URL; }
  [[ -z "$RELAY_B_URL" ]] && { read -r -p "  Relay B URL: " RELAY_B_URL; }
fi

cd "$REPO_ROOT"

# ── 4. Vercel — Demo UI ───────────────────────────────────────────────────────

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN} Step 3/3: Vercel (Demo UI + Vercel Sandbox agents)${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo ""

cd apps/demo-ui

VERCEL_SCOPE="${VERCEL_SCOPE:-brainfish}"

info "Authenticating with Vercel (scope: $VERCEL_SCOPE)..."
vercel whoami --scope "$VERCEL_SCOPE" 2>/dev/null || vercel login

info "Linking project to Vercel (team: $VERCEL_SCOPE)..."
vercel link --yes --scope "$VERCEL_SCOPE" 2>/dev/null || vercel link --scope "$VERCEL_SCOPE"

# ── Set Vercel environment variables ─────────────────────────────────────────

info "Setting Vercel environment variables..."
set_vercel_env() {
  local key="$1" value="$2"
  # Remove existing value then add fresh (avoid duplicate error)
  vercel env rm "$key" production --yes --scope "$VERCEL_SCOPE" 2>/dev/null || true
  echo "$value" | vercel env add "$key" production --scope "$VERCEL_SCOPE"
}

set_vercel_env "RELAY_A_URL" "$RELAY_A_URL"
set_vercel_env "RELAY_B_URL" "$RELAY_B_URL"
set_vercel_env "NATS_URL"    "$NATS_URL"
set_vercel_env "NATS_CREDS"  "$NATS_CREDS"
set_vercel_env "REPO_URL"    "$REPO_URL"

success "Vercel environment variables set"

# ── Deploy ────────────────────────────────────────────────────────────────────

info "Deploying demo-ui to Vercel (production, scope: $VERCEL_SCOPE)..."
DEMO_URL=$(vercel deploy --prod --scope "$VERCEL_SCOPE" 2>&1 | grep -oE 'https://[a-zA-Z0-9._-]+\.vercel\.app' | head -1)
success "Demo UI deployed: ${DEMO_URL:-<check Vercel dashboard>}"

cd "$REPO_ROOT"

# ── 5. Summary ────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN} Deployment complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "  NATS (Synadia)   ${NATS_URL}"
echo "  Relay A          ${RELAY_A_URL}"
echo "  Relay B          ${RELAY_B_URL}"
echo "  Demo UI          ${DEMO_URL:-<check Vercel dashboard>}"
echo ""
echo "  Next steps:"
echo "  1. Open the Demo UI and click 'Start Live Demo'"
echo "  2. Two Vercel Sandboxes will spin up and run the real agents"
echo "  3. Watch the AAMP protocol flow in real time on the flow diagram"
echo ""
echo "  First run will be slow (~2 min) due to pnpm install + build."
echo "  Snapshot IDs are printed in the UI logs — add them as:"
echo "    vercel env add VERCEL_SNAPSHOT_FINANCE production"
echo "    vercel env add VERCEL_SNAPSHOT_RESEARCH production"
echo "  Subsequent runs will be fast (~10 seconds)."
echo ""
