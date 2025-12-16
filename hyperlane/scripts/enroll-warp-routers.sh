#!/bin/bash
# =============================================================================
# Enroll Warp Route Routers Between All Deployed Chains
# =============================================================================
# This script enrolls Warp Route TokenRouter contracts on all chains
# so tokens can be transferred between them.
#
# Usage: ./scripts/enroll-warp-routers.sh [token-symbol] [chain-name]
#   - No args: enroll all warp routes on all chains
#   - With token: enroll specific token warp route
#   - With chain: enroll only for that chain
#
# Example: ./scripts/enroll-warp-routers.sh USDC newchain
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

# Check for HYP_KEY (private key)
if [ -z "$HYP_KEY" ]; then
    echo -e "${RED}Error: HYP_KEY environment variable is not set${NC}"
    echo "Please set your private key in .env file or export HYP_KEY"
    exit 1
fi

# Check for cast
if ! command -v cast &> /dev/null; then
    echo -e "${RED}Error: 'cast' command not found. Please install Foundry.${NC}"
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
        fuji|avalanche-fuji)
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
        echo -e "${RED}Error: $env_var environment variable is not set for chain '$chain_name'${NC}" >&2
        echo -e "Please add to your .env file: ${BLUE}$env_var=https://your-rpc-url${NC}" >&2
        echo ""
        return
    fi

    echo "$env_value"
}

# Function to get domain ID for a chain
get_domain_id() {
    local chain_name=$1

    for config in "$ROOT_DIR/chains/"*.yaml; do
        internal_name=$(grep "^name:" "$config" 2>/dev/null | awk '{print $2}' | tr -d '"')
        if [ "$internal_name" == "$chain_name" ]; then
            grep "^domainId:" "$config" | awk '{print $2}'
            return
        fi
    done

    if [ -f "$ROOT_DIR/chains/${chain_name}.yaml" ]; then
        grep "^domainId:" "$ROOT_DIR/chains/${chain_name}.yaml" | awk '{print $2}'
    fi
}

# Function to convert address to bytes32
address_to_bytes32() {
    local address=$1
    local clean_addr="${address#0x}"
    printf "0x%064s" "$clean_addr" | tr ' ' '0'
}

# Function to enroll a remote router on a warp route
enroll_warp_remote_router() {
    local source_chain=$1
    local source_rpc=$2
    local source_router=$3
    local dest_domain=$4
    local dest_router_bytes32=$5

    echo -e "  ${BLUE}Enrolling domain $dest_domain on $source_chain warp router...${NC}"

    # Check if already enrolled
    local current_router=$(cast call "$source_router" "routers(uint32)(bytes32)" "$dest_domain" --rpc-url "$source_rpc" 2>/dev/null || echo "0x0")

    if [ "$current_router" != "0x0000000000000000000000000000000000000000000000000000000000000000" ] && [ "$current_router" != "0x0" ]; then
        echo -e "    ${GREEN}Already enrolled: ${current_router:0:20}...${NC}"
        return 0
    fi

    # Enroll the router
    cast send "$source_router" \
        "enrollRemoteRouter(uint32,bytes32)" \
        "$dest_domain" \
        "$dest_router_bytes32" \
        --rpc-url "$source_rpc" \
        --private-key "$HYP_KEY" \
        --legacy \
        --json > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "    ${GREEN}Successfully enrolled!${NC}"
    else
        echo -e "    ${RED}Failed to enroll${NC}"
        return 1
    fi
}

