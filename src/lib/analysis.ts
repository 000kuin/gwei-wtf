// Known contract addresses on Robinhood Chain (Chain ID 4663)
const KNOWN_CONTRACTS: Record<string, { name: string; type: string; emoji: string }> = {
  // Uniswap v3
  "0x1f98431c8ad98523631ae4a59f267346ea31f984": { name: "Uniswap v3 Factory", type: "DEX", emoji: "🦄" },
  "0xe592427a0aece92de3edee1f18e0157c05861564": { name: "Uniswap v3 Router", type: "DEX", emoji: "🦄" },
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": { name: "Uniswap v3 Router 2", type: "DEX", emoji: "🦄" },
  // Common patterns
  "bridge":    { name: "Bridge contract", type: "Bridge", emoji: "🌉" },
  "nft":       { name: "NFT contract", type: "NFT", emoji: "🖼" },
  "token":     { name: "Token contract", type: "Token", emoji: "🪙" },
};

export interface SpikeReason {
  detected: boolean;
  severity: "none" | "mild" | "moderate" | "severe";
  topContract: string | null;
  topContractName: string | null;
  topContractEmoji: string;
  topContractTxCount: number;
  totalTxCount: number;
  explanation: string;
  pctChange: number; // % change from recent avg
}

export interface GasWar {
  contractAddress: string;
  contractName: string;
  emoji: string;
  txCount: number;
  totalGasUsed: number;
  pctOfBlock: number;
  avgGasPerTx: number;
}

export interface SandwichAttack {
  blockNumber: number;
  victim: string;
  attacker: string;
  targetContract: string;
  estimatedProfit: number; // in gwei
  txHashes: string[];
}

export interface BlockAnalysis {
  number: number;
  timestamp: number;
  baseFeeGwei: number;
  gasUsed: number;
  gasLimit: number;
  txCount: number;
  transactions: Array<{
    hash: string;
    from: string;
    to: string | null;
    gasPrice: number;
    gas: number;
    value: string;
    input: string;
  }>;
}

// Analyze what's causing a gas spike
export function analyzeSpikeReason(
  blocks: BlockAnalysis[],
  currentGwei: number,
  avg24h: number
): SpikeReason {
  const pctChange = avg24h > 0 ? ((currentGwei - avg24h) / avg24h) * 100 : 0;

  if (pctChange < 20) {
    return {
      detected: false,
      severity: "none",
      topContract: null,
      topContractName: null,
      topContractEmoji: "✅",
      topContractTxCount: 0,
      totalTxCount: 0,
      explanation: "Fees are normal — no unusual activity detected.",
      pctChange,
    };
  }

  // Count gas usage by contract
  const contractGas: Record<string, { gas: number; txCount: number; label: string; emoji: string }> = {};
  let totalTxCount = 0;

  for (const block of blocks) {
    for (const tx of block.transactions) {
      const to = tx.to?.toLowerCase() ?? "contract_creation";
      const known = to ? KNOWN_CONTRACTS[to] : null;
      const label = known?.name ?? shortenAddr(to);
      const emoji = known?.emoji ?? guessEmoji(tx.input);

      if (!contractGas[to]) contractGas[to] = { gas: 0, txCount: 0, label, emoji };
      contractGas[to].gas += tx.gas;
      contractGas[to].txCount += 1;
      totalTxCount++;
    }
  }

  // Find top gas consumer
  const sorted = Object.entries(contractGas).sort((a, b) => b[1].gas - a[1].gas);
  const top = sorted[0];

  if (!top) {
    return {
      detected: true,
      severity: pctChange > 100 ? "severe" : pctChange > 50 ? "moderate" : "mild",
      topContract: null,
      topContractName: "Unknown activity",
      topContractEmoji: "⚡",
      topContractTxCount: 0,
      totalTxCount,
      explanation: `Gas is ${Math.round(pctChange)}% above average — high network activity detected.`,
      pctChange,
    };
  }

  const severity: SpikeReason["severity"] = pctChange > 150 ? "severe" : pctChange > 75 ? "moderate" : "mild";
  const pctOfTotal = totalTxCount > 0 ? Math.round((top[1].txCount / totalTxCount) * 100) : 0;

  return {
    detected: true,
    severity,
    topContract: top[0],
    topContractName: top[1].label,
    topContractEmoji: top[1].emoji,
    topContractTxCount: top[1].txCount,
    totalTxCount,
    explanation: `${top[1].emoji} ${top[1].label} is responsible for ${pctOfTotal}% of recent gas (${top[1].txCount} txs). Fees are ${Math.round(pctChange)}% above average.`,
    pctChange,
  };
}

