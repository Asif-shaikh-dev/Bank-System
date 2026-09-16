export function formatCurrency(amount, { compact = false } = {}) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: compact ? 1 : 2,
      notation: compact && Math.abs(amount) >= 100000 ? "compact" : "standard",
    }).format(amount);
  }