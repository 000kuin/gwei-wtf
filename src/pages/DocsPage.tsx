import React, { useState } from "react";
import {
  IconActivity, IconFlame, IconLayers, IconWallet, IconServer,
  IconBell, IconBarChart, IconZap, IconShield, IconClock,
  IconSearch, IconGlobe, IconMarket,
} from "../components/Icons.tsx";

const sections = [
  {
    id: "overview",
    label: "Overview",
    Icon: IconActivity,
    title: "Overview tab",
    subtitle: "Live gas intelligence at a glance",
    body: `The Overview tab is your command center for Robinhood Chain gas fees. Everything updates in real time — no page refresh needed.`,
    features: [
      {
        name: "Live gwei number",
        Icon: IconZap,
        desc: "The giant number at the top of the page is the current base fee in gwei, pulled directly from the Robinhood Chain public RPC every 5 seconds. It uses a smoothed median of the last 6 readings to avoid flickering from single-block spikes.",
      },
      {
        name: "GO / OK / WAIT / HOLD verdict",
        Icon: IconActivity,
        desc: "One word that answers the question everyone actually has: should I transact right now? The verdict is based on where current fees sit relative to the 24-hour average, with hysteresis to prevent it from flipping on tiny movements. GO = below 25th percentile. OK = near average. WAIT = elevated. HOLD = spike.",
      },
      {
        name: "Cost estimator strip",
        Icon: IconBarChart,
        desc: "The four cost cards under the gwei number show you the exact USD cost of common actions at current gas prices — Transfer (21k gas), Swap (150k), Bridge (250k), and Deploy (500k). ETH price is fetched from CoinGecko every 60 seconds.",
      },
      {
        name: "24h percentile bar",
        Icon: IconActivity,
        desc: "The thin bar shows where current fees sit relative to the last 24 hours. The dot moves left when fees are cheap, right when expensive. Mousing over it shows the exact percentile.",
      },
      {
        name: "Fee history chart",
        Icon: IconBarChart,
        desc: "500 blocks of base fee history rendered as an area chart. The dashed line is the 24h average. Hover any point to see the exact gwei and block number. Use this to spot patterns — fee spikes around market open (9:30am ET) and close (4pm ET) are common on Robinhood Chain because of stock token trading.",
      },
      {
        name: "Cost estimator",
        Icon: IconBarChart,
        desc: "Pick an action type from the grid (or enter a custom gas limit), and get the exact USD cost at current gas prices. Updates instantly as fees change.",
      },
      {
        name: "Fee breakdown",
        Icon: IconZap,
        desc: "Shows the split between base fee (burned) and priority tip (goes to validators). Includes three speed tiers — Slow, Normal, Fast — with estimated inclusion times. The Quick Copy section lets you copy chain ID, RPC URL, and exact fee values for use in your wallet or code.",
      },
      {
        name: "Live block stream",
        Icon: IconActivity,
        desc: "The rightmost column shows the last 12 blocks in real time. New blocks slide in from the top with an animation. Each row shows the block number (links to Blockscout), gas utilization bar, base fee, transaction count, and age.",
      },
      {
        name: "Best time to transact",
        Icon: IconClock,
        desc: "Uses 500 blocks of historical data to estimate which UTC hour typically has the cheapest gas on Robinhood Chain. The bar chart shows relative fee levels across all 24 hours. The cheapest window and current hour are highlighted. Shows how much you'd save by waiting.",
      },
    ],
  },
  {
    id: "market",
    label: "Market Clock",
    Icon: IconMarket,
    title: "US Market clock",
    subtitle: "Why market hours matter on Robinhood Chain",
    body: `Robinhood Chain is unique among blockchains — it has tokenized stocks. When US markets open (9:30am ET) and close (4pm ET), gas fees spike because traders pile into stock token transactions. The Market Clock warns you before it happens.`,
    features: [
      {
        name: "Session tracker",
        Icon: IconMarket,
        desc: "Shows the current US market session: Pre-Market (4am–9:30am ET), Regular Hours (9:30am–4pm ET), After-Hours (4pm–8pm ET), or Closed. The session bar visualizes all 24 hours of ET time with the current position.",
      },
      {
        name: "Surge countdown",
        Icon: IconClock,
        desc: "When US markets are within 15 minutes of opening or closing, the clock turns red and warns you that a gas surge is likely incoming. At under 5 minutes, it flashes. This gives you time to either transact immediately or wait 20–30 minutes after the event.",
      },
    ],
  },
  {
    id: "alert",
    label: "Gas Alert",
    Icon: IconBell,
    title: "Gas alert",
    subtitle: "Get notified when fees drop — no account needed",
    body: `Set a gwei threshold and walk away. When fees drop below your target, you get a native browser notification. No email, no account, no app. Works while the tab is open in the background.`,
    features: [
      {
        name: "How it works",
        Icon: IconBell,
        desc: "Enter a target gwei value and click Enable. The browser asks for notification permission once. Every time gwei.wtf polls (every 5 seconds), it checks if the current fee is below your threshold. If it is, a browser notification fires — once per minute maximum to avoid spam.",
      },
      {
        name: "What you need",
        Icon: IconShield,
        desc: "Just a browser with notifications enabled. Works in Chrome, Firefox, Edge, Safari. The tab must remain open (can be minimized or in the background). No backend, no account, no data stored anywhere.",
      },
    ],
  },
  {
    id: "wars",
    label: "Gas Wars",
    Icon: IconFlame,
    title: "Gas Wars tab",
    subtitle: "See exactly what is consuming gas right now",
    body: `The Gas Wars tab analyzes the last 5 blocks to show you which contracts are driving congestion, and whether MEV bots are sandwiching transactions.`,
    features: [
      {
        name: "Contract congestion",
        Icon: IconFlame,
        desc: "Scans recent blocks and groups transactions by destination contract. Contracts consuming an above-average share of block gas are flagged. The top contract is shown with its transaction count, share of total gas, and a link to Blockscout.",
      },
      {
        name: "Spike detector",
        Icon: IconFlame,
        desc: "When current fees are more than 20% above the 24h average, a banner appears above the tabs explaining why — naming the specific contract responsible. Severity levels: Mild (+20%), Moderate (+50%), Severe (+100%+).",
      },
      {
        name: "MEV sandwich detector",
        Icon: IconShield,
        desc: "Scans transaction ordering in recent blocks for classic sandwich attack patterns: same attacker address sending a transaction immediately before and immediately after a victim transaction to the same contract, with higher gas prices on both sides. When detected, shows the front-run, victim, and back-run transactions with Blockscout links.",
      },
    ],
  },
  {
    id: "bids",
    label: "Bid Board",
    Icon: IconLayers,
    title: "On-chain bid board",
    subtitle: "Post public inclusion bids directly to Robinhood Chain",
    body: `The Bid Board is a public, on-chain orderbook of gas bids. Anyone can post "I'll pay X gwei for inclusion before block Y." Block builders can read this to understand real demand. All bids are non-custodial — a small ETH deposit is required and fully refunded when the bid is fulfilled or expires.`,
    features: [
      {
        name: "How to post a bid",
        Icon: IconZap,
        desc: "Click Post bid, enter your max fee (gwei), how many blocks from now you need inclusion, and an optional public note. Connect your wallet — gwei.wtf will prompt you to add Robinhood Chain if it's not already configured. Confirm the transaction. Your bid is now on-chain and visible to block builders.",
      },
      {
        name: "Deposit and refund",
        Icon: IconShield,
        desc: "Posting a bid requires a 0.0001 ETH deposit. This is not a fee — it's held in the GasBidBoard contract and refunded when you mark the bid as fulfilled, or when you withdraw after the target block has passed. It exists to prevent spam.",
      },
      {
        name: "GasBidBoard contract",
        Icon: IconLayers,
        desc: "The contract is deployed on Robinhood Chain (Chain ID 4663), open source (MIT), and verified on Blockscout. It is non-upgradeable — no admin can change bid data or withhold funds. The full source is on GitHub.",
      },
    ],
  },
  {
    id: "wallet",
    label: "Wallet",
    Icon: IconWallet,
    title: "Wallet tab",
    subtitle: "Understand your personal gas spend",
    body: `Two tools for wallet analysis: a gas usage scanner and a shareable gas report card.`,
    features: [
      {
        name: "Gas usage scanner",
        Icon: IconSearch,
        desc: "Paste any 0x wallet address and scan the last 200 blocks on Robinhood Chain. See total gas spent in USD and ETH, transaction count, average gas price paid, and the single most expensive transaction — with a link to Blockscout.",
      },
      {
        name: "Gas report card",
        Icon: IconWallet,
        desc: "Generate a shareable summary of your gas spend. Looks like a premium card — wallet address, total spend, transaction count, average gwei, ETH price used. One-click copy to share as text on Twitter or Telegram: 'I spent $X on gas on Robinhood Chain.'",
      },
    ],
  },
  {
    id: "api",
    label: "Oracle API",
    Icon: IconServer,
    title: "Oracle API tab",
    subtitle: "Use gwei.wtf data in your own app — free, no key needed",
    body: `The fee oracle exposes current Robinhood Chain gas data as a public JSON endpoint. Use it in your own contracts, apps, or scripts. No API key. No rate limit. No registration.`,
    features: [
      {
        name: "Endpoint",
        Icon: IconGlobe,
        desc: "GET https://gwei.wtf/api/gas returns a JSON object with current base fee, gas price, priority tip, recommended maxFeePerGas for slow/normal/fast speeds, ETH/USD price, and pre-calculated USD costs for common transaction types.",
      },
      {
        name: "Code snippets",
        Icon: IconServer,
        desc: "The API tab includes ready-to-use code examples for fetch (plain JavaScript), viem, and ethers.js. Click the library name to expand the snippet, then copy it directly into your project.",
      },
      {
        name: "Live preview",
        Icon: IconActivity,
        desc: "The JSON preview pane shows the actual current response with syntax highlighting, updated every 5 seconds. Copy the full JSON with one click.",
      },
    ],
  },
];