// Detect gas wars — contracts receiving an abnormal number of txs
export function detectGasWars(blocks: BlockAnalysis[]): GasWar[] {
  const contractActivity: Record<string, { gas: number; txCount: number }> = {};
  let totalGas = 0;

  for (const block of blocks) {
    for (const tx of block.transactions) {
      const to = tx.to?.toLowerCase() ?? "__creation__";
      if (!contractActivity[to]) contractActivity[to] = { gas: 0, txCount: 0 };
      contractActivity[to].gas += tx.gas;
      contractActivity[to].txCount += 1;
      totalGas += tx.gas;
    }
  }

  const wars: GasWar[] = Object.entries(contractActivity)
    .filter(([, v]) => v.txCount >= 5) // at least 5 txs
    .map(([addr, v]) => {
      const known = KNOWN_CONTRACTS[addr];
      return {
        contractAddress: addr,
        contractName: known?.name ?? shortenAddr(addr),
        emoji: known?.emoji ?? guessEmoji(""),
        txCount: v.txCount,
        totalGasUsed: v.gas,
        pctOfBlock: totalGas > 0 ? (v.gas / totalGas) * 100 : 0,
        avgGasPerTx: v.txCount > 0 ? v.gas / v.txCount : 0,
      };
    })
    .sort((a, b) => b.txCount - a.txCount)
    .slice(0, 5);

  return wars;
}

// Detect MEV sandwich attacks
// Pattern: same attacker sends tx before AND after victim tx to same contract
export function detectSandwiches(blocks: BlockAnalysis[]): SandwichAttack[] {
  const attacks: SandwichAttack[] = [];

  for (const block of blocks) {
    const txs = block.transactions;
    if (txs.length < 3) continue;

    for (let i = 1; i < txs.length - 1; i++) {
      const prev = txs[i - 1];
      const curr = txs[i];
      const next = txs[i + 1];

      if (!curr.to || !prev.to || !next.to) continue;

      // Classic sandwich: prev and next from same address, targeting same contract as victim
      const sameAttacker = prev.from?.toLowerCase() === next.from?.toLowerCase();
      const sameTarget = prev.to?.toLowerCase() === curr.to?.toLowerCase() &&
                         next.to?.toLowerCase() === curr.to?.toLowerCase();
      const prevHigherGas = prev.gasPrice > curr.gasPrice;
      const nextHigherGas = next.gasPrice > curr.gasPrice;
      const differentVictim = curr.from?.toLowerCase() !== prev.from?.toLowerCase();

      if (sameAttacker && sameTarget && prevHigherGas && nextHigherGas && differentVictim) {
        // Estimate profit: gas price difference × gas used
        const profitGwei = ((prev.gasPrice - curr.gasPrice) * prev.gas) / 1e9;
        attacks.push({
          blockNumber: block.number,
          victim: curr.from,
          attacker: prev.from,
          targetContract: curr.to,
          estimatedProfit: profitGwei,
          txHashes: [prev.hash, curr.hash, next.hash],
        });
      }
    }
  }

  return attacks.slice(0, 10);
}

// Market session timing for Robinhood Chain stock tokens
export interface MarketSession {
  isOpen: boolean;
  nextEvent: "open" | "close";
  nextEventMs: number; // ms until next event
  nextEventTime: Date;
  surgeExpected: boolean;
  surgeReason: string;
  sessionName: string;
}

