# iPay Continuation Prompt - Complete Story Protocol Integration

## Context

iPay is a cross-chain IP marketplace that enables users to pay for Story Protocol licenses using USDC on Avalanche Fuji via x402 HTTP payments. The system uses Hyperlane for cross-chain messaging between Avalanche Fuji (43113) and Story Aeneid (1315).

### Current Architecture

```
Avalanche Fuji (43113)              Story Aeneid (1315)
┌─────────────────────┐             ┌─────────────────────┐
│  IPayRegistry       │             │  IPayReceiver       │
│  - createListing()  │             │  - handle()         │
│  - recordUsage()    │             │  - mintLicense()    │
│                     │             │  - createDerivative │
│  Hyperlane Mailbox  │────────────▶│  Story Protocol     │
│  x402 Payments      │  Hyperlane  │  - IPAssetRegistry  │
│  Thirdweb Server    │  Message    │  - LicensingModule  │
└─────────────────────┘             │  - DisputeModule    │
                                    └─────────────────────┘
```

### What's Already Implemented

1. **IPayRegistry** (Avalanche): Creates listings with Story IP ID, price, metadata
2. **IPayReceiver** (Story): Receives Hyperlane messages, executes Story Protocol ops
   - `OP_MINT_LICENSE (1)`: Mints license tokens
   - `OP_CREATE_DERIVATIVE (2)`: Creates derivative IPs
3. **Payment API**: x402 settlement → Hyperlane dispatch → License minting
4. **Frontend**: Listing creation, purchase flow, dashboard
5. **Story Playground**: Full UI for Story Protocol operations (register, license, derivatives, royalties, disputes)

### What Needs to Be Implemented

1. **Cross-chain IP Registration** - Register IPs from Avalanche via Hyperlane
2. **License Token Marketplace** - List/sell/buy ERC721 license tokens
3. **Cross-chain Dispute Filing** - Raise disputes from Avalanche via Hyperlane

---

## Task 1: Cross-chain IP Registration

### Goal
Allow users to register IP Assets on Story Protocol directly from Avalanche Fuji. The user provides NFT details and metadata, and the system registers it cross-chain.

### Implementation Requirements

#### 1.1 Update IPayReceiver.sol

Add new operation type for IP registration:

```solidity
// New operation type
uint8 public constant OP_REGISTER_IP = 3;

// In handle() function, add:
else if (opType == OP_REGISTER_IP) {
    _handleRegisterIP(payload);
}

// New handler function
function _handleRegisterIP(bytes memory payload) internal {
    (
        bytes32 messageId,
        address nftContract,      // NFT collection address on Story
        uint256 tokenId,          // Token ID to register
        string memory metadataURI // IP metadata URI (IPFS)
    ) = abi.decode(payload, (bytes32, address, uint256, string));

    // Register IP using Story Protocol's IP Asset Registry
    address ipId = IIPAssetRegistry(IP_ASSET_REGISTRY).register(
        block.chainid,  // Story's chain ID
        nftContract,
        tokenId
    );

    // Optionally set metadata
    // IIPAssetRegistry(IP_ASSET_REGISTRY).setMetadata(ipId, metadataURI);

    emit IPRegistered(messageId, nftContract, tokenId, ipId);
}
```

#### 1.2 Story Protocol Interfaces

```solidity
interface IIPAssetRegistry {
    function register(uint256 chainId, address tokenContract, uint256 tokenId)
        external returns (address ipId);

    function ipId(uint256 chainId, address tokenContract, uint256 tokenId)
        external view returns (address);
}
```

#### 1.3 Frontend Integration

Add to `/frontend/app/ipay/create/` flow:
- Option to register new IP from Avalanche (vs selecting existing)
- NFT contract address + token ID input
- Metadata builder (similar to Story playground)
- API endpoint to dispatch registration message

#### 1.4 API Endpoint

Create `/api/ipay/register-ip/route.ts`:
- Accept NFT details + metadata
- Dispatch Hyperlane message with OP_REGISTER_IP
- Return message ID for tracking

