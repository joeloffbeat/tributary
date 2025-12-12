// Hyperlane Warp Routes Bridge Service
// Documentation: https://docs.hyperlane.xyz/docs/reference/developer-tools/typescript-sdk

import {
  mainnet,
  arbitrum,
  optimism,
  polygon,
  base,
  avalanche,
  bsc,
  celo,
  gnosis,
  moonbeam,
  scroll,
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  avalancheFuji,
} from 'viem/chains'
import type { Chain as ViemChain, WalletClient, PublicClient, Address } from 'viem'
import { createPublicClient, http, encodeFunctionData, parseUnits, formatUnits, defineChain, stringToHex, hexToString } from 'viem'

// Import deployments module with mode support
import {
  type HyperlaneMode,
  type HyperlaneDeployment,
  type WarpRouteDeployment,
  SELF_HOSTED_DEPLOYMENTS,
  HOSTED_DEPLOYMENTS,
  SELF_HOSTED_WARP_ROUTES,
  HOSTED_WARP_ROUTES,
  getDeployments,
  getWarpRoutes,
  getHyperlaneDeployment,
  isHyperlaneDeployed,
  getMailboxAddress as getMailboxFromDeployments,
  getSupportedChainIds,
  getSupportedChains as getDeploymentChains,
} from '@/constants/hyperlane'

// Define Story Aenid chain (not in viem by default)
export const storyAenid = defineChain({
  id: 1315,
  name: 'Story Aenid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Aenid Explorer',
      url: 'https://aeneid.storyscan.xyz',
    },
  },
  testnet: true,
})

// Hyperlane supported chains (official registry)
export const HYPERLANE_MAINNET_CHAINS: ViemChain[] = [
  mainnet,
  arbitrum,
  optimism,
  polygon,
  base,
  avalanche,
  bsc,
  celo,
  gnosis,
  moonbeam,
  scroll,
]

// Official testnet chains + custom deployed chains
export const HYPERLANE_TESTNET_CHAINS: ViemChain[] = [
  sepolia,
  arbitrumSepolia,
  baseSepolia,
  // Custom deployed chains (via hyperlane/ directory)
  storyAenid,
  avalancheFuji,
]

// Chain domain IDs used by Hyperlane (different from chain IDs)
// Source: https://docs.hyperlane.xyz/docs/protocol/mailbox
// Note: For self-deployed chains, domainId typically equals chainId
export const HYPERLANE_DOMAIN_IDS: Record<number, number> = {
  // Mainnet (official registry)
  1: 1, // Ethereum
  42161: 42161, // Arbitrum
  10: 10, // Optimism
  137: 137, // Polygon
  8453: 8453, // Base
  43114: 43114, // Avalanche
  56: 56, // BSC
  42220: 42220, // Celo
  100: 100, // Gnosis
  1284: 1284, // Moonbeam
  534352: 534352, // Scroll
  // Testnet (official registry)
  11155111: 11155111, // Sepolia
  421614: 421614, // Arbitrum Sepolia
  84532: 84532, // Base Sepolia
  // Custom deployed chains (self-hosted Hyperlane)
  1315: 1315, // Story Aenid
  43113: 43113, // Avalanche Fuji
}

// Chain name mapping for display
export const HYPERLANE_CHAIN_NAMES: Record<number, string> = {
  // Mainnet
  1: 'Ethereum',
  42161: 'Arbitrum',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base',
  43114: 'Avalanche',
  56: 'BNB Chain',
  42220: 'Celo',
  100: 'Gnosis',
  1284: 'Moonbeam',
  534352: 'Scroll',
  // Testnet
  11155111: 'Sepolia',
  421614: 'Arbitrum Sepolia',
  84532: 'Base Sepolia',
  // Custom deployed chains
  1315: 'Story Aenid',
  43113: 'Avalanche Fuji',
}

