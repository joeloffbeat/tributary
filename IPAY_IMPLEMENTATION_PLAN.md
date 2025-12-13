# iPay Implementation Plan v3 (x402 Edition)

## Overview

Cross-chain IP marketplace using **x402 HTTP payments**. Users pay via HTTP headers (any client), and the server handles all cross-chain complexity to mint license tokens or create derivatives on Story Protocol.

**Key Benefit**: Any HTTP client (web, mobile, CLI, API) can purchase IP licenses without direct blockchain interaction.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ANY HTTP CLIENT                                │
│         (Web Browser, Mobile App, CLI, cURL, API Integration)               │
│                                                                             │
│   1. Client signs USDC payment intent (x402 header)                         │
│   2. POST /api/ipay/license/{ipId} or /api/ipay/derivative/{ipId}          │
│      with X-PAYMENT header containing signed authorization                  │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         iPAY API SERVER (Next.js)                           │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                    settlePayment() - Thirdweb x402                │     │
│   │                                                                   │     │
│   │   1. Extract X-PAYMENT header                                     │     │
│   │   2. Verify signature matches payer wallet                        │     │
│   │   3. Execute USDC transfer: Payer → Server Wallet                 │     │
│   │   4. If success, trigger cross-chain flow                         │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                    │                                        │
│                                    ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                Cross-Chain Payment Executor                       │     │
│   │                                                                   │     │
│   │   Server wallet (funded with AVAX) sends:                         │     │
│   │   - Warp Route: Bridge USDC to IPayReceiver on Story              │     │
│   │   - Mailbox: Payment instruction (ipId, amount, buyer)            │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │   USDC Warp Route │           │  Hyperlane        │
        │   (tokens)        │           │  Mailbox (data)   │
        └─────────┬─────────┘           └─────────┬─────────┘
                  │                               │
                  │    Hyperlane Relayer          │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STORY AENEID (1315)                                 │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                     IPayReceiver Contract                         │     │
│   │                                                                   │     │
│   │   1. Receives USDC from Warp Route                                │     │
│   │   2. Receives payment instruction from Mailbox                    │     │
│   │   3. Uses WIP from liquidity pool                                 │     │
│   │   4. Calls appropriate Story Protocol function:                   │     │
│   │      - payRoyaltyOnBehalf() for license minting                   │     │
│   │      - registerDerivative() for derivative creation               │     │
│   │   5. Emits event for tracking                                     │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                    │                                        │
│                                    ▼                                        │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                     Story Protocol                                │     │
│   │   - Royalty Module: Pay licensing fees                            │     │
│   │   - Licensing Module: Mint license tokens                         │     │
│   │   - IP Registry: Register derivatives                             │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## x402 Payment Flow

### Flow 1: Purchase License Token

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CLIENT (Any HTTP Client)                                                 │
│                                                                          │
│ 1. User signs payment intent with wallet                                 │
│    - Amount: Minting fee in USDC (converted from WIP)                    │
│    - Creates X-PAYMENT header (base64 encoded signed payload)            │
│                                                                          │
│ 2. POST /api/ipay/license/{storyIpId}                                    │
│    Headers: { "X-PAYMENT": "<signed_payment_data>" }                     │
│    Body: { "licenseTermsId": 1, "recipient": "0x..." }                   │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ SERVER (Next.js API)                                                     │
│                                                                          │
│ 3. settlePayment() verifies and executes USDC transfer                   │
│    - Payer → Server Wallet (on Avalanche)                                │
│                                                                          │
│ 4. Server wallet executes cross-chain:                                   │
│    - Approve USDC to Warp Route                                          │
│    - transferRemote() to bridge USDC to Story                            │
│    - dispatch() to send payment instruction                              │
│                                                                          │
│ 5. Return messageId for tracking                                         │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STORY CHAIN (IPayReceiver)                                               │
│                                                                          │
│ 6. Receives USDC + instruction                                           │
│ 7. Converts USDC → WIP (via liquidity pool)                              │
│ 8. Calls royaltyModule.payRoyaltyOnBehalf(ipId, wipAmount)               │
│ 9. License token minted to recipient                                     │
│ 10. Emits LicenseMinted event                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Create Derivative IP

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CLIENT                                                                   │
│                                                                          │
│ 1. User signs payment intent (derivative fee in USDC)                    │
│                                                                          │
│ 2. POST /api/ipay/derivative/{parentIpId}                                │
│    Headers: { "X-PAYMENT": "<signed_payment_data>" }                     │
│    Body: {                                                               │
│      "licenseTermsId": 1,                                                │
│      "nftContract": "0x...",                                             │
│      "tokenId": 123,                                                     │
│      "ipMetadata": { "name": "...", "description": "..." }               │
│    }                                                                     │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ SERVER                                                                   │
│                                                                          │
│ 3. settlePayment() - Collect USDC                                        │
│ 4. Upload IP metadata to IPFS                                            │
│ 5. Execute cross-chain:                                                  │
│    - Bridge USDC + send instruction with derivative data                 │
└───────────────────────────────────┬──────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STORY CHAIN (IPayReceiver)                                               │
│                                                                          │
│ 6. Pays royalty to parent IP                                             │
│ 7. Registers derivative IP                                               │
│ 8. Links derivative to parent                                            │
│ 9. Emits DerivativeCreated event                                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Endpoint 1: Purchase License Token

