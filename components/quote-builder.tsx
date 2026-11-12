"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeskInput, DeskSelect, DeskText } from "@/components/bits";
import { shipmentTotals } from "@/lib/calc";
import { formatFixed, formatMoney } from "@/lib/format";
import { INDICATIVE, LAYERS, LINE_STATUSES, SAMPLE_FIGURES, layerLabel, lineStatusLabel, modeLabel, statusLabel } from "@/lib/labels";
import { factsFromInquiry, neededGaps } from "@/lib/missing";
import { blankLine, blankQuote, diffQuotes, quoteReadyToSend, quoteTotals } from "@/lib/quote";
import { formatDay, nowIso, uid } from "@/lib/time";
import type { CostLine, Inquiry, Layer, QuoteVersion } from "@/lib/types";

export function QuoteBuilder({
  inquiry,
  onChange,
}: {
  inquiry: Inquiry;
  onChange: (next: Inquiry) => void;
}) {
  const [versionId, setVersionId] = useState(inquiry.quotes[0]?.id ?? "");
  const selected = inquiry.quotes.find((quote) => quote.id === versionId) ?? inquiry.quotes[inquiry.quotes.length - 1];
  const [signOpen, setSignOpen] = useState(false);
  const [signNote, setSignNote] = useState("Cleared to send, subject to the written conditions.");
  const [block, setBlock] = useState("");

  function patchQuote(quoteId: string, updater: (quote: QuoteVersion) => QuoteVersion, extra?: Partial<Inquiry>) {
    onChange({
      ...inquiry,
      ...extra,
      quotes: inquiry.quotes.map((quote) => (quote.id === quoteId ? updater(quote) : quote)),
    });
  }

  function start(kind: QuoteVersion["kind"]) {
    const previous = inquiry.quotes[inquiry.quotes.length - 1];
    const created = blankQuote(inquiry.quotes.length + 1, kind, previous);
    onChange({
      ...inquiry,
      quotes: [...inquiry.quotes, created],
      timeline: [
        ...inquiry.timeline,
        {
          id: uid(),
          at: nowIso(),
          kind: "quote",
          text: `Version ${created.version} started${previous ? ` from v${previous.version}` : ""}. ${kind}.`,
        },
      ],
    });
    setVersionId(created.id);
  }

  if (!selected) {
    return (
      <div className="grid gap-3">
        <p className="text-[13px] text-zinc-600">No quote version yet. Add cost lines by hand. There is no rate lookup.</p>
        <p className="text-[12px] text-zinc-500">{SAMPLE_FIGURES}</p>
        <div>
          <Button type="button" size="sm" onClick={() => start("budgetary")}>
            Start v1 budgetary
          </Button>
        </div>
      </div>
    );
  }

  const totals = quoteTotals(selected);
  const previous = inquiry.quotes.find((quote) => quote.version === selected.version - 1);
  const changes = previous ? diffQuotes(previous, selected) : [];
  const needed = neededGaps(factsFromInquiry(inquiry));
  const shipment = shipmentTotals(inquiry.pieces);

  function setLines(lines: CostLine[]) {
    patchQuote(selected.id, (quote) => ({ ...quote, lines }));
  }

  return (
    <div className="grid gap-4" id="quote-sheet">
      <p className="text-[12px] leading-snug text-zinc-600">{SAMPLE_FIGURES}</p>
      <div className="flex flex-wrap items-center gap-2">
        {inquiry.quotes.map((quote) => (
          <button
            key={quote.id}
            type="button"
            onClick={() => setVersionId(quote.id)}
            className={
              quote.id === selected.id
                ? "border border-zinc-950 bg-white px-2 py-1 text-[13px]"
                : "border border-zinc-200 bg-white px-2 py-1 text-[13px] text-zinc-600"
            }
          >
            v{quote.version} {quote.kind}
          </button>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => start(selected.kind === "budgetary" ? "firm" : "firm")}>
          New version
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Kind
          <DeskSelect
            value={selected.kind}
            aria-label="Quote kind"
            onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, kind: event.target.value as QuoteVersion["kind"] }))}
          >
            <option value="budgetary">Budgetary</option>
            <option value="firm">Firm</option>
          </DeskSelect>
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Currency
          <DeskSelect
            value={selected.currency}
            aria-label="Quote currency"
            onChange={(event) =>
              patchQuote(selected.id, (quote) => ({ ...quote, currency: event.target.value as QuoteVersion["currency"] }))
            }
          >
            <option value="USD">USD</option>
            <option value="PHP">PHP</option>
          </DeskSelect>
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Valid until
          <DeskInput
            type="date"
            aria-label="Validity date"
            value={selected.validityDate}
            onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, validityDate: event.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600 md:col-span-3">
          FX note
          <DeskInput
            aria-label="Foreign exchange note"
            value={selected.fxNote}
            onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, fxNote: event.target.value }))}
          />
        </label>
      </div>
      {selected.kind === "budgetary" ? (
        <p className="text-[12px] text-zinc-600">Budgetary estimate, subject to confirmation. Not a firm all-in price.</p>
      ) : null}
      {selected.kind === "firm" && needed.length > 0 ? (
        <p className="text-[12px] text-zinc-700">
          {needed.length} checklist items are still open. A firm offer with open items should say so in the subject-to clause.
        </p>
      ) : null}
      {LAYERS.map((layer) => (
        <LayerBlock
          key={layer.id}
          layer={layer.id}
          label={layer.label}
          currency={selected.currency}
          lines={selected.lines.filter((line) => line.layer === layer.id)}
          onChange={(line) => setLines(selected.lines.map((item) => (item.id === line.id ? line : item)))}
          onAdd={() => setLines([...selected.lines, blankLine(layer.id)])}
          onRemove={(id) => setLines(selected.lines.filter((line) => line.id !== id))}
        />
      ))}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid gap-3">
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Inclusions
            <DeskText value={selected.inclusions} onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, inclusions: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Exclusions
            <DeskText value={selected.exclusions} onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, exclusions: event.target.value }))} />
          </label>
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Subject to
            <DeskText value={selected.subjectTo} onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, subjectTo: event.target.value }))} />
          </label>
          <p className="text-[12px] text-zinc-500">Starting text only. Edit it to match house terms. These are not Interfreight’s current terms.</p>
        </div>
        <div className="border border-zinc-200 bg-white p-3">
          <p className="font-mono text-[10px] tracking-wide text-zinc-500">SAMPLE FIGURES</p>
          <label className="mt-2 grid grid-cols-[1fr_72px] items-center gap-2 text-[12px]">
            Contingency %
            <DeskInput
              inputMode="decimal"
              aria-label="Contingency percent"
              value={String(selected.contingencyPct)}
              onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, contingencyPct: numberOr(event.target.value, quote.contingencyPct) }))}
            />
          </label>
          <label className="mt-2 grid grid-cols-[1fr_72px] items-center gap-2 text-[12px]">
            Risk allowance
            <DeskInput
              inputMode="decimal"
              aria-label="Risk allowance"
              value={String(selected.riskAllowance)}
              onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, riskAllowance: numberOr(event.target.value, quote.riskAllowance) }))}
            />
          </label>
          <label className="mt-2 grid grid-cols-[1fr_72px] items-center gap-2 text-[12px]">
            Margin %
            <DeskInput
              inputMode="decimal"
              aria-label="Margin percent"
              value={String(selected.marginPct)}
              onChange={(event) => patchQuote(selected.id, (quote) => ({ ...quote, marginPct: numberOr(event.target.value, quote.marginPct) }))}
            />
          </label>
          {inquiry.pieces.some((piece) => piece.dataSource === "estimated") && selected.riskAllowance === 0 ? (
            <p className="mt-2 text-[12px] leading-snug text-zinc-600">
              Risk allowance is zero while a figure is still estimated. The amount stays blank until you type it.
            </p>
          ) : null}
          <dl className="mt-3 grid gap-1 text-[13px]">
            <MoneyRow label="Subtotal" value={formatMoney(totals.subtotal, selected.currency)} />
            <MoneyRow label={`Contingency ${selected.contingencyPct}%`} value={formatMoney(totals.contingency, selected.currency)} />
            <MoneyRow label="Risk allowance" value={formatMoney(selected.riskAllowance, selected.currency)} />
            <MoneyRow label="Cost before margin" value={formatMoney(totals.beforeMargin, selected.currency)} />
            <MoneyRow label={`Margin ${selected.marginPct}%`} value={formatMoney(totals.margin, selected.currency)} />
            <MoneyRow label="Sell price" value={formatMoney(totals.sell, selected.currency)} strong />
          </dl>
          <p className="mt-2 text-[12px] leading-snug text-zinc-500">
            Reimbursable lines are included in this total. A house rule may show them separately. This is arithmetic on typed lines, not a tariff.
          </p>
        </div>
      </div>
      {changes.length > 0 ? (
        <div>
          <h3 className="text-[13px] font-medium text-zinc-950">Changes from v{previous?.version}</h3>
          <ul className="mt-1 list-disc pl-4 text-[13px] text-zinc-700">
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="border border-zinc-200 bg-white p-3">
        <p className="text-[13px] font-medium text-zinc-950">Sign-off and outcome</p>
        <p className="mt-1 text-[12px] leading-snug text-zinc-600">
          Sign-off is a recorded step in this demo, not a separate login. Current: {approvalLabel(selected.approval)}
          {selected.approvalNote ? ` — ${selected.approvalNote}` : ""}.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patchQuote(
                selected.id,
                (quote) => ({ ...quote, approval: "pending" }),
                {
                  status: "internal_approval",
                  timeline: [
                    ...inquiry.timeline,
                    { id: uid(), at: nowIso(), kind: "signoff", text: `v${selected.version} sent for manager sign-off.` },
                  ],
                },
              )
            }
          >
            Ask for sign-off
          </Button>
          <Button type="button" id="record-signoff" size="sm" onClick={() => setSignOpen(true)}>
            Record sign-off
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              patchQuote(selected.id, (quote) => ({ ...quote, approval: "changes" }), {
                timeline: [
                  ...inquiry.timeline,
                  { id: uid(), at: nowIso(), kind: "signoff", text: `Changes asked on v${selected.version}.` },
                ],
              })
            }
          >
            Ask for changes
          </Button>
          <Button
            type="button"
            size="sm"
            id="mark-sent"
            onClick={() => {
              const reason = quoteReadyToSend(selected);
              if (reason) {
                setBlock(reason);
                return;
              }
              setBlock("");
              const status = selected.kind === "firm" ? "quoted_firm" : "quoted_budgetary";
              patchQuote(
                selected.id,
                (quote) => ({ ...quote, outcome: quote.outcome === "follow_up" ? "follow_up" : "sent", sentAt: quote.sentAt || nowIso() }),
                {
                  status,
                  timeline: [
                    ...inquiry.timeline,
                    { id: uid(), at: nowIso(), kind: "outcome", text: `v${selected.version} marked sent. Stage: ${statusLabel(status)}.` },
                  ],
                },
              );
            }}
          >
            Mark sent
          </Button>
        </div>
        {block ? <p className="mt-2 text-[12px] text-rose-800">{block}</p> : null}
        {selected.sentAt ? (
          <p className="mt-2 text-[12px] text-zinc-600">Marked sent {formatDay(selected.sentAt)}. Outcome: {selected.outcome || "sent"}.</p>
        ) : null}
      </div>
      <article className="border border-zinc-200 bg-white p-4" aria-label="Quotation preview">
        <p className="font-mono text-[11px] tracking-wide text-zinc-500">QUOTATION PREVIEW · SAMPLE FIGURES</p>
        <h3 className="mt-2 text-[16px] font-medium">
          v{selected.version} · {selected.kind}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-zinc-700">
          {inquiry.reference} · {inquiry.company}
          <br />
          {inquiry.projectName}
          <br />
          {inquiry.pieces.length} pieces · {formatFixed(shipment.cbm, 2)} CBM · {formatFixed(shipment.metricTons, 2)} t ·{" "}
          {formatFixed(shipment.freightTons, 2)} freight tons
          <br />
          {inquiry.incoterm || "Incoterm not set"} · {modeLabel(inquiry.mode)} · Ready {formatDay(inquiry.cargoReady)}
          <br />
          {inquiry.origin.city} → {inquiry.destination.city}
        </p>
        <p className="mt-2 text-[12px] text-zinc-500">{INDICATIVE}</p>
        <p className="mt-3 text-[13px]">Sell price {formatMoney(totals.sell, selected.currency)}</p>
        <p className="mt-1 text-[12px] text-zinc-500">Valid until {formatDay(selected.validityDate)}. {selected.fxNote}</p>
        <p className="mt-3 text-[12px] whitespace-pre-wrap text-zinc-600">{selected.subjectTo}</p>
        <p className="mt-3 text-[12px] text-zinc-500">
          Print view only. This demo does not create a PDF file and does not email it.
        </p>
        <button type="button" className="no-print mt-2 text-[12px] text-[#1e3a5f] underline" onClick={() => window.print()}>
          Print this page
        </button>
      </article>
      <details className="text-[12px] leading-relaxed text-zinc-600">
        <summary className="cursor-pointer text-[13px] text-zinc-800">Published tariff reference, not used in the total</summary>
        <p className="mt-2 max-w-3xl">
          ICTSI Manila Multipurpose Terminal, Schedule of Cargo Handling Tariff, effective 1 Jan 2026, exclusive of VAT.
          Heavy-lift stevedoring per metric ton: 5–10 t USD 12.73; over 10–20 t USD 16.43; over 20–30 t USD 20.06; over 30 t USD 24.46.
          Arrastre heavy-lift runs from PHP 620.15 to PHP 2,156.38 per metric ton. Not an Interfreight rate. Nothing is added unless you type a line.
        </p>
      </details>
      <p className="text-[12px] text-zinc-500">Coming later: automatic pricing, duty calculation, and live carrier rates. Not in this demo.</p>
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record sign-off</DialogTitle>
          </DialogHeader>
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Note for the file
            <DeskText value={signNote} onChange={(event) => setSignNote(event.target.value)} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setSignOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (signNote.trim().length < 3) return;
                patchQuote(selected.id, (quote) => ({
                  ...quote,
                  approval: "signed_off",
                  approvalNote: signNote.trim(),
                  approvedAt: nowIso(),
                }), {
                  timeline: [
                    ...inquiry.timeline,
                    { id: uid(), at: nowIso(), kind: "signoff", text: `Sign-off recorded on v${selected.version}. ${signNote.trim()}` },
                  ],
                });
                setSignOpen(false);
              }}
            >
              Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LayerBlock({
  layer,
  label,
  currency,
  lines,
  onChange,
  onAdd,
  onRemove,
}: {
  layer: Layer;
  label: string;
  currency: QuoteVersion["currency"];
  lines: CostLine[];
  onChange: (line: CostLine) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-zinc-950">{label}</h3>
        <button type="button" className="text-[12px] text-[#1e3a5f] underline" onClick={onAdd}>
          Add line
        </button>
      </div>
      {lines.length === 0 ? (
        <p className="text-[12px] text-zinc-500">No line in this layer.</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] tracking-[0.04em] text-zinc-500 uppercase">
                <th className="px-2 py-2 font-medium">Description</th>
                <th className="px-2 py-2 font-medium">Vendor</th>
                <th className="px-2 py-2 font-medium">Basis</th>
                <th className="px-2 py-2 font-medium">Status</th>
                <th className="px-2 py-2 text-right font-medium">Amount ({currency})</th>
                <th className="px-2 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="border-b border-zinc-100">
                  <td className="px-2 py-1.5">
                    <DeskInput className="min-w-56" aria-label={`${layerLabel(layer)} description`} value={line.description} onChange={(event) => onChange({ ...line, description: event.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <DeskInput className="min-w-40" aria-label="Vendor" placeholder="Vendor (sample)" value={line.vendor} onChange={(event) => onChange({ ...line, vendor: event.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <DeskInput aria-label="Basis" value={line.basis} onChange={(event) => onChange({ ...line, basis: event.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <DeskSelect aria-label="Line status" value={line.lineStatus} onChange={(event) => onChange({ ...line, lineStatus: event.target.value as CostLine["lineStatus"] })}>
                      {LINE_STATUSES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </DeskSelect>
                  </td>
                  <td className="px-2 py-1.5">
                    <DeskInput
                      className="text-right"
                      inputMode="decimal"
                      aria-label={`Amount ${currency}`}
                      value={String(line.amount)}
                      onChange={(event) => onChange({ ...line, amount: numberOr(event.target.value, line.amount) })}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <button type="button" className="text-[12px] text-zinc-500 underline" onClick={() => onRemove(line.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="sr-only">{lineStatusLabel("provisional")}</p>
    </section>
  );
}

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex justify-between border-t border-zinc-200 pt-1 font-medium" : "flex justify-between text-zinc-700"}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function approvalLabel(approval: QuoteVersion["approval"]): string {
  if (approval === "signed_off") return "Sign-off recorded";
  if (approval === "pending") return "Waiting on sign-off";
  if (approval === "changes") return "Changes asked";
  return "Draft";
}

function numberOr(raw: string, fallback: number): number {
  if (raw.trim() === "") return 0;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}
