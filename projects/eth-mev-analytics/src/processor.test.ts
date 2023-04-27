import { TestProcessorServer, firstCounterValue } from "@sentio/sdk/testing";
import blockJson from "./17121437.json";
import blockJsonX from "./17126233.json";
import blockJsonUniswapMint from "./14202253.json";
import blockWrongRevenue from "./17128908.json";
import block2Botsfrom from "./17134096.json";
import { RichBlock, formatRichBlock } from "@sentio/sdk/eth";
import { txnProfitAndCost, isArbitrage } from "./processor.js";
import { dataByTxn, getDataByTxn } from "./eth_util.js";
import { chainConfigs, ChainConstants } from "./common.js";

describe("Test Processor", () => {
  const service = new TestProcessorServer(() => import("./processor.js"));

  beforeAll(async () => {
    await service.start();
  });

  function filterByHash(b: RichBlock, hash: string): dataByTxn {
    const allData = getDataByTxn(b);
    for (const [txnHash, data] of allData) {
      if (txnHash.toLowerCase() === hash.toLowerCase()) {
        return data;
      }
    }
    throw new Error(`cannot find txn ${hash}`);
  }

  function handleTxn(
    data: dataByTxn,
    chainConfig: ChainConstants
  ): [boolean, Map<string, bigint>, Map<string, bigint>] {
    let ret = txnProfitAndCost(data, chainConfig);
    return [
      isArbitrage(data, chainConfig, ret.revenue, ret.addressProperty),
      ret.revenue,
      ret.costs,
    ];
  }

  function compute(
    b: any,
    hash: string
  ): [boolean, Map<string, bigint>, Map<string, bigint>] {
    const strValue = JSON.stringify(b);
    const block = JSON.parse(strValue) as RichBlock;
    const formattedBlock = formatRichBlock(block);
    //const test = await service.eth.testBlock(formattedBlock);
    const data = filterByHash(formattedBlock, hash);
    return handleTxn(data, chainConfigs[0]);
  }

  test("check parse block 1", async () => {
    const ret = compute(
      blockJson,
      "0x629971cc2bceb52b73804546b76842084ef6d77c66f7b1c3b06d639760a54fd5"
    );
    expect(ret[0]).toBe(false);
  });

  test("WETH transfer duplicate", async () => {
    const ret = compute(
      blockJsonX,
      "0x33ca03529227101658f7112c243e9844d0a543ee4f8da791c8fcf29dc155708b"
    );
    expect(ret[0]).toBe(false);
  });

  test("uniswap mint", async () => {
    const ret = compute(
      blockJsonUniswapMint,
      "0xfc876f3b2c2b18840d20e98ecfaaa8f716674d71ecfd793b38a3d7b5a35d6890"
    );
    expect(ret[0]).toBe(false);
  });

  test("wrong revenue", async () => {
    const ret = compute(
      blockWrongRevenue,
      "0x80114900676c3c3da04ed5f4acd702acb344b0190f92a40a00dafb001fff6c71"
    );
    expect(ret[0]).toBe(true);
  });

  test("2 bots", async () => {
    const ret = compute(
      block2Botsfrom,
      "0xd5695fefdc8c4e00f648fe62d8e77c7f9b4ab2b98ac1fcee5cbfd529689dcd49"
    );
    expect(ret[0]).toBe(true);
    expect(ret[1].get("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")).toBe(
      2939038981219406289n
    );
  });
});
