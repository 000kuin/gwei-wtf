import React, { useEffect, useState } from "react";
import { useGas } from "./hooks/useGas.ts";
import { HeroGas } from "./components/HeroGas.tsx";
import { FeeChart } from "./components/FeeChart.tsx";
import { BlockStream } from "./components/BlockStream.tsx";
import { Calculator } from "./components/Calculator.tsx";
import { GasAlert } from "./components/GasAlert.tsx";
import { PredictionPanel } from "./components/PredictionPanel.tsx";
import { PriorityFees } from "./components/PriorityFees.tsx";
import { SpikeDetector } from "./components/SpikeDetector.tsx";
import { MarketClock } from "./components/MarketClock.tsx";
import { GasWars } from "./components/GasWars.tsx";
import { WalletTracker } from "./components/WalletTracker.tsx";
import { GasReport } from "./components/GasReport.tsx";
import { OracleAPI } from "./components/OracleAPI.tsx";
import { BidBoard } from "./components/BidBoard.tsx";
import { predictCheapestWindow, recommendPriorityFee } from "./lib/rpc.ts";
import { analyzeSpikeReason, detectGasWars, detectSandwiches } from "./lib/analysis.ts";
import { buildOracleData, saveOracleData, type OracleData } from "./lib/oracle.ts";
import { IconActivity, IconFlame, IconWallet, IconServer, IconLayers } from "./components/Icons.tsx";

const LEVEL_COLOR: Record<string, string> = {
  low: "var(--low)", normal: "var(--normal)", high: "var(--high)", very_high: "var(--danger)",
};

type Tab = "overview" | "wars" | "bids" | "wallet" | "api";

