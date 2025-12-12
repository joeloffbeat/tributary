# IPay Implementation Plan

**Pay-Per-Use IP Licensing Platform** - Story Protocol + x402 + Subgraph

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| Data Storage | Full On-Chain + Subgraph |
| Networks | Story Aeneid (1315) + Avalanche Fuji (43113) |
| Payment Model | Direct to Creator (100%) |
| Asset Delivery | IPFS Public |

---

## Task Execution Strategy

Tasks are organized into **Sessions** that can run in parallel or sequentially.

```
[S0] Restructure → [S1] Contracts ──┐
                                    ├──→ [S4] Frontend Pages
[S2] Types/Constants ───────────────┤
                                    │
[S3] Subgraph ──────────────────────┘

[S5] API Routes → [S6] Payment Integration → [S7] Polish
```

**Parallel Groups:**
- Group A: S0 (Restructure) - Must run FIRST
- Group B: S1, S2, S3 can run in PARALLEL after S0
- Group C: S4, S5 can run after Group B
- Group D: S6, S7 sequential after Group C

---

## Session Prompts

### SESSION 0: Restructure - Move Pages to /playground [MUST RUN FIRST]

```
I need you to restructure the frontend routes. Move all existing pages under /playground:

1. Create `frontend/app/playground/` directory
2. Move these directories INTO playground:
   - frontend/app/protocols/ → frontend/app/playground/protocols/
   - frontend/app/crosschain/ → frontend/app/playground/crosschain/
   - frontend/app/indexer/ → frontend/app/playground/indexer/
   - frontend/app/db/ → frontend/app/playground/db/
   - frontend/app/x402/ → frontend/app/playground/x402/
   - frontend/app/ui/ → frontend/app/playground/ui/

3. Create `frontend/app/playground/page.tsx` - a simple index page that links to all playground sections (copy the current home page grid style)

4. Update `frontend/app/page.tsx` to be a placeholder for IPay (just show "IPay - Coming Soon" with ConnectButton)

5. Update any imports in moved files if needed (check for relative imports)

6. Verify the app still builds: `cd frontend && npm run build`

DO NOT delete anything. Just move directories.
```

---

### SESSION 1: Smart Contracts [Can run parallel with S2, S3]

```
I need you to create the IPayRegistry smart contract for the IPay project. This will be deployed on Avalanche Fuji.

Read the IPay idea from `ideas/ipay.md` first.

Create these files:

1. `contracts/src/IPayRegistry.sol` - Main registry contract with:
   - Struct: Listing (storyIPId, creator, pricePerUse, metadataUri, assetIpfsHash, totalUses, totalRevenue, active, createdAt)
   - Struct: UsageRecord (listingId, user, amount, timestamp)
   - Mappings for listings and usageRecords
   - Events: ListingCreated, IPUsed, ListingUpdated, ListingDeactivated
   - Functions: createListing, recordUsage, updatePrice, deactivateListing, getCreatorListings, getUserUsages, verifyReceipt
   - Only owner can call recordUsage (backend calls after x402 payment verification)

2. `contracts/test/IPayRegistry.t.sol` - Foundry tests covering all functions

3. `contracts/script/DeployIPayRegistry.s.sol` - Deployment script

Use the existing Foundry setup. Check `contracts/` for patterns.

After creating, run: `cd contracts && forge build && forge test`
```

---

### SESSION 2: Types and Constants [Can run parallel with S1, S3]

```
I need you to create the TypeScript types and constants for IPay. Follow the exact patterns used in the codebase.

Reference these existing files for patterns:
- `frontend/app/crosschain/hyperlane/types.ts`
- `frontend/app/crosschain/hyperlane/constants.ts`
- `frontend/constants/protocols/story/index.ts`

Create these files:

1. `frontend/app/ipay/types.ts` (< 100 lines):
   - IPListing interface (id, storyIPId, creator, title, description, imageUrl, category, pricePerUse, assetIpfsHash, metadataUri, totalUses, totalRevenue, isActive, createdAt)
   - IPCategory type ('images' | 'music' | 'code' | 'data' | 'templates' | 'other')
   - UsageReceipt interface (id, listingId, user, amount, paymentTxHash, timestamp)
   - CreateListingParams interface
   - MarketplaceFilters interface
   - CreatorAnalytics interface

2. `frontend/app/ipay/constants.ts` (< 150 lines):
   - IPAY_CHAINS (STORY_AENEID: 1315, AVALANCHE_FUJI: 43113)
   - IPAY_REGISTRY_ADDRESS (placeholder: '0x...')
   - USDC_FUJI_ADDRESS ('0x5425890298aed601595a70AB815c96711a31Bc65')
   - MIN_PRICE_USDC, MAX_PRICE_USDC
   - IP_CATEGORIES array with labels and icons
   - IPAY_REGISTRY_ABI (createListing, recordUsage, listings, etc.)

Ensure types use Address from viem. Keep files under line limits.
```