```
POST /api/ipay/license/{storyIpId}

Headers:
  X-PAYMENT: <base64_encoded_signed_payment>
  Content-Type: application/json

Body:
{
  "licenseTermsId": 1,           // License terms ID on Story
  "recipient": "0x..."           // Address to receive license token (optional, defaults to payer)
}

Response (200 - Success):
{
  "success": true,
  "messageId": "0x...",          // Hyperlane message ID for tracking
  "estimatedDelivery": 120,      // Seconds until confirmation
  "payment": {
    "usdcAmount": "1000000",     // 1 USDC (6 decimals)
    "wipAmount": "10000000...",  // Equivalent WIP
    "txHash": "0x..."            // Avalanche tx hash
  },
  "trackingUrl": "https://explorer.hyperlane.xyz/message/0x..."
}

Response (402 - Payment Required):
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "avalanche-fuji",
    "maxAmountRequired": "1000000",
    "resource": "/api/ipay/license/{storyIpId}",
    "payTo": "0x...",
    "asset": { "address": "0x5425890298aed601595a70AB815c96711a31Bc65" }
  }]
}
```

### Endpoint 2: Create Derivative

```
POST /api/ipay/derivative/{parentIpId}

Headers:
  X-PAYMENT: <base64_encoded_signed_payment>
  Content-Type: application/json

Body:
{
  "licenseTermsId": 1,
  "nftContract": "0x...",        // NFT to register as derivative
  "tokenId": 123,
  "ipMetadata": {
    "name": "My Derivative Work",
    "description": "...",
    "image": "ipfs://..."
  }
}

Response (200 - Success):
{
  "success": true,
  "messageId": "0x...",
  "derivativeIpId": null,        // Populated after cross-chain confirmation
  "estimatedDelivery": 120,
  "payment": { ... },
  "trackingUrl": "..."
}
```

### Endpoint 3: Get Payment Quote

```
GET /api/ipay/quote/{storyIpId}?licenseTermsId=1

Response:
{
  "storyIpId": "0x...",
  "licenseTermsId": 1,
  "mintingFee": {
    "wip": "10000000000000000000",  // 10 WIP (18 decimals)
    "usdc": "1000000",              // 1 USDC (6 decimals)
    "usdcFormatted": "1.00"
  },
  "exchangeRate": "0.1",            // 1 USDC = 10 WIP
  "licenseName": "Commercial Use",
  "ipName": "My IP Asset"
}
```

### Endpoint 4: Track Cross-Chain Status

```
GET /api/ipay/status/{messageId}

Response:
{
  "messageId": "0x...",
  "status": "delivered",           // pending | delivered | processed | failed
  "originTx": "0x...",
  "destinationTx": "0x...",
  "timestamps": {
    "initiated": "2024-01-01T...",
    "delivered": "2024-01-01T...",
    "processed": "2024-01-01T..."
  },
  "result": {
    "licenseTokenId": 123,         // If license minting
    "derivativeIpId": "0x..."      // If derivative creation
  }
}
```