### Contract Addresses

```solidity
// Story Aeneid
address constant IP_ASSET_REGISTRY = 0x77319B4031e6eF1250907aa00018B8B1c67a244b;
```

---

## Task 2: License Token Marketplace

### Goal
Create a marketplace for trading ERC721 license tokens. Users can list their license tokens for sale, and others can purchase them.

### Implementation Requirements

#### 2.1 New Contract: LicenseMarketplace.sol (Avalanche Fuji)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title LicenseMarketplace
/// @notice Marketplace for trading Story Protocol license tokens
/// @dev Stores listings referencing license tokens on Story Aeneid
contract LicenseMarketplace is ReentrancyGuard {

    struct LicenseListing {
        uint256 id;
        address seller;
        uint256 licenseTokenId;     // License token ID on Story
        address ipId;               // Associated IP Asset
        uint256 licenseTermsId;     // License terms
        uint256 priceUSDC;          // Price in USDC (6 decimals)
        bool active;
        uint256 createdAt;
    }

    IERC20 public immutable usdc;
    uint256 public nextListingId;
    uint256 public platformFee; // Basis points (e.g., 250 = 2.5%)
    address public feeRecipient;

    mapping(uint256 => LicenseListing) public listings;
    mapping(address => uint256[]) public sellerListings;

    event LicenseListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        uint256 licenseTokenId,
        address ipId,
        uint256 priceUSDC
    );

    event LicenseSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 priceUSDC
    );

    function createListing(
        uint256 licenseTokenId,
        address ipId,
        uint256 licenseTermsId,
        uint256 priceUSDC
    ) external returns (uint256 listingId);

    function purchaseLicense(uint256 listingId) external;

    function cancelListing(uint256 listingId) external;
}
```

#### 2.2 Cross-chain License Transfer

Since license tokens are on Story, purchasing requires:
1. Buyer pays USDC on Avalanche
2. Hyperlane message triggers transfer on Story
3. New operation in IPayReceiver:

```solidity
uint8 public constant OP_TRANSFER_LICENSE = 4;

function _handleTransferLicense(bytes memory payload) internal {
    (
        bytes32 messageId,
        uint256 licenseTokenId,
        address from,
        address to
    ) = abi.decode(payload, (bytes32, uint256, address, address));

    // Transfer license token
    ILicenseToken(LICENSE_TOKEN).transferFrom(from, to, licenseTokenId);

    emit LicenseTransferred(messageId, licenseTokenId, from, to);
}
```

**Challenge**: The IPayReceiver can't call `transferFrom` unless it has approval. Options:
1. **Escrow Model**: Seller transfers license to IPayReceiver first (holds in escrow)
2. **Approval Model**: Seller pre-approves IPayReceiver as operator

#### 2.3 License Token Contract

```solidity
// Story Aeneid
address constant LICENSE_TOKEN = 0xFe3838BFb30B34170F00030B52EFa71999C4Ec3B;

interface ILicenseToken {
    function balanceOf(address owner) external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function getLicenseTermsId(uint256 tokenId) external view returns (uint256);
    function getLicensorIpId(uint256 tokenId) external view returns (address);
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
}
```

#### 2.4 Frontend Pages

Create `/frontend/app/ipay/marketplace/`:
- `/page.tsx` - Browse license listings
- `/sell/page.tsx` - List owned license tokens for sale
- `/components/license-listing-card.tsx` - Display listing
- `/components/purchase-dialog.tsx` - Purchase flow with x402

#### 2.5 Subgraph Updates

Add to subgraph schema:
```graphql
type LicenseListing @entity {
  id: ID!
  seller: Bytes!
  licenseTokenId: BigInt!
  ipId: Bytes!
  licenseTermsId: BigInt!
  priceUSDC: BigInt!
  active: Boolean!
  buyer: Bytes
  soldAt: BigInt
  createdAt: BigInt!
}
```

---

## Task 3: Cross-chain Dispute Filing

### Goal
Allow users to raise disputes against Story Protocol IP Assets from Avalanche Fuji via Hyperlane.

### Implementation Requirements

#### 3.1 Update IPayReceiver.sol

```solidity
uint8 public constant OP_RAISE_DISPUTE = 5;