---

### SESSION 3: Subgraph [Can run parallel with S1, S2]

```
I need you to create a subgraph for IPay to index the IPayRegistry contract on Avalanche Fuji.

Reference the existing subgraph setup in `subgraph/` directory.

Create/update these files:

1. `subgraph/ipay/schema.graphql`:
   - Listing entity (id, storyIPId, creator, pricePerUse, metadataUri, assetIpfsHash, totalUses, totalRevenue, active, createdAt, usages)
   - Usage entity (id, listing, user, amount, timestamp, txHash)
   - Creator entity (id, totalListings, totalRevenue, totalUses)
   - User entity (id, totalSpent, usageCount)

2. `subgraph/ipay/subgraph.yaml`:
   - Network: avalanche-fuji (or fuji)
   - DataSource: IPayRegistry
   - Events: ListingCreated, IPUsed, ListingUpdated, ListingDeactivated

3. `subgraph/ipay/src/ipay-registry.ts`:
   - handleListingCreated - create Listing entity, update Creator
   - handleIPUsed - create Usage entity, update Listing stats, update User
   - handleListingUpdated - update price
   - handleListingDeactivated - set active=false

4. `subgraph/ipay/abis/IPayRegistry.json` - ABI file

Follow the existing subgraph patterns. The contract address will be added after deployment.
```

---

### SESSION 4: Frontend Foundation [After S0, S2]

```
I need you to create the IPay frontend foundation. Follow the EXACT patterns from the codebase.

IMPORTANT: Read these reference files first:
- `frontend/app/protocols/story/page.tsx` (73 lines - orchestration pattern)
- `frontend/app/crosschain/hyperlane/page.tsx` (180 lines - tab pattern)
- `frontend/components/protocols/story/tabs/` (tab component pattern)

Create these files:

1. `frontend/app/ipay/page.tsx` (< 150 lines):
   - Import from @/lib/web3 (useAccount, ConnectButton)
   - Tabs: Marketplace, My Listings, My Purchases
   - Show ConnectButton if not connected
   - Import tab components (to be created)

2. `frontend/app/ipay/components/marketplace-tab.tsx` (< 250 lines):
   - Grid of IP listings (use HoverEffect from @/components/ui/hover-effect)
   - Category filter
   - Search bar
   - Loading skeleton
   - For now, use mock data array

3. `frontend/app/ipay/components/shared/ip-asset-card.tsx` (< 150 lines):
   - Card showing: image, title, creator, price, usage count
   - "View" and "Pay & Use" buttons
   - Use shadcn Card component

4. `frontend/app/ipay/components/shared/price-display.tsx` (< 100 lines):
   - Format USDC price (bigint to human readable)
   - Show $ symbol

5. `frontend/app/ipay/components/shared/category-filter.tsx` (< 100 lines):
   - Dropdown to filter by category
   - Use shadcn Select

6. `frontend/app/ipay/components/index.ts` - Re-exports

Use existing UI components from @/components/ui/. Follow dark theme patterns.
```

---

### SESSION 5: API Routes and Service [After S2]

