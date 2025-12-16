#!/bin/bash
# =============================================================================
# Deploy Hyperlane Warp Route Between Chains
# =============================================================================
# Usage: ./scripts/deploy-warp-route.sh
#
# Prerequisites:
#   - Hyperlane core deployed on both chains
#   - Warp route config created (configs/warp-route-deployment.yaml)
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

# Check for HYP_KEY
if [ -z "$HYP_KEY" ]; then
    echo -e "${RED}Error: HYP_KEY environment variable is not set${NC}"
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
        sed -i.bak "s|http: https://.*|http: $rpc_url|" "$metadata_file"
        rm -f "${metadata_file}.bak"
        echo -e "  ${GREEN}✓${NC} Updated $chain_name RPC in registry"
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Hyperlane Warp Route Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check for warp route config
WARP_CONFIG="$ROOT_DIR/configs/warp-route-deployment.yaml"
if [ ! -f "$WARP_CONFIG" ]; then
    echo -e "${YELLOW}Warp route config not found. Initializing...${NC}"
    echo -e "${BLUE}Running: hyperlane warp init${NC}"
    cd "$ROOT_DIR"
    npx hyperlane warp init --config ./configs/warp-route-deployment.yaml
    echo ""
    echo -e "${GREEN}✓ Warp route config created at $WARP_CONFIG${NC}"
    echo -e "${YELLOW}Please edit the config file and run this script again.${NC}"
    exit 0
fi

echo -e "${YELLOW}Using warp route config: $WARP_CONFIG${NC}"
echo ""

# Extract chains from warp config and validate RPC env vars
echo -e "${YELLOW}Validating RPC environment variables...${NC}"
WARP_CHAINS=$(grep -E "^[a-zA-Z0-9_-]+:$" "$WARP_CONFIG" | tr -d ':' | tr -d ' ')
MISSING_RPCS=()

for chain in $WARP_CHAINS; do
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

# Deploy warp route
echo -e "${YELLOW}Deploying warp route...${NC}"
cd "$ROOT_DIR"
npx hyperlane warp deploy \
    --config ./configs/warp-route-deployment.yaml \
    --registry ./registry-clone \
    --yes

# Copy warp route deployment info
echo ""
echo -e "${YELLOW}Copying warp route artifacts...${NC}"

# Find the latest warp route deployment
WARP_DEPLOYMENTS_DIR="$HOME/.hyperlane/deployments/warp_routes"
if [ -d "$WARP_DEPLOYMENTS_DIR" ]; then
    # Get the most recent deployment
    LATEST_WARP=$(ls -t "$WARP_DEPLOYMENTS_DIR" 2>/dev/null | head -1)
    if [ -n "$LATEST_WARP" ]; then
        cp -r "$WARP_DEPLOYMENTS_DIR/$LATEST_WARP" "$ROOT_DIR/deployments/warp-routes/" 2>/dev/null || mkdir -p "$ROOT_DIR/deployments/warp-routes" && cp -r "$WARP_DEPLOYMENTS_DIR/$LATEST_WARP" "$ROOT_DIR/deployments/warp-routes/"
        echo -e "${GREEN}✓ Warp route deployment saved${NC}"
    fi
fi

# Enroll warp routers with each other
echo ""
echo -e "${YELLOW}Enrolling warp routers between all chains...${NC}"
if [ -x "$SCRIPT_DIR/enroll-warp-routers.sh" ]; then
    if command -v cast &> /dev/null; then
        "$SCRIPT_DIR/enroll-warp-routers.sh" || {
            echo -e "${YELLOW}Warning: Warp router enrollment failed or partially completed${NC}"
            echo -e "You can retry manually: ${BLUE}./scripts/enroll-warp-routers.sh${NC}"
        }
    else
        echo -e "${YELLOW}Skipping warp router enrollment: 'cast' command not found${NC}"
        echo -e "Install Foundry to enable automatic enrollment, then run:"
        echo -e "  ${BLUE}./scripts/enroll-warp-routers.sh${NC}"
    fi
else
    echo -e "${YELLOW}Skipping warp router enrollment: script not found${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Warp Route Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Test the warp route: ${BLUE}npm run warp:send${NC}"
echo -e "  2. Run a relayer: ${BLUE}./scripts/run-relayer.sh${NC}"
echo -e "  3. Sync to frontend: ${BLUE}./scripts/sync-to-frontend.sh${NC}"
echo -e "  4. Enroll warp routers (if skipped): ${BLUE}./scripts/enroll-warp-routers.sh${NC}"
