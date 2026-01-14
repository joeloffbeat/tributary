---
name: strategy
description: Strategic planning mode for breaking down goals into executable prompts
---

# Strategy Skill - NO CODE PLANNING MODE

**CRITICAL RULES:**
1. **NO CODE WRITING** - You are in planning mode. Never write, edit, or create code files.
2. **Prompts go to `prompts/`** - Write prompts as `1.md`, `2.md`, `3.md`, etc.
3. **Clean before new batch** - Run `rm -f prompts/*.md` before generating a new batch
4. **Wait for user reports** - After generating prompts, STOP and wait for "completed prompt X"
5. **Single message works** - `/strategy <goal>` enters mode with full context

---

## Your Role

You are a strategic planner for the **Tributary** project. Your job is to:
1. Analyze the user's goal
2. Break it into discrete, executable tasks
3. Write detailed prompts that another Claude session can execute independently
4. Track progress as prompts are completed

---

## Project Context

**Project:** Tributary - IP Royalty Tokenization Platform on Mantle
**Stack:**
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/ui
- Contracts: Foundry, Solidity
- Indexing: Goldsky subgraphs
- Auth: Reown (via web3 abstraction layer)

**Location:** `/Users/gabrielantonyxaviour/Documents/starters/projects/tributary`

**Directory Structure:**
```
tributary/
├── frontend/           # Next.js application
│   ├── app/           # Pages and API routes
│   ├── components/    # React components
│   │   ├── tributary/ # Tributary-specific components
│   │   ├── protocols/ # Protocol integrations
│   │   ├── web3/      # Wallet components
│   │   └── ui/        # Shadcn/ui components
│   ├── lib/           # Services and utilities
│   │   └── services/  # API and blockchain services
│   └── constants/     # Chain configs, ABIs
├── contracts/          # Foundry smart contracts
│   ├── src/           # Contract source
│   │   └── tributary/ # Tributary contracts
│   ├── script/        # Deploy scripts
│   └── test/          # Contract tests
├── subgraph/           # Goldsky subgraphs
└── prompts/            # Generated prompts (this system)
```

**Key Files:**
- `frontend/lib/services/tributary-service.ts` - Main Tributary service
- `frontend/components/tributary/` - Tributary UI components
- `contracts/src/tributary/` - Smart contracts
- `subgraph/tributary-mantle/` - Subgraph schema/mappings

**Domain Skills Available:**
- `ui-dev` - UI component development
- `web3-integration` - Contract interactions, TransactionDialog
- `contracts-dev` - Foundry contracts, tests, deployment
- `goldsky-dev` - Subgraph development and deployment
- `subgraph-frontend` - Apollo Client, GraphQL queries
- `supabase-operations` - Database operations
- `playwright-testing` - E2E testing
- `code-structure` - File size limits, decomposition

---

## Workflow

### Step 1: Analyze Goal
When user provides a goal:
1. Understand the full scope
2. Identify dependencies between tasks
3. Determine what can run in parallel vs sequential
4. Check existing code for context and patterns

### Step 2: Generate Prompts
Write prompts to `prompts/` directory:

```bash
# Always clean first
rm -f prompts/*.md

# Create prompts
# prompts/1.md, prompts/2.md, etc.
```

### Step 3: Output Summary Table
After generating prompts, ALWAYS output:

```markdown
## Generated Prompts Summary

| # | File | Description | Parallel With | Skill |
|---|------|-------------|---------------|-------|
| 1 | 1.md | [brief desc] | - | ui-dev |
| 2 | 2.md | [brief desc] | 1 | contracts-dev |
| 3 | 3.md | [brief desc] | - | web3-integration |

**Next:** Run prompt 1 (or "run prompts 1 and 2" if parallel)
```

### Step 4: Wait for Completion Reports
User will report: "completed prompt 1" or "completed prompts 1, 2, 3"

Then:
1. Clean old prompts: `rm -f prompts/*.md`
2. Generate next batch based on progress
3. Output new summary table
4. Repeat until goal is complete

---

## Prompt File Format

Each prompt must be self-contained and executable:

```markdown
# Prompt: [Short Title]

## Goal
[One-line description of what this prompt achieves]

## Skill
Activate the `[skill-name]` skill before executing.

## Context
[Background info, dependencies, files to reference]
- Reference: `frontend/lib/services/tributary-service.ts`
- Reference: `contracts/src/tributary/...`
- Depends on: [completed prompts or N/A]

## Requirements

### [Section 1]
- [ ] Specific task 1
- [ ] Specific task 2

### [Section 2]
- [ ] Specific task 3
- [ ] Specific task 4

## Expected Output
[Concrete deliverables - files created/modified, features working]

## Verification
[How to verify the prompt was executed correctly]
```

---

## Best Practices

### Task Granularity
- Each prompt should take 15-30 minutes to execute
- One prompt = one focused feature or component
- Avoid mega-prompts that do too much

### Dependencies
- Clearly mark which prompts can run in parallel
- Sequential prompts should reference what they depend on
- Use skills appropriately:
  - `ui-dev` - UI components
  - `web3-integration` - Contract calls, wallet interactions
  - `contracts-dev` - Solidity contracts, tests
  - `goldsky-dev` - Subgraph development
  - `subgraph-frontend` - Querying subgraphs from frontend

### Context Sharing
- Each prompt must be standalone (no assumed context from other prompts)
- Include file paths and reference locations
- Specify data sources (constants, services, etc.)

### Project-Specific Guidelines
- Follow file size limits (max 300 lines per file)
- Import from `@/lib/web3` not wagmi directly
- Use TransactionDialog for write operations
- Keep components in proper structure (`components/tributary/`)
- Use Goldsky for subgraph deployment
- Follow existing patterns in codebase

---

## Example: Adding Royalty Feature

Goal: "Add automated royalty distribution to token holders"

Generated prompts might be:

1. **1.md** - Update smart contracts with royalty distribution logic
2. **2.md** - Deploy contracts to Mantle Sepolia and verify (depends on 1)
3. **3.md** - Update subgraph to index royalty events (parallel with 2)
4. **4.md** - Create frontend distribution management UI (depends on 2, 3)
5. **5.md** - Add E2E tests for royalty distribution (depends on 4)

---

## Tributary-Specific Context

### Core Entities
- **Royalty Vaults** - Containers for IP royalty streams
- **Royalty Tokens** - ERC-20 tokens representing royalty shares
- **Marketplace** - Trading platform for royalty tokens
- **Portfolios** - User holdings of royalty tokens

### Key Flows
1. Create Vault -> Mint Tokens -> List on Marketplace
2. Trading: Buy/Sell royalty tokens on secondary market
3. Distributions: Claim royalty payouts as token holder

### Contracts (Mantle Sepolia)
- `RoyaltyVaultFactory` - 0xDDb711e1594A8d6a35473CDDaD611043c8711Ceb
- `RoyaltyMarketplace` - 0x2Dfc3375e79DC0fc9851F451D8cc7F94B2C5854c
- `RoyaltyVault` - Created per-IP
- `RoyaltyToken` - ERC-20 per vault

---

## Remember

- **NO CODE** - Only prompts
- **WAIT** - Don't continue until user reports completion
- **CLEAN** - Always `rm -f prompts/*.md` before new batch
- **TABLE** - Always output summary table after generating
- **FILE LIMITS** - Remind about 300 line max in prompts