```
I need you to create the IPay API routes and service layer.

Reference these existing files:
- `frontend/app/api/x402/avalanche/basic/route.ts` (x402 pattern)
- `frontend/lib/services/story-service.ts` (service pattern)
- `frontend/lib/services/hyperlane-service.ts` (service pattern)

Create these files:

1. `frontend/lib/services/ipay-service.ts` (< 300 lines):
   - Class IPayService with methods:
     - getListings(filters): Promise<IPListing[]> - query subgraph
     - getListingById(id): Promise<IPListing | null>
     - getListingsByCreator(address): Promise<IPListing[]>
     - getReceiptsByUser(address): Promise<UsageReceipt[]>
     - getCreatorAnalytics(address): Promise<CreatorAnalytics>
   - Export singleton: export const ipayService = new IPayService()
   - Use Apollo Client for subgraph queries (see how hyperlane uses it)

2. `frontend/app/api/ipay/pay/[listingId]/route.ts`:
   - GET handler with x-payment header
   - Use settlePayment from thirdweb/x402
   - Pay directly to listing.creator
   - Return { success, assetUrl, receiptId }
   - Reference the x402 avalanche route for pattern

3. `frontend/app/api/ipay/listings/route.ts`:
   - GET: Fetch listings from subgraph (proxy for client)

Import types from @/app/ipay/types. Use existing x402 patterns.
```

---

### SESSION 6: Hooks and Payment Integration [After S4, S5]

```
I need you to create the IPay hooks for business logic.

Reference these existing hooks:
- `frontend/app/crosschain/hyperlane/hooks/use-hyperlane-bridge.ts`
- `frontend/hooks/protocols/story/use-story-client.ts`

Create these files in `frontend/app/ipay/hooks/`:

1. `use-ipay-marketplace.ts` (< 200 lines):
   - Fetch listings using ipayService
   - Filter by category, price range, search
   - Return { listings, isLoading, error, filters, setFilters }

2. `use-ipay-listing.ts` (< 200 lines):
   - Fetch user's Story IP assets (use storyService.fetchUserIPAssets)
   - createListing function using walletClient.writeContract
   - Upload metadata to IPFS
   - Return { storyAssets, createListing, isCreating }

3. `use-ipay-payment.ts` (< 200 lines):
   - Import from @/lib/web3 (useThirdwebWallet, thirdwebClient)
   - Import wrapFetchWithPayment, createNormalizedFetch from x402 utils
   - payForIP(listing) function
   - Return { payForIP, isPaying, receipt, error }

4. `use-ipay-receipts.ts` (< 200 lines):
   - Fetch user's receipts from subgraph
   - Return { receipts, isLoading }

5. `index.ts` - Re-exports

All hooks must import from @/lib/web3, NOT from wagmi or thirdweb directly.
```

---

### SESSION 7: Create Listing Flow [After S6]

```
I need you to build the Create Listing wizard for IPay.

Reference: `frontend/components/protocols/story/tabs/register-ip-tab.tsx`

Create these files in `frontend/app/ipay/`:

1. `create/page.tsx` (< 150 lines):
   - Step wizard (1. Select IP, 2. Set Pricing, 3. Review)
   - Use useState for currentStep
   - Import step components

2. `components/create-listing/step-select-ip.tsx` (< 200 lines):
   - Use useIPPayListing hook to get storyAssets
   - Grid of user's Story IP assets
   - Click to select
   - "Next" button when selected

3. `components/create-listing/step-set-pricing.tsx` (< 200 lines):
   - Input for price (USDC)
   - Category dropdown
   - Asset IPFS hash input (or file upload)
   - Validate min/max price
   - "Next" button

4. `components/create-listing/step-review.tsx` (< 200 lines):
   - Show selected IP details
   - Show pricing
   - "Create Listing" button
   - Use TransactionDialog for the transaction
   - On success, redirect to marketplace

5. `components/create-listing/index.ts` - Re-exports

Follow the Story Protocol tab patterns. Use shadcn components.
```

---

### SESSION 8: Dashboard and Asset Detail [After S6]

