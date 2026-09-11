import React, { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  decimals?: number;
  style?: React.CSSProperties;
  color?: string;
}

// Animates each digit slot individually like a slot machine
export function RollingNumber({ value, decimals = 4, style, color = "inherit" }: Props) {
  const formatted = value < 1
    ? value.toFixed(Math.max(decimals, 4))
    : value.toFixed(decimals);

  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", ...style }}>
      {formatted.split("").map((char, i) => (
        <Digit key={i} char={char} color={color} />
      ))}
    </span>
  );
}

function Digit({ char, color }: { char: string; color: string }) {
  const isNum = /\d/.test(char);
  const [prev, setPrev] = useState<string>(char);
  const [current, setCurrent] = useState<string>(char);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined as unknown as ReturnType<typeof setTimeout>);

  useEffect(() => {
    if (char === current) return;
    setPrev(current);
    setCurrent(char);
    setAnimating(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAnimating(false), 300);
  }, [char]);

  if (!isNum) {
    return (
      <span style={{ color: color === "inherit" ? undefined : color, opacity: 0.6 }}>
        {char}
      </span>
    );
  }

  return (
    <span style={{
      display: "inline-block",
      overflow: "hidden",
      position: "relative",
      height: "1em",
      lineHeight: "1em",
    }}>
      <span style={{
        display: "block",
        transform: animating ? "translateY(-100%)" : "translateY(0)",
        transition: animating ? "transform 0.25s cubic-bezier(0.4,0,0.2,1)" : "none",
        color,
      }}>
        {current}
      </span>
      {animating && (
        <span style={{
          position: "absolute",
          top: "100%",
          left: 0,
          color,
          transform: animating ? "translateY(-100%)" : "translateY(0)",
          transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {prev}
        </span>
      )}
    </span>
  );
}
