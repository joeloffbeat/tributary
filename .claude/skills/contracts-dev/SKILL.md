---
name: contracts-dev
description: Foundry smart contract development, testing, and deployment. Use when writing Solidity, running tests, deploying contracts, or verifying on explorers.
---

# Contract Development Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "foundry" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/foundry-rs/foundry",
     topic: "forge test",
     mode: "code"
   })

3. NEVER guess Foundry commands or cheatcodes - verify with Context7 first
4. If Context7 doesn't have the library, state this and ask user for docs
```

---

## When to Use This Skill

Load this skill when:
- Writing new Solidity contracts
- Writing or running Foundry tests
- Deploying contracts to any network
- Verifying contracts on block explorers
- Syncing deployments to frontend

## Critical Rules

1. **`deployment.config.json` is the ONLY source of truth** - All addresses, network configs, and deployment info
2. **NO markdown/temp/doc files** - Only code files
3. **NO partial deployments** - Complete or fail, never leave half-done state
4. **HALT on errors** - Never continue with broken state
5. **Always sync after deploy** - Update deployment.config.json and copy ABIs to frontend

## Decision Tree

```
Need to write a contract?
├─ Check existing contracts in src/ first
├─ Follow naming: PascalCase.sol
└─ Add to deployment.config.json contracts list

Need to write tests?
├─ Unit tests → test/unit/ContractName.t.sol
├─ Fork tests → test/fork/ContractName.fork.t.sol
└─ Use test naming: test_Feature_When_Should()

Need to deploy?
├─ Run tests first → forge test -vv
├─ Deploy → forge script script/Deploy.s.sol --rpc-url $RPC --broadcast
├─ Update deployment.config.json with addresses
├─ Verify on explorer
└─ Sync ABIs to frontend

Need to verify?
├─ Use blockscout verifier (most reliable)
├─ DON'T pass --constructor-args (auto-detected)
└─ Update verified: true in deployment.config.json
```

## Common Tasks

### Writing a New Contract

1. Look up Solidity patterns via Context7 if needed
2. Create file at `contracts/src/ContractName.sol`
3. Add to `deployment.config.json` contracts section
4. Write tests before deployment

### Running Tests

1. Look up forge test options via Context7
2. Run: `cd contracts && source .env && forge test -vv`
3. For specific test: `forge test --match-test test_Name -vvv`
4. For fork test: `forge test --fork-url $RPC_URL`

### Deploying a Contract

1. Ensure tests pass first
2. Run deploy script: `forge script script/Deploy.s.sol:DeployScript --rpc-url "$RPC_URL" --broadcast -vvv`
3. Update `deployment.config.json` with deployed address
4. Verify on block explorer
5. Sync ABIs to frontend

### Verifying a Contract

1. Use blockscout (most reliable):
   ```bash
   forge verify-contract <ADDRESS> src/Contract.sol:Contract \
     --chain-id <CHAIN_ID> \
     --verifier blockscout \
     --verifier-url "<BLOCKSCOUT_API_URL>" \
     --watch
   ```
2. DO NOT pass `--constructor-args` - auto-detected
3. Update `verified: true` in deployment.config.json

## Project Structure

```
contracts/
├── deployment.config.json    # SINGLE SOURCE OF TRUTH
├── src/                      # Contract source files
├── test/
│   ├── unit/                 # Unit tests
│   └── fork/                 # Fork tests
├── script/
│   └── Deploy.s.sol          # Deployment script
├── out/                      # Compiled ABIs (after build)
├── broadcast/                # Forge deployment logs
├── foundry.toml             # Foundry config
└── .env                      # NEVER commit
```

## Anti-Patterns (NEVER DO)

```solidity
// NEVER use magic numbers
uint256 fee = 250; // What is this?

// Use named constants
uint256 public constant FEE_BASIS_POINTS = 250; // 2.5%

// NEVER skip access control
function withdraw() external {
    // Anyone can call!
}

// Add proper access control
function withdraw() external onlyOwner {
    // Only owner
}

// NEVER trust user input
function transfer(address to, uint256 amount) external {
    balances[msg.sender] -= amount; // Can underflow!
}

// Validate inputs
function transfer(address to, uint256 amount) external {
    require(to != address(0), "Invalid recipient");
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
}
```

## Environment Setup

```bash
cd contracts
source .env  # ALWAYS do this first before any forge command
```

**Required in .env:**
```
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
ARBITRUM_SEPOLIA_RPC_URL=https://...
```

## Test Naming Convention

| Pattern | Example | Use Case |
|---------|---------|----------|
| `test_Feature_When_Should` | `test_Transfer_WhenSufficientBalance_ShouldUpdateBalances` | Happy path |
| `testRevert_Feature_When` | `testRevert_Transfer_WhenInsufficientBalance` | Expected revert |
| `testFuzz_Feature` | `testFuzz_Transfer_Amount` | Fuzz testing |
| `testFork_Feature` | `testFork_SwapOnUniswap` | Fork testing |

## Related Skills

- **web3-integration** - After deployment, use contracts from frontend
- **goldsky-dev** - Index contract events

## Quick Reference

| Task | Command |
|------|---------|
| Build | `forge build` |
| Test | `forge test -vv` |
| Test specific | `forge test --match-test test_Name -vvv` |
| Fork test | `forge test --fork-url $RPC_URL` |
| Coverage | `forge coverage` |
| Deploy | `forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC --broadcast -vvv` |
| Verify | `forge verify-contract <addr> src/C.sol:C --chain-id <id> --verifier blockscout --verifier-url <api> --watch` |
| Read | `cast call <addr> "fn()" --rpc-url $RPC` |
| Write | `cast send <addr> "fn(args)" --rpc-url $RPC --private-key $KEY` |
| Gas snapshot | `forge snapshot` |

See `reference.md` for detailed patterns and `examples.md` for common contract patterns.
