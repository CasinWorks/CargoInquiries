import { shipmentTotals } from "./calc";
import { modeLabel, statusLabel } from "./labels";
import { quoteTotals } from "./quote";
import { formatDay } from "./time";
import type { Inquiry } from "./types";

function csvCell(value: string | number): string {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

/** One row per inquiry for spreadsheet export. Sell total only — no margin breakdown. */
export function inquiriesToCsv(inquiries: Inquiry[]): string {
  const header = [
    "Reference",
    "Sample",
    "Stage",
    "Company",
    "Contact",
    "Email",
    "Phone",
    "Project",
    "Incoterm",
    "Mode",
    "Origin",
    "Destination",
    "POL",
    "POD",
    "Cargo ready",
    "Pieces",
    "CBM",
    "Metric tons",
    "Freight tons",
    "Latest quote",
    "Quote currency",
    "Sell total",
    "Quote sent",
    "Follow-up",
    "Updated",
  ];

  const rows = inquiries.map((inquiry) => {
    const shipment = shipmentTotals(inquiry.pieces);
    const quote = inquiry.quotes[inquiry.quotes.length - 1];
    const sell = quote ? quoteTotals(quote).sell.toFixed(2) : "";

    return [
      inquiry.reference,
      inquiry.sample ? "SAMPLE" : "",
      statusLabel(inquiry.status),
      inquiry.company,
      inquiry.contactName,
      inquiry.email,
      inquiry.phone,
      inquiry.projectName,
      inquiry.incoterm || "",
      modeLabel(inquiry.mode),
      inquiry.origin.city,
      inquiry.destination.city,
      inquiry.pol,
      inquiry.pod,
      formatDay(inquiry.cargoReady),
      inquiry.pieces.length,
      shipment.cbm.toFixed(2),
      shipment.metricTons.toFixed(2),
      shipment.freightTons.toFixed(2),
      quote ? `v${quote.version} ${quote.kind}` : "",
      quote?.currency ?? "",
      sell,
      quote?.sentAt ? formatDay(quote.sentAt) : "",
      formatDay(inquiry.followUpDate),
      formatDay(inquiry.updatedAt),
    ].map(csvCell);
  });

  return [header.map(csvCell).join(","), ...rows.map((row) => row.join(","))].join("\n");
}

export function downloadInquiriesCsv(inquiries: Inquiry[], filename = "project-cargo-desk-inquiries.csv") {
  const csv = inquiriesToCsv(inquiries);
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
