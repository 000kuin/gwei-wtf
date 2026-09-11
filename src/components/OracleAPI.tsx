import React, { useState } from "react";
import type { OracleData } from "../lib/oracle.ts";
import { IconServer, IconCopy, IconCheck } from "./Icons.tsx";

interface Props {
  data: OracleData | null;
  color: string;
}

export function OracleAPI({ data, color }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const jsonStr = data ? JSON.stringify(data, null, 2) : "{}";
  const previewStr = data ? JSON.stringify({
    baseFee:  { gwei: data.baseFee.gwei },
    gasPrice: { gwei: data.gasPrice.gwei },
    recommended: {
      fast: data.recommended.fast,
    },
    level: data.level,
    ethUsd: data.ethUsd,
    updatedAt: data.updatedAt,
  }, null, 2) : "Loading…";

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
        <IconServer size={14} color="var(--text-3)" />
        Fee Oracle API
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          color: "var(--low)", background: "rgba(0,232,122,0.1)",
          border: "1px solid rgba(0,232,122,0.3)",
          borderRadius: 99, padding: "2px 8px",
        }}>
          FREE
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 16 }}>
        Use our live gas data in your own app. No API key. No rate limit. Just fetch.
      </div>

      {/* Endpoint */}
      <div style={{
        padding: "12px 16px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginBottom: 4 }}>ENDPOINT</div>
          <code style={{ fontFamily: "var(--mono)", fontSize: 13, color }}>
            GET https://gwei.wtf/api/gas
          </code>
        </div>
        <button
          onClick={() => copy("endpoint", "https://gwei.wtf/api/gas")}
          style={{
            padding: "6px 12px", borderRadius: 6,
            border: "1px solid var(--border)",
            background: copied === "endpoint" ? "rgba(0,232,122,0.1)" : "transparent",
            color: copied === "endpoint" ? "var(--low)" : "var(--text-3)",
            fontSize: 12, fontFamily: "var(--mono)", cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {copied === "endpoint" ? "✓" : "Copy URL"}
        </button>
      </div>

      {/* Code examples */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {["fetch", "viem", "ethers"].map(lang => (
            <CodeExample key={lang} lang={lang} color={color} baseFeeGwei={data?.baseFee.gwei ?? 0} />
          ))}
        </div>
      </div>

      {/* Live JSON preview */}
      <div style={{
        background: "#06070f",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-3)" }}>
            Live response preview · updates every 5s
          </span>
          <button
            onClick={() => copy("json", jsonStr)}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: "1px solid var(--border)",
              background: copied === "json" ? "rgba(0,232,122,0.1)" : "transparent",
              color: copied === "json" ? "var(--low)" : "var(--text-3)",
              fontSize: 11, fontFamily: "var(--mono)", cursor: "pointer",
            }}
          >
            {copied === "json" ? "✓ Copied" : "Copy JSON"}
          </button>
        </div>
        <pre style={{
          padding: "16px",
          fontFamily: "var(--mono)",
          fontSize: 11,
          lineHeight: 1.65,
          color: "var(--text-2)",
          overflowX: "auto",
          margin: 0,
          maxHeight: 280,
          overflowY: "auto",
        }}>
          {colorizeJson(previewStr)}
        </pre>
      </div>
    </div>
  );
}

function CodeExample({ lang, color, baseFeeGwei }: { lang: string; color: string; baseFeeGwei: number }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const snippets: Record<string, string> = {
    fetch: `const res = await fetch('https://gwei.wtf/api/gas');
const { baseFee, recommended } = await res.json();
// baseFee.gwei = ${baseFeeGwei.toFixed(4)}
// recommended.fast.maxFeeGwei = ${(baseFeeGwei * 1.1).toFixed(4)}`,
    viem: `import { parseGwei } from 'viem'
const res = await fetch('https://gwei.wtf/api/gas');
const { recommended } = await res.json();
const maxFeePerGas = parseGwei(recommended.fast.maxFeeGwei.toString());`,
    ethers: `const res = await fetch('https://gwei.wtf/api/gas');
const { recommended } = await res.json();
const feeData = {
  maxFeePerGas: ethers.parseUnits(
    recommended.fast.maxFeeGwei.toString(), 'gwei'),
};`,
  };

  const snippet = snippets[lang];
  const copy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ flex: 1 }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: show ? `${color}18` : "var(--surface-2)",
          border: `1px solid ${show ? color + "44" : "var(--border)"}`,
          borderRadius: "var(--r-sm)",
          color: show ? color : "var(--text-2)",
          fontSize: 12, fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          fontFamily: "var(--mono)",
        }}
      >
        {lang}
      </button>
      {show && (
        <div style={{
          marginTop: 6,
          background: "#06070f",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "6px 10px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={copy} style={{
              fontSize: 10, fontFamily: "var(--mono)",
              color: copied ? "var(--low)" : "var(--text-3)",
              border: "none", background: "none", cursor: "pointer",
            }}>
              {copied ? "✓ copied" : "copy"}
            </button>
          </div>
          <pre style={{ padding: "12px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-2)", lineHeight: 1.6, margin: 0, overflowX: "auto" }}>
            {snippet}
          </pre>
        </div>
      )}
    </div>
  );
}

function colorizeJson(json: string): React.ReactNode {
  // Simple syntax highlighting
  const lines = json.split("\n");
  return lines.map((line, i) => {
    let colored = line
      .replace(/"([^"]+)":/g, '<key>"$1":</key>')
      .replace(/: "([^"]*)"/g, ': <str>"$1"</str>')
      .replace(/: (\d+\.?\d*)/g, ': <num>$1</num>')
      .replace(/: (true|false|null)/g, ': <bool>$1</bool>');

    return (
      <div key={i} dangerouslySetInnerHTML={{
        __html: colored
          .replace(/<key>/g, `<span style="color:#81e6d9">`)
          .replace(/<\/key>/g, "</span>")
          .replace(/<str>/g, `<span style="color:#68d391">`)
          .replace(/<\/str>/g, "</span>")
          .replace(/<num>/g, `<span style="color:#f6ad55">`)
          .replace(/<\/num>/g, "</span>")
          .replace(/<bool>/g, `<span style="color:#76e4f7">`)
          .replace(/<\/bool>/g, "</span>"),
      }} />
    );
  });
}
