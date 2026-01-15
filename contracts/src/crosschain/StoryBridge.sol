// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IMailbox - Hyperlane mailbox interface
interface IMailbox {
    function dispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody
    ) external payable returns (bytes32 messageId);

    function quoteDispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody
    ) external view returns (uint256 fee);
}

/// @title StoryBridge
/// @notice Bridge contract on Mantle for cross-chain Story Protocol operations
/// @dev Sends operation requests to Story chain via Hyperlane mailbox
contract StoryBridge is Ownable {
    // ============ Message Types ============
    uint8 public constant MSG_PAY_ROYALTY = 1;
    uint8 public constant MSG_CLAIM_REVENUE = 2;
    uint8 public constant MSG_RAISE_DISPUTE = 3;

    // ============ State ============
    IMailbox public immutable mailbox;
    uint32 public immutable storyDomainId;
    bytes32 public storyReceiver;

    // ============ Events ============
    event RoyaltyPaymentRequested(
        bytes32 indexed messageId,
        address indexed sender,
        address receiverIpId,
        uint256 amount
    );

    event RevenueClaimRequested(
        bytes32 indexed messageId,
        address indexed sender,
        address ancestorIpId
    );

    event DisputeRaiseRequested(
        bytes32 indexed messageId,
        address indexed sender,
        address targetIpId,
        bytes32 tag
    );

    event StoryReceiverUpdated(bytes32 oldReceiver, bytes32 newReceiver);

    // ============ Errors ============
    error InsufficientFee();
    error InvalidReceiver();

    // ============ Constructor ============
    constructor(
        address _mailbox,
        uint32 _storyDomainId,
        bytes32 _storyReceiver
    ) Ownable(msg.sender) {
        mailbox = IMailbox(_mailbox);
        storyDomainId = _storyDomainId;
        storyReceiver = _storyReceiver;
    }

    // ============ External Functions ============

    /// @notice Request to pay royalty on Story chain
    function payRoyalty(
        address receiverIpId,
        address token,
        uint256 amount
    ) external payable returns (bytes32 messageId) {
        bytes memory message = abi.encode(
            MSG_PAY_ROYALTY,
            msg.sender,
            receiverIpId,
            token,
            amount
        );

        messageId = _dispatch(message);
        emit RoyaltyPaymentRequested(messageId, msg.sender, receiverIpId, amount);
    }

    /// @notice Request to claim revenue on Story chain
    function claimRevenue(
        address ancestorIpId,
        address[] calldata currencyTokens,
        address[] calldata childIpIds
    ) external payable returns (bytes32 messageId) {
        bytes memory message = abi.encode(
            MSG_CLAIM_REVENUE,
            msg.sender,
            ancestorIpId,
            currencyTokens,
            childIpIds
        );

        messageId = _dispatch(message);
        emit RevenueClaimRequested(messageId, msg.sender, ancestorIpId);
    }

    /// @notice Request to raise dispute on Story chain
    function raiseDispute(
        address targetIpId,
        bytes32 evidenceHash,
        bytes32 targetTag
    ) external payable returns (bytes32 messageId) {
        bytes memory message = abi.encode(
            MSG_RAISE_DISPUTE,
            msg.sender,
            targetIpId,
            evidenceHash,
            targetTag
        );

        messageId = _dispatch(message);
        emit DisputeRaiseRequested(messageId, msg.sender, targetIpId, targetTag);
    }

    /// @notice Quote fee for any operation
    function quoteFee(bytes calldata message) external view returns (uint256) {
        return mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
    }

    /// @notice Quote fee for pay royalty
    function quotePayRoyalty(
        address receiverIpId,
        address token,
        uint256 amount
    ) external view returns (uint256) {
        bytes memory message = abi.encode(MSG_PAY_ROYALTY, msg.sender, receiverIpId, token, amount);
        return mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
    }

    /// @notice Quote fee for claim revenue
    function quoteClaimRevenue(
        address ancestorIpId,
        address[] calldata currencyTokens,
        address[] calldata childIpIds
    ) external view returns (uint256) {
        bytes memory message = abi.encode(MSG_CLAIM_REVENUE, msg.sender, ancestorIpId, currencyTokens, childIpIds);
        return mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
    }

    /// @notice Quote fee for raise dispute
    function quoteRaiseDispute(
        address targetIpId,
        bytes32 evidenceHash,
        bytes32 targetTag
    ) external view returns (uint256) {
        bytes memory message = abi.encode(MSG_RAISE_DISPUTE, msg.sender, targetIpId, evidenceHash, targetTag);
        return mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
    }

    // ============ Admin Functions ============

    function setStoryReceiver(bytes32 newReceiver) external onlyOwner {
        if (newReceiver == bytes32(0)) revert InvalidReceiver();
        bytes32 oldReceiver = storyReceiver;
        storyReceiver = newReceiver;
        emit StoryReceiverUpdated(oldReceiver, newReceiver);
    }

    // ============ Internal Functions ============

    function _dispatch(bytes memory message) internal returns (bytes32 messageId) {
        uint256 fee = mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
        if (msg.value < fee) revert InsufficientFee();

        messageId = mailbox.dispatch{value: fee}(storyDomainId, storyReceiver, message);

        // Refund excess
        uint256 excess = msg.value - fee;
        if (excess > 0) {
            (bool success,) = msg.sender.call{value: excess}("");
            require(success, "Refund failed");
        }
    }

    receive() external payable {}
}
