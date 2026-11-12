import { IndicativeLine, Td, Th } from "@/components/bits";
import {
  bandLabel,
  bandNote,
  checkPiece,
  governsSentence,
  overShort,
  pieceHasExceedance,
  shipmentTotals,
  type PieceCheck,
} from "@/lib/calc";
import { formatCbm, formatFixed, formatKg, formatM, formatTons } from "@/lib/format";
import { packingLabel, sourceLabel, triLabel } from "@/lib/labels";
import type { Piece } from "@/lib/types";

export function CalcSummary({
  pieces,
  deckHeightM,
  tourId,
}: {
  pieces: Piece[];
  deckHeightM: string;
  tourId?: string;
}) {
  const totals = shipmentTotals(pieces);
  const checks = pieces.map((piece) => checkPiece(piece, deckHeightM));
  const overCount = checks.filter(pieceHasExceedance).length;
  return (
    <aside className="border border-zinc-200 bg-white p-3" data-tour={tourId}>
      <p className="text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase">Shipment totals</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
        <Stat label="Total CBM" value={totals.counted ? formatFixed(totals.cbm, 2) : "—"} />
        <Stat label="Total weight" value={totals.counted ? formatKg(totals.kg) : "—"} />
        <Stat label="Metric tons" value={totals.counted ? formatFixed(totals.metricTons, 2) : "—"} />
        <Stat label="Freight tons" value={totals.counted ? formatFixed(totals.freightTons, 2) : "—"} />
      </dl>
      <p className="mt-3 text-[12px] leading-snug text-zinc-600">{governsSentence(totals)}</p>
      {totals.densityKgPerCbm != null ? (
        <p className="mt-1 text-[12px] leading-snug text-zinc-600">
          {formatFixed(totals.densityKgPerCbm, 0)} kg per CBM. The breakeven used here is 1,000 kg per CBM.
        </p>
      ) : null}
      <p className="mt-3 text-[12px] leading-snug text-zinc-700">
        {overCount === 0
          ? "No exceedance against the example limits on the pieces that have dimensions."
          : `${overCount} of ${checks.length} pieces exceed at least one example limit.`}
      </p>
      <IndicativeLine className="mt-2" />
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-zinc-500">{label}</dt>
      <dd className="text-[16px] font-medium text-zinc-950">{value}</dd>
    </div>
  );
}

