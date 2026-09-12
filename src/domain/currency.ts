import type { CurrencyCode } from "./sample-case.ts";

export function formatMoney(amountCents: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}
