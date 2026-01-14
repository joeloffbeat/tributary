import { BigInt, BigDecimal, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  PoolCreated as PoolCreatedEvent,
  Swap as SwapEvent,
  LiquidityAdded as LiquidityAddedEvent,
  LiquidityRemoved as LiquidityRemovedEvent
} from "../../generated/TributaryAMM/TributaryAMM";
import {
  Pool,
  Swap,
  Candle1m,
  Candle5m,
  Candle1h,
  Candle1d,
  Token,
  Vault,
  ProtocolStats
} from "../../generated/schema";

// Constants for time intervals (in seconds)
const MINUTE = 60;
const FIVE_MINUTES = 300;
const HOUR = 3600;
const DAY = 86400;

// Decimals for BigDecimal conversion
const USDT_DECIMALS = 6;
const TOKEN_DECIMALS = 18;

function toDecimal(value: BigInt, decimals: i32): BigDecimal {
  let precision = BigInt.fromI32(10).pow(decimals as u8).toBigDecimal();
  return value.toBigDecimal().div(precision);
}

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load("protocol");
  if (stats == null) {
    stats = new ProtocolStats("protocol");
    stats.totalVaults = BigInt.fromI32(0);
    stats.totalVolume = BigDecimal.fromString("0");
    stats.totalRoyaltiesDistributed = BigDecimal.fromString("0");
    stats.totalFeesCollected = BigDecimal.fromString("0");
    stats.totalHolders = BigInt.fromI32(0);
    stats.save();
  }
  return stats;
}

export function handlePoolCreated(event: PoolCreatedEvent): void {
  let poolId = event.params.poolId.toString();
  let pool = new Pool(poolId);

  pool.token = event.params.royaltyToken.toHexString();
  pool.quoteToken = event.params.quoteToken;
  pool.vault = event.params.vault.toHexString();
  pool.reserveToken = BigDecimal.fromString("0");
  pool.reserveQuote = BigDecimal.fromString("0");
  pool.volumeToken = BigDecimal.fromString("0");
  pool.volumeQuote = BigDecimal.fromString("0");
  pool.txCount = BigInt.fromI32(0);
  pool.feesCollected = BigDecimal.fromString("0");
  pool.createdAt = event.block.timestamp;

  pool.save();

  // Link pool to vault
  let vault = Vault.load(event.params.vault.toHexString());
  if (vault != null) {
    vault.pool = poolId;
    vault.save();
  }
}

export function handleSwap(event: SwapEvent): void {
  let poolId = event.params.poolId.toString();
  let pool = Pool.load(poolId);

  if (pool == null) {
    return;
  }

  // Create swap entity
  let swapId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let swap = new Swap(swapId);

  swap.pool = poolId;
  swap.trader = event.params.trader;
  swap.isBuy = event.params.isBuy;
  swap.amountIn = toDecimal(event.params.amountIn, swap.isBuy ? USDT_DECIMALS : TOKEN_DECIMALS);
  swap.amountOut = toDecimal(event.params.amountOut, swap.isBuy ? TOKEN_DECIMALS : USDT_DECIMALS);
  swap.fee = toDecimal(event.params.fee, USDT_DECIMALS);
  swap.price = toDecimal(event.params.price, USDT_DECIMALS);
  swap.timestamp = event.params.timestamp;
  swap.txHash = event.transaction.hash;
  swap.blockNumber = event.block.number;

  swap.save();

  // Update pool
  pool.reserveToken = toDecimal(event.params.reserveToken, TOKEN_DECIMALS);
  pool.reserveQuote = toDecimal(event.params.reserveQuote, USDT_DECIMALS);
  pool.txCount = pool.txCount.plus(BigInt.fromI32(1));
  pool.feesCollected = pool.feesCollected.plus(swap.fee);

  // Update volumes
  if (swap.isBuy) {
    pool.volumeQuote = pool.volumeQuote.plus(swap.amountIn);
    pool.volumeToken = pool.volumeToken.plus(swap.amountOut);
  } else {
    pool.volumeToken = pool.volumeToken.plus(swap.amountIn);
    pool.volumeQuote = pool.volumeQuote.plus(swap.amountOut);
  }

  pool.save();

  // Update candles
  let timestamp = event.params.timestamp;
  let price = swap.price;
  let volume = swap.isBuy ? swap.amountIn : swap.amountOut;

  updateCandle1m(poolId, timestamp, price, volume);
  updateCandle5m(poolId, timestamp, price, volume);
  updateCandle1h(poolId, timestamp, price, volume);
  updateCandle1d(poolId, timestamp, price, volume);

  // Update protocol stats
  let stats = getOrCreateProtocolStats();
  stats.totalVolume = stats.totalVolume.plus(swap.isBuy ? swap.amountIn : swap.amountOut);
  stats.totalFeesCollected = stats.totalFeesCollected.plus(swap.fee);
  stats.save();
}

