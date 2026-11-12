import { formatDay } from "./time";
import { factsFromInquiry, neededGaps, type Gap } from "./missing";
import type { Inquiry } from "./types";

export type TodoAction = "log-call" | "log-email" | "mark-sent" | "sign-off";

export type TodoItem = {
  id: string;
  label: string;
  target?: string;
  action?: TodoAction;
};

export type TodoList = {
  items: TodoItem[];
  summary: string;
  complete: boolean;
  nextLabel: string;
};

function plainMissing(gap: Gap): string {
  if (gap.id.startsWith("cog-")) return `Missing: centre of gravity for ${gap.id.slice(4)}`;
  if (gap.id.startsWith("lift-")) return `Missing: lifting points for ${gap.id.slice(5)}`;
  if (gap.id.startsWith("est-")) return `Missing: a weighed figure for ${gap.id.slice(4)}`;
  if (gap.id.startsWith("pack-")) return `Missing: how ${gap.id.slice(5)} is packed`;
  if (gap.id.startsWith("source-")) return `Missing: where the figures for ${gap.id.slice(7)} came from`;
  if (gap.id === "drawing") return "Missing: a dimensioned drawing";
  if (gap.id === "origin-access") return "Missing: how the truck gets in at pickup";
  if (gap.id === "destination-access") return "Missing: how the truck gets in at delivery";
  if (gap.id === "deck") return "Missing: trailer deck height";
  if (gap.id === "dg") return "Missing: what dangerous goods are on board";
  if (gap.id === "value") return "Missing: the cargo value";
  if (gap.id === "cities") return "Missing: the pickup or delivery city";
  if (gap.id === "incoterm") return "Missing: who pays for which part of the trip";
  if (gap.id === "ready") return "Missing: the date the cargo is ready";
  return `Missing: ${gap.label}`;
}

function targetFor(gap: Gap): string {
  if (gap.id === "drawing" || gap.id === "dg") return "#documents";
  if (gap.id.startsWith("cog-") || gap.id.startsWith("lift-") || gap.id.startsWith("est-") || gap.id.startsWith("pack-") || gap.id.startsWith("source-")) {
    return "#pieces";
  }
  return "#summary";
}

function openGaps(inquiry: Inquiry): Gap[] {
  const cleared = new Set(inquiry.clearedGaps ?? []);
  return neededGaps(factsFromInquiry(inquiry)).filter((gap) => gap.severity !== "later" && !cleared.has(gap.id));
}

function nextItem(inquiry: Inquiry, today: string, audience: "team" | "customer"): TodoItem {
  const due = inquiry.followUpDate && today && inquiry.followUpDate <= today;
  const dueText = inquiry.followUpDate === today ? "due today" : inquiry.followUpDate ? `due ${formatDay(inquiry.followUpDate)}` : "";
  if (audience === "customer") {
    if (inquiry.status === "info_incomplete") return { id: "next", label: "Next: send the details still listed above" };
    if (inquiry.status === "quoted_budgetary" || inquiry.status === "quoted_firm") return { id: "next", label: "Next: tell Interfreight if you accept the quote" };
    if (inquiry.status === "won") return { id: "next", label: "Next: none. You accepted the quote." };
    if (inquiry.status === "lost" || inquiry.status === "expired") return { id: "next", label: "Next: none. This inquiry is closed." };
    return { id: "next", label: "Next: Interfreight is preparing your quote" };
  }
  if (inquiry.status === "won" || inquiry.status === "lost" || inquiry.status === "expired") {
    return { id: "next", label: "Next: none. This inquiry is closed." };
  }
  if (due && (inquiry.status === "info_incomplete" || inquiry.status === "quoted_budgetary" || inquiry.status === "quoted_firm")) {
    return { id: "next", label: `Next: follow up with the customer (${dueText})`, action: "log-call", target: "#log-update" };
  }
  if (inquiry.status === "new" || inquiry.status === "info_incomplete") {
    return { id: "next", label: "Next: call or email the customer about what is missing", action: "log-call", target: "#log-update" };
  }
  if (inquiry.status === "feasibility") {
    return { id: "next", label: "Next: check the route and the sites", target: "#summary" };
  }
  const quote = inquiry.quotes[inquiry.quotes.length - 1];
  const hasCost = inquiry.quotes.some((version) => version.lines.some((line) => line.description.trim() && line.amount > 0));
  if (inquiry.status === "costing" || inquiry.status === "revision_requested") {
    if (!hasCost) return { id: "next", label: "Next: type the trucking cost", target: "#quote" };
    if (!quote || quote.approval !== "signed_off") return { id: "next", label: "Next: get manager sign-off", target: "#record-signoff", action: "sign-off" };
    return { id: "next", label: "Next: mark the quote sent", target: "#mark-sent", action: "mark-sent" };
  }
  if (inquiry.status === "internal_approval") {
    return { id: "next", label: "Next: get manager sign-off", target: "#record-signoff", action: "sign-off" };
  }
  return { id: "next", label: "Next: follow up with the customer", action: "log-call", target: "#log-update" };
}

export function inquiryTodos(inquiry: Inquiry, today: string, audience: "team" | "customer" = "team"): TodoList {
  const missing = openGaps(inquiry).map((gap) => ({
    id: gap.id,
    label: plainMissing(gap),
    target: targetFor(gap),
  }));
  const next = nextItem(inquiry, today, audience);
  const closed = inquiry.status === "won" || inquiry.status === "lost" || inquiry.status === "expired";
  const complete = missing.length === 0 && !closed;
  const items = closed ? [] : [...missing, next];
  const nextLabel = next.label.replace(/^Next:\s*/, "");
  let summary = "Closed";
  if (!closed && missing.length === 0) summary = `All details complete. Next: ${nextLabel}`;
  else if (!closed) summary = `${items.length} ${items.length === 1 ? "thing" : "things"} to do`;
  return { items, summary, complete, nextLabel };
}

export function focusTarget(selector?: string) {
  if (!selector) return;
  const element = document.querySelector(selector);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add("outline", "outline-2", "outline-offset-2", "outline-zinc-950");
  window.setTimeout(() => element.classList.remove("outline", "outline-2", "outline-offset-2", "outline-zinc-950"), 1800);
  const field = element.matches("input, textarea, select, button")
    ? element
    : element.querySelector("input, textarea, select, button");
  if (field instanceof HTMLElement) field.focus();
}
