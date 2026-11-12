import { formatDay } from "./time";
import { factsFromInquiry, missingItems, neededGaps, type Gap } from "./missing";
import type { Inquiry } from "./types";

export type TodoAction = "log-call" | "log-email" | "mark-sent" | "sign-off";

export type TodoItem = {
  id: string;
  label: string;
  target?: string;
  action?: TodoAction;
  kind?: "needed" | "additional" | "next";
};

export type TodoList = {
  items: TodoItem[];
  summary: string;
  complete: boolean;
  nextLabel: string;
};

export type InquirySectionId = "summary" | "pieces" | "documents" | "checklist" | "quote" | "activity";

export const INQUIRY_SECTIONS: { id: InquirySectionId; number: number; label: string }[] = [
  { id: "summary", number: 1, label: "Route & terms" },
  { id: "pieces", number: 2, label: "Pieces" },
  { id: "documents", number: 3, label: "Documents" },
  { id: "checklist", number: 4, label: "Checklist" },
  { id: "quote", number: 5, label: "Quote" },
  { id: "activity", number: 6, label: "Activity" },
];

export function fieldSelector(gapId: string): string {
  if (gapId.startsWith("est-")) return `#field-source-${gapId.slice(4)}`;
  return `#field-${gapId}`;
}

export function sectionForGap(gapId: string): InquirySectionId {
  if (
    gapId.startsWith("cog-") ||
    gapId.startsWith("lift-") ||
    gapId.startsWith("pack-") ||
    gapId.startsWith("source-") ||
    gapId.startsWith("est-") ||
    gapId.startsWith("rev-")
  ) {
    return "pieces";
  }
  if (gapId === "drawing" || gapId === "photo") return "documents";
  return "summary";
}

export function sectionForTourTarget(target?: string): InquirySectionId | null {
  if (!target) return null;
  if (target === "pieces") return "pieces";
  if (target === "missing" || target === "permits") return "checklist";
  if (target === "quote") return "quote";
  if (target === "activity" || target === "log-update") return "activity";
  return null;
}

export function sectionMissingCounts(inquiry: Inquiry): Record<InquirySectionId, { needed: number; additional: number }> {
  const cleared = new Set(inquiry.clearedGaps ?? []);
  const gaps = missingItems(factsFromInquiry(inquiry)).filter((gap) => !cleared.has(gap.id) && gap.severity !== "provisional");
  const counts: Record<InquirySectionId, { needed: number; additional: number }> = {
    summary: { needed: 0, additional: 0 },
    pieces: { needed: 0, additional: 0 },
    documents: { needed: 0, additional: 0 },
    checklist: { needed: 0, additional: 0 },
    quote: { needed: 0, additional: 0 },
    activity: { needed: 0, additional: 0 },
  };
  for (const gap of gaps) {
    const section = sectionForGap(gap.id);
    if (gap.severity === "needed") counts[section].needed += 1;
    else counts[section].additional += 1;
  }
  return counts;
}

function plainMissing(gap: Gap): string {
  if (gap.id.startsWith("cog-")) return `Missing: centre of gravity for ${gap.id.slice(4)}`;
  if (gap.id.startsWith("lift-")) return `Missing: lifting points for ${gap.id.slice(5)}`;
  if (gap.id.startsWith("est-")) return `Missing: a weighed figure for ${gap.id.slice(4)}`;
  if (gap.id.startsWith("pack-")) return `Missing: how ${gap.id.slice(5)} is packed`;
  if (gap.id.startsWith("source-")) return `Missing: where the figures for ${gap.id.slice(7)} came from`;
  if (gap.id.startsWith("rev-")) return `Missing: revision date for ${gap.id.slice(4)}`;
  if (gap.id === "drawing") return "Missing: a dimensioned drawing";
  if (gap.id === "photo") return "Missing: photos of the cargo";
  if (gap.id === "origin-access") return "Missing: how the truck gets in at pickup";
  if (gap.id === "destination-access") return "Missing: how the truck gets in at delivery";
  if (gap.id === "deck") return "Missing: trailer deck height";
  if (gap.id === "dg") return "Missing: what dangerous goods are on board";
  if (gap.id === "value") return "Missing: the cargo value";
  if (gap.id === "cities") return "Missing: the pickup or delivery city";
  if (gap.id === "incoterm") return "Missing: who pays for which part of the trip";
  if (gap.id === "ready") return "Missing: the date the cargo is ready";
  if (gap.id === "onsite") return "Missing: when the site needs the cargo";
  if (gap.id === "hs") return "Missing: HS code";
  if (gap.id === "pol") return "Missing: port of loading";
  if (gap.id === "pod") return "Missing: port of discharge";
  return `Missing: ${gap.label}`;
}

function plainAdditional(gap: Gap): string {
  return plainMissing(gap).replace(/^Missing:/, "Additional:");
}

function openNeeded(inquiry: Inquiry): Gap[] {
  const cleared = new Set(inquiry.clearedGaps ?? []);
  return neededGaps(factsFromInquiry(inquiry)).filter((gap) => !cleared.has(gap.id));
}

