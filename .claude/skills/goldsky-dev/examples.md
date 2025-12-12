# Goldsky Development Examples

## Standard Subgraph Deployment

### From Existing Subgraph

```bash
# Navigate to subgraph directory
cd subgraphs/my-token

# Generate types and build
graph codegen
graph build

# Deploy to Goldsky
goldsky subgraph deploy my-token/1.0.0 --path .

# Output:
# ✓ Subgraph deployed successfully
# Endpoint: https://api.goldsky.com/api/public/abc123/subgraphs/my-token/1.0.0/gn

# Create production tag
goldsky subgraph tag create my-token/1.0.0 --tag prod

# Stable endpoint:
# https://api.goldsky.com/api/public/abc123/subgraphs/my-token/prod/gn
```

## Instant Subgraph (No-Code)

### ERC20 Token Tracking

Create `instant-config.json`:

```json
{
  "version": "1",
  "name": "usdc-tracker",
  "abis": {
    "ERC20": {
      "path": "./abis/ERC20.json"
    }
  },
  "instances": [
    {
      "abi": "ERC20",
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "chain": "mainnet",
      "startBlock": 6082465
    }
  ]
}
```

Deploy:

```bash
goldsky subgraph deploy usdc-tracker/1.0.0 --from-abi instant-config.json
```

### Multi-Chain DEX Tracking

Create `dex-config.json`:

```json
{
  "version": "1",
  "name": "uniswap-v2-pools",
  "abis": {
    "UniswapV2Pair": {
      "path": "./abis/UniswapV2Pair.json"
    }
  },
  "instances": [
    {
      "abi": "UniswapV2Pair",
      "address": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      "chain": "mainnet",
      "startBlock": 10008355
    },
    {
      "abi": "UniswapV2Pair",
      "address": "0x...",
      "chain": "base",
      "startBlock": 2000000
    },
    {
      "abi": "UniswapV2Pair",
      "address": "0x...",
      "chain": "arbitrum-one",
      "startBlock": 100000000
    }
  ]
}
```

Deploy:

```bash
goldsky subgraph deploy uniswap-pools/1.0.0 --from-abi dex-config.json
```

## Webhook Integration

### Discord Notifications for Large Transfers

1. Create subgraph with Transfer entity
2. Set up webhook:

```bash
goldsky subgraph webhook create my-token/1.0.0 \
  --name discord-alerts \
  --entity Transfer \
  --url https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

3. Discord webhook handler (example):

```typescript
// api/webhooks/transfer/route.ts
import { NextResponse } from 'next/server'
import { formatEther } from 'viem'

export async function POST(request: Request) {
  const payload = await request.json()

  // Check if large transfer
  const amount = BigInt(payload.data.amount)
  const threshold = BigInt('1000000000000000000000') // 1000 tokens

  if (amount >= threshold) {
    // Send to Discord
    await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: 'Large Transfer Detected',
          color: 0xff0000,
          fields: [
            { name: 'From', value: payload.data.from, inline: true },
            { name: 'To', value: payload.data.to, inline: true },
            { name: 'Amount', value: formatEther(amount), inline: true },
            { name: 'Block', value: payload.block.number.toString(), inline: true },
          ],
        }],
      }),
    })
  }

  return NextResponse.json({ success: true })
}
```

### Supabase Sync for Indexer Data

```bash
goldsky subgraph webhook create my-app/1.0.0 \
  --name supabase-sync \
  --entity Account \
  --url https://your-app.com/api/webhooks/account-sync
```

Handler:

```typescript
// api/webhooks/account-sync/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const payload = await request.json()

  if (payload.operation === 'INSERT' || payload.operation === 'UPDATE') {
    await supabase.from('indexed_accounts').upsert({
      address: payload.data.id,
      balance: payload.data.balance,
      transfer_count: payload.data.transferCount,
      last_indexed_block: payload.block.number,
      updated_at: new Date().toISOString(),
    })
  }

  return NextResponse.json({ success: true })
}
```

## Zero-Downtime Upgrade

### Initial Deployment

```bash
# Deploy v1
goldsky subgraph deploy my-dapp/1.0.0 --path .

# Wait for sync
goldsky subgraph log my-dapp/1.0.0

# Create prod tag
goldsky subgraph tag create my-dapp/1.0.0 --tag prod

# Frontend uses:
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-dapp/prod/gn
```

### Upgrade Process

```bash
# Make schema/mapping changes...

# Deploy v2
goldsky subgraph deploy my-dapp/2.0.0 --path .

# Wait for sync
goldsky subgraph log my-dapp/2.0.0

# Test v2 endpoint directly
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ transfers(first: 5) { id } }"}' \
  https://api.goldsky.com/api/public/PROJECT/subgraphs/my-dapp/2.0.0/gn

# If all good, instant switch
goldsky subgraph tag create my-dapp/2.0.0 --tag prod

# Frontend automatically uses v2 (no code change needed)
# Old v1 still available for rollback:
# https://api.goldsky.com/api/public/PROJECT/subgraphs/my-dapp/1.0.0/gn
```

### Rollback

```bash
# Something wrong with v2? Instant rollback:
goldsky subgraph tag create my-dapp/1.0.0 --tag prod

# Frontend immediately switches back to v1
```

## Debugging

### Check Sync Status

```bash
goldsky subgraph list my-subgraph/1.0.0
```

### View Logs

```bash
# Stream logs
goldsky subgraph log my-subgraph/1.0.0

# Check for errors
goldsky subgraph log my-subgraph/1.0.0 | grep -i error
```

### Test Query

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ _meta { block { number } } }"}' \
  https://api.goldsky.com/api/public/PROJECT/subgraphs/my-subgraph/prod/gn
```
