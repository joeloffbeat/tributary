---
name: goldsky-dev
description: Build and deploy subgraphs to Goldsky for high-performance blockchain indexing. Use when deploying subgraphs to Goldsky, using instant subgraphs, or setting up webhooks.
---

# Goldsky Development Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "graph-cli" })
   mcp__context7__resolve-library-id({ libraryName: "graph-ts" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/graphprotocol/graph-tooling",
     topic: "event handlers",
     mode: "code"
   })

3. NEVER guess Goldsky CLI or graph-ts APIs - verify with Context7 first
4. For Goldsky-specific features (tags, webhooks), check Goldsky docs
```

---

## When to Use This Skill

Load this skill when:
- Deploying subgraphs to Goldsky
- Creating instant (no-code) subgraphs
- Setting up webhooks for real-time notifications
- Using tagging for zero-downtime upgrades
- Migrating from TheGraph to Goldsky

## Why Goldsky?

| Feature | Goldsky | TheGraph |
|---------|---------|----------|
| Deployment | Instant | Requires sync time |
| Webhooks | Native | Not available |
| Tags | Built-in | Manual versioning |
| Multi-chain | Native | Per-network deploy |
| No-code option | Instant Subgraphs | Not available |

## Critical Rules

1. **Read deployment.config.json** - Get addresses and network info
2. **Copy ABIs from contracts/out/** - Never mock ABI data
3. **NO markdown/temp files** - Only code files
4. **Use tags for production** - Stable endpoints with zero-downtime
5. **Goldsky is TheGraph-compatible** - Same subgraph format

## Decision Tree

```
Deploying to Goldsky?
├─ Have existing subgraph code?
│   └─ Standard deploy: goldsky subgraph deploy --path .
├─ Want no-code solution?
│   └─ Instant subgraph: goldsky subgraph deploy --from-abi config.json
├─ Need production endpoint?
│   └─ Create tag: goldsky subgraph tag create --tag prod
└─ Need real-time updates?
    └─ Setup webhook: goldsky subgraph webhook create

Upgrading subgraph?
├─ Deploy new version
├─ Test new endpoint
├─ Move tag to new version
└─ Old version still available
```

## Common Tasks

### Standard Deployment

1. Build subgraph: `graph codegen && graph build`
2. Deploy: `goldsky subgraph deploy my-subgraph/1.0.0 --path .`
3. Create production tag: `goldsky subgraph tag create my-subgraph/1.0.0 --tag prod`

### Instant Subgraph (No-Code)

1. Create config.json with ABI path and contract addresses
2. Deploy: `goldsky subgraph deploy my-subgraph/1.0.0 --from-abi config.json`
3. All events automatically indexed

### Zero-Downtime Upgrade

1. Deploy new version: `goldsky subgraph deploy my-subgraph/2.0.0 --path .`
2. Test version endpoint
3. Move tag: `goldsky subgraph tag create my-subgraph/2.0.0 --tag prod`

## Two Deployment Methods

### Method 1: Standard Subgraph (Full Control)

Same format as TheGraph:

```bash
cd subgraphs/[name]
graph codegen
graph build
goldsky subgraph deploy my-subgraph/1.0.0 --path .
```

### Method 2: Instant Subgraph (No-Code)

Deploy directly from ABI - no mapping code needed:

```bash
goldsky subgraph deploy my-subgraph/1.0.0 --from-abi config.json
```

#### Instant Config (config.json)

```json
{
  "version": "1",
  "name": "token-tracker",
  "abis": {
    "Token": {
      "path": "./abis/Token.json"
    }
  },
  "instances": [
    {
      "abi": "Token",
      "address": "0x...",
      "startBlock": 12345678,
      "chain": "sepolia"
    }
  ]
}
```

## Endpoint URLs

```
# Version-specific (changes each deploy)
https://api.goldsky.com/api/public/<PROJECT>/subgraphs/<NAME>/<VERSION>/gn

# Tag-based (stable, recommended)
https://api.goldsky.com/api/public/<PROJECT>/subgraphs/<NAME>/prod/gn
```

## Anti-Patterns (NEVER DO)

```bash
# NEVER use version endpoint in production
https://api.goldsky.com/.../my-subgraph/1.0.0/gn

# Use tag endpoint
https://api.goldsky.com/.../my-subgraph/prod/gn

# NEVER deploy without testing
goldsky subgraph deploy my-subgraph/1.0.0 --path . --tag prod

# Test before tagging
goldsky subgraph deploy my-subgraph/1.0.0 --path .
# Test the version endpoint
goldsky subgraph tag create my-subgraph/1.0.0 --tag prod
```

## CLI Commands

```bash
# Authentication
goldsky login

# Deploy
goldsky subgraph deploy <name>/<version> --path .
goldsky subgraph deploy <name>/<version> --from-abi config.json

# List
goldsky subgraph list

# Logs
goldsky subgraph log <name>/<version>

# Tags
goldsky subgraph tag create <name>/<version> --tag prod
goldsky subgraph tag list <name>

# Webhooks
goldsky subgraph webhook create <name>/<version> --name webhook --entity Transfer --url https://...
```

## Related Skills

- **contracts-dev** - For deploying contracts to index
- **subgraph-frontend** - For querying Goldsky endpoints
- **thegraph-dev** - Same subgraph format

## Quick Reference

| Task | Command |
|------|---------|
| Login | `goldsky login` |
| Deploy | `goldsky subgraph deploy <name>/<ver> --path .` |
| Instant deploy | `goldsky subgraph deploy <name>/<ver> --from-abi config.json` |
| Create tag | `goldsky subgraph tag create <name>/<ver> --tag prod` |
| View logs | `goldsky subgraph log <name>/<ver>` |
| List | `goldsky subgraph list` |
| Delete | `goldsky subgraph delete <name>/<ver>` |

See `reference.md` for detailed CLI reference.