export function getMarketSession(): MarketSession {
  const now = new Date();
  const etOffset = getETOffset(now); // -4 (EDT) or -5 (EST)
  const etHour = (now.getUTCHours() + etOffset + 24) % 24;
  const etMinute = now.getUTCMinutes();
  const etTimeDecimal = etHour + etMinute / 60;
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 6=Sat
  // Adjust for ET day
  const etDay = ((dayOfWeek * 24 + now.getUTCHours() + etOffset) < 0
    ? dayOfWeek - 1
    : dayOfWeek) % 7;

  const isWeekend = etDay === 0 || etDay === 6;

  // Regular market: 9:30am - 4:00pm ET
  const isRegularHours = !isWeekend && etTimeDecimal >= 9.5 && etTimeDecimal < 16;
  // Pre-market: 4:00am - 9:30am ET
  const isPreMarket = !isWeekend && etTimeDecimal >= 4 && etTimeDecimal < 9.5;
  // After-hours: 4:00pm - 8:00pm ET
  const isAfterHours = !isWeekend && etTimeDecimal >= 16 && etTimeDecimal < 20;

  const isOpen = isRegularHours || isPreMarket || isAfterHours;

  // Calculate next event
  let nextEvent: "open" | "close";
  let nextEventDate: Date;

  if (isOpen) {
    nextEvent = "close";
    // Next close depends on session
    const closeHour = isRegularHours ? 16 : isAfterHours ? 20 : 9.5;
    nextEventDate = nextETTime(now, closeHour, etOffset);
  } else {
    nextEvent = "open";
    // Next open: 4am ET if pre-open hours, or 9:30am if in after-hours
    const openHour = (isWeekend || etTimeDecimal >= 20) ? 9.5 : // next trading day at 9:30
      etTimeDecimal < 4 ? 4 : 9.5;
    nextEventDate = nextETTime(now, openHour, etOffset);
  }

  const nextEventMs = nextEventDate.getTime() - now.getTime();
  const minutesUntil = nextEventMs / 60000;

  // Surge prediction: fees spike at open and close
  const surgeExpected = minutesUntil <= 15 || (nextEvent === "close" && minutesUntil <= 30);
  const surgeReason = nextEvent === "open"
    ? minutesUntil <= 15
      ? `🚨 Market opens in ${Math.round(minutesUntil)} min — gas surge imminent!`
      : minutesUntil <= 5
      ? `⚠️ Market opens in ${Math.round(minutesUntil)} min — transact NOW or wait 20 min after open`
      : "Normal pre-open period"
    : minutesUntil <= 15
    ? `🚨 Market closes in ${Math.round(minutesUntil)} min — last-minute order rush starting`
    : "Normal session";

  const sessionName = isRegularHours ? "Regular Hours"
    : isPreMarket ? "Pre-Market"
    : isAfterHours ? "After-Hours"
    : isWeekend ? "Weekend (Market Closed)"
    : "Market Closed";

  return {
    isOpen,
    nextEvent,
    nextEventMs,
    nextEventTime: nextEventDate,
    surgeExpected,
    surgeReason,
    sessionName,
  };
}

function getETOffset(date: Date): number {
  // Simplified DST check: EDT (UTC-4) from March to November
  const month = date.getUTCMonth() + 1; // 1-12
  return (month >= 3 && month <= 11) ? -4 : -5;
}

function nextETTime(now: Date, etHour: number, etOffset: number): Date {
  const utcHour = etHour - etOffset;
  const result = new Date(now);
  result.setUTCHours(Math.floor(utcHour), (etHour % 1) * 60, 0, 0);
  if (result <= now) result.setUTCDate(result.getUTCDate() + 1);
  return result;
}

function shortenAddr(addr: string): string {
  if (!addr || addr === "__creation__") return "Contract creation";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function guessEmoji(input: string): string {
  if (!input || input === "0x") return "↗";
  if (input.startsWith("0xa9059cbb")) return "🪙"; // ERC-20 transfer
  if (input.startsWith("0x095ea7b3")) return "✅"; // approve
  if (input.startsWith("0x38ed1739") || input.startsWith("0x7ff36ab5")) return "🦄"; // swap
  if (input.startsWith("0x6a627842")) return "🖼";  // mint
  return "📄";
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0)   return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
