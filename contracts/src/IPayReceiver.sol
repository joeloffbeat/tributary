// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IRoyaltyModule, ILicensingModule, IIPAssetRegistry, IDisputeModule, ILicenseToken, IRegistrationWorkflows, IDerivativeWorkflows, ILicenseAttachmentWorkflows, WorkflowStructs, ISPGNFT } from "./interfaces/IStoryProtocol.sol";
import { IPayLib } from "./libraries/IPayLib.sol";

/// @title IPayReceiver
/// @notice Receives cross-chain payments via Hyperlane and executes Story Protocol operations
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
    uint8 public constant OP_MINT_AND_REGISTER_IP = 9;
    uint8 public constant OP_CREATE_COLLECTION = 10;
    uint8 public constant OP_LIST_LICENSE_TOKEN = 11;
    uint8 public constant OP_PURCHASE_LICENSE_LISTING = 12;
    uint8 public constant OP_MINT_LICENSE_WITH_FEE = 13;
    uint8 public constant OP_CREATE_DERIVATIVE_WITH_LICENSE = 14;

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
    address public immutable registrationWorkflows;
    address public immutable licenseAttachmentWorkflows;
    address public immutable derivativeWorkflows;
    address public spgNftContract;

    // ============ State Variables ============

    address public owner;
    uint256 public wipLiquidity;
    uint256 public usdcToWipRate;
    bool public paused;
    uint256 public nextListingId;
    uint256 public nextLicenseListingId;

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

    struct Listing {
        uint256 listingId;
        address storyIPId;
        address creator;
        string title;
        string description;
        string category;
        uint256 priceUSDC;
        string assetIpfsHash;
        string metadataUri;
        uint32 sourceChain;
        bool isActive;
        uint256 createdAt;
        uint256 totalUses;
    }

    struct LicenseTokenListing {
        uint256 listingId;
        uint256 licenseTokenId;
        address seller;
        uint256 priceUSDC;
        bool isActive;
        uint256 createdAt;
    }

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
    mapping(uint256 => LicenseTokenListing) public licenseListings;
    mapping(address => uint256[]) public licenseListingsBySeller;
    mapping(address => address) public creatorCollections;

    // ============ Events ============

    event LicenseMinted(bytes32 indexed messageId, address indexed ipId, address indexed recipient, uint256 licenseTokenId, uint256 wipAmount);
    event DerivativeCreated(bytes32 indexed messageId, address indexed parentIpId, address indexed derivativeIpId, uint256 wipAmount);
    event IPRegistered(bytes32 indexed messageId, address indexed nftContract, uint256 indexed tokenId, address ipId);
    event IPMintedAndRegistered(bytes32 indexed messageId, address indexed ipId, address indexed creator, uint256 tokenId, uint256[] licenseTermsIds);
    event LicenseTransferred(bytes32 indexed messageId, uint256 indexed licenseTokenId, address indexed from, address to);
    event DisputeRaised(bytes32 indexed messageId, uint256 indexed disputeId, address indexed targetIpId, address disputant, uint256 bondAmount);
    event PaymentFailed(bytes32 indexed messageId, uint8 operationType, string reason);
    event PaymentReceived(bytes32 indexed messageId, address indexed payer, address indexed ipId, uint256 usdcAmount, uint256 wipAmount);
    event WIPDeposited(address indexed depositor, uint256 amount, uint256 newLiquidity);
    event WIPWithdrawn(address indexed recipient, uint256 amount, uint256 newLiquidity);
    event USDCWithdrawn(address indexed recipient, uint256 amount);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event ListingCreated(uint256 indexed listingId, address indexed storyIPId, address indexed creator, uint256 priceUSDC, uint32 sourceChain, string title, string category);
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
    event ListingDeactivated(uint256 indexed listingId);
    event ListingUsed(uint256 indexed listingId, address indexed user, uint256 paymentAmount);
    event TrustedDomainUpdated(uint32 indexed domain, bytes32 sender, bool enabled);
    event SpgNftContractUpdated(address indexed oldContract, address indexed newContract);
    event CollectionCreated(bytes32 indexed messageId, address indexed creator, address indexed collection);
    event LicenseTokenListed(uint256 indexed listingId, uint256 indexed licenseTokenId, address indexed seller, uint256 price);
    event LicenseListingPurchased(uint256 indexed listingId, address indexed buyer, uint256 paymentAmount);
    event LicenseMintedWithFee(bytes32 indexed messageId, address indexed ipId, address indexed recipient, uint256 licenseTokenId, uint256 mintingFee);
    event DerivativeCreatedWithLicense(bytes32 indexed messageId, address indexed derivativeIpId, address indexed creator, uint256 tokenId);

    // ============ Errors ============

    error OnlyOwner();
    error OnlyMailbox();
    error InvalidOrigin();
    error UntrustedSender();
    error InsufficientLiquidity();
    error InvalidAmount();
    error InvalidRate();
    error ContractPaused();
    error PaymentAlreadyProcessed();
    error ZeroAddress();
    error ListingNotFound();
    error ListingNotActive();
    error ArrayLengthMismatch();
    error SpgNftContractNotSet();
    error LicenseListingNotFound();
    error LicenseListingNotActive();
    error LicenseNotInEscrow();
    error CollectionAlreadyExists();
    error OperationFailed();

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
        address _registrationWorkflows,
        address _licenseAttachmentWorkflows,
        address _derivativeWorkflows,
        uint256 _initialRate
    ) {
        if (_mailbox == address(0) || _usdc == address(0) || _wip == address(0)) revert ZeroAddress();
        if (_royaltyModule == address(0) || _licensingModule == address(0)) revert ZeroAddress();
        if (_pilTemplate == address(0) || _ipAssetRegistry == address(0)) revert ZeroAddress();
        if (_disputeModule == address(0) || _licenseToken == address(0)) revert ZeroAddress();
        if (_registrationWorkflows == address(0) || _licenseAttachmentWorkflows == address(0)) revert ZeroAddress();
        if (_derivativeWorkflows == address(0)) revert ZeroAddress();
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
        registrationWorkflows = _registrationWorkflows;
        licenseAttachmentWorkflows = _licenseAttachmentWorkflows;
        derivativeWorkflows = _derivativeWorkflows;
        usdcToWipRate = _initialRate;
        owner = msg.sender;
        nextListingId = 1;
        nextLicenseListingId = 1;
    }

    // ============ External Functions ============

    function handle(uint32 _origin, bytes32 _sender, bytes calldata _message) external onlyMailbox whenNotPaused {
        DomainConfig memory config = trustedDomains[_origin];
        if (!config.enabled) revert InvalidOrigin();
        if (_sender != config.trustedSender) revert UntrustedSender();

        uint8 opType = uint8(_message[0]);
        bytes memory payload = _message[1:];

        if (opType == OP_MINT_LICENSE) _handleMintLicense(payload);
        else if (opType == OP_CREATE_DERIVATIVE) _handleCreateDerivative(payload);
        else if (opType == OP_REGISTER_IP) _handleRegisterIP(payload);
        else if (opType == OP_TRANSFER_LICENSE) _handleTransferLicense(payload);
        else if (opType == OP_RAISE_DISPUTE) _handleRaiseDispute(payload);
        else if (opType == OP_CREATE_LISTING) _handleCreateListing(payload, _origin);
        else if (opType == OP_UPDATE_LISTING) _handleUpdateListing(payload);
        else if (opType == OP_DEACTIVATE_LISTING) _handleDeactivateListing(payload);
        else if (opType == OP_MINT_AND_REGISTER_IP) _handleMintAndRegisterIP(payload);
        else if (opType == OP_CREATE_COLLECTION) _handleCreateCollection(payload);
        else if (opType == OP_LIST_LICENSE_TOKEN) _handleListLicenseToken(payload);
        else if (opType == OP_PURCHASE_LICENSE_LISTING) _handlePurchaseLicenseListing(payload);
        else if (opType == OP_MINT_LICENSE_WITH_FEE) _handleMintLicenseWithFee(payload);
        else if (opType == OP_CREATE_DERIVATIVE_WITH_LICENSE) _handleCreateDerivativeWithLicense(payload);
    }

    function setTrustedDomain(uint32 domain, bytes32 sender, bool enabled) external onlyOwner {
        trustedDomains[domain] = DomainConfig({ enabled: enabled, trustedSender: sender });
        emit TrustedDomainUpdated(domain, sender, enabled);
    }

    function setTrustedDomainsBatch(uint32[] calldata domains, bytes32[] calldata senders, bool[] calldata enabledFlags) external onlyOwner {
        if (domains.length != senders.length || domains.length != enabledFlags.length) revert ArrayLengthMismatch();
        for (uint256 i = 0; i < domains.length; i++) {
            trustedDomains[domains[i]] = DomainConfig({ enabled: enabledFlags[i], trustedSender: senders[i] });
            emit TrustedDomainUpdated(domains[i], senders[i], enabledFlags[i]);
        }
    }

    function depositWIP(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        wip.safeTransferFrom(msg.sender, address(this), amount);
        wipLiquidity += amount;
        emit WIPDeposited(msg.sender, amount, wipLiquidity);
    }

    function withdrawWIP(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (wipLiquidity < amount) revert InsufficientLiquidity();
        wipLiquidity -= amount;
        wip.safeTransfer(owner, amount);
        emit WIPWithdrawn(owner, amount, wipLiquidity);
    }

    function withdrawUSDC(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        if (usdc.balanceOf(address(this)) < amount) revert InsufficientLiquidity();
        usdc.safeTransfer(owner, amount);
        emit USDCWithdrawn(owner, amount);
    }

    function setExchangeRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert InvalidRate();
        uint256 oldRate = usdcToWipRate;
        usdcToWipRate = newRate;
        emit ExchangeRateUpdated(oldRate, newRate);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function pause() external onlyOwner { paused = true; emit Paused(msg.sender); }
    function unpause() external onlyOwner { paused = false; emit Unpaused(msg.sender); }

    function setSpgNftContract(address _spgNftContract) external onlyOwner {
        if (_spgNftContract == address(0)) revert ZeroAddress();
        address oldContract = spgNftContract;
        spgNftContract = _spgNftContract;
        emit SpgNftContractUpdated(oldContract, _spgNftContract);
    }

    function grantMinterRoleToWorkflows() external onlyOwner {
        if (spgNftContract == address(0)) revert SpgNftContractNotSet();
        ISPGNFT(spgNftContract).grantRole(keccak256("MINTER_ROLE"), licenseAttachmentWorkflows);
    }

    function depositLicenseToEscrow(uint256 licenseTokenId) external {
        ILicenseToken(licenseToken).transferFrom(msg.sender, address(this), licenseTokenId);
    }

    function withdrawLicenseFromEscrow(uint256 licenseTokenId, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        ILicenseToken(licenseToken).transferFrom(address(this), recipient, licenseTokenId);
    }

    // ============ View Functions ============

    function calculateWIPAmount(uint256 usdcAmount) public view returns (uint256) {
        return (usdcAmount * usdcToWipRate) / 1e6;
    }

    function getPayment(bytes32 messageId) external view returns (PaymentRecord memory) {
        return payments[messageId];
    }

    function checkLiquidity(uint256 usdcAmount) external view returns (bool hasLiquidity, uint256 requiredWIP) {
        requiredWIP = calculateWIPAmount(usdcAmount);
        hasLiquidity = wipLiquidity >= requiredWIP;
    }

    function isDomainTrusted(uint32 domain) external view returns (bool) {
        return trustedDomains[domain].enabled;
    }

    function getDomainConfig(uint32 domain) external view returns (bool enabled, bytes32 sender) {
        DomainConfig memory config = trustedDomains[domain];
        return (config.enabled, config.trustedSender);
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getListingsByCreator(address creator) external view returns (uint256[] memory) {
        return listingsByCreator[creator];
    }

    function getListingsByIPId(address ipId) external view returns (uint256[] memory) {
        return listingsByIPId[ipId];
    }

    function getLicenseListing(uint256 listingId) external view returns (LicenseTokenListing memory) {
        return licenseListings[listingId];
    }

    function getLicenseListingsBySeller(address seller) external view returns (uint256[] memory) {
        return licenseListingsBySeller[seller];
    }

    function getCreatorCollection(address creator) external view returns (address) {
        return creatorCollections[creator];
    }

    // ============ Internal Handlers ============

    function _handleMintLicense(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address ipId, uint256 licenseTermsId, uint256 usdcAmount, address recipient, uint256 listingId) =
            abi.decode(payload, (bytes32, address, uint256, uint256, address, uint256));

        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        uint256 wipAmount = calculateWIPAmount(usdcAmount);
        if (wipLiquidity < wipAmount) { emit PaymentFailed(messageId, OP_MINT_LICENSE, "Low liquidity"); return; }

        wipLiquidity -= wipAmount;
        payments[messageId] = PaymentRecord(recipient, ipId, licenseTermsId, usdcAmount, wipAmount, OP_MINT_LICENSE, false, block.timestamp);
        emit PaymentReceived(messageId, recipient, ipId, usdcAmount, wipAmount);

        wip.approve(royaltyModule, wipAmount);
        try IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(ipId, address(0), address(wip), wipAmount) {
            try ILicensingModule(licensingModule).mintLicenseTokens(ipId, pilTemplate, licenseTermsId, 1, recipient, "") returns (uint256 tokenId) {
                payments[messageId].processed = true;
                emit LicenseMinted(messageId, ipId, recipient, tokenId, wipAmount);
                if (listingId > 0 && listingId < nextListingId && listings[listingId].isActive) {
                    listings[listingId].totalUses++;
                    emit ListingUsed(listingId, recipient, usdcAmount);
                }
            } catch { wipLiquidity += wipAmount; emit PaymentFailed(messageId, OP_MINT_LICENSE, "Mint failed"); }
        } catch { wipLiquidity += wipAmount; emit PaymentFailed(messageId, OP_MINT_LICENSE, "Royalty failed"); }
    }

    function _handleCreateDerivative(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address parentIpId, uint256 licenseTermsId, uint256 usdcAmount, uint256 chainId, address nftContract, uint256 tokenId) =
            abi.decode(payload, (bytes32, address, uint256, uint256, uint256, address, uint256));

        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        uint256 wipAmount = calculateWIPAmount(usdcAmount);
        if (wipLiquidity < wipAmount) { emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Low liquidity"); return; }

        wipLiquidity -= wipAmount;
        payments[messageId] = PaymentRecord(address(0), parentIpId, licenseTermsId, usdcAmount, wipAmount, OP_CREATE_DERIVATIVE, false, block.timestamp);
        emit PaymentReceived(messageId, address(0), parentIpId, usdcAmount, wipAmount);

        wip.approve(royaltyModule, wipAmount);
        try IRoyaltyModule(royaltyModule).payRoyaltyOnBehalf(parentIpId, address(0), address(wip), wipAmount) {
            address derivativeIpId = IIPAssetRegistry(ipAssetRegistry).register(chainId, nftContract, tokenId);
            address[] memory parentIds = new address[](1); parentIds[0] = parentIpId;
            uint256[] memory termIds = new uint256[](1); termIds[0] = licenseTermsId;
            IIPAssetRegistry(ipAssetRegistry).registerDerivative(derivativeIpId, parentIds, termIds, pilTemplate, "");
            payments[messageId].processed = true;
            emit DerivativeCreated(messageId, parentIpId, derivativeIpId, wipAmount);
        } catch { wipLiquidity += wipAmount; emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE, "Failed"); }
    }

    function _handleRegisterIP(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address nftContract, uint256 tokenId, ) = abi.decode(payload, (bytes32, address, uint256, address));
        try IIPAssetRegistry(ipAssetRegistry).register(block.chainid, nftContract, tokenId) returns (address ipId) {
            emit IPRegistered(messageId, nftContract, tokenId, ipId);
        } catch { emit PaymentFailed(messageId, OP_REGISTER_IP, "Failed"); }
    }

    function _handleTransferLicense(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, uint256 licenseTokenId, address from, address to) = abi.decode(payload, (bytes32, uint256, address, address));
        if (ILicenseToken(licenseToken).ownerOf(licenseTokenId) != address(this)) {
            emit PaymentFailed(messageId, OP_TRANSFER_LICENSE, "Not in escrow"); return;
        }
        try ILicenseToken(licenseToken).transferFrom(address(this), to, licenseTokenId) {
            emit LicenseTransferred(messageId, licenseTokenId, from, to);
        } catch { emit PaymentFailed(messageId, OP_TRANSFER_LICENSE, "Failed"); }
    }

    function _handleRaiseDispute(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address targetIpId, bytes32 evidenceHash, bytes32 disputeTag, uint256 bondAmount, address disputant) =
            abi.decode(payload, (bytes32, address, bytes32, bytes32, uint256, address));

        if (wipLiquidity < bondAmount) { emit PaymentFailed(messageId, OP_RAISE_DISPUTE, "Low liquidity"); return; }
        wipLiquidity -= bondAmount;
        wip.approve(disputeModule, bondAmount);

        try IDisputeModule(disputeModule).raiseDispute(targetIpId, evidenceHash, disputeTag, "") returns (uint256 disputeId) {
            emit DisputeRaised(messageId, disputeId, targetIpId, disputant, bondAmount);
        } catch { wipLiquidity += bondAmount; emit PaymentFailed(messageId, OP_RAISE_DISPUTE, "Failed"); }
    }

    function _handleCreateListing(bytes memory payload, uint32 sourceChain) internal {
        (address storyIPId, address creator, string memory title, string memory description, string memory category, uint256 priceUSDC, string memory assetIpfsHash, string memory metadataUri) =
            abi.decode(payload, (address, address, string, string, string, uint256, string, string));

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing(listingId, storyIPId, creator, title, description, category, priceUSDC, assetIpfsHash, metadataUri, sourceChain, true, block.timestamp, 0);
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

    function _handleMintAndRegisterIP(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address creator, string memory ipMetadataUri, string memory nftMetadataUri, bytes memory encodedLicenseTerms, bytes memory collectionParams) =
            abi.decode(payload, (bytes32, address, string, string, bytes, bytes));

        address targetCollection = creatorCollections[creator];
        if (targetCollection == address(0) && collectionParams.length > 0) {
            try IPayLib.createCollection(registrationWorkflows, creator, collectionParams) returns (address c) {
                creatorCollections[creator] = c;
                targetCollection = c;
                emit CollectionCreated(messageId, creator, c);
            } catch { emit PaymentFailed(messageId, OP_MINT_AND_REGISTER_IP, "Collection failed"); return; }
        }
        if (targetCollection == address(0)) targetCollection = spgNftContract;
        if (targetCollection == address(0)) revert SpgNftContractNotSet();

        IPayLib.MintAndRegisterParams memory params = IPayLib.MintAndRegisterParams(messageId, creator, ipMetadataUri, nftMetadataUri, encodedLicenseTerms, targetCollection);
        try IPayLib.executeMintAndRegister(params, licenseAttachmentWorkflows) returns (address ipId, uint256 tokenId, uint256[] memory licenseTermsIds) {
            emit IPMintedAndRegistered(messageId, ipId, creator, tokenId, licenseTermsIds);
        } catch { emit PaymentFailed(messageId, OP_MINT_AND_REGISTER_IP, "Failed"); }
    }

    function _handleCreateCollection(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address creator, string memory name, string memory symbol, string memory baseURI, string memory contractURI, uint32 maxSupply) =
            abi.decode(payload, (bytes32, address, string, string, string, string, uint32));

        if (creatorCollections[creator] != address(0)) revert CollectionAlreadyExists();

        bytes memory collectionParams = abi.encode(name, symbol, baseURI, contractURI, maxSupply);
        try IPayLib.createCollection(registrationWorkflows, creator, collectionParams) returns (address c) {
            creatorCollections[creator] = c;
            emit CollectionCreated(messageId, creator, c);
        } catch { emit PaymentFailed(messageId, OP_CREATE_COLLECTION, "Failed"); }
    }

    function _handleListLicenseToken(bytes memory payload) internal nonReentrant {
        (uint256 licenseTokenId, address seller, uint256 priceUSDC) = abi.decode(payload, (uint256, address, uint256));
        if (ILicenseToken(licenseToken).ownerOf(licenseTokenId) != address(this)) revert LicenseNotInEscrow();

        uint256 listingId = nextLicenseListingId++;
        licenseListings[listingId] = LicenseTokenListing(listingId, licenseTokenId, seller, priceUSDC, true, block.timestamp);
        licenseListingsBySeller[seller].push(listingId);
        emit LicenseTokenListed(listingId, licenseTokenId, seller, priceUSDC);
    }

    function _handlePurchaseLicenseListing(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, uint256 listingId, address buyer, uint256 usdcAmount) = abi.decode(payload, (bytes32, uint256, address, uint256));
        if (listingId == 0 || listingId >= nextLicenseListingId) revert LicenseListingNotFound();
        LicenseTokenListing storage listing = licenseListings[listingId];
        if (!listing.isActive) revert LicenseListingNotActive();

        try ILicenseToken(licenseToken).transferFrom(address(this), buyer, listing.licenseTokenId) {
            listing.isActive = false;
            emit LicenseListingPurchased(listingId, buyer, usdcAmount);
        } catch { emit PaymentFailed(messageId, OP_PURCHASE_LICENSE_LISTING, "Failed"); }
    }

    function _handleMintLicenseWithFee(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address ipId, uint256 licenseTermsId, uint256 usdcAmount, address recipient, uint256 maxMintingFee, uint32 maxRevenueShare) =
            abi.decode(payload, (bytes32, address, uint256, uint256, address, uint256, uint32));

        if (payments[messageId].processed) revert PaymentAlreadyProcessed();

        uint256 wipAmount = calculateWIPAmount(usdcAmount);
        if (wipLiquidity < wipAmount) { emit PaymentFailed(messageId, OP_MINT_LICENSE_WITH_FEE, "Low liquidity"); return; }

        wipLiquidity -= wipAmount;
        wip.approve(licensingModule, wipAmount);
        payments[messageId] = PaymentRecord(recipient, ipId, licenseTermsId, usdcAmount, wipAmount, OP_MINT_LICENSE_WITH_FEE, false, block.timestamp);

        try IPayLib.executeMintLicenseWithFee(licensingModule, pilTemplate, ipId, licenseTermsId, recipient, maxMintingFee, maxRevenueShare) returns (uint256 tokenId) {
            payments[messageId].processed = true;
            emit LicenseMintedWithFee(messageId, ipId, recipient, tokenId, maxMintingFee);
        } catch { wipLiquidity += wipAmount; emit PaymentFailed(messageId, OP_MINT_LICENSE_WITH_FEE, "Failed"); }
    }

    function _handleCreateDerivativeWithLicense(bytes memory payload) internal nonReentrant {
        (bytes32 messageId, address creator, uint256[] memory licenseTokenIds, string memory ipMetadataUri, string memory nftMetadataUri, address collectionAddress) =
            abi.decode(payload, (bytes32, address, uint256[], string, string, address));

        address targetCollection = collectionAddress;
        if (targetCollection == address(0)) {
            targetCollection = creatorCollections[creator];
            if (targetCollection == address(0)) targetCollection = spgNftContract;
        }
        if (targetCollection == address(0)) revert SpgNftContractNotSet();

        IPayLib.DerivativeWithLicenseParams memory params = IPayLib.DerivativeWithLicenseParams(messageId, creator, licenseTokenIds, ipMetadataUri, nftMetadataUri, targetCollection);
        try IPayLib.executeDerivativeWithLicense(params, derivativeWorkflows) returns (address ipId, uint256 tokenId) {
            emit DerivativeCreatedWithLicense(messageId, ipId, creator, tokenId);
        } catch { emit PaymentFailed(messageId, OP_CREATE_DERIVATIVE_WITH_LICENSE, "Failed"); }
    }
}
