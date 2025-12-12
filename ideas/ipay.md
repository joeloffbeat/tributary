# IPay

## Project Name
**IPay** - Pay-Per-Use IP Licensing via x402

## Short Description
A unified platform combining Story Protocol IP registration with x402 micropayments for instant, pay-per-use IP licensing. Use an image, pay the creator, get a receipt.

## Full Description
IPay bridges Story Protocol's IP infrastructure with x402's payment rails to enable a new paradigm: **pay-per-use intellectual property**. Instead of negotiating licenses upfront, consumers pay micropayments each time they use an IP asset, and creators receive instant royalties.

**The Vision:**
- Every IP asset (image, music, code, data) has an on-chain price
- Anyone can use any IP by paying the stated price via x402
- Creators receive instant payment (no 90-day delays)
- ERC-8004 receipt proves legal usage rights

**For Creators:**
- Register IP on Story Protocol (establishes ownership)
- Set pay-per-use pricing on IPay ($0.01 - $10.00)
- Receive instant x402 payments when IP is used
- Track usage analytics and revenue

**For Consumers:**
- Browse/search IPay marketplace
- Use any IP by clicking "Pay & Use"
- Receive legally-valid receipt (ERC-8004)
- No negotiation, no contracts, instant access

**Use Cases:**
- Stock photos: $0.05 per use
- Music samples: $0.10 per download
- Code libraries: $0.001 per API call
- AI training data: $0.01 per sample
- Design templates: $0.50 per download

## How It's Made

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TailwindCSS, shadcn/ui |
| Backend | Node.js, Express |
| Story Protocol | Story Protocol SDK, PIL License Terms |
| Payments | x402 Protocol on Avalanche |
| Storage | IPFS (assets), PostgreSQL (metadata) |
| Indexing | The Graph (Story events), Custom indexer |

### APIs & Integrations
- **Story Protocol SDK** - IP registration, licensing, royalties
- **x402 Protocol** - Micropayment infrastructure
- **Avalanche C-Chain** - Payment settlement
- **Story Network** - IP asset registry
- **IPFS/Filecoin** - Decentralized asset storage
- **The Graph** - Index IP registrations and payments

### Cross-Chain Architecture
```
┌─────────────────────────────────────────────────────────┐
│                         IPay                             │
├────────────────────────┬────────────────────────────────┤
│    Story Protocol      │         Avalanche x402          │
│    (Story Network)     │         (C-Chain)               │
├────────────────────────┼────────────────────────────────┤
│  • IP Registration     │  • x402 Payments               │
│  • Ownership Proof     │  • ERC-8004 Receipts           │
│  • License Terms       │  • Instant Settlement          │
│  • Royalty Config      │  • Payment Verification        │
└────────────────────────┴────────────────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    IPay Bridge      │
              │  (Links IP → Price) │
              └─────────────────────┘
```

### Smart Contracts

**IPayRegistry.sol** (Avalanche)
```solidity
contract IPayRegistry {
    struct IPListing {
        bytes32 storyIPId;       // Story Protocol IP ID
        address creator;
        uint256 pricePerUse;
        address paymentToken;    // USDC
        uint256 totalUses;
        uint256 totalRevenue;
        bool active;
    }

    mapping(bytes32 => IPListing) public listings;

    // Link Story IP to x402 pricing
    function createListing(
        bytes32 storyIPId,
        uint256 pricePerUse,
        bytes calldata storyOwnershipProof
    ) external returns (bytes32 listingId);

    // Use IP via x402 payment
    function useIP(
        bytes32 listingId,
        bytes calldata x402Payment
    ) external returns (
        bytes32 receiptId,
        string memory assetUrl
    );

    // Verify usage receipt
    function verifyReceipt(
        bytes32 receiptId
    ) external view returns (bool valid, IPListing memory listing);
}
```

### Usage Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Creator    │     │    IPay      │     │   Consumer   │
│              │     │   Platform   │     │              │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Register IP     │                    │
       │    on Story        │                    │
       ├───────────────────►│                    │
       │                    │                    │
       │ 2. Set x402 price  │                    │
       │    on IPay         │                    │
       ├───────────────────►│                    │
       │                    │                    │
       │                    │                    │ 3. Browse/search
       │                    │◄───────────────────┤
       │                    │                    │
       │                    │                    │ 4. Click "Use"
       │                    │                    │    Pay via x402
       │                    │◄───────────────────┤
       │                    │                    │
       │ 5. Receive         │ 6. Return asset    │
       │    payment         │    + receipt       │
       │◄───────────────────┤───────────────────►│
```

### IP Metadata Structure
```json
{
  "storyIPId": "0x...",
  "title": "Sunset Photography Collection",
  "description": "High-res sunset photos for commercial use",
  "creator": {
    "address": "0x...",
    "name": "Jane Photographer"
  },
  "assets": [
    {
      "id": "asset-001",
      "type": "image/jpeg",
      "resolution": "4000x3000",
      "ipfsHash": "Qm..."
    }
  ],
  "pricing": {
    "perUse": 0.05,
    "currency": "USDC",
    "bulkDiscount": {
      "10+": 0.10,
      "100+": 0.20
    }
  },
  "license": {
    "storyLicenseId": "0x...",
    "type": "commercial-use",
    "attribution": true
  }
}
```

### Key Technical Decisions
- Story Protocol for IP registration (established standard)
- x402 on Avalanche for payments (fast, cheap)
- Bridge contract links Story IP IDs to Avalanche pricing
- IPFS for asset storage with access-gated retrieval
- ERC-8004 receipts serve as legally-valid proof of license
- The Graph indexes both Story events and Avalanche payments
- Multi-chain design allows each protocol to do what it's best at
- SDK for programmatic access (AI agents can pay for IP)

### Hackathon Submission Strategy
Submit to both hackathons:
1. **Story Protocol - IPFi Track** - Novel IP monetization model
2. **Avalanche x402 - Consumer Payments** - Real-world payment use case

Single project, multiple prize opportunities.
