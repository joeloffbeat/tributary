#!/bin/bash
# =============================================================================
# Deploy Hyperlane Core Contracts to a Chain
# =============================================================================
# Usage: ./scripts/deploy-core.sh <chain-name>
# Example: ./scripts/deploy-core.sh story-aenid
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

# Check for chain argument
CHAIN_NAME=$1
if [ -z "$CHAIN_NAME" ]; then
    echo -e "${RED}Error: Chain name is required${NC}"
    echo "Usage: ./scripts/deploy-core.sh <chain-name>"
    echo "Available chains:"
    ls -1 "$ROOT_DIR/chains/" | sed 's/.yaml$//'
    exit 1
fi

# Check if chain config exists
CHAIN_CONFIG="$ROOT_DIR/chains/${CHAIN_NAME}.yaml"
if [ ! -f "$CHAIN_CONFIG" ]; then
    echo -e "${RED}Error: Chain config not found: $CHAIN_CONFIG${NC}"
    echo "Available chains:"
    ls -1 "$ROOT_DIR/chains/" | sed 's/.yaml$//'
    exit 1
fi

# Check for HYP_KEY
if [ -z "$HYP_KEY" ]; then
    echo -e "${RED}Error: HYP_KEY environment variable is not set${NC}"
    echo "Please set your private key in .env file or export HYP_KEY"
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

# Get the internal chain name from the YAML file
INTERNAL_CHAIN_NAME=$(grep "^name:" "$CHAIN_CONFIG" | awk '{print $2}' | tr -d '"')
if [ -z "$INTERNAL_CHAIN_NAME" ]; then
    INTERNAL_CHAIN_NAME="$CHAIN_NAME"
fi

# Validate RPC environment variable is set
RPC_ENV_VAR=$(chain_to_env_var "$INTERNAL_CHAIN_NAME")
RPC_URL="${!RPC_ENV_VAR}"

if [ -z "$RPC_URL" ]; then
    echo -e "${RED}Error: $RPC_ENV_VAR environment variable is not set${NC}"
    echo -e "Please add to your .env file: ${BLUE}$RPC_ENV_VAR=https://your-rpc-url${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Hyperlane Core Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Chain: ${GREEN}$CHAIN_NAME${NC}"
echo -e "Config: ${GREEN}$CHAIN_CONFIG${NC}"
echo -e "RPC: ${GREEN}$RPC_ENV_VAR${NC}"
echo ""

# Step 1: Copy chain metadata to Hyperlane registry location and update RPC URL
echo -e "${YELLOW}Step 1: Setting up chain metadata...${NC}"
HYPERLANE_DIR="$HOME/.hyperlane"
mkdir -p "$HYPERLANE_DIR/chains/$CHAIN_NAME"
cp "$CHAIN_CONFIG" "$HYPERLANE_DIR/chains/$CHAIN_NAME/metadata.yaml"

# Update the metadata with the env var RPC URL
METADATA_FILE="$HYPERLANE_DIR/chains/$CHAIN_NAME/metadata.yaml"
sed -i.bak "s|http: https://.*|http: $RPC_URL|" "$METADATA_FILE"
rm -f "${METADATA_FILE}.bak"

echo -e "${GREEN}✓ Chain metadata copied to $HYPERLANE_DIR/chains/$CHAIN_NAME/${NC}"
echo -e "${GREEN}✓ RPC URL set from $RPC_ENV_VAR${NC}"

# Step 2: Check if core-config exists, if not initialize
CORE_CONFIG="$ROOT_DIR/configs/core-config.yaml"
if [ ! -f "$CORE_CONFIG" ]; then
    echo -e "${YELLOW}Step 2: Initializing core configuration...${NC}"
    echo -e "${BLUE}Running: hyperlane core init (using local registry only)${NC}"
    cd "$ROOT_DIR"
    # Use only local registry to avoid issues with remote registry chains
    npx hyperlane core init \
        --registry "$HOME/.hyperlane" \
        --config ./configs/core-config.yaml
    echo -e "${GREEN}✓ Core config created at $CORE_CONFIG${NC}"
else
    echo -e "${YELLOW}Step 2: Using existing core config at $CORE_CONFIG${NC}"
fi

# Step 3: Deploy
echo -e "${YELLOW}Step 3: Deploying Hyperlane core contracts...${NC}"
echo -e "${BLUE}Running: hyperlane core deploy${NC}"
cd "$ROOT_DIR"

# Ensure HYP_KEY is exported for the CLI to pick up
export HYP_KEY="$HYP_KEY"

# Debug: show that key is set (first 10 chars only for security)
echo -e "  Using signer: ${HYP_KEY:0:10}..."

# Use local-only registry to bypass broken GitHub registry (cosmosnative bug)
# Use local path directly for registry
HYP_KEY="$HYP_KEY" npx hyperlane core deploy \
    --registry "$HOME/.hyperlane" \
    --chain "$CHAIN_NAME" \
    --config ./configs/core-config.yaml \
    -k "$HYP_KEY" \
    --yes

# Step 4: Copy deployment artifacts
echo -e "${YELLOW}Step 4: Copying deployment artifacts...${NC}"
DEPLOYMENT_SOURCE="$HOME/.hyperlane/chains/$CHAIN_NAME/addresses.yaml"
DEPLOYMENT_DEST="$ROOT_DIR/deployments/${CHAIN_NAME}.yaml"

if [ -f "$DEPLOYMENT_SOURCE" ]; then
    # Create chain-specific directory if needed
    mkdir -p "$ROOT_DIR/deployments/$CHAIN_NAME"
    cp "$DEPLOYMENT_SOURCE" "$ROOT_DIR/deployments/$CHAIN_NAME/addresses.yaml"
    # Also copy to flat location for backward compatibility
    cp "$DEPLOYMENT_SOURCE" "$DEPLOYMENT_DEST"
    echo -e "${GREEN}✓ Deployment saved to $DEPLOYMENT_DEST${NC}"
else
    echo -e "${RED}Warning: Deployment addresses not found at expected location${NC}"
    echo "Check $HOME/.hyperlane/chains/$CHAIN_NAME/ for deployment files"
fi

# Step 5: Enroll ICA routers with other chains
echo -e "${YELLOW}Step 5: Enrolling ICA routers with other deployed chains...${NC}"
if [ -x "$SCRIPT_DIR/enroll-ica-routers.sh" ]; then
    # Check if cast is available (required for enrollment)
    if command -v cast &> /dev/null; then
        "$SCRIPT_DIR/enroll-ica-routers.sh" "$CHAIN_NAME" || {
            echo -e "${YELLOW}Warning: ICA router enrollment failed or partially completed${NC}"
            echo -e "You can retry manually: ${BLUE}./scripts/enroll-ica-routers.sh $CHAIN_NAME${NC}"
        }
    else
        echo -e "${YELLOW}Skipping ICA enrollment: 'cast' command not found${NC}"
        echo -e "Install Foundry to enable ICA enrollment, then run:"
        echo -e "  ${BLUE}./scripts/enroll-ica-routers.sh $CHAIN_NAME${NC}"
    fi
else
    echo -e "${YELLOW}Skipping ICA enrollment: enroll-ica-routers.sh not found${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Deploy to another chain: ${BLUE}./scripts/deploy-core.sh <other-chain>${NC}"
echo -e "  2. Deploy warp route: ${BLUE}./scripts/deploy-warp-route.sh${NC}"
echo -e "  3. Sync to frontend: ${BLUE}./scripts/sync-to-frontend.sh${NC}"
echo -e "  4. Enroll ICA routers (if skipped): ${BLUE}./scripts/enroll-ica-routers.sh${NC}"
