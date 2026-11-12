import { exceeds40HcEnvelope, roadCheck } from "./calc";
import type { CargoFile, Inquiry, Piece, Site } from "./types";

export type GapSeverity = "needed" | "provisional" | "later";

export type Gap = {
  id: string;
  severity: GapSeverity;
  label: string;
  detail: string;
};

export type CargoFacts = {
  pieces: Piece[];
  files: CargoFile[];
  origin: Site;
  destination: Site;
  pol: string;
  pod: string;
  incoterm: string;
  cargoReady: string;
  requiredOnSite: string;
  mode: string;
  deckHeightM: string;
  dg: string;
  dgDetails: string;
  insurance: string;
  cargoValue: string;
  hsCode: string;
};

export function factsFromInquiry(inquiry: Inquiry): CargoFacts {
  return {
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
}

function hasTechnicalDrawing(files: CargoFile[]): boolean {
  return files.some((file) => file.category === "drawing" || file.category === "lift_plan" || file.category === "method");
}

function needsDrawing(piece: Piece, deck: string): boolean {
  if (exceeds40HcEnvelope(piece)) return true;
  const road = roadCheck(piece, deck);
  if (road.widthOver || road.lengthOver) return true;
  if (road.heightState === "over" || road.heightState === "cargo_alone_over") return true;
  return false;
}

function deckMatters(piece: Piece): boolean {
  return piece.widthM > 2.5 || piece.heightM > 2.5 || piece.lengthM > 12;
}

export function missingItems(facts: CargoFacts): Gap[] {
  const gaps: Gap[] = [];
  const heavy = facts.pieces.filter((piece) => piece.weightKg >= 5000);

  for (const piece of heavy) {
    if (piece.cogKnown !== "yes") {
      gaps.push({
        id: `cog-${piece.id}`,
        severity: "later",
        label: `${piece.id} centre of gravity`,
        detail: `${piece.description || piece.id} is ${piece.weightKg.toLocaleString("en-US")} kg. Centre of gravity is useful for lifting later. It is not required to proceed with the inquiry.`,
      });
    }
    if (piece.liftingKnown !== "yes") {
      gaps.push({
        id: `lift-${piece.id}`,
        severity: "later",
        label: `${piece.id} lifting points`,
        detail: `${piece.description || piece.id} has no confirmed lifting points yet. Useful additional detail later. Hook height is not calculated here.`,
      });
    }
  }

  for (const piece of facts.pieces) {
    if (!piece.dataSource) {
      gaps.push({
        id: `source-${piece.id}`,
        severity: "needed",
        label: `${piece.id} data source`,
        detail: "Mark the weight and dimensions as measured, manufacturer-supplied, or estimated.",
      });
    }
    if (!piece.packing) {
      gaps.push({
        id: `pack-${piece.id}`,
        severity: "needed",
        label: `${piece.id} packing`,
        detail: "Packed size is what gets quoted. Say whether this piece is bare, crated, on a skid, or in a cradle.",
      });
    }
    if (piece.dataSource === "estimated") {
      gaps.push({
        id: `est-${piece.id}`,
        severity: "provisional",
        label: `${piece.id} is estimated`,
        detail: "An estimated weight should not quietly become the figure used for lifting. Keep the offer budgetary until it is replaced.",
      });
    }
    if (!piece.revisionDate) {
      gaps.push({
        id: `rev-${piece.id}`,
        severity: "later",
        label: `${piece.id} revision date`,
        detail: "No revision date on this piece. Dimension changes after fixing are a common cause of re-quotes.",
      });
    }
  }

  if (facts.pieces.some((piece) => needsDrawing(piece, facts.deckHeightM)) && !hasTechnicalDrawing(facts.files)) {
    gaps.push({
      id: "drawing",
      severity: "later",
      label: "Dimensioned drawing",
      detail: "A dimensioned drawing helps when a piece looks out of gauge. Useful additional info — not required to proceed with the inquiry.",
    });
  }

  if (!facts.files.some((file) => file.category === "photo")) {
    gaps.push({
      id: "photo",
      severity: "later",
      label: "Photos",
      detail: "No photo is attached. Carriers often ask for several sides, tied to the same piece ID.",
    });
  }

  if (!facts.origin.accessNotes.trim()) {
    gaps.push({
      id: "origin-access",
      severity: "needed",
      label: "Origin site access",
      detail: "Gate, crane on site, overhead lines, or road approach at the origin is blank.",
    });
  }
  if (!facts.destination.accessNotes.trim()) {
    gaps.push({
      id: "destination-access",
      severity: "needed",
      label: "Destination site access",
      detail: "Gate, crane on site, overhead lines, or road approach at the destination is blank.",
    });
  }
  if (!facts.origin.city.trim() || !facts.destination.city.trim()) {
    gaps.push({
      id: "cities",
      severity: "needed",
      label: "Origin and destination",
      detail: "Both sites need a city or municipality.",
    });
  }
  if (!facts.incoterm) {
    gaps.push({
      id: "incoterm",
      severity: "needed",
      label: "Incoterm",
      detail: "The offer needs an Incoterm so the priced legs are clear.",
    });
  }
  if (!facts.cargoReady) {
    gaps.push({
      id: "ready",
      severity: "needed",
      label: "Cargo-ready date",
      detail: "Cargo that is not ready when the ship is fixed is a common and expensive miss.",
    });
  }
  if (!facts.requiredOnSite) {
    gaps.push({
      id: "onsite",
      severity: "later",
      label: "Required on site",
      detail: "No date for when the site needs the cargo.",
    });
  }

  if (!facts.deckHeightM.trim() && facts.pieces.some(deckMatters)) {
    gaps.push({
      id: "deck",
      severity: "needed",
      label: "Trailer deck height",
      detail: "The 4.0 m road height includes the trailer deck. A deck height has not been entered, and at least one piece is wide, long, or tall enough that the deck will matter.",
    });
  }

  if (facts.dg === "yes") {
    const hasMsds = facts.files.some((file) => file.category === "msds");
    if (!hasMsds && facts.dgDetails.trim().length < 8) {
      gaps.push({
        id: "dg",
        severity: "needed",
        label: "Dangerous goods detail",
        detail: "DG is marked yes. Add an MSDS or a short note of the residue, fuel, battery, or pressure system. This is not a dangerous-goods declaration.",
      });
    }
  }

  if (facts.insurance === "yes" && !facts.cargoValue.trim()) {
    gaps.push({
      id: "value",
      severity: "needed",
      label: "Cargo value",
      detail: "Insurance is requested and no cargo value was given.",
    });
  }

  if (!facts.hsCode.trim()) {
    gaps.push({
      id: "hs",
      severity: "later",
      label: "HS code",
      detail: "No HS code. This demo does not classify goods or compute duty.",
    });
  }

  const oceanish = facts.mode && facts.mode !== "inland" && facts.mode !== "unsure";
  if (oceanish && !facts.pol.trim()) {
    gaps.push({
      id: "pol",
      severity: "later",
      label: "Port of loading",
      detail: "POL is blank.",
    });
  }
  if (oceanish && !facts.pod.trim()) {
    gaps.push({
      id: "pod",
      severity: "later",
      label: "Port of discharge",
      detail: "POD is blank.",
    });
  }

  return gaps;
}

export function neededGaps(facts: CargoFacts): Gap[] {
  return missingItems(facts).filter((gap) => gap.severity === "needed");
}