# Parse warp route deployment YAML to get router addresses
# Returns: chain_name|router_address per line
parse_warp_deployment() {
    local warp_file=$1

    # Simple YAML parsing for warp route deployment
    # Format: tokens: [{chainName: x, addressOrDenom: y}, ...]
    if grep -q "tokens:" "$warp_file" 2>/dev/null; then
        # New format with tokens array
        grep -E "chainName:|addressOrDenom:" "$warp_file" | paste - - | while read -r line; do
            chain=$(echo "$line" | grep -o 'chainName: "[^"]*"' | sed 's/chainName: "//;s/"//' || echo "$line" | grep -o "chainName: [a-zA-Z0-9_-]*" | sed 's/chainName: //')
            addr=$(echo "$line" | grep -o 'addressOrDenom: "[^"]*"' | sed 's/addressOrDenom: "//;s/"//' || echo "$line" | grep -o "addressOrDenom: 0x[a-fA-F0-9]*" | sed 's/addressOrDenom: //')
            if [ -n "$chain" ] && [ -n "$addr" ]; then
                echo "${chain}|${addr}"
            fi
        done
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Warp Route Router Enrollment${NC}"
echo -e "${BLUE}========================================${NC}"

TARGET_TOKEN=$1
TARGET_CHAIN=$2

# Find all warp route deployments
WARP_ROUTES_DIR="$ROOT_DIR/deployments/warp-routes"

if [ ! -d "$WARP_ROUTES_DIR" ]; then
    echo -e "${YELLOW}No warp routes found in $WARP_ROUTES_DIR${NC}"
    exit 0
fi

# Process each warp route
for warp_dir in "$WARP_ROUTES_DIR"/*/; do
    if [ -d "$warp_dir" ]; then
        token_name=$(basename "$warp_dir")

        # Skip if we're targeting a specific token
        if [ -n "$TARGET_TOKEN" ] && [ "$token_name" != "$TARGET_TOKEN" ]; then
            continue
        fi

        echo -e "\n${YELLOW}Processing warp route: $token_name${NC}"

        # Find the deployment YAML
        warp_yaml=$(find "$warp_dir" -name "*.yaml" -type f | head -1)
        if [ -z "$warp_yaml" ]; then
            echo -e "  ${RED}No deployment YAML found${NC}"
            continue
        fi

        # Parse all chain deployments for this warp route
        declare -A CHAIN_ROUTERS
        declare -A CHAIN_DOMAINS
        declare -A CHAIN_RPCS

        while IFS='|' read -r chain router; do
            if [ -n "$chain" ] && [ -n "$router" ]; then
                domain=$(get_domain_id "$chain")
                rpc=$(get_rpc_url "$chain")

                if [ -n "$domain" ] && [ -n "$rpc" ]; then
                    CHAIN_ROUTERS["$chain"]="$router"
                    CHAIN_DOMAINS["$chain"]="$domain"
                    CHAIN_RPCS["$chain"]="$rpc"
                    echo -e "  Found: ${GREEN}$chain${NC} (domain: $domain, router: ${router:0:10}...)"
                fi
            fi
        done < <(parse_warp_deployment "$warp_yaml")

        # Enroll each chain with all others
        for source_chain in "${!CHAIN_ROUTERS[@]}"; do
            # Skip if we're targeting a specific chain and this isn't it
            if [ -n "$TARGET_CHAIN" ] && [ "$source_chain" != "$TARGET_CHAIN" ]; then
                continue
            fi

            source_router="${CHAIN_ROUTERS[$source_chain]}"
            source_rpc="${CHAIN_RPCS[$source_chain]}"

            echo -e "\n  ${YELLOW}Enrolling on $source_chain${NC}"

            for dest_chain in "${!CHAIN_ROUTERS[@]}"; do
                if [ "$source_chain" == "$dest_chain" ]; then
                    continue
                fi

                dest_router="${CHAIN_ROUTERS[$dest_chain]}"
                dest_domain="${CHAIN_DOMAINS[$dest_chain]}"
                dest_router_bytes32=$(address_to_bytes32 "$dest_router")

                enroll_warp_remote_router "$source_chain" "$source_rpc" "$source_router" "$dest_domain" "$dest_router_bytes32"
            done
        done

        # Clear arrays for next iteration
        unset CHAIN_ROUTERS CHAIN_DOMAINS CHAIN_RPCS
        declare -A CHAIN_ROUTERS CHAIN_DOMAINS CHAIN_RPCS
    fi
done

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Warp Route Enrollment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