// Hyperlane Mailbox addresses per chain
// Source: https://docs.hyperlane.xyz/docs/reference/contract-addresses
// Custom deployments are merged from constants/hyperlane/deployments.ts
export const HYPERLANE_MAILBOX_ADDRESSES: Record<number, Address> = {
  // Mainnet (official registry)
  1: '0xc005dc82818d67AF737725bD4bf75435d065D239',
  42161: '0x979Ca5202784112f4738403dBec5D0F3B9daabB9',
  10: '0xd4C1905BB1D26BC93DAC913e13CaCC278CdCC80D',
  137: '0x5d934f4e2f797775e53561bB72aca21ba36B96BB',
  8453: '0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D',
  43114: '0xFf06aFcaABaDDd1fb08371f9ccA15D73D51FeBD6',
  56: '0x2971b9Aec44bE4eb673DF1B88cDB57b96eefe8a4',
  42220: '0x50da3B3907A08a24fe4999F4Dcf337E8dC7954bb',
  100: '0xaD09d78f4c6b9dA2Ae82b1D34107802d380Bb74f',
  1284: '0x094d03E751f49908080EFf000Dd6FD177fd44CC3',
  534352: '0x2f2aFaE1139Ce54feFC03593FeE8AB2aDF4a85A7',
  // Testnet (official registry)
  11155111: '0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766',
  421614: '0x598facE78a4302f11E3de0bee1894Da0b2Cb71F8',
  84532: '0x6966b0E55883d49BFB24539356a2f8A673E02039',
  // Self-hosted deployments are now accessed via getMailboxAddress function
  // which supports mode parameter
}

// Popular warp route tokens (official Hyperlane routes)
// These are example routes - in production, fetch from Hyperlane Registry
export interface HyperlaneWarpRoute {
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chains: {
    chainId: number
    routerAddress: Address
    tokenAddress: Address // Underlying token (or router itself for synthetics)
    type: 'collateral' | 'synthetic' | 'native'
  }[]
}

// Convert deployments to warp route format based on mode
function getCustomWarpRoutes(mode: HyperlaneMode): HyperlaneWarpRoute[] {
  const routes = getWarpRoutes(mode)
  return routes.map(route => ({
    symbol: route.symbol,
    name: route.name,
    decimals: route.decimals,
    chains: route.chains.map(chain => ({
      chainId: chain.chainId,
      routerAddress: chain.routerAddress,
      tokenAddress: chain.tokenAddress,
      type: chain.type,
    })),
  }))
}

export interface HyperlaneToken {
  address: Address
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  routerAddress: Address
  type: 'collateral' | 'synthetic' | 'native'
}

export interface HyperlaneChainInfo {
  chainId: number
  domainId: number
  name: string
  mailbox: Address
  explorerUrl: string
  logoUrl?: string
  tokens: HyperlaneToken[]
}

export interface HyperlaneQuoteParams {
  originChainId: number
  destinationChainId: number
  tokenSymbol: string
  amount: bigint
  sender: Address
  recipient?: Address
}

export interface HyperlaneQuote {
  originChainId: number
  destinationChainId: number
  token: HyperlaneToken
  inputAmount: bigint
  outputAmount: bigint // Same as input for warp routes (1:1)
  interchainGasFee: bigint
  localGasFee: bigint
  totalFee: bigint
  routerAddress: Address
  destinationRouterAddress: Address
  estimatedTime: number // seconds
}

export interface HyperlaneTransferParams {
  walletClient: WalletClient
  publicClient: PublicClient
  quote: HyperlaneQuote
  recipient: Address
}

export type HyperlaneProgressStep = 'approve' | 'transfer' | 'relay'
export type HyperlaneProgressStatus = 'pending' | 'txPending' | 'txSuccess' | 'txError' | 'relaying' | 'complete'

export interface HyperlaneProgress {
  step: HyperlaneProgressStep
  status: HyperlaneProgressStatus
  txHash?: string
  messageId?: string
  error?: Error
}

export interface HyperlaneExecuteParams {
  walletClient: WalletClient
  publicClient: PublicClient
  quote: HyperlaneQuote
  recipient: Address
  onProgress?: (progress: HyperlaneProgress) => void
}

