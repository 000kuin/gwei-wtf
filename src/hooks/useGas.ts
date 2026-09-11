import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchGasNow,
  fetchFeeHistory,
  fetchRecentBlocks,
  fetchBlocksWithTx,
  fetchEthPrice,
  type GasData,
  type FeeHistoryPoint,
  type BlockInfo,
} from "../lib/rpc.ts";
import type { BlockAnalysis } from "../lib/analysis.ts";

const POLL_MS = 5000;
const SMOOTHING_WINDOW = 6; // last 6 readings = 30s of data

// How far past a threshold boundary before we actually change level.
// Prevents flickering when sitting right on the edge.
const HYSTERESIS = 0.08; // 8% buffer on each boundary

export type { GasData, FeeHistoryPoint, BlockInfo } from "../lib/rpc.ts";
export type GasLevel = "low" | "normal" | "high" | "very_high";

export interface GasState {
  current: GasData | null;
  smoothedGwei: number;       // median of last N readings — used for level/verdict
  history: FeeHistoryPoint[];
  recentBlocks: BlockInfo[];
  blocksWithTx: BlockAnalysis[];
  ethPrice: number;
  level: GasLevel;
  avg24h: number;
  percentileRank: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

// Classify with hysteresis: only change level if we've crossed the boundary
// by at least HYSTERESIS fraction beyond it.
function classifyWithHysteresis(
  smoothed: number,
  avg: number,
  p25: number,
  p75: number,
  prev: GasLevel,
): GasLevel {
  // Boundaries with hysteresis buffers applied depending on direction
  // To leave "low":   must exceed p25 * (1 + HYSTERESIS)
  // To enter "low":   must be below p25 * (1 - HYSTERESIS)
  // To leave "normal": must exceed avg * (1 + HYSTERESIS)
  // To enter "normal": must be below avg * (1 - HYSTERESIS)
  // etc.

  const lowCeiling      = p25;
  const normalCeiling   = avg;
  const highCeiling     = p75 * 1.5;

  // Strict classification (no hysteresis) — where we WOULD end up
  let strict: GasLevel;
  if (smoothed <= lowCeiling)    strict = "low";
  else if (smoothed <= normalCeiling) strict = "normal";
  else if (smoothed <= highCeiling)   strict = "high";
  else                                strict = "very_high";

  if (strict === prev) return prev; // no change needed

  // Moving UP (fees rising) — require crossing by HYSTERESIS above the boundary
  const levelOrder: GasLevel[] = ["low", "normal", "high", "very_high"];
  const prevIdx   = levelOrder.indexOf(prev);
  const strictIdx = levelOrder.indexOf(strict);

  if (strictIdx > prevIdx) {
    // Rising — check if we're far enough above the upper boundary of current level
    const boundary =
      prev === "low"    ? lowCeiling
      : prev === "normal" ? normalCeiling
      : highCeiling;
    if (smoothed < boundary * (1 + HYSTERESIS)) return prev; // not far enough yet
  } else {
    // Falling — check if we're far enough below the lower boundary of current level
    const boundary =
      prev === "very_high" ? highCeiling
      : prev === "high"    ? normalCeiling
      : lowCeiling;
    if (smoothed > boundary * (1 - HYSTERESIS)) return prev; // not far enough yet
  }

  return strict;
}

function percentileRank(value: number, data: number[]): number {
  if (data.length === 0) return 50;
  const below = data.filter(v => v <= value).length;
  return Math.round((below / data.length) * 100);
}

export function useGas(): GasState {
  const [state, setState] = useState<GasState>({
    current: null,
    smoothedGwei: 0,
    history: [],
    recentBlocks: [],
    blocksWithTx: [],
    ethPrice: 3000,
    level: "normal",
    avg24h: 0,
    percentileRank: 50,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const historyRef = useRef<FeeHistoryPoint[]>([]);
  const ethPriceRef = useRef(3000);
  // Rolling buffer of recent raw readings for smoothing
  const recentReadingsRef = useRef<number[]>([]);

  const poll = useCallback(async () => {
    try {
      const current = await fetchGasNow();

      // Maintain rolling window of raw readings
      recentReadingsRef.current.push(current.baseFeeGwei);
      if (recentReadingsRef.current.length > SMOOTHING_WINDOW) {
        recentReadingsRef.current.shift();
      }
      const smoothed = median(recentReadingsRef.current);

      const fees = historyRef.current.map(p => p.baseFeeGwei);
      const avg = fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : smoothed;
      const sorted = [...fees].sort((a, b) => a - b);
      const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? avg * 0.8;
      const p75 = sorted[Math.floor(sorted.length * 0.75)] ?? avg * 1.2;
      const rank = percentileRank(smoothed, fees);

      setState(prev => {
        const level = classifyWithHysteresis(smoothed, avg, p25, p75, prev.level);
        return {
          ...prev,
          current,
          smoothedGwei: smoothed,
          level,
          avg24h: avg,
          percentileRank: rank,
          loading: false,
          error: null,
          lastUpdated: new Date(),
        };
      });

      // Also refresh recent blocks + full tx blocks
      fetchRecentBlocks(12).then(blocks => {
        setState(prev => ({ ...prev, recentBlocks: blocks }));
      });
      fetchBlocksWithTx(5).then(blocks => {
        setState(prev => ({ ...prev, blocksWithTx: blocks }));
      });
    } catch (e) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : "Failed to fetch",
      }));
    }
  }, []);

  // Initial load — fetch history + ETH price once
  useEffect(() => {
    Promise.all([
      fetchFeeHistory(500),
      fetchEthPrice(),
      fetchRecentBlocks(12),
      fetchBlocksWithTx(5),
    ]).then(([history, ethPrice, blocks, blocksWithTx]) => {
      historyRef.current = history;
      ethPriceRef.current = ethPrice;
      setState(prev => ({
        ...prev,
        history,
        ethPrice,
        recentBlocks: blocks,
        blocksWithTx,
      }));
      poll();
    });

    // Refresh ETH price every 60s
    const ethInterval = setInterval(async () => {
      const price = await fetchEthPrice();
      ethPriceRef.current = price;
      setState(prev => ({ ...prev, ethPrice: price }));
    }, 60_000);

    // Refresh fee history every 5 minutes
    const histInterval = setInterval(async () => {
      const history = await fetchFeeHistory(500);
      historyRef.current = history;
      setState(prev => ({ ...prev, history }));
    }, 5 * 60_000);

    return () => {
      clearInterval(ethInterval);
      clearInterval(histInterval);
    };
  }, []);

  // Live polling
  useEffect(() => {
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  return state;
}
