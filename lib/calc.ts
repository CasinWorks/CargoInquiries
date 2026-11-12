import {
  EQUIPMENT,
  FLOOR_EXAMPLES,
  HEAVY_LIFT_NOTE,
  ROAD,
  type EquipmentLimit,
  type OverPart,
  metresToMm,
} from "./limits";
import type { Piece } from "./types";

export type BandId = "under_5" | "5_10" | "10_20" | "20_30" | "over_30";

export type HeightState = "cargo_alone_over" | "deck_missing" | "over" | "not_over";

export type EquipmentResult = {
  id: string;
  label: string;
  group: "primary" | "more";
  source: string;
  over: OverPart[];
  limitText: string;
};

export type FloorResult = {
  tPerM: number | null;
  exceeds: string[];
};

export type RoadResult = {
  widthOver: boolean;
  lengthOver: boolean;
  lengthNote: string;
  heightState: HeightState;
  totalHeightM: number | null;
  axleNote: boolean;
};

export type PieceCheck = {
  piece: Piece;
  unitCbm: number;
  lineCbm: number;
  lineKg: number;
  lineTons: number;
  lineFreightTons: number;
  band: BandId;
  equipment: EquipmentResult[];
  road: RoadResult;
  floor: FloorResult;
};

export type Governs = "weight" | "volume" | "level" | "none";

export type ShipmentTotals = {
  cbm: number;
  kg: number;
  metricTons: number;
  freightTons: number;
  governs: Governs;
  densityKgPerCbm: number | null;
  counted: number;
};

export function lineCbm(piece: Pick<Piece, "lengthM" | "widthM" | "heightM" | "qty">): number {
  return piece.lengthM * piece.widthM * piece.heightM * piece.qty;
}

export function lineKg(piece: Pick<Piece, "weightKg" | "qty">): number {
  return piece.weightKg * piece.qty;
}

export function heavyLiftBand(weightKg: number): BandId {
  if (weightKg < 5000) return "under_5";
  if (weightKg <= 10000) return "5_10";
  if (weightKg <= 20000) return "10_20";
  if (weightKg <= 30000) return "20_30";
  return "over_30";
}

export function bandLabel(band: BandId): string {
  switch (band) {
    case "under_5":
      return "Under 5 t";
    case "5_10":
      return "5–10 t";
    case "10_20":
      return ">10–20 t";
    case "20_30":
      return ">20–30 t";
    case "over_30":
      return ">30 t";
  }
}

export function bandNote(): string {
  return HEAVY_LIFT_NOTE;
}

function limitText(limit: EquipmentLimit): string {
  const metres = (mm: number) => (mm / 1000).toFixed(2);
  const door =
    limit.doorWidthMm != null && limit.doorHeightMm != null
      ? ` · door ${metres(limit.doorWidthMm)} × ${metres(limit.doorHeightMm)} m`
      : "";
  return `${metres(limit.lengthMm)} × ${metres(limit.widthMm)} × ${metres(limit.heightMm)} m${door} · payload ${limit.payloadKg.toLocaleString("en-US")} kg`;
}

function overParts(piece: Piece, limit: EquipmentLimit): OverPart[] {
  const length = metresToMm(piece.lengthM);
  const width = metresToMm(piece.widthM);
  const height = metresToMm(piece.heightM);
  const over: OverPart[] = [];
  if (length > limit.lengthMm) over.push("length");
  if (width > limit.widthMm) over.push("width");
  if (height > limit.heightMm) over.push("height");
  if (limit.doorWidthMm != null && width > limit.doorWidthMm) over.push("door width");
  if (limit.doorHeightMm != null && height > limit.doorHeightMm) over.push("door height");
  if (piece.weightKg > limit.payloadKg) over.push("payload");
  return over;
}

