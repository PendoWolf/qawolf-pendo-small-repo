import { useState } from "react";
import { calculate } from "./api";

declare global {
  interface Window {
    pendo?: {
      track(
        name: string,
        properties?: Record<string, string | number | boolean>,
      ): void;
    };
  }
}

type Op = "+" | "-" | "*" | "/";

const BUTTONS = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "C",
  "0",
  ".",
  "+",
  "=",
] as const;

export default function App() {
  const [display, setDisplay] = useState("0");
  const [accumulator, setAccumulator] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op | null>(null);
  const [freshEntry, setFreshEntry] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = () => {
    setDisplay("0");
    setAccumulator(null);
    setPendingOp(null);
    setFreshEntry(false);
    setError(null);
  };

  const appendDigit = (digit: string) => {
    setError(null);
    if (freshEntry) {
      setDisplay(digit === "." ? "0." : digit);
      setFreshEntry(false);
      return;
    }
    if (digit === "." && display.includes(".")) return;
    setDisplay(display === "0" && digit !== "." ? digit : display + digit);
  };

  const setOperator = (op: Op) => {
    setError(null);
    const value = Number(display);
    if (accumulator === null || pendingOp === null) {
      setAccumulator(value);
    } else if (!freshEntry) {
      setAccumulator(value);
    }
    setPendingOp(op);
    setFreshEntry(true);
  };

  const evaluate = async () => {
    if (pendingOp === null || accumulator === null) return;

    const b = Number(display);
    try {
      setError(null);
      const { result } = await calculate(accumulator, pendingOp, b);

      window.pendo?.track("calculation_performed", {
        operator: pendingOp,
        operand_a: accumulator,
        operand_b: b,
        result: result,
      });

      setDisplay(String(result));
      setAccumulator(null);
      setPendingOp(null);
      setFreshEntry(true);
    } catch (e) {
      const errorMessage = (e as Error).message;

      window.pendo?.track("calculation_error", {
        operator: pendingOp,
        operand_a: accumulator,
        operand_b: b,
        error_message: errorMessage,
      });

      setError(errorMessage);
    }
  };

  const onButton = (label: (typeof BUTTONS)[number]) => {
    if (label === "C") {
      clear();
      return;
    }
    if (label === "=") {
      void evaluate();
      return;
    }
    if (label === "+" || label === "-" || label === "*" || label === "/") {
      setOperator(label);
      return;
    }
    appendDigit(label);
  };

  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 320,
        margin: "4rem auto",
        padding: "1rem",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Calculator</h1>

      <div
        data-testid="display"
        style={{
          background: "#111",
          color: "#fff",
          fontSize: "2rem",
          textAlign: "right",
          padding: "1rem",
          borderRadius: 8,
          marginBottom: "1rem",
          minHeight: "3rem",
          wordBreak: "break-all",
        }}
      >
        {display}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {BUTTONS.map((label) => (
          <button
            key={label}
            data-testid={`btn-${label}`}
            onClick={() => onButton(label)}
            style={{
              padding: "1rem",
              fontSize: "1.25rem",
              gridColumn: label === "=" ? "span 4" : undefined,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p
          data-testid="error"
          style={{ color: "crimson", marginTop: 16, textAlign: "center" }}
        >
          {error}
        </p>
      )}
    </main>
  );
}