### Endpoint 5: List IP Assets

```
POST /api/ipay/listing

Headers:
  Authorization: Bearer <jwt>      // Authenticated endpoint
  Content-Type: application/json

Body:
{
  "storyIpId": "0x...",
  "licenseTermsId": 1,
  "metadataUri": "ipfs://..."
}

Response:
{
  "success": true,
  "listingId": 42,
  "listing": { ... }
}
```

---

## Smart Contracts

### Contract 1: IPayReceiver (Story Aeneid)

**Purpose**: Receive cross-chain payments and execute Story Protocol operations

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IMessageRecipient} from "@hyperlane/interfaces/IMessageRecipient.sol";

interface IRoyaltyModule {
    function payRoyaltyOnBehalf(
        address receiverIpId,
        address payerIpId,
        address token,
        uint256 amount
    ) external;
}

interface ILicensingModule {
    function mintLicenseTokens(
        address licensorIpId,
        address licenseTemplate,
        uint256 licenseTermsId,
        uint256 amount,
        address receiver,
        bytes calldata royaltyContext
    ) external returns (uint256 startLicenseTokenId);
}

interface IIPAssetRegistry {
    function register(
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external returns (address ipId);

    function registerDerivative(
        address childIpId,
        address[] calldata parentIpIds,
        uint256[] calldata licenseTermsIds,
        address licenseTemplate,
        bytes calldata royaltyContext
    ) external;
}

contract IPayReceiver is IMessageRecipient {
    // Hyperlane
    address public immutable mailbox;
    uint32 public constant AVALANCHE_DOMAIN = 43113;

    // Tokens
    IERC20 public immutable usdc;   // Bridged USDC
    IERC20 public immutable wip;    // WIP token

    // Story Protocol
    IRoyaltyModule public immutable royaltyModule;
    ILicensingModule public immutable licensingModule;
    IIPAssetRegistry public immutable ipRegistry;
    address public immutable pilTemplate;

    // Liquidity & Config
    uint256 public wipLiquidity;
    uint256 public usdcToWipRate;   // e.g., 10 * 1e18 means 1 USDC = 10 WIP
    address public owner;
    bytes32 public trustedSender;   // Server wallet on Avalanche

    // Operation types
    uint8 public constant OP_MINT_LICENSE = 1;
    uint8 public constant OP_CREATE_DERIVATIVE = 2;

    event LicenseMinted(
        bytes32 indexed messageId,
        address indexed ipId,
        address indexed recipient,
        uint256 licenseTokenId,
        uint256 wipAmount
    );

    event DerivativeCreated(
        bytes32 indexed messageId,
        address indexed parentIpId,
        address indexed derivativeIpId,
        uint256 wipAmount
    );

    event PaymentFailed(
        bytes32 indexed messageId,
        uint8 operationType,
        string reason
    );

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external override {
        require(msg.sender == mailbox, "Only mailbox");
        require(_origin == AVALANCHE_DOMAIN, "Invalid origin");
        require(_sender == trustedSender, "Untrusted sender");

        // Decode operation type
        uint8 opType = uint8(_message[0]);
        bytes memory payload = _message[1:];

        if (opType == OP_MINT_LICENSE) {
            _handleMintLicense(payload);
        } else if (opType == OP_CREATE_DERIVATIVE) {
            _handleCreateDerivative(payload);
        }
    }

    function _handleMintLicense(bytes memory payload) internal {
        (
            bytes32 messageId,
            address ipId,
            uint256 licenseTermsId,
            uint256 usdcAmount,
            address recipient
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, address));

        // Calculate WIP amount
        uint256 wipAmount = (usdcAmount * usdcToWipRate) / 1e6;
        require(wipLiquidity >= wipAmount, "Insufficient liquidity");

        wipLiquidity -= wipAmount;

        // Approve and pay royalty (which mints the license token)
        wip.approve(address(royaltyModule), wipAmount);

        try royaltyModule.payRoyaltyOnBehalf(
            ipId,
            address(0),  // External payer
            address(wip),
            wipAmount
        ) {
            // Mint license token to recipient
            uint256 tokenId = licensingModule.mintLicenseTokens(
                ipId,
                pilTemplate,
                licenseTermsId,
                1,  // Single token
                recipient,
                ""  // No royalty context
            );

            emit LicenseMinted(messageId, ipId, recipient, tokenId, wipAmount);
        } catch Error(string memory reason) {
            wipLiquidity += wipAmount;  // Refund to pool
            emit PaymentFailed(messageId, OP_MINT_LICENSE, reason);
        }
    }

