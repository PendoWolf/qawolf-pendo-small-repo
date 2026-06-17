export interface CalculateResult {
  result: number;
}

export async function calculate(a: number, operator: string, b: number): Promise<CalculateResult> {
  const res = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ a, operator, b }),
  });

  const data = (await res.json()) as CalculateResult & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed: ${res.status}`);
  return data;
}
