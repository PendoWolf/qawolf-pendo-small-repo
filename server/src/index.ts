import express from "express";
import cors from "cors";
import { calculate, type Op } from "./calculate.js";

const app = express();
const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());
app.use(cors(corsOrigin ? { origin: corsOrigin } : undefined));
app.use(express.json());

const OPS = new Set<Op>(["+", "-", "*", "/"]);

app.post("/api/calculate", (req, res) => {
  const { a, operator, b } = req.body as { a?: unknown; operator?: unknown; b?: unknown };

  if (typeof a !== "number" || typeof b !== "number" || typeof operator !== "string") {
    res.status(400).json({ error: "Request must include numeric a and b and a string operator" });
    return;
  }

  if (!OPS.has(operator as Op)) {
    res.status(400).json({ error: "Invalid operator" });
    return;
  }

  try {
    const result = calculate(a, operator as Op, b);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
