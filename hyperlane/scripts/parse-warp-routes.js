#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

// Read and parse the YAML file
const yamlPath = path.join(__dirname, '..', 'warpRouteConfigs.yaml')
const yamlContent = fs.readFileSync(yamlPath, 'utf8')
const warpRoutes = yaml.parse(yamlContent)

// Chain name to chainId mapping (from hosted chain-metadata.ts)
const CHAIN_NAME_TO_ID = {
  // Mainnets
  abstract: 2741,
  adichain: 36900,
  ancient8: 888888888,
  apechain: 33139,
  appchain: 466,
  arbitrum: 42161,
  arbitrumnova: 42170,
  arcadia: 4278608,
  artela: 11820,
  astar: 592,
  aurora: 1313161554,
  avalanche: 43114,
  b3: 8333,
  base: 8453,
  berachain: 80094,
  bitlayer: 200901,
  blast: 81457,
  bob: 60808,
  boba: 288,
  botanix: 3637,
  bsc: 56,
  b2network: 223,
  carrchain: 7667,
  celo: 42220,
  chiliz: 88888,
  core: 1116,
  coti: 2632500,
  cyber: 7560,
  degen: 666666666,
  dogechain: 2000,
  electroneum: 52014,
  endurance: 648,
  ethereum: 1,
  everclear: 25327,
  fantom: 250,
  flare: 14,
  flowmainnet: 747,
  fluence: 9999999,
  form: 478,
  fraxtal: 252,
  fuse: 122,
  galactica: 613419,
  gnosis: 100,
  gravity: 1625,
  harmony: 1666600000,
  hashkey: 177,
  hemi: 43111,
  hyperevm: 999,
  immutablezkevmmainnet: 13371,
  incentiv: 24101,
  ink: 57073,
  kaia: 8217,
  katana: 747474,
  lazai: 52924,
  linea: 59144,
  lisk: 1135,
  litchain: 175200,
  lukso: 42,
  lumiaprism: 994873017,
  mantapacific: 169,
  mantle: 5000,
  mantra: 5888,
  matchain: 698,
  megaeth: 4326,
  merlin: 4200,
  metall2: 1750,
  metis: 1088,
  mint: 185,
  miraclechain: 92278,
  mitosis: 124816,
  mode: 34443,
  molten: 360,
  monad: 143,
  moonbeam: 1284,
  morph: 2818,
  nibiru: 6900,
  ontology: 58,
  oort: 970,
  oortmainnet: 970,
  opbnb: 204,
  optimism: 10,
  orderly: 291,
  peaq: 3338,
  plasma: 9745,
  plume: 98866,
  polygon: 137,
  polygonzkevm: 1101,
  polynomial: 8008,
  prom: 227,
  pulsechain: 369,
  rarichain: 1380012617,
  reactive: 1597,
  redstone: 690,
  ronin: 2020,
  scroll: 534352,
  sei: 1329,
  shibarium: 109,
  somnia: 5031,
  soneium: 1868,
  sonic: 146,
  sophon: 50104,
  stable: 988,
  story: 1514,
  subtensor: 964,
  superposition: 55244,
  superseed: 5330,
  swell: 1923,
  tac: 239,
  taiko: 167000,
  tangle: 5845,
  torus: 21000,
  unichain: 130,
  vana: 1480,
  viction: 88,
  worldchain: 480,
  xai: 660279,
  xlayer: 196,
  xrplevm: 1440000,
  zerog: 16661,
  zeronetwork: 543210,
  zetachain: 7000,
  zircuit: 48900,
  zksync: 324,
  zoramainnet: 7777777,
  // Testnets
  arbitrumsepolia: 421614,
  arcadiatestnetv2: 1098411886,
  auroratestnet: 1313161555,
  basecamptestnet: 123420001114,
  basesepolia: 84532,
  bsctestnet: 97,
  carrchaintestnet: 76672,
  celosepolia: 11142220,
  citreatestnet: 5115,
  cotitestnet: 7082400,
  fuji: 43113,
  giwasepolia: 91342,
  hyperliquidevmtestnet: 998,
  incentivtestnetv2: 28802,
  megaethtestnet: 6342,
  modetestnet: 919,
  monadtestnet: 10143,
  neuratestnet: 267,
  optimismsepolia: 11155420,
  polygonamoy: 80002,
  scrollsepolia: 534351,
  sepolia: 11155111,
  somniatestnet: 50312,
  sonictestnet: 64165,
  subtensortestnet: 945,
  tangletestnet: 3799,
  holesky: 17000,
  // Additional chains from warp routes
  bsquared: 223,
  kalychain: null, // Custom chain
  radix: null, // Non-EVM
  eclipsemainnet: null, // Solana VM
  solanamainnet: null, // Solana
  starknet: null, // StarkNet
  soon: null, // Soon
  sonicsvm: null, // Sonic SVM
  celestia: null, // Cosmos
  stride: null, // Cosmos
  osmosis: null, // Cosmos
  neutron: null, // Cosmos
  injective: null, // Cosmos
  inevm: null, // injective EVM
  kyve: null, // Cosmos
  milkyway: null, // Cosmos
  forma: null, // Custom
  piccadilly: null, // Autonity testnet
  euphoriatestnet: null, // Testnet
  storytestnet: null, // Story testnet
  storyodysseytestnet: null, // Story testnet
  nobletestnet: null, // Noble testnet
  celestiatestnet: null, // Celestia testnet
  starknetsepolia: null, // StarkNet testnet
  cheesechain: null, // Custom
  echos: null, // Custom
  nitro: null, // Custom
  solaxy: null, // Custom
  arthera: null, // Custom
  artheratestnet: null, // Testnet
  paradex: null, // Custom
  paradexsepolia: null, // Testnet
}

