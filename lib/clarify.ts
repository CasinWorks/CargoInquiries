import { formatCbm, formatKg, formatM, formatTons } from "./format";
import { missingItems, type CargoFacts } from "./missing";
import { formatDay } from "./time";
import type { Inquiry } from "./types";

export function clarificationDraft(inquiry: Inquiry): string {
  const facts: CargoFacts = {
    pieces: inquiry.pieces,
    files: inquiry.files,
    origin: inquiry.origin,
    destination: inquiry.destination,
    pol: inquiry.pol,
    pod: inquiry.pod,
    incoterm: inquiry.incoterm,
    cargoReady: inquiry.cargoReady,
    requiredOnSite: inquiry.requiredOnSite,
    mode: inquiry.mode,
    deckHeightM: inquiry.deckHeightM,
    dg: inquiry.dg,
    dgDetails: inquiry.dgDetails,
    insurance: inquiry.insurance,
    cargoValue: inquiry.cargoValue,
    hsCode: inquiry.hsCode,
  };
  const gaps = missingItems(facts).filter((gap) => gap.severity !== "later");
  const lines = inquiry.pieces.map((piece) => {
    return `- ${piece.id} ${piece.description}: ${piece.qty} × ${formatM(piece.lengthM)} × ${formatM(piece.widthM)} × ${formatM(piece.heightM)} m, ${formatKg(piece.weightKg)} each (${formatCbm(piece.lengthM * piece.widthM * piece.heightM)} each, ${formatTons(piece.weightKg / 1000)} each). Source: ${piece.dataSource || "not set"}.`;
  });
  const gapLines = gaps.length
    ? gaps.map((gap) => `- ${gap.label}. ${gap.detail}`).join("\n")
    : "- Nothing on the needed list right now. Please still confirm the packed sizes if anything has been re-crated.";

  return `To: ${inquiry.email || "(no email)"}
Subject: ${inquiry.reference} — items still needed for ${inquiry.projectName}

Good day${inquiry.contactName ? ` ${inquiry.contactName}` : ""},

Thank you for the inquiry on ${inquiry.projectName}. Before we ask a carrier or a haulier for a firm figure, we still need the items below. Please tie any drawing to the piece ID and the revision.

${gapLines}

What we already have on the piece list:
${lines.join("\n") || "- No pieces yet."}

Cargo-ready date on the inquiry: ${formatDay(inquiry.cargoReady)}.
Route: ${inquiry.origin.city || "origin"} to ${inquiry.destination.city || "destination"}.

Packed dimensions, per piece, are what we will pass on. If a figure is still estimated, please say so. We will not treat an estimate as a weighbridge weight.

This note was drafted in Project Cargo Desk and was not emailed.

${inquiry.reference}`;
}
