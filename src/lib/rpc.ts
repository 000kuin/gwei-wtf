const RPC = "https://rpc.mainnet.chain.robinhood.com";

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export interface GasData {
  baseFeeGwei: number;
  gasPriceGwei: number;
  priorityFeeGwei: number;   // max priority fee (tip)
  blockNumber: number;
  timestamp: number;
}

export interface FeeHistoryPoint {
  blockNumber: number;
  baseFeeGwei: number;
  timestamp: number;
}

export interface BlockInfo {
  number: number;
  baseFeeGwei: number;
  priorityFeeGwei: number;
  gasUsed: number;
  gasLimit: number;
  txCount: number;
  timestamp: number;
}

export interface WalletGasStats {
  address: string;
  totalEthSpent: number;
  totalUsdSpent: number;
  txCount: number;
  avgGweiPaid: number;
  mostExpensiveTx: { hash: string; ethCost: number; usdCost: number } | null;
}

export async function fetchGasNow(): Promise<GasData> {
  const [gasPriceHex, feeHistory, block] = await Promise.all([
    rpc("eth_gasPrice"),
    rpc("eth_feeHistory", ["0x4", "latest", [25, 50, 75]]),
    rpc("eth_getBlockByNumber", ["latest", false]),
  ]);

  const gasPriceGwei = parseInt(gasPriceHex, 16) / 1e9;
  const baseFeeGwei = block.baseFeePerGas
    ? parseInt(block.baseFeePerGas, 16) / 1e9
    : gasPriceGwei;

  // Priority fee = median of recent priority fees
  let priorityFeeGwei = 0.001;
  if (feeHistory?.reward?.length) {
    const tips: number[] = (feeHistory.reward as string[][])
      .map((r) => parseInt(r[1] ?? "0", 16) / 1e9)
      .filter((v) => v > 0);
    if (tips.length) {
      priorityFeeGwei = tips.reduce((a, b) => a + b, 0) / tips.length;
    }
  }

  return {
    baseFeeGwei,
    gasPriceGwei,
    priorityFeeGwei,
    blockNumber: parseInt(block.number, 16),
    timestamp: parseInt(block.timestamp, 16),
  };
}

export async function fetchFeeHistory(blockCount = 300): Promise<FeeHistoryPoint[]> {
  const result = await rpc("eth_feeHistory", [
    `0x${Math.min(blockCount, 1024).toString(16)}`,
    "latest",
    [],
  ]);

  const oldest = parseInt(result.oldestBlock, 16);
  return result.baseFeePerGas.slice(0, -1).map((hex: string, i: number) => ({
    blockNumber: oldest + i,
    baseFeeGwei: parseInt(hex, 16) / 1e9,
    timestamp: 0,
  }));
}

export async function fetchRecentBlocks(count = 12): Promise<BlockInfo[]> {
  const latestHex = await rpc("eth_blockNumber");
  const latest = parseInt(latestHex, 16);

  const blocks = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      rpc("eth_getBlockByNumber", [`0x${(latest - i).toString(16)}`, false])
    )
  );

  return blocks.filter(Boolean).map((b) => {
    const baseFeeGwei = b.baseFeePerGas ? parseInt(b.baseFeePerGas, 16) / 1e9 : 0;
    const gasPriceGwei = parseInt(b.gasPrice ?? b.baseFeePerGas ?? "0", 16) / 1e9;
    return {
      number:           parseInt(b.number, 16),
      baseFeeGwei,
      priorityFeeGwei:  Math.max(0, gasPriceGwei - baseFeeGwei),
      gasUsed:          parseInt(b.gasUsed, 16),
      gasLimit:         parseInt(b.gasLimit, 16),
      txCount:          b.transactions?.length ?? 0,
      timestamp:        parseInt(b.timestamp, 16),
    };
  });
}

export async function fetchWalletGasStats(
  address: string,
  ethPrice: number,
  maxBlocks = 500
): Promise<WalletGasStats> {
  // Get tx list via eth_getLogs approach — we use a block range scan
  const latestHex = await rpc("eth_blockNumber");
  const latest = parseInt(latestHex, 16);
  const fromBlock = Math.max(0, latest - maxBlocks);

  // Fetch blocks in chunks of 20
  const CHUNK = 20;
  const blockNums: number[] = [];
  for (let n = latest; n >= fromBlock; n--) blockNums.push(n);

  let totalEthSpent = 0;
  let txCount = 0;
  let totalGwei = 0;
  let mostExpensive: { hash: string; ethCost: number; usdCost: number } | null = null;

  // We'll scan recent blocks for txs from this address
  const chunks: number[][] = [];
  for (let i = 0; i < Math.min(blockNums.length, 100); i += CHUNK) {
    chunks.push(blockNums.slice(i, i + CHUNK));
  }

  const addr = address.toLowerCase();

  await Promise.all(
    chunks.map(async (chunk) => {
      const blockData = await Promise.all(
        chunk.map(n => rpc("eth_getBlockByNumber", [`0x${n.toString(16)}`, true]))
      );
      for (const block of blockData) {
        if (!block?.transactions) continue;
        for (const tx of block.transactions) {
          if (tx.from?.toLowerCase() !== addr) continue;
          const gasUsed = parseInt(tx.gas, 16);
          const gasPrice = parseInt(tx.gasPrice ?? "0", 16) / 1e9;
          const ethCost = (gasUsed * gasPrice * 1e9) / 1e18;
          const usdCost = ethCost * ethPrice;
          totalEthSpent += ethCost;
          totalGwei += gasPrice;
          txCount++;
          if (!mostExpensive || ethCost > mostExpensive.ethCost) {
            mostExpensive = { hash: tx.hash, ethCost, usdCost };
          }
        }
      }
    })
  );

  return {
    address,
    totalEthSpent,
    totalUsdSpent: totalEthSpent * ethPrice,
    txCount,
    avgGweiPaid: txCount > 0 ? totalGwei / txCount : 0,
    mostExpensiveTx: mostExpensive,
  };
}