    function _handleCreateDerivative(bytes memory payload) internal {
        (
            bytes32 messageId,
            address parentIpId,
            uint256 licenseTermsId,
            uint256 usdcAmount,
            uint256 chainId,
            address nftContract,
            uint256 tokenId
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, uint256, address, uint256));

        uint256 wipAmount = (usdcAmount * usdcToWipRate) / 1e6;
        require(wipLiquidity >= wipAmount, "Insufficient liquidity");

        wipLiquidity -= wipAmount;
        wip.approve(address(royaltyModule), wipAmount);

        try this._createDerivativeInternal(
            messageId, parentIpId, licenseTermsId, wipAmount, chainId, nftContract, tokenId
        ) {
            // Success handled in internal function
        } catch Error(string memory reason) {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, reason);
        }
    }

    function _createDerivativeInternal(
        bytes32 messageId,
        address parentIpId,
        uint256 licenseTermsId,
        uint256 wipAmount,
        uint256 chainId,
        address nftContract,
        uint256 tokenId
    ) external {
        require(msg.sender == address(this), "Internal only");

        // Pay royalty
        royaltyModule.payRoyaltyOnBehalf(parentIpId, address(0), address(wip), wipAmount);

        // Register the NFT as IP
        address derivativeIpId = ipRegistry.register(chainId, nftContract, tokenId);

        // Link as derivative
        address[] memory parentIds = new address[](1);
        parentIds[0] = parentIpId;
        uint256[] memory termIds = new uint256[](1);
        termIds[0] = licenseTermsId;

        ipRegistry.registerDerivative(
            derivativeIpId,
            parentIds,
            termIds,
            pilTemplate,
            ""
        );

        emit DerivativeCreated(messageId, parentIpId, derivativeIpId, wipAmount);
    }

    // Owner functions
    function depositWIP(uint256 amount) external {
        wip.transferFrom(msg.sender, address(this), amount);
        wipLiquidity += amount;
    }

    function withdrawWIP(uint256 amount) external onlyOwner {
        require(wipLiquidity >= amount, "Insufficient");
        wipLiquidity -= amount;
        wip.transfer(owner, amount);
    }

    function withdrawUSDC(uint256 amount) external onlyOwner {
        usdc.transfer(owner, amount);
    }

    function setExchangeRate(uint256 newRate) external onlyOwner {
        usdcToWipRate = newRate;
    }

    function setTrustedSender(bytes32 sender) external onlyOwner {
        trustedSender = sender;
    }
}
```

### No Gateway Contract Needed!

With x402, the **server wallet handles everything on Avalanche**:
- Receives USDC via x402 `settlePayment()`
- Server wallet (already funded with AVAX for gas) executes cross-chain calls
- No additional smart contract needed on Avalanche

---

## Server Implementation

### API Route: License Purchase

**Location:** `frontend/app/api/ipay/license/[storyIpId]/route.ts`

```typescript
import { settlePayment, facilitator } from 'thirdweb/x402'
import { createThirdwebClient } from 'thirdweb'
import { avalancheFuji } from 'thirdweb/chains'
import { createWalletClient, http, parseAbi } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
})

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.SERVER_WALLET_ADDRESS!,
})

// Server wallet for cross-chain execution
const serverAccount = privateKeyToAccount(process.env.SERVER_PRIVATE_KEY as `0x${string}`)
const serverWallet = createWalletClient({
  account: serverAccount,
  chain: avalancheFuji,
  transport: http(process.env.AVALANCHE_RPC_URL),
})

