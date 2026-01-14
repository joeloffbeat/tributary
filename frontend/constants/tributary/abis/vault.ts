// Vault Contract ABI
export const VAULT_ABI = [
  {
    type: 'function',
    name: 'depositRoyalty',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'distribute',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claim',
    inputs: [{ name: 'distributionId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimMultiple',
    inputs: [{ name: 'distributionIds', type: 'uint256[]' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'pendingRewards',
    inputs: [{ name: 'holder', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVaultInfo',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'storyIPId', type: 'bytes32' },
          { name: 'creator', type: 'address' },
          { name: 'royaltyToken', type: 'address' },
          { name: 'paymentToken', type: 'address' },
          { name: 'totalDeposited', type: 'uint256' },
          { name: 'totalDistributed', type: 'uint256' },
          { name: 'pendingDistribution', type: 'uint256' },
          { name: 'lastDistributionTime', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDistribution',
    inputs: [{ name: 'distributionId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'snapshotId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'totalClaimed', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const
