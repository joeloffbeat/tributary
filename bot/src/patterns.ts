import { config } from './config.js'

export class PricePatternGenerator {
  private basePrice: number
  private currentPrice: number
  private trend: number = 0
  private momentum: number = 0

  constructor(initialPrice: number) {
    this.basePrice = initialPrice
    this.currentPrice = initialPrice
  }

  nextTrade(): { isBuy: boolean; sizeMultiplier: number } {
    // Random component
    const random = Math.random()

    // Mean reversion force (pulls toward base price)
    const deviation = (this.currentPrice - this.basePrice) / this.basePrice
    const meanReversionForce = -deviation * config.meanReversionStrength

    // Trend following
    const trendForce = this.trend * config.trendStrength

    // Momentum (recent direction)
    const momentumForce = this.momentum * 0.1

    // Combined probability
    const buyProbability = 0.5 + meanReversionForce + trendForce + momentumForce

    const isBuy = random < buyProbability

    // Size varies - larger trades near support/resistance
    const distanceFromBase = Math.abs(deviation)
    const sizeMultiplier = 0.5 + Math.random() + distanceFromBase * 2

    return { isBuy, sizeMultiplier }
  }

  updatePrice(newPrice: number): void {
    const change = (newPrice - this.currentPrice) / this.currentPrice

    // Update momentum (smoothed recent direction)
    this.momentum = this.momentum * 0.7 + change * 0.3

    // Update trend (longer-term direction)
    this.trend = this.trend * 0.9 + change * 0.1

    this.currentPrice = newPrice
  }

  maybeShiftBase(): void {
    // Occasionally shift base price (simulate news/events)
    if (Math.random() < 0.005) { // 0.5% chance per trade
      const shift = (Math.random() - 0.5) * 0.08 // +/-4%
      this.basePrice *= (1 + shift)
      console.log(`  Base price shifted to $${this.basePrice.toFixed(4)}`)
    }
  }
}