// Categorize tokens - more granular splitting for smaller files
function categorizeToken(symbol) {
  const symbolUpper = symbol.toUpperCase()

  // USDC specifically (largest category)
  if (symbolUpper.includes('USDC')) {
    return 'usdc'
  }

  // USDT specifically
  if (symbolUpper.includes('USDT') || symbolUpper === 'OUSDT') {
    return 'usdt'
  }

  // Other stablecoins
  if (['DAI', 'EURC', 'USDB', 'FASTUSD', 'MUSD', 'USDN', 'USDSC', 'USDSTAR', 'TUSD', 'OUSD', 'OXAUT'].some(s => symbolUpper.includes(s))) {
    return 'stablecoins-other'
  }

  // ETH variants
  if (symbolUpper.includes('ETH')) {
    return 'eth-variants'
  }

  // BTC variants
  if (['BTC', 'WBTC', 'CBBTC', 'UBTC', 'STBTC', 'ENZOBTC', 'PUMPBTC', 'WFRAGBTC'].some(s => symbolUpper.includes(s))) {
    return 'btc-variants'
  }

  // SOL variants
  if (['SOL', 'JITOSOL', 'BBSOL', 'KYSOL', 'SSOL', 'SONICSOL', 'ADRASOL', 'LRTSSOL', 'EZSOL'].some(s => symbolUpper.includes(s))) {
    return 'sol-variants'
  }

  // TIA variants
  if (symbolUpper.includes('TIA')) {
    return 'tia-variants'
  }

  // Chain native tokens (commonly used)
  if (['BNB', 'POL', 'MATIC', 'AVAX', 'OP', 'ARB', 'FTM', 'LYX', 'XRD'].some(s => symbolUpper === s)) {
    return 'native-tokens'
  }

  // Meme/Social tokens
  if (['TRUMP', 'PEPE', 'BRETT', 'PENGU', 'BONK', 'WIF', 'POPCAT', 'FARTCOIN', 'AI16Z', 'MIGGLES', 'BOOP', 'PNUT', 'MEW', 'GIGA', 'GOAT', 'SPORE'].some(s => symbolUpper.includes(s))) {
    return 'meme-tokens'
  }

  return 'other-tokens'
}

// Convert standard to our type
function standardToType(standard) {
  if (!standard) return 'synthetic'
  const s = standard.toLowerCase()
  if (s.includes('native')) return 'native'
  if (s.includes('collateral')) return 'collateral'
  return 'synthetic'
}

// Parse warp routes
const parsedRoutes = []
let evmOnlyRoutes = []

for (const [routeKey, routeData] of Object.entries(warpRoutes)) {
  if (!routeData || !routeData.tokens) continue

  const [symbol] = routeKey.split('/')
  const tokens = routeData.tokens

  // Check if any token is on an EVM chain we support
  const evmTokens = tokens.filter(token => {
    const chainId = CHAIN_NAME_TO_ID[token.chainName]
    return chainId !== null && chainId !== undefined
  })

  if (evmTokens.length === 0) continue // Skip non-EVM routes

  // Get token info from first token
  const firstToken = tokens[0]

  const route = {
    id: routeKey,
    symbol: firstToken.symbol || symbol,
    name: firstToken.name || symbol,
    decimals: firstToken.decimals || 18,
    logoURI: firstToken.logoURI || null,
    coinGeckoId: firstToken.coinGeckoId || null,
    category: categorizeToken(symbol),
    chains: []
  }

  // Add chain configs
  for (const token of tokens) {
    const chainId = CHAIN_NAME_TO_ID[token.chainName]
    if (chainId === null || chainId === undefined) continue // Skip non-EVM

    route.chains.push({
      chainId,
      chainName: token.chainName,
      routerAddress: token.addressOrDenom,
      tokenAddress: token.collateralAddressOrDenom || token.addressOrDenom,
      type: standardToType(token.standard)
    })
  }

  if (route.chains.length > 0) {
    evmOnlyRoutes.push(route)
  }
}

// Group by category
const categories = {
  'usdc': [],
  'usdt': [],
  'stablecoins-other': [],
  'eth-variants': [],
  'btc-variants': [],
  'sol-variants': [],
  'tia-variants': [],
  'native-tokens': [],
  'meme-tokens': [],
  'other-tokens': []
}

