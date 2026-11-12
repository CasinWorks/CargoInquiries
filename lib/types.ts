export type Role = "customer" | "team";

export type Status =
  | "new"
  | "info_incomplete"
  | "feasibility"
  | "costing"
  | "internal_approval"
  | "quoted_budgetary"
  | "quoted_firm"
  | "revision_requested"
  | "won"
  | "lost"
  | "expired";

export type Incoterm =
  | "EXW"
  | "FCA"
  | "CPT"
  | "CIP"
  | "DAP"
  | "DPU"
  | "DDP"
  | "FAS"
  | "FOB"
  | "CFR"
  | "CIF";

export type Mode =
  | "unsure"
  | "container"
  | "open_top"
  | "flat_rack"
  | "breakbulk"
  | "roro"
  | "charter"
  | "interisland"
  | "inland";

export type DataSource = "measured" | "manufacturer" | "estimated";

export type Packing =
  | "bare"
  | "crated"
  | "skid"
  | "cradle"
  | "case"
  | "bundle"
  | "other";

export type Tri = "yes" | "no" | "unknown";

export type YesNo = "yes" | "no" | "unsure";

export type Piece = {
  id: string;
  description: string;
  qty: number;
  lengthM: number;
  widthM: number;
  heightM: number;
  weightKg: number;
  packing: Packing | "";
  stackable: Tri;
  cogKnown: Tri;
  cogNote: string;
  liftingKnown: Tri;
  liftingNote: string;
  dataSource: DataSource | "";
  revisionDate: string;
};

export type PieceDraft = {
  id: string;
  description: string;
  qty: string;
  lengthM: string;
  widthM: string;
  heightM: string;
  weightKg: string;
  packing: Packing | "";
  stackable: Tri;
  cogKnown: Tri;
  cogNote: string;
  liftingKnown: Tri;
  liftingNote: string;
  dataSource: DataSource | "";
  revisionDate: string;
};

export type FileCategory =
  | "drawing"
  | "photo"
  | "packing_list"
  | "msds"
  | "lift_plan"
  | "method"
  | "other";

export type CargoFile = {
  id: string;
  name: string;
  size: number;
  mime: string;
  category: FileCategory;
  pieceId: string;
  revision: string;
  addedAt: string;
  previewDataUrl?: string;
};

export type Site = {
  name: string;
  address: string;
  city: string;
  country: string;
  accessNotes: string;
};

export type Layer =
  | "preparation"
  | "inland"
  | "origin_port"
  | "ocean"
  | "lashing"
  | "destination";

export type LineStatus = "provisional" | "confirmed" | "reimbursable";

export type CostLine = {
  id: string;
  layer: Layer;
  description: string;
  vendor: string;
  basis: string;
  amount: number;
  lineStatus: LineStatus;
  note: string;
};

export type QuoteVersion = {
  id: string;
  version: number;
  kind: "budgetary" | "firm";
  currency: "USD" | "PHP";
  fxNote: string;
  lines: CostLine[];
  contingencyPct: number;
  riskAllowance: number;
  marginPct: number;
  validityDate: string;
  inclusions: string;
  exclusions: string;
  subjectTo: string;
  approval: "draft" | "pending" | "signed_off" | "changes";
  approvalNote: string;
  approvedAt: string;
  outcome: "" | "sent" | "follow_up" | "accepted" | "lost";
  sentAt: string;
  createdAt: string;
};

export type Note = {
  id: string;
  at: string;
  author: string;
  text: string;
};

export type TimelineKind =
  | "created"
  | "status"
  | "note"
  | "assignment"
  | "quote"
  | "signoff"
  | "outcome"
  | "file"
  | "clarification";

export type TimelineEvent = {
  id: string;
  at: string;
  kind: TimelineKind;
  text: string;
};

export type Inquiry = {
  id: string;
  reference: string;
  sample: boolean;
  createdAt: string;
  updatedAt: string;
  status: Status;
  company: string;
  companyCity: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  projectName: string;
  commodity: string;
  hsCode: string;
  cargoValue: string;
  cargoValueCurrency: "USD" | "PHP" | "EUR" | "";
  insurance: YesNo | "";
  scope: string[];
  pieces: Piece[];
  files: CargoFile[];
  origin: Site;
  pol: string;
  destination: Site;
  pod: string;
  incoterm: Incoterm | "";
  cargoReady: string;
  requiredOnSite: string;
  mode: Mode | "";
  deckHeightM: string;
  dg: YesNo | "";
  dgDetails: string;
  specialHandling: string[];
  specialNotes: string;
  assignment: { sales: string; pricing: string; approver: string };
  notes: Note[];
  timeline: TimelineEvent[];
  quotes: QuoteVersion[];
  followUpDate: string;
  lostReason: string;
  handoverNote: string;
  permitDone: string[];
};

export type InquiryDraft = {
  company: string;
  companyCity: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  projectName: string;
  commodity: string;
  hsCode: string;
  cargoValue: string;
  cargoValueCurrency: "USD" | "PHP" | "EUR" | "";
  insurance: YesNo | "";
  scope: string[];
  pieces: PieceDraft[];
  files: CargoFile[];
  origin: Site;
  pol: string;
  destination: Site;
  pod: string;
  incoterm: Incoterm | "";
  cargoReady: string;
  requiredOnSite: string;
  mode: Mode | "";
  deckHeightM: string;
  dg: YesNo | "";
  dgDetails: string;
  specialHandling: string[];
  specialNotes: string;
};
