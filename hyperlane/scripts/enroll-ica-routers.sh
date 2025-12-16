#!/bin/bash
# =============================================================================
# Enroll ICA Routers Between All Deployed Chains
# =============================================================================
# This script enrolls InterchainAccountRouter contracts on all chains
# so they can communicate with each other.
#
# Usage: ./scripts/enroll-ica-routers.sh [chain-name]
#   - No args: enroll all chains with each other
#   - With chain-name: enroll only that chain with all others
#
# Example: ./scripts/enroll-ica-routers.sh storyaenid
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
    local chain_config="$ROOT_DIR/chains/${chain_name}.yaml"

    if [ ! -f "$chain_config" ]; then
        echo ""
        return
    fi

    grep "^domainId:" "$chain_config" | awk '{print $2}'
}

# Function to get chain name (from inside the yaml, not filename)
get_chain_name() {
    local config_file=$1
    grep "^name:" "$config_file" | awk '{print $2}' | tr -d '"'
}

# Function to get ICA router address for a chain
get_ica_router() {
    local chain_name=$1

    # Try different possible deployment file locations
    local deployment_file=""
    if [ -f "$ROOT_DIR/deployments/${chain_name}/addresses.yaml" ]; then
        deployment_file="$ROOT_DIR/deployments/${chain_name}/addresses.yaml"
    elif [ -f "$ROOT_DIR/deployments/${chain_name}.yaml" ]; then
        deployment_file="$ROOT_DIR/deployments/${chain_name}.yaml"
    fi

    if [ -z "$deployment_file" ] || [ ! -f "$deployment_file" ]; then
        echo ""
        return
    fi

    grep "interchainAccountRouter:" "$deployment_file" | awk '{print $2}' | tr -d '"'
}

# Function to convert address to bytes32
address_to_bytes32() {
    local address=$1
    # Remove 0x prefix, pad to 64 chars (32 bytes), add 0x back
    local clean_addr="${address#0x}"
    printf "0x%064s" "$clean_addr" | tr ' ' '0'
}

# Function to enroll a remote router
enroll_remote_router() {
    local source_chain=$1
    local source_rpc=$2
    local source_ica_router=$3
    local dest_domain=$4
    local dest_ica_router_bytes32=$5

    echo -e "  ${BLUE}Enrolling domain $dest_domain on $source_chain...${NC}"

    # Check if already enrolled
    local current_router=$(cast call "$source_ica_router" "routers(uint32)(bytes32)" "$dest_domain" --rpc-url "$source_rpc" 2>/dev/null || echo "0x0")

    if [ "$current_router" != "0x0000000000000000000000000000000000000000000000000000000000000000" ] && [ "$current_router" != "0x0" ]; then
        echo -e "    ${GREEN}Already enrolled: $current_router${NC}"
        return 0
    fi

    # Enroll the router (use --legacy for broader chain compatibility)
    cast send "$source_ica_router" \
        "enrollRemoteRouter(uint32,bytes32)" \
        "$dest_domain" \
        "$dest_ica_router_bytes32" \
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

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ICA Router Enrollment${NC}"
echo -e "${BLUE}========================================${NC}"

# Get list of chains with ICA routers deployed
CHAINS=()
ICA_ROUTERS=()
DOMAIN_IDS=()
RPC_URLS=()

# Check which chains have ICA routers deployed
for chain_config in "$ROOT_DIR/chains/"*.yaml; do
    config_filename=$(basename "$chain_config" .yaml)
    # Get the actual chain name from inside the YAML (e.g., "fuji" from "avalanche-fuji.yaml")
    chain_name=$(get_chain_name "$chain_config")

    if [ -z "$chain_name" ]; then
        chain_name="$config_filename"
    fi

    ica_router=$(get_ica_router "$chain_name")

    if [ -n "$ica_router" ]; then
        domain_id=$(get_domain_id "$config_filename")
        rpc_url=$(get_rpc_url "$config_filename")

        if [ -n "$domain_id" ] && [ -n "$rpc_url" ]; then
            CHAINS+=("$chain_name")
            ICA_ROUTERS+=("$ica_router")
            DOMAIN_IDS+=("$domain_id")
            RPC_URLS+=("$rpc_url")
            echo -e "Found: ${GREEN}$chain_name${NC} (domain: $domain_id, ICA: ${ica_router:0:10}...)"
        fi
    fi
done

if [ ${#CHAINS[@]} -lt 2 ]; then
    echo -e "${YELLOW}Need at least 2 chains with ICA routers deployed to enroll.${NC}"
    echo "Found: ${#CHAINS[@]} chain(s)"
    exit 0
fi

echo ""
echo -e "Enrolling ${GREEN}${#CHAINS[@]}${NC} chains with each other..."
echo ""

# If a specific chain is provided, only enroll that chain
TARGET_CHAIN=$1

# Enroll each chain with all others
for i in "${!CHAINS[@]}"; do
    source_chain="${CHAINS[$i]}"
    source_rpc="${RPC_URLS[$i]}"
    source_ica="${ICA_ROUTERS[$i]}"
    source_domain="${DOMAIN_IDS[$i]}"

    # Skip if we're targeting a specific chain and this isn't it
    if [ -n "$TARGET_CHAIN" ] && [ "$source_chain" != "$TARGET_CHAIN" ]; then
        continue
    fi

    echo -e "${YELLOW}Processing $source_chain (domain: $source_domain)${NC}"

    for j in "${!CHAINS[@]}"; do
        if [ $i -eq $j ]; then
            continue  # Skip self
        fi

        dest_chain="${CHAINS[$j]}"
        dest_ica="${ICA_ROUTERS[$j]}"
        dest_domain="${DOMAIN_IDS[$j]}"
        dest_ica_bytes32=$(address_to_bytes32 "$dest_ica")

        enroll_remote_router "$source_chain" "$source_rpc" "$source_ica" "$dest_domain" "$dest_ica_bytes32"
    done

    echo ""
done

# If we were targeting a specific chain, also enroll it on all other chains
if [ -n "$TARGET_CHAIN" ]; then
    target_idx=-1
    for i in "${!CHAINS[@]}"; do
        if [ "${CHAINS[$i]}" == "$TARGET_CHAIN" ]; then
            target_idx=$i
            break
        fi
    done

    if [ $target_idx -ge 0 ]; then
        target_domain="${DOMAIN_IDS[$target_idx]}"
        target_ica="${ICA_ROUTERS[$target_idx]}"
        target_ica_bytes32=$(address_to_bytes32 "$target_ica")

        echo -e "${YELLOW}Enrolling $TARGET_CHAIN on other chains...${NC}"

        for i in "${!CHAINS[@]}"; do
            if [ $i -eq $target_idx ]; then
                continue
            fi

            source_chain="${CHAINS[$i]}"
            source_rpc="${RPC_URLS[$i]}"
            source_ica="${ICA_ROUTERS[$i]}"

            enroll_remote_router "$source_chain" "$source_rpc" "$source_ica" "$target_domain" "$target_ica_bytes32"
        done
    fi
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}ICA Router Enrollment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
