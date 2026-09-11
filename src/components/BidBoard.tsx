import React, { useState, useEffect } from "react";
import { IconZap, IconCheck, IconAlertTriangle, IconLayers } from "./Icons.tsx";

// Contract address (deploy and update this)
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // placeholder until deployed
const CHAIN_ID = 4663;
const RPC = "https://rpc.mainnet.chain.robinhood.com";

interface OnChainBid {
  id: number;
  bidder: string;
  maxFeeGwei: number;
  targetBlock: number;
  value: number; // ETH
  note: string;
  fulfilled: boolean;
  expired: boolean;
  blocksLeft: number;
}

interface Props {
  currentBlock: number;
  currentGwei: number;
  color: string;
}

// Mock bids for when contract isn't deployed yet
const MOCK_BIDS: OnChainBid[] = [
  { id: 3, bidder: "0x7a2f...c4d1", maxFeeGwei: 0.08,  targetBlock: 0, value: 0.001, note: "Stock token swap NVDA → AAPL", fulfilled: false, expired: false, blocksLeft: 847  },
  { id: 2, bidder: "0x3b1e...9f22", maxFeeGwei: 0.065, targetBlock: 0, value: 0.001, note: "Bridge to mainnet before close", fulfilled: false, expired: false, blocksLeft: 2103 },
  { id: 1, bidder: "0x9c4a...f8b0", maxFeeGwei: 0.05,  targetBlock: 0, value: 0.001, note: "", fulfilled: false, expired: false, blocksLeft: 5000 },
];

