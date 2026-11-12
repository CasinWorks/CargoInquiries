import assert from "node:assert/strict";
import { seedInquiries } from "../lib/seed";
import { deskStats } from "../lib/stats";
import { factsFromInquiry, neededGaps } from "../lib/missing";

const inquiries = seedInquiries();
assert.ok(inquiries.length >= 8 && inquiries.length <= 12, "expected 8 to 12 sample inquiries");
const refs = new Set(inquiries.map((inquiry) => inquiry.reference));
assert.equal(refs.size, inquiries.length);
for (const inquiry of inquiries) {
  assert.equal(inquiry.sample, true);
  assert.equal(inquiry.email.endsWith("@example.com"), true);
  assert.equal(/interfreight/i.test(inquiry.company), false);
  assert.ok(inquiry.pieces.length > 0);
  for (const piece of inquiry.pieces) {
    assert.ok(piece.lengthM > 0 && piece.widthM > 0 && piece.heightM > 0 && piece.weightKg > 0);
    assert.ok(piece.qty >= 1);
  }
  for (const quote of inquiry.quotes) {
    for (const line of quote.lines) {
      assert.equal(/sample/i.test(line.vendor), true, line.vendor);
    }
  }
}

const stats = deskStats(inquiries, "2026-11-12");
assert.equal(stats.byStatus.new, 1);
assert.equal(stats.byStatus.info_incomplete, 1);
assert.equal(stats.byStatus.feasibility, 1);
assert.equal(stats.byStatus.costing, 1);
assert.equal(stats.byStatus.internal_approval, 1);
assert.equal(stats.byStatus.quoted_budgetary, 1);
assert.equal(stats.byStatus.quoted_firm, 1);
assert.equal(stats.byStatus.revision_requested, 1);
assert.equal(stats.byStatus.won, 1);
assert.equal(stats.byStatus.lost, 1);
assert.equal(stats.byStatus.expired, 1);
assert.equal(stats.won, 1);
assert.equal(stats.lost, 1);
assert.equal(stats.meanDays, 7.5);
assert.deepEqual(
  stats.needing.map((inquiry) => inquiry.reference),
  ["PCD-26-1810"],
);

const hilaga = inquiries.find((inquiry) => inquiry.reference === "PCD-26-1810");
assert.ok(hilaga);
const hilagaNeeded = neededGaps(factsFromInquiry(hilaga)).map((gap) => gap.id);
assert.ok(hilagaNeeded.includes("cog-P-01"));
assert.ok(hilagaNeeded.includes("drawing"));
assert.ok(hilagaNeeded.includes("deck"));

console.log(`seed ok: ${inquiries.length} sample inquiries`);
for (const inquiry of inquiries) {
  console.log(`  ${inquiry.reference}  ${inquiry.status.padEnd(20)}  ${inquiry.projectName}`);
}
