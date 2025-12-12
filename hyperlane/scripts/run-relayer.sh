#!/bin/bash
# =============================================================================
# Run Hyperlane Relayer
# =============================================================================
# Usage: ./scripts/run-relayer.sh [chain1,chain2,...]
# Example: ./scripts/run-relayer.sh storyaenid,fuji
#
# The relayer processes cross-chain messages between your deployed chains.
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f "$ROOT_DIR/.env" ]; then
    export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

# Get chains from argument or default
RELAY_CHAINS=${1:-"storyaenid,fuji"}

# Use RELAYER_KEY if set, otherwise fall back to HYP_KEY
SIGNER_KEY=${RELAYER_KEY:-$HYP_KEY}

if [ -z "$SIGNER_KEY" ]; then
    echo -e "${RED}Error: No signer key found${NC}"
    echo "Set RELAYER_KEY or HYP_KEY in .env"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Hyperlane Relayer${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Chains: ${GREEN}$RELAY_CHAINS${NC}"
echo ""

# Create db directory
mkdir -p "$ROOT_DIR/db/relayer"

# Method 1: Using Hyperlane CLI (simpler for testing)
echo -e "${YELLOW}Starting relayer via Hyperlane CLI...${NC}"
echo -e "${BLUE}Running: hyperlane relayer --registry ./registry-clone --chains $RELAY_CHAINS${NC}"
echo ""

cd "$ROOT_DIR"
npx hyperlane relayer --registry ./registry-clone --chains "$RELAY_CHAINS"

# =============================================================================
# Alternative: Docker-based Relayer (for production)
# =============================================================================
# Uncomment below for production deployment with Docker
#
# echo -e "${YELLOW}Starting relayer via Docker...${NC}"
#
# # Pull the latest agent image
# docker pull --platform linux/amd64 gcr.io/abacus-labs-dev/hyperlane-agent:agents-v1.4.0
#
# # Find agent config (generated during core deploy)
# AGENT_CONFIG=$(find "$HOME/.hyperlane/chains" -name "agent-config*.json" | head -1)
#
# if [ -z "$AGENT_CONFIG" ]; then
#     echo -e "${RED}Error: Agent config not found${NC}"
#     echo "Deploy core contracts first: ./scripts/deploy-core.sh"
#     exit 1
# fi
#
# export CONFIG_FILES="$AGENT_CONFIG"
#
# docker run \
#   -it \
#   -e CONFIG_FILES=/config/agent-config.json \
#   --mount type=bind,source="$AGENT_CONFIG",target=/config/agent-config.json,readonly \
#   --mount type=bind,source="$ROOT_DIR/db/relayer",target=/hyperlane_db \
#   gcr.io/abacus-labs-dev/hyperlane-agent:agents-v1.4.0 \
#   ./relayer \
#   --db /hyperlane_db \
#   --relayChains "$RELAY_CHAINS" \
#   --allowLocalCheckpointSyncers true \
#   --defaultSigner.key "$SIGNER_KEY"