const USDC_ADDRESS = '0x5425890298aed601595a70AB815c96711a31Bc65'
const USDC_WARP_ROUTER = '0x42E86212057aD345B164EeEAc2F410Ca96a68200'
const MAILBOX_ADDRESS = '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452'
const STORY_DOMAIN = 1315
const IPAY_RECEIVER = process.env.IPAY_RECEIVER_ADDRESS! // On Story

export async function POST(
  request: NextRequest,
  { params }: { params: { storyIpId: string } }
) {
  const { storyIpId } = params
  const body = await request.json()
  const { licenseTermsId, recipient } = body

  // 1. Get quote for this IP's minting fee
  const quote = await getIPQuote(storyIpId, licenseTermsId)
  const usdcAmount = quote.usdc

  // 2. Extract payment header
  const paymentData = request.headers.get('x-payment')
  const resourceUrl = `${process.env.API_BASE_URL}/api/ipay/license/${storyIpId}`

  // 3. Settle payment via x402
  const result = await settlePayment({
    resourceUrl,
    method: 'POST',
    paymentData,
    payTo: process.env.SERVER_WALLET_ADDRESS!, // Pay to server wallet
    network: avalancheFuji,
    price: {
      amount: usdcAmount.toString(),
      asset: { address: USDC_ADDRESS },
    },
    facilitator: thirdwebFacilitator,
  })

  if (result.status !== 200) {
    // Payment required or failed
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    })
  }

  // 4. Payment successful! Execute cross-chain
  try {
    const messageId = await executeCrossChainLicenseMint({
      storyIpId,
      licenseTermsId,
      usdcAmount,
      recipient: recipient || extractPayerAddress(paymentData),
    })

    // 5. Store in database for tracking
    await db.payments.create({
      messageId,
      storyIpId,
      licenseTermsId,
      usdcAmount,
      recipient,
      status: 'initiated',
      createdAt: new Date(),
    })

    return Response.json({
      success: true,
      messageId,
      estimatedDelivery: 120,
      payment: {
        usdcAmount: usdcAmount.toString(),
        wipAmount: (BigInt(usdcAmount) * BigInt(quote.exchangeRate)).toString(),
      },
      trackingUrl: `https://explorer.hyperlane.xyz/message/${messageId}`,
    })
  } catch (error) {
    // Cross-chain failed - ideally refund, but for now log error
    console.error('Cross-chain execution failed:', error)
    return Response.json({ error: 'Cross-chain execution failed' }, { status: 500 })
  }
}

