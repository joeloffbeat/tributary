# iPay: HTTP-Native IP Licensing Marketplace

**Tagline**: Pay-per-use intellectual property licensing with just an HTTP request. No wallets, no gas fees, no friction.

---

## Problem

The creator economy is broken:
- Stock photo licenses cost $10-50 with 90-day payout delays
- Music licensing involves legal contracts and 40-60% intermediary cuts
- No viable micropayment model for $0.01 transactions
- Fragmented IP rights with no unified on-chain registry

---

## Solution

iPay combines **Story Protocol** (on-chain IP registration) + **x402 micropayments** (HTTP-native payments) + **Hyperlane** (cross-chain settlement) to create a frictionless IP marketplace.

**The Magic**: License any IP asset with a single HTTP request:
```bash
curl -X POST https://ipay.app/api/pay/listing-123 \
  -H "X-PAYMENT: <signed_usdc_authorization>" \
  -o licensed-asset.png
```

No MetaMask. No gas fees. No blockchain knowledge required.

---

## Key Features

| For Consumers | For Creators |
|---------------|--------------|
| HTTP payments - no wallet needed | Instant USDC payouts |
| Micropayments ($0.001 - $50) | On-chain IP ownership proof |
| Instant asset delivery | Analytics dashboard |
| Legal receipts (ERC-8004) | Dispute resolution |

---

## How It Works

```
User signs USDC payment intent
        ↓
iPay API settles payment (Avalanche)
        ↓
Hyperlane bridges to Story Protocol
        ↓
License minted + Creator paid instantly
        ↓
User receives asset + on-chain receipt
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TailwindCSS, shadcn/ui |
| Web3 | wagmi v2, viem v2, thirdweb x402 |
| Contracts | Solidity 0.8.24, Foundry |
| IP Layer | Story Protocol SDK v1.4.2 |
| Cross-Chain | Hyperlane SDK v19.11.0 |
| Indexing | Goldsky Subgraph |

---

## Innovation Highlights

1. **x402 HTTP Payments**: Embed payment in HTTP headers - works with any client
2. **Cross-Chain Settlement**: Pay on Avalanche, enforce rights on Story Protocol
3. **Instant Payouts**: Creators receive USDC in seconds, not months
4. **Legal On-Chain Licensing**: Story Protocol PIL = legally-enforceable terms

---

## Use Cases

| Asset | Price | Example |
|-------|-------|---------|
| Stock Photos | $0.05 | Blog posts, social media |
| Music Samples | $0.10 | Podcasts, content creation |
| Code Snippets | $0.001 | AI coding assistants |
| AI Training Data | $0.01 | LLM fine-tuning |
| Design Templates | $0.50 | Marketing materials |

---

## Deployed Contracts

| Contract | Network |
|----------|---------|
| IPayRegistry | Avalanche Fuji |
| IPayReceiver | Story Aeneid (1315) |
| LicenseMarketplace | Avalanche Fuji |

Subgraph: Goldsky (Story Aeneid)

---

## Track Alignment

- **Story Protocol**: IP registration, PIL licensing, royalties, disputes
- **Cross-Chain**: Hyperlane messaging + Warp Route token bridging
- **Payments**: x402 micropayments, instant USDC settlement

---

## Links

- **GitHub**: https://github.com/gabrielantonyxaviour/ipay

---

## Summary

iPay transforms IP licensing from a legal nightmare into an HTTP request. Creators get paid instantly, consumers pay only for what they use, and everyone gets legally-valid on-chain proof of rights.

*The future of intellectual property is programmable, permissionless, and pays in milliseconds.*
