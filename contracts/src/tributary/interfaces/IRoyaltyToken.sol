// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRoyaltyToken is IERC20 {
    function vault() external view returns (address);
    function storyIPId() external view returns (bytes32);
    function creator() external view returns (address);
    function snapshot() external returns (uint256);
    function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256);
    function totalSupplyAt(uint256 snapshotId) external view returns (uint256);
    function burn(uint256 amount) external;
}
