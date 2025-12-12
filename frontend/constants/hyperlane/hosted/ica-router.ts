// =============================================================================
// Hyperlane Hosted - Interchain Account Router Addresses
// =============================================================================
// Source: https://docs.hyperlane.xyz/docs/reference/contract-addresses
// Last updated: 2025-12-12
// =============================================================================

import type { Address } from 'viem'

/**
 * InterchainAccountRouter contract addresses for official Hyperlane deployments
 * Key: chainId, Value: ICA Router address
 *
 * Note: Some chains use domainId different from chainId.
 * See chain-metadata.ts for the mapping.
 */
export const HOSTED_ICA_ROUTER: Record<number, Address> = {
  // =============================================================================
  // MAINNETS
  // =============================================================================

  // ADI Chain (36900)
  36900: '0x6c5012B7eDfE317Be53D13Fc730a460f4810e234',

  // Ancient8 (888888888)
  888888888: '0x23C6D8145DDb71a24965AAAdf4CA4B095b4eC85F',

  // ApeChain (33139)
  33139: '0xb347c2cbfc32e0bdf365183635352e0C38c97147',

  // AppChain (466)
  466: '0x24f89395e932961C27167F42DB928Ec92047B695',

  // Arbitrum (42161)
  42161: '0xF90A3d406C6F8321fe118861A357F4D7107760D7',

  // Arbitrum Nova (42170)
  42170: '0xf2F83b26d56f0e9B9Bd81efAb9e0ECB9ba5708be',

  // Arcadia (4278608)
  4278608: '0x87ED6926abc9E38b9C7C19f835B41943b622663c',

  // Artela (11820)
  11820: '0x3A220676CFD4e21726cbF20E8F5df4F138364f69',

  // Astar (592)
  592: '0xC3d9e724c6Bf3c4456EB8572Be05AA52f8acC9Ae',

  // Aurora (1313161554)
  1313161554: '0x0FdAa7296D06bB5E2365c25b2bF3BB8f188Ecf4F',

  // Avalanche (43114)
  43114: '0x2c58687fFfCD5b7043a5bF256B196216a98a6587',

  // B3 (8333)
  8333: '0x0fC7b3518C03BfA5e01995285b1eF3c4B55c8922',

  // Base (8453)
  8453: '0x44647Cd983E80558793780f9a0c7C2aa9F384D07',

  // Berachain (80094)
  80094: '0x84Fcd67D2B723416e2aFDd61484BD19bd9C32f27',

  // Bitlayer (200901)
  200901: '0xE0208ddBe76c703eb3Cd758a76e2c8c1Ff9472fD',

  // Blast (81457)
  81457: '0x7d58D7F052792e54eeEe91B2467c2A17a163227e',

  // BOB (60808)
  60808: '0xA6f0A37DFDe9C2c8F46F010989C47d9edB3a9FA8',

  // Boba Mainnet (288)
  288: '0x625324ebE9Fe13fEDD8ac3761F153b90aa35B404',

  // Botanix (3637)
  3637: '0x21b5a2fA1f53e94cF4871201aeD30C6ad5E405f2',

  // Binance Smart Chain (56)
  56: '0xf453B589F0166b90e050691EAc281C01a8959897',

  // B² Network (223)
  223: '0x9f4012ba9368FBb95F56c2Fc2D956df803D8779e',

  // CarrChain (7667)
  7667: '0xBCD18636e5876DFd7AAb5F2B2a5Eb5ca168BA1d8',

  // Celo (42220)
  42220: '0x1eA7aC243c398671194B7e2C51d76d1a1D312953',

  // Chiliz (88888) - Note: domainId is 1000088888
  88888: '0x246BBe3983C22553362A42aa4B06320E2fB4E880',

  // Core (1116)
  1116: '0xB8736c87da7DEc750fA0226e3bdE1Ac35B88f43d',

  // Coti (2632500)
  2632500: '0x7D5a79539d7B1c9aE5e54d18EEE188840f1Fe4CC',

  // Cyber (7560)
  7560: '0x1B947F6246ACe28abAf073FF11c098F31ce4f899',

  // Degen (666666666)
  666666666: '0xAb65C41a1BC580a52f0b166879122EFdce0cB868',

  // Dogechain (2000)
  2000: '0xe05f59ec3AE5B475050a735522Def832F602152f',

  // Electroneum (52014)
  52014: '0x9fE454AA2B01fc7A2a777AE561bc58Ce560CD5a9',

  // Endurance (648)
  648: '0xB5CA647Fd7b28cb8Ec80144f2C6BAEE2Dfc12E03',

  // Ethereum (1)
  1: '0xC00b94c115742f711a6F9EA90373c33e9B72A4A9',

  // Everclear (25327)
  25327: '0x6FD739221F53F8dc1565F3aF830Cb687cfe5932D',

  // Fantom Opera (250)
  250: '0x01016c0A5118dBD87E34a50fF1a5D8D9306aAa2e',

  // Flare (14)
  14: '0xC1272CCea251c85b7D11eDeD1204a88DEde90f46',

  // EVM on Flow (747) - Note: domainId is 1000000747
  747: '0x1D43Eb638ABF43B4147B7985402a4FfbDd89D4ac',

  // Fluence (9999999)
  9999999: '0x1504Dff2ab3196a41FC0565E41B64247dc405022',

  // Form (478)
  478: '0xab6Ce17c7E323A8962E1BD445097D07C5693fF98',

  // Fraxtal (252)
  252: '0xD59a200cCEc5b3b1bF544dD7439De452D718f594',

  // Fuse (122)
  122: '0xc57fe3d144434d0aBaF8D3698E3103a4ddFD777A',

  // Galactica (613419)
  613419: '0x1fbcCdc677c10671eE50b46C61F0f7d135112450',

  // Gnosis (100)
  100: '0xef0Adeb4103A7A1AcE86371867202f2171126362',

  // Gravity Alpha Mainnet (1625)
  1625: '0x335593971F655220a760837b64fbeABd09dE6dD9',

  // Harmony One (1666600000)
  1666600000: '0xFCfE7344d7a769C89B3A22c596fE83a1bF8458Da',

  // Hashkey (177)
  177: '0xD79A14EA21db52F130A57Ea6e2af55949B00086E',

  // Hemi Network (43111)
  43111: '0x1604d2D3DaFba7D302F86BD7e79B3931414E4625',

  // HyperEVM (999)
  999: '0x1CF975C9bF2DF76c43a14405066007f8393142E9',

  // Immutable zkEVM (13371) - Note: domainId is 1000013371
  13371: '0xE2cBbc708411eAf2DfbaA31DaA531d4FF089d7b0',

  // Incentiv (24101)
  24101: '0xBCD18636e5876DFd7AAb5F2B2a5Eb5ca168BA1d8',

  // Ink (57073)
  57073: '0x55Ba00F1Bac2a47e0A73584d7c900087642F9aE3',

  // Kaia (8217)
  8217: '0xcfe6dBaD47c3B8cf4fecbb28B53Df4617F8538A7',

  // Katana (747474)
  747474: '0xbF2D3b1a37D54ce86d0e1455884dA875a97C87a8',

  // LazAI (52924)
  52924: '0x946E9f4540E032a9fAc038AE58187eFcad9DE952',

  // Linea (59144)
  59144: '0xBfC8DCEf3eFabC064f5afff4Ac875a82D2Dc9E55',

  // Lisk (1135)
  1135: '0xE59592a179c4f436d5d2e4caA6e2750beA4E3166',

  // Lit Chain (175200)
  175200: '0x0DbB60c348DF645c295Fd0ce26F87bB850710185',

  // LUKSO (42)
  42: '0x7e0956bfEE5C4dEAd8Ced283C934299998100362',

  // Lumia Prism (994873017) - Note: domainId is 1000073017
  994873017: '0x3C330D4A2e2b8443AFaB8E326E64ab4251B7Eae0',

  // Manta Pacific (169)
  169: '0x620ffeEB3359649dbE48278d3Cffd00CC36976EA',

  // Mantle (5000)
  5000: '0x31e81982E98F5D321F839E82789b628AedB15751',

  // Mantra (5888)
  5888: '0x0DbB60c348DF645c295Fd0ce26F87bB850710185',

  // Matchain (698)
  698: '0xcb98BD947B58445Fc4815f10285F44De42129918',

  // MegaETH (4326)
  4326: '0xD233433AeC23F8382DAd87D808F60557Ea35399f',

  // Merlin (4200)
  4200: '0xFCfE7344d7a769C89B3A22c596fE83a1bF8458Da',

  // Metal L2 (1750) - Note: domainId is 1000001750
  1750: '0x0b2d429acccAA411b867d57703F88Ed208eC35E4',

  // Metis Andromeda (1088)
  1088: '0x04Bd82Ba84a165BE5D555549ebB9890Bb327336E',

  // Mint (185)
  185: '0x511C21cF98AB0D07a6fB9Fb65E9e66DD483375B5',

  // Miraclechain (92278)
  92278: '0x38D361861d321B8B05de200c61B8F18740Daf4D8',

  // Mitosis (124816)
  124816: '0x1A41a365A693b6A7aED1a46316097d290f569F22',

  // Mode (34443)
  34443: '0x860ec58b115930EcbC53EDb8585C1B16AFFF3c50',

  // Molten (360)
  360: '0xCf42106b85fC72c43Ac4976f20fA2aD7D9592c31',

  // Monad (143)
  143: '0x8452363d5c78bf95538614441Dc8B465e03A89ca',

  // Moonbeam (1284)
  1284: '0x24b900De85479A586aC8568b471AAC1CEeD6370c',

  // Morph (2818)
  2818: '0x36E437699E3658396Bf6229ddDaE54884cf28779',

  // Nibiru (6900)
  6900: '0xd5e0859Cf2e9C790bE6ec4499A39d75Cb84836Dc',

  // Oort (970)
  970: '0x6c3b61e60Ff510E35Ba51D25bb2E0F90B0307E7D',

  // opBNB (204)
  204: '0x8847A94861C299e6AD408923A604dEe057baB5dC',

  // Optimism (10)
  10: '0x3E343D07D024E657ECF1f8Ae8bb7a12f08652E75',

  // Orderly L2 (291)
  291: '0x9121E58Cb02890cEEF1a21EF4B80420eC2b8B61C',

  // Peaq (3338)
  3338: '0xdcA646C56E7768DD11654956adE24bfFf9Ba4893',

  // Plasma (9745)
  9745: '0x9fE454AA2B01fc7A2a777AE561bc58Ce560CD5a9',

  // Plume (98866)
  98866: '0xd9Cc2e652A162bb93173d1c44d46cd2c0bbDA59D',

  // Polygon (137)
  137: '0xd8B641FEb587844854aeC97544ccEA426DFF04a3',

  // Polygon zkEVM (1101)
  1101: '0x0b6C22e18fDcA681049A7ce003372DFfb3C71214',

  // Polynomial (8008) - Note: domainId is 1000008008
  8008: '0x1B947F6246ACe28abAf073FF11c098F31ce4f899',

  // Prom (227)
  227: '0xd5D8c4F78c6B8Dc9A3F4974E89396928FEb7829d',

  // PulseChain (369)
  369: '0x7823Ce52c254F71321a70b2b87EcC63a516008a1',

  // RARI Chain (1380012617) - Note: domainId is 1000012617
  1380012617: '0xecA217aB573506eaB6E51CDD1c3a84B626CDf7b4',

  // Reactive Mainnet (1597)
  1597: '0x2A532fc8cF9a72142eA8753a0d2AB68098C19585',

  // Redstone (690)
  690: '0x27e88AeB8EA4B159d81df06355Ea3d20bEB1de38',

  // Ronin (2020)
  2020: '0xd6b12ecC223b483427ea66B029b4EEfcC1af86DC',

  // Scroll (534352)
  534352: '0x7E4a3CdF715650A2EF407C86186ec8Fd2d1fb46c',

  // Sei (1329)
  1329: '0xA70482D7359816809988AC4053d83F0C8C98D292',

  // Shibarium (109)
  109: '0xa4fc7C90a4D4ae2A11637D04A6c5286E00B4bAA0',

  // Somnia (5031)
  5031: '0x8EC2D100Bc36D80e5C5EF9479Ae5b3eC636a0B46',

  // Soneium (1868)
  1868: '0xc08C1451979e9958458dA3387E92c9Feb1571f9C',

  // Sonic (146)
  146: '0xEfad3f079048bE2765b6bCfAa3E9d99e9A2C3Df6',

  // Stable (988)
  988: '0xF9aE87E9ACE51aa16AED25Ca38F17D258aECb73f',

  // Story Mainnet (1514)
  1514: '0x4ef363Da5bb09CC6aeA16973786963d0C8820778',

  // Subtensor (964)
  964: '0x9097869cb719335f45A069D41dEFAFA2858af676',

  // Superposition (55244) - Note: domainId is 1000055244
  55244: '0x02b833b8a0fB7680e2d233176B54538c81505131',

  // Superseed (5330)
  5330: '0x3CA0e8AEfC14F962B13B40c6c4b9CEE3e4927Ae3',

  // Swell (1923)
  1923: '0x95Fb6Ca1BBF441386b119ad097edcAca3b1C35B7',

  // TAC (239)
  239: '0x829AcBc15a66F6B32a189CFB6451B2Ee583706BA',

  // Taiko (167000)
  167000: '0xEE47aD8f6582CDcBF4B8581A1c3482E72E4DeaBf',

  // Tangle (5845)
  5845: '0xf63Eb8e72Cbc59eC1185620c44050aF266d3eC19',

  // Torus (21000)
  21000: '0xCCceDFFAA987F47D0D3A26430c3d3f3270fE6369',

  // Unichain (130)
  130: '0x43320f6B410322Bf5ca326a0DeAaa6a2FC5A021B',

  // Vana (1480)
  1480: '0x3adf8f4219BdCcd4B727B9dD67E277C58799b57C',

  // World Chain (480)
  480: '0xd55bFDfb3486fE49a0b2E2Af324453452329051F',

  // Xai (660279)
  660279: '0xA8aB763aB8ab133236afc7b31aFC606F268048f5',

  // XLayer (196)
  196: '0x39d3c2Cf646447ee302178EDBe5a15E13B6F33aC',

  // XRPL EVM (1440000)
  1440000: '0xe6fC77B08b457A29747682aB1dBfb32AF4A1A999',

  // 0G (16661)
  16661: '0x23cc88CF424d48fDB05b4f0A8Ff6099aa4D56D8e',

  // ZetaChain (7000)
  7000: '0x6783dC9f1Bf88DC554c8716c4C42C5bf640dDcc8',

  // Zircuit (48900)
  48900: '0xf20414268e76d0e943533aFa1F2b99DBfb4e0F71',

  // Zora (7777777)
  7777777: '0x9e6B1022bE9BBF5aFd152483DAD9b88911bC8611',

  // =============================================================================
  // TESTNETS
  // =============================================================================
  // Note: No testnet ICA Router addresses provided in documentation
}

// Helper to check if a chain has a hosted ICA router
export const hasHostedICARouter = (chainId: number): boolean =>
  chainId in HOSTED_ICA_ROUTER

// Helper to get ICA router address
export const getHostedICARouter = (chainId: number): Address | undefined =>
  HOSTED_ICA_ROUTER[chainId]

// Get all chain IDs with ICA router addresses
export const getHostedICARouterChainIds = (): number[] =>
  Object.keys(HOSTED_ICA_ROUTER).map(Number)

// Count of supported chains
export const HOSTED_ICA_ROUTER_COUNT = Object.keys(HOSTED_ICA_ROUTER).length
