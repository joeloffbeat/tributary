# Contract Development Reference

## When to Use What

| Need | Use This | Not This | Why |
|------|----------|----------|-----|
| Unit test | `test/unit/*.t.sol` | Inline tests | Organization |
| Fork test | `test/fork/*.fork.t.sol` | Mock contracts | Real state testing |
| Test reverts | `vm.expectRevert()` | try/catch | Cleaner assertions |
| Test events | `vm.expectEmit()` | Manual log check | Built-in support |
| Deploy script | `forge script` | Direct deploy | Reproducible, logged |
| Verify contract | `--verifier blockscout` | `--verifier etherscan` | More reliable |
| Read contract | `cast call` | Hardhat console | Faster, no setup |
| Write contract | `cast send` | Hardhat console | Direct, scriptable |
| Access control | OpenZeppelin `Ownable` | Custom modifier | Battle-tested |
| Reentrancy guard | OpenZeppelin `ReentrancyGuard` | Custom lock | Battle-tested |

---

## deployment.config.json Structure

```json
{
  "contracts": {
    "Token": {
      "path": "src/Token.sol",
      "description": "ERC20 Token with minting"
    },
    "Staking": {
      "path": "src/Staking.sol",
      "description": "Token staking pool"
    }
  },
  "chains": {
    "sepolia": {
      "chainId": 11155111,
      "name": "Sepolia",
      "rpcEnvVar": "SEPOLIA_RPC_URL",
      "explorer": {
        "name": "Blockscout",
        "url": "https://eth-sepolia.blockscout.com",
        "apiUrl": "https://eth-sepolia.blockscout.com/api/",
        "verifier": "blockscout"
      },
      "nativeCurrency": {
        "name": "Ethereum",
        "symbol": "ETH",
        "decimals": 18
      }
    }
  },
  "steps": [
    {
      "action": "deploy",
      "contract": "Token",
      "args": ["MyToken", "MTK", 18]
    },
    {
      "action": "deploy",
      "contract": "Staking",
      "args": ["$Token"]
    }
  ],
  "deployments": {
    "sepolia": {
      "Token": {
        "address": "0x...",
        "verified": true
      },
      "Staking": {
        "address": "0x...",
        "verified": false
      }
    }
  },
  "sync": {
    "frontend": {
      "abis": "frontend/constants/contracts/{chainId}/abis/",
      "addresses": "frontend/constants/contracts/{chainId}/contracts.ts"
    }
  }
}
```

## Foundry Configuration

### foundry.toml

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.24"
evm_version = "cancun"
optimizer = true
optimizer_runs = 200
via_ir = true

[profile.default.fuzz]
runs = 256
max_test_rejects = 65536

[profile.ci]
fuzz = { runs = 10000 }

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC_URL}"
arbitrum_sepolia = "${ARBITRUM_SEPOLIA_RPC_URL}"
```

## Common Imports

```solidity
// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// Forge testing
import "forge-std/Test.sol";
import "forge-std/console.sol";
import "forge-std/Script.sol";
```

## Test Utilities

### Base Test Setup

```solidity
// test/Base.t.sol
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