function openAdditional(inquiry: Inquiry): Gap[] {
  const cleared = new Set(inquiry.clearedGaps ?? []);
  return missingItems(factsFromInquiry(inquiry)).filter(
    (gap) => gap.severity === "later" && !cleared.has(gap.id),
  );
}

function nextItem(inquiry: Inquiry, today: string, audience: "team" | "customer"): TodoItem {
  const due = inquiry.followUpDate && today && inquiry.followUpDate <= today;
  const dueText = inquiry.followUpDate === today ? "due today" : inquiry.followUpDate ? `due ${formatDay(inquiry.followUpDate)}` : "";
  if (audience === "customer") {
    if (inquiry.status === "info_incomplete") return { id: "next", label: "Next: send the details still listed above", kind: "next" };
    if (inquiry.status === "quoted_budgetary" || inquiry.status === "quoted_firm") return { id: "next", label: "Next: tell Interfreight if you accept the quote", kind: "next" };
    if (inquiry.status === "won") return { id: "next", label: "Next: none. You accepted the quote.", kind: "next" };
    if (inquiry.status === "lost" || inquiry.status === "expired") return { id: "next", label: "Next: none. This inquiry is closed.", kind: "next" };
    return { id: "next", label: "Next: Interfreight is preparing your quote", kind: "next" };
  }
  if (inquiry.status === "won" || inquiry.status === "lost" || inquiry.status === "expired") {
    return { id: "next", label: "Next: none. This inquiry is closed.", kind: "next" };
  }
  if (due && (inquiry.status === "info_incomplete" || inquiry.status === "quoted_budgetary" || inquiry.status === "quoted_firm")) {
    return { id: "next", label: `Next: follow up with the customer (${dueText})`, action: "log-call", target: "#log-update", kind: "next" };
  }
  if (inquiry.status === "new" || inquiry.status === "info_incomplete") {
    return { id: "next", label: "Next: call or email the customer about what is missing", action: "log-call", target: "#log-update", kind: "next" };
  }
  if (inquiry.status === "feasibility") {
    return { id: "next", label: "Next: check the route and the sites", target: "#summary", kind: "next" };
  }
  const quote = inquiry.quotes[inquiry.quotes.length - 1];
  const hasCost = inquiry.quotes.some((version) => version.lines.some((line) => line.description.trim() && line.amount > 0));
  if (inquiry.status === "costing" || inquiry.status === "revision_requested") {
    if (!hasCost) return { id: "next", label: "Next: type the trucking cost", target: "#quote", kind: "next" };
    if (!quote || quote.approval !== "signed_off") return { id: "next", label: "Next: get manager sign-off", target: "#record-signoff", action: "sign-off", kind: "next" };
    return { id: "next", label: "Next: mark the quote sent", target: "#mark-sent", action: "mark-sent", kind: "next" };
  }
  if (inquiry.status === "internal_approval") {
    return { id: "next", label: "Next: get manager sign-off", target: "#record-signoff", action: "sign-off", kind: "next" };
  }
  return { id: "next", label: "Next: follow up with the customer", action: "log-call", target: "#log-update", kind: "next" };
}

export function inquiryTodos(inquiry: Inquiry, today: string, audience: "team" | "customer" = "team"): TodoList {
  const missing = openNeeded(inquiry).map((gap) => ({
    id: gap.id,
    label: plainMissing(gap),
    target: fieldSelector(gap.id),
    kind: "needed" as const,
  }));
  const additional = openAdditional(inquiry).map((gap) => ({
    id: gap.id,
    label: plainAdditional(gap),
    target: fieldSelector(gap.id),
    kind: "additional" as const,
  }));
  const next = nextItem(inquiry, today, audience);
  const closed = inquiry.status === "won" || inquiry.status === "lost" || inquiry.status === "expired";
  const complete = missing.length === 0 && !closed;
  const items = closed ? [] : [...missing, ...additional, next];
  const nextLabel = next.label.replace(/^Next:\s*/, "");
  let summary = "Closed";
  if (!closed && missing.length === 0) {
    summary =
      additional.length > 0
        ? `Required details complete. ${additional.length} optional ${additional.length === 1 ? "item" : "items"}. Next: ${nextLabel}`
        : `All details complete. Next: ${nextLabel}`;
  } else if (!closed) {
    const count = missing.length + additional.length + 1;
    summary = `${count} ${count === 1 ? "thing" : "things"} to do`;
  }
  return { items, summary, complete, nextLabel };
}

export function focusTarget(selector?: string) {
  if (!selector || typeof document === "undefined") return;
  const element = document.querySelector(selector);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("desk-field-flash");
  window.setTimeout(() => element.classList.remove("desk-field-flash"), 2200);
  const field = element.matches("input, textarea, select, button")
    ? element
    : element.querySelector("input, textarea, select, button");
  if (field instanceof HTMLElement) {
    window.setTimeout(() => field.focus(), 280);
  }
}