// HypERC20 / TokenRouter ABI for transfers
const TOKEN_ROUTER_ABI = [
  {
    name: 'transferRemote',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_destination', type: 'uint32' },
      { name: '_recipient', type: 'bytes32' },
      { name: '_amountOrId', type: 'uint256' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    name: 'quoteGasPayment',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_destinationDomain', type: 'uint32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// ERC20 ABI for approvals
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// Mailbox ABI for cross-chain messaging
const MAILBOX_ABI = [
  {
    name: 'dispatch',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_destinationDomain', type: 'uint32' },
      { name: '_recipientAddress', type: 'bytes32' },
      { name: '_messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    name: 'quoteDispatch',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_destinationDomain', type: 'uint32' },
      { name: '_recipientAddress', type: 'bytes32' },
      { name: '_messageBody', type: 'bytes' },
    ],
    outputs: [{ name: 'fee', type: 'uint256' }],
  },
  {
    name: 'delivered',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_messageId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'localDomain',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint32' }],
  },
] as const

// Interchain Account Router ABI
const ICA_ROUTER_ABI = [
  {
    name: 'callRemote',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_destinationDomain', type: 'uint32' },
      {
        name: '_calls',
        type: 'tuple[]',
        components: [
          { name: 'to', type: 'bytes32' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      },
    ],
    outputs: [{ name: 'messageId', type: 'bytes32' }],
  },
  {
    name: 'getRemoteInterchainAccount',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: '_destination', type: 'uint32' },
      { name: '_owner', type: 'address' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'quoteGasPayment',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_destinationDomain', type: 'uint32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// Test Recipient ABI (for testing messaging)
const TEST_RECIPIENT_ABI = [
  {
    name: 'lastSender',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32' }],
  },
  {
    name: 'lastData',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes' }],
  },
] as const

class HyperlaneService {
  private warpRoutes: HyperlaneWarpRoute[] = []
  private initialized: boolean = false
  private currentMode: HyperlaneMode = 'self-hosted'

  constructor() {
    // Initialize with self-hosted routes by default
    this.warpRoutes = getCustomWarpRoutes('self-hosted')
  }

  /**
   * Set the current mode (hosted or self-hosted)
   */
  setMode(mode: HyperlaneMode): void {
    this.currentMode = mode
    this.warpRoutes = getCustomWarpRoutes(mode)
  }

  /**
   * Get current mode
   */
  getMode(): HyperlaneMode {
    return this.currentMode
  }

  /**
   * Initialize service with warp routes
   * Uses deployments based on current mode
   */
  async initialize(mode?: HyperlaneMode): Promise<void> {
    if (this.initialized && mode === this.currentMode) return

    try {
      if (mode) {
        this.currentMode = mode
      }
      this.warpRoutes = getCustomWarpRoutes(this.currentMode)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Hyperlane service:', error)
      this.initialized = true // Continue with defaults
    }
  }

  /**
   * Set custom warp routes (for testing or custom deployments)
   */
  setWarpRoutes(routes: HyperlaneWarpRoute[]): void {
    this.warpRoutes = routes
  }

  /**
   * Add custom warp routes (merges with existing)
   */
  addWarpRoutes(routes: HyperlaneWarpRoute[]): void {
    for (const route of routes) {
      const existingIndex = this.warpRoutes.findIndex(r => r.symbol === route.symbol)
      if (existingIndex >= 0) {
        // Merge chains
        this.warpRoutes[existingIndex].chains = [
          ...this.warpRoutes[existingIndex].chains,
          ...route.chains.filter(
            c => !this.warpRoutes[existingIndex].chains.some(ec => ec.chainId === c.chainId)
          ),
        ]
      } else {
        this.warpRoutes.push(route)
      }
    }
  }

  /**
   * Check if a chain is supported in the current mode
   */
  isChainSupported(chainId: number, mode?: HyperlaneMode): boolean {
    const targetMode = mode || this.currentMode
    return isHyperlaneDeployed(chainId, targetMode)
  }

  /**
   * Check if chain has Hyperlane deployment in a specific mode
   */
  hasDeployment(chainId: number, mode?: HyperlaneMode): boolean {
    const targetMode = mode || this.currentMode
    return isHyperlaneDeployed(chainId, targetMode)
  }

  /**
   * Get deployment info for a chain
   */
  getDeploymentInfo(chainId: number, mode?: HyperlaneMode): HyperlaneDeployment | undefined {
    const targetMode = mode || this.currentMode
    return getHyperlaneDeployment(chainId, targetMode)
  }

  /**
   * Check if chain is testnet
   */
  isTestnetChain(chainId: number, mode?: HyperlaneMode): boolean {
    const targetMode = mode || this.currentMode
    const deployment = getHyperlaneDeployment(chainId, targetMode)
    return deployment?.isTestnet ?? false
  }

  /**
   * Get domain ID for a chain
   */
  getDomainId(chainId: number, mode?: HyperlaneMode): number | null {
    const targetMode = mode || this.currentMode
    const deployment = getHyperlaneDeployment(chainId, targetMode)
    return deployment?.domainId ?? null
  }

  /**
   * Get chain name
   */
  getChainName(chainId: number, mode?: HyperlaneMode): string {
    const targetMode = mode || this.currentMode
    const deployment = getHyperlaneDeployment(chainId, targetMode)
    return deployment?.displayName ?? `Chain ${chainId}`
  }

  /**
   * Get all supported chains for current mode
   */
  getSupportedChains(options?: { testnet?: boolean; mode?: HyperlaneMode }): HyperlaneChainInfo[] {
    const targetMode = options?.mode || this.currentMode
    const deployments = getDeploymentChains(targetMode)

    // Filter by testnet/mainnet if specified
    const filtered = options?.testnet !== undefined
      ? deployments.filter(d => d.isTestnet === options.testnet)
      : deployments

    return filtered.map((deployment) => {
      const tokens = this.getTokensForChain(deployment.chainId, targetMode)
      return {
        chainId: deployment.chainId,
        domainId: deployment.domainId,
        name: deployment.displayName,
        mailbox: deployment.mailbox,
        explorerUrl: deployment.explorerUrl || '',
        tokens,
      }
    })
  }

  /**
   * Get tokens available for bridging on a chain
   */
  getTokensForChain(chainId: number, mode?: HyperlaneMode): HyperlaneToken[] {
    const targetMode = mode || this.currentMode
    const routes = getWarpRoutes(targetMode)
    const tokens: HyperlaneToken[] = []

    for (const route of routes) {
      const chainConfig = route.chains.find((c) => c.chainId === chainId)
      if (chainConfig) {
        tokens.push({
          address: chainConfig.tokenAddress,
          symbol: route.symbol,
          name: route.name,
          decimals: route.decimals,
          routerAddress: chainConfig.routerAddress,
          type: chainConfig.type,
        })
      }
    }

    return tokens
  }

  /**
   * Get destination chains for a token
   */
  getDestinationChains(originChainId: number, tokenSymbol: string, mode?: HyperlaneMode): number[] {
    const targetMode = mode || this.currentMode
    const routes = getWarpRoutes(targetMode)
    const route = routes.find((r) => r.symbol === tokenSymbol)
    if (!route) return []

    return route.chains
      .filter((c) => c.chainId !== originChainId)
      .map((c) => c.chainId)
  }

  /**
   * Get warp route configuration for a token
   */
  getWarpRoute(tokenSymbol: string, mode?: HyperlaneMode): HyperlaneWarpRoute | null {
    const targetMode = mode || this.currentMode
    const routes = getWarpRoutes(targetMode)
    const route = routes.find((r) => r.symbol === tokenSymbol)
    if (!route) return null

    return {
      symbol: route.symbol,
      name: route.name,
      decimals: route.decimals,
      chains: route.chains.map(chain => ({
        chainId: chain.chainId,
        routerAddress: chain.routerAddress,
        tokenAddress: chain.tokenAddress,
        type: chain.type,
      })),
    }
  }

  /**
   * Get a quote for bridging tokens
   */
  async getQuote(
    params: HyperlaneQuoteParams,
    publicClient: PublicClient
  ): Promise<HyperlaneQuote | null> {
    const route = this.getWarpRoute(params.tokenSymbol)
    if (!route) {
      throw new Error(`No warp route found for ${params.tokenSymbol}`)
    }

    const originConfig = route.chains.find((c) => c.chainId === params.originChainId)
    const destConfig = route.chains.find((c) => c.chainId === params.destinationChainId)

    if (!originConfig || !destConfig) {
      throw new Error('Invalid origin or destination chain for this token')
    }

    const destDomainId = this.getDomainId(params.destinationChainId)
    if (!destDomainId) {
      throw new Error('Destination chain not supported')
    }

    // Quote interchain gas payment
    let interchainGasFee = 0n
    try {
      interchainGasFee = await publicClient.readContract({
        address: originConfig.routerAddress,
        abi: TOKEN_ROUTER_ABI,
        functionName: 'quoteGasPayment',
        args: [destDomainId],
      })
    } catch (error) {
      console.warn('Failed to get gas quote, using estimate:', error)
      // Fallback estimate: 0.001 ETH for interchain gas
      interchainGasFee = parseUnits('0.001', 18)
    }

    // Estimate local gas (will be calculated more accurately during tx)
    const localGasFee = parseUnits('0.0005', 18) // ~0.0005 ETH estimate

    return {
      originChainId: params.originChainId,
      destinationChainId: params.destinationChainId,
      token: {
        address: originConfig.tokenAddress,
        symbol: route.symbol,
        name: route.name,
        decimals: route.decimals,
        logoURI: route.logoURI,
        routerAddress: originConfig.routerAddress,
        type: originConfig.type,
      },
      inputAmount: params.amount,
      outputAmount: params.amount, // 1:1 for warp routes
      interchainGasFee,
      localGasFee,
      totalFee: interchainGasFee + localGasFee,
      routerAddress: originConfig.routerAddress,
      destinationRouterAddress: destConfig.routerAddress,
      estimatedTime: 60, // ~1 minute typical
    }
  }

  /**
   * Convert address to bytes32 for Hyperlane
   */
  addressToBytes32(address: Address): `0x${string}` {
    // Pad address to 32 bytes
    return `0x${address.slice(2).padStart(64, '0')}` as `0x${string}`
  }

  /**
   * Execute a bridge transfer
   */
  async executeBridge(params: HyperlaneExecuteParams): Promise<string> {
    const { walletClient, publicClient, quote, recipient, onProgress } = params

    const account = walletClient.account
    if (!account) {
      throw new Error('Wallet not connected')
    }

    const destDomainId = this.getDomainId(quote.destinationChainId)
    if (!destDomainId) {
      throw new Error('Invalid destination chain')
    }

    // Step 1: Check approval for non-native tokens
    if (quote.token.type === 'collateral') {
      onProgress?.({ step: 'approve', status: 'pending' })

      const allowance = await publicClient.readContract({
        address: quote.token.address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [account.address, quote.routerAddress],
      })

      if (allowance < quote.inputAmount) {
        onProgress?.({ step: 'approve', status: 'txPending' })

        try {
          const approveHash = await walletClient.writeContract({
            account: account.address,
            chain: walletClient.chain,
            address: quote.token.address,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [quote.routerAddress, quote.inputAmount],
          })

          await publicClient.waitForTransactionReceipt({ hash: approveHash })
          onProgress?.({ step: 'approve', status: 'txSuccess', txHash: approveHash })
        } catch (error) {
          onProgress?.({ step: 'approve', status: 'txError', error: error as Error })
          throw error
        }
      } else {
        onProgress?.({ step: 'approve', status: 'txSuccess' })
      }
    }

    // Step 2: Execute transfer
    onProgress?.({ step: 'transfer', status: 'txPending' })

    const recipientBytes32 = this.addressToBytes32(recipient)

    // Calculate value to send (interchain gas + amount for native)
    let value = quote.interchainGasFee
    if (quote.token.type === 'native') {
      value = quote.interchainGasFee + quote.inputAmount
    }

    try {
      const transferHash = await walletClient.writeContract({
        account: account.address,
        chain: walletClient.chain,
        address: quote.routerAddress,
        abi: TOKEN_ROUTER_ABI,
        functionName: 'transferRemote',
        args: [destDomainId, recipientBytes32, quote.inputAmount],
        value,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: transferHash })

      // Extract message ID from logs (first topic of Dispatch event)
      // The messageId is returned from the function and emitted in the Dispatch event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const log = receipt.logs[0] as any
      const messageId = log?.topics?.[1] || '0x'

      onProgress?.({
        step: 'transfer',
        status: 'txSuccess',
        txHash: transferHash,
        messageId: messageId as string,
      })

      // Step 3: Relay status (message delivery)
      onProgress?.({ step: 'relay', status: 'relaying', messageId: messageId as string })

      // In production, poll Hyperlane Explorer API for message status
      // For now, mark as complete after a delay
      setTimeout(() => {
        onProgress?.({ step: 'relay', status: 'complete', messageId: messageId as string })
      }, 5000)

      return transferHash
    } catch (error) {
      onProgress?.({ step: 'transfer', status: 'txError', error: error as Error })
      throw error
    }
  }

  /**
   * Get message status from Hyperlane Explorer API
   * API Reference: https://explorer.hyperlane.xyz/api
   * Format: ?module=message&action=get-messages&id={messageId}
   */
  async getMessageStatus(
    messageId: string,
    _originChainId?: number
  ): Promise<{
    status: 'pending' | 'delivered' | 'failed'
    destinationTxHash?: string
    originTxHash?: string
    body?: string
  }> {
    // Use our API route to proxy requests and avoid CORS issues
    const baseUrl = '/api/hyperlane/message'

    try {
      const url = `${baseUrl}?id=${messageId}`
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        return { status: 'pending' }
      }

      const data = await response.json()

      // API returns { status: "1", message: "OK", result: [...] }
      if (data.status !== '1' || !data.result || data.result.length === 0) {
        return { status: 'pending' }
      }

      const message = data.result[0]

      if (message.status === 'delivered') {
        return {
          status: 'delivered',
          destinationTxHash: message.destinationTransaction?.transactionHash,
          originTxHash: message.originTransaction?.transactionHash,
          body: message.body,
        }
      } else if (message.status === 'failed') {
        return { status: 'failed' }
      }

      // Any other status (processing, etc.) is considered pending
      return { status: 'pending' }
    } catch {
      // Silent fail - return pending status
      return { status: 'pending' }
    }
  }

  /**
   * Format gas fee for display
   */
  formatGasFee(fee: bigint, decimals: number = 18): string {
    const formatted = formatUnits(fee, decimals)
    return parseFloat(formatted).toFixed(6)
  }

  /**
   * Get Hyperlane Explorer URL for a message
   */
  getExplorerUrl(messageId: string): string {
    return `https://hyperlane-explorer.karak.network/message/${messageId}`
  }

  /**
   * Get deployment info for a chain
   */
  getDeployment(chainId: number, mode?: HyperlaneMode): HyperlaneDeployment | undefined {
    const targetMode = mode || this.currentMode
    return getHyperlaneDeployment(chainId, targetMode)
  }

  /**
   * Get Mailbox address for a chain
   */
  getMailboxAddress(chainId: number, mode?: HyperlaneMode): Address | null {
    const targetMode = mode || this.currentMode
    return getMailboxFromDeployments(chainId, targetMode) || null
  }

  /**
   * Quote gas for sending a message via Mailbox
   * Note: Self-hosted deployments use MerkleTreeHook which requires NO payment (0n)
   */
  async quoteMessageDispatch(
    publicClient: PublicClient,
    originChainId: number,
    destinationChainId: number,
    recipientAddress: Address,
    messageBody: string
  ): Promise<bigint> {
    const mailbox = this.getMailboxAddress(originChainId)
    if (!mailbox) throw new Error('Mailbox not found for origin chain')

    const destDomainId = this.getDomainId(destinationChainId)
    if (!destDomainId) throw new Error('Destination chain not supported')

    const recipientBytes32 = this.addressToBytes32(recipientAddress)
    const messageBytes = stringToHex(messageBody)

    try {
      const fee = await publicClient.readContract({
        address: mailbox,
        abi: MAILBOX_ABI,
        functionName: 'quoteDispatch',
        args: [destDomainId, recipientBytes32, messageBytes],
      })
      return fee
    } catch (error) {
      console.warn('Failed to quote dispatch:', error)
      // For self-hosted deployments using MerkleTreeHook, no payment is required
      // MerkleTreeHook reverts with "no value expected" if any ETH is sent
      if (this.currentMode === 'self-hosted') {
        return 0n
      }
      // For hosted deployments, use a small fallback estimate
      return parseUnits('0.001', 18)
    }
  }

  /**
   * Send a cross-chain message via Mailbox
   */
  async sendMessage(params: {
    walletClient: WalletClient
    publicClient: PublicClient
    originChainId: number
    destinationChainId: number
    recipientAddress: Address
    messageBody: string
    onProgress?: (progress: HyperlaneProgress) => void
  }): Promise<{ txHash: string; messageId: string }> {
    const { walletClient, publicClient, originChainId, destinationChainId, recipientAddress, messageBody, onProgress } = params

    const account = walletClient.account
    if (!account) throw new Error('Wallet not connected')

    const mailbox = this.getMailboxAddress(originChainId)
    if (!mailbox) throw new Error('Mailbox not found for origin chain')

    const destDomainId = this.getDomainId(destinationChainId)
    if (!destDomainId) throw new Error('Destination chain not supported')

    onProgress?.({ step: 'transfer', status: 'pending' })

    const recipientBytes32 = this.addressToBytes32(recipientAddress)
    const messageBytes = stringToHex(messageBody)

    // Get fee quote
    const fee = await this.quoteMessageDispatch(publicClient, originChainId, destinationChainId, recipientAddress, messageBody)

    onProgress?.({ step: 'transfer', status: 'txPending' })

    try {
      const txHash = await walletClient.writeContract({
        account: account.address,
        chain: walletClient.chain,
        address: mailbox,
        abi: MAILBOX_ABI,
        functionName: 'dispatch',
        args: [destDomainId, recipientBytes32, messageBytes],
        value: fee,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      // Extract message ID from Dispatch event (topic 1)
      const dispatchLog = receipt.logs.find(log => log.topics.length >= 2)
      const messageId = dispatchLog?.topics[1] || '0x'

      onProgress?.({ step: 'transfer', status: 'txSuccess', txHash, messageId: messageId as string })
      onProgress?.({ step: 'relay', status: 'relaying', messageId: messageId as string })

      return { txHash, messageId: messageId as string }
    } catch (error) {
      onProgress?.({ step: 'transfer', status: 'txError', error: error as Error })
      throw error
    }
  }

  /**
   * Get remote Interchain Account address
   */
  async getRemoteICA(
    publicClient: PublicClient,
    originChainId: number,
    destinationChainId: number,
    owner: Address
  ): Promise<Address | null> {
    const deployment = this.getDeployment(originChainId)
    if (!deployment?.interchainAccountRouter) {
      console.warn('ICA Router not found for chain', originChainId)
      return null
    }

    const destDomainId = this.getDomainId(destinationChainId)
    if (!destDomainId) return null

    try {
      const icaAddress = await publicClient.readContract({
        address: deployment.interchainAccountRouter,
        abi: ICA_ROUTER_ABI,
        functionName: 'getRemoteInterchainAccount',
        args: [destDomainId, owner],
      })
      return icaAddress
    } catch (error: any) {
      // "no router specified for destination" means the ICA routers aren't enrolled for this route
      // This is expected for routes that haven't been set up - log as warning, not error
      const message = error?.message || error?.toString() || ''
      if (message.includes('no router specified for destination')) {
        console.warn(`ICA route not available: ${originChainId} -> ${destinationChainId}. Routers need to be enrolled.`)
      } else {
        console.warn('Failed to get remote ICA:', message)
      }
      return null
    }
  }

  /**
   * Quote gas for ICA remote call
   * Note: Self-hosted deployments use MerkleTreeHook which requires NO payment (0n)
   */
  async quoteICACall(
    publicClient: PublicClient,
    originChainId: number,
    destinationChainId: number
  ): Promise<bigint> {
    const deployment = this.getDeployment(originChainId)
    if (!deployment?.interchainAccountRouter) throw new Error('ICA Router not found')

    const destDomainId = this.getDomainId(destinationChainId)
    if (!destDomainId) throw new Error('Destination chain not supported')

    try {
      const fee = await publicClient.readContract({
        address: deployment.interchainAccountRouter,
        abi: ICA_ROUTER_ABI,
        functionName: 'quoteGasPayment',
        args: [destDomainId],
      })
      return fee
    } catch (error) {
      console.warn('Failed to quote ICA gas:', error)
      // For self-hosted deployments using MerkleTreeHook, no payment is required
      if (this.currentMode === 'self-hosted') {
        return 0n
      }
      return parseUnits('0.002', 18) // Higher estimate for hosted ICA
    }
  }

  /**
   * Execute a remote call via Interchain Account
   */
  async executeICACall(params: {
    walletClient: WalletClient
    publicClient: PublicClient
    originChainId: number
    destinationChainId: number
    calls: { to: Address; value: bigint; data: `0x${string}` }[]
    onProgress?: (progress: HyperlaneProgress) => void
  }): Promise<{ txHash: string; messageId: string }> {
    const { walletClient, publicClient, originChainId, destinationChainId, calls, onProgress } = params

    const account = walletClient.account
    if (!account) throw new Error('Wallet not connected')

    const deployment = this.getDeployment(originChainId)
    if (!deployment?.interchainAccountRouter) throw new Error('ICA Router not found')

    const destDomainId = this.getDomainId(destinationChainId)
    if (!destDomainId) throw new Error('Destination chain not supported')

    onProgress?.({ step: 'transfer', status: 'pending' })

    // Format calls for ICA (address as bytes32)
    const formattedCalls = calls.map(call => ({
      to: this.addressToBytes32(call.to),
      value: call.value,
      data: call.data,
    }))

    // Get fee quote
    const fee = await this.quoteICACall(publicClient, originChainId, destinationChainId)

    onProgress?.({ step: 'transfer', status: 'txPending' })

    try {
      const txHash = await walletClient.writeContract({
        account: account.address,
        chain: walletClient.chain,
        address: deployment.interchainAccountRouter,
        abi: ICA_ROUTER_ABI,
        functionName: 'callRemote',
        args: [destDomainId, formattedCalls],
        value: fee,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      // Extract message ID
      const dispatchLog = receipt.logs.find(log => log.topics.length >= 2)
      const messageId = dispatchLog?.topics[1] || '0x'

      onProgress?.({ step: 'transfer', status: 'txSuccess', txHash, messageId: messageId as string })
      onProgress?.({ step: 'relay', status: 'relaying', messageId: messageId as string })

      return { txHash, messageId: messageId as string }
    } catch (error) {
      onProgress?.({ step: 'transfer', status: 'txError', error: error as Error })
      throw error
    }
  }

  /**
   * Poll for message delivery status
   */
  async pollMessageStatus(
    messageId: string,
    originChainId: number,
    destinationChainId: number,
    publicClient: PublicClient,
    onStatusChange?: (status: 'pending' | 'delivered' | 'failed', destinationTxHash?: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<{ status: 'delivered' | 'failed' | 'timeout'; destinationTxHash?: string }> {
    // First check on-chain delivery status
    const destMailbox = this.getMailboxAddress(destinationChainId)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Try on-chain check first (for self-deployed chains)
      if (destMailbox) {
        try {
          const destPublicClient = createPublicClient({
            chain: HYPERLANE_TESTNET_CHAINS.find(c => c.id === destinationChainId) ||
                   HYPERLANE_MAINNET_CHAINS.find(c => c.id === destinationChainId),
            transport: http(),
          })

          const delivered = await destPublicClient.readContract({
            address: destMailbox,
            abi: MAILBOX_ABI,
            functionName: 'delivered',
            args: [messageId as `0x${string}`],
          })

          if (delivered) {
            onStatusChange?.('delivered')
            return { status: 'delivered' }
          }
        } catch (error) {
          // Ignore on-chain check errors, fall back to API
        }
      }

      // Try Explorer API
      const apiStatus = await this.getMessageStatus(messageId, originChainId)
      if (apiStatus.status === 'delivered') {
        onStatusChange?.('delivered', apiStatus.destinationTxHash)
        return { status: 'delivered', destinationTxHash: apiStatus.destinationTxHash }
      } else if (apiStatus.status === 'failed') {
        onStatusChange?.('failed')
        return { status: 'failed' }
      }

      onStatusChange?.('pending')
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    return { status: 'timeout' }
  }

  /**
   * Read last message received by TestRecipient
   */
  async readTestRecipient(
    publicClient: PublicClient,
    chainId: number
  ): Promise<{ sender: string; data: string } | null> {
    const deployment = this.getDeployment(chainId)
    if (!deployment?.testRecipient) return null

    try {
      const [lastSender, lastData] = await Promise.all([
        publicClient.readContract({
          address: deployment.testRecipient,
          abi: TEST_RECIPIENT_ABI,
          functionName: 'lastSender',
        }),
        publicClient.readContract({
          address: deployment.testRecipient,
          abi: TEST_RECIPIENT_ABI,
          functionName: 'lastData',
        }),
      ])

      return {
        sender: lastSender as string,
        data: hexToString(lastData as `0x${string}`),
      }
    } catch (error) {
      console.error('Failed to read TestRecipient:', error)
      return null
    }
  }
}

// Export singleton instance
export const hyperlaneService = new HyperlaneService()

// Re-export types for convenience
export type { HyperlaneMode, HyperlaneDeployment, WarpRouteDeployment }
