import { formatMoney } from "./format";
import { nowIso, uid } from "./time";
import type { CostLine, QuoteVersion } from "./types";

export const DEFAULT_INCLUSIONS = `The legs and services named in the cost lines.
Lashing materials only where a line is entered.`;

export const DEFAULT_EXCLUSIONS = `Duties, taxes, and customs examinations.
Storage, demurrage, and detention.
Weather delay, and crane or truck standby beyond any hours written in a line.
Dangerous goods that were not declared on the inquiry.
Anything with no cost line.`;

export const DEFAULT_SUBJECT = `Packed dimensions, weights, and the cargo-ready date as stated on the inquiry.
Space and a sailing still to be confirmed with a carrier. This desk does not show schedules.
Fuel, foreign exchange, and carrier adjustments.
A price is not a booking, and a booking is not an engineering certificate.`;

export type QuoteTotals = {
  subtotal: number;
  contingency: number;
  beforeMargin: number;
  margin: number;
  sell: number;
};

export function quoteTotals(quote: QuoteVersion): QuoteTotals {
  const subtotal = quote.lines.reduce((sum, line) => sum + (Number.isFinite(line.amount) ? line.amount : 0), 0);
  const contingency = subtotal * (quote.contingencyPct / 100);
  const beforeMargin = subtotal + contingency + (Number.isFinite(quote.riskAllowance) ? quote.riskAllowance : 0);
  const margin = beforeMargin * (quote.marginPct / 100);
  return {
    subtotal,
    contingency,
    beforeMargin,
    margin,
    sell: beforeMargin + margin,
  };
}

export function blankLine(layer: CostLine["layer"]): CostLine {
  return {
    id: uid(),
    layer,
    description: "",
    vendor: "",
    basis: "lump sum",
    amount: 0,
    lineStatus: "provisional",
    note: "",
  };
}

export function blankQuote(
  version: number,
  kind: QuoteVersion["kind"],
  copy?: QuoteVersion,
): QuoteVersion {
  return {
    id: uid(),
    version,
    kind,
    currency: copy?.currency ?? "USD",
    fxNote:
      copy?.fxNote ??
      "Type the rate you are using. This demo does not fetch a foreign-exchange rate.",
    lines: copy ? copy.lines.map((line) => ({ ...line })) : [],
    contingencyPct: copy?.contingencyPct ?? 8,
    riskAllowance: copy?.riskAllowance ?? 0,
    marginPct: copy?.marginPct ?? 10,
    validityDate: "",
    inclusions: copy?.inclusions ?? DEFAULT_INCLUSIONS,
    exclusions: copy?.exclusions ?? DEFAULT_EXCLUSIONS,
    subjectTo: copy?.subjectTo ?? DEFAULT_SUBJECT,
    approval: "draft",
    approvalNote: "",
    approvedAt: "",
    outcome: "",
    sentAt: "",
    createdAt: nowIso(),
  };
}

export function diffQuotes(previous: QuoteVersion, next: QuoteVersion): string[] {
  const changes: string[] = [];
  const previousById = new Map(previous.lines.map((line) => [line.id, line]));
  const nextIds = new Set(next.lines.map((line) => line.id));
  if (previous.kind !== next.kind) changes.push(`Kind: ${previous.kind} → ${next.kind}`);
  if (previous.currency !== next.currency) changes.push(`Currency: ${previous.currency} → ${next.currency}`);
  for (const line of next.lines) {
    const old = previousById.get(line.id);
    const name = line.description || "Untitled line";
    if (!old) {
      changes.push(`Added: ${name} (${formatMoney(line.amount, next.currency)})`);
      continue;
    }
    if (old.amount !== line.amount) {
      changes.push(
        `${name}: ${formatMoney(old.amount, previous.currency)} → ${formatMoney(line.amount, next.currency)}`,
      );
    } else if (old.lineStatus !== line.lineStatus) {
      changes.push(`${name}: ${old.lineStatus} → ${line.lineStatus}`);
    }
  }
  for (const line of previous.lines) {
    if (!nextIds.has(line.id)) changes.push(`Removed: ${line.description || "Untitled line"}`);
  }
  if (previous.contingencyPct !== next.contingencyPct) {
    changes.push(`Contingency: ${previous.contingencyPct}% → ${next.contingencyPct}%`);
  }
  if (previous.riskAllowance !== next.riskAllowance) {
    changes.push(
      `Risk allowance: ${formatMoney(previous.riskAllowance, previous.currency)} → ${formatMoney(next.riskAllowance, next.currency)}`,
    );
  }
  if (previous.marginPct !== next.marginPct) {
    changes.push(`Margin: ${previous.marginPct}% → ${next.marginPct}%`);
  }
  return changes;
}

export function quoteReadyToSend(quote: QuoteVersion): string | null {
  if (quote.approval !== "signed_off") return "Record manager sign-off before marking this version sent.";
  if (!quote.lines.some((line) => line.description.trim() && line.amount > 0)) {
    return "Add at least one cost line with a description and an amount.";
  }
  if (!quote.validityDate) return "Enter a validity date.";
  return null;
}
