// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IRoyaltyModule, ILicensingModule, IIPAssetRegistry, IDisputeModule, ILicenseToken } from "./interfaces/IStoryProtocol.sol";

/// @title IPayReceiver
/// @notice Receives cross-chain payments via Hyperlane and executes Story Protocol operations
/// @dev Deployed on Story Aeneid to handle license minting, derivative creation, IP registration, disputes, and listings
contract IPayReceiver is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Operation Constants ============

    uint8 public constant OP_MINT_LICENSE = 1;
    uint8 public constant OP_CREATE_DERIVATIVE = 2;
    uint8 public constant OP_REGISTER_IP = 3;
    uint8 public constant OP_TRANSFER_LICENSE = 4;
    uint8 public constant OP_RAISE_DISPUTE = 5;
    uint8 public constant OP_CREATE_LISTING = 6;
    uint8 public constant OP_UPDATE_LISTING = 7;
    uint8 public constant OP_DEACTIVATE_LISTING = 8;

    // ============ Domain Constants ============

    uint32 public constant DOMAIN_AVALANCHE_FUJI = 43113;
    uint32 public constant DOMAIN_SEPOLIA = 11155111;
    uint32 public constant DOMAIN_AMOY = 80002;

    // ============ Immutables ============

    address public immutable mailbox;
    IERC20 public immutable usdc;
    IERC20 public immutable wip;
    address public immutable royaltyModule;
    address public immutable licensingModule;
    address public immutable pilTemplate;
    address public immutable ipAssetRegistry;
    address public immutable disputeModule;
    address public immutable licenseToken;

    // ============ State Variables ============

    address public owner;
    uint256 public wipLiquidity;
    uint256 public usdcToWipRate; // Rate with 18 decimals (e.g., 10e18 = 1 USDC buys 10 WIP)
    bool public paused;
    uint256 public nextListingId;

    // ============ Structs ============

    struct PaymentRecord {
        address payer;
        address ipId;
        uint256 licenseTermsId;
        uint256 usdcAmount;
        uint256 wipAmount;
        uint8 operationType;
        bool processed;
        uint256 timestamp;
    }

    /// @notice IP listing stored on Story chain
    struct Listing {
        uint256 listingId;
        address storyIPId;
        address creator;
        string title;
        string description;
        string category;
        uint256 priceUSDC; // 6 decimals
        string assetIpfsHash;
        string metadataUri;
        uint32 sourceChain; // Origin domain that created this listing
        bool isActive;
        uint256 createdAt;
        uint256 totalUses;
    }

    /// @notice Trusted domain configuration
    struct DomainConfig {
        bool enabled;
        bytes32 trustedSender;
    }

    // ============ Mappings ============

    mapping(bytes32 => PaymentRecord) public payments;
    mapping(uint32 => DomainConfig) public trustedDomains;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256[]) public listingsByCreator;
    mapping(address => uint256[]) public listingsByIPId;

    // ============ Events ============

    event LicenseMinted(
        bytes32 indexed messageId,
        address indexed ipId,
        address indexed recipient,
        uint256 licenseTokenId,
        uint256 wipAmount
    );

    event DerivativeCreated(
        bytes32 indexed messageId,
        address indexed parentIpId,
        address indexed derivativeIpId,
        uint256 wipAmount
    );

    event IPRegistered(
        bytes32 indexed messageId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address ipId
    );

    event LicenseTransferred(
        bytes32 indexed messageId,
        uint256 indexed licenseTokenId,
        address indexed from,
        address to
    );

    event DisputeRaised(
        bytes32 indexed messageId,
        uint256 indexed disputeId,
        address indexed targetIpId,
        address disputant,
        uint256 bondAmount
    );

    event PaymentFailed(bytes32 indexed messageId, uint8 operationType, string reason);

    event PaymentReceived(
        bytes32 indexed messageId,
        address indexed payer,
        address indexed ipId,
        uint256 usdcAmount,
        uint256 wipAmount
    );

    event WIPDeposited(address indexed depositor, uint256 amount, uint256 newLiquidity);
    event WIPWithdrawn(address indexed recipient, uint256 amount, uint256 newLiquidity);
    event USDCWithdrawn(address indexed recipient, uint256 amount);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    // Listing events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed storyIPId,
        address indexed creator,
        uint256 priceUSDC,
        uint32 sourceChain,
        string title,
        string category
    );

    event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
    event ListingDeactivated(uint256 indexed listingId);
    event ListingUsed(uint256 indexed listingId, address indexed user, uint256 paymentAmount);
    event TrustedDomainUpdated(uint32 indexed domain, bytes32 sender, bool enabled);

    // ============ Errors ============

    error OnlyOwner();
    error OnlyMailbox();
    error InvalidOrigin();
    error UntrustedSender();
    error InsufficientLiquidity();
    error InvalidAmount();
    error InvalidAddress();
    error InvalidRate();
    error ContractPaused();
    error PaymentAlreadyProcessed();
    error ZeroAddress();
    error ListingNotFound();
    error ListingNotActive();
    error ArrayLengthMismatch();

    // ============ Modifiers ============

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyMailbox() {
        if (msg.sender != mailbox) revert OnlyMailbox();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============ Constructor ============

    constructor(
        address _mailbox,
        address _usdc,
        address _wip,
        address _royaltyModule,
        address _licensingModule,
        address _pilTemplate,
        address _ipAssetRegistry,
        address _disputeModule,
        address _licenseToken,
        uint256 _initialRate
    ) {
        if (_mailbox == address(0)) revert ZeroAddress();
        if (_usdc == address(0)) revert ZeroAddress();
        if (_wip == address(0)) revert ZeroAddress();
        if (_royaltyModule == address(0)) revert ZeroAddress();
        if (_licensingModule == address(0)) revert ZeroAddress();
        if (_pilTemplate == address(0)) revert ZeroAddress();
        if (_ipAssetRegistry == address(0)) revert ZeroAddress();
        if (_disputeModule == address(0)) revert ZeroAddress();
        if (_licenseToken == address(0)) revert ZeroAddress();
        if (_initialRate == 0) revert InvalidRate();

        mailbox = _mailbox;
        usdc = IERC20(_usdc);
        wip = IERC20(_wip);
        royaltyModule = _royaltyModule;
        licensingModule = _licensingModule;
        pilTemplate = _pilTemplate;
        ipAssetRegistry = _ipAssetRegistry;
        disputeModule = _disputeModule;
        licenseToken = _licenseToken;
        usdcToWipRate = _initialRate;
        owner = msg.sender;
        nextListingId = 1; // Start listing IDs at 1
    }

    // ============ External Functions ============

    /// @notice Handle incoming Hyperlane message
    /// @dev Called by the Hyperlane mailbox when a message is delivered
    /// @param _origin Origin domain ID
    /// @param _sender Sender address (as bytes32)
    /// @param _message Encoded message payload
    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external onlyMailbox whenNotPaused {
        DomainConfig memory config = trustedDomains[_origin];
        if (!config.enabled) revert InvalidOrigin();
        if (_sender != config.trustedSender) revert UntrustedSender();

        uint8 opType = uint8(_message[0]);
        bytes memory payload = _message[1:];

        if (opType == OP_MINT_LICENSE) {
            _handleMintLicense(payload);
        } else if (opType == OP_CREATE_DERIVATIVE) {
            _handleCreateDerivative(payload);
        } else if (opType == OP_REGISTER_IP) {
            _handleRegisterIP(payload);
        } else if (opType == OP_TRANSFER_LICENSE) {
            _handleTransferLicense(payload);
        } else if (opType == OP_RAISE_DISPUTE) {
            _handleRaiseDispute(payload);
        } else if (opType == OP_CREATE_LISTING) {
            _handleCreateListing(payload, _origin);
        } else if (opType == OP_UPDATE_LISTING) {
            _handleUpdateListing(payload);
        } else if (opType == OP_DEACTIVATE_LISTING) {
            _handleDeactivateListing(payload);
        }
    }

    /// @notice Set a trusted domain and its sender
    /// @param domain Hyperlane domain ID
    /// @param sender Trusted sender address (as bytes32)
    /// @param enabled Whether this domain is enabled
    function setTrustedDomain(uint32 domain, bytes32 sender, bool enabled) external onlyOwner {
        trustedDomains[domain] = DomainConfig({ enabled: enabled, trustedSender: sender });
        emit TrustedDomainUpdated(domain, sender, enabled);
    }

    /// @notice Batch set multiple trusted domains
    /// @param domains Array of domain IDs
    /// @param senders Array of sender addresses (as bytes32)
    /// @param enabledFlags Array of enabled flags
    function setTrustedDomainsBatch(
        uint32[] calldata domains,
        bytes32[] calldata senders,
        bool[] calldata enabledFlags
    ) external onlyOwner {
        if (domains.length != senders.length || domains.length != enabledFlags.length) {
            revert ArrayLengthMismatch();
        }
        for (uint256 i = 0; i < domains.length; i++) {
            trustedDomains[domains[i]] = DomainConfig({ enabled: enabledFlags[i], trustedSender: senders[i] });
            emit TrustedDomainUpdated(domains[i], senders[i], enabledFlags[i]);
        }
    }

    /// @notice Deposit WIP tokens to the liquidity pool
    function depositWIP(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        wip.safeTransferFrom(msg.sender, address(this), amount);
        wipLiquidity += amount;
        emit WIPDeposited(msg.sender, amount, wipLiquidity);
    }

    /// @notice Withdraw WIP tokens from the liquidity pool (owner only)
    function withdrawWIP(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (wipLiquidity < amount) revert InsufficientLiquidity();
        wipLiquidity -= amount;
        wip.safeTransfer(owner, amount);
        emit WIPWithdrawn(owner, amount, wipLiquidity);
    }

    /// @notice Withdraw accumulated USDC (owner only)
    function withdrawUSDC(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        uint256 balance = usdc.balanceOf(address(this));
        if (balance < amount) revert InsufficientLiquidity();
        usdc.safeTransfer(owner, amount);
        emit USDCWithdrawn(owner, amount);
    }

    /// @notice Set the USDC to WIP exchange rate
    function setExchangeRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();
        uint256 oldRate = usdcToWipRate;
        usdcToWipRate = newRate;
        emit ExchangeRateUpdated(oldRate, newRate);
    }

    /// @notice Transfer ownership of the contract
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    /// @notice Deposit a license token to escrow for marketplace sale
    function depositLicenseToEscrow(uint256 licenseTokenId) external {
        ILicenseToken(licenseToken).transferFrom(msg.sender, address(this), licenseTokenId);
    }

    /// @notice Withdraw a license token from escrow (cancel listing)
    function withdrawLicenseFromEscrow(uint256 licenseTokenId, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        ILicenseToken(licenseToken).transferFrom(address(this), recipient, licenseTokenId);
    }

    // ============ View Functions ============

    /// @notice Calculate WIP amount from USDC amount
    function calculateWIPAmount(uint256 usdcAmount) public view returns (uint256 wipAmount) {
        wipAmount = (usdcAmount * usdcToWipRate) / 1e6;
    }

    /// @notice Get payment record by message ID
    function getPayment(bytes32 messageId) external view returns (PaymentRecord memory) {
        return payments[messageId];
    }

    /// @notice Check if contract has sufficient liquidity for an operation
    function checkLiquidity(uint256 usdcAmount) external view returns (bool hasLiquidity, uint256 requiredWIP) {
        requiredWIP = calculateWIPAmount(usdcAmount);
        hasLiquidity = wipLiquidity >= requiredWIP;
    }

    /// @notice Check if a domain is trusted
    function isDomainTrusted(uint32 domain) external view returns (bool) {
        return trustedDomains[domain].enabled;
    }

    /// @notice Get domain configuration
    function getDomainConfig(uint32 domain) external view returns (bool enabled, bytes32 sender) {
        DomainConfig memory config = trustedDomains[domain];
        return (config.enabled, config.trustedSender);
    }

    /// @notice Get a single listing by ID
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /// @notice Get listing IDs by creator
    function getListingsByCreator(address creator) external view returns (uint256[] memory) {
        return listingsByCreator[creator];
    }

    /// @notice Get listing IDs by IP Asset
    function getListingsByIPId(address ipId) external view returns (uint256[] memory) {
        return listingsByIPId[ipId];
    }

    /// @notice Get paginated active listings
    /// @param offset Starting index
    /// @param limit Maximum number of listings to return
    /// @return result Array of active listings
    function getActiveListings(uint256 offset, uint256 limit) external view returns (Listing[] memory result) {
        // Count active listings first
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].isActive) activeCount++;
        }

        if (offset >= activeCount) {
            return new Listing[](0);
        }

        uint256 resultSize = limit;
        if (offset + limit > activeCount) {
            resultSize = activeCount - offset;
        }

        result = new Listing[](resultSize);
        uint256 currentOffset = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < nextListingId && resultIndex < resultSize; i++) {
            if (listings[i].isActive) {
                if (currentOffset >= offset) {
                    result[resultIndex] = listings[i];
                    resultIndex++;
                }
                currentOffset++;
            }
        }
    }

    // ============ Internal Functions - Handlers ============

    function _handleMintLicense(bytes memory payload) internal nonReentrant {
        (
            bytes32 messageId,
            address ipId,
            uint256 licenseTermsId,
            uint256 usdcAmount,
            address recipient,
            uint256 listingId
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, address, uint256));

        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        uint256 wipAmount = calculateWIPAmount(usdcAmount);
        if (wipLiquidity < wipAmount) {
            emit PaymentFailed(messageId, OP_MINT_LICENSE, "Insufficient liquidity");
            return;
        }

        wipLiquidity -= wipAmount;

        payments[messageId] = PaymentRecord({
            payer: recipient,
            ipId: ipId,
            licenseTermsId: licenseTermsId,
            usdcAmount: usdcAmount,
            wipAmount: wipAmount,
            operationType: OP_MINT_LICENSE,
            processed: false,
            timestamp: block.timestamp
        });

        emit PaymentReceived(messageId, recipient, ipId, usdcAmount, wipAmount);
        wip.approve(royaltyModule, wipAmount);

        try IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(ipId, address(0), address(wip), wipAmount) {
            try ILicensingModule(licensingModule).mintLicenseTokens(
                ipId, pilTemplate, licenseTermsId, 1, recipient, ""
            ) returns (uint256 startLicenseTokenId) {
                payments[messageId].processed = true;
                emit LicenseMinted(messageId, ipId, recipient, startLicenseTokenId, wipAmount);

                // Track listing usage if listingId is provided and valid
                if (listingId > 0 && listingId < nextListingId && listings[listingId].isActive) {
                    listings[listingId].totalUses++;
                    emit ListingUsed(listingId, recipient, usdcAmount);
                }
            } catch Error(string memory reason) {
                wipLiquidity += wipAmount;
                emit PaymentFailed(messageId, OP_MINT_LICENSE, reason);
            } catch {
                wipLiquidity += wipAmount;
                emit PaymentFailed(messageId, OP_MINT_LICENSE, "License minting failed");
            }
        } catch Error(string memory reason) {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_MINT_LICENSE, reason);
        } catch {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_MINT_LICENSE, "Royalty payment failed");
        }
    }

    function _handleCreateDerivative(bytes memory payload) internal nonReentrant {
        (
            bytes32 messageId,
            address parentIpId,
            uint256 licenseTermsId,
            uint256 usdcAmount,
            uint256 chainId,
            address nftContract,
            uint256 tokenId
        ) = abi.decode(payload, (bytes32, address, uint256, uint256, uint256, address, uint256));

        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        uint256 wipAmount = calculateWIPAmount(usdcAmount);
        if (wipLiquidity < wipAmount) {
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Insufficient liquidity");
            return;
        }

        wipLiquidity -= wipAmount;

        payments[messageId] = PaymentRecord({
            payer: address(0),
            ipId: parentIpId,
            licenseTermsId: licenseTermsId,
            usdcAmount: usdcAmount,
            wipAmount: wipAmount,
            operationType: OP_CREATE_DERIVATIVE,
            processed: false,
            timestamp: block.timestamp
        });

        emit PaymentReceived(messageId, address(0), parentIpId, usdcAmount, wipAmount);
        wip.approve(royaltyModule, wipAmount);

        try this._executeDerivativeCreation(messageId, parentIpId, licenseTermsId, wipAmount, chainId, nftContract, tokenId)
        {} catch Error(string memory reason) {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, reason);
        } catch {
            wipLiquidity += wipAmount;
            emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Derivative creation failed");
        }
    }

    function _executeDerivativeCreation(
        bytes32 messageId,
        address parentIpId,
        uint256 licenseTermsId,
        uint256 wipAmount,
        uint256 chainId,
        address nftContract,
        uint256 tokenId
    ) external {
        require(msg.sender == address(this), "Internal only");

        IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(parentIpId, address(0), address(wip), wipAmount);
        address derivativeIpId = IIPAssetRegistry(ipAssetRegistry).register(chainId, nftContract, tokenId);

        address[] memory parentIds = new address[](1);
        parentIds[0] = parentIpId;
        uint256[] memory termIds = new uint256[](1);
        termIds[0] = licenseTermsId;

        IIPAssetRegistry(ipAssetRegistry).registerDerivative(derivativeIpId, parentIds, termIds, pilTemplate, "");

        payments[messageId].processed = true;
        emit DerivativeCreated(messageId, parentIpId, derivativeIpId, wipAmount);
    }

    function _handleRegisterIP(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address nftContract, uint256 tokenId, ) =
            abi.decode(payload, (bytes32, address, uint256, address));

        try IIPAssetRegistry(ipAssetRegistry).register(block.chainid, nftContract, tokenId) returns (address ipId) {
            emit IPRegistered(messageId, nftContract, tokenId, ipId);
        } catch Error(string memory reason) {
            emit PaymentFailed(messageId, OP_REGISTER_IP, reason);
        } catch {
            emit PaymentFailed(messageId, OP_REGISTER_IP, "IP registration failed");
        }
    }

    function _handleTransferLicense(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, uint256 licenseTokenId, address from, address to) =
            abi.decode(payload, (bytes32, uint256, address, address));

        address tokenOwner = ILicenseToken(licenseToken).ownerOf(licenseTokenId);
        if (tokenOwner != address(this)) {
            emit PaymentFailed(messageId, OP_TRANSFER_LICENSE, "License not in escrow");
            return;
        }

        try ILicenseToken(licenseToken).transferFrom(address(this), to, licenseTokenId) {
            emit LicenseTransferred(messageId, licenseTokenId, from, to);
        } catch Error(string memory reason) {
            emit PaymentFailed(messageId, OP_TRANSFER_LICENSE, reason);
        } catch {
            emit PaymentFailed(messageId, OP_TRANSFER_LICENSE, "License transfer failed");
        }
    }

    function _handleRaiseDispute(bytes memory payload) internal nonReentrant {
        (
            bytes32 messageId,
            address targetIpId,
            bytes32 evidenceHash,
            bytes32 disputeTag,
            uint256 bondAmount,
            address disputant
        ) = abi.decode(payload, (bytes32, address, bytes32, bytes32, uint256, address));

        if (wipLiquidity < bondAmount) {
            emit PaymentFailed(messageId, OP_RAISE_DISPUTE, "Insufficient bond liquidity");
            return;
        }
        wipLiquidity -= bondAmount;
        wip.approve(disputeModule, bondAmount);

        try IDisputeModule(disputeModule).raiseDispute(targetIpId, evidenceHash, disputeTag, "") returns (
            uint256 disputeId
        ) {
            emit DisputeRaised(messageId, disputeId, targetIpId, disputant, bondAmount);
        } catch Error(string memory reason) {
            wipLiquidity += bondAmount;
            emit PaymentFailed(messageId, OP_RAISE_DISPUTE, reason);
        } catch {
            wipLiquidity += bondAmount;
            emit PaymentFailed(messageId, OP_RAISE_DISPUTE, "Dispute creation failed");
        }
    }

    function _handleCreateListing(bytes memory payload, uint32 sourceChain) internal {
        (
            address storyIPId,
            address creator,
            string memory title,
            string memory description,
            string memory category,
            uint256 priceUSDC,
            string memory assetIpfsHash,
            string memory metadataUri
        ) = abi.decode(payload, (address, address, string, string, string, uint256, string, string));

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            listingId: listingId,
            storyIPId: storyIPId,
            creator: creator,
            title: title,
            description: description,
            category: category,
            priceUSDC: priceUSDC,
            assetIpfsHash: assetIpfsHash,
            metadataUri: metadataUri,
            sourceChain: sourceChain,
            isActive: true,
            createdAt: block.timestamp,
            totalUses: 0
        });

        listingsByCreator[creator].push(listingId);
        listingsByIPId[storyIPId].push(listingId);

        emit ListingCreated(listingId, storyIPId, creator, priceUSDC, sourceChain, title, category);
    }

    function _handleUpdateListing(bytes memory payload) internal {
        (uint256 listingId, uint256 newPrice) = abi.decode(payload, (uint256, uint256));

        if (listingId == 0 || listingId >= nextListingId) revert ListingNotFound();
        if (!listings[listingId].isActive) revert ListingNotActive();

        listings[listingId].priceUSDC = newPrice;
        emit ListingUpdated(listingId, newPrice);
    }

    function _handleDeactivateListing(bytes memory payload) internal {
        uint256 listingId = abi.decode(payload, (uint256));

        if (listingId == 0 || listingId >= nextListingId) revert ListingNotFound();

        listings[listingId].isActive = false;
        emit ListingDeactivated(listingId);
    }
}
