# Tributary Development Prompts

## Overview

This directory contains **17 executable prompts** for building the complete Tributary platform with the new design system and architecture.

## Design System

| Element | Value |
|---------|-------|
| **Primary Color** | `#167a5f` (turquoise) |
| **Background** | `#edeae1` (cream) |
| **Title Font** | Birthstone |
| **Body Font** | Roboto Light 300 / Medium 500, ALL CAPS |
| **Aesthetic** | Premium fashion-store |

## Route Structure

```
/                    → Landing Page
/marketplace         → Browse all vaults
/create              → Create vault wizard
/vault/[address]     → Vault detail (tabs)
/trade               → Trade index (all pools)
/trade/[address]     → AMM trading interface
/profile             → User IPs + Holdings + Vaults
```

## Prompt Execution Order

### Phase 0: Design Setup
| # | Prompt | Description |
|---|--------|-------------|
| 0 | `0-design-system.md` | Colors, fonts, base styles |

### Phase 1: Smart Contracts (Prompts 1-5)
| # | Prompt | Description | Dependencies |
|---|--------|-------------|--------------|
| 1 | `1-mock-usdt-contract.md` | MockUSDT ERC-20 | None |
| 2 | `2-update-vault-contracts.md` | Fixed 10K supply, dividend/fee config | None |
| 3 | `3-amm-pool-contract.md` | TributaryAMM (x*y=k) | Prompts 1-2 |
| 4 | `4-contract-tests.md` | Foundry tests | Prompts 1-3 |
| 5 | `5-deploy-contracts.md` | Deploy to Mantle Sepolia | Prompts 1-4 |

### Phase 2: Subgraph (Prompts 6-8)
| # | Prompt | Description | Dependencies |
|---|--------|-------------|--------------|
| 6 | `6-subgraph-schema.md` | Schema with AMM + candles | Prompt 5 |
| 7 | `7-subgraph-handlers.md` | Event handlers + OHLCV | Prompt 6 |
| 8 | `8-deploy-subgraph.md` | Deploy to Goldsky | Prompts 6-7 |

### Phase 3: Trading Bot (Prompt 9)
| # | Prompt | Description | Dependencies |
|---|--------|-------------|--------------|
| 9 | `9-trading-bot.md` | Volume generation bot | Prompts 5, 8 |

### Phase 4: Frontend (Prompts 10-16)
| # | Prompt | Description | Dependencies |
|---|--------|-------------|--------------|
| 10 | `10-frontend-layout.md` | Layout, navbar, routes | Prompt 0 |
| 11 | `11-landing-page.md` | Hero, stats, featured | Prompts 8, 10 |
| 12 | `12-marketplace-page.md` | Browse vaults | Prompts 8, 10 |
| 13 | `13-profile-page.md` | IPs, holdings, vaults | Prompts 8, 10 |
| 14 | `14-create-vault-page.md` | Vault creation wizard | Prompts 5, 10 |
| 15 | `15-vault-detail-page.md` | Vault detail + tabs | Prompts 8, 10 |
| 16 | `16-trade-page.md` | AMM trading interface | Prompts 8, 10 |

## Execution Flow

```
PHASE 0: DESIGN
    [0] Design System
         │
         ▼
PHASE 1: CONTRACTS ──────────────────────────────────
    [1] MockUSDT → [2] Update Vaults → [3] AMM
                                         │
    [4] Tests ◄──────────────────────────┘
         │
    [5] Deploy
         │
         ├────────────────────────┬─────────────────┐
         ▼                        ▼                 ▼
PHASE 2: SUBGRAPH         PHASE 3: BOT      PHASE 4: FRONTEND
    [6] Schema               [9] Bot           [10] Layout
         │                                          │
    [7] Handlers                              ┌─────┼─────┐
         │                                    ▼     ▼     ▼
    [8] Deploy ─────────────────────────► [11] [12] [13]
                                         [14] [15] [16]
```

## How to Run

### Sequential
```
run prompt 0
run prompt 1
run prompt 2
...
```

### Parallel (After Dependencies Met)
```
# After prompt 5 (contracts deployed):
run prompts 6, 9, 10 in parallel

# After prompt 8 (subgraph deployed):
run prompts 11, 12, 13 in parallel
```

## Key Features

### Economics Model
- **Fixed Supply**: 10,000 tokens for ALL vaults
- **Dividend %**: Creator configures (0-100%)
- **Trade Fee %**: Creator configures (0-5%)
- **Protocol Fee**: 2% on dividend distributions

### Token Flow
```
IP Revenue → Vault.depositRoyalty()
    │
    ├─ 2% → Protocol Treasury
    │
    ├─ (100% - dividendBps) → Creator
    │
    └─ dividendBps → Pending Distribution
                         │
                    distribute()
                         │
                         ▼
                 Token Holders (proportional)
```

### UI/UX
- Premium fashion-store aesthetic
- Generous whitespace
- Birthstone script font for titles
- Roboto ALL CAPS for body text
- Turquoise (`#167a5f`) primary color
- Cream (`#edeae1`) background

## Files Created

After all prompts, the project will have:

### Contracts
- `MockUSDT.sol`
- `RoyaltyVaultFactory.sol` (updated)
- `RoyaltyVault.sol` (updated)
- `RoyaltyMarketplace.sol` (updated)
- `TributaryAMM.sol`

### Subgraph
- Schema with Vault, Token, Pool, Swap, Candle entities
- Handlers for all events
- OHLCV candle aggregation

### Frontend Pages
- `/` - Landing
- `/marketplace` - Browse vaults
- `/create` - Create vault wizard
- `/vault/[address]` - Vault detail
- `/trade` - Pool list
- `/trade/[address]` - Trading interface
- `/profile` - User dashboard

### Bot
- Trading volume generator
- Realistic price patterns
- Multi-wallet support

## Estimated Time

| Phase | Prompts | Effort |
|-------|---------|--------|
| Design | 0 | ~30 min |
| Contracts | 1-5 | ~3-4 hours |
| Subgraph | 6-8 | ~2 hours |
| Bot | 9 | ~1 hour |
| Frontend | 10-16 | ~6-8 hours |
| **Total** | **17** | **~12-16 hours** |
