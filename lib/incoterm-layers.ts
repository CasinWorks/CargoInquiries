import type { Incoterm, Layer } from "./types";

export type SuggestedLine = {
  layer: Layer;
  description: string;
};

/** Starter cost-line descriptions by Incoterm — empty amounts for the desk to type. */
export function suggestedLinesForIncoterm(incoterm: Incoterm | ""): SuggestedLine[] {
  const commonPrep: SuggestedLine[] = [
    { layer: "preparation", description: "Packing / crating / skidding (if in scope)" },
  ];
  const inlandOrigin: SuggestedLine[] = [
    { layer: "inland", description: "Origin inland / abnormal road haul" },
  ];
  const originPort: SuggestedLine[] = [
    { layer: "origin_port", description: "Origin port / terminal / THC" },
  ];
  const ocean: SuggestedLine[] = [{ layer: "ocean", description: "Ocean freight" }];
  const lashing: SuggestedLine[] = [
    { layer: "lashing", description: "Dunnage, lashing, sea-fastening" },
  ];
  const destination: SuggestedLine[] = [
    { layer: "destination", description: "Destination port / delivery / site" },
  ];
  const insurance: SuggestedLine[] = [{ layer: "ocean", description: "Cargo insurance (if quoted)" }];
  const duties: SuggestedLine[] = [
    { layer: "destination", description: "Import duties / taxes (if DDP and in scope)" },
  ];

  switch (incoterm) {
    case "EXW":
      // Buyer arranges most legs; seller may still quote optional origin work.
      return [
        ...commonPrep,
        { layer: "inland", description: "Optional: origin haul (buyer usually arranges under EXW)" },
        { layer: "origin_port", description: "Optional: origin port (buyer usually arranges under EXW)" },
      ];
    case "FCA":
    case "FAS":
      return [...commonPrep, ...inlandOrigin, ...originPort];
    case "FOB":
      return [...commonPrep, ...inlandOrigin, ...originPort, ...lashing];
    case "CFR":
    case "CPT":
      return [...commonPrep, ...inlandOrigin, ...originPort, ...ocean, ...lashing];
    case "CIF":
    case "CIP":
      return [...commonPrep, ...inlandOrigin, ...originPort, ...ocean, ...insurance, ...lashing];
    case "DAP":
    case "DPU":
      return [...commonPrep, ...inlandOrigin, ...originPort, ...ocean, ...lashing, ...destination];
    case "DDP":
      return [...commonPrep, ...inlandOrigin, ...originPort, ...ocean, ...lashing, ...destination, ...duties];
    default:
      return [...commonPrep, ...inlandOrigin, ...originPort, ...ocean, ...lashing, ...destination];
  }
}

export function incotermScopeNote(incoterm: Incoterm | ""): string {
  switch (incoterm) {
    case "EXW":
      return "EXW: seller makes the goods available at their premises. Most transport is buyer’s side unless you quote optional legs.";
    case "FCA":
      return "FCA: seller delivers to the named place / carrier. Buyer usually takes ocean and onward.";
    case "FAS":
      return "FAS (sea): seller places goods alongside the vessel. Buyer takes loading and ocean.";
    case "FOB":
      return "FOB (sea): seller delivers on board. Buyer usually takes ocean freight and destination.";
    case "CFR":
      return "CFR (sea): seller pays ocean to destination port. Insurance and inland delivery often buyer’s.";
    case "CIF":
      return "CIF (sea): seller pays ocean and minimum insurance to destination port.";
    case "CPT":
      return "CPT: seller pays carriage to named place. Insurance often buyer’s unless CIP.";
    case "CIP":
      return "CIP: seller pays carriage and insurance to named place.";
    case "DAP":
      return "DAP: seller delivers to named place ready for unloading. Import clearance usually buyer’s.";
    case "DPU":
      return "DPU: seller delivers and unloads at named place. Import clearance usually buyer’s.";
    case "DDP":
      return "DDP: seller delivers cleared for import, duties paid (if in scope). Highest seller responsibility.";
    default:
      return "Set an Incoterm so the priced legs are clear. Suggested lines are a starting list only.";
  }
}
