export function formatINR(n: number | string) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDate(d: Date | string | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(n: number | string) {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return new Intl.NumberFormat("en-IN").format(num);
}
