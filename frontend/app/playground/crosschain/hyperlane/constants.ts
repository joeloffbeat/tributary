import { keccak256, toBytes } from 'viem'

// DispatchId event signature: keccak256("DispatchId(bytes32)")
export const DISPATCH_ID_EVENT_SIGNATURE = keccak256(toBytes('DispatchId(bytes32)'))

// LocalStorage keys
export const STORAGE_KEYS = {
  MODE: 'hyperlane-mode',
  HISTORY: 'hyperlane-history',
} as const

// Polling interval for message status updates (3 seconds to avoid API rate limits)
export const POLLING_INTERVAL_MS = 3000

// ABIs for TransactionDialog
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
] as const

export const MAILBOX_ABI = [
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
] as const

export const ICA_ROUTER_ABI = [
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
] as const

export const ERC20_ABI = [
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