for (const route of evmOnlyRoutes) {
  categories[route.category].push(route)
}

// Generate TypeScript files
function generateTsFile(routes, filename, description) {
  let content = `// =============================================================================
// Hyperlane Hosted Warp Routes - ${description}
// =============================================================================
// Auto-generated from warpRouteConfigs.yaml
// Last updated: ${new Date().toISOString().split('T')[0]}
// =============================================================================

import type { WarpRouteDeployment } from '../../types'

export const ${filename.toUpperCase().replace(/-/g, '_')}_WARP_ROUTES: WarpRouteDeployment[] = [\n`

  for (const route of routes) {
    content += `  {
    symbol: '${route.symbol}',
    name: '${route.name.replace(/'/g, "\\'")}',
    decimals: ${route.decimals},
    chains: [\n`

    for (const chain of route.chains) {
      content += `      {
        chainId: ${chain.chainId},
        chainName: '${chain.chainName}',
        routerAddress: '${chain.routerAddress}' as \`0x\${string}\`,
        tokenAddress: '${chain.tokenAddress}' as \`0x\${string}\`,
        type: '${chain.type}',
      },\n`
    }

    content += `    ],
  },\n`
  }

  content += `]
`
  return content
}

// Output directory
const outDir = path.join(__dirname, '..', '..', 'frontend', 'constants', 'hyperlane', 'warp-routes', 'hosted')
fs.mkdirSync(outDir, { recursive: true })

// Generate files
const fileDescriptions = {
  'usdc': 'USDC Routes',
  'usdt': 'USDT Routes',
  'stablecoins-other': 'Other Stablecoins (DAI, EURC, etc.)',
  'eth-variants': 'ETH Variants (ETH, WETH, stETH, etc.)',
  'btc-variants': 'BTC Variants (WBTC, CBBTC, etc.)',
  'sol-variants': 'SOL Variants (SOL, jitoSOL, etc.)',
  'tia-variants': 'TIA Variants (TIA, stTIA, milkTIA)',
  'native-tokens': 'Native Chain Tokens (BNB, POL, etc.)',
  'meme-tokens': 'Meme/Social Tokens',
  'other-tokens': 'Other Tokens'
}

const stats = {}
for (const [category, routes] of Object.entries(categories)) {
  if (routes.length === 0) continue

  const content = generateTsFile(routes, category, fileDescriptions[category])
  const filePath = path.join(outDir, `${category}.ts`)
  fs.writeFileSync(filePath, content)
  stats[category] = routes.length
  console.log(`Generated ${category}.ts with ${routes.length} routes`)
}

// Generate index file
let indexContent = `// =============================================================================
// Hyperlane Hosted Warp Routes - Index
// =============================================================================
// Auto-generated aggregator for all hosted warp routes
// =============================================================================

import type { WarpRouteDeployment } from '../../types'
`

const exportNames = []
for (const category of Object.keys(categories)) {
  if (categories[category].length === 0) continue
  const varName = category.toUpperCase().replace(/-/g, '_') + '_WARP_ROUTES'
  indexContent += `import { ${varName} } from './${category}'\n`
  exportNames.push(varName)
}

indexContent += `
// Re-export individual categories
${exportNames.map(name => `export { ${name} }`).join('\n')}

/**
 * All hosted warp routes combined
 */
export const ALL_HOSTED_WARP_ROUTES: WarpRouteDeployment[] = [
  ${exportNames.map(name => `...${name}`).join(',\n  ')},
]

/**
 * Get all hosted warp routes
 */
export function getAllHostedWarpRoutes(): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES
}

/**
 * Get hosted warp route by symbol
 */
export function getHostedWarpRouteBySymbol(symbol: string): WarpRouteDeployment | undefined {
  return ALL_HOSTED_WARP_ROUTES.find(r => r.symbol.toLowerCase() === symbol.toLowerCase())
}

/**
 * Get hosted warp routes for a specific chain
 */
export function getHostedWarpRoutesForChain(chainId: number): WarpRouteDeployment[] {
  return ALL_HOSTED_WARP_ROUTES.filter(route =>
    route.chains.some(c => c.chainId === chainId)
  )
}

/**
 * Get hosted warp routes by category
 */
export function getHostedWarpRoutesByCategory(category: string): WarpRouteDeployment[] {
  switch (category) {
${Object.keys(categories).filter(c => categories[c].length > 0).map(c => {
  const varName = c.toUpperCase().replace(/-/g, '_') + '_WARP_ROUTES'
  return `    case '${c}': return ${varName}`
}).join('\n')}
    default: return []
  }
}
`

fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent)
console.log('Generated index.ts')

// Print summary
console.log('\n=== Summary ===')
console.log(`Total EVM-compatible warp routes: ${evmOnlyRoutes.length}`)
for (const [cat, count] of Object.entries(stats)) {
  console.log(`  ${cat}: ${count}`)
}
