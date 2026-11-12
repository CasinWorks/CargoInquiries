const num = new Intl.NumberFormat("en-US");

export function formatInt(value: number): string {
  return num.format(Math.round(value));
}

export function formatFixed(value: number, digits = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatM(metres: number): string {
  return formatFixed(metres, 2);
}

export function formatKg(kg: number): string {
  return `${formatInt(kg)} kg`;
}

export function formatTons(tonnes: number): string {
  return `${formatFixed(tonnes, 2)} t`;
}

export function formatCbm(cbm: number): string {
  return `${formatFixed(cbm, 2)} m³`;
}

export function formatMoney(amount: number, currency: "USD" | "PHP"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${formatFixed(bytes / 1024, 0)} KB`;
  return `${formatFixed(bytes / (1024 * 1024), 1)} MB`;
}