export function BidBoard({ currentBlock, currentGwei, color }: Props) {
  const [bids, setBids] = useState<OnChainBid[]>(MOCK_BIDS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ maxFeeGwei: "", blocksFromNow: "1000", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Update bids with current block info
  useEffect(() => {
    setBids(prev => prev.map(b => ({
      ...b,
      targetBlock: currentBlock + b.blocksLeft,
      expired: b.blocksLeft <= 0,
    })));
  }, [currentBlock]);

  const connectWallet = async () => {
    if (!(window as any).ethereum) return;
    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const chainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
      if (parseInt(chainIdHex, 16) !== CHAIN_ID) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: "Robinhood Chain",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: [RPC],
            blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
          }],
        });
      }
      setWalletConnected(true);
    } catch {}
  };

  const submitBid = async () => {
    if (!walletConnected) { await connectWallet(); return; }
    const gwei = parseFloat(form.maxFeeGwei);
    const blocks = parseInt(form.blocksFromNow);
    if (isNaN(gwei) || isNaN(blocks) || gwei <= 0 || blocks <= 0) return;
    setSubmitting(true);
    // Simulate submission (real tx would call contract)
    await new Promise(r => setTimeout(r, 1500));
    const newBid: OnChainBid = {
      id: bids.length + 1,
      bidder: "0xYou",
      maxFeeGwei: gwei,
      targetBlock: currentBlock + blocks,
      value: 0.0001,
      note: form.note,
      fulfilled: false,
      expired: false,
      blocksLeft: blocks,
    };
    setBids(prev => [newBid, ...prev]);
    setSubmitting(false);
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const activeBids = bids.filter(b => !b.fulfilled && !b.expired);
  const sorted = [...activeBids].sort((a, b) => b.maxFeeGwei - a.maxFeeGwei);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IconLayers size={14} color={color} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>On-chain bid board</span>
            <span style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
              color, background: `${color}15`,
              border: `1px solid ${color}30`,
              borderRadius: 99, padding: "2px 7px", textTransform: "uppercase",
            }}>
              LIVE
            </span>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5, maxWidth: 400 }}>
            Public inclusion bids on Robinhood Chain. Post your max fee and target block.
            Block builders see this. Fully on-chain, non-custodial.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px",
            background: showForm ? "transparent" : color,
            color: showForm ? "var(--text-2)" : "#000",
            fontWeight: 700, fontSize: 12,
            borderRadius: "var(--r-sm)",
            border: `1px solid ${showForm ? "var(--border-2)" : "transparent"}`,
            transition: "all 0.2s", whiteSpace: "nowrap",
          }}
        >
          <IconZap size={12} color={showForm ? "var(--text-2)" : "#000"} />
          {showForm ? "Cancel" : "Post bid"}
        </button>
      </div>

      {/* Success */}
      {submitted && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", marginBottom: 12,
          background: "var(--low-dim)", border: "1px solid var(--low-border)",
          borderRadius: "var(--r-sm)", fontSize: 12, color: "var(--low)",
        }}>
          <IconCheck size={12} color="var(--low)" />
          Bid posted on-chain. Block builders can now see your request.
        </div>
      )}

      {/* Post form */}
      {showForm && (
        <div style={{
          padding: "20px", marginBottom: 16,
          background: "var(--glass)",
          border: `1px solid ${color}28`,
          borderRadius: "var(--r-lg)",
          backdropFilter: "blur(16px)",
          animation: "fade-up 0.2s ease",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-3)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Max fee (gwei)
              </label>
              <input
                type="number" step="0.001" placeholder={currentGwei.toFixed(4)}
                value={form.maxFeeGwei}
                onChange={e => setForm(f => ({ ...f, maxFeeGwei: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px",
                  background: "var(--surface-2)", border: `1px solid ${color}33`,
                  borderRadius: "var(--r-sm)", color: "var(--text)",
                  fontFamily: "var(--mono)", fontSize: 13, outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-3)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Target (blocks from now)
              </label>
              <input
                type="number" placeholder="1000"
                value={form.blocksFromNow}
                onChange={e => setForm(f => ({ ...f, blocksFromNow: e.target.value }))}
                style={{
                  width: "100%", padding: "8px 12px",
                  background: "var(--surface-2)", border: `1px solid ${color}33`,
                  borderRadius: "var(--r-sm)", color: "var(--text)",
                  fontFamily: "var(--mono)", fontSize: 13, outline: "none",
                }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: "var(--text-3)", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Public note (optional)
            </label>
            <input
              type="text" placeholder="e.g. NVDA swap at market open" maxLength={128}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={{
                width: "100%", padding: "8px 12px",
                background: "var(--surface-2)", border: "1px solid var(--border-2)",
                borderRadius: "var(--r-sm)", color: "var(--text)",
                fontSize: 13, outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              Requires 0.0001 ETH deposit (fully refundable)
            </span>
            <button
              onClick={submitBid}
              disabled={submitting}
              style={{
                padding: "9px 20px",
                background: submitting ? "var(--surface-2)" : color,
                color: submitting ? "var(--text-2)" : "#000",
                fontWeight: 700, fontSize: 12,
                borderRadius: "var(--r-sm)", border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {!walletConnected ? "Connect wallet" : submitting ? "Posting…" : "Post on-chain"}
            </button>
          </div>
        </div>
      )}

      {/* Orderbook header */}
      <div style={{
        display: "grid", gridTemplateColumns: "80px 100px 80px 1fr 100px",
        gap: 12, padding: "0 12px 8px",
        borderBottom: "1px solid var(--border)",
      }}>
        {["Bid #", "Max fee", "Deposit", "Note", "Expires"].map(h => (
          <span key={h} style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--mono)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {h}
          </span>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-3)", fontSize: 12 }}>
          No active bids. Be the first to post.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 6 }}>
          {sorted.map((bid, i) => {
            const isTop    = i === 0;
            const aboveMkt = bid.maxFeeGwei > currentGwei;
            const c        = aboveMkt ? "var(--low)" : bid.maxFeeGwei > currentGwei * 0.9 ? "var(--normal)" : "var(--text-2)";
            return (
              <div
                key={bid.id}
                style={{
                  display: "grid", gridTemplateColumns: "80px 100px 80px 1fr 100px",
                  gap: 12, alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: "var(--r-sm)",
                  background: isTop ? `${c}0a` : "transparent",
                  border: `1px solid ${isTop ? c + "28" : "transparent"}`,
                  animation: isTop && bid.id === bids[0]?.id ? "fade-up 0.3s ease" : "none",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                  #{bid.id}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: c }}>
                  {bid.maxFeeGwei.toFixed(4)} <span style={{ fontSize: 9, fontWeight: 400, color: "var(--text-3)" }}>gwei</span>
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
                  {bid.value.toFixed(4)} ETH
                </span>
                <span style={{ fontSize: 11, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {bid.note || <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>—</span>}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", textAlign: "right" }}>
                  {bid.blocksLeft.toLocaleString()} blocks
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Contract info */}
      <div style={{
        marginTop: 16, padding: "10px 14px",
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)" }}>
          GasBidBoard.sol · Robinhood Chain · Chain ID 4663
        </span>
        <a
          href={`https://robinhoodchain.blockscout.com/address/${CONTRACT_ADDRESS}`}
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--mono)", fontSize: 10, color }}
        >
          {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-6)} ↗
        </a>
      </div>
    </div>
  );
}
