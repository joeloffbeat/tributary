#!/bin/bash
# =============================================================================
# Run Hyperlane Relayer
# =============================================================================
# Usage: ./scripts/run-relayer.sh [options] [chain1,chain2,...]
# Example: ./scripts/run-relayer.sh storyaenid,fuji --verbosity debug
#
# Options:
#   --clean              Clear local cache before starting the relayer
#   --verbosity LEVEL    Set verbosity level (error, warn, info, debug, trace)
#   --log FORMAT         Set log format (pretty, json, compact)
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

# Parse arguments
CLEAN_CACHE=false
RELAY_CHAINS=""
VERBOSITY=""
LOG_FORMAT=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_CACHE=true
            shift
            ;;
        --verbosity)
            VERBOSITY="$2"
            shift 2
            ;;
        --log)
            LOG_FORMAT="$2"
            shift 2
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            RELAY_CHAINS="$1"
            shift
            ;;
    esac
done

# Default chains if not specified
RELAY_CHAINS=${RELAY_CHAINS:-"storyaenid,fuji"}

# Load environment variables
if [ -f "$ROOT_DIR/.env" ]; then
    export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

# Use RELAYER_KEY if set, otherwise fall back to HYP_KEY
SIGNER_KEY=${RELAYER_KEY:-$HYP_KEY}

if [ -z "$SIGNER_KEY" ]; then
    echo -e "${RED}Error: No signer key found${NC}"
    echo "Set RELAYER_KEY or HYP_KEY in .env"
    exit 1
fi

# Function to convert chain name to env var name
chain_to_env_var() {
    local chain_name=$1
    local env_var=""

    case "$chain_name" in
        sepolia)
            env_var="RPC_SEPOLIA"
            ;;
        storyaenid)
            env_var="RPC_STORY_AENID"
            ;;
        polygonamoy)
            env_var="RPC_POLYGON_AMOY"
            ;;
        fuji)
            env_var="RPC_AVALANCHE_FUJI"
            ;;
        *)
            # Convert to uppercase and add RPC_ prefix
            env_var="RPC_$(echo "$chain_name" | tr '[:lower:]-' '[:upper:]_')"
            ;;
    esac

    echo "$env_var"
}

# Function to get RPC URL for a chain (MUST be set in environment)
get_rpc_url() {
    local chain_name=$1
    local env_var=$(chain_to_env_var "$chain_name")
    local env_value="${!env_var}"

    if [ -z "$env_value" ]; then
        echo ""
        return
    fi

    echo "$env_value"
}

# Function to update registry metadata with env var RPC URL
update_registry_rpc() {
    local chain_name=$1
    local rpc_url=$2
    local metadata_file="$ROOT_DIR/registry-clone/chains/$chain_name/metadata.yaml"

    if [ -f "$metadata_file" ]; then
        # Create a temp file with updated RPC URL
        # Replace the http: line under rpcUrls with our env var value
        sed -i.bak "s|http: https://.*|http: $rpc_url|" "$metadata_file"
        rm -f "${metadata_file}.bak"
        echo -e "  ${GREEN}✓${NC} Updated $chain_name RPC in registry"
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Hyperlane Relayer${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Chains: ${GREEN}$RELAY_CHAINS${NC}"
echo ""

# Validate and update RPC URLs for all relay chains
echo -e "${YELLOW}Validating RPC environment variables...${NC}"
MISSING_RPCS=()
IFS=',' read -ra CHAIN_ARRAY <<< "$RELAY_CHAINS"

for chain in "${CHAIN_ARRAY[@]}"; do
    chain=$(echo "$chain" | tr -d ' ')  # Trim whitespace
    env_var=$(chain_to_env_var "$chain")
    rpc_url=$(get_rpc_url "$chain")

    if [ -z "$rpc_url" ]; then
        MISSING_RPCS+=("$env_var (for $chain)")
    else
        echo -e "  ${GREEN}✓${NC} $env_var is set"
        # Update the registry-clone with the env var RPC URL
        update_registry_rpc "$chain" "$rpc_url"
    fi
done

if [ ${#MISSING_RPCS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required RPC environment variables:${NC}"
    for missing in "${MISSING_RPCS[@]}"; do
        echo -e "  ${RED}✗${NC} $missing"
    done
    echo ""
    echo -e "Please add these to your .env file:"
    for missing in "${MISSING_RPCS[@]}"; do
        var_name=$(echo "$missing" | cut -d' ' -f1)
        echo -e "  ${BLUE}$var_name=https://your-rpc-url${NC}"
    done
    exit 1
fi

echo ""

# Clean cache if requested
if [ "$CLEAN_CACHE" = true ]; then
    echo -e "${YELLOW}Cleaning relayer cache...${NC}"

    # Clean local db directory
    if [ -d "$ROOT_DIR/db/relayer" ]; then
        rm -rf "$ROOT_DIR/db/relayer"
        echo -e "  ${GREEN}✓${NC} Removed local db/relayer/"
    fi

    # Clean global relayer cache
    if [ -f "$HOME/.hyperlane/relayer-cache.json" ]; then
        rm -f "$HOME/.hyperlane/relayer-cache.json"
        echo -e "  ${GREEN}✓${NC} Removed ~/.hyperlane/relayer-cache.json"
    fi

    echo -e "${GREEN}Cache cleaned!${NC}"
    echo ""
fi

# Create db directory
mkdir -p "$ROOT_DIR/db/relayer"

# Method 1: Using Hyperlane CLI (simpler for testing)
echo -e "${YELLOW}Starting relayer via Hyperlane CLI...${NC}"
echo -e "${BLUE}Running: hyperlane relayer --registry ./registry-clone --chains $RELAY_CHAINS${NC}"
echo ""

cd "$ROOT_DIR"

# Add verbosity flag - CLI args take precedence, then env vars, then defaults
VERBOSITY=${VERBOSITY:-${HYP_VERBOSITY:-"info"}}
LOG_FORMAT=${LOG_FORMAT:-${HYP_LOG_FORMAT:-"pretty"}}

echo -e "${YELLOW}Debug mode: verbosity=$VERBOSITY, log=$LOG_FORMAT${NC}"
echo ""

npx hyperlane relayer \
  --registry ./registry-clone \
  --chains "$RELAY_CHAINS" \
  --verbosity "$VERBOSITY" \
  --log "$LOG_FORMAT"

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
