import { piece_swap, piece_swap_script } from './types/aptos/piece-swap'
import { AccountEventTracker, aptos, Gauge } from "@sentio/sdk";

import { AptosDex, getCoinInfo } from "@sentio-processor/common/dist/aptos"

const commonOptions = { sparse:  true }
const tvlAll = Gauge.register("tvl_all", commonOptions)
const tvl = Gauge.register("tvl", commonOptions)
const tvlByPool = Gauge.register("tvl_by_pool", commonOptions)
const volume = Gauge.register("vol", commonOptions)

const accountTracker = AccountEventTracker.register("users")

piece_swap_script.bind()
  .onEntryCreateNewPoolScript(async (evt, ctx) => {
    ctx.meter.Counter("num_pools").add(1)
    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    // ctx.logger.info("PoolCreated", { user: ctx.transaction.sender })
  })
  .onEntryAddLiquidityScript(async (evt, ctx) => {
    ctx.meter.Counter("event_liquidity_add").add(1)
    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    // ctx.logger.info("LiquidityAdded", { user: ctx.transaction.sender })
  })
  .onEntryRemoveLiquidityScript(async (evt, ctx) => {
    ctx.meter.Counter("event_liquidity_removed").add(1)
    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
    // ctx.logger.info("LiquidityRemoved", { user: ctx.transaction.sender })
  })
  .onEntrySwapScript(async (evt, ctx) => {
    const value = await pieceSwap.recordTradingVolume(ctx, evt.type_arguments[0], evt.type_arguments[1],
        evt.arguments_typed[0] + evt.arguments_typed[1],
        evt.arguments_typed[2] + evt.arguments_typed[3])

    const coinXInfo = await getCoinInfo(evt.type_arguments[0])
    const coinYInfo = await getCoinInfo(evt.type_arguments[1])
    ctx.meter.Counter("event_swap_by_bridge").add(1, { bridge: coinXInfo.bridge })
    ctx.meter.Counter("event_swap_by_bridge").add(1, { bridge: coinYInfo.bridge })

    accountTracker.trackEvent(ctx, { distinctId: ctx.transaction.sender })
  })

const pieceSwap = new AptosDex<piece_swap.PieceSwapPoolInfo<any, any>>(volume, tvlAll, tvl, tvlByPool, {
  getXReserve: pool => pool.reserve_x.value,
  getYReserve: pool => pool.reserve_y.value,
  getExtraPoolTags: _ => {},
  poolTypeName: piece_swap.PieceSwapPoolInfo.TYPE_QNAME
})

// amm.loadTypes(aptos.TYPE_REGISTRY)
aptos.AptosAccountProcessor.bind({address: piece_swap.DEFAULT_OPTIONS.address, startVersion: 26000000})
    .onVersionInterval((rs, ctx) => pieceSwap.syncPools(rs, ctx))
