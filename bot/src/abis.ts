export const TributaryAMMABI = [
  {
    type: 'function',
    name: 'buyTokens',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'quoteIn', type: 'uint256' },
      { name: 'minTokenOut', type: 'uint256' }
    ],
    outputs: [{ name: 'tokenOut', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'sellTokens',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenIn', type: 'uint256' },
      { name: 'minQuoteOut', type: 'uint256' }
    ],
    outputs: [{ name: 'quoteOut', type: 'uint256' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'getQuoteBuy',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'quoteIn', type: 'uint256' }
    ],
    outputs: [
      { name: 'tokenOut', type: 'uint256' },
      { name: 'fee', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getQuoteSell',
    inputs: [
      { name: 'poolId', type: 'uint256' },
      { name: 'tokenIn', type: 'uint256' }
    ],
    outputs: [
      { name: 'quoteOut', type: 'uint256' },
      { name: 'fee', type: 'uint256' }
    ],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getPrice',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'getPool',
    inputs: [{ name: 'poolId', type: 'uint256' }],
    outputs: [{
      name: '',
      type: 'tuple',
      components: [
        { name: 'royaltyToken', type: 'address' },
        { name: 'quoteToken', type: 'address' },
        { name: 'vault', type: 'address' },
        { name: 'reserveToken', type: 'uint256' },
        { name: 'reserveQuote', type: 'uint256' },
        { name: 'exists', type: 'bool' }
      ]
    }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'poolCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const

export const ERC20ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  }
] as const
