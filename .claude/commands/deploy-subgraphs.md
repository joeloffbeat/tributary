---
description: Deploy subgraphs and sync endpoints to frontend
---

# Subgraph Deployment (Goldsky)

**SOURCE OF TRUTH:** `contracts/deployment.config.json`

## Prerequisites

- Load `goldsky-dev` skill
- Read `contracts/deployment.config.json` for contract addresses
- Ensure subgraph exists in `subgraph/` directory

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Graph CLI: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "graph deploy" })`
- Graph codegen: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "graph codegen" })`

## Goldsky: Direct Deploy

Deploy immediately (no setup phase required).

```bash
cd subgraph
graph codegen && graph build
goldsky subgraph deploy <name>/<version> --path .
goldsky subgraph tag create <name>/<version> --tag prod
```

---

## Success Checklist

Before marking this task complete, verify:

- [ ] Subgraph manifest (`subgraph.yaml`) has correct contract addresses
- [ ] Subgraph builds successfully: `graph codegen && graph build`
- [ ] Subgraph deployed to Goldsky
- [ ] Subgraph is syncing (check Goldsky dashboard for sync status)
- [ ] Frontend endpoint updated in `frontend/constants/subgraphs/{chainId}/`
- [ ] Test query returns expected data

**Run this to confirm:**
```bash
cd subgraph
graph codegen && graph build && echo "Build passed"
goldsky subgraph list | grep {name}
```

---

## If This Fails

### Error: "graph: command not found"
**Cause:** Graph CLI not installed globally.
**Fix:**
```bash
npm install -g @graphprotocol/graph-cli
```

### Error: "Failed to compile data source mapping"
**Cause:** AssemblyScript type errors in mapping handlers.
**Fix:**
1. Check event parameter types match ABI
2. Verify entity field types match schema
3. Run `graph codegen` to regenerate types

### Error: "ABI not found"
**Cause:** ABI file missing or wrong path in `subgraph.yaml`.
**Fix:**
1. Copy ABI from contracts: `cp contracts/out/{Contract}.sol/{Contract}.json subgraph/abis/`
2. Update `abis` section in `subgraph.yaml`

### Error: "Authentication failed" (Goldsky)
**Cause:** API key not set.
**Fix:**
1. Get API key from Goldsky dashboard
2. Run: `goldsky login`

### Error: "Start block is ahead of chain head"
**Cause:** `startBlock` in manifest is in the future.
**Fix:**
1. Get deployment block: `cat contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json | jq '.transactions[0].receipt.blockNumber'`
2. Update `startBlock` in `subgraph.yaml`

### Error: Query returns empty after deploy
**Cause:** Subgraph not synced or wrong address.
**Fix:**
1. Check sync status on Goldsky dashboard
2. Verify `address` in `subgraph.yaml` matches deployed contract
3. Verify `startBlock` is at or before first event
4. Wait for sync to complete

### General Debugging

1. Run `graph codegen` first to catch type errors early
2. Check Goldsky logs for runtime errors: `goldsky subgraph log <name>/<version>`
3. Verify contract addresses match deployment
4. Test queries in Goldsky's GraphQL playground
5. If stuck, delete and redeploy subgraph
