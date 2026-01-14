import { config } from './config.js'
import { Trader } from './trader.js'
import { PricePatternGenerator } from './patterns.js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  console.log('='.repeat(50))
  console.log('  Tributary Trading Bot')
  console.log('='.repeat(50))
  console.log(`Pool ID: ${config.poolId}`)
  console.log(`Wallets: ${config.privateKeys.length}`)
  console.log(`Trade range: $${config.minTradeUSD} - $${config.maxTradeUSD}`)
  console.log(`Interval: ${config.minIntervalMs / 1000}s - ${config.maxIntervalMs / 1000}s`)
  console.log('='.repeat(50))

  const trader = new Trader()
  await trader.initialize()

  // Check initial balances
  await trader.checkBalances()

  const initialPrice = await trader.getCurrentPrice()
  const patterns = new PricePatternGenerator(initialPrice)

  console.log(`\nInitial price: $${initialPrice.toFixed(4)}`)
  console.log('-'.repeat(50))

  let tradeCount = 0

  while (true) {
    try {
      const { isBuy, sizeMultiplier } = patterns.nextTrade()

      const baseAmount = config.minTradeUSD +
        Math.random() * (config.maxTradeUSD - config.minTradeUSD)
      const amount = Math.round(baseAmount * sizeMultiplier)

      console.log(`\n[Trade #${++tradeCount}] ${isBuy ? 'BUY' : 'SELL'} ~$${amount}`)

      if (isBuy) {
        await trader.buy(amount)
      } else {
        await trader.sell(amount)
      }

      // Update patterns with new price
      const newPrice = await trader.getCurrentPrice()
      patterns.updatePrice(newPrice)
      patterns.maybeShiftBase()

      console.log(`  New price: $${newPrice.toFixed(4)}`)

      // Random delay
      const delay = config.minIntervalMs +
        Math.random() * (config.maxIntervalMs - config.minIntervalMs)
      console.log(`  Next trade in ${(delay / 1000).toFixed(0)}s...`)

      await sleep(delay)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`\n[ERROR] Trade failed: ${errorMessage}`)

      // Wait before retrying
      console.log('  Waiting 10s before retry...')
      await sleep(10_000)
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down trading bot...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\nShutting down trading bot...')
  process.exit(0)
})

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
