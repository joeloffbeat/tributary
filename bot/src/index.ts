import { config } from './config'
import { Trader } from './trader'
import { PricePatternGenerator } from './patterns'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Parse command line args for max trades
const args = process.argv.slice(2)
const maxTradesArg = args.find(arg => arg.startsWith('--trades='))
const maxTrades = maxTradesArg ? parseInt(maxTradesArg.split('=')[1]!) : 0 // 0 = unlimited

async function main() {
  console.log('='.repeat(50))
  console.log('  Tributary Trading Bot')
  console.log('='.repeat(50))
  console.log(`Pool ID: ${config.poolId}`)
  console.log(`Wallets: ${config.privateKeys.length}`)
  console.log(`Trade range: $${config.minTradeUSD} - $${config.maxTradeUSD}`)
  console.log(`Interval: ${config.minIntervalMs / 1000}s - ${config.maxIntervalMs / 1000}s`)
  if (maxTrades > 0) {
    console.log(`Max trades: ${maxTrades}`)
  }
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
  let errorCount = 0
  const maxErrors = 5 // Stop after 5 consecutive errors

  while (maxTrades === 0 || tradeCount < maxTrades) {
    try {
      const { isBuy, sizeMultiplier } = patterns.nextTrade()

      const baseAmount = config.minTradeUSD +
        Math.random() * (config.maxTradeUSD - config.minTradeUSD)
      const amount = Math.round(baseAmount * sizeMultiplier)

      console.log(`\n[Trade #${tradeCount + 1}${maxTrades > 0 ? `/${maxTrades}` : ''}] ${isBuy ? 'BUY' : 'SELL'} ~$${amount}`)

      if (isBuy) {
        await trader.buy(amount)
      } else {
        await trader.sell(amount)
      }

      tradeCount++
      errorCount = 0 // Reset error count on success

      // Update patterns with new price
      const newPrice = await trader.getCurrentPrice()
      patterns.updatePrice(newPrice)
      patterns.maybeShiftBase()

      console.log(`  New price: $${newPrice.toFixed(4)}`)

      // Check if we've reached the target
      if (maxTrades > 0 && tradeCount >= maxTrades) {
        console.log('\n' + '='.repeat(50))
        console.log(`  Completed ${tradeCount} trades!`)
        console.log('='.repeat(50))
        break
      }

      // Random delay
      const delay = config.minIntervalMs +
        Math.random() * (config.maxIntervalMs - config.minIntervalMs)
      console.log(`  Next trade in ${(delay / 1000).toFixed(0)}s...`)

      await sleep(delay)

    } catch (error: unknown) {
      errorCount++
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`\n[ERROR ${errorCount}/${maxErrors}] Trade failed: ${errorMessage}`)

      if (errorCount >= maxErrors) {
        console.error('\nToo many consecutive errors, stopping bot.')
        process.exit(1)
      }

      // Wait before retrying
      console.log('  Waiting 5s before retry...')
      await sleep(5_000)
    }
  }

  // Final balance check
  console.log('\nFinal balances:')
  await trader.checkBalances()
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