export function DocsPage() {
  const [active, setActive] = useState("overview");
  const current = sections.find(s => s.id === active) ?? sections[0]!;

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr" }}>
      {/* Sidebar */}
      <aside style={{
        borderRight: "1px solid var(--border)",
        padding: "40px 0",
        position: "sticky", top: 52, height: "calc(100vh - 52px)",
        overflowY: "auto",
        background: "var(--bg-2)",
      }}>
        <div style={{ padding: "0 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            gwei.wtf
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.04em" }}>Documentation</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px" }}>
          {sections.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "9px 12px", borderRadius: "var(--r-sm)",
                background: active === id ? "var(--glass)" : "transparent",
                border: `1px solid ${active === id ? "var(--border-2)" : "transparent"}`,
                color: active === id ? "var(--low)" : "var(--text-3)",
                fontSize: 13, fontWeight: active === id ? 600 : 400,
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (active !== id) e.currentTarget.style.color = "var(--text-2)"; }}
              onMouseLeave={e => { if (active !== id) e.currentTarget.style.color = "var(--text-3)"; }}
            >
              <Icon size={13} color="currentColor" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main style={{ padding: "48px 64px 80px", maxWidth: 780 }}>
        <div style={{ fontSize: 10, color: "var(--low)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          {current.label}
        </div>
        <h1 style={{ fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 8, lineHeight: 1.1 }}>
          {current.title}
        </h1>
        <div style={{ fontSize: 16, color: "var(--text-2)", marginBottom: 32, lineHeight: 1.5 }}>
          {current.subtitle}
        </div>

        <div style={{
          padding: "16px 20px",
          background: "var(--glass)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r)",
          backdropFilter: "blur(12px)",
          fontSize: 14, color: "var(--text-2)", lineHeight: 1.7,
          marginBottom: 40,
        }}>
          {current.body}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {current.features.map(({ name, Icon, desc }) => (
            <div key={name} style={{
              padding: "20px 24px",
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "var(--r-sm)",
                  background: "var(--low-dim)", border: "1px solid var(--low-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={13} color="var(--low)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.02em" }}>{name}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