export function PieceReadout({ pieces, deckHeightM }: { pieces: Piece[]; deckHeightM: string }) {
  if (pieces.length === 0) {
    return <p className="text-[13px] text-zinc-600">No pieces yet.</p>;
  }
  return (
    <div className="overflow-x-auto border border-zinc-200 bg-white">
      <table className="w-full min-w-[860px] border-collapse text-[13px]">
        <thead>
          <tr>
            <Th>Piece</Th>
            <Th align="right">Qty</Th>
            <Th align="right">L m</Th>
            <Th align="right">W m</Th>
            <Th align="right">H m</Th>
            <Th align="right">kg each</Th>
            <Th align="right">Line CBM</Th>
            <Th align="right">Line FT</Th>
            <Th>Band</Th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((piece) => {
            const check = checkPiece(piece, deckHeightM);
            return (
              <tr key={piece.id} className="border-b border-zinc-100">
                <Td>
                  <div className="font-mono text-[12px] text-zinc-500">{piece.id}</div>
                  <div>{piece.description}</div>
                  <p className="mt-1 text-[12px] leading-snug text-zinc-500">
                    {packingLabel(piece.packing)} · {sourceLabel(piece.dataSource)}
                    {piece.revisionDate ? ` · rev ${piece.revisionDate}` : ""} · Stack {triLabel(piece.stackable, "yes", "no")}
                    {" · "}CoG {triLabel(piece.cogKnown, "known", "not known")}
                    {piece.cogNote ? ` (${piece.cogNote})` : ""}
                    {" · "}Lifting {triLabel(piece.liftingKnown, "known", "not known")}
                    {piece.liftingNote ? ` (${piece.liftingNote})` : ""}
                  </p>
                </Td>
                <Td align="right">{piece.qty}</Td>
                <Td align="right">{formatM(piece.lengthM)}</Td>
                <Td align="right">{formatM(piece.widthM)}</Td>
                <Td align="right">{formatM(piece.heightM)}</Td>
                <Td align="right">{formatKg(piece.weightKg)}</Td>
                <Td align="right" className="whitespace-nowrap">{formatCbm(check.lineCbm)}</Td>
                <Td align="right" className="whitespace-nowrap">{formatFixed(check.lineFreightTons, 2)}</Td>
                <Td className="whitespace-nowrap">
                  <span title={bandNote()}>{bandLabel(check.band)}</span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function OogTables({ pieces, deckHeightM }: { pieces: Piece[]; deckHeightM: string }) {
  const checks = pieces.map((piece) => checkPiece(piece, deckHeightM));
  if (checks.length === 0) return null;
  const primary = checks[0].equipment.filter((row) => row.group === "primary");
  const more = checks[0].equipment.filter((row) => row.group === "more");
  const flatOver = checks.some((check) => check.piece.widthM > 2.44);
  return (
    <div className="grid gap-3">
      <div>
        <p className="text-[13px] text-zinc-800">Example equipment limits</p>
        <p className="mt-1 text-[12px] leading-snug text-zinc-500">
          A dash means no exceedance on that published example. It is not a fit and not an approval. Payload is checked per piece, not as a combined load. Door columns apply to dry boxes.
        </p>
      </div>
      <LimitTable checks={checks} columns={primary} />
      <details>
        <summary className="cursor-pointer text-[13px] text-zinc-700">Other example limits</summary>
        <div className="mt-2">
          <LimitTable checks={checks} columns={more} />
        </div>
      </details>
      <p className="text-[12px] leading-snug text-zinc-500">
        Sources: {uniqueSources(checks)}. The unit that is actually booked can differ. Full flat-rack payload applies only if the weight is spread over the full length. This desk does not judge that.
      </p>
      {flatOver ? (
        <p className="text-[12px] leading-snug text-zinc-600">
          Hapag-Lloyd’s special-cargo note: over-width on a flat rack starts above 244 cm. 245 cm is already 1 cm over, about 0.5 cm each side.
        </p>
      ) : null}
      <RoadTable checks={checks} deckHeightM={deckHeightM} />
      <FloorNotes checks={checks} />
      <IndicativeLine />
    </div>
  );
}

function uniqueSources(checks: PieceCheck[]): string {
  const sources = new Set<string>();
  for (const check of checks) {
    for (const row of check.equipment) sources.add(row.source);
  }
  return Array.from(sources).join("; ");
}

function LimitTable({
  checks,
  columns,
}: {
  checks: PieceCheck[];
  columns: PieceCheck["equipment"];
}) {
  return (
    <div className="overflow-x-auto border border-zinc-200 bg-white">
      <table className="w-full min-w-[720px] border-collapse text-[12px]">
        <thead>
          <tr>
            <Th>Piece</Th>
            {columns.map((column) => (
              <Th key={column.id}>
                <span title={`${column.source}. ${column.limitText}`}>{column.label}</span>
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {checks.map((check) => (
            <tr key={check.piece.id} className="border-b border-zinc-100">
              <Td>
                <span className="font-mono text-[11px] text-zinc-500">{check.piece.id}</span> {check.piece.description}
              </Td>
              {columns.map((column) => {
                const cell = check.equipment.find((row) => row.id === column.id);
                const over = cell?.over ?? [];
                return (
                  <Td key={column.id}>
                    {over.length === 0 ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      <span className="bg-amber-50 px-1 text-amber-950">{over.map(overShort).join(" ")}</span>
                    )}
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoadTable({ checks, deckHeightM }: { checks: PieceCheck[]; deckHeightM: string }) {
  return (
    <div>
      <p className="text-[13px] text-zinc-800">Philippine road references (RA 4136)</p>
      <p className="mt-1 text-[12px] leading-snug text-zinc-500">
        Width 2.5 m. Height 4.0 m including the trailer deck
        {deckHeightM.trim() ? ` (deck entered: ${deckHeightM} m)` : " (no deck height entered)"}. Length 18 m is the vehicle plus trailer, including the load. Axle load cap in the MVUC IRR is 13,500 kg. This desk does not split axles.
      </p>
      <div className="mt-2 overflow-x-auto border border-zinc-200 bg-white">
        <table className="w-full min-w-[680px] border-collapse text-[12px]">
          <thead>
            <tr>
              <Th>Piece</Th>
              <Th>Width</Th>
              <Th>Height</Th>
              <Th>Length</Th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => (
              <tr key={check.piece.id} className="border-b border-zinc-100">
                <Td>
                  <span className="font-mono text-[11px] text-zinc-500">{check.piece.id}</span>
                </Td>
                <Td>
                  {check.road.widthOver ? (
                    <span className="bg-amber-50 px-1 text-amber-950">Over 2.5 m</span>
                  ) : (
                    <span className="text-zinc-500">Not over 2.5 m</span>
                  )}
                </Td>
                <Td>{heightText(check)}</Td>
                <Td>
                  {check.road.lengthOver ? (
                    <span className="bg-amber-50 px-1 text-amber-950">Over 18 m</span>
                  ) : (
                    <span className="text-zinc-500">Not over 18 m on piece length</span>
                  )}
                  {check.road.lengthNote ? <span className="mt-1 block text-zinc-500">{check.road.lengthNote}</span> : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function heightText(check: PieceCheck): string {
  const cargo = `${formatM(check.piece.heightM)} m cargo`;
  if (check.road.heightState === "cargo_alone_over") {
    return `${cargo}. Over 4.0 m before any trailer deck.`;
  }
  if (check.road.heightState === "deck_missing") {
    return `${cargo}. Total height not checked — trailer deck height was not entered.`;
  }
  const total = check.road.totalHeightM == null ? "" : ` Total ${formatFixed(check.road.totalHeightM, 2)} m.`;
  if (check.road.heightState === "over") return `${cargo}.${total} Over 4.0 m on this sum.`;
  return `${cargo}.${total} Not over 4.0 m on this sum.`;
}

function FloorNotes({ checks }: { checks: PieceCheck[] }) {
  const rows = checks.filter((check) => check.floor.exceeds.length > 0 && check.floor.tPerM != null);
  if (rows.length === 0) return null;
  return (
    <div className="text-[12px] leading-snug text-zinc-600">
      <p>Spread-load comparison with Hapag-Lloyd’s published example figures. Not a floor-load calculation.</p>
      <ul className="mt-1 grid gap-1">
        {rows.map((check) => (
          <li key={check.piece.id}>
            {check.piece.id}: {formatFixed(check.floor.tPerM ?? 0, 2)} t per metre of length, over the example for{" "}
            {check.floor.exceeds.join(", ")}. A short, heavy piece can fail on floor load even when it is under the payload figure.
            {check.road.axleNote ? " Piece weight is also over 13,500 kg." : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function weightLine(pieces: Piece[]): string {
  const totals = shipmentTotals(pieces);
  if (!totals.counted) return "No complete pieces";
  return `${formatCbm(totals.cbm)} · ${formatTons(totals.metricTons)} · ${formatFixed(totals.freightTons, 2)} freight tons`;
}
