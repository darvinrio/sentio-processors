import {
  CBETH_PROXY,
} from "./constant.js"
import { MintEvent, BurnEvent, TransferEvent } from "./types/eth/stakedtokenv1.js"
import { StakedTokenV1Context, StakedTokenV1Processor } from "./types/eth/stakedtokenv1.js"
import {getPriceByType, token} from "@sentio/sdk/utils"
import {BigDecimal, CHAIN_IDS, Counter, Gauge} from "@sentio/sdk"

export const volOptions = {
  sparse: true,
  aggregationConfig: {
    intervalInMinutes: [60],
  }
}

const mint = Gauge.register("mint", volOptions)
const burn = Gauge.register("burn", volOptions)
const transfer = Gauge.register("transfer", volOptions)
const mintAcc = Counter.register("mint_acc")
const burnAcc = Counter.register("burn_acc")
const transferAcc = Counter.register("transfer_acc")

const blockHandler = async function(_:any, ctx: StakedTokenV1Context) {
  const tokenInfo = await token.getERC20TokenInfo(ctx.contract.address)
  const totalSupply = (await ctx.contract.totalSupply()).scaleDown(tokenInfo.decimal)
  const exchangeRate =(await ctx.contract.exchangeRate()).scaleDown(tokenInfo.decimal)
  ctx.meter.Gauge("total_supply").record(totalSupply, {token: tokenInfo.symbol})
  ctx.meter.Gauge("exchange_rate").record(exchangeRate, {token: tokenInfo.symbol})

  // This is address is WETH.
  const eth_usdc_price = await getPriceByType(CHAIN_IDS.ETHEREUM,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", ctx.timestamp)
  if (!eth_usdc_price) {
    console.warn("cannot get price for ETH")
    return
  }

  // divide exchange rate between ETH/cbETH to get cbETH price
  let cbEth_usdc_price
  if (!exchangeRate.isEqualTo(BigDecimal(0))) {
    cbEth_usdc_price = BigDecimal(eth_usdc_price).dividedBy(exchangeRate)
  } else {
    cbEth_usdc_price = 0
  }
  ctx.meter.Gauge("cbETH_price").record(cbEth_usdc_price, {token: tokenInfo.symbol})
  ctx.meter.Gauge("tvl").record(totalSupply.multipliedBy(cbEth_usdc_price), {token: tokenInfo.symbol})
}

const transferEventHandler = async function(event: TransferEvent, ctx: StakedTokenV1Context) {
  const tokenInfo = await token.getERC20TokenInfo(ctx.contract.address)
  transferAcc.add(ctx, 1, {token: tokenInfo.symbol})
  const value = event.args.value.scaleDown(tokenInfo.decimal)
  transfer.record(ctx, value, {token: tokenInfo.symbol})
  ctx.eventLogger.emit("Transfer",
      {
        distinctId: event.args.to,
        from: event.args.from,
        to: event.args.to,
        amount: value,
        message: event.args.from + " transfers " + value + " cbETH from " + event.args.to,
      })
}

const mintEventHandler = async function(event: MintEvent, ctx: StakedTokenV1Context) {
  const tokenInfo = await token.getERC20TokenInfo(ctx.contract.address)
  const amount = event.args.amount.scaleDown(tokenInfo.decimal)
  mint.record(ctx, amount, {token: tokenInfo.symbol})
  mintAcc.add(ctx, amount, {token: tokenInfo.symbol})
}

const burnEventHandler = async function(event: BurnEvent, ctx: StakedTokenV1Context) {
  const tokenInfo = await token.getERC20TokenInfo(ctx.contract.address)
  const amount = event.args.amount.scaleDown(tokenInfo.decimal)
  burn.record(ctx, amount, {token: tokenInfo.symbol})
  burnAcc.add(ctx, amount, {token: tokenInfo.symbol})
}

StakedTokenV1Processor.bind({address: CBETH_PROXY})
  .onBlockInterval(blockHandler)
  .onEventMint(mintEventHandler)
  .onEventBurn(burnEventHandler)
.onEventTransfer(transferEventHandler)