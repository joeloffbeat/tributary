# Contract Development Examples

## Basic ERC20 Token

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

## Staking Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public rewardRate; // Rewards per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balances;

    uint256 public totalSupply;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((balances[account] *
            (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        totalSupply -= amount;
        balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            stakingToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function setRewardRate(uint256 _rewardRate) external onlyOwner updateReward(address(0)) {
        rewardRate = _rewardRate;
    }
}
```

## Unit Test

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Token.sol";

contract TokenTest is Test {
    Token public token;
    address public owner;
    address public user1;
    address public user2;

    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        vm.prank(owner);
        token = new Token("MyToken", "MTK", 18);
    }

    function test_InitialState() public view {
        assertEq(token.name(), "MyToken");
        assertEq(token.symbol(), "MTK");
        assertEq(token.decimals(), 18);
        assertEq(token.owner(), owner);
        assertEq(token.totalSupply(), 0);
    }

    function test_Mint_AsOwner_ShouldMintTokens() public {
        uint256 amount = 1000 ether;

        vm.prank(owner);
        token.mint(user1, amount);

        assertEq(token.balanceOf(user1), amount);
        assertEq(token.totalSupply(), amount);
    }

    function testRevert_Mint_AsNonOwner_ShouldRevert() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user1, 1000 ether);
    }

    function test_Transfer_WhenSufficientBalance_ShouldTransfer() public {
        uint256 mintAmount = 1000 ether;
        uint256 transferAmount = 100 ether;

        vm.prank(owner);
        token.mint(user1, mintAmount);

        vm.expectEmit(true, true, false, true);
        emit Transfer(user1, user2, transferAmount);

        vm.prank(user1);
        token.transfer(user2, transferAmount);

        assertEq(token.balanceOf(user1), mintAmount - transferAmount);
        assertEq(token.balanceOf(user2), transferAmount);
    }

    function testRevert_Transfer_WhenInsufficientBalance_ShouldRevert() public {
        vm.prank(user1);
        vm.expectRevert();
        token.transfer(user2, 100 ether);
    }

    function testFuzz_Transfer_Amount(uint256 amount) public {
        // Bound to reasonable range
        amount = bound(amount, 1, 1_000_000 ether);

        vm.prank(owner);
        token.mint(user1, amount);

        vm.prank(user1);
        token.transfer(user2, amount);

        assertEq(token.balanceOf(user1), 0);
        assertEq(token.balanceOf(user2), amount);
    }

    function test_Burn_ShouldReduceSupply() public {
        uint256 amount = 1000 ether;
        uint256 burnAmount = 100 ether;

        vm.prank(owner);
        token.mint(user1, amount);

        vm.prank(user1);
        token.burn(burnAmount);

        assertEq(token.balanceOf(user1), amount - burnAmount);
        assertEq(token.totalSupply(), amount - burnAmount);
    }
}
```

## Staking Test with Time Manipulation

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Token.sol";
import "../src/Staking.sol";

contract StakingTest is Test {
    Token public token;
    Staking public staking;
    address public owner;
    address public user1;

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");

        vm.startPrank(owner);
        token = new Token("MyToken", "MTK", 18);
        staking = new Staking(address(token));

        // Mint tokens for testing
        token.mint(user1, 10000 ether);
        token.mint(address(staking), 10000 ether); // Rewards pool

        // Set reward rate: 1 token per second
        staking.setRewardRate(1 ether);
        vm.stopPrank();
    }

    function test_Stake_ShouldUpdateBalances() public {
        uint256 amount = 1000 ether;

        vm.startPrank(user1);
        token.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();

        assertEq(staking.balances(user1), amount);
        assertEq(staking.totalSupply(), amount);
        assertEq(token.balanceOf(user1), 9000 ether);
    }

    function test_Earned_AfterTimeElapsed_ShouldAccrueRewards() public {
        uint256 amount = 1000 ether;

        vm.startPrank(user1);
        token.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();

        // Fast forward 100 seconds
        vm.warp(block.timestamp + 100);

        // Should have earned ~100 tokens (1 per second)
        uint256 earned = staking.earned(user1);
        assertApproxEqAbs(earned, 100 ether, 1 ether);
    }

    function test_GetReward_ShouldTransferRewards() public {
        uint256 amount = 1000 ether;

        vm.startPrank(user1);
        token.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();

        // Fast forward 100 seconds
        vm.warp(block.timestamp + 100);

        uint256 balanceBefore = token.balanceOf(user1);

        vm.prank(user1);
        staking.getReward();

        uint256 balanceAfter = token.balanceOf(user1);
        assertGt(balanceAfter, balanceBefore);
    }

    function test_Withdraw_ShouldReturnTokensAndRewards() public {
        uint256 amount = 1000 ether;

        vm.startPrank(user1);
        token.approve(address(staking), amount);
        staking.stake(amount);
        vm.stopPrank();

        // Fast forward
        vm.warp(block.timestamp + 100);

        vm.startPrank(user1);
        staking.withdraw(amount);
        staking.getReward();
        vm.stopPrank();

        assertEq(staking.balances(user1), 0);
        assertGt(token.balanceOf(user1), 10000 ether); // Original + rewards
    }
}
```

## Deployment Script

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Token.sol";
import "../src/Staking.sol";

contract DeployScript is Script {
    function run() public returns (Token token, Staking staking) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Token
        token = new Token("MyToken", "MTK", 18);
        console.log("Token deployed at:", address(token));

        // Deploy Staking
        staking = new Staking(address(token));
        console.log("Staking deployed at:", address(staking));

        // Initial setup
        uint256 initialSupply = 1_000_000 ether;
        token.mint(deployer, initialSupply);
        console.log("Minted", initialSupply / 1 ether, "tokens to deployer");

        // Fund staking rewards
        uint256 rewardsPool = 100_000 ether;
        token.transfer(address(staking), rewardsPool);
        console.log("Transferred", rewardsPool / 1 ether, "tokens to staking rewards");

        // Set reward rate: 0.1 token per second
        staking.setRewardRate(0.1 ether);
        console.log("Reward rate set to 0.1 tokens/second");

        vm.stopBroadcast();

        return (token, staking);
    }
}
```

## Fork Test Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
}