// Story Protocol Dispute Module interface
interface IDisputeModule {
    function raiseDispute(
        address targetIpId,
        bytes32 disputeEvidenceHash,
        bytes32 targetTag,
        bytes calldata data
    ) external returns (uint256 disputeId);
}

address public immutable disputeModule;

function _handleRaiseDispute(bytes memory payload) internal {
    (
        bytes32 messageId,
        address targetIpId,
        bytes32 evidenceHash,      // IPFS CID as bytes32
        bytes32 disputeTag,        // IMPROPER_REGISTRATION, etc.
        uint256 bondAmount,        // WIP bond amount
        address disputant          // Who raised the dispute
    ) = abi.decode(payload, (bytes32, address, bytes32, bytes32, uint256, address));

    // Check WIP liquidity for bond
    require(wipLiquidity >= bondAmount, "Insufficient bond liquidity");
    wipLiquidity -= bondAmount;

    // Approve WIP to dispute module
    wip.approve(disputeModule, bondAmount);

    // Raise dispute
    uint256 disputeId = IDisputeModule(disputeModule).raiseDispute(
        targetIpId,
        evidenceHash,
        disputeTag,
        "" // Additional data
    );

    emit DisputeRaised(messageId, disputeId, targetIpId, disputant, bondAmount);
}
```

#### 3.2 Dispute Tags

```solidity
// Story Protocol dispute tags (from SDK)
bytes32 constant TAG_IMPROPER_REGISTRATION = keccak256("IMPROPER_REGISTRATION");
bytes32 constant TAG_IMPROPER_USAGE = keccak256("IMPROPER_USAGE");
bytes32 constant TAG_IMPROPER_PAYMENT = keccak256("IMPROPER_PAYMENT");
bytes32 constant TAG_CONTENT_STANDARDS_VIOLATION = keccak256("CONTENT_STANDARDS_VIOLATION");
```

#### 3.3 Contract Address

```solidity
// Story Aeneid
address constant DISPUTE_MODULE = 0x3f03E6AD8B8B82017caB15f7D9e4D52b7aa25E63;
```

#### 3.4 Frontend Integration

Add to `/frontend/app/ipay/`:
- `/disputes/page.tsx` - View disputes
- `/disputes/raise/page.tsx` - Raise dispute form
- Components from Story playground for evidence builder

#### 3.5 API Endpoint

Create `/api/ipay/raise-dispute/route.ts`:
- Accept target IP ID, evidence, dispute tag, bond amount
- Upload evidence to IPFS if needed
- Dispatch Hyperlane message with OP_RAISE_DISPUTE
- Return message ID for tracking

---

## Contract Addresses Summary

### Avalanche Fuji (43113)

| Contract | Address |
|----------|---------|
| IPayRegistry | `0x883172EDFF24FE83FDE776f7A9Aaa59CCe5ABA2B` |
| USDC | `0x5425890298aed601595a70AB815c96711a31Bc65` |
| Hyperlane Mailbox | `0x60c3ca08D3df3F5fA583c535D9E44F3629F52452` |
| Thirdweb Server Wallet | `0x07b8b50fb9b06c25D6ced1734378f5F2eA996b4C` |

### Story Aeneid (1315)

| Contract | Address |
|----------|---------|
| IPayReceiver | `0xA5fa941d3c000ec425Fa7aDcAA0a9f5Bdb807f0F` |
| Hyperlane Mailbox | `0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d` |
| WIP Token | `0x1514000000000000000000000000000000000000` |
| IP Asset Registry | `0x77319B4031e6eF1250907aa00018B8B1c67a244b` |
| License Registry | `0x529a750E02d8E2f15649c13D69a465286a780e24` |
| Licensing Module | `0x04fbd8a2e56dd85CFD5500A4A4DfA955B9f1dE6f` |
| PIL Template | `0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316` |
| Royalty Module | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
| Dispute Module | `0x3f03E6AD8B8B82017caB15f7D9e4D52b7aa25E63` |
| License Token (ERC721) | `0xFe3838BFb30B34170F00030B52EFa71999C4Ec3B` |

---

## Existing Code References

### IPayReceiver Pattern

```typescript
// Message encoding pattern (from /api/ipay/pay/[listingId]/route.ts)
const payload = encodeAbiParameters(
  [
    { type: 'bytes32', name: 'messageId' },
    { type: 'address', name: 'ipId' },
    { type: 'uint256', name: 'licenseTermsId' },
    { type: 'uint256', name: 'usdcAmount' },
    { type: 'address', name: 'recipient' },
  ],
  [messageId, ipId, licenseTermsId, usdcAmount, recipient]
)