async function executeCrossChainLicenseMint({
  storyIpId,
  licenseTermsId,
  usdcAmount,
  recipient,
}: {
  storyIpId: string
  licenseTermsId: number
  usdcAmount: bigint
  recipient: string
}): Promise<string> {
  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(process.env.AVALANCHE_RPC_URL),
  })

  // 1. Approve USDC to Warp Router
  const approveTx = await serverWallet.writeContract({
    address: USDC_ADDRESS,
    abi: parseAbi(['function approve(address spender, uint256 amount)']),
    functionName: 'approve',
    args: [USDC_WARP_ROUTER, usdcAmount],
  })
  await publicClient.waitForTransactionReceipt({ hash: approveTx })

  // 2. Get gas quote for both messages
  const warpFee = await publicClient.readContract({
    address: USDC_WARP_ROUTER,
    abi: parseAbi(['function quoteGasPayment(uint32 domain) view returns (uint256)']),
    functionName: 'quoteGasPayment',
    args: [STORY_DOMAIN],
  })

  const mailboxFee = await publicClient.readContract({
    address: MAILBOX_ADDRESS,
    abi: parseAbi(['function quoteDispatch(uint32 domain, bytes32 recipient, bytes message) view returns (uint256)']),
    functionName: 'quoteDispatch',
    args: [STORY_DOMAIN, addressToBytes32(IPAY_RECEIVER), '0x'],
  })

  // 3. Bridge USDC via Warp Route
  const warpTx = await serverWallet.writeContract({
    address: USDC_WARP_ROUTER,
    abi: parseAbi([
      'function transferRemote(uint32 destination, bytes32 recipient, uint256 amount) payable returns (bytes32)'
    ]),
    functionName: 'transferRemote',
    args: [STORY_DOMAIN, addressToBytes32(IPAY_RECEIVER), usdcAmount],
    value: warpFee,
  })
  const warpReceipt = await publicClient.waitForTransactionReceipt({ hash: warpTx })
  const warpMessageId = extractMessageIdFromLogs(warpReceipt.logs)

  // 4. Send payment instruction via Mailbox
  const OP_MINT_LICENSE = 1
  const payload = encodeAbiParameters(
    parseAbiParameters('bytes32, address, uint256, uint256, address'),
    [warpMessageId, storyIpId, BigInt(licenseTermsId), usdcAmount, recipient]
  )
  const message = encodePacked(['uint8', 'bytes'], [OP_MINT_LICENSE, payload])

  const mailboxTx = await serverWallet.writeContract({
    address: MAILBOX_ADDRESS,
    abi: parseAbi([
      'function dispatch(uint32 domain, bytes32 recipient, bytes message) payable returns (bytes32)'
    ]),
    functionName: 'dispatch',
    args: [STORY_DOMAIN, addressToBytes32(IPAY_RECEIVER), message],
    value: mailboxFee,
  })
  const mailboxReceipt = await publicClient.waitForTransactionReceipt({ hash: mailboxTx })
  const messageId = extractMessageIdFromLogs(mailboxReceipt.logs)

  return messageId
}
```

---

## Frontend Integration

### For Web Clients (with Wallet)

```typescript
// frontend/app/ipay/hooks/use-purchase-license.ts

import { wrapFetchWithPayment } from 'thirdweb/x402'
import { useThirdwebWallet } from '@/lib/web3'

