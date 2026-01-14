// Marketplace Contract ABI
export const MARKETPLACE_ABI = [
  {
    type: 'function',
    name: 'createListing',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'royaltyToken', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'pricePerToken', type: 'uint256' },
          { name: 'paymentToken', type: 'address' },
          { name: 'duration', type: 'uint256' },
        ],
      },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'buy',
    inputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelListing',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updatePrice',
    inputs: [
      { name: 'listingId', type: 'uint256' },
      { name: 'newPrice', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getActiveListing',
    inputs: [{ name: 'listingId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'listingId', type: 'uint256' },
          { name: 'seller', type: 'address' },
          { name: 'royaltyToken', type: 'address' },
          { name: 'vault', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'pricePerToken', type: 'uint256' },
          { name: 'paymentToken', type: 'address' },
          { name: 'sold', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isPrimarySale', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getListingsByToken',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'listingId', type: 'uint256' },
          { name: 'seller', type: 'address' },
          { name: 'royaltyToken', type: 'address' },
          { name: 'vault', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'pricePerToken', type: 'uint256' },
          { name: 'paymentToken', type: 'address' },
          { name: 'sold', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'isPrimarySale', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'expiresAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFloorPrice',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const
