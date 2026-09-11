// Fee Oracle — exposes current gas data as a public JSON API
// Implemented as a BroadcastChannel that the app writes to,
// plus a service worker that serves /api/gas requests.
// For now we write to localStorage so any tab can read it.

export interface OracleData {
  chainId: 4663;
  network: "Robinhood Chain";
  timestamp: number;
  blockNumber: number;
  baseFee: { gwei: number; wei: string };
  gasPrice: { gwei: number; wei: string };
  priorityFee: { gwei: number; wei: string };
  recommended: {
    slow:   { maxFeeGwei: number; maxPriorityFeeGwei: number; estimatedSeconds: number };
    normal: { maxFeeGwei: number; maxPriorityFeeGwei: number; estimatedSeconds: number };
    fast:   { maxFeeGwei: number; maxPriorityFeeGwei: number; estimatedSeconds: number };
  };
  ethUsd: number;
  costs: {
    transfer: { gas: number; usd: number; eth: string };
    swap:     { gas: number; usd: number; eth: string };
    bridge:   { gas: number; usd: number; eth: string };
  };
  level: string;
  updatedAt: string;
}

export function buildOracleData(params: {
  blockNumber: number;
  baseFeeGwei: number;
  gasPriceGwei: number;
  priorityFeeGwei: number;
  ethUsd: number;
  level: string;
  slowTip: number;
  normalTip: number;
  fastTip: number;
}): OracleData {
  const {
    blockNumber, baseFeeGwei, gasPriceGwei, priorityFeeGwei,
    ethUsd, level, slowTip, normalTip, fastTip,
  } = params;

  const gweiToWei = (g: number) => BigInt(Math.round(g * 1e9)).toString();
  const cost = (gas: number) => {
    const eth = (gas * gasPriceGwei * 1e9) / 1e18;
    return { gas, usd: parseFloat((eth * ethUsd).toFixed(6)), eth: eth.toFixed(10) };
  };

  return {
    chainId: 4663,
    network: "Robinhood Chain",
    timestamp: Date.now(),
    blockNumber,
    baseFee:     { gwei: baseFeeGwei,     wei: gweiToWei(baseFeeGwei) },
    gasPrice:    { gwei: gasPriceGwei,    wei: gweiToWei(gasPriceGwei) },
    priorityFee: { gwei: priorityFeeGwei, wei: gweiToWei(priorityFeeGwei) },
    recommended: {
      slow:   { maxFeeGwei: baseFeeGwei + slowTip,   maxPriorityFeeGwei: slowTip,   estimatedSeconds: 30 },
      normal: { maxFeeGwei: baseFeeGwei + normalTip, maxPriorityFeeGwei: normalTip, estimatedSeconds: 10 },
      fast:   { maxFeeGwei: baseFeeGwei + fastTip,   maxPriorityFeeGwei: fastTip,   estimatedSeconds: 3  },
    },
    ethUsd,
    costs: {
      transfer: cost(21_000),
      swap:     cost(150_000),
      bridge:   cost(250_000),
    },
    level,
    updatedAt: new Date().toISOString(),
  };
}

export function saveOracleData(data: OracleData) {
  try {
    localStorage.setItem("rhgas_oracle", JSON.stringify(data));
  } catch {}
}

export function getOracleData(): OracleData | null {
  try {
    const raw = localStorage.getItem("rhgas_oracle");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
