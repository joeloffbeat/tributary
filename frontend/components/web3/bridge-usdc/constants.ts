// =============================================================================
// Bridge USDC - Constants
// =============================================================================

import type { UsdcChainConfig } from './types'

// USDC Warp Route deployed addresses
export const USDC_CHAINS: UsdcChainConfig[] = [
  {
    chainId: 11155111,
    chainName: 'sepolia',
    displayName: 'Sepolia',
    routerAddress: '0x2F427125E2Cc9fd050e46bA646B75490176fDe27',
    tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Circle testnet USDC
    mailboxAddress: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    type: 'collateral',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  },
  {
    chainId: 1315,
    chainName: 'storyaenid',
    displayName: 'Story Aenid',
    routerAddress: '0x33641e15d8f590161a47Fe696cF3C819d5636e71',
    tokenAddress: '0x33641e15d8f590161a47Fe696cF3C819d5636e71', // Synthetic (router is token)
    mailboxAddress: '0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d',
    type: 'synthetic',
    explorerUrl: 'https://aeneid.storyscan.xyz',
    rpcUrl: 'https://aeneid.storyrpc.io',
  },
  {
    chainId: 43113,
    chainName: 'fuji',
    displayName: 'Avalanche Fuji',
    routerAddress: '0x42E86212057aD345B164EeEAc2F410Ca96a68200',
    tokenAddress: '0x42E86212057aD345B164EeEAc2F410Ca96a68200', // Synthetic (router is token)
    mailboxAddress: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    type: 'synthetic',
    explorerUrl: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  {
    chainId: 80002,
    chainName: 'polygonamoy',
    displayName: 'Polygon Amoy',
    routerAddress: '0x6751dcD58F63dB5b1175d8668d7cF2CeE38D07A8',
    tokenAddress: '0x6751dcD58F63dB5b1175d8668d7cF2CeE38D07A8', // Synthetic (router is token)
    mailboxAddress: '0xD8f50a509EFe389574dD378b0EF03e33558222eA',
    type: 'synthetic',
    explorerUrl: 'https://amoy.polygonscan.com',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
  },
]

// Circle USDC Faucet URL
export const CIRCLE_FAUCET_URL = 'https://faucet.circle.com/'

// Relay timeout before server fallback (in ms)
export const RELAY_TIMEOUT_MS = 15000 // 15 seconds

// Polling interval for checking delivery (in ms)
export const DELIVERY_POLL_INTERVAL_MS = 3000 // 3 seconds

// Get chain config by chainId
export function getUsdcChainConfig(chainId: number): UsdcChainConfig | undefined {
  return USDC_CHAINS.find((c) => c.chainId === chainId)
}

// Get destination chains for bridging
export function getDestinationChains(sourceChainId: number): UsdcChainConfig[] {
  return USDC_CHAINS.filter((c) => c.chainId !== sourceChainId)
}

// Check if chain supports USDC bridging
export function isUsdcBridgeSupported(chainId: number): boolean {
  return USDC_CHAINS.some((c) => c.chainId === chainId)
}

// ERC20 ABI for balance and approval
export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
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
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// HypERC20 / TokenRouter ABI for transfers
export const TOKEN_ROUTER_ABI = [
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

// Mailbox ABI for checking delivery
export const MAILBOX_ABI = [
  {
    name: 'delivered',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_id', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