export function parseDeck(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function roadCheck(piece: Piece, deckHeightRaw: string): RoadResult {
  const widthOver = metresToMm(piece.widthM) > metresToMm(ROAD.widthM);
  const lengthMm = metresToMm(piece.lengthM);
  const lengthOver = lengthMm > metresToMm(ROAD.lengthCombinedM);
  let lengthNote = "";
  if (lengthOver) {
    lengthNote =
      "Over the 18 m reference for a vehicle plus trailer, including the load (RA 4136).";
  } else if (lengthMm > metresToMm(ROAD.lengthThreeAxleM)) {
    lengthNote =
      "Longer than the 14 m reference for a freight vehicle with three or more axles. Combined length still depends on the trailer. Not over the 18 m reference on piece length alone.";
  } else if (lengthMm > metresToMm(ROAD.lengthTwoAxleM)) {
    lengthNote =
      "Longer than the 10 m reference for a two-axle freight vehicle. Combined length still depends on the trailer. Not over the 18 m reference on piece length alone.";
  }

  const deck = parseDeck(deckHeightRaw);
  let heightState: HeightState;
  let totalHeightM: number | null = null;
  if (piece.heightM > ROAD.heightM) {
    heightState = "cargo_alone_over";
    totalHeightM = deck == null ? null : piece.heightM + deck;
  } else if (deck == null) {
    heightState = "deck_missing";
  } else {
    totalHeightM = piece.heightM + deck;
    heightState = totalHeightM > ROAD.heightM ? "over" : "not_over";
  }

  return {
    widthOver,
    lengthOver,
    lengthNote,
    heightState,
    totalHeightM,
    axleNote: piece.weightKg > ROAD.axleKg,
  };
}

export function floorCheck(piece: Piece): FloorResult {
  if (piece.lengthM <= 0) return { tPerM: null, exceeds: [] };
  const tPerM = piece.weightKg / 1000 / piece.lengthM;
  const exceeds = FLOOR_EXAMPLES.filter((row) => tPerM > row.tPerM).map((row) => row.label);
  return { tPerM, exceeds };
}

export function checkPiece(piece: Piece, deckHeightRaw: string): PieceCheck {
  const unitCbm = piece.lengthM * piece.widthM * piece.heightM;
  const cbm = lineCbm(piece);
  const kg = lineKg(piece);
  const tons = kg / 1000;
  return {
    piece,
    unitCbm,
    lineCbm: cbm,
    lineKg: kg,
    lineTons: tons,
    lineFreightTons: Math.max(cbm, tons),
    band: heavyLiftBand(piece.weightKg),
    equipment: EQUIPMENT.map((limit) => ({
      id: limit.id,
      label: limit.label,
      group: limit.group,
      source: limit.source,
      over: overParts(piece, limit),
      limitText: limitText(limit),
    })),
    road: roadCheck(piece, deckHeightRaw),
    floor: floorCheck(piece),
  };
}

export function shipmentTotals(pieces: Piece[]): ShipmentTotals {
  let cbm = 0;
  let kg = 0;
  let counted = 0;
  for (const piece of pieces) {
    if (piece.qty <= 0 || piece.lengthM <= 0 || piece.widthM <= 0 || piece.heightM <= 0) continue;
    cbm += lineCbm(piece);
    kg += lineKg(piece);
    counted += 1;
  }
  const metricTons = kg / 1000;
  let governs: Governs = "none";
  if (counted > 0) {
    if (Math.abs(cbm - metricTons) < 0.0005) governs = "level";
    else if (metricTons > cbm) governs = "weight";
    else governs = "volume";
  }
  return {
    cbm,
    kg,
    metricTons,
    freightTons: counted === 0 ? 0 : Math.max(cbm, metricTons),
    governs,
    densityKgPerCbm: cbm > 0 ? kg / cbm : null,
    counted,
  };
}

export function pieceHasExceedance(check: PieceCheck): boolean {
  if (check.equipment.some((row) => row.over.length > 0)) return true;
  if (check.road.widthOver || check.road.lengthOver) return true;
  if (check.road.heightState === "over" || check.road.heightState === "cargo_alone_over") return true;
  return false;
}

export function exceeds40HcEnvelope(piece: Piece): boolean {
  const limit = EQUIPMENT.find((row) => row.id === "40hc");
  if (!limit) return false;
  const over = overParts(piece, limit);
  return over.includes("length") || over.includes("width") || over.includes("height");
}

export function overShort(part: OverPart): string {
  switch (part) {
    case "length":
      return "L";
    case "width":
      return "W";
    case "height":
      return "H";
    case "door width":
      return "door W";
    case "door height":
      return "door H";
    case "payload":
      return "payload";
  }
}

export function governsSentence(totals: ShipmentTotals): string {
  if (totals.governs === "none") return "Add a complete piece to calculate freight tons.";
  if (totals.governs === "level") {
    return "CBM and metric tons are level at this precision, so either one sets the freight ton.";
  }
  if (totals.governs === "weight") {
    return "Weight is the greater of the two, so it sets the freight ton. 1 freight ton = 1 CBM or 1 metric ton.";
  }
  return "Volume is the greater of the two, so it sets the freight ton. 1 freight ton = 1 CBM or 1 metric ton.";
}
