// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title IMailbox
/// @notice Hyperlane mailbox interface for cross-chain messaging
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

    function localDomain() external view returns (uint32);
}

/// @title TributaryBridge
/// @notice Bridge contract on Mantle for IP ownership verification with Story Protocol
/// @dev Sends verification requests to Story and receives ownership confirmations via Hyperlane
contract TributaryBridge is ReentrancyGuard, Pausable, Ownable {
    // ============ Message Types ============

    uint8 public constant MSG_VERIFY_IP_OWNERSHIP = 100;
    uint8 public constant MSG_OWNERSHIP_VERIFIED = 101;

    // ============ Immutables ============

    IMailbox public immutable mailbox;
    uint32 public immutable storyDomainId;

    // ============ State Variables ============

    bytes32 public storyReceiver;
    uint256 public verificationCount;

    // ============ Structs ============

    enum VerificationStatus { Pending, Verified, Failed, Expired }

    struct VerificationRequest {
        bytes32 requestId;
        address requester;
        address storyIpId;
        address walletToVerify;
        VerificationStatus status;
        uint256 timestamp;
    }

    // ============ Mappings ============

    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(address => bytes32[]) public requestsByRequester;
    mapping(address => mapping(address => bool)) public verifiedOwnership;

    // ============ Events ============

    event VerificationRequested(
        bytes32 indexed requestId,
        address indexed requester,
        address indexed storyIpId,
        address walletToVerify,
        bytes32 messageId
    );

    event OwnershipVerified(
        bytes32 indexed requestId,
        address indexed storyIpId,
        address indexed owner,
        bool isOwner
    );

    event StoryReceiverUpdated(bytes32 oldReceiver, bytes32 newReceiver);

    // ============ Errors ============

    error ZeroAddress();
    error InvalidStoryReceiver();
    error OnlyMailbox();
    error InvalidOrigin();
    error UntrustedSender();
    error RequestNotFound();
    error RequestAlreadyProcessed();
    error InsufficientFee();

    // ============ Modifiers ============

    modifier onlyMailbox() {
        if (msg.sender != address(mailbox)) revert OnlyMailbox();
        _;
    }

    // ============ Constructor ============

    constructor(
        address _mailbox,
        uint32 _storyDomainId,
        bytes32 _storyReceiver
    ) Ownable(msg.sender) {
        if (_mailbox == address(0)) revert ZeroAddress();
        if (_storyReceiver == bytes32(0)) revert InvalidStoryReceiver();

        mailbox = IMailbox(_mailbox);
        storyDomainId = _storyDomainId;
        storyReceiver = _storyReceiver;
    }

    // ============ External Functions ============

    /// @notice Request verification of IP ownership on Story Protocol
    /// @param storyIpId The IP asset ID on Story Protocol
    /// @param walletToVerify The wallet address to verify ownership for
    /// @return requestId The unique request identifier
    function requestOwnershipVerification(
        address storyIpId,
        address walletToVerify
    ) external payable nonReentrant whenNotPaused returns (bytes32 requestId) {
        if (storyIpId == address(0) || walletToVerify == address(0)) revert ZeroAddress();

        // Generate request ID
        requestId = _generateRequestId(storyIpId, walletToVerify);

        // Build and dispatch message
        bytes memory message = _buildVerificationMessage(requestId, storyIpId, walletToVerify);
        bytes32 messageId = _dispatchMessage(message);

        // Store request
        _storeRequest(requestId, storyIpId, walletToVerify);

        emit VerificationRequested(requestId, msg.sender, storyIpId, walletToVerify, messageId);
    }

    /// @notice Handle incoming messages from Hyperlane mailbox
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external onlyMailbox whenNotPaused {
        if (_origin != storyDomainId) revert InvalidOrigin();
        if (_sender != storyReceiver) revert UntrustedSender();

        uint8 msgType = uint8(_message[0]);
        if (msgType == MSG_OWNERSHIP_VERIFIED) {
            _handleOwnershipVerified(_message[1:]);
        }
    }

    /// @notice Quote the fee for verification request
    function quoteVerificationFee(
        address storyIpId,
        address walletToVerify
    ) external view returns (uint256 fee) {
        bytes32 tempRequestId = keccak256(
            abi.encodePacked(block.chainid, msg.sender, storyIpId, walletToVerify, block.timestamp, verificationCount)
        );
        bytes memory message = _buildVerificationMessage(tempRequestId, storyIpId, walletToVerify);
        fee = mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
    }

    /// @notice Check if ownership has been verified
    function isOwnershipVerified(address storyIpId, address wallet) external view returns (bool) {
        return verifiedOwnership[storyIpId][wallet];
    }

    /// @notice Get verification request details
    function getVerificationRequest(bytes32 requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }

    /// @notice Get all requests by a requester
    function getRequestsByRequester(address requester) external view returns (bytes32[] memory) {
        return requestsByRequester[requester];
    }

    // ============ Admin Functions ============

    function setStoryReceiver(bytes32 newReceiver) external onlyOwner {
        if (newReceiver == bytes32(0)) revert InvalidStoryReceiver();
        bytes32 oldReceiver = storyReceiver;
        storyReceiver = newReceiver;
        emit StoryReceiverUpdated(oldReceiver, newReceiver);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{ value: address(this).balance }("");
        require(success, "Withdraw failed");
    }

    // ============ Internal Functions ============

    function _generateRequestId(address storyIpId, address walletToVerify) internal returns (bytes32) {
        return keccak256(
            abi.encodePacked(block.chainid, msg.sender, storyIpId, walletToVerify, block.timestamp, verificationCount++)
        );
    }

    function _buildVerificationMessage(
        bytes32 requestId,
        address storyIpId,
        address walletToVerify
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(MSG_VERIFY_IP_OWNERSHIP, abi.encode(requestId, storyIpId, walletToVerify));
    }

    function _dispatchMessage(bytes memory message) internal returns (bytes32 messageId) {
        uint256 fee = mailbox.quoteDispatch(storyDomainId, storyReceiver, message);
        if (msg.value < fee) revert InsufficientFee();

        messageId = mailbox.dispatch{ value: fee }(storyDomainId, storyReceiver, message);

        // Refund excess
        uint256 excess = msg.value - fee;
        if (excess > 0) {
            (bool success, ) = msg.sender.call{ value: excess }("");
            require(success, "Refund failed");
        }
    }

    function _storeRequest(bytes32 requestId, address storyIpId, address walletToVerify) internal {
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            requester: msg.sender,
            storyIpId: storyIpId,
            walletToVerify: walletToVerify,
            status: VerificationStatus.Pending,
            timestamp: block.timestamp
        });
        requestsByRequester[msg.sender].push(requestId);
    }

    function _handleOwnershipVerified(bytes calldata payload) internal {
        (bytes32 requestId, address storyIpId, address wallet, bool isOwner) = abi.decode(
            payload, (bytes32, address, address, bool)
        );

        VerificationRequest storage request = verificationRequests[requestId];
        if (request.requestId == bytes32(0)) revert RequestNotFound();
        if (request.status != VerificationStatus.Pending) revert RequestAlreadyProcessed();

        request.status = isOwner ? VerificationStatus.Verified : VerificationStatus.Failed;

        if (isOwner) {
            verifiedOwnership[storyIpId][wallet] = true;
        }

        emit OwnershipVerified(requestId, storyIpId, wallet, isOwner);
    }

    receive() external payable {}
}
