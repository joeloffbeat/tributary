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
