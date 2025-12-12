// =============================================================================
// Hyperlane Hosted - Chain Metadata
// =============================================================================
// Non-address chain information for hosted Hyperlane deployments
// Last updated: 2025-01-12
// =============================================================================

import type { ChainMetadata } from '../types'

/**
 * Chain metadata for official Hyperlane deployments
 * Key: chainId, Value: Chain metadata (name, isTestnet, etc.)
 *
 * Note: Some chains have domainId different from chainId.
 * This is intentional and matches Hyperlane's registry.
 */
export const HOSTED_CHAIN_METADATA: Record<number, ChainMetadata> = {
  // =============================================================================
  // MAINNETS
  // =============================================================================

  // Abstract
  2741: {
    chainId: 2741,
    chainName: 'abstract',
    displayName: 'Abstract',
    domainId: 2741,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://abscan.org',
  },

  // ADI Chain
  36900: {
    chainId: 36900,
    chainName: 'adichain',
    displayName: 'ADI Chain',
    domainId: 36900,
    isTestnet: false,
    nativeCurrency: { name: 'ADI', symbol: 'ADI', decimals: 18 },
    explorerUrl: 'https://explorer.adichain.io',
  },

  // Ancient8
  888888888: {
    chainId: 888888888,
    chainName: 'ancient8',
    displayName: 'Ancient8',
    domainId: 888888888,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://scan.ancient8.gg',
  },

  // ApeChain
  33139: {
    chainId: 33139,
    chainName: 'apechain',
    displayName: 'ApeChain',
    domainId: 33139,
    isTestnet: false,
    nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
    explorerUrl: 'https://apescan.io',
  },

  // AppChain
  466: {
    chainId: 466,
    chainName: 'appchain',
    displayName: 'AppChain',
    domainId: 466,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.appchain.xyz',
  },

  // Arbitrum
  42161: {
    chainId: 42161,
    chainName: 'arbitrum',
    displayName: 'Arbitrum',
    domainId: 42161,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://arbiscan.io',
  },

  // Arbitrum Nova
  42170: {
    chainId: 42170,
    chainName: 'arbitrumnova',
    displayName: 'Arbitrum Nova',
    domainId: 42170,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://nova.arbiscan.io',
  },

  // Arcadia
  4278608: {
    chainId: 4278608,
    chainName: 'arcadia',
    displayName: 'Arcadia',
    domainId: 4278608,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.arcadia.network',
  },

  // Artela
  11820: {
    chainId: 11820,
    chainName: 'artela',
    displayName: 'Artela',
    domainId: 11820,
    isTestnet: false,
    nativeCurrency: { name: 'ART', symbol: 'ART', decimals: 18 },
    explorerUrl: 'https://artelascan.io',
  },

  // Astar
  592: {
    chainId: 592,
    chainName: 'astar',
    displayName: 'Astar',
    domainId: 592,
    isTestnet: false,
    nativeCurrency: { name: 'Astar', symbol: 'ASTR', decimals: 18 },
    explorerUrl: 'https://astar.subscan.io',
  },

  // Aurora
  1313161554: {
    chainId: 1313161554,
    chainName: 'aurora',
    displayName: 'Aurora',
    domainId: 1313161554,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.aurora.dev',
  },

  // Avalanche
  43114: {
    chainId: 43114,
    chainName: 'avalanche',
    displayName: 'Avalanche',
    domainId: 43114,
    isTestnet: false,
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    explorerUrl: 'https://snowtrace.io',
  },

  // B3
  8333: {
    chainId: 8333,
    chainName: 'b3',
    displayName: 'B3',
    domainId: 8333,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.b3.fun',
  },

  // Base
  8453: {
    chainId: 8453,
    chainName: 'base',
    displayName: 'Base',
    domainId: 8453,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://basescan.org',
  },

  // Berachain
  80094: {
    chainId: 80094,
    chainName: 'berachain',
    displayName: 'Berachain',
    domainId: 80094,
    isTestnet: false,
    nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
    explorerUrl: 'https://berascan.com',
  },

  // Bitlayer
  200901: {
    chainId: 200901,
    chainName: 'bitlayer',
    displayName: 'Bitlayer',
    domainId: 200901,
    isTestnet: false,
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    explorerUrl: 'https://www.btrscan.com',
  },

  // Blast
  81457: {
    chainId: 81457,
    chainName: 'blast',
    displayName: 'Blast',
    domainId: 81457,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://blastscan.io',
  },

  // BOB
  60808: {
    chainId: 60808,
    chainName: 'bob',
    displayName: 'BOB',
    domainId: 60808,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.gobob.xyz',
  },

  // Boba Mainnet
  288: {
    chainId: 288,
    chainName: 'boba',
    displayName: 'Boba',
    domainId: 288,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://bobascan.com',
  },

  // Botanix
  3637: {
    chainId: 3637,
    chainName: 'botanix',
    displayName: 'Botanix',
    domainId: 3637,
    isTestnet: false,
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    explorerUrl: 'https://explorer.botanixlabs.dev',
  },

  // Binance Smart Chain
  56: {
    chainId: 56,
    chainName: 'bsc',
    displayName: 'BNB Chain',
    domainId: 56,
    isTestnet: false,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorerUrl: 'https://bscscan.com',
  },

  // B² Network
  223: {
    chainId: 223,
    chainName: 'b2network',
    displayName: 'B² Network',
    domainId: 223,
    isTestnet: false,
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    explorerUrl: 'https://explorer.bsquared.network',
  },

  // CarrChain
  7667: {
    chainId: 7667,
    chainName: 'carrchain',
    displayName: 'CarrChain',
    domainId: 7667,
    isTestnet: false,
    nativeCurrency: { name: 'CARR', symbol: 'CARR', decimals: 18 },
    explorerUrl: 'https://explorer.carrchain.io',
  },

  // Celo
  42220: {
    chainId: 42220,
    chainName: 'celo',
    displayName: 'Celo',
    domainId: 42220,
    isTestnet: false,
    nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
    explorerUrl: 'https://celoscan.io',
  },

  // Chiliz - Note: domainId is different from chainId
  88888: {
    chainId: 88888,
    chainName: 'chiliz',
    displayName: 'Chiliz',
    domainId: 1000088888,
    isTestnet: false,
    nativeCurrency: { name: 'Chiliz', symbol: 'CHZ', decimals: 18 },
    explorerUrl: 'https://chiliscan.com',
  },

  // Core
  1116: {
    chainId: 1116,
    chainName: 'core',
    displayName: 'Core',
    domainId: 1116,
    isTestnet: false,
    nativeCurrency: { name: 'Core', symbol: 'CORE', decimals: 18 },
    explorerUrl: 'https://scan.coredao.org',
  },

  // Coti
  2632500: {
    chainId: 2632500,
    chainName: 'coti',
    displayName: 'Coti',
    domainId: 2632500,
    isTestnet: false,
    nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
    explorerUrl: 'https://explorer.coti.io',
  },

  // Cyber
  7560: {
    chainId: 7560,
    chainName: 'cyber',
    displayName: 'Cyber',
    domainId: 7560,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://cyberscan.co',
  },

  // Degen
  666666666: {
    chainId: 666666666,
    chainName: 'degen',
    displayName: 'Degen',
    domainId: 666666666,
    isTestnet: false,
    nativeCurrency: { name: 'DEGEN', symbol: 'DEGEN', decimals: 18 },
    explorerUrl: 'https://explorer.degen.tips',
  },

  // Dogechain
  2000: {
    chainId: 2000,
    chainName: 'dogechain',
    displayName: 'Dogechain',
    domainId: 2000,
    isTestnet: false,
    nativeCurrency: { name: 'Dogecoin', symbol: 'DOGE', decimals: 18 },
    explorerUrl: 'https://explorer.dogechain.dog',
  },

  // Electroneum
  52014: {
    chainId: 52014,
    chainName: 'electroneum',
    displayName: 'Electroneum',
    domainId: 52014,
    isTestnet: false,
    nativeCurrency: { name: 'ETN', symbol: 'ETN', decimals: 18 },
    explorerUrl: 'https://blockexplorer.electroneum.com',
  },

  // Endurance
  648: {
    chainId: 648,
    chainName: 'endurance',
    displayName: 'Endurance',
    domainId: 648,
    isTestnet: false,
    nativeCurrency: { name: 'ACE', symbol: 'ACE', decimals: 18 },
    explorerUrl: 'https://explorer.endurance.fusionist.io',
  },

  // Ethereum
  1: {
    chainId: 1,
    chainName: 'ethereum',
    displayName: 'Ethereum',
    domainId: 1,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://etherscan.io',
  },

  // Everclear
  25327: {
    chainId: 25327,
    chainName: 'everclear',
    displayName: 'Everclear',
    domainId: 25327,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://scan.everclear.org',
  },

  // Fantom Opera
  250: {
    chainId: 250,
    chainName: 'fantom',
    displayName: 'Fantom',
    domainId: 250,
    isTestnet: false,
    nativeCurrency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
    explorerUrl: 'https://ftmscan.com',
  },

  // Flare
  14: {
    chainId: 14,
    chainName: 'flare',
    displayName: 'Flare',
    domainId: 14,
    isTestnet: false,
    nativeCurrency: { name: 'Flare', symbol: 'FLR', decimals: 18 },
    explorerUrl: 'https://flarescan.com',
  },

  // EVM on Flow - Note: domainId is different from chainId
  747: {
    chainId: 747,
    chainName: 'flowevm',
    displayName: 'Flow EVM',
    domainId: 1000000747,
    isTestnet: false,
    nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
    explorerUrl: 'https://evm.flowscan.io',
  },

  // Fluence
  9999999: {
    chainId: 9999999,
    chainName: 'fluence',
    displayName: 'Fluence',
    domainId: 9999999,
    isTestnet: false,
    nativeCurrency: { name: 'FLT', symbol: 'FLT', decimals: 18 },
    explorerUrl: 'https://blockscout.fluence.dev',
  },

  // Form
  478: {
    chainId: 478,
    chainName: 'form',
    displayName: 'Form',
    domainId: 478,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.form.network',
  },

  // Fraxtal
  252: {
    chainId: 252,
    chainName: 'fraxtal',
    displayName: 'Fraxtal',
    domainId: 252,
    isTestnet: false,
    nativeCurrency: { name: 'Frax Ether', symbol: 'frxETH', decimals: 18 },
    explorerUrl: 'https://fraxscan.com',
  },

  // Fuse
  122: {
    chainId: 122,
    chainName: 'fuse',
    displayName: 'Fuse',
    domainId: 122,
    isTestnet: false,
    nativeCurrency: { name: 'Fuse', symbol: 'FUSE', decimals: 18 },
    explorerUrl: 'https://explorer.fuse.io',
  },

  // Galactica
  613419: {
    chainId: 613419,
    chainName: 'galactica',
    displayName: 'Galactica',
    domainId: 613419,
    isTestnet: false,
    nativeCurrency: { name: 'GNET', symbol: 'GNET', decimals: 18 },
    explorerUrl: 'https://explorer.galactica.com',
  },

  // Gnosis
  100: {
    chainId: 100,
    chainName: 'gnosis',
    displayName: 'Gnosis',
    domainId: 100,
    isTestnet: false,
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    explorerUrl: 'https://gnosisscan.io',
  },

  // Gravity Alpha Mainnet
  1625: {
    chainId: 1625,
    chainName: 'gravity',
    displayName: 'Gravity',
    domainId: 1625,
    isTestnet: false,
    nativeCurrency: { name: 'G', symbol: 'G', decimals: 18 },
    explorerUrl: 'https://explorer.gravity.xyz',
  },

  // Harmony One
  1666600000: {
    chainId: 1666600000,
    chainName: 'harmony',
    displayName: 'Harmony',
    domainId: 1666600000,
    isTestnet: false,
    nativeCurrency: { name: 'ONE', symbol: 'ONE', decimals: 18 },
    explorerUrl: 'https://explorer.harmony.one',
  },

  // Hashkey
  177: {
    chainId: 177,
    chainName: 'hashkey',
    displayName: 'HashKey',
    domainId: 177,
    isTestnet: false,
    nativeCurrency: { name: 'HSK', symbol: 'HSK', decimals: 18 },
    explorerUrl: 'https://hashkeyscan.io',
  },

  // Hemi Network
  43111: {
    chainId: 43111,
    chainName: 'hemi',
    displayName: 'Hemi',
    domainId: 43111,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.hemi.xyz',
  },

  // HyperEVM
  999: {
    chainId: 999,
    chainName: 'hyperevm',
    displayName: 'HyperEVM',
    domainId: 999,
    isTestnet: false,
    nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
    explorerUrl: 'https://explorer.hyperliquid.xyz',
  },

  // Immutable zkEVM - Note: domainId is different from chainId
  13371: {
    chainId: 13371,
    chainName: 'immutablezkevm',
    displayName: 'Immutable zkEVM',
    domainId: 1000013371,
    isTestnet: false,
    nativeCurrency: { name: 'IMX', symbol: 'IMX', decimals: 18 },
    explorerUrl: 'https://explorer.immutable.com',
  },

  // Incentiv
  24101: {
    chainId: 24101,
    chainName: 'incentiv',
    displayName: 'Incentiv',
    domainId: 24101,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.incentiv.net',
  },

  // Ink
  57073: {
    chainId: 57073,
    chainName: 'ink',
    displayName: 'Ink',
    domainId: 57073,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.inkonchain.com',
  },

  // Kaia
  8217: {
    chainId: 8217,
    chainName: 'kaia',
    displayName: 'Kaia',
    domainId: 8217,
    isTestnet: false,
    nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
    explorerUrl: 'https://kaiascan.io',
  },

  // Katana
  747474: {
    chainId: 747474,
    chainName: 'katana',
    displayName: 'Katana',
    domainId: 747474,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.katana.network',
  },

  // LazAI
  52924: {
    chainId: 52924,
    chainName: 'lazai',
    displayName: 'LazAI',
    domainId: 52924,
    isTestnet: false,
    nativeCurrency: { name: 'LAZ', symbol: 'LAZ', decimals: 18 },
    explorerUrl: 'https://explorer.lazai.network',
  },

  // Linea
  59144: {
    chainId: 59144,
    chainName: 'linea',
    displayName: 'Linea',
    domainId: 59144,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://lineascan.build',
  },

  // Lisk
  1135: {
    chainId: 1135,
    chainName: 'lisk',
    displayName: 'Lisk',
    domainId: 1135,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://blockscout.lisk.com',
  },

  // Lit Chain
  175200: {
    chainId: 175200,
    chainName: 'litchain',
    displayName: 'Lit Chain',
    domainId: 175200,
    isTestnet: false,
    nativeCurrency: { name: 'LIT', symbol: 'LIT', decimals: 18 },
    explorerUrl: 'https://chain.litprotocol.com',
  },

  // LUKSO
  42: {
    chainId: 42,
    chainName: 'lukso',
    displayName: 'LUKSO',
    domainId: 42,
    isTestnet: false,
    nativeCurrency: { name: 'LYX', symbol: 'LYX', decimals: 18 },
    explorerUrl: 'https://explorer.lukso.network',
  },

  // Lumia Prism - Note: domainId is different from chainId
  994873017: {
    chainId: 994873017,
    chainName: 'lumiaprism',
    displayName: 'Lumia Prism',
    domainId: 1000073017,
    isTestnet: false,
    nativeCurrency: { name: 'LUMIA', symbol: 'LUMIA', decimals: 18 },
    explorerUrl: 'https://explorer.lumia.org',
  },

  // Manta Pacific
  169: {
    chainId: 169,
    chainName: 'manta',
    displayName: 'Manta Pacific',
    domainId: 169,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://pacific-explorer.manta.network',
  },

  // Mantle
  5000: {
    chainId: 5000,
    chainName: 'mantle',
    displayName: 'Mantle',
    domainId: 5000,
    isTestnet: false,
    nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
    explorerUrl: 'https://mantlescan.xyz',
  },

  // Mantra
  5888: {
    chainId: 5888,
    chainName: 'mantra',
    displayName: 'Mantra',
    domainId: 5888,
    isTestnet: false,
    nativeCurrency: { name: 'OM', symbol: 'OM', decimals: 18 },
    explorerUrl: 'https://explorer.mantra.zone',
  },

  // Matchain
  698: {
    chainId: 698,
    chainName: 'matchain',
    displayName: 'Matchain',
    domainId: 698,
    isTestnet: false,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorerUrl: 'https://matchscan.io',
  },

  // MegaETH
  4326: {
    chainId: 4326,
    chainName: 'megaeth',
    displayName: 'MegaETH',
    domainId: 4326,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.megaeth.com',
  },

  // Merlin
  4200: {
    chainId: 4200,
    chainName: 'merlin',
    displayName: 'Merlin',
    domainId: 4200,
    isTestnet: false,
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    explorerUrl: 'https://scan.merlinchain.io',
  },

  // Metal L2 - Note: domainId is different from chainId
  1750: {
    chainId: 1750,
    chainName: 'metall2',
    displayName: 'Metal L2',
    domainId: 1000001750,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.metall2.com',
  },

  // Metis Andromeda
  1088: {
    chainId: 1088,
    chainName: 'metis',
    displayName: 'Metis',
    domainId: 1088,
    isTestnet: false,
    nativeCurrency: { name: 'Metis', symbol: 'METIS', decimals: 18 },
    explorerUrl: 'https://andromeda-explorer.metis.io',
  },

  // Mint
  185: {
    chainId: 185,
    chainName: 'mint',
    displayName: 'Mint',
    domainId: 185,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.mintchain.io',
  },

  // Miraclechain
  92278: {
    chainId: 92278,
    chainName: 'miraclechain',
    displayName: 'Miraclechain',
    domainId: 92278,
    isTestnet: false,
    nativeCurrency: { name: 'MAT', symbol: 'MAT', decimals: 18 },
    explorerUrl: 'https://explorer.miraclechain.io',
  },

  // Mitosis
  124816: {
    chainId: 124816,
    chainName: 'mitosis',
    displayName: 'Mitosis',
    domainId: 124816,
    isTestnet: false,
    nativeCurrency: { name: 'MITO', symbol: 'MITO', decimals: 18 },
    explorerUrl: 'https://explorer.mitosis.org',
  },

  // Mode
  34443: {
    chainId: 34443,
    chainName: 'mode',
    displayName: 'Mode',
    domainId: 34443,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.mode.network',
  },

  // Molten
  360: {
    chainId: 360,
    chainName: 'molten',
    displayName: 'Molten',
    domainId: 360,
    isTestnet: false,
    nativeCurrency: { name: 'MAGMA', symbol: 'MAGMA', decimals: 18 },
    explorerUrl: 'https://explorer.moltennetwork.com',
  },

  // Monad
  143: {
    chainId: 143,
    chainName: 'monad',
    displayName: 'Monad',
    domainId: 143,
    isTestnet: false,
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    explorerUrl: 'https://explorer.monad.xyz',
  },

  // Moonbeam
  1284: {
    chainId: 1284,
    chainName: 'moonbeam',
    displayName: 'Moonbeam',
    domainId: 1284,
    isTestnet: false,
    nativeCurrency: { name: 'Glimmer', symbol: 'GLMR', decimals: 18 },
    explorerUrl: 'https://moonscan.io',
  },

  // Morph
  2818: {
    chainId: 2818,
    chainName: 'morph',
    displayName: 'Morph',
    domainId: 2818,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.morphl2.io',
  },

  // Nibiru
  6900: {
    chainId: 6900,
    chainName: 'nibiru',
    displayName: 'Nibiru',
    domainId: 6900,
    isTestnet: false,
    nativeCurrency: { name: 'NIBI', symbol: 'NIBI', decimals: 18 },
    explorerUrl: 'https://explorer.nibiru.fi',
  },

  // Ontology
  58: {
    chainId: 58,
    chainName: 'ontology',
    displayName: 'Ontology',
    domainId: 58,
    isTestnet: false,
    nativeCurrency: { name: 'ONG', symbol: 'ONG', decimals: 18 },
    explorerUrl: 'https://explorer.ont.io',
  },

  // Oort
  970: {
    chainId: 970,
    chainName: 'oort',
    displayName: 'Oort',
    domainId: 970,
    isTestnet: false,
    nativeCurrency: { name: 'OORT', symbol: 'OORT', decimals: 18 },
    explorerUrl: 'https://explorer.oortech.com',
  },

  // opBNB
  204: {
    chainId: 204,
    chainName: 'opbnb',
    displayName: 'opBNB',
    domainId: 204,
    isTestnet: false,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    explorerUrl: 'https://opbnbscan.com',
  },

  // Optimism
  10: {
    chainId: 10,
    chainName: 'optimism',
    displayName: 'Optimism',
    domainId: 10,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://optimistic.etherscan.io',
  },

  // Orderly L2
  291: {
    chainId: 291,
    chainName: 'orderly',
    displayName: 'Orderly',
    domainId: 291,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.orderly.network',
  },

  // Peaq
  3338: {
    chainId: 3338,
    chainName: 'peaq',
    displayName: 'Peaq',
    domainId: 3338,
    isTestnet: false,
    nativeCurrency: { name: 'PEAQ', symbol: 'PEAQ', decimals: 18 },
    explorerUrl: 'https://peaq.subscan.io',
  },

  // Plasma
  9745: {
    chainId: 9745,
    chainName: 'plasma',
    displayName: 'Plasma',
    domainId: 9745,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.plasma.io',
  },

  // Plume
  98866: {
    chainId: 98866,
    chainName: 'plume',
    displayName: 'Plume',
    domainId: 98866,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.plumenetwork.xyz',
  },

  // Polygon
  137: {
    chainId: 137,
    chainName: 'polygon',
    displayName: 'Polygon',
    domainId: 137,
    isTestnet: false,
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    explorerUrl: 'https://polygonscan.com',
  },

  // Polygon zkEVM
  1101: {
    chainId: 1101,
    chainName: 'polygonzkevm',
    displayName: 'Polygon zkEVM',
    domainId: 1101,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://zkevm.polygonscan.com',
  },

  // Polynomial - Note: domainId is different from chainId
  8008: {
    chainId: 8008,
    chainName: 'polynomial',
    displayName: 'Polynomial',
    domainId: 1000008008,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://polynomialscan.io',
  },

  // Prom
  227: {
    chainId: 227,
    chainName: 'prom',
    displayName: 'Prom',
    domainId: 227,
    isTestnet: false,
    nativeCurrency: { name: 'PROM', symbol: 'PROM', decimals: 18 },
    explorerUrl: 'https://promscan.io',
  },

  // PulseChain
  369: {
    chainId: 369,
    chainName: 'pulsechain',
    displayName: 'PulseChain',
    domainId: 369,
    isTestnet: false,
    nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
    explorerUrl: 'https://scan.pulsechain.com',
  },

  // RARI Chain - Note: domainId is different from chainId
  1380012617: {
    chainId: 1380012617,
    chainName: 'rarichain',
    displayName: 'RARI Chain',
    domainId: 1000012617,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://mainnet.explorer.rarichain.org',
  },

  // Reactive Mainnet
  1597: {
    chainId: 1597,
    chainName: 'reactive',
    displayName: 'Reactive',
    domainId: 1597,
    isTestnet: false,
    nativeCurrency: { name: 'REACT', symbol: 'REACT', decimals: 18 },
    explorerUrl: 'https://explorer.reactive.network',
  },

  // Redstone
  690: {
    chainId: 690,
    chainName: 'redstone',
    displayName: 'Redstone',
    domainId: 690,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.redstone.xyz',
  },

  // Ronin
  2020: {
    chainId: 2020,
    chainName: 'ronin',
    displayName: 'Ronin',
    domainId: 2020,
    isTestnet: false,
    nativeCurrency: { name: 'RON', symbol: 'RON', decimals: 18 },
    explorerUrl: 'https://app.roninchain.com',
  },

  // Scroll
  534352: {
    chainId: 534352,
    chainName: 'scroll',
    displayName: 'Scroll',
    domainId: 534352,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://scrollscan.com',
  },

  // Sei
  1329: {
    chainId: 1329,
    chainName: 'sei',
    displayName: 'Sei',
    domainId: 1329,
    isTestnet: false,
    nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
    explorerUrl: 'https://seitrace.com',
  },

  // Shibarium
  109: {
    chainId: 109,
    chainName: 'shibarium',
    displayName: 'Shibarium',
    domainId: 109,
    isTestnet: false,
    nativeCurrency: { name: 'BONE', symbol: 'BONE', decimals: 18 },
    explorerUrl: 'https://www.shibariumscan.io',
  },

  // Somnia
  5031: {
    chainId: 5031,
    chainName: 'somnia',
    displayName: 'Somnia',
    domainId: 5031,
    isTestnet: false,
    nativeCurrency: { name: 'SOM', symbol: 'SOM', decimals: 18 },
    explorerUrl: 'https://explorer.somnia.network',
  },

  // Soneium
  1868: {
    chainId: 1868,
    chainName: 'soneium',
    displayName: 'Soneium',
    domainId: 1868,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.soneium.org',
  },

  // Sonic
  146: {
    chainId: 146,
    chainName: 'sonic',
    displayName: 'Sonic',
    domainId: 146,
    isTestnet: false,
    nativeCurrency: { name: 'S', symbol: 'S', decimals: 18 },
    explorerUrl: 'https://sonicscan.org',
  },

  // Sophon
  50104: {
    chainId: 50104,
    chainName: 'sophon',
    displayName: 'Sophon',
    domainId: 50104,
    isTestnet: false,
    nativeCurrency: { name: 'SOPH', symbol: 'SOPH', decimals: 18 },
    explorerUrl: 'https://explorer.sophon.xyz',
  },

  // Stable
  988: {
    chainId: 988,
    chainName: 'stable',
    displayName: 'Stable',
    domainId: 988,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.stable.xyz',
  },

  // Story Mainnet
  1514: {
    chainId: 1514,
    chainName: 'story',
    displayName: 'Story',
    domainId: 1514,
    isTestnet: false,
    nativeCurrency: { name: 'IP', symbol: 'IP', decimals: 18 },
    explorerUrl: 'https://storyscan.xyz',
  },

  // Subtensor
  964: {
    chainId: 964,
    chainName: 'subtensor',
    displayName: 'Subtensor',
    domainId: 964,
    isTestnet: false,
    nativeCurrency: { name: 'TAO', symbol: 'TAO', decimals: 18 },
    explorerUrl: 'https://explorer.subtensor.io',
  },

  // Superposition - Note: domainId is different from chainId
  55244: {
    chainId: 55244,
    chainName: 'superposition',
    displayName: 'Superposition',
    domainId: 1000055244,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.superposition.so',
  },

  // Superseed
  5330: {
    chainId: 5330,
    chainName: 'superseed',
    displayName: 'Superseed',
    domainId: 5330,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.superseed.xyz',
  },

  // Swell
  1923: {
    chainId: 1923,
    chainName: 'swell',
    displayName: 'Swell',
    domainId: 1923,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.swellnetwork.io',
  },

  // TAC
  239: {
    chainId: 239,
    chainName: 'tac',
    displayName: 'TAC',
    domainId: 239,
    isTestnet: false,
    nativeCurrency: { name: 'TAC', symbol: 'TAC', decimals: 18 },
    explorerUrl: 'https://explorer.tac.build',
  },

  // Taiko
  167000: {
    chainId: 167000,
    chainName: 'taiko',
    displayName: 'Taiko',
    domainId: 167000,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://taikoscan.io',
  },

  // Tangle
  5845: {
    chainId: 5845,
    chainName: 'tangle',
    displayName: 'Tangle',
    domainId: 5845,
    isTestnet: false,
    nativeCurrency: { name: 'TNT', symbol: 'TNT', decimals: 18 },
    explorerUrl: 'https://explorer.tangle.tools',
  },

  // Torus
  21000: {
    chainId: 21000,
    chainName: 'torus',
    displayName: 'Torus',
    domainId: 21000,
    isTestnet: false,
    nativeCurrency: { name: 'TORUS', symbol: 'TORUS', decimals: 18 },
    explorerUrl: 'https://explorer.torus.finance',
  },

  // Unichain
  130: {
    chainId: 130,
    chainName: 'unichain',
    displayName: 'Unichain',
    domainId: 130,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://uniscan.xyz',
  },

  // Vana
  1480: {
    chainId: 1480,
    chainName: 'vana',
    displayName: 'Vana',
    domainId: 1480,
    isTestnet: false,
    nativeCurrency: { name: 'VANA', symbol: 'VANA', decimals: 18 },
    explorerUrl: 'https://vanascan.io',
  },

  // Viction
  88: {
    chainId: 88,
    chainName: 'viction',
    displayName: 'Viction',
    domainId: 88,
    isTestnet: false,
    nativeCurrency: { name: 'VIC', symbol: 'VIC', decimals: 18 },
    explorerUrl: 'https://vicscan.xyz',
  },

  // World Chain
  480: {
    chainId: 480,
    chainName: 'worldchain',
    displayName: 'World Chain',
    domainId: 480,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://worldscan.org',
  },

  // Xai
  660279: {
    chainId: 660279,
    chainName: 'xai',
    displayName: 'Xai',
    domainId: 660279,
    isTestnet: false,
    nativeCurrency: { name: 'XAI', symbol: 'XAI', decimals: 18 },
    explorerUrl: 'https://explorer.xai-chain.net',
  },

  // XLayer
  196: {
    chainId: 196,
    chainName: 'xlayer',
    displayName: 'XLayer',
    domainId: 196,
    isTestnet: false,
    nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
    explorerUrl: 'https://www.okx.com/web3/explorer/xlayer',
  },

  // XRPL EVM
  1440000: {
    chainId: 1440000,
    chainName: 'xrplevm',
    displayName: 'XRPL EVM',
    domainId: 1440000,
    isTestnet: false,
    nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 18 },
    explorerUrl: 'https://explorer.xrplevm.org',
  },

  // 0G
  16661: {
    chainId: 16661,
    chainName: '0g',
    displayName: '0G',
    domainId: 16661,
    isTestnet: false,
    nativeCurrency: { name: 'A0GI', symbol: 'A0GI', decimals: 18 },
    explorerUrl: 'https://chainscan.0g.ai',
  },

  // Zero Network
  543210: {
    chainId: 543210,
    chainName: 'zeronetwork',
    displayName: 'Zero Network',
    domainId: 543210,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.zero.network',
  },

  // ZetaChain
  7000: {
    chainId: 7000,
    chainName: 'zetachain',
    displayName: 'ZetaChain',
    domainId: 7000,
    isTestnet: false,
    nativeCurrency: { name: 'ZETA', symbol: 'ZETA', decimals: 18 },
    explorerUrl: 'https://zetachain.blockscout.com',
  },

  // Zircuit
  48900: {
    chainId: 48900,
    chainName: 'zircuit',
    displayName: 'Zircuit',
    domainId: 48900,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.zircuit.com',
  },

  // zkSync
  324: {
    chainId: 324,
    chainName: 'zksync',
    displayName: 'zkSync',
    domainId: 324,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.zksync.io',
  },

  // Zora
  7777777: {
    chainId: 7777777,
    chainName: 'zora',
    displayName: 'Zora',
    domainId: 7777777,
    isTestnet: false,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://explorer.zora.energy',
  },

  // =============================================================================
  // TESTNETS
  // =============================================================================

  // Arbitrum Sepolia
  421614: {
    chainId: 421614,
    chainName: 'arbitrumsepolia',
    displayName: 'Arbitrum Sepolia',
    domainId: 421614,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.arbiscan.io',
  },

  // Arcadia Testnet v2
  1098411886: {
    chainId: 1098411886,
    chainName: 'arcadiatestnet',
    displayName: 'Arcadia Testnet',
    domainId: 1098411886,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://testnet.explorer.arcadia.network',
  },

  // Aurora Testnet
  1313161555: {
    chainId: 1313161555,
    chainName: 'auroratestnet',
    displayName: 'Aurora Testnet',
    domainId: 1313161555,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://testnet.aurorascan.dev',
  },

  // Basecamp Testnet - Note: domainId is different from chainId
  123420001114: {
    chainId: 123420001114,
    chainName: 'basecamptestnet',
    displayName: 'Basecamp Testnet',
    domainId: 1000001114,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://basecamp-explorer.base.org',
  },

  // Base Sepolia
  84532: {
    chainId: 84532,
    chainName: 'basesepolia',
    displayName: 'Base Sepolia',
    domainId: 84532,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.basescan.org',
  },

  // BSC Testnet
  97: {
    chainId: 97,
    chainName: 'bsctestnet',
    displayName: 'BSC Testnet',
    domainId: 97,
    isTestnet: true,
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
    explorerUrl: 'https://testnet.bscscan.com',
  },

  // CarrChain Testnet
  76672: {
    chainId: 76672,
    chainName: 'carrchaintestnet',
    displayName: 'CarrChain Testnet',
    domainId: 76672,
    isTestnet: true,
    nativeCurrency: { name: 'CARR', symbol: 'CARR', decimals: 18 },
    explorerUrl: 'https://testnet.explorer.carrchain.io',
  },

  // Celo Sepolia
  11142220: {
    chainId: 11142220,
    chainName: 'celosepolia',
    displayName: 'Celo Sepolia',
    domainId: 11142220,
    isTestnet: true,
    nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
    explorerUrl: 'https://sepolia.celoscan.io',
  },

  // Citrea Testnet
  5115: {
    chainId: 5115,
    chainName: 'citreatestnet',
    displayName: 'Citrea Testnet',
    domainId: 5115,
    isTestnet: true,
    nativeCurrency: { name: 'Bitcoin', symbol: 'cBTC', decimals: 18 },
    explorerUrl: 'https://explorer.testnet.citrea.xyz',
  },

  // Coti Testnet
  7082400: {
    chainId: 7082400,
    chainName: 'cotitestnet',
    displayName: 'Coti Testnet',
    domainId: 7082400,
    isTestnet: true,
    nativeCurrency: { name: 'COTI', symbol: 'COTI', decimals: 18 },
    explorerUrl: 'https://testnet.cotiscan.io',
  },

  // Fuji
  43113: {
    chainId: 43113,
    chainName: 'fuji',
    displayName: 'Avalanche Fuji',
    domainId: 43113,
    isTestnet: true,
    nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
    explorerUrl: 'https://testnet.snowtrace.io',
  },

  // GIWA Sepolia
  91342: {
    chainId: 91342,
    chainName: 'giwasepolia',
    displayName: 'GIWA Sepolia',
    domainId: 91342,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.giwascan.io',
  },

  // Hyperliquid EVM Testnet
  998: {
    chainId: 998,
    chainName: 'hyperliquidtestnet',
    displayName: 'Hyperliquid Testnet',
    domainId: 998,
    isTestnet: true,
    nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
    explorerUrl: 'https://testnet.hyperliquid.xyz',
  },

  // Incentiv Testnet v2
  28802: {
    chainId: 28802,
    chainName: 'incentivtestnet',
    displayName: 'Incentiv Testnet',
    domainId: 28802,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://testnet.explorer.incentiv.net',
  },

  // MegaETH Testnet
  6342: {
    chainId: 6342,
    chainName: 'megaethtestnet',
    displayName: 'MegaETH Testnet',
    domainId: 6342,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://testnet.megaethscan.io',
  },

  // Mode Testnet
  919: {
    chainId: 919,
    chainName: 'modetestnet',
    displayName: 'Mode Testnet',
    domainId: 919,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.explorer.mode.network',
  },

  // Monad Testnet
  10143: {
    chainId: 10143,
    chainName: 'monadtestnet',
    displayName: 'Monad Testnet',
    domainId: 10143,
    isTestnet: true,
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    explorerUrl: 'https://testnet.monadexplorer.com',
  },

  // Neura Testnet
  267: {
    chainId: 267,
    chainName: 'neuratestnet',
    displayName: 'Neura Testnet',
    domainId: 267,
    isTestnet: true,
    nativeCurrency: { name: 'ANKR', symbol: 'ANKR', decimals: 18 },
    explorerUrl: 'https://testnet.explorer.neura.network',
  },

  // Optimism Sepolia
  11155420: {
    chainId: 11155420,
    chainName: 'optimismsepolia',
    displayName: 'Optimism Sepolia',
    domainId: 11155420,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
  },

  // Polygon Amoy
  80002: {
    chainId: 80002,
    chainName: 'polygonamoy',
    displayName: 'Polygon Amoy',
    domainId: 80002,
    isTestnet: true,
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    explorerUrl: 'https://amoy.polygonscan.com',
  },

  // Scroll Sepolia
  534351: {
    chainId: 534351,
    chainName: 'scrollsepolia',
    displayName: 'Scroll Sepolia',
    domainId: 534351,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.scrollscan.com',
  },

  // Sepolia
  11155111: {
    chainId: 11155111,
    chainName: 'sepolia',
    displayName: 'Sepolia',
    domainId: 11155111,
    isTestnet: true,
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    explorerUrl: 'https://sepolia.etherscan.io',
  },

  // Somnia Testnet
  50312: {
    chainId: 50312,
    chainName: 'somniatestnet',
    displayName: 'Somnia Testnet',
    domainId: 50312,
    isTestnet: true,
    nativeCurrency: { name: 'SOM', symbol: 'SOM', decimals: 18 },
    explorerUrl: 'https://testnet.somniascan.com',
  },

  // Sonic Testnet
  64165: {
    chainId: 64165,
    chainName: 'sonictestnet',
    displayName: 'Sonic Testnet',
    domainId: 64165,
    isTestnet: true,
    nativeCurrency: { name: 'S', symbol: 'S', decimals: 18 },
    explorerUrl: 'https://testnet.sonicscan.org',
  },

  // Subtensor Testnet
  945: {
    chainId: 945,
    chainName: 'subtensortestnet',
    displayName: 'Subtensor Testnet',
    domainId: 945,
    isTestnet: true,
    nativeCurrency: { name: 'TAO', symbol: 'TAO', decimals: 18 },
    explorerUrl: 'https://testnet.explorer.subtensor.io',
  },

  // Tangle Testnet
  3799: {
    chainId: 3799,
    chainName: 'tangletestnet',
    displayName: 'Tangle Testnet',
    domainId: 3799,
    isTestnet: true,
    nativeCurrency: { name: 'tTNT', symbol: 'tTNT', decimals: 18 },
    explorerUrl: 'https://testnet-explorer.tangle.tools',
  },
}

// Get all supported chain IDs
export const getHostedChainIds = (): number[] =>
  Object.keys(HOSTED_CHAIN_METADATA).map(Number)

// Get chain metadata by chainId
export const getHostedChainMetadata = (chainId: number): ChainMetadata | undefined =>
  HOSTED_CHAIN_METADATA[chainId]

// Check if chain is supported
export const isHostedChain = (chainId: number): boolean =>
  chainId in HOSTED_CHAIN_METADATA

// Get testnet chains only
export const getHostedTestnetChainIds = (): number[] =>
  Object.values(HOSTED_CHAIN_METADATA)
    .filter(m => m.isTestnet)
    .map(m => m.chainId)

// Get mainnet chains only
export const getHostedMainnetChainIds = (): number[] =>
  Object.values(HOSTED_CHAIN_METADATA)
    .filter(m => !m.isTestnet)
    .map(m => m.chainId)

// Count of supported chains
export const HOSTED_CHAIN_COUNT = Object.keys(HOSTED_CHAIN_METADATA).length
