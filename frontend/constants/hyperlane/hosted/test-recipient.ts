// =============================================================================
// Hyperlane Hosted - TestRecipient Addresses
// =============================================================================
// Source: https://docs.hyperlane.xyz/docs/reference/contract-addresses
// Last updated: 2025-12-12
// =============================================================================

import type { Address } from 'viem'

/**
 * TestRecipient contract addresses for official Hyperlane deployments
 * Key: chainId, Value: TestRecipient address
 *
 * Note: Some chains use domainId different from chainId.
 * See chain-metadata.ts for the mapping.
 */
export const HOSTED_TEST_RECIPIENT: Record<number, Address> = {
  // =============================================================================
  // MAINNETS
  // =============================================================================

  // Abstract (2741)
  2741: '0xCDfE1782fDC9E74810D3B69E971d752bC4b4D6E6',

  // ADI Chain (36900)
  36900: '0x7B8AA8f23Ab6B0757eC6FC71894211376D9335b0',

  // Ancient8 (888888888)
  888888888: '0x2Fa570E83009eaEef3a1cbd496a9a30F05266634',

  // ApeChain (33139)
  33139: '0x783EC5e105234a570eB90f314284E5dBe53bdd90',

  // AppChain (466)
  466: '0xeF7F4367703cdf4863AD6Be34C1627d8b1C2D67a',

  // Arbitrum (42161)
  42161: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Arbitrum Nova (42170)
  42170: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Arcadia (4278608)
  4278608: '0x2D374F85AE2B80147CffEb34d294ce02d1afd4D8',

  // Artela (11820)
  11820: '0xa2401b57A8CCBF6AbD9b7e62e28811b2b523AB2B',

  // Astar (592)
  592: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Aurora (1313161554)
  1313161554: '0x65dCf8F6b3f6a0ECEdf3d0bdCB036AEa47A1d615',

  // Avalanche (43114)
  43114: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // B3 (8333)
  8333: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Base (8453)
  8453: '0xb7C9307fE90B9AB093c6D3EdeE3259f5378D5f03',

  // Berachain (80094)
  80094: '0x82540c4C1C6956FC4815E583DDc6d88A782E0F3e',

  // Bitlayer (200901)
  200901: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Blast (81457)
  81457: '0x17E216fBb22dF4ef8A6640ae9Cb147C92710ac84',

  // BOB (60808)
  60808: '0xe03dad16074BC5EEA9A9311257BF02Eb0B6AAA2b',

  // Boba Mainnet (288)
  288: '0xbB88a31E4b709b645c06825c0E0b5CAC906d97DE',

  // Botanix (3637)
  3637: '0x779B6a921a41ceaFbAE2e2A59B5dFfB951f8C9c8',

  // Binance Smart Chain (56)
  56: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // B² Network (223)
  223: '0x0F9d4704E1Fb25e416042524e594F1cEac6fF597',

  // CarrChain (7667)
  7667: '0x5244d3359065C883BDfeEEff5329DE38c0Bd227e',

  // Celo (42220)
  42220: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Chiliz (88888) - Note: domainId is 1000088888
  88888: '0xE67Dc24970B482579923551Ede52BD35a2858989',

  // Core (1116)
  1116: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Coti (2632500)
  2632500: '0x2ed6030D204745aC0Cd6be8301C3a63bf14D97Cc',

  // Cyber (7560)
  7560: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Degen (666666666)
  666666666: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Dogechain (2000)
  2000: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Electroneum (52014)
  52014: '0x6D48135b7584E8Bf828B6e23110Bc0Da4252704f',

  // Endurance (648)
  648: '0xD670c00C0Cad3D32436d7cF270e739772314A8CE',

  // Ethereum (1)
  1: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Everclear (25327)
  25327: '0xF15D70941dE2Bf95A23d6488eBCbedE0a444137f',

  // Fantom Opera (250)
  250: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Flare (14)
  14: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // EVM on Flow (747) - Note: domainId is 1000000747
  747: '0xa7028308Ff277DB5851a95d82ED5C5256bB721F2',

  // Fluence (9999999)
  9999999: '0xF9aE87E9ACE51aa16AED25Ca38F17D258aECb73f',

  // Form (478)
  478: '0x4Ee9dEBB3046139661b51E17bdfD54Fd63211de7',

  // Fraxtal (252)
  252: '0x62B7592C1B6D1E43f4630B8e37f4377097840C05',

  // Fuse (122)
  122: '0x83475ca5bEB2Eaa59A2FF48a0544ebaa4a32c2de',

  // Galactica (613419)
  613419: '0xc8826EA18D9884A1A335b2Cd7d5f44B159084301',

  // Gnosis (100)
  100: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Gravity Alpha Mainnet (1625)
  1625: '0x60B8d195f1b2EcaC26d54b95C69E6399cFD64b53',

  // Harmony One (1666600000)
  1666600000: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Hashkey (177)
  177: '0xD233433AeC23F8382DAd87D808F60557Ea35399f',

  // Hemi Network (43111)
  43111: '0xa2401b57A8CCBF6AbD9b7e62e28811b2b523AB2B',

  // HyperEVM (999)
  999: '0x4eB0d97B48711950ecB01871125c4523939c6Fce',

  // Immutable zkEVM (13371) - Note: domainId is 1000013371
  13371: '0x01EBa6D613DC09Cb899aF1e8E8a747416d7250ad',

  // Incentiv (24101)
  24101: '0x5244d3359065C883BDfeEEff5329DE38c0Bd227e',

  // Ink (57073)
  57073: '0x65dCf8F6b3f6a0ECEdf3d0bdCB036AEa47A1d615',

  // Kaia (8217)
  8217: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Katana (747474)
  747474: '0x779B6a921a41ceaFbAE2e2A59B5dFfB951f8C9c8',

  // LazAI (52924)
  52924: '0x2ed6030D204745aC0Cd6be8301C3a63bf14D97Cc',

  // Linea (59144)
  59144: '0x273Bc6b01D9E88c064b6E5e409BdF998246AEF42',

  // Lisk (1135)
  1135: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Lit Chain (175200)
  175200: '0x89Ebf977E83087959aD78e5372F4AF15DcdC8143',

  // LUKSO (42)
  42: '0x4E55aDA3ef1942049EA43E904EB01F4A0a9c39bd',

  // Lumia Prism (994873017) - Note: domainId is 1000073017
  994873017: '0x128Ff1d24665d55f4b77B1FDbb6d8D0Ec4a0c0a1',

  // Manta Pacific (169)
  169: '0x4E1c88DD261BEe2941e6c1814597e30F53330428',

  // Mantle (5000)
  5000: '0x62B7592C1B6D1E43f4630B8e37f4377097840C05',

  // Mantra (5888)
  5888: '0x89Ebf977E83087959aD78e5372F4AF15DcdC8143',

  // Matchain (698)
  698: '0xFa6fDABA1d0688675f05cE1B9DE17461247Bce9e',

  // MegaETH (4326)
  4326: '0xF9aE87E9ACE51aa16AED25Ca38F17D258aECb73f',

  // Merlin (4200)
  4200: '0xc401e251CCa7A364114504A994D6fC7cb1c243AB',

  // Metal L2 (1750) - Note: domainId is 1000001750
  1750: '0xc4D0b4ef01eD7091792fe3D4c039457719e2DC68',

  // Metis Andromeda (1088)
  1088: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Mint (185)
  185: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Miraclechain (92278)
  92278: '0xc8826EA18D9884A1A335b2Cd7d5f44B159084301',

  // Mitosis (124816)
  124816: '0x72246331d057741008751AB3976a8297Ce7267Bc',

  // Mode (34443)
  34443: '0x12582c7B0f43c6A667CBaA7fA8b112F7fb1E69F0',

  // Molten (360)
  360: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Monad (143)
  143: '0x284226F651eb5cbd696365BC27d333028FCc5D54',

  // Moonbeam (1284)
  1284: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Morph (2818)
  2818: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Nibiru (6900)
  6900: '0xBCD18636e5876DFd7AAb5F2B2a5Eb5ca168BA1d8',

  // Ontology (58)
  58: '0xdBa3b98DC83fec149c8C8F6617700b9e45937a2b',

  // Oort (970)
  970: '0x58556AaeB2e3829d52EE5E711D44735412efA43B',

  // opBNB (204)
  204: '0x76F2cC245882ceFf209A61d75b9F0f1A3b7285fB',

  // Optimism (10)
  10: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Orderly L2 (291)
  291: '0xcDA455DfD9C938451BfaFC6FF0D497c8C0469C96',

  // Peaq (3338)
  3338: '0xF9aE87E9ACE51aa16AED25Ca38F17D258aECb73f',

  // Plasma (9745)
  9745: '0x6D48135b7584E8Bf828B6e23110Bc0Da4252704f',

  // Plume (98866)
  98866: '0x8D8979F2C29bA49FAb259A826D0271c43F70288c',

  // Polygon (137)
  137: '0x36FdA966CfffF8a9Cdc814f546db0e6378bFef35',

  // Polygon zkEVM (1101)
  1101: '0xD127D4549cb4A5B2781303a4fE99a10EAd13263A',

  // Polynomial (8008) - Note: domainId is 1000008008
  8008: '0xa1c3884EbE24Cccb120B2E98a55f85140563aa4C',

  // Prom (227)
  227: '0x83f647970B213675412b76e1cCDB55D0e35365fD',

  // PulseChain (369)
  369: '0x08462526f57DADfc371bc0c0cb3227eBb4576a7c',

  // RARI Chain (1380012617) - Note: domainId is 1000012617
  1380012617: '0xCE8260c1b5cF2fAD15bb4B6542716b050Fdf35c9',

  // Reactive Mainnet (1597)
  1597: '0x76F2cC245882ceFf209A61d75b9F0f1A3b7285fB',

  // Redstone (690)
  690: '0x1Ab68dC4f7b6cfcd00218D4b761b7F3b5a724555',

  // Ronin (2020)
  2020: '0x51545389E04c2Ac07d98A40b85d29B480a2AF6ce',

  // Scroll (534352)
  534352: '0x674f4698d063cE4C0d604c88dD7D542De72f327f',

  // Sei (1329)
  1329: '0xdB670e1a1e312BF17425b08cE55Bdf2cD8F8eD54',

  // Shibarium (109)
  109: '0xbB22547D1dc681fe925f568f637Ff67aC06c20fc',

  // Somnia (5031)
  5031: '0x55Dc6325F6eA1DDa5286257E1e8EE4E1d281bD8D',

  // Soneium (1868)
  1868: '0x4Ee9dEBB3046139661b51E17bdfD54Fd63211de7',

  // Sonic (146)
  146: '0x4Ee9dEBB3046139661b51E17bdfD54Fd63211de7',

  // Sophon (50104)
  50104: '0xB35eCb9714e8f48332Af22B48C18ca21E2607438',

  // Stable (988)
  988: '0x794Fe7970EE45945b0ad2667f99A5bBc9ddfB5d7',

  // Story Mainnet (1514)
  1514: '0x51545389E04c2Ac07d98A40b85d29B480a2AF6ce',

  // Subtensor (964)
  964: '0xcDD89f19b2d00DCB9510BB3fBd5eCeCa761fe5Ab',

  // Superposition (55244) - Note: domainId is 1000055244
  55244: '0x545E289B88c6d97b74eC0B96e308cae46Bf5f832',

  // Superseed (5330)
  5330: '0xbB88a31E4b709b645c06825c0E0b5CAC906d97DE',

  // Swell (1923)
  1923: '0xBC53dACd8c0ac0d2bAC461479EAaf5519eCC8853',

  // TAC (239)
  239: '0x2f4Eb04189e11Af642237Da62d163Ab714614498',

  // Taiko (167000)
  167000: '0x5fC427653b175F6De5A494DE17d1c7636d7E7965',

  // Tangle (5845)
  5845: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // Torus (21000)
  21000: '0x92249B8ed35C2980e58666a3EBF4a075DDD2895f',

  // Unichain (130)
  130: '0xbB88a31E4b709b645c06825c0E0b5CAC906d97DE',

  // Vana (1480)
  1480: '0xbB88a31E4b709b645c06825c0E0b5CAC906d97DE',

  // Viction (88)
  88: '0x17E216fBb22dF4ef8A6640ae9Cb147C92710ac84',

  // World Chain (480)
  480: '0x4848d54987ffc732aD313827cdC25DF2eedD79d8',

  // Xai (660279)
  660279: '0x2c61Cda929e4e2174cb10cd8e2724A9ceaD62E67',

  // XLayer (196)
  196: '0x4848d54987ffc732aD313827cdC25DF2eedD79d8',

  // XRPL EVM (1440000)
  1440000: '0xc8826EA18D9884A1A335b2Cd7d5f44B159084301',

  // 0G (16661)
  16661: '0xc8826EA18D9884A1A335b2Cd7d5f44B159084301',

  // Zero Network (543210)
  543210: '0xC18bE7ac43334F501fd9622877160b085215dECC',

  // ZetaChain (7000)
  7000: '0x12582c7B0f43c6A667CBaA7fA8b112F7fb1E69F0',

  // Zircuit (48900)
  48900: '0xA34ceDf9068C5deE726C67A4e1DCfCc2D6E2A7fD',

  // zkSync (324)
  324: '0xD55078c54b0cEAa87Ba5c3fAeAC89861c69F636d',

  // Zora (7777777)
  7777777: '0x6119B76720CcfeB3D256EC1b91218EEfFD6756E1',

  // =============================================================================
  // TESTNETS
  // =============================================================================

  // Arbitrum Sepolia (421614)
  421614: '0x6c13643B3927C57DB92c790E4E3E7Ee81e13f78C',

  // Arcadia Testnet v2 (1098411886)
  1098411886: '0xCB3c489a2FB67a7Cd555D47B3a9A0E654784eD16',

  // Aurora Testnet (1313161555)
  1313161555: '0x2C6dD6768E669EDB7b53f26067C1C4534862c3de',

  // Basecamp Testnet (123420001114) - Note: domainId is 1000001114
  123420001114: '0xB6a4129c305056d80fFfea96DdbDCf1F58BC8240',

  // Base Sepolia (84532)
  84532: '0x783c4a0bB6663359281aD4a637D5af68F83ae213',

  // BSC Testnet (97)
  97: '0xfbcD1c00a3d809f36cC1A15918694B17B32c0b6c',

  // CarrChain Testnet (76672)
  76672: '0x48a53E3B176383BC98fcF4a24c9D470c19475164',

  // Celo Sepolia (11142220)
  11142220: '0xdB1a04C9e08cd96c170bFD8C2f1D0F7fAE8aB0f9',

  // Citrea Testnet (5115)
  5115: '0xA2cf52064c921C11adCd83588CbEa08cc3bfF5d8',

  // Coti Testnet (7082400)
  7082400: '0xfc0da0E35Bba1F49318B2207ecaE86eb088dd3Bb',

  // Fuji (43113)
  43113: '0x44a7e1d76fD8AfA244AdE7278336E3D5C658D398',

  // GIWA Sepolia (91342)
  91342: '0x9450181a7719dAb93483d43a45473Ac2373E25B0',

  // Hyperliquid EVM Testnet (998)
  998: '0xB057Fb841027a8554521DcCdeC3c3474CaC99AB5',

  // Incentiv Testnet v2 (28802)
  28802: '0x48c94311789194215Fe19002C2D33681A76d63dF',

  // MegaETH Testnet (6342)
  6342: '0x5B30De0c322F7720D144df2AB2e82b160Eba0EBF',

  // Mode Testnet (919)
  919: '0xF8E6c1222049AAb68E410E43242449994Cb64996',

  // Monad Testnet (10143)
  10143: '0xCCC126d96efcc342BF2781A7d224D3AB1F25B19C',

  // Neura Testnet (267)
  267: '0x3212977FBE6464c2bB60Fdb85ab0a5E06e25cdFB',

  // Optimism Sepolia (11155420)
  11155420: '0x783c4a0bB6663359281aD4a637D5af68F83ae213',

  // Polygon Amoy (80002)
  80002: '0x04438ef7622f5412f82915F59caD4f704C61eA48',

  // Scroll Sepolia (534351)
  534351: '0xa3AB7E6cE24E6293bD5320A53329Ef2f4DE73fCA',

  // Sepolia (11155111)
  11155111: '0xeDc1A3EDf87187085A3ABb7A9a65E1e7aE370C07',

  // Somnia Testnet (50312)
  50312: '0x6cB503d97D1c900316583C8D55997A1f17b1ABd1',

  // Sonic Testnet (64165)
  64165: '0x01812D60958798695391dacF092BAc4a715B1718',

  // SUAVE Toliman Testnet (33626250)
  33626250: '0x7483faD0Bc297667664A43A064bA7c9911659f57',

  // Subtensor Testnet (945)
  945: '0xcCB305B1f21e5FbC85D1DD7Be5cd8d5bf5B7f863',

  // Tangle Testnet (3799)
  3799: '0xE73cdFFcE97AD56723dbA6145a3cC0Dd3aeF112f',
}

// Helper to check if a chain has a hosted test recipient
export const hasHostedTestRecipient = (chainId: number): boolean =>
  chainId in HOSTED_TEST_RECIPIENT

// Helper to get test recipient address
export const getHostedTestRecipient = (chainId: number): Address | undefined =>
  HOSTED_TEST_RECIPIENT[chainId]

// Get all chain IDs with test recipient addresses
export const getHostedTestRecipientChainIds = (): number[] =>
  Object.keys(HOSTED_TEST_RECIPIENT).map(Number)

// Count of supported chains
export const HOSTED_TEST_RECIPIENT_COUNT = Object.keys(HOSTED_TEST_RECIPIENT).length