```
I need you to build the creator dashboard and asset detail pages.

Create these files:

1. `frontend/app/ipay/dashboard/page.tsx` (< 150 lines):
   - Show creator stats (total revenue, total uses, active listings)
   - List of creator's listings with stats
   - Recent payments received
   - Use useIPPayAnalytics hook (create if not exists)

2. `frontend/app/ipay/asset/[ipId]/page.tsx` (< 150 lines):
   - Fetch listing by ID
   - Show asset details
   - Pricing card with Pay & Use
   - Usage history

3. `frontend/app/ipay/components/asset-detail/asset-header.tsx` (< 150 lines):
   - Large image
   - Title, description
   - Creator address with link
   - Category badge

4. `frontend/app/ipay/components/asset-detail/pricing-card.tsx` (< 150 lines):
   - Price display
   - "Pay & Use" button
   - Use useIPPayPayment hook
   - Show loading during payment

5. `frontend/app/ipay/components/asset-detail/usage-history.tsx` (< 150 lines):
   - Table of recent usages
   - User address, amount, timestamp

6. `frontend/app/ipay/components/shared/receipt-modal.tsx` (< 200 lines):
   - Dialog showing receipt details
   - IPFS asset URL
   - Transaction hash
   - Copy buttons

Follow existing component patterns. Dark theme.
```

---

### SESSION 9: Polish and Testing [FINAL]

```
I need you to polish the IPay implementation and ensure everything works.

Tasks:

1. Update navbar to include IPay link:
   - Edit `frontend/components/layout/navbar.tsx`
   - Add IPay to main navigation

2. Add loading states and error handling:
   - Review all pages for loading skeletons
   - Add toast notifications for errors
   - Add success toasts for transactions

3. Mobile responsiveness:
   - Check all components on mobile
   - Use responsive grid classes

4. Integration testing:
   - Test full flow: Register IP on Story → Create Listing → Pay & Use
   - Verify subgraph is indexing correctly
   - Verify x402 payments work

5. Update `frontend/app/ipay/page.tsx`:
   - Remove mock data
   - Connect to real hooks and service

6. Build verification:
   - Run `cd frontend && npm run build`
   - Fix any TypeScript errors
   - Fix any lint errors

Document any issues found.
```

---

## File Structure Summary

```
frontend/
├── app/
│   ├── page.tsx                      # IPay home (after restructure)
│   ├── playground/                   # Moved existing pages
│   │   ├── page.tsx                  # Playground index
│   │   ├── protocols/
│   │   ├── crosschain/
│   │   ├── indexer/
│   │   ├── db/
│   │   ├── x402/
│   │   └── ui/
│   ├── ipay/
│   │   ├── page.tsx                  # Marketplace tabs
│   │   ├── create/page.tsx           # Create listing wizard
│   │   ├── dashboard/page.tsx        # Creator dashboard
│   │   ├── asset/[ipId]/page.tsx     # Asset detail
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── components/
│   │   │   ├── marketplace-tab.tsx
│   │   │   ├── my-listings-tab.tsx
│   │   │   ├── my-purchases-tab.tsx
│   │   │   ├── create-listing/
│   │   │   ├── asset-detail/
│   │   │   └── shared/
│   │   └── hooks/
│   │       ├── use-ipay-marketplace.ts
│   │       ├── use-ipay-listing.ts
│   │       ├── use-ipay-payment.ts
│   │       └── use-ipay-receipts.ts
│   └── api/ipay/
│       ├── pay/[listingId]/route.ts
│       └── listings/route.ts
├── lib/services/
│   └── ipay-service.ts
│
contracts/
├── src/IPayRegistry.sol
├── test/IPayRegistry.t.sol
└── script/DeployIPayRegistry.s.sol

subgraph/ipay/
├── schema.graphql
├── subgraph.yaml
└── src/ipay-registry.ts
```

---

## Execution Order

| Order | Session | Dependencies | Can Parallel With |
|-------|---------|--------------|-------------------|
| 1 | S0: Restructure | None | None (must be first) |
| 2 | S1: Contracts | S0 | S2, S3 |
| 2 | S2: Types/Constants | S0 | S1, S3 |
| 2 | S3: Subgraph | S0 | S1, S2 |
| 3 | S4: Frontend Foundation | S0, S2 | S5 |
| 3 | S5: API/Service | S2 | S4 |
| 4 | S6: Hooks | S4, S5 | None |
| 5 | S7: Create Listing | S6 | S8 |
| 5 | S8: Dashboard/Detail | S6 | S7 |
| 6 | S9: Polish | S7, S8 | None |

---

## Notes

- All prompts reference actual files in the codebase for patterns
- Each session is self-contained and can run in a fresh Claude Code session
- File size limits are enforced in all prompts
- Web3 abstraction layer usage is mandated
- No timeline estimates - just task ordering
