import { jsPDF } from "jspdf";
import { shipmentTotals } from "./calc";
import { formatFixed, formatMoney } from "./format";
import { INDICATIVE, modeLabel } from "./labels";
import { quoteTotals } from "./quote";
import { formatDay } from "./time";
import type { Inquiry, QuoteVersion } from "./types";

function wrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function ensureSpace(doc: jsPDF, y: number, need: number, bottom = 280): number {
  if (y + need <= bottom) return y;
  doc.addPage();
  return 20;
}

/** Customer-facing PDF: sell price and line descriptions only. No margin or cost build-up. */
export function downloadQuotePdf(inquiry: Inquiry, quote: QuoteVersion) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const width = pageWidth - margin * 2;
  const totals = quoteTotals(quote);
  const shipment = shipmentTotals(inquiry.pieces);
  const lines = quote.lines.filter((line) => line.description.trim() || line.amount > 0);

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Quotation", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text("SAMPLE FIGURES · Demo only. Not an Interfreight live offer.", margin, y);
  doc.setTextColor(0);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${inquiry.reference}  ·  v${quote.version} ${quote.kind}`, margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y = wrap(doc, inquiry.company, margin, y, width);
  y = wrap(doc, inquiry.projectName, margin, y + 1, width);
  y += 4;

  const meta = [
    `${inquiry.pieces.length} pieces · ${formatFixed(shipment.cbm, 2)} CBM · ${formatFixed(shipment.metricTons, 2)} t · ${formatFixed(shipment.freightTons, 2)} freight tons`,
    `${inquiry.incoterm || "Incoterm not set"} · ${modeLabel(inquiry.mode)} · Ready ${formatDay(inquiry.cargoReady)}`,
    `${inquiry.origin.city || "Origin"} → ${inquiry.destination.city || "Destination"}`,
    `Valid until ${formatDay(quote.validityDate) || "—"}`,
  ];
  for (const line of meta) {
    y = wrap(doc, line, margin, y, width, 5);
    y += 1;
  }

  y += 3;
  doc.setFontSize(8);
  doc.setTextColor(100);
  y = wrap(doc, INDICATIVE, margin, y, width, 4);
  doc.setTextColor(0);
  y += 6;

  if (lines.length > 0) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Particulars", margin, y);
    y += 5;

    doc.setFontSize(8);
    doc.setDrawColor(180);
    doc.line(margin, y, margin + width, y);
    y += 4;
    doc.text("Description", margin, y);
    doc.text("Amount", margin + width, y, { align: "right" });
    y += 2;
    doc.line(margin, y, margin + width, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    for (const line of lines) {
      const descLines = doc.splitTextToSize(line.description || "—", width * 0.72) as string[];
      const rowHeight = Math.max(descLines.length * 4, 5) + 2;
      y = ensureSpace(doc, y, rowHeight + 2);
      doc.text(descLines, margin, y);
      doc.text(formatMoney(line.amount, quote.currency), margin + width, y, { align: "right" });
      y += rowHeight;
    }
    y += 2;
  }

  y = ensureSpace(doc, y, 16);
  doc.setDrawColor(180);
  doc.line(margin, y, margin + width, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total ${formatMoney(totals.sell, quote.currency)}`, margin + width, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (quote.fxNote.trim()) {
    y = ensureSpace(doc, y, 12);
    y = wrap(doc, `FX note. ${quote.fxNote.trim()}`, margin, y, width);
    y += 4;
  }

  if (quote.inclusions.trim()) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.text("Inclusions", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = wrap(doc, quote.inclusions.trim(), margin, y, width);
    y += 4;
  }

  if (quote.exclusions.trim()) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.text("Exclusions", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = wrap(doc, quote.exclusions.trim(), margin, y, width);
    y += 4;
  }

  if (quote.subjectTo.trim()) {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.text("Subject to", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    y = wrap(doc, quote.subjectTo.trim(), margin, y, width);
    y += 4;
  }

  y = ensureSpace(doc, y, 14);
  doc.setFontSize(8);
  doc.setTextColor(110);
  wrap(
    doc,
    "Prepared in Project Cargo Desk (demo). Saved as a PDF in this browser. Nothing was emailed or filed. Internal margin is not shown on this customer copy.",
    margin,
    y,
    width,
    4,
  );

  const filename = `${inquiry.reference}-v${quote.version}-quote.pdf`;
  doc.save(filename);
}
