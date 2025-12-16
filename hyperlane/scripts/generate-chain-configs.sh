#!/bin/bash
# =============================================================================
# Generate Chain Configs from Templates
# =============================================================================
# Usage: ./scripts/generate-chain-configs.sh
#
# This script reads RPC URLs from .env and generates chain YAML files
# from templates in chains/templates/
#
# Environment variables required:
#   RPC_SEPOLIA        - Ethereum Sepolia RPC URL
#   RPC_POLYGON_AMOY   - Polygon Amoy RPC URL
#   RPC_STORY_AENID    - Story Aenid RPC URL
#   RPC_AVALANCHE_FUJI - Avalanche Fuji RPC URL
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATES_DIR="$ROOT_DIR/chains/templates"
CHAINS_DIR="$ROOT_DIR/chains"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Generate Chain Configs${NC}"
echo -e "${BLUE}========================================${NC}"

# Load environment variables
if [ -f "$ROOT_DIR/.env" ]; then
    echo -e "${YELLOW}Loading .env file...${NC}"
    export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create .env from .env.example:"
    echo "  cp .env.example .env"
    exit 1
fi

# Check for envsubst
if ! command -v envsubst &> /dev/null; then
    echo -e "${RED}Error: envsubst not found${NC}"
    echo "Install gettext package:"
    echo "  macOS: brew install gettext && brew link --force gettext"
    echo "  Ubuntu: sudo apt-get install gettext"
    exit 1
fi

# Define required environment variables and their default values
declare -A RPC_DEFAULTS=(
    ["RPC_SEPOLIA"]="https://rpc.sepolia.org"
    ["RPC_POLYGON_AMOY"]="https://rpc-amoy.polygon.technology"
    ["RPC_STORY_AENID"]="https://aeneid.storyrpc.io"
    ["RPC_AVALANCHE_FUJI"]="https://api.avax-test.network/ext/bc/C/rpc"
)

# Set defaults for unset variables
echo -e "${YELLOW}Checking RPC URLs...${NC}"
for var in "${!RPC_DEFAULTS[@]}"; do
    if [ -z "${!var}" ]; then
        export "$var"="${RPC_DEFAULTS[$var]}"
        echo -e "  ${YELLOW}$var${NC}: Using default (${RPC_DEFAULTS[$var]})"
    else
        echo -e "  ${GREEN}$var${NC}: ${!var}"
    fi
done
echo ""

# Process each template
echo -e "${YELLOW}Generating chain configs...${NC}"

for template in "$TEMPLATES_DIR"/*.yaml.tmpl; do
    if [ -f "$template" ]; then
        filename=$(basename "$template" .tmpl)
        output="$CHAINS_DIR/$filename"

        envsubst < "$template" > "$output"
        echo -e "  ${GREEN}✓${NC} Generated $filename"
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Chain configs generated successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Generated files:"
ls -la "$CHAINS_DIR"/*.yaml 2>/dev/null | awk '{print "  " $NF}'
echo ""
echo "Next steps:"
echo "  1. Review the generated configs in chains/"
echo "  2. Deploy core: ./scripts/deploy-core.sh <chain-name>"
