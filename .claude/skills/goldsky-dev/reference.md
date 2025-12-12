# Goldsky Development Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Production endpoint | Tag-based URL (`/prod/gn`) | Version URL (`/1.0.0/gn`) | Stable, zero-downtime |
| Quick index | Instant subgraph (`--from-abi`) | Standard subgraph | No code needed |
| Custom logic | Standard subgraph | Instant | Full control over mappings |
| Zero-downtime upgrade | Deploy new version + move tag | Redeploy same version | No interruption |
| Real-time notifications | Webhooks | Polling | Lower latency |
| Multi-chain | Single instant config | Separate deploys | Easier management |

---

## CLI Commands

### Authentication

```bash
# Login to Goldsky
goldsky login

# Check login status
goldsky whoami
```

### Subgraph Deployment

```bash
# Deploy from local subgraph
goldsky subgraph deploy <name>/<version> --path .

# Deploy from ABI (Instant Subgraph)
goldsky subgraph deploy <name>/<version> --from-abi config.json

# Deploy from IPFS hash
goldsky subgraph deploy <name>/<version> --from-ipfs-hash <IPFS_HASH>

# Deploy from existing subgraph endpoint
goldsky subgraph deploy <name>/<version> --from-url <SUBGRAPH_URL>
```

### Subgraph Management

```bash
# List all subgraphs
goldsky subgraph list

# Get subgraph details
goldsky subgraph list <name>/<version>

# View logs
goldsky subgraph log <name>/<version>

# Pause indexing
goldsky subgraph pause <name>/<version>

# Resume indexing
goldsky subgraph start <name>/<version>

# Delete subgraph
goldsky subgraph delete <name>/<version>
```

### Tags (Zero-Downtime Upgrades)

```bash
# Create/move tag
goldsky subgraph tag create <name>/<version> --tag <tag-name>

# List tags
goldsky subgraph tag list <name>

# Delete tag
goldsky subgraph tag delete <name> --tag <tag-name>
```

### Webhooks

```bash
# Create webhook
goldsky subgraph webhook create <name>/<version> \
  --name <webhook-name> \
  --entity <EntityName> \
  --url <webhook-url>

# List webhooks
goldsky subgraph webhook list <name>/<version>

# Delete webhook
goldsky subgraph webhook delete <name>/<version> --name <webhook-name>
```

## Endpoint URLs

### Version-Specific (Changes Each Deploy)

```
https://api.goldsky.com/api/public/<PROJECT_ID>/subgraphs/<NAME>/<VERSION>/gn
```

### Tag-Based (Stable, Recommended)

```
https://api.goldsky.com/api/public/<PROJECT_ID>/subgraphs/<NAME>/<TAG>/gn
```

Common tags:
- `prod` - Production
- `staging` - Staging
- `dev` - Development

## Instant Subgraph Config

### Basic Config (config.json)

```json
{
  "version": "1",
  "name": "my-subgraph",
  "abis": {
    "ContractName": {
      "path": "./abis/ContractName.json"
    }
  },
  "instances": [
    {
      "abi": "ContractName",
      "address": "0x...",
      "chain": "sepolia",
      "startBlock": 5000000
    }
  ]
}
```

### Multi-Contract Config

```json
{
  "version": "1",
  "name": "multi-contract",
  "abis": {
    "Token": { "path": "./abis/Token.json" },
    "Staking": { "path": "./abis/Staking.json" }
  },
  "instances": [
    {
      "abi": "Token",
      "address": "0x111...",
      "chain": "sepolia",
      "startBlock": 5000000
    },
    {
      "abi": "Staking",
      "address": "0x222...",
      "chain": "sepolia",
      "startBlock": 5000100
    }
  ]
}
```

### Multi-Chain Config

```json
{
  "version": "1",
  "name": "cross-chain",
  "abis": {
    "Token": { "path": "./abis/Token.json" }
  },
  "instances": [
    {
      "abi": "Token",
      "address": "0x123...",
      "chain": "mainnet",
      "startBlock": 18000000
    },
    {
      "abi": "Token",
      "address": "0x456...",
      "chain": "base",
      "startBlock": 5000000
    },
    {
      "abi": "Token",
      "address": "0x789...",
      "chain": "arbitrum-one",
      "startBlock": 150000000
    }
  ]
}
```

## Supported Networks

| Network | Chain Name |
|---------|------------|
| Ethereum Mainnet | `mainnet` |
| Sepolia | `sepolia` |
| Goerli | `goerli` |
| Base | `base` |
| Base Sepolia | `base-sepolia` |
| Arbitrum One | `arbitrum-one` |
| Arbitrum Sepolia | `arbitrum-sepolia` |
| Optimism | `optimism` |
| Optimism Sepolia | `optimism-sepolia` |
| Polygon | `matic` |
| Polygon Mumbai | `mumbai` |
| Avalanche C-Chain | `avalanche` |
| BSC | `bsc` |
| Gnosis | `gnosis` |
| Celo | `celo` |
| Fantom | `fantom` |
| zkSync Era | `zksync-era` |
| Scroll | `scroll` |
| Linea | `linea` |

## Webhook Payload

When an entity is created/updated, Goldsky sends:

```json
{
  "entity": "Transfer",
  "operation": "INSERT",
  "data": {
    "id": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "1000000000000000000",
    "timestamp": "1700000000",
    "blockNumber": "18000000"
  },
  "block": {
    "number": 18000000,
    "hash": "0x...",
    "timestamp": 1700000000
  }
}
```

## Webhook Setup Examples

### Notify on Large Transfers

```bash
goldsky subgraph webhook create my-token/1.0.0 \
  --name large-transfers \
  --entity Transfer \
  --url https://api.example.com/webhooks/large-transfer
```

### Track New Users

```bash
goldsky subgraph webhook create my-app/1.0.0 \
  --name new-users \
  --entity Account \
  --url https://api.example.com/webhooks/new-user
```

## Deployment Workflow

```bash
# 1. Build subgraph
cd subgraphs/my-subgraph
graph codegen
graph build

# 2. Deploy to Goldsky
goldsky subgraph deploy my-subgraph/1.0.0 --path .

# 3. Test the version endpoint
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-subgraph/1.0.0/gn

# 4. Create production tag
goldsky subgraph tag create my-subgraph/1.0.0 --tag prod

# 5. Use stable tag endpoint in production
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-subgraph/prod/gn
```

## Upgrade Workflow

```bash
# 1. Deploy new version
goldsky subgraph deploy my-subgraph/2.0.0 --path .

# 2. Wait for sync, test new version
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-subgraph/2.0.0/gn

# 3. Move prod tag to new version (instant switch)
goldsky subgraph tag create my-subgraph/2.0.0 --tag prod

# 4. Old version still available for rollback if needed
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-subgraph/1.0.0/gn
```
