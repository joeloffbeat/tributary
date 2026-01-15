import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
  formatUnits,
  type PublicClient,
  type Chain,
  type Account
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { config } from './config'
import { TributaryAMMABI, ERC20ABI } from './abis'

// Mantle Sepolia chain config
const mantleSepolia: Chain = {
  id: 5003,
  name: 'Mantle Sepolia',
  nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.mantle.xyz'] }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://sepolia.mantlescan.xyz' }
  }
}

interface Pool {
  royaltyToken: `0x${string}`
  quoteToken: `0x${string}`
  vault: `0x${string}`
  reserveToken: bigint
  reserveQuote: bigint
  exists: boolean
}

interface Wallet {
  client: ReturnType<typeof createWalletClient>
  account: Account
}

export class Trader {
  private wallets: Wallet[]
  private publicClient: PublicClient
  private currentWalletIndex = 0
  private tokenDecimals: number = 18

  constructor() {
    this.publicClient = createPublicClient({
      chain: mantleSepolia,
      transport: http(config.rpcUrl)
    })

    this.wallets = config.privateKeys.map(key => {
      const account = privateKeyToAccount(key)
      const client = createWalletClient({
        account,
        chain: mantleSepolia,
        transport: http(config.rpcUrl)
      })
      return { client, account }
    })
  }

  async initialize(): Promise<void> {
    const pool = await this.getPool()
    const decimals = await this.publicClient.readContract({
      address: pool.royaltyToken,
      abi: ERC20ABI,
      functionName: 'decimals'
    })
    this.tokenDecimals = decimals
    console.log(`Token decimals: ${this.tokenDecimals}`)
  }

  async getPool(): Promise<Pool> {
    const pool = await this.publicClient.readContract({
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'getPool',
      args: [BigInt(config.poolId)]
    })
    return pool as Pool
  }

  async getCurrentPrice(): Promise<number> {
    const price = await this.publicClient.readContract({
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'getPrice',
      args: [BigInt(config.poolId)]
    })
    return parseFloat(formatUnits(price, 6))
  }

  async buy(amountUSD: number): Promise<string> {
    const { client, account } = this.getNextWallet()
    const amountIn = parseUnits(amountUSD.toString(), 6)

    // Check allowance and approve if needed
    const allowance = await this.publicClient.readContract({
      address: config.usdtAddress,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [account.address, config.ammAddress]
    })

    if (allowance < amountIn) {
      const approveHash = await client.writeContract({
        chain: mantleSepolia,
        account,
        address: config.usdtAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [config.ammAddress, amountIn * 10n]
      })
      await this.publicClient.waitForTransactionReceipt({ hash: approveHash })
    }

    // Get quote for slippage
    const [tokenOut] = await this.publicClient.readContract({
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'getQuoteBuy',
      args: [BigInt(config.poolId), amountIn]
    })

    const minOut = tokenOut * 95n / 100n

    // Execute buy
    const hash = await client.writeContract({
      chain: mantleSepolia,
      account,
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'buyTokens',
      args: [BigInt(config.poolId), amountIn, minOut]
    })

    await this.publicClient.waitForTransactionReceipt({ hash })

    const tokensReceived = formatUnits(tokenOut, this.tokenDecimals)
    console.log(`  BUY: $${amountUSD} USDT -> ${parseFloat(tokensReceived).toFixed(4)} tokens`)
    console.log(`  TX: ${hash}`)

    return hash
  }

  async sell(amountUSD: number): Promise<string> {
    const { client, account } = this.getNextWallet()
    const price = await this.getCurrentPrice()
    const tokenAmount = amountUSD / price
    const amountIn = parseUnits(tokenAmount.toFixed(this.tokenDecimals), this.tokenDecimals)

    const pool = await this.getPool()

    // Check allowance and approve if needed
    const allowance = await this.publicClient.readContract({
      address: pool.royaltyToken,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [account.address, config.ammAddress]
    })

    if (allowance < amountIn) {
      const approveHash = await client.writeContract({
        chain: mantleSepolia,
        account,
        address: pool.royaltyToken,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [config.ammAddress, amountIn * 10n]
      })
      await this.publicClient.waitForTransactionReceipt({ hash: approveHash })
    }

    // Get quote
    const [quoteOut] = await this.publicClient.readContract({
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'getQuoteSell',
      args: [BigInt(config.poolId), amountIn]
    })

    const minOut = quoteOut * 95n / 100n

    // Execute sell
    const hash = await client.writeContract({
      chain: mantleSepolia,
      account,
      address: config.ammAddress,
      abi: TributaryAMMABI,
      functionName: 'sellTokens',
      args: [BigInt(config.poolId), amountIn, minOut]
    })

    await this.publicClient.waitForTransactionReceipt({ hash })

    const usdtReceived = formatUnits(quoteOut, 6)
    console.log(`  SELL: ${tokenAmount.toFixed(4)} tokens -> $${parseFloat(usdtReceived).toFixed(2)} USDT`)
    console.log(`  TX: ${hash}`)

    return hash
  }

  async checkBalances(): Promise<void> {
    console.log('\nWallet balances:')
    const pool = await this.getPool()

    for (let i = 0; i < this.wallets.length; i++) {
      const { account } = this.wallets[i]!

      const usdtBalance = await this.publicClient.readContract({
        address: config.usdtAddress,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })

      const tokenBalance = await this.publicClient.readContract({
        address: pool.royaltyToken,
        abi: ERC20ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })

      console.log(`  Wallet ${i + 1} (${account.address.slice(0, 10)}...):`)
      console.log(`    USDT: $${formatUnits(usdtBalance, 6)}`)
      console.log(`    Token: ${formatUnits(tokenBalance, this.tokenDecimals)}`)
    }
  }

  private getNextWallet(): Wallet {
    const wallet = this.wallets[this.currentWalletIndex]!
    this.currentWalletIndex = (this.currentWalletIndex + 1) % this.wallets.length
    return wallet
  }
}