contract UniswapForkTest is Test {
    address constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant WHALE = 0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503;

    IUniswapV2Router router;

    function setUp() public {
        // Fork mainnet
        vm.createSelectFork(vm.envString("MAINNET_RPC_URL"), 18_000_000);
        router = IUniswapV2Router(UNISWAP_V2_ROUTER);
    }

    function testFork_SwapWETHForUSDC() public {
        uint256 amountIn = 1 ether;

        // Get WETH by depositing ETH
        vm.deal(address(this), amountIn);
        (bool success,) = WETH.call{value: amountIn}("");
        require(success, "WETH deposit failed");

        // Approve router
        IERC20(WETH).approve(UNISWAP_V2_ROUTER, amountIn);

        // Prepare swap path
        address[] memory path = new address[](2);
        path[0] = WETH;
        path[1] = USDC;

        uint256 usdcBefore = IERC20(USDC).balanceOf(address(this));

        // Execute swap
        router.swapExactTokensForTokens(
            amountIn,
            0, // Accept any amount (don't do this in production!)
            path,
            address(this),
            block.timestamp + 1800
        );

        uint256 usdcAfter = IERC20(USDC).balanceOf(address(this));

        assertGt(usdcAfter, usdcBefore, "Should have received USDC");
        console.log("Received USDC:", usdcAfter - usdcBefore);
    }

    function testFork_ImpersonateWhale() public {
        uint256 amount = 1000 * 1e6; // 1000 USDC

        uint256 whaleBefore = IERC20(USDC).balanceOf(WHALE);

        vm.prank(WHALE);
        IERC20(USDC).approve(address(this), amount);

        // ... do something with whale's approval

        console.log("Whale USDC balance:", whaleBefore / 1e6);
    }
}
```
