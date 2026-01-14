// TributaryAMM ABI
export const AMM_ABI = [
  {
    type: 'function',
    name: 'buyTokens',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'quoteIn', type: 'uint256' },
      { name: 'minTokenOut', type: 'uint256' },
    ],
    outputs: [{ name: 'tokenOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'sellTokens',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenIn', type: 'uint256' },
      { name: 'minQuoteOut', type: 'uint256' },
    ],
    outputs: [{ name: 'quoteOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createPool',
    inputs: [
      { name: 'royaltyToken', type: 'address' },
      { name: 'quoteToken', type: 'address' },
    ],
    outputs: [{ name: 'poolId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addLiquidity',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenAmount', type: 'uint256' },
      { name: 'quoteAmount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeLiquidity',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenAmount', type: 'uint256' },
      { name: 'quoteAmount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPool',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'royaltyToken', type: 'address' },
          { name: 'quoteToken', type: 'address' },
          { name: 'vault', type: 'address' },
          { name: 'reserveToken', type: 'uint256' },
          { name: 'reserveQuote', type: 'uint256' },
          { name: 'exists', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getQuoteBuy',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'quoteIn', type: 'uint256' },
    ],
    outputs: [
      { name: 'tokenOut', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getQuoteSell',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenIn', type: 'uint256' },
    ],
    outputs: [
      { name: 'quoteOut', type: 'uint256' },
      { name: 'fee', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'poolIdByToken',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Swap',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'trader', type: 'address', indexed: true },
      { name: 'isBuy', type: 'bool', indexed: false },
      { name: 'amountIn', type: 'uint256', indexed: false },
      { name: 'amountOut', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'reserveToken', type: 'uint256', indexed: false },
      { name: 'reserveQuote', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'royaltyToken', type: 'address', indexed: true },
      { name: 'quoteToken', type: 'address', indexed: true },
      { name: 'vault', type: 'address', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidityAdded',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'tokenAmount', type: 'uint256', indexed: false },
      { name: 'quoteAmount', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidityRemoved',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'provider', type: 'address', indexed: true },
      { name: 'tokenAmount', type: 'uint256', indexed: false },
      { name: 'quoteAmount', type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const
