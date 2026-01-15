// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Story Protocol Interfaces
interface IRoyaltyModule {
    function payRoyaltyOnBehalf(
        address receiverIpId,
        address payerIpId,
        address token,
        uint256 amount
    ) external;
}

interface IRoyaltyWorkflows {
    function claimAllRevenue(
        address ancestorIpId,
        address claimer,
        address[] calldata currencyTokens,
        address[] calldata childIpIds
    ) external returns (uint256[] memory);
}

interface IDisputeModule {
    function raiseDispute(
        address targetIpId,
        bytes32 disputeEvidenceHash,
        bytes32 targetTag,
        bytes calldata data
    ) external returns (uint256);
}

/// @title StoryReceiver
/// @notice Receives cross-chain messages from Mantle and executes Story Protocol operations
contract StoryReceiver is Ownable {
    // ============ Message Types ============
    uint8 public constant MSG_PAY_ROYALTY = 1;
    uint8 public constant MSG_CLAIM_REVENUE = 2;
    uint8 public constant MSG_RAISE_DISPUTE = 3;

    // ============ Story Protocol Contracts ============
    IRoyaltyModule public immutable royaltyModule;
    IRoyaltyWorkflows public immutable royaltyWorkflows;
    IDisputeModule public immutable disputeModule;

    // ============ Hyperlane ============
    address public immutable mailbox;
    uint32 public mantleDomainId;
    bytes32 public mantleBridge;

    // ============ Events ============
    event RoyaltyPaid(
        bytes32 indexed messageId,
        address indexed originalSender,
        address receiverIpId,
        uint256 amount
    );

    event RevenueClaimed(
        bytes32 indexed messageId,
        address indexed originalSender,
        address ancestorIpId,
        uint256[] amounts
    );

    event DisputeRaised(
        bytes32 indexed messageId,
        address indexed originalSender,
        address targetIpId,
        uint256 disputeId
    );

    event OperationFailed(
        bytes32 indexed messageId,
        uint8 operationType,
        string reason
    );

    // ============ Errors ============
    error OnlyMailbox();
    error InvalidOrigin();
    error UntrustedSender();

    // ============ Modifiers ============
    modifier onlyMailbox() {
        if (msg.sender != mailbox) revert OnlyMailbox();
        _;
    }

    // ============ Constructor ============
    constructor(
        address _mailbox,
        uint32 _mantleDomainId,
        bytes32 _mantleBridge,
        address _royaltyModule,
        address _royaltyWorkflows,
        address _disputeModule
    ) Ownable(msg.sender) {
        mailbox = _mailbox;
        mantleDomainId = _mantleDomainId;
        mantleBridge = _mantleBridge;
        royaltyModule = IRoyaltyModule(_royaltyModule);
        royaltyWorkflows = IRoyaltyWorkflows(_royaltyWorkflows);
        disputeModule = IDisputeModule(_disputeModule);
    }

    // ============ Hyperlane Handler ============

    /// @notice Handle incoming messages from Hyperlane mailbox
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external onlyMailbox {
        if (_origin != mantleDomainId) revert InvalidOrigin();
        if (_sender != mantleBridge) revert UntrustedSender();

        // Decode message type
        uint8 msgType = abi.decode(_message, (uint8));

        if (msgType == MSG_PAY_ROYALTY) {
            _handlePayRoyalty(_message);
        } else if (msgType == MSG_CLAIM_REVENUE) {
            _handleClaimRevenue(_message);
        } else if (msgType == MSG_RAISE_DISPUTE) {
            _handleRaiseDispute(_message);
        }
    }

    // ============ Internal Handlers ============

    function _handlePayRoyalty(bytes calldata message) internal {
        (
            ,
            address originalSender,
            address receiverIpId,
            address token,
            uint256 amount
        ) = abi.decode(message, (uint8, address, address, address, uint256));

        // Note: The originalSender needs to have approved this contract on Story chain
        // or we need to use a different mechanism (like holding funds)
        try royaltyModule.payRoyaltyOnBehalf(
            receiverIpId,
            address(0), // payer = 0 for direct payment
            token,
            amount
        ) {
            emit RoyaltyPaid(bytes32(0), originalSender, receiverIpId, amount);
        } catch Error(string memory reason) {
            emit OperationFailed(bytes32(0), MSG_PAY_ROYALTY, reason);
        }
    }

    function _handleClaimRevenue(bytes calldata message) internal {
        (
            ,
            address originalSender,
            address ancestorIpId,
            address[] memory currencyTokens,
            address[] memory childIpIds
        ) = abi.decode(message, (uint8, address, address, address[], address[]));

        try royaltyWorkflows.claimAllRevenue(
            ancestorIpId,
            originalSender, // claimer is the original sender
            currencyTokens,
            childIpIds
        ) returns (uint256[] memory amounts) {
            emit RevenueClaimed(bytes32(0), originalSender, ancestorIpId, amounts);
        } catch Error(string memory reason) {
            emit OperationFailed(bytes32(0), MSG_CLAIM_REVENUE, reason);
        }
    }

    function _handleRaiseDispute(bytes calldata message) internal {
        (
            ,
            address originalSender,
            address targetIpId,
            bytes32 evidenceHash,
            bytes32 targetTag
        ) = abi.decode(message, (uint8, address, address, bytes32, bytes32));

        try disputeModule.raiseDispute(
            targetIpId,
            evidenceHash,
            targetTag,
            "" // empty data
        ) returns (uint256 disputeId) {
            emit DisputeRaised(bytes32(0), originalSender, targetIpId, disputeId);
        } catch Error(string memory reason) {
            emit OperationFailed(bytes32(0), MSG_RAISE_DISPUTE, reason);
        }
    }

    // ============ Admin Functions ============

    function setMantleBridge(bytes32 newBridge) external onlyOwner {
        mantleBridge = newBridge;
    }

    function setMantleDomainId(uint32 newDomainId) external onlyOwner {
        mantleDomainId = newDomainId;
    }
}
