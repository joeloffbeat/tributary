import dotenv from 'dotenv'
dotenv.config()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config = {
  rpcUrl: requireEnv('RPC_URL'),
  privateKeys: requireEnv('PRIVATE_KEYS').split(',') as `0x${string}`[],
  ammAddress: requireEnv('AMM_ADDRESS') as `0x${string}`,
  usdtAddress: requireEnv('USDT_ADDRESS') as `0x${string}`,
  poolId: parseInt(process.env.POOL_ID || '1'),

  // Trading parameters
  minTradeUSD: parseFloat(process.env.MIN_TRADE_USD || '50'),
  maxTradeUSD: parseFloat(process.env.MAX_TRADE_USD || '500'),
  minIntervalMs: parseInt(process.env.MIN_INTERVAL_MS || '15000'),
  maxIntervalMs: parseInt(process.env.MAX_INTERVAL_MS || '90000'),

  // Price movement
  volatility: 0.015,           // 1.5% base volatility
  trendStrength: 0.3,          // How strongly to follow trends
  meanReversionStrength: 0.2,  // Pull toward base price
}
