import { factsFromInquiry, neededGaps } from "./missing";
import type { Inquiry, Status } from "./types";

export type StageState = "done" | "current" | "future" | "ended";

export type ProgressStage = {
  id: string;
  label: string;
  state: StageState;
  reachedAt: string;
};

export type InquiryProgress = {
  stages: ProgressStage[];
  stepNumber: number;
  total: number;
  now: string;
  shortLabel: string;
  ended: "won" | "lost" | "expired" | null;
};

const TEAM_ORDER = ["received", "checking", "preparing", "approval", "sent", "result"] as const;

function teamIndex(status: Status): number {
  switch (status) {
    case "new":
      return 0;
    case "info_incomplete":
      return 1;
    case "feasibility":
    case "costing":
    case "revision_requested":
      return 2;
    case "internal_approval":
      return 3;
    case "quoted_budgetary":
    case "quoted_firm":
      return 4;
    case "won":
    case "lost":
    case "expired":
      return 5;
  }
}

function customerIndex(status: Status): number {
  switch (status) {
    case "new":
      return 0;
    case "info_incomplete":
      return 1;
    case "feasibility":
    case "costing":
    case "internal_approval":
    case "revision_requested":
      return 2;
    case "quoted_budgetary":
    case "quoted_firm":
      return 3;
    case "won":
    case "lost":
    case "expired":
      return 4;
  }
}

function firstWhen(inquiry: Inquiry, pattern: RegExp): string {
  return inquiry.timeline.find((event) => pattern.test(event.text))?.at ?? "";
}

function sentAt(inquiry: Inquiry): string {
  const stamps = inquiry.quotes.map((quote) => quote.sentAt).filter(Boolean).sort();
  return stamps[0] || firstWhen(inquiry, /marked sent/i);
}

function missingCount(inquiry: Inquiry): number {
  return neededGaps(factsFromInquiry(inquiry)).length;
}

function teamNow(inquiry: Inquiry): string {
  const missing = missingCount(inquiry);
  switch (inquiry.status) {
    case "new":
      return "Received. Interfreight has it, and has not started the check yet.";
    case "info_incomplete":
      return missing > 0
        ? `Waiting for the customer: ${missing} missing ${missing === 1 ? "item" : "items"}.`
        : "Waiting for the customer to fill in the open items.";
    case "feasibility":
      return "Interfreight is checking the route and the sites.";
    case "costing":
      return "Interfreight is preparing the cost.";
    case "revision_requested":
      return "The customer asked for a change, so this is back with Interfreight to prepare the quote again.";
    case "internal_approval":
      return "Waiting for a manager at Interfreight to agree the offer can be sent.";
    case "quoted_budgetary":
      return "A budgetary quote was sent. Waiting to hear if the customer wants to go further. It is not a firm all-in price.";
    case "quoted_firm":
      return "The quote was sent. Waiting to hear if the customer accepts it.";
    case "won":
      return inquiry.handoverNote || "Accepted. In this demo that is a note, not a job file.";
    case "lost":
      return inquiry.lostReason ? `Closed as lost. Reason: ${inquiry.lostReason}.` : "Closed as lost.";
    case "expired":
      return "The validity date passed. This quote is closed.";
  }
}

function customerNow(inquiry: Inquiry): string {
  const missing = missingCount(inquiry);
  switch (inquiry.status) {
    case "new":
      return "We have your inquiry. Interfreight will read it next.";
    case "info_incomplete":
      return missing > 0
        ? `Waiting for you: ${missing} ${missing === 1 ? "item is" : "items are"} still missing.`
        : "Waiting for you to confirm a few details.";
    case "feasibility":
    case "costing":
    case "internal_approval":
      return "Interfreight is preparing your quote.";
    case "revision_requested":
      return "You asked for a change. Interfreight is preparing the quote again.";
    case "quoted_budgetary":
    case "quoted_firm":
      return "Your quote has been sent. The next step is your decision.";
    case "won":
      return "You accepted the quote.";
    case "lost":
      return "This inquiry was closed without an acceptance.";
    case "expired":
      return "The quote passed its validity date and is closed.";
  }
}

function endedKind(status: Status): InquiryProgress["ended"] {
  if (status === "won" || status === "lost" || status === "expired") return status;
  return null;
}

export function inquiryProgress(inquiry: Inquiry, audience: "team" | "customer"): InquiryProgress {
  const team = audience === "team";
  const index = team ? teamIndex(inquiry.status) : customerIndex(inquiry.status);
  const labels = team
    ? ["Received", "Checking details", "Preparing quote", "Approval", "Quote sent", inquiry.status === "lost" ? "Lost" : inquiry.status === "expired" ? "Expired" : inquiry.status === "won" ? "Won" : "Result"]
    : ["Received", "Checking details", "Preparing your quote", "Quote sent", inquiry.status === "lost" ? "Not taken up" : inquiry.status === "expired" ? "Expired" : "Accepted"];
  const ids = team ? TEAM_ORDER : (["received", "checking", "preparing", "sent", "result"] as const);
  const dates = [
    inquiry.createdAt,
    firstWhen(inquiry, /info incomplete/i),
    firstWhen(inquiry, /feasibility|costing|revision/i),
    team ? firstWhen(inquiry, /internal approval|sign-off/i) : sentAt(inquiry),
    team ? sentAt(inquiry) : firstWhen(inquiry, /accepted|lost|expired|won/i),
    firstWhen(inquiry, /accepted|lost|expired|won/i),
  ];
  const ended = endedKind(inquiry.status);
  const stages: ProgressStage[] = ids.map((id, position) => {
    let state: StageState = "future";
    if (position < index) state = "done";
    else if (position === index) state = ended && position === ids.length - 1 && ended !== "won" ? "ended" : "current";
    if (position === index && ended === "won") state = "current";
    const reachedAt = state === "done" || state === "current" || state === "ended" ? dates[position] || "" : "";
    return { id, label: labels[position], state, reachedAt };
  });
  if (inquiry.status === "revision_requested") {
    for (const stage of stages) {
      if (stage.id === "approval" || stage.id === "sent" || stage.id === "result") {
        stage.state = "future";
        stage.reachedAt = "";
      }
    }
  }
  return {
    stages,
    stepNumber: index + 1,
    total: ids.length,
    now: team ? teamNow(inquiry) : customerNow(inquiry),
    shortLabel: labels[index],
    ended,
  };
}
