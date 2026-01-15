// Cross-chain Story Protocol Constants

// Contract addresses
export const STORY_BRIDGE_ADDRESS = '0x75076759a923c36C97675dD11A93d04DE3Bb5bf4' as const
export const STORY_RECEIVER_ADDRESS = '0xA846E4D57cDB3077ED67E5d792949F7A6ef2a75d' as const

// Chain IDs
export const MANTLE_SEPOLIA_CHAIN_ID = 5003
export const STORY_AENEID_CHAIN_ID = 1315

// Domain IDs (same as chain IDs for these chains)
export const MANTLE_DOMAIN_ID = 5003
export const STORY_DOMAIN_ID = 1315

// Explorer URLs
export const MANTLE_EXPLORER = 'https://sepolia.mantlescan.xyz'
export const STORY_EXPLORER = 'https://aeneid.explorer.story.foundation'

// Hyperlane Explorer for message tracking
export const HYPERLANE_EXPLORER = 'https://explorer.hyperlane.xyz'

// StoryBridge ABI (minimal)
export const STORY_BRIDGE_ABI = [
  {
    inputs: [
      { name: 'receiverIpId', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'payRoyalty',
    outputs: [{ name: 'messageId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'ancestorIpId', type: 'address' },
      { name: 'currencyTokens', type: 'address[]' },
      { name: 'childIpIds', type: 'address[]' },
    ],
    name: 'claimRevenue',
    outputs: [{ name: 'messageId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'targetIpId', type: 'address' },
      { name: 'evidenceHash', type: 'bytes32' },
      { name: 'targetTag', type: 'bytes32' },
    ],
    name: 'raiseDispute',
    outputs: [{ name: 'messageId', type: 'bytes32' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'receiverIpId', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'quotePayRoyalty',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'ancestorIpId', type: 'address' },
      { name: 'currencyTokens', type: 'address[]' },
      { name: 'childIpIds', type: 'address[]' },
    ],
    name: 'quoteClaimRevenue',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'targetIpId', type: 'address' },
      { name: 'evidenceHash', type: 'bytes32' },
      { name: 'targetTag', type: 'bytes32' },
    ],
    name: 'quoteRaiseDispute',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
