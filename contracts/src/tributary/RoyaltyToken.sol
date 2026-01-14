// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Checkpoints } from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import { IRoyaltyToken } from "./interfaces/IRoyaltyToken.sol";

/// @title RoyaltyToken
/// @notice ERC-20 token with snapshot functionality for fair royalty distribution
/// @dev Uses OpenZeppelin Checkpoints to implement snapshot-based balance queries
contract RoyaltyToken is ERC20, Ownable, IRoyaltyToken {
    using Checkpoints for Checkpoints.Trace256;

    /// @notice The RoyaltyVault that owns this token
    address public immutable vault;
    /// @notice Story Protocol IP ID this token represents
    bytes32 public immutable storyIPId;
    /// @notice Original creator address
    address public immutable creator;

    uint256 private _currentSnapshotId;
    mapping(address => Checkpoints.Trace256) private _accountBalanceSnapshots;
    Checkpoints.Trace256 private _totalSupplySnapshots;

    event SnapshotCreated(uint256 indexed snapshotId, uint256 timestamp);
    error ZeroAddress();

    /// @notice Creates a new RoyaltyToken
    /// @param _name Token name
    /// @param _symbol Token symbol
    /// @param _vault RoyaltyVault address that will own this token
    /// @param _creator Original creator address
    /// @param _storyIPId Story Protocol IP ID
    /// @param _totalSupply Total supply to mint
    /// @param _creatorAllocation Amount of tokens to mint directly to creator
    constructor(
        string memory _name,
        string memory _symbol,
        address _vault,
        address _creator,
        bytes32 _storyIPId,
        uint256 _totalSupply,
        uint256 _creatorAllocation
    ) ERC20(_name, _symbol) Ownable(_vault) {
        if (_vault == address(0)) revert ZeroAddress();
        if (_creator == address(0)) revert ZeroAddress();
        vault = _vault;
        creator = _creator;
        storyIPId = _storyIPId;
        // Mint creator allocation to creator, rest to vault
        if (_creatorAllocation > 0) {
            _mint(_creator, _creatorAllocation);
        }
        _mint(_vault, _totalSupply - _creatorAllocation);
    }

    /// @notice Creates a new snapshot and returns the snapshot ID
    /// @dev Only callable by the vault (owner)
    /// @return snapshotId The ID of the created snapshot
    function snapshot() external onlyOwner returns (uint256 snapshotId) {
        unchecked { snapshotId = ++_currentSnapshotId; }
        emit SnapshotCreated(snapshotId, block.timestamp);
    }

    /// @notice Burns tokens from the caller's balance
    /// @param amount Amount of tokens to burn
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Returns the balance of an account at a specific snapshot
    /// @param account Address to query
    /// @param snapshotId Snapshot ID to query
    /// @return Balance at the snapshot
    function balanceOfAt(address account, uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_accountBalanceSnapshots[account], snapshotId, balanceOf(account));
    }

    /// @notice Returns the total supply at a specific snapshot
    /// @param snapshotId Snapshot ID to query
    /// @return Total supply at the snapshot
    function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_totalSupplySnapshots, snapshotId, totalSupply());
    }

    /// @notice Returns the current snapshot ID
    function getCurrentSnapshotId() external view returns (uint256) {
        return _currentSnapshotId;
    }

    /// @dev Updates snapshots for from and to addresses before transfer
    function _update(address from, address to, uint256 value) internal virtual override {
        if (from != address(0)) _updateAccountSnapshot(from);
        if (to != address(0)) _updateAccountSnapshot(to);
        _updateTotalSupplySnapshot();
        super._update(from, to, value);
    }

    function _updateAccountSnapshot(address account) private {
        uint256 currentId = _currentSnapshotId;
        if (currentId == 0) return;
        Checkpoints.Trace256 storage snapshots = _accountBalanceSnapshots[account];
        (bool exists, uint256 lastKey,) = snapshots.latestCheckpoint();
        if (!exists || lastKey < currentId) {
            snapshots.push(currentId, balanceOf(account));
        }
    }

    function _updateTotalSupplySnapshot() private {
        uint256 currentId = _currentSnapshotId;
        if (currentId == 0) return;
        (bool exists, uint256 lastKey,) = _totalSupplySnapshots.latestCheckpoint();
        if (!exists || lastKey < currentId) {
            _totalSupplySnapshots.push(currentId, totalSupply());
        }
    }

    function _valueAt(
        Checkpoints.Trace256 storage snapshots,
        uint256 snapshotId,
        uint256 currentValue
    ) private view returns (uint256) {
        if (snapshotId == 0 || snapshotId > _currentSnapshotId) return currentValue;
        return snapshots.upperLookup(snapshotId);
    }
}
