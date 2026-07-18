export function formatPrice(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MKD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateDiscountPercent(
  original: number,
  sale: number,
): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}