export function usePurchaseLicense() {
  const wallet = useThirdwebWallet()

  const purchaseLicense = async (
    storyIpId: string,
    licenseTermsId: number,
    usdcAmount: bigint
  ) => {
    if (!wallet) throw new Error('Wallet not connected')

    // Create x402-wrapped fetch
    const fetchWithPay = wrapFetchWithPayment(
      fetch,
      thirdwebClient,
      wallet,
      { maxValue: usdcAmount }
    )

    // Make payment request
    const response = await fetchWithPay(`/api/ipay/license/${storyIpId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseTermsId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Payment failed')
    }

    return response.json()
  }

  return { purchaseLicense }
}
```

### For API/CLI Clients (Programmatic)

```typescript
// Example: Node.js script purchasing a license
import { createThirdwebClient, privateKeyToAccount } from 'thirdweb'
import { wrapFetchWithPayment } from 'thirdweb/x402'

const client = createThirdwebClient({ clientId: 'your-client-id' })
const account = privateKeyToAccount(process.env.PRIVATE_KEY)

async function purchaseLicense(storyIpId: string, licenseTermsId: number) {
  // Get quote first
  const quoteRes = await fetch(`https://ipay.app/api/ipay/quote/${storyIpId}?licenseTermsId=${licenseTermsId}`)
  const quote = await quoteRes.json()

  // Create payment-wrapped fetch
  const fetchWithPay = wrapFetchWithPayment(fetch, client, account, {
    maxValue: BigInt(quote.mintingFee.usdc)
  })

  // Execute purchase
  const response = await fetchWithPay(`https://ipay.app/api/ipay/license/${storyIpId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseTermsId }),
  })

  return response.json()
}
```

### For cURL (Manual Testing)

```bash
# 1. Get quote
curl https://ipay.app/api/ipay/quote/0x1234...?licenseTermsId=1

# 2. Generate payment header (requires wallet signature - use SDK)
# The X-PAYMENT header contains a base64-encoded signed payment intent

# 3. Execute purchase
curl -X POST https://ipay.app/api/ipay/license/0x1234... \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: <base64_signed_payment>" \
  -d '{"licenseTermsId": 1}'
```

---

## Database Schema (for tracking)

```sql
-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  story_ip_id TEXT NOT NULL,
  license_terms_id INTEGER NOT NULL,
  operation_type TEXT NOT NULL,  -- 'license' or 'derivative'
  usdc_amount NUMERIC NOT NULL,
  wip_amount NUMERIC,
  payer_address TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initiated',  -- initiated, delivered, processed, failed
  origin_tx_hash TEXT,
  destination_tx_hash TEXT,
  result_data JSONB,  -- { licenseTokenId, derivativeIpId, etc. }
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings table (optional, can query from subgraph)
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  story_ip_id TEXT UNIQUE NOT NULL,
  license_terms_id INTEGER NOT NULL,
  seller_address TEXT NOT NULL,
  metadata_uri TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Phases

### Phase 1: Smart Contract (2-3 days)
- [ ] `IPayReceiver.sol` on Story
- [ ] Unit tests with mock Hyperlane
- [ ] Deploy to Story Aeneid
- [ ] Seed WIP liquidity

### Phase 2: API Endpoints (2-3 days)
- [ ] `/api/ipay/quote/{ipId}` - Get pricing
- [ ] `/api/ipay/license/{ipId}` - Purchase license via x402
- [ ] `/api/ipay/derivative/{ipId}` - Create derivative via x402
- [ ] `/api/ipay/status/{messageId}` - Track cross-chain status

### Phase 3: Frontend Hooks (2 days)
- [ ] `usePurchaseLicense` - Web client integration
- [ ] `useCreateDerivative` - Derivative creation
- [ ] `useCrossChainStatus` - Status tracking

### Phase 4: UI Components (2-3 days)
- [ ] IP Detail dialog with purchase flow
- [ ] Cross-chain progress indicator
- [ ] Receipt/confirmation display
- [ ] My Purchases history

### Phase 5: Subgraph & Indexing (1-2 days)
- [ ] Index IPayReceiver events on Story
- [ ] Track payments and statuses

### Phase 6: Testing & Polish (2 days)
- [ ] E2E tests
- [ ] Error handling
- [ ] Rate limiting
- [ ] Documentation

---

## Key Technical Decisions

1. **x402 for All Payments** - Any HTTP client can pay
2. **Server Wallet Execution** - No client-side cross-chain complexity
3. **Single IPayReceiver Contract** - Handles both license minting and derivatives
4. **WIP Liquidity Pool** - Instant conversions without DEX
5. **Hyperlane for Cross-Chain** - Existing infrastructure
6. **No Gateway Contract** - Server wallet handles everything on Avalanche

---

## Benefits of x402 Approach

| Benefit | Description |
|---------|-------------|
| **Universal Access** | Any HTTP client can purchase (web, mobile, CLI, API) |
| **No Wallet UX** | Users don't need to understand blockchain |
| **Simple Integration** | Just add X-PAYMENT header to requests |
| **Atomic Payments** | Payment verified before execution |
| **Standard Protocol** | HTTP 402 Payment Required is a web standard |
| **Programmable** | Easy to build bots, scripts, integrations |

---

## Security Considerations

1. **Server Wallet Security**: Private key in secure env vars, consider HSM
2. **Rate Limiting**: Prevent spam attacks on API
3. **Payment Verification**: Always verify via settlePayment() before execution
4. **Trusted Sender**: IPayReceiver only accepts from known server wallet
5. **Amount Validation**: Server validates amounts match quotes
6. **Refund Mechanism**: Handle cross-chain failures gracefully

---

## Contract Addresses

| Contract | Chain | Address |
|----------|-------|---------|
| IPayReceiver | Story Aeneid (1315) | TBD |
| USDC | Avalanche Fuji | `0x5425890298aed601595a70AB815c96711a31Bc65` |
| USDC Warp Router | Avalanche Fuji | `0x42E86212057aD345B164EeEAc2F410Ca96a68200` |
| Mailbox | Avalanche Fuji | `0x60c3ca08D3df3F5fA583c535D9E44F3629F52452` |
| Mailbox | Story Aeneid | `0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d` |
| WIP Token | Story Aeneid | `0x1514000000000000000000000000000000000000` |
| Royalty Module | Story Aeneid | `0xD2f60c40fEbccf6311f8B47c4f2Ec6b040400086` |
