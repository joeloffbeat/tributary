import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, createWalletClient, http, Hex } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia, avalancheFuji, polygonAmoy } from 'viem/chains'
import { defineChain } from 'viem'

// Story Aenid chain definition
const storyAenid = defineChain({
  id: 1315,
  name: 'Story Aenid Testnet',
  nativeCurrency: { decimals: 18, name: 'IP', symbol: 'IP' },
  rpcUrls: { default: { http: ['https://aeneid.storyrpc.io'] } },
  blockExplorers: { default: { name: 'Story Explorer', url: 'https://aeneid.storyscan.xyz' } },
  testnet: true,
})

// Chain configurations
const CHAINS: Record<number, { chain: any; mailbox: Hex; rpc: string }> = {
  11155111: {
    chain: sepolia,
    mailbox: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com'
  },
  43113: {
    chain: avalancheFuji,
    mailbox: '0x60c3ca08D3df3F5fA583c535D9E44F3629F52452',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc'
  },
  1315: {
    chain: storyAenid,
    mailbox: '0x6feB4f3eeD23D6cdDa54ec67d5d649BE015f782d',
    rpc: 'https://aeneid.storyrpc.io'
  },
  80002: {
    chain: polygonAmoy,
    mailbox: '0xD8f50a509EFe389574dD378b0EF03e33558222eA',
    rpc: 'https://rpc-amoy.polygon.technology'
  },
}

const MAILBOX_ABI = [
  { name: 'process', type: 'function', inputs: [{ name: '_metadata', type: 'bytes' }, { name: '_message', type: 'bytes' }], outputs: [] },
  { name: 'delivered', type: 'function', inputs: [{ name: '_id', type: 'bytes32' }], outputs: [{ type: 'bool' }], stateMutability: 'view' },
] as const

/**
 * POST /api/bridge/process
 * Process a Hyperlane message on the destination chain using server wallet
 */
export async function POST(request: NextRequest) {
  try {
    const { destChainId, messageBytes, messageId } = await request.json()

    if (!destChainId || !messageBytes || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const privateKey = process.env.SERVER_WALLET_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json({ error: 'Server wallet not configured' }, { status: 500 })
    }

    const chainConfig = CHAINS[destChainId]
    if (!chainConfig) {
      return NextResponse.json({ error: 'Unsupported destination chain' }, { status: 400 })
    }

    // Create clients
    const account = privateKeyToAccount(privateKey as Hex)
    const publicClient = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.rpc),
    })
    const walletClient = createWalletClient({
      account,
      chain: chainConfig.chain,
      transport: http(chainConfig.rpc),
    })

    // Check if already delivered
    const isDelivered = await publicClient.readContract({
      address: chainConfig.mailbox,
      abi: MAILBOX_ABI,
      functionName: 'delivered',
      args: [messageId as Hex],
    })

    if (isDelivered) {
      return NextResponse.json({ success: true, alreadyDelivered: true })
    }

    // Process the message
    const txHash = await walletClient.writeContract({
      chain: chainConfig.chain,
      address: chainConfig.mailbox,
      abi: MAILBOX_ABI,
      functionName: 'process',
      args: ['0x' as Hex, messageBytes as Hex],
    })

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

    return NextResponse.json({
      success: receipt.status === 'success',
      txHash,
      blockNumber: receipt.blockNumber.toString(),
    })
  } catch (error) {
    console.error('Bridge process error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process bridge' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bridge/process?destChainId=X&messageId=Y
 * Check if a message has been delivered
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const destChainId = searchParams.get('destChainId')
  const messageId = searchParams.get('messageId')

  if (!destChainId || !messageId) {
    return NextResponse.json({ error: 'Missing destChainId or messageId' }, { status: 400 })
  }

  const chainConfig = CHAINS[parseInt(destChainId)]
  if (!chainConfig) {
    return NextResponse.json({ error: 'Unsupported chain' }, { status: 400 })
  }

  try {
    const publicClient = createPublicClient({
      chain: chainConfig.chain,
      transport: http(chainConfig.rpc),
    })

    const isDelivered = await publicClient.readContract({
      address: chainConfig.mailbox,
      abi: MAILBOX_ABI,
      functionName: 'delivered',
      args: [messageId as Hex],
    })

    return NextResponse.json({ delivered: isDelivered })
  } catch (error) {
    console.error('Check delivery error:', error)
    return NextResponse.json({ delivered: false })
  }
}
