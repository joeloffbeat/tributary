// Factory Contract ABI
export const FACTORY_ABI = [
  {
    type: 'function',
    name: 'createVault',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'storyIPId', type: 'bytes32' },
          { name: 'tokenName', type: 'string' },
          { name: 'tokenSymbol', type: 'string' },
          { name: 'totalSupply', type: 'uint256' },
          { name: 'creatorAllocation', type: 'uint256' },
          { name: 'paymentToken', type: 'address' },
        ],
      },
    ],
    outputs: [
      { name: 'vault', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getVaultsByCreator',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVaultByIPId',
    inputs: [{ name: 'storyIPId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllVaults',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'vault', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'storyIPId', type: 'bytes32' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVaultRecord',
    inputs: [{ name: 'vault', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'vault', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'creator', type: 'address' },
          { name: 'storyIPId', type: 'bytes32' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isValidVault',
    inputs: [{ name: 'vault', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolTreasury',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
] as const