function updateCandle1m(poolId: string, timestamp: BigInt, price: BigDecimal, volume: BigDecimal): void {
  let candleTimestamp = timestamp.div(BigInt.fromI32(MINUTE)).times(BigInt.fromI32(MINUTE));
  let candleId = poolId + "-" + candleTimestamp.toString();

  let candle = Candle1m.load(candleId);
  if (candle == null) {
    candle = new Candle1m(candleId);
    candle.pool = poolId;
    candle.timestamp = candleTimestamp;
    candle.open = price;
    candle.high = price;
    candle.low = price;
    candle.close = price;
    candle.volume = volume;
    candle.txCount = BigInt.fromI32(1);
  } else {
    if (price.gt(candle.high)) {
      candle.high = price;
    }
    if (price.lt(candle.low)) {
      candle.low = price;
    }
    candle.close = price;
    candle.volume = candle.volume.plus(volume);
    candle.txCount = candle.txCount.plus(BigInt.fromI32(1));
  }
  candle.save();
}

function updateCandle5m(poolId: string, timestamp: BigInt, price: BigDecimal, volume: BigDecimal): void {
  let candleTimestamp = timestamp.div(BigInt.fromI32(FIVE_MINUTES)).times(BigInt.fromI32(FIVE_MINUTES));
  let candleId = poolId + "-" + candleTimestamp.toString();

  let candle = Candle5m.load(candleId);
  if (candle == null) {
    candle = new Candle5m(candleId);
    candle.pool = poolId;
    candle.timestamp = candleTimestamp;
    candle.open = price;
    candle.high = price;
    candle.low = price;
    candle.close = price;
    candle.volume = volume;
    candle.txCount = BigInt.fromI32(1);
  } else {
    if (price.gt(candle.high)) {
      candle.high = price;
    }
    if (price.lt(candle.low)) {
      candle.low = price;
    }
    candle.close = price;
    candle.volume = candle.volume.plus(volume);
    candle.txCount = candle.txCount.plus(BigInt.fromI32(1));
  }
  candle.save();
}

function updateCandle1h(poolId: string, timestamp: BigInt, price: BigDecimal, volume: BigDecimal): void {
  let candleTimestamp = timestamp.div(BigInt.fromI32(HOUR)).times(BigInt.fromI32(HOUR));
  let candleId = poolId + "-" + candleTimestamp.toString();

  let candle = Candle1h.load(candleId);
  if (candle == null) {
    candle = new Candle1h(candleId);
    candle.pool = poolId;
    candle.timestamp = candleTimestamp;
    candle.open = price;
    candle.high = price;
    candle.low = price;
    candle.close = price;
    candle.volume = volume;
    candle.txCount = BigInt.fromI32(1);
  } else {
    if (price.gt(candle.high)) {
      candle.high = price;
    }
    if (price.lt(candle.low)) {
      candle.low = price;
    }
    candle.close = price;
    candle.volume = candle.volume.plus(volume);
    candle.txCount = candle.txCount.plus(BigInt.fromI32(1));
  }
  candle.save();
}

function updateCandle1d(poolId: string, timestamp: BigInt, price: BigDecimal, volume: BigDecimal): void {
  let candleTimestamp = timestamp.div(BigInt.fromI32(DAY)).times(BigInt.fromI32(DAY));
  let candleId = poolId + "-" + candleTimestamp.toString();

  let candle = Candle1d.load(candleId);
  if (candle == null) {
    candle = new Candle1d(candleId);
    candle.pool = poolId;
    candle.timestamp = candleTimestamp;
    candle.open = price;
    candle.high = price;
    candle.low = price;
    candle.close = price;
    candle.volume = volume;
    candle.txCount = BigInt.fromI32(1);
  } else {
    if (price.gt(candle.high)) {
      candle.high = price;
    }
    if (price.lt(candle.low)) {
      candle.low = price;
    }
    candle.close = price;
    candle.volume = candle.volume.plus(volume);
    candle.txCount = candle.txCount.plus(BigInt.fromI32(1));
  }
  candle.save();
}

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
  let poolId = event.params.poolId.toString();
  let pool = Pool.load(poolId);

  if (pool == null) {
    return;
  }

  // Update reserves
  pool.reserveToken = pool.reserveToken.plus(toDecimal(event.params.tokenAmount, TOKEN_DECIMALS));
  pool.reserveQuote = pool.reserveQuote.plus(toDecimal(event.params.quoteAmount, USDT_DECIMALS));

  pool.save();
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
  let poolId = event.params.poolId.toString();
  let pool = Pool.load(poolId);

  if (pool == null) {
    return;
  }

  // Update reserves
  pool.reserveToken = pool.reserveToken.minus(toDecimal(event.params.tokenAmount, TOKEN_DECIMALS));
  pool.reserveQuote = pool.reserveQuote.minus(toDecimal(event.params.quoteAmount, USDT_DECIMALS));

  pool.save();
}
