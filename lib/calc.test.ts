import assert from "node:assert/strict";
import { checkPiece, heavyLiftBand, lineCbm, shipmentTotals } from "./calc";
import { metresToMm } from "./limits";
import type { Piece } from "./types";

function piece(partial: Partial<Piece> & Pick<Piece, "lengthM" | "widthM" | "heightM" | "weightKg">): Piece {
  return {
    id: "P-01",
    description: "Test piece",
    qty: 1,
    packing: "crated",
    stackable: "no",
    cogKnown: "yes",
    cogNote: "",
    liftingKnown: "yes",
    liftingNote: "",
    dataSource: "measured",
    revisionDate: "2026-11-01",
    ...partial,
  };
}

const boxed = piece({ lengthM: 2, widthM: 1, heightM: 0.5, weightKg: 2500, qty: 4 });
assert.equal(lineCbm(boxed), 4);
const totals = shipmentTotals([boxed]);
assert.equal(totals.kg, 10000);
assert.equal(totals.metricTons, 10);
assert.equal(totals.cbm, 4);
assert.equal(totals.freightTons, 10);
assert.equal(totals.governs, "weight");

const light = piece({ lengthM: 2, widthM: 1, heightM: 1, weightKg: 100, qty: 1 });
const lightTotals = shipmentTotals([light]);
assert.equal(lightTotals.freightTons, 2);
assert.equal(lightTotals.governs, "volume");

assert.equal(heavyLiftBand(4999), "under_5");
assert.equal(heavyLiftBand(5000), "5_10");
assert.equal(heavyLiftBand(10000), "5_10");
assert.equal(heavyLiftBand(10001), "10_20");
assert.equal(heavyLiftBand(20000), "10_20");
assert.equal(heavyLiftBand(20001), "20_30");
assert.equal(heavyLiftBand(30000), "20_30");
assert.equal(heavyLiftBand(30001), "over_30");

assert.equal(metresToMm(12.032), 12032);
assert.equal(metresToMm(2.352), 2352);

const tank = checkPiece(piece({ lengthM: 6.85, widthM: 3.15, heightM: 3.72, weightKg: 72400 }), "0.85");
const gp20 = tank.equipment.find((row) => row.id === "20gp");
assert.ok(gp20);
assert.deepEqual(gp20.over, ["length", "width", "height", "door width", "door height", "payload"]);
assert.equal(tank.road.widthOver, true);
assert.equal(tank.road.heightState, "over");
assert.ok(tank.road.totalHeightM != null && tank.road.totalHeightM > 4);
assert.equal(tank.band, "over_30");
assert.ok(tank.floor.exceeds.includes("20' steel floor"));

const mri = checkPiece(piece({ lengthM: 2.28, widthM: 2.28, heightM: 2.05, weightKg: 5600 }), "");
const mri20 = mri.equipment.find((row) => row.id === "20gp");
assert.ok(mri20);
assert.deepEqual(mri20.over, []);
assert.equal(mri.road.widthOver, false);
assert.equal(mri.road.heightState, "deck_missing");

const beam = checkPiece(piece({ lengthM: 12, widthM: 0.5, heightM: 1.1, weightKg: 7200 }), "0.9");
const gp40 = beam.equipment.find((row) => row.id === "40gp");
assert.ok(gp40);
assert.equal(gp40.over.includes("length"), false);
const justOver = checkPiece(piece({ lengthM: 12.033, widthM: 0.5, heightM: 1.1, weightKg: 7200 }), "0.9");
assert.equal(justOver.equipment.find((row) => row.id === "40gp")?.over.includes("length"), true);

const cnc = checkPiece(piece({ lengthM: 4.15, widthM: 2.2, heightM: 2.45, weightKg: 8450 }), "");
assert.ok(cnc.equipment.find((row) => row.id === "40gp")?.over.includes("height"));
assert.ok(cnc.equipment.find((row) => row.id === "40gp")?.over.includes("door height"));
assert.deepEqual(cnc.equipment.find((row) => row.id === "40hc")?.over, []);

const roadWide = checkPiece(piece({ lengthM: 2, widthM: 2.6, heightM: 1, weightKg: 1000 }), "");
assert.equal(roadWide.road.widthOver, true);

const withDeck = checkPiece(piece({ lengthM: 2, widthM: 1, heightM: 3.2, weightKg: 1000 }), "1.2");
assert.equal(withDeck.road.heightState, "over");
assert.ok(Math.abs((withDeck.road.totalHeightM ?? 0) - 4.4) < 0.001);

const noDeck = checkPiece(piece({ lengthM: 2, widthM: 1, heightM: 3.2, weightKg: 1000 }), "");
assert.equal(noDeck.road.heightState, "deck_missing");

const tall = checkPiece(piece({ lengthM: 2, widthM: 1, heightM: 4.2, weightKg: 1000 }), "");
assert.equal(tall.road.heightState, "cargo_alone_over");

const counterweight = checkPiece(piece({ lengthM: 2.1, widthM: 1.7, heightM: 1.15, weightKg: 15200 }), "");
assert.ok(counterweight.floor.exceeds.includes("40' steel floor"));
assert.equal(counterweight.floor.exceeds.includes("20' steel floor"), false);
assert.equal(counterweight.road.axleNote, true);

const level = shipmentTotals([piece({ lengthM: 1, widthM: 1, heightM: 1, weightKg: 1000, qty: 2 })]);
assert.equal(level.governs, "level");
assert.equal(level.freightTons, 2);

console.log("calc tests passed");
