const SYMBOL_TO_TLS_MAP: Record<string, string> = {
  $: "USD",
  "£": "GBP",
  "¥": "JPY",
  "JP¥": "JPY",
  "₩": "KRW",
  "₪": "ILS",
  "€": "EUR",
  "₱": "PHP",
  "₹": "INR",
  A$: "AUD",
  CA$: "CAD",
  HK$: "HKD",
  MX$: "MXN",
  NT$: "TWD",
  NZ$: "NZD",
  R$: "BRL",
};

export function toTLS(symbolOrTls: string): string {
  return SYMBOL_TO_TLS_MAP[symbolOrTls] ?? symbolOrTls;
}
