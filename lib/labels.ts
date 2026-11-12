import type {
  DataSource,
  FileCategory,
  Incoterm,
  Layer,
  LineStatus,
  Mode,
  Packing,
  Status,
  Tri,
  YesNo,
} from "@/lib/types";

export const STATUSES: { id: Status; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Received. Not yet in a survey or a costing." },
  {
    id: "info_incomplete",
    label: "Info incomplete",
    hint: "Waiting on the client for items on the checklist.",
  },
  {
    id: "feasibility",
    label: "Feasibility",
    hint: "Route and site survey. Not a booking.",
  },
  {
    id: "costing",
    label: "Costing",
    hint: "Vendor quotes are being collected. Lines are typed by hand.",
  },
  {
    id: "internal_approval",
    label: "Internal approval",
    hint: "With the manager for sign-off before it is sent.",
  },
  {
    id: "quoted_budgetary",
    label: "Quoted, budgetary",
    hint: "A budgetary figure was sent. Subject to confirmation.",
  },
  {
    id: "quoted_firm",
    label: "Quoted, firm",
    hint: "A firm offer was sent. Still subject to the written conditions.",
  },
  {
    id: "revision_requested",
    label: "Revision requested",
    hint: "The client asked for a change. Build the next version.",
  },
  {
    id: "won",
    label: "Won",
    hint: "Accepted. The handover note is a demo step, not a job file.",
  },
  { id: "lost", label: "Lost", hint: "Closed lost, with a reason." },
  {
    id: "expired",
    label: "Expired",
    hint: "The validity date passed and the quote was marked expired.",
  },
];

export function statusLabel(status: Status): string {
  return STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function statusHint(status: Status): string {
  return STATUSES.find((s) => s.id === status)?.hint ?? "";
}

export function isClosed(status: Status): boolean {
  return status === "won" || status === "lost" || status === "expired";
}

export const MODES: { id: Mode; label: string }[] = [
  { id: "unsure", label: "Not sure yet" },
  { id: "container", label: "Standard container" },
  { id: "open_top", label: "Open top" },
  { id: "flat_rack", label: "Flat rack" },
  { id: "breakbulk", label: "Breakbulk / heavy-lift vessel" },
  { id: "roro", label: "RoRo" },
  { id: "charter", label: "Charter" },
  { id: "interisland", label: "Domestic inter-island" },
  { id: "inland", label: "Inland haul only" },
];

export function modeLabel(mode: Mode | ""): string {
  if (!mode) return "—";
  return MODES.find((m) => m.id === mode)?.label ?? mode;
}

export const INCOTERMS: { id: Incoterm; seaOnly: boolean }[] = [
  { id: "EXW", seaOnly: false },
  { id: "FCA", seaOnly: false },
  { id: "CPT", seaOnly: false },
  { id: "CIP", seaOnly: false },
  { id: "DAP", seaOnly: false },
  { id: "DPU", seaOnly: false },
  { id: "DDP", seaOnly: false },
  { id: "FAS", seaOnly: true },
  { id: "FOB", seaOnly: true },
  { id: "CFR", seaOnly: true },
  { id: "CIF", seaOnly: true },
];

export const PACKING: { id: Packing; label: string }[] = [
  { id: "bare", label: "Bare" },
  { id: "crated", label: "Crate" },
  { id: "skid", label: "Skid" },
  { id: "cradle", label: "Cradle" },
  { id: "case", label: "Case" },
  { id: "bundle", label: "Bundle" },
  { id: "other", label: "Other" },
];

export function packingLabel(packing: Packing | ""): string {
  if (!packing) return "Packing not set";
  return PACKING.find((p) => p.id === packing)?.label ?? packing;
}

export const SOURCES: { id: DataSource; label: string }[] = [
  { id: "measured", label: "Measured" },
  { id: "manufacturer", label: "Manufacturer" },
  { id: "estimated", label: "Estimated" },
];

export function sourceLabel(source: DataSource | ""): string {
  if (!source) return "Source not set";
  return SOURCES.find((s) => s.id === source)?.label ?? source;
}

export function triLabel(value: Tri, yes: string, no: string): string {
  if (value === "yes") return yes;
  if (value === "no") return no;
  return "Not known";
}

export function yesNoLabel(value: YesNo | ""): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  if (value === "unsure") return "Not sure";
  return "—";
}