// Estimate cheapest upcoming window based on historical pattern (hour of day)
export function predictCheapestWindow(history: FeeHistoryPoint[]): {
  cheapestHourUtc: number;
  currentHourAvg: number;
  cheapestHourAvg: number;
  savingsPct: number;
  recommendation: string;
} {
  if (history.length < 50) {
    return { cheapestHourUtc: 3, currentHourAvg: 0, cheapestHourAvg: 0, savingsPct: 0, recommendation: "Not enough data yet" };
  }

  // Group by hour — use block index as time proxy (each block ~100ms, ~36000/hr)
  // We'll use the actual indices to estimate hour buckets
  const BLOCKS_PER_HOUR = 36_000;
  const buckets: Record<number, number[]> = {};

  const latestBlock = history[history.length - 1]?.blockNumber ?? 0;

  for (const p of history) {
    const blocksAgo = latestBlock - p.blockNumber;
    const hoursAgo = blocksAgo / BLOCKS_PER_HOUR;
    const hour = Math.floor((new Date().getUTCHours() - hoursAgo + 24) % 24);
    if (!buckets[hour]) buckets[hour] = [];
    buckets[hour].push(p.baseFeeGwei);
  }

  let cheapestHour = 0;
  let cheapestAvg = Infinity;
  const hourAvgs: Record<number, number> = {};

  for (const [h, fees] of Object.entries(buckets)) {
    const avg = fees.reduce((a, b) => a + b, 0) / fees.length;
    hourAvgs[parseInt(h)] = avg;
    if (avg < cheapestAvg) {
      cheapestAvg = avg;
      cheapestHour = parseInt(h);
    }
  }

  const currentHour = new Date().getUTCHours();
  const currentAvg = hourAvgs[currentHour] ?? cheapestAvg;
  const savingsPct = currentAvg > 0 ? Math.round(((currentAvg - cheapestAvg) / currentAvg) * 100) : 0;

  // How many hours until cheapest window
  const hoursUntil = ((cheapestHour - currentHour) + 24) % 24;
  const recommendation = hoursUntil === 0
    ? "You're in the cheapest window right now!"
    : hoursUntil === 1
    ? "Cheapest window starts in ~1 hour"
    : `Cheapest window in ~${hoursUntil}h (${cheapestHour}:00 UTC)`;

  return {
    cheapestHourUtc: cheapestHour,
    currentHourAvg: currentAvg,
    cheapestHourAvg: cheapestAvg,
    savingsPct,
    recommendation,
  };
}

export function estimateCost(gasLimit: number, gasPriceGwei: number, ethPriceUsd: number): number {
  const ethCost = (gasLimit * gasPriceGwei * 1e9) / 1e18;
  return ethCost * ethPriceUsd;
}

// What tip should I set to get included fast?
export function recommendPriorityFee(recentBlocks: BlockInfo[]): {
  slow: number; normal: number; fast: number;
} {
  if (recentBlocks.length === 0) return { slow: 0.001, normal: 0.002, fast: 0.005 };
  const tips = recentBlocks.map(b => b.priorityFeeGwei).filter(t => t > 0);
  if (tips.length === 0) return { slow: 0.001, normal: 0.002, fast: 0.005 };
  const sorted = [...tips].sort((a, b) => a - b);
  return {
    slow:   sorted[Math.floor(sorted.length * 0.1)] ?? 0.001,
    normal: sorted[Math.floor(sorted.length * 0.5)] ?? 0.002,
    fast:   sorted[Math.floor(sorted.length * 0.9)] ?? 0.005,
  };
}

import type { BlockAnalysis } from "./analysis.ts";

export async function fetchBlocksWithTx(count = 5): Promise<BlockAnalysis[]> {
  const latestHex = await rpc("eth_blockNumber");
  const latest = parseInt(latestHex, 16);

  const blocks = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      rpc("eth_getBlockByNumber", [`0x${(latest - i).toString(16)}`, true])
    )
  );

  return blocks.filter(Boolean).map((b) => ({
    number:      parseInt(b.number, 16),
    timestamp:   parseInt(b.timestamp, 16),
    baseFeeGwei: b.baseFeePerGas ? parseInt(b.baseFeePerGas, 16) / 1e9 : 0,
    gasUsed:     parseInt(b.gasUsed, 16),
    gasLimit:    parseInt(b.gasLimit, 16),
    txCount:     b.transactions?.length ?? 0,
    transactions: (b.transactions ?? []).map((tx: any) => ({
      hash:     tx.hash,
      from:     tx.from,
      to:       tx.to ?? null,
      gasPrice: parseInt(tx.gasPrice ?? "0", 16) / 1e9,
      gas:      parseInt(tx.gas, 16),
      value:    tx.value,
      input:    tx.input?.slice(0, 10) ?? "0x",
    })),
  }));
}

export async function fetchEthPrice(): Promise<number> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
    const json = await res.json();
    return json.ethereum?.usd ?? 3000;
  } catch {
    return 3000;
  }
}
