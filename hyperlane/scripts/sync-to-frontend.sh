#!/bin/bash
# =============================================================================
# Sync Hyperlane Deployments to Frontend
# =============================================================================
# Usage: ./scripts/sync-to-frontend.sh [--generate-only]
#
# This script generates TypeScript code for frontend constants.
# By default, it shows what code to add/update.
# Use --apply to actually update the frontend files (CAREFUL!).
#
# Frontend files:
#   - frontend/constants/hyperlane/deployments.ts (SELF_HOSTED_DEPLOYMENTS)
#   - frontend/constants/hyperlane/chains.ts (chain configs)
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$ROOT_DIR/../frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

APPLY_MODE=false
if [ "$1" == "--apply" ]; then
    APPLY_MODE=true
fi

# Load environment variables
if [ -f "$ROOT_DIR/.env" ]; then
    export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
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

# Function to get RPC URL for a chain
# Priority: 1) Environment variable, 2) YAML config file
get_rpc_url() {
    local chain_name=$1
    local chain_config=$2

    # First, check for environment variable
    local env_var=$(chain_to_env_var "$chain_name")
    local env_value="${!env_var}"

    if [ -n "$env_value" ]; then
        echo "$env_value"
        return
    fi

    # Fall back to YAML config
    if [ -n "$chain_config" ] && [ -f "$chain_config" ]; then
        grep -A1 "^rpcUrls:" "$chain_config" | tail -1 | grep "http:" | sed 's/.*http: //' | tr -d ' '
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Hyperlane Frontend Sync${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check directories exist
if [ ! -d "$ROOT_DIR/deployments" ]; then
    echo -e "${RED}Error: No deployments found in $ROOT_DIR/deployments${NC}"
    exit 1
fi

if [ ! -d "$ROOT_DIR/chains" ]; then
    echo -e "${RED}Error: No chain configs found in $ROOT_DIR/chains${NC}"
    exit 1
fi

echo -e "${YELLOW}Scanning deployments...${NC}"
echo ""

# =============================================================================
# Generate SELF_HOSTED_DEPLOYMENTS entries
# =============================================================================
echo -e "${CYAN}=== SELF_HOSTED_DEPLOYMENTS entries ===${NC}"
echo -e "${YELLOW}Add/update these in frontend/constants/hyperlane/deployments.ts:${NC}"
echo ""

for deployment_dir in "$ROOT_DIR/deployments"/*/; do
    if [ -d "$deployment_dir" ] && [ -f "$deployment_dir/addresses.yaml" ]; then
        chain_name=$(basename "$deployment_dir")
        deployment_file="$deployment_dir/addresses.yaml"

        # Find matching chain config
        chain_config=""
        for config in "$ROOT_DIR/chains/"*.yaml; do
            internal_name=$(grep "^name:" "$config" 2>/dev/null | awk '{print $2}' | tr -d '"')
            if [ "$internal_name" == "$chain_name" ]; then
                chain_config="$config"
                break
            fi
        done

        if [ -z "$chain_config" ]; then
            echo -e "${YELLOW}Warning: No chain config found for $chain_name${NC}"
            continue
        fi

        # Extract chain metadata
        chain_id=$(grep "^chainId:" "$chain_config" | awk '{print $2}')
        domain_id=$(grep "^domainId:" "$chain_config" | awk '{print $2}')
        display_name=$(grep "^displayName:" "$chain_config" | cut -d':' -f2- | xargs)
        rpc_url=$(get_rpc_url "$chain_name" "$chain_config")
        explorer_url=$(grep -A4 "^blockExplorers:" "$chain_config" | grep "url:" | head -1 | awk '{print $2}')
        native_name=$(grep -A3 "^nativeToken:" "$chain_config" | grep "name:" | head -1 | awk '{print $2}')
        native_symbol=$(grep -A3 "^nativeToken:" "$chain_config" | grep "symbol:" | head -1 | awk '{print $2}')

        # Extract deployment addresses
        mailbox=$(grep "^mailbox:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        proxy_admin=$(grep "^proxyAdmin:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        validator_announce=$(grep "^validatorAnnounce:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        ica_router=$(grep "^interchainAccountRouter:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        test_recipient=$(grep "^testRecipient:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        merkle_root_ism=$(grep "^staticMerkleRootMultisigIsmFactory:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        message_id_ism=$(grep "^staticMessageIdMultisigIsmFactory:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        aggregation_ism=$(grep "^staticAggregationIsmFactory:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        domain_routing_ism=$(grep "^domainRoutingIsmFactory:" "$deployment_file" | awk '{print $2}' | tr -d '"')
        aggregation_hook=$(grep "^staticAggregationHookFactory:" "$deployment_file" | awk '{print $2}' | tr -d '"')

        echo -e "${GREEN}// $chain_name (chainId: $chain_id)${NC}"
        cat << EOF
$chain_id: {
  chainId: $chain_id,
  chainName: '$chain_name',
  displayName: '$display_name',
  domainId: $domain_id,
  mailbox: '$mailbox',
  proxyAdmin: '$proxy_admin',
  validatorAnnounce: '$validator_announce',
  interchainAccountRouter: '$ica_router',
  testRecipient: '$test_recipient',
  staticMerkleRootMultisigIsmFactory: '$merkle_root_ism',
  staticMessageIdMultisigIsmFactory: '$message_id_ism',
  staticAggregationIsmFactory: '$aggregation_ism',
  domainRoutingIsmFactory: '$domain_routing_ism',
  staticAggregationHookFactory: '$aggregation_hook',
  explorerUrl: '$explorer_url',
  isTestnet: true,
  nativeCurrency: {
    name: '$native_name',
    symbol: '$native_symbol',
    decimals: 18,
  },
},
EOF
        echo ""
    fi
done

# =============================================================================
# Generate SELF_HOSTED_WARP_ROUTES entries
# =============================================================================
echo -e "${CYAN}=== SELF_HOSTED_WARP_ROUTES entries ===${NC}"
echo -e "${YELLOW}Add/update these in frontend/constants/hyperlane/deployments.ts:${NC}"
echo ""

WARP_ROUTES_DIR="$ROOT_DIR/deployments/warp-routes"
if [ -d "$WARP_ROUTES_DIR" ]; then
    for warp_dir in "$WARP_ROUTES_DIR"/*/; do
        if [ -d "$warp_dir" ]; then
            token_name=$(basename "$warp_dir")
            warp_yaml=$(find "$warp_dir" -name "*.yaml" -type f | head -1)

            if [ -n "$warp_yaml" ] && [ -f "$warp_yaml" ]; then
                echo -e "${GREEN}// Warp route: $token_name${NC}"
                echo "{"
                echo "  symbol: '$token_name',"
                echo "  name: '$token_name Token',"
                echo "  decimals: 18,"
                echo "  chains: ["

                # Parse warp route YAML
                current_chain=""
                current_addr=""
                current_type=""

                while IFS= read -r line; do
                    if [[ "$line" =~ chainName:\ *(.+) ]]; then
                        if [ -n "$current_chain" ] && [ -n "$current_addr" ]; then
                            # Find chain ID
                            for config in "$ROOT_DIR/chains/"*.yaml; do
                                internal_name=$(grep "^name:" "$config" 2>/dev/null | awk '{print $2}' | tr -d '"')
                                if [ "$internal_name" == "$current_chain" ]; then
                                    cid=$(grep "^chainId:" "$config" | awk '{print $2}')
                                    echo "    {"
                                    echo "      chainId: $cid,"
                                    echo "      chainName: '$current_chain',"
                                    echo "      routerAddress: '$current_addr',"
                                    echo "      tokenAddress: '$current_addr',"
                                    echo "      type: '$current_type',"
                                    echo "    },"
                                    break
                                fi
                            done
                        fi
                        current_chain=$(echo "${BASH_REMATCH[1]}" | tr -d '"' | xargs)
                        current_addr=""
                        current_type="synthetic"
                    elif [[ "$line" =~ addressOrDenom:\ *\"?([^\"]+)\"? ]]; then
                        current_addr=$(echo "${BASH_REMATCH[1]}" | xargs)
                    elif [[ "$line" =~ standard:\ *(.+) ]]; then
                        std="${BASH_REMATCH[1]}"
                        if [[ "$std" == *"Native"* ]]; then
                            current_type="native"
                        elif [[ "$std" == *"Collateral"* ]]; then
                            current_type="collateral"
                        else
                            current_type="synthetic"
                        fi
                    fi
                done < "$warp_yaml"

                # Output last chain
                if [ -n "$current_chain" ] && [ -n "$current_addr" ]; then
                    for config in "$ROOT_DIR/chains/"*.yaml; do
                        internal_name=$(grep "^name:" "$config" 2>/dev/null | awk '{print $2}' | tr -d '"')
                        if [ "$internal_name" == "$current_chain" ]; then
                            cid=$(grep "^chainId:" "$config" | awk '{print $2}')
                            echo "    {"
                            echo "      chainId: $cid,"
                            echo "      chainName: '$current_chain',"
                            echo "      routerAddress: '$current_addr',"
                            echo "      tokenAddress: '$current_addr',"
                            echo "      type: '$current_type',"
                            echo "    },"
                            break
                        fi
                    done
                fi

                echo "  ],"
                echo "},"
                echo ""
            fi
        fi
    done
else
    echo -e "${YELLOW}No warp routes found in $WARP_ROUTES_DIR${NC}"
fi

# =============================================================================
# Generate chains.ts entries
# =============================================================================
echo ""
echo -e "${CYAN}=== HYPERLANE_CHAINS entries ===${NC}"
echo -e "${YELLOW}Add/update these in frontend/constants/hyperlane/chains.ts:${NC}"
echo ""

for chain_config in "$ROOT_DIR/chains/"*.yaml; do
    if [ -f "$chain_config" ]; then
        chain_name=$(grep "^name:" "$chain_config" | awk '{print $2}' | tr -d '"')
        chain_id=$(grep "^chainId:" "$chain_config" | awk '{print $2}')
        domain_id=$(grep "^domainId:" "$chain_config" | awk '{print $2}')
        display_name=$(grep "^displayName:" "$chain_config" | cut -d':' -f2- | xargs)
        rpc_url=$(get_rpc_url "$chain_name" "$chain_config")
        explorer_url=$(grep -A4 "^blockExplorers:" "$chain_config" | grep "url:" | head -1 | awk '{print $2}')
        native_name=$(grep -A3 "^nativeToken:" "$chain_config" | grep "name:" | head -1 | awk '{print $2}')
        native_symbol=$(grep -A3 "^nativeToken:" "$chain_config" | grep "symbol:" | head -1 | awk '{print $2}')

        # Check if deployment exists
        deployment_exists="false"
        if [ -f "$ROOT_DIR/deployments/$chain_name/addresses.yaml" ]; then
            deployment_exists="true"
        fi

        # Convert to camelCase variable name (e.g., storyaenid -> storyAenid)
        var_name=$(echo "$chain_name" | sed -E 's/-([a-z])/\U\1/g')

        echo -e "${GREEN}// $chain_name (deployed: $deployment_exists)${NC}"
        cat << EOF
export const ${var_name}Chain: HyperlaneChainConfig = {
  chainId: $chain_id,
  domainId: $domain_id,
  name: '$chain_name',
  displayName: '$display_name',
  protocol: 'ethereum',
  isTestnet: true,
  rpcUrl: '$rpc_url',
  explorerUrl: '$explorer_url',
  nativeToken: {
    name: '$native_name',
    symbol: '$native_symbol',
    decimals: 18,
  },
}
EOF
        echo ""
    fi
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Sync Generation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "To update frontend, manually copy the generated code above into:"
echo -e "  1. ${BLUE}frontend/constants/hyperlane/deployments.ts${NC}"
echo -e "     - Add new chains to SELF_HOSTED_DEPLOYMENTS"
echo -e "     - Add warp routes to SELF_HOSTED_WARP_ROUTES"
echo -e ""
echo -e "  2. ${BLUE}frontend/constants/hyperlane/chains.ts${NC}"
echo -e "     - Add chain config exports"
echo -e "     - Add to HYPERLANE_CHAINS array"
echo ""
echo -e "${YELLOW}Tip: Compare with existing entries to avoid duplicates!${NC}"
