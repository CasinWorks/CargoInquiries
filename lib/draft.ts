import type { Inquiry, InquiryDraft, Piece, PieceDraft, Site } from "./types";

export function emptySite(): Site {
  return { name: "", address: "", city: "", country: "", accessNotes: "" };
}

export function blankPiece(n: number): PieceDraft {
  return {
    id: `P-${String(n).padStart(2, "0")}`,
    description: "",
    qty: "1",
    lengthM: "",
    widthM: "",
    heightM: "",
    weightKg: "",
    packing: "",
    stackable: "unknown",
    cogKnown: "unknown",
    cogNote: "",
    liftingKnown: "unknown",
    liftingNote: "",
    dataSource: "",
    revisionDate: "",
  };
}

export function emptyDraft(): InquiryDraft {
  return {
    company: "",
    companyCity: "",
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    projectName: "",
    commodity: "",
    hsCode: "",
    cargoValue: "",
    cargoValueCurrency: "USD",
    insurance: "",
    scope: ["ocean", "inland"],
    pieces: [blankPiece(1)],
    files: [],
    origin: { ...emptySite(), country: "" },
    pol: "",
    destination: { ...emptySite(), country: "Philippines" },
    pod: "",
    incoterm: "",
    cargoReady: "",
    requiredOnSite: "",
    mode: "",
    deckHeightM: "",
    dg: "",
    dgDetails: "",
    specialHandling: [],
    specialNotes: "",
  };
}

export function nextPieceId(pieces: { id: string }[]): string {
  let max = 0;
  for (const piece of pieces) {
    const match = /^P-(\d+)$/.exec(piece.id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `P-${String(max + 1).padStart(2, "0")}`;
}

export function draftToPiece(draft: PieceDraft): Piece | null {
  const qty = Number(draft.qty);
  const lengthM = Number(draft.lengthM);
  const widthM = Number(draft.widthM);
  const heightM = Number(draft.heightM);
  const weightKg = Number(draft.weightKg);
  if (![qty, lengthM, widthM, heightM, weightKg].every((n) => Number.isFinite(n))) return null;
  if (qty <= 0 || lengthM <= 0 || widthM <= 0 || heightM <= 0 || weightKg <= 0) return null;
  if (!Number.isInteger(qty)) return null;
  return {
    id: draft.id,
    description: draft.description.trim(),
    qty,
    lengthM,
    widthM,
    heightM,
    weightKg,
    packing: draft.packing,
    stackable: draft.stackable,
    cogKnown: draft.cogKnown,
    cogNote: draft.cogNote.trim(),
    liftingKnown: draft.liftingKnown,
    liftingNote: draft.liftingNote.trim(),
    dataSource: draft.dataSource,
    revisionDate: draft.revisionDate,
  };
}

export function shellInquiry(): Inquiry {
  return {
    id: "",
    reference: "",
    sample: false,
    createdAt: "",
    updatedAt: "",
    status: "new",
    company: "",
    companyCity: "",
    contactName: "",
    contactRole: "",
    email: "",
    phone: "",
    projectName: "",
    commodity: "",
    hsCode: "",
    cargoValue: "",
    cargoValueCurrency: "",
    insurance: "",
    scope: [],
    pieces: [],
    files: [],
    origin: emptySite(),
    pol: "",
    destination: emptySite(),
    pod: "",
    incoterm: "",
    cargoReady: "",
    requiredOnSite: "",
    mode: "",
    deckHeightM: "",
    dg: "",
    dgDetails: "",
    specialHandling: [],
    specialNotes: "",
    assignment: { sales: "", pricing: "", approver: "" },
    notes: [],
    timeline: [],
    quotes: [],
    followUpDate: "",
    lostReason: "",
    handoverNote: "",
    permitDone: [],
  };
}
