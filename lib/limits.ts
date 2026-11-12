export type OverPart =
  | "length"
  | "width"
  | "height"
  | "door width"
  | "door height"
  | "payload";

export type EquipmentLimit = {
  id: string;
  label: string;
  group: "primary" | "more";
  source: string;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  doorWidthMm?: number;
  doorHeightMm?: number;
  payloadKg: number;
};

/**
 * Published example limits. Carriers state that the actual unit can differ.
 * Dry-box figures: Hapag-Lloyd container specification.
 * Open-top and flat-rack in-gauge figures: Maersk out-of-gauge page, converted from cm.
 * Extra flat-rack rows: Hapag-Lloyd / published flat-rack sheets.
 */
export const EQUIPMENT: EquipmentLimit[] = [
  {
    id: "20gp",
    label: "20' GP",
    group: "primary",
    source: "Hapag-Lloyd container specification (example)",
    lengthMm: 5900,
    widthMm: 2352,
    heightMm: 2393,
    doorWidthMm: 2340,
    doorHeightMm: 2292,
    payloadKg: 30200,
  },
  {
    id: "40gp",
    label: "40' GP",
    group: "primary",
    source: "Hapag-Lloyd container specification (example)",
    lengthMm: 12032,
    widthMm: 2352,
    heightMm: 2395,
    doorWidthMm: 2340,
    doorHeightMm: 2292,
    payloadKg: 28800,
  },
  {
    id: "40hc",
    label: "40' HC",
    group: "primary",
    source: "Hapag-Lloyd container specification (example)",
    lengthMm: 12032,
    widthMm: 2352,
    heightMm: 2700,
    doorWidthMm: 2340,
    doorHeightMm: 2597,
    payloadKg: 28650,
  },
  {
    id: "20ot",
    label: "20' OT",
    group: "primary",
    source: "Maersk out-of-gauge page, in-gauge example",
    lengthMm: 5490,
    widthMm: 2220,
    heightMm: 2340,
    payloadKg: 28200,
  },
  {
    id: "40ot",
    label: "40' OT",
    group: "primary",
    source: "Maersk out-of-gauge page, in-gauge example",
    lengthMm: 11810,
    widthMm: 2190,
    heightMm: 2340,
    payloadKg: 28600,
  },
  {
    id: "40fr",
    label: "40' FR",
    group: "primary",
    source: "Maersk out-of-gauge page, in-gauge example",
    lengthMm: 11630,
    widthMm: 2440,
    heightMm: 1940,
    payloadKg: 34500,
  },
  {
    id: "40othc",
    label: "40' OT HC",
    group: "more",
    source: "Maersk out-of-gauge page, in-gauge example",
    lengthMm: 11810,
    widthMm: 2190,
    heightMm: 2650,
    payloadKg: 28600,
  },
  {
    id: "40frhc",
    label: "40' FR HC",
    group: "more",
    source: "Maersk out-of-gauge page, in-gauge example",
    lengthMm: 11630,
    widthMm: 2440,
    heightMm: 2260,
    payloadKg: 34500,
  },
  {
    id: "20fr",
    label: "20' FR",
    group: "more",
    source: "Hapag-Lloyd flat rack, minimum inside length (example)",
    lengthMm: 5638,
    widthMm: 2438,
    heightMm: 2233,
    payloadKg: 42100,
  },
  {
    id: "40frhc-hl",
    label: "40' FR HC (HL)",
    group: "more",
    source: "Hapag-Lloyd 40' flatrack high cube (example)",
    lengthMm: 11652,
    widthMm: 2347,
    heightMm: 2265,
    payloadKg: 49100,
  },
];

export const FLOOR_EXAMPLES = [
  { id: "20-wood", label: "20' wooden floor", tPerM: 4.8 },
  { id: "20-steel", label: "20' steel floor", tPerM: 7.6 },
  { id: "40-wood", label: "40' wooden floor", tPerM: 3.0 },
  { id: "40-steel", label: "40' steel floor", tPerM: 6.0 },
] as const;

export const ROAD = {
  widthM: 2.5,
  heightM: 4,
  lengthTwoAxleM: 10,
  lengthThreeAxleM: 14,
  lengthCombinedM: 18,
  axleKg: 13500,
} as const;

export const HEAVY_LIFT_NOTE =
  "Bands match the ICTSI Manila Multipurpose Terminal heavy-lift stevedoring tiers effective 1 Jan 2026 (5–10 t, >10–20 t, >20–30 t, >30 t). A tag only. Not a price.";

export function metresToMm(metres: number): number {
  return Math.round(metres * 1000);
}