export const LAYERS: { id: Layer; label: string }[] = [
  { id: "preparation", label: "1 · Cargo preparation" },
  { id: "inland", label: "2 · Inland / abnormal road" },
  { id: "origin_port", label: "3 · Origin port" },
  { id: "ocean", label: "4 · Ocean freight" },
  { id: "lashing", label: "5 · Dunnage, lashing, sea-fastening" },
  { id: "destination", label: "6 · Destination" },
];

export function layerLabel(layer: Layer): string {
  return LAYERS.find((l) => l.id === layer)?.label ?? layer;
}

export const LINE_STATUSES: { id: LineStatus; label: string }[] = [
  { id: "provisional", label: "Provisional" },
  { id: "confirmed", label: "Confirmed" },
  { id: "reimbursable", label: "Reimbursable" },
];

export function lineStatusLabel(status: LineStatus): string {
  return LINE_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export const FILE_CATEGORIES: { id: FileCategory; label: string }[] = [
  { id: "drawing", label: "Drawing" },
  { id: "photo", label: "Photo" },
  { id: "packing_list", label: "Packing list" },
  { id: "msds", label: "MSDS" },
  { id: "lift_plan", label: "Lift plan" },
  { id: "method", label: "Method statement" },
  { id: "other", label: "Other" },
];

export function fileCategoryLabel(category: FileCategory): string {
  return FILE_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export const SCOPE_OPTIONS: { id: string; label: string }[] = [
  { id: "ocean", label: "Ocean freight" },
  { id: "inland", label: "Inland transport" },
  { id: "crane", label: "Crane and rigging" },
  { id: "packing", label: "Packing or crating" },
  { id: "permits", label: "Permits" },
  { id: "customs", label: "Customs clearance" },
  { id: "insurance", label: "Cargo insurance" },
  { id: "site", label: "Delivery to site" },
];

export function scopeLabel(id: string): string {
  return SCOPE_OPTIONS.find((s) => s.id === id)?.label ?? id;
}

export const HANDLING_OPTIONS: { id: string; label: string }[] = [
  { id: "no_stack", label: "Do not stack" },
  { id: "site_crane", label: "Crane needed at site" },
  { id: "night", label: "Night movement likely" },
  { id: "escort", label: "Escort likely" },
  { id: "lofo", label: "Last on, first off" },
  { id: "top_stow", label: "Stow on deck or on top" },
];

export function handlingLabel(id: string): string {
  return HANDLING_OPTIONS.find((s) => s.id === id)?.label ?? id;
}

export const LOST_REASONS = [
  "Price",
  "Schedule",
  "Cargo cancelled",
  "Went to a competitor",
  "No response",
  "Could not confirm the route",
  "Other",
] as const;

export const STAFF = [
  { id: "reyes", name: "A. Reyes", duty: "Sales" },
  { id: "delacruz", name: "M. Dela Cruz", duty: "Pricing" },
  { id: "bautista", name: "L. Bautista", duty: "Operations" },
  { id: "navarro", name: "P. Navarro", duty: "Manager" },
] as const;

export function staffName(id: string): string {
  return STAFF.find((s) => s.id === id)?.name ?? "Unassigned";
}

export const INDICATIVE =
  "Indicative only, subject to carrier/authority confirmation.";

export const SAMPLE_FIGURES =
  "Sample figures. Typed by hand for this demo. Not an Interfreight rate and not a carrier quote.";