export function App() {
  const gas = useGas();
  const color = LEVEL_COLOR[gas.level] ?? "var(--low)";
  const [tab, setTab] = useState<Tab>("overview");
  const [oracle, setOracle] = useState<OracleData | null>(null);

  const tips        = recommendPriorityFee(gas.recentBlocks);
  const prediction  = gas.history.length > 50 ? predictCheapestWindow(gas.history) : null;
  const spike       = gas.current && gas.blocksWithTx.length > 0
    ? analyzeSpikeReason(gas.blocksWithTx, gas.current.baseFeeGwei, gas.avg24h) : null;
  const wars        = detectGasWars(gas.blocksWithTx);
  const sandwiches  = detectSandwiches(gas.blocksWithTx);

  useEffect(() => {
    if (!gas.current) return;
    const d = buildOracleData({
      blockNumber: gas.current.blockNumber,
      baseFeeGwei: gas.current.baseFeeGwei,
      gasPriceGwei: gas.current.gasPriceGwei,
      priorityFeeGwei: gas.current.priorityFeeGwei,
      ethUsd: gas.ethPrice, level: gas.level,
      slowTip: tips.slow, normalTip: tips.normal, fastTip: tips.fast,
    });
    saveOracleData(d);
    setOracle(d);
  }, [gas.current?.blockNumber]);

  const tabs: { id: Tab; label: string; Icon: React.FC<any>; badge?: number }[] = [
    { id: "overview", label: "Overview",   Icon: IconActivity },
    { id: "wars",     label: "Gas Wars",   Icon: IconFlame,  badge: wars.length > 0 ? wars.length : undefined },
    { id: "bids",     label: "Bid Board",  Icon: IconLayers },
    { id: "wallet",   label: "Wallet",     Icon: IconWallet },
    { id: "api",      label: "API",        Icon: IconServer },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* Loading state */}
      {gas.loading && !gas.current && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
          <div style={{ position: "relative", width: 48, height: 48 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid var(--low)", animation: "pulse-ring 1.5s ease-out infinite" }} />
            <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "var(--low-dim)", border: "1px solid var(--low-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--low)" }} />
            </div>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-3)" }}>
            Connecting to Robinhood Chain
          </div>
        </div>
      )}

      {gas.error && !gas.current && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--danger)" }}>
            RPC error — {gas.error}
          </div>
        </div>
      )}

      {gas.current && (
        <>
          {/* Hero */}
          <HeroGas
            current={gas.current}
            smoothedGwei={gas.smoothedGwei}
            level={gas.level}
            avg24h={gas.avg24h}
            percentileRank={gas.percentileRank}
            ethPrice={gas.ethPrice}
            lastUpdated={gas.lastUpdated}
          />

          {/* Spike banner */}
          {spike?.detected && (
            <div style={{ padding: "0 32px 0", maxWidth: 1264, margin: "12px auto 0" }}>
              <SpikeDetector spike={spike} color={color} />
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)", margin: "24px 0 0" }} />

          {/* Tabs */}
          <div style={{ padding: "0 32px", maxWidth: 1264, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 2, paddingTop: 2 }}>
              {tabs.map(({ id, label, Icon, badge }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 16px",
                    background: tab === id ? "var(--glass)" : "transparent",
                    border: `1px solid ${tab === id ? "var(--border-2)" : "transparent"}`,
                    borderBottom: `1px solid ${tab === id ? color : "transparent"}`,
                    borderRadius: "var(--r-sm) var(--r-sm) 0 0",
                    color: tab === id ? color : "var(--text-3)",
                    fontSize: 12, fontWeight: tab === id ? 600 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (tab !== id) e.currentTarget.style.color = "var(--text-2)"; }}
                  onMouseLeave={e => { if (tab !== id) e.currentTarget.style.color = "var(--text-3)"; }}
                >
                  <Icon size={12} color="currentColor" />
                  {label}
                  {badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 800,
                      background: "var(--danger-dim)", color: "var(--danger)",
                      border: "1px solid var(--danger-border)",
                      borderRadius: 99, padding: "1px 5px", lineHeight: 1.4,
                    }}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: "var(--border)", marginTop: -1 }} />
          </div>

          {/* Tab content */}
          <div style={{ padding: "24px 32px 80px", maxWidth: 1264, margin: "0 auto" }}>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Row 1: chart + right column */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
                  <Card>
                    <FeeChart history={gas.history} currentGwei={gas.current.baseFeeGwei} avg24h={gas.avg24h} level={gas.level} />
                  </Card>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <MarketClock />
                    <Card><GasAlert currentGwei={gas.current.baseFeeGwei} color={color} /></Card>
                  </div>
                </div>

                {/* Row 2: calculator + fee breakdown + block stream */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>
                  <Card><Calculator gasPriceGwei={gas.current.gasPriceGwei} ethPrice={gas.ethPrice} level={gas.level} /></Card>
                  <Card><PriorityFees current={gas.current} recentBlocks={gas.recentBlocks} color={color} /></Card>
                  <Card style={{ padding: "16px 14px" }}>
                    <BlockStream blocks={gas.recentBlocks} level={gas.level} />
                  </Card>
                </div>

                {/* Row 3: best time to transact — full width, room to breathe */}
                {prediction && (
                  <Card>
                    <PredictionPanel {...prediction} color={color} level={gas.level} />
                  </Card>
                )}
              </div>
            )}

            {/* GAS WARS */}
            {tab === "wars" && (
              <Card><GasWars wars={wars} sandwiches={sandwiches} color={color} /></Card>
            )}

            {/* BID BOARD */}
            {tab === "bids" && (
              <Card>
                <BidBoard
                  currentBlock={gas.current.blockNumber}
                  currentGwei={gas.current.baseFeeGwei}
                  color={color}
                />
              </Card>
            )}

            {/* WALLET */}
            {tab === "wallet" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card><WalletTracker ethPrice={gas.ethPrice} color={color} /></Card>
                <Card><GasReport ethPrice={gas.ethPrice} color={color} /></Card>
              </div>
            )}

            {/* API */}
            {tab === "api" && (
              <Card><OracleAPI data={oracle} color={color} /></Card>
            )}

            {/* Network footer bar */}
            <div style={{
              marginTop: 24,
              display: "grid", gridTemplateColumns: "repeat(6, 1fr)",
              border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden",
            }}>
              {[
                { label: "Network",    value: "Robinhood Chain" },
                { label: "Chain ID",   value: "4663" },
                { label: "Stack",      value: "Arbitrum Orbit" },
                { label: "Gas token",  value: "ETH" },
                { label: "Block time", value: "~100ms" },
                { label: "RPC",        value: "rpc.mainnet.chain.robinhood.com" },
              ].map(({ label, value }, i, arr) => (
                <div key={label} style={{
                  padding: "11px 16px",
                  background: "var(--glass)",
                  borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 600, color: "var(--text-2)" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
                gwei.wtf · Free forever · Robinhood Chain public RPC · {gas.lastUpdated ? `Updated ${gas.lastUpdated.toLocaleTimeString()}` : ""}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--mono)" }}>
                Not affiliated with Robinhood Markets, Inc.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "var(--glass)",
      backdropFilter: "blur(16px)",
      border: "1px solid var(--border)",
      borderRadius: "var(--r-lg)",
      padding: "20px",
      ...style,
    }}>
      {children}
    </div>
  );
}
