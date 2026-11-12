import { isClosed } from "./labels";
import { factsFromInquiry, neededGaps } from "./missing";
import { addDays, daysBetween } from "./time";
import type { Inquiry, Status } from "./types";

export type DeskStats = {
  byStatus: Record<Status, number>;
  needing: Inquiry[];
  awaiting: Inquiry[];
  followUps: Inquiry[];
  expiring: Inquiry[];
  meanDays: number | null;
  quotedCount: number;
  won: number;
  lost: number;
  recent: Inquiry[];
};

function firstSent(inquiry: Inquiry): string | null {
  const sent = inquiry.quotes.map((quote) => quote.sentAt).filter(Boolean).sort();
  return sent[0] ?? null;
}

export function deskStats(inquiries: Inquiry[], today: string): DeskStats {
  const byStatus = {
    new: 0,
    info_incomplete: 0,
    feasibility: 0,
    costing: 0,
    internal_approval: 0,
    quoted_budgetary: 0,
    quoted_firm: 0,
    revision_requested: 0,
    won: 0,
    lost: 0,
    expired: 0,
  } satisfies Record<Status, number>;
  for (const inquiry of inquiries) byStatus[inquiry.status] += 1;

  const needing = inquiries.filter(
    (inquiry) => !isClosed(inquiry.status) && neededGaps(factsFromInquiry(inquiry)).length > 0,
  );
  const awaiting = inquiries.filter(
    (inquiry) =>
      !isClosed(inquiry.status) &&
      (inquiry.status === "internal_approval" || inquiry.quotes.some((quote) => quote.approval === "pending")),
  );
  const followUps = inquiries.filter(
    (inquiry) => Boolean(inquiry.followUpDate) && inquiry.followUpDate <= today && !isClosed(inquiry.status),
  );
  const horizon = today ? addDays(today, 7) : "";
  const expiring = inquiries.filter((inquiry) => {
    if (!today || isClosed(inquiry.status)) return false;
    return inquiry.quotes.some(
      (quote) => quote.sentAt && quote.validityDate && quote.validityDate >= today && quote.validityDate <= horizon,
    );
  });

  const spans = inquiries
    .map((inquiry) => {
      const sent = firstSent(inquiry);
      if (!sent) return null;
      return daysBetween(inquiry.createdAt, sent);
    })
    .filter((value): value is number => value != null && Number.isFinite(value));
  const meanDays = spans.length ? spans.reduce((sum, value) => sum + value, 0) / spans.length : null;

  const recent = [...inquiries].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 8);

  return {
    byStatus,
    needing,
    awaiting,
    followUps,
    expiring,
    meanDays,
    quotedCount: spans.length,
    won: byStatus.won,
    lost: byStatus.lost,
    recent,
  };
}

export function matchesQuery(inquiry: Inquiry, query: string): boolean {
  const hay = [
    inquiry.reference,
    inquiry.company,
    inquiry.projectName,
    inquiry.commodity,
    inquiry.contactName,
    inquiry.origin.city,
    inquiry.destination.city,
    inquiry.pol,
    inquiry.pod,
  ]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => hay.includes(part));
}
