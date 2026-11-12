import type { Inquiry, InquirySource, Status, TimelineKind } from "./types";

export const SOURCES: { id: InquirySource; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "walk_in", label: "Walk-in" },
  { id: "web", label: "Web form" },
];

export function sourceOf(inquiry: Pick<Inquiry, "source" | "sample">): InquirySource {
  return inquiry.source ?? (inquiry.sample ? "email" : "web");
}

export function sourceLabel(source: InquirySource): string {
  return SOURCES.find((item) => item.id === source)?.label ?? source;
}

export function statusForStage(stageId: string, from: Status): Status {
  switch (stageId) {
    case "received":
      return "new";
    case "checking":
      return "info_incomplete";
    case "preparing":
      if (from === "quoted_budgetary" || from === "quoted_firm" || from === "internal_approval") return "revision_requested";
      if (from === "feasibility") return "feasibility";
      return "costing";
    case "approval":
      return "internal_approval";
    case "sent":
      return "quoted_budgetary";
    default:
      return from;
  }
}

export function stageLabelForMove(stageId: string): string {
  switch (stageId) {
    case "received":
      return "Received";
    case "checking":
      return "Checking details";
    case "preparing":
      return "Preparing quote";
    case "approval":
      return "Approval";
    case "sent":
      return "Quote sent";
    default:
      return "Result";
  }
}

export type LogKind = "call" | "email_in" | "email_out" | "info";

export function logKindToTimeline(kind: LogKind): { timeline: TimelineKind; lead: string } {
  switch (kind) {
    case "call":
      return { timeline: "call", lead: "Phone call." };
    case "email_in":
      return { timeline: "email", lead: "Email received." };
    case "email_out":
      return { timeline: "email", lead: "Email sent." };
    case "info":
      return { timeline: "email", lead: "Customer sent missing information." };
  }
}
