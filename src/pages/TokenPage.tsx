import React, { useState } from "react";
import { IconTrendingUp, IconZap, IconGlobe, IconLayers, IconBarChart, IconShield, IconExternalLink, IconCopy, IconCheck } from "../components/Icons.tsx";

const PONS_URL = "https://pons.finance"; // update with actual Pons listing URL
const GWEI_CA  = "0x7879d7114beb5edc9c81a6ba32a179519be567a4";
const EXPLORER = `https://robinhoodchain.blockscout.com/token/${GWEI_CA}`;

export function TokenPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 32px 64px" }}>
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 700, height: 500,
          background: "radial-gradient(ellipse, rgba(34,211,165,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
          backgroundImage: "linear-gradient(var(--border-3) 1px,transparent 1px),linear-gradient(90deg,var(--border-3) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(34,211,165,0.08)", border: "1px solid rgba(34,211,165,0.2)",
            borderRadius: 99, padding: "5px 14px", marginBottom: 32,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "var(--low)",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--low)", display: "inline-block", animation: "glow-pulse 2s infinite" }} />
            Launching on Pons · Robinhood Chain · Chain ID 4663
          </div>

          {/* Token name */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: "clamp(80px, 14vw, 160px)",
              fontWeight: 900, fontFamily: "var(--mono)",
              letterSpacing: "-0.06em", lineHeight: 0.85,
              color: "var(--low)",
              filter: "drop-shadow(0 0 60px rgba(34,211,165,0.3))",
              marginBottom: 8,
            }}>
              $GWEI
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text-2)", letterSpacing: "-0.01em" }}>
              The on-chain gas index for Robinhood Chain
            </div>
          </div>

          {/* The thesis */}
          <div style={{
            maxWidth: 640, margin: "0 auto 48px",
            padding: "24px 32px",
            background: "var(--glass)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r-xl)",
            backdropFilter: "blur(16px)",
          }}>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 10, fontFamily: "var(--mono)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              The thesis
            </div>
            <div style={{ fontSize: "clamp(17px,2.2vw,22px)", fontWeight: 700, lineHeight: 1.4, color: "var(--text)", letterSpacing: "-0.02em" }}>
              "$GWEI is to Robinhood Chain what{" "}
              <span style={{ color: "var(--low)" }}>USO is to crude oil</span>
              {" "}— the index for the cost of doing business on-chain."
            </div>
          </div>

          {/* Pair chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 16,
            padding: "14px 24px",
            background: "var(--glass)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            marginBottom: 48,
          }}>
            <PairChip label="$GWEI" desc="On-chain gas index" color="var(--low)" />
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, color: "var(--text-3)", fontWeight: 300 }}>/</div>
            <PairChip label="USO" desc="Oil ETF stock token" color="#60a5fa" />
            <div style={{ width: 1, height: 32, background: "var(--border)" }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>Traded on</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>Pons · Robinhood Chain</div>
            </div>
          </div>

          {/* Contract address */}
          <CACard />

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href={PONS_URL}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px",
                background: "var(--low)", color: "#000",
                fontWeight: 800, fontSize: 14,
                borderRadius: "var(--r-sm)",
                letterSpacing: "-0.02em",
                boxShadow: "0 0 32px rgba(34,211,165,0.25)",
              }}
            >
              <IconZap size={14} color="#000" />
              Buy $GWEI on Pons
            </a>
            <a
              href="/"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 24px",
                background: "var(--glass)", color: "var(--text-2)",
                fontWeight: 600, fontSize: 14,
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border-2)",
                backdropFilter: "blur(12px)",
              }}
            >
              View gas tracker
            </a>
          </div>
        </div>
      </section>

      <Divider />

      {/* Why GWEI */}
      <section style={{ padding: "64px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Why it exists</SectionLabel>
        <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 14, lineHeight: 1.1 }}>
          Every barrel of oil has a price.<br />
          <span style={{ color: "var(--low)" }}>So does every gwei.</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 600, lineHeight: 1.7, marginBottom: 56 }}>
          Robinhood Chain processes hundreds of millions of transactions. Every one of them costs gwei.
          $GWEI is the token that tracks the economic activity of the chain itself —
          when the chain is busy, demand for block space rises. When demand rises, $GWEI rises.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            {
              Icon: IconBarChart,
              title: "Tracks real demand",
              body: "Gas fees on Robinhood Chain are directly correlated with trading volume, stock token activity, and DeFi usage. $GWEI is the on-chain expression of that demand.",
            },
            {
              Icon: IconTrendingUp,
              title: "Paired against USO",
              body: "$GWEI trades against the USO oil ETF stock token on Pons. Oil and gas. One is a physical commodity. One is computational. Both are the cost of doing business.",
            },
            {
              Icon: IconZap,
              title: "Backed by real utility",
              body: "gwei.wtf — the tool you're looking at — is the infrastructure. People use it daily to check fees. Every user is a potential $GWEI holder.",
            },
            {
              Icon: IconGlobe,
              title: "24/7 on Robinhood Chain",
              body: "Unlike USO, which closes at 4pm ET, $GWEI trades around the clock. The chain never stops. Neither does the market for block space.",
            },
            {
              Icon: IconLayers,
              title: "On-chain bid board",
              body: "The Bid Board on gwei.wtf lets users post gas bids on-chain. This creates real, transparent demand data that feeds the $GWEI narrative.",
            },
            {
              Icon: IconShield,
              title: "Fair launch on Pons",
              body: "No presale. No VC allocation. Launched on Pons with a bonding curve. Everyone gets the same entry. The chain sees everything.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} style={{
              padding: "24px",
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              backdropFilter: "blur(12px)",
            }}>
              <Icon size={16} color="var(--low)" style={{ marginBottom: 14 }} />
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, letterSpacing: "-0.02em" }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* GWEI vs USO */}
      <section style={{ padding: "64px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>The pair</SectionLabel>
        <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 48, lineHeight: 1.1 }}>
          $GWEI / USO on Pons
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 16, alignItems: "center" }}>
          <CompareCard
            ticker="$GWEI"
            name="gwei.wtf · On-chain gas index"
            color="var(--low)"
            facts={[
              { k: "What it is",    v: "On-chain gas index for Robinhood Chain" },
              { k: "Backed by",     v: "Real-time gas fee data + utility tool" },
              { k: "Chain",         v: "Robinhood Chain (ID 4663)" },
              { k: "Trading hours", v: "24/7 — chain never stops" },
              { k: "Launch",        v: "Fair launch on Pons" },
              { k: "Utility",       v: "gwei.wtf tracker, bid board, oracle API" },
              { k: "Contract",      v: `${GWEI_CA.slice(0,8)}…${GWEI_CA.slice(-6)}` },
            ]}
          />
          <div style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--text-3)" }}>/</div>
          <CompareCard
            ticker="USO"
            name="US Oil Fund · Oil ETF Stock Token"
            color="#60a5fa"
            facts={[
              { k: "What it is",    v: "Tokenized US Oil Fund ETF" },
              { k: "Backed by",     v: "WTI crude oil futures" },
              { k: "Chain",         v: "Robinhood Chain (ID 4663)" },
              { k: "Trading hours", v: "24/7 on-chain (market hours on NYSE)" },
              { k: "Launch",        v: "Robinhood stock token" },
              { k: "Utility",       v: "Exposure to crude oil price" },
            ]}
          />
        </div>
      </section>

      <Divider />

      {/* Tokenomics */}
      <section style={{ padding: "64px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Tokenomics</SectionLabel>
        <h2 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8 }}>
          Simple. Fair. On-chain.
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 48, lineHeight: 1.6 }}>
          No presale. No team allocation. No vesting cliffs. Launched on Pons with a bonding curve.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Ticker",   value: "$GWEI" },
            { label: "Chain",    value: "Robinhood Chain" },
            { label: "Launch",   value: "Pons fair launch" },
            { label: "Pair",     value: "$GWEI / USO" },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "20px", background: "var(--glass)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 800, color: "var(--low)" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Contract address row */}
        <div style={{
          marginBottom: 16,
          padding: "14px 20px",
          background: "var(--glass)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-lg)",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Contract address · Robinhood Chain</div>
            <a
              href={EXPLORER}
              target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 600, color: "var(--low)", display: "flex", alignItems: "center", gap: 6 }}
            >
              {GWEI_CA}
              <IconExternalLink size={12} color="var(--low)" />
            </a>
          </div>
          <CopyCAButton />
        </div>

        <div style={{
          padding: "24px 28px",
          background: "var(--low-dim)",
          border: "1px solid var(--low-border)",
          borderRadius: "var(--r-lg)",
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--low)", marginBottom: 8 }}>Fair launch guarantee</div>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
            $GWEI launches on Pons with a bonding curve. No tokens are pre-minted to founders, VCs, or insiders.
            The first buyer and the hundredth buyer use the same transparent curve.
            The only edge is being early — and now you are.
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section style={{ padding: "64px 32px 80px", textAlign: "center", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Ready?
          </div>
          <h2 style={{ fontSize: "clamp(28px,5vw,56px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16, lineHeight: 1.05 }}>
            Buy <span style={{ color: "var(--low)" }}>$GWEI</span><br />on Pons.
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 32 }}>
            Trade $GWEI/USO on Pons — the meme coin launchpad on Robinhood Chain.
            Oil and gas. The pair that makes itself.
          </p>
          <a
            href={PONS_URL}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 32px",
              background: "var(--low)", color: "#000",
              fontWeight: 800, fontSize: 15,
              borderRadius: "var(--r-sm)",
              letterSpacing: "-0.02em",
              boxShadow: "0 0 48px rgba(34,211,165,0.3)",
            }}
          >
            <IconExternalLink size={14} color="#000" />
            Open Pons
          </a>
        </div>
      </section>
    </div>
  );
}