abstract contract BaseTest is Test {
    address public owner = makeAddr("owner");
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    uint256 public constant INITIAL_BALANCE = 1000 ether;

    function setUp() public virtual {
        vm.deal(owner, INITIAL_BALANCE);
        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
    }

    modifier asOwner() {
        vm.startPrank(owner);
        _;
        vm.stopPrank();
    }

    modifier asUser(address user) {
        vm.startPrank(user);
        _;
        vm.stopPrank();
    }
}
```

### Common Cheatcodes

| Cheatcode | Usage | Description |
|-----------|-------|-------------|
| `vm.prank(addr)` | Single call as addr | Spoof msg.sender |
| `vm.startPrank(addr)` | Multiple calls | Start spoofing |
| `vm.stopPrank()` | End spoofing | Stop spoofing |
| `vm.deal(addr, amt)` | Set ETH balance | Fund account |
| `vm.warp(ts)` | Set block.timestamp | Time travel |
| `vm.roll(n)` | Set block.number | Block travel |
| `vm.expectRevert()` | Expect next call reverts | Test reverts |
| `vm.expectRevert(bytes4)` | Expect specific error | Test error selector |
| `vm.expectEmit()` | Expect event | Test events |
| `makeAddr(name)` | Create labeled address | Test accounts |
| `vm.label(addr, name)` | Label address | Debug traces |

### Event Testing

```solidity
function test_Transfer_EmitsEvent() public {
    // Check all indexed params + data
    vm.expectEmit(true, true, false, true);
    emit Transfer(user1, user2, 100);

    vm.prank(user1);
    token.transfer(user2, 100);
}
```

### Fork Testing

```solidity
function testFork_SwapOnUniswap() public {
    // Create fork
    uint256 forkId = vm.createFork(vm.envString("MAINNET_RPC_URL"));
    vm.selectFork(forkId);

    // Roll to specific block
    vm.rollFork(18_000_000);

    // Impersonate whale
    address whale = 0x...;
    vm.prank(whale);

    // Execute swap...
}
```

## Deployment Script Pattern

```solidity
// script/Deploy.s.sol
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/Staking.sol";

contract DeployScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Token
        Token token = new Token("MyToken", "MTK", 18);
        console.log("Token deployed:", address(token));

        // Deploy Staking with Token address
        Staking staking = new Staking(address(token));
        console.log("Staking deployed:", address(staking));

        // Post-deployment setup
        token.setStakingContract(address(staking));

        vm.stopBroadcast();
    }
}
```

## Gas Optimization Patterns

### Storage Packing

```solidity
// ❌ Bad - 3 storage slots
struct BadStruct {
    uint256 a;  // slot 0
    uint8 b;    // slot 1
    uint256 c;  // slot 2
}

// ✅ Good - 2 storage slots
struct GoodStruct {
    uint256 a;  // slot 0
    uint256 c;  // slot 1
    uint8 b;    // slot 1 (packed)
}
```

### Caching Storage

```solidity
// ❌ Bad - multiple SLOADs
function bad() external {
    balances[msg.sender] -= 100;
    balances[msg.sender] += 50;
    require(balances[msg.sender] > 0);
}

// ✅ Good - cache in memory
function good() external {
    uint256 balance = balances[msg.sender];
    balance = balance - 100 + 50;
    require(balance > 0);
    balances[msg.sender] = balance;
}
```

### Unchecked Math

```solidity
// When overflow is impossible
function increment(uint256 i) internal pure returns (uint256) {
    unchecked {
        return i + 1;
    }
}
```

## Security Checklist

| Check | What to Look For |
|-------|------------------|
| Reentrancy | External calls before state changes |
| Access Control | Missing onlyOwner/role checks |
| Integer Overflow | Pre-0.8.0 math operations |
| Front-running | Price-sensitive operations |
| Timestamp Dependence | Using block.timestamp for randomness |
| tx.origin | Using tx.origin for auth |
| Unchecked Return | Ignoring return values |
| DoS | Unbounded loops, push to arrays |
| Flash Loans | Price manipulation via flash loans |

## Block Explorer Verifiers

| Network | Verifier | API URL |
|---------|----------|---------|
| Sepolia | blockscout | https://eth-sepolia.blockscout.com/api/ |
| Arbitrum Sepolia | blockscout | https://sepolia-explorer.arbitrum.io/api/ |
| Base Sepolia | blockscout | https://base-sepolia.blockscout.com/api/ |
| Mainnet | etherscan | https://api.etherscan.io/api |
| Arbitrum | arbiscan | https://api.arbiscan.io/api |
| Base | basescan | https://api.basescan.org/api |