const message = concat([toHex(OP_MINT_LICENSE, { size: 1 }), payload])
```

### Hyperlane Dispatch Pattern

```typescript
// Dispatch via Thirdweb Engine
const response = await fetch(
  `${ENGINE_URL}/contract/43113/${MAILBOX}/write`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
      'x-backend-wallet-address': process.env.THIRDWEB_SERVER_WALLET_ADDRESS,
    },
    body: JSON.stringify({
      functionName: 'dispatch',
      args: [STORY_DOMAIN_ID, recipientBytes32, message],
      txOverrides: { value: '0' },
    }),
  }
)
```

### Story Playground Reference

See `/frontend/app/playground/protocols/story/` for:
- IP registration UI patterns
- License operations
- Dispute filing with evidence builder
- Story Client SDK usage

---

## Implementation Order

1. **Phase 1: IPayReceiver Updates**
   - Add OP_REGISTER_IP handler
   - Add OP_RAISE_DISPUTE handler
   - Deploy updated contract
   - Update trusted sender

2. **Phase 2: API Endpoints**
   - `/api/ipay/register-ip` - Cross-chain IP registration
   - `/api/ipay/raise-dispute` - Cross-chain dispute filing

3. **Phase 3: License Marketplace**
   - Deploy LicenseMarketplace contract
   - Add OP_TRANSFER_LICENSE to IPayReceiver
   - Create marketplace frontend
   - Update subgraph

4. **Phase 4: Frontend Integration**
   - Add IP registration to listing creation flow
   - Add dispute tab to iPay dashboard
   - Build marketplace UI

---

## Testing Checklist

- [ ] IP Registration: Register NFT as IP from Avalanche
- [ ] License Purchase: Pay USDC → Receive license token on Story
- [ ] License Listing: List owned license token for sale
- [ ] License Purchase (Secondary): Buy license token from marketplace
- [ ] Dispute Filing: Raise dispute from Avalanche against Story IP

---

## Environment Variables Required

```env
# Thirdweb
THIRDWEB_SECRET_KEY=
THIRDWEB_SERVER_WALLET_ADDRESS=0x07b8b50fb9b06c25D6ced1734378f5F2eA996b4C
THIRDWEB_ENGINE_URL=https://engine.thirdweb.com

# Story Protocol
STORY_API_KEY=KOTbaGUSWQ6cUJWhiJYiOjPgB0kTRu1eCFFvQL0IWls

# Deployment (for contract updates)
PRIVATE_KEY=
STORY_AENEID_RPC_URL=https://aeneid.storyrpc.io
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

---

## Key Files to Modify

### Contracts
- `/contracts/src/IPayReceiver.sol` - Add new operation handlers
- `/contracts/src/LicenseMarketplace.sol` - New contract (create)
- `/contracts/script/` - Deployment scripts

### Frontend
- `/frontend/app/ipay/constants.ts` - Add new addresses
- `/frontend/app/api/ipay/` - New API endpoints
- `/frontend/app/ipay/marketplace/` - New marketplace pages
- `/frontend/app/ipay/disputes/` - Dispute UI

### Subgraph
- `/subgraph/ipay/schema.graphql` - Add LicenseListing entity
- `/subgraph/ipay/src/mapping.ts` - Handle new events