function CACard() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(GWEI_CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      padding: "10px 20px",
      background: "var(--glass)",
      border: "1px solid var(--border-2)",
      borderRadius: "var(--r-lg)",
      marginBottom: 32,
      backdropFilter: "blur(12px)",
    }}>
      <div>
        <div style={{ fontSize: 9, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Contract address</div>
        <a
          href={EXPLORER}
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600, color: "var(--low)", display: "flex", alignItems: "center", gap: 5 }}
        >
          {GWEI_CA.slice(0, 10)}…{GWEI_CA.slice(-8)}
          <IconExternalLink size={11} color="var(--low)" />
        </a>
      </div>
      <button
        onClick={copy}
        style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 12px", borderRadius: "var(--r-sm)",
          border: `1px solid ${copied ? "var(--low-border)" : "var(--border-2)"}`,
          background: copied ? "var(--low-dim)" : "transparent",
          color: copied ? "var(--low)" : "var(--text-3)",
          fontSize: 11, fontFamily: "var(--mono)", cursor: "pointer",
          transition: "all 0.15s",
        }}
      >
        {copied ? <IconCheck size={11} color="var(--low)" /> : <IconCopy size={11} color="currentColor" />}
        {copied ? "Copied" : "Copy CA"}
      </button>
    </div>
  );
}

function CopyCAButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(GWEI_CA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "8px 14px", borderRadius: "var(--r-sm)",
        border: `1px solid ${copied ? "var(--low-border)" : "var(--border-2)"}`,
        background: copied ? "var(--low-dim)" : "var(--glass)",
        color: copied ? "var(--low)" : "var(--text-2)",
        fontSize: 12, fontFamily: "var(--mono)", cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s", flexShrink: 0,
      }}
    >
      {copied ? <IconCheck size={12} color="var(--low)" /> : <IconCopy size={12} color="currentColor" />}
      {copied ? "Copied!" : "Copy CA"}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--border) 20%,var(--border) 80%,transparent)" }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--low)", marginBottom: 16 }}>
      {children}
    </div>
  );
}

function PairChip({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 900, color, marginBottom: 4, letterSpacing: "-0.04em" }}>{label}</div>
      <div style={{ fontSize: 10, color: "var(--text-3)" }}>{desc}</div>
    </div>
  );
}

function CompareCard({ ticker, name, color, facts }: { ticker: string; name: string; color: string; facts: { k: string; v: string }[] }) {
  return (
    <div style={{
      background: "var(--glass)",
      border: `1px solid ${color}33`,
      borderRadius: "var(--r-xl)",
      overflow: "hidden",
      backdropFilter: "blur(16px)",
    }}>
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${color}22` }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 30, fontWeight: 900, color, letterSpacing: "-0.04em", marginBottom: 4 }}>{ticker}</div>
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>{name}</div>
      </div>
      {facts.map(({ k, v }) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 24px", borderBottom: `1px solid ${color}12` }}>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{k}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-2)", textAlign: "right", maxWidth: "55%" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}
