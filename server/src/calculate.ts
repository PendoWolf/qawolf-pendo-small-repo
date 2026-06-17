export type Op = "+" | "-" | "*" | "/";

export function calculate(a: number, operator: Op, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error("Operands must be finite numbers");
  }

  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) throw new Error("Cannot divide by zero");
      return a / b;
    default:
      throw new Error("Invalid operator");
  }
}
