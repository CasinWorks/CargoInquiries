"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeskInput, DeskSelect, DeskText, SampleMark, SectionTitle } from "@/components/bits";
import { OogTables, PieceReadout, weightLine } from "@/components/cargo-views";
import { QuoteBuilder } from "@/components/quote-builder";
import { Tip } from "@/components/shell";
import { checkPiece } from "@/lib/calc";
import { clarificationDraft } from "@/lib/clarify";
import { formatFileSize } from "@/lib/format";
import {
  LOST_REASONS,
  STAFF,
  fileCategoryLabel,
  handlingLabel,
  isClosed,
  modeLabel,
  scopeLabel,
  staffName,
  statusHint,
  statusLabel,
  STATUSES,
  yesNoLabel,
} from "@/lib/labels";
import { factsFromInquiry, missingItems } from "@/lib/missing";
import { useDesk } from "@/lib/store";
import { formatDay, formatWhen, nowIso, uid } from "@/lib/time";
import type { CargoFile, Inquiry, Status } from "@/lib/types";

export function InquiryDetail({ id }: { id: string }) {
  const desk = useDesk();
  const inquiry = desk.inquiries.find((item) => item.id === id);
  const [note, setNote] = useState("");
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState<string>(LOST_REASONS[0]);
  const [wonOpen, setWonOpen] = useState(false);
  const [handover, setHandover] = useState("Handed to operations as a demo step. No job file is created.");
  const [mailOpen, setMailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!inquiry) {
    return <p className="text-[13px] text-zinc-600">That inquiry is not in this browser.</p>;
  }
  const record = inquiry;

  function save(next: Inquiry, timelineText?: string, kind: Inquiry["timeline"][number]["kind"] = "status") {
    desk.updateInquiry(record.id, (current) => ({
      ...next,
      timeline: timelineText
        ? [...current.timeline, { id: uid(), at: nowIso(), kind, text: timelineText }]
        : next.timeline,
    }));
  }

  function setStatus(status: Status) {
    if (status === "lost") {
      setLostOpen(true);
      return;
    }
    if (status === "won") {
      setWonOpen(true);
      return;
    }
    save({ ...record, status }, `Stage set to ${statusLabel(status)}.`);
  }

  const gaps = missingItems(factsFromInquiry(inquiry));
  const needed = gaps.filter((gap) => gap.severity === "needed");
  const provisional = gaps.filter((gap) => gap.severity === "provisional");
  const later = gaps.filter((gap) => gap.severity === "later");
  const permits = permitItems(inquiry);
  const pastValidity = inquiry.quotes.some((quote) => quote.sentAt && quote.validityDate && desk.today && quote.validityDate < desk.today);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <p className="font-mono text-[12px] text-zinc-500">
          {inquiry.reference}
          {inquiry.sample ? <SampleMark /> : null}
        </p>
        <h1 className="mt-1 text-[20px] font-medium tracking-tight text-zinc-950">{inquiry.projectName}</h1>
        <p className="mt-1 text-[13px] text-zinc-600">
          {inquiry.company}
          {inquiry.companyCity ? `, ${inquiry.companyCity}` : ""} · {inquiry.contactName}
          {inquiry.contactRole ? `, ${inquiry.contactRole}` : ""} · {inquiry.email} · {inquiry.phone}
        </p>
        <Tip id="detail">
          Cost lines are typed. Sign-off is a button in this demo, not a login. The limit checks never say a piece is approved.
        </Tip>
        <nav className="no-print mb-4 flex flex-wrap gap-x-4 gap-y-1 border-b border-zinc-200 pb-2 text-[13px]" aria-label="On this inquiry">
          {[
            ["summary", "Summary"],
            ["pieces", "Piece list"],
            ["documents", "Documents"],
            ["checklist", "Checklist"],
            ["quote", "Quote"],
            ["activity", "Activity"],
          ].map(([href, label]) => (
            <a key={href} href={`#${href}`} className="text-[#1e3a5f] hover:underline">
              {label}
            </a>
          ))}
        </nav>

        <section className="grid gap-3" id="summary">
          <SectionTitle>Summary</SectionTitle>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <Fact label="Commodity" value={inquiry.commodity || "—"} />
            <Fact label="Stage" value={statusLabel(inquiry.status)} />
            <Fact label="Incoterm" value={inquiry.incoterm || "—"} />
            <Fact label="Mode" value={modeLabel(inquiry.mode)} />
            <Fact label="Cargo-ready" value={formatDay(inquiry.cargoReady)} />
            <Fact label="Required on site" value={formatDay(inquiry.requiredOnSite)} />
            <Fact label="Origin" value={place(inquiry.origin.name, inquiry.origin.city, inquiry.origin.country)} />
            <Fact label="Destination" value={place(inquiry.destination.name, inquiry.destination.city, inquiry.destination.country)} />
            <Fact label="POL / POD" value={`${inquiry.pol || "—"} / ${inquiry.pod || "—"}`} />
            <Fact label="Dangerous goods" value={`${yesNoLabel(inquiry.dg)}${inquiry.dgDetails ? ` — ${inquiry.dgDetails}` : ""}`} />
            <Fact label="Insurance" value={`${yesNoLabel(inquiry.insurance)}${inquiry.cargoValue ? ` · ${inquiry.cargoValue} ${inquiry.cargoValueCurrency}` : ""}`} />
            <Fact label="Scope" value={inquiry.scope.map(scopeLabel).join(", ") || "—"} />
            <Fact label="Handling" value={inquiry.specialHandling.map(handlingLabel).join(", ") || "—"} />
            <Fact label="Totals" value={weightLine(inquiry.pieces)} />
          </dl>
          <p className="text-[12px] leading-snug text-zinc-500">
            Sailing dates are not shown. There is no schedule feed. For imports into the Philippines, the goods declaration is generally lodged within 15 days of discharge of the last package (CMTA Sec. 407). This desk does not file declarations.
          </p>
          {inquiry.specialNotes ? <p className="text-[13px] text-zinc-700">{inquiry.specialNotes}</p> : null}
          <div className="grid gap-2 text-[13px] text-zinc-700 md:grid-cols-2">
            <p>
              <span className="block text-[12px] text-zinc-500">Origin access</span>
              {inquiry.origin.accessNotes || "Not provided."}
            </p>
            <p>
              <span className="block text-[12px] text-zinc-500">Destination access</span>
              {inquiry.destination.accessNotes || "Not provided."}
            </p>
          </div>
          <label className="grid max-w-xs gap-1 text-[12px] text-zinc-600">
            Trailer deck height (m)
            <DeskInput
              inputMode="decimal"
              aria-label="Trailer deck height"
              value={inquiry.deckHeightM}
              onChange={(event) =>
                save(
                  { ...inquiry, deckHeightM: event.target.value },
                  event.target.value.trim()
                    ? `Trailer deck height set to ${event.target.value} m.`
                    : "Trailer deck height cleared.",
                )
              }
            />
            <span>The 4.0 m road height includes the deck. This field does not assume one.</span>
          </label>
        </section>

        <section className="mt-8 grid gap-3" id="pieces">
          <SectionTitle>Piece list</SectionTitle>
          <p className="text-[12px] text-zinc-500">Packed dimensions as recorded. Weight is per piece. Line freight tons are the greater of that line’s CBM and metric tons.</p>
          <PieceReadout pieces={inquiry.pieces} deckHeightM={inquiry.deckHeightM} />
          <OogTables pieces={inquiry.pieces} deckHeightM={inquiry.deckHeightM} />
        </section>

        <section className="mt-8 grid gap-3" id="documents">
          <SectionTitle>Documents</SectionTitle>
          <FileList
            inquiry={inquiry}
            onChange={(files, text) => save({ ...inquiry, files }, text, "file")}
          />
        </section>

        <section className="mt-8 grid gap-3" id="checklist">
          <SectionTitle>Missing information</SectionTitle>
          <GapList title="Still needed" empty="Nothing on the needed list." items={needed} />
          <GapList title="Provisional figures" empty="No figure is marked estimated." items={provisional} />
          <GapList title="Useful, not blocking" empty="Nothing else is flagged." items={later} />
          <div>
            <h3 className="text-[13px] font-medium text-zinc-950">Permit checklist</h3>
            <p className="mt-1 text-[12px] leading-snug text-zinc-500">
              Manual reminders. Coming later: no connection to DPWH, LTO, MMDA, or an expressway operator.
            </p>
            {permits.length === 0 ? (
              <p className="mt-2 text-[13px] text-zinc-600">No size flag on the road references, and the places named do not mention Metro Manila or an expressway.</p>
            ) : (
              <ul className="mt-2 grid gap-2">
                {permits.map((item) => (
                  <li key={item.id} className="flex gap-2">
                    <Checkbox
                      checked={inquiry.permitDone.includes(item.id)}
                      onCheckedChange={(checked) => {
                        const permitDone = checked
                          ? [...inquiry.permitDone, item.id]
                          : inquiry.permitDone.filter((id) => id !== item.id);
                        save({ ...inquiry, permitDone }, `${item.label} ${checked ? "ticked" : "cleared"} on the manual checklist.`, "note");
                      }}
                      aria-label={item.label}
                    />
                    <span>
                      <span className="block text-[13px] text-zinc-900">{item.label}</span>
                      <span className="block text-[12px] leading-snug text-zinc-600">{item.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => setMailOpen(true)}>
              Draft a clarification
            </Button>
            <p className="mt-1 text-[12px] text-zinc-500">Draft only. Nothing is sent.</p>
          </div>
        </section>

        <section className="mt-8 grid gap-3" id="quote">
          <SectionTitle>Quote</SectionTitle>
          <QuoteBuilder
            key={inquiry.id}
            inquiry={inquiry}
            onChange={(next) => desk.updateInquiry(inquiry.id, () => next)}
          />
        </section>

        <section className="mt-8 grid gap-3" id="activity">
          <SectionTitle>Activity</SectionTitle>
          <form
            className="grid max-w-xl gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!note.trim()) return;
              const text = note.trim();
              save(
                {
                  ...inquiry,
                  notes: [...inquiry.notes, { id: uid(), at: nowIso(), author: "You (demo)", text }],
                },
                `Note: ${text}`,
                "note",
              );
              setNote("");
            }}
          >
            <label className="grid gap-1 text-[12px] text-zinc-600" htmlFor="note">
              Internal note
              <DeskText id="note" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div>
              <Button type="submit" size="sm">
                Add note
              </Button>
            </div>
          </form>
          {inquiry.notes.length === 0 ? <p className="text-[13px] text-zinc-500">No notes on this inquiry.</p> : null}
          <ul className="grid gap-2">
            {[...inquiry.notes].reverse().map((item) => (
              <li key={item.id} className="border-b border-zinc-200 pb-2">
                <p className="text-[12px] text-zinc-500">
                  {item.author} · {formatWhen(item.at)}
                </p>
                <p className="text-[13px] text-zinc-800">{item.text}</p>
              </li>
            ))}
          </ul>
          <h3 className="text-[13px] font-medium text-zinc-950">Timeline</h3>
          <ol className="grid gap-2">
            {[...inquiry.timeline].reverse().map((event) => (
              <li key={event.id} className="grid grid-cols-[140px_minmax(0,1fr)] gap-3 text-[13px]">
                <time className="text-[12px] text-zinc-500">{formatWhen(event.at)}</time>
                <span>{event.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <aside className="no-print h-fit border border-zinc-200 bg-white p-3 lg:sticky lg:top-16">
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Stage
          <DeskSelect aria-label="Stage" value={inquiry.status} onChange={(event) => setStatus(event.target.value as Status)}>
            {STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {status.label}
              </option>
            ))}
          </DeskSelect>
          <span>{statusHint(inquiry.status)}</span>
        </label>
        {pastValidity && !isClosed(inquiry.status) ? (
          <button
            type="button"
            className="mt-2 text-[12px] text-[#1e3a5f] underline"
            onClick={() => save({ ...inquiry, status: "expired" }, "Marked expired after the validity date.")}
          >
            Validity date has passed. Mark expired.
          </button>
        ) : null}
        <label className="mt-3 grid gap-1 text-[12px] text-zinc-600">
          Sales
          <StaffSelect
            value={inquiry.assignment.sales}
            onChange={(sales) =>
              save(
                { ...inquiry, assignment: { ...inquiry.assignment, sales } },
                `Sales set to ${staffName(sales)}.`,
                "assignment",
              )
            }
          />
        </label>
        <label className="mt-3 grid gap-1 text-[12px] text-zinc-600">
          Pricing
          <StaffSelect
            value={inquiry.assignment.pricing}
            onChange={(pricing) =>
              save(
                { ...inquiry, assignment: { ...inquiry.assignment, pricing } },
                `Pricing set to ${staffName(pricing)}.`,
                "assignment",
              )
            }
          />
        </label>
        <label className="mt-3 grid gap-1 text-[12px] text-zinc-600">
          Approver
          <StaffSelect
            value={inquiry.assignment.approver}
            onChange={(approver) =>
              save(
                { ...inquiry, assignment: { ...inquiry.assignment, approver } },
                `Approver set to ${staffName(approver)}.`,
                "assignment",
              )
            }
          />
        </label>
        <p className="mt-1 text-[12px] text-zinc-500">Demo names. Not Interfreight staff.</p>
        <label className="mt-3 grid gap-1 text-[12px] text-zinc-600">
          Follow-up
          <DeskInput
            type="date"
            aria-label="Follow-up date"
            value={inquiry.followUpDate}
            onChange={(event) =>
              save(
                { ...inquiry, followUpDate: event.target.value },
                event.target.value ? `Follow-up set for ${formatDay(event.target.value)}.` : "Follow-up cleared.",
              )
            }
          />
        </label>
        {inquiry.lostReason ? <p className="mt-3 text-[12px] text-zinc-600">Lost: {inquiry.lostReason}</p> : null}
        {inquiry.handoverNote ? <p className="mt-3 text-[12px] text-zinc-600">{inquiry.handoverNote}</p> : null}
        {inquiry.status === "quoted_budgetary" || inquiry.status === "quoted_firm" || inquiry.status === "revision_requested" ? (
          <div className="mt-3 grid gap-2">
            <Button type="button" size="sm" onClick={() => setWonOpen(true)}>
              Record accepted
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setLostOpen(true)}>
              Record lost
            </Button>
          </div>
        ) : null}
      </aside>

      <Dialog open={lostOpen} onOpenChange={setLostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record lost</DialogTitle>
          </DialogHeader>
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Reason
            <DeskSelect value={lostReason} onChange={(event) => setLostReason(event.target.value)} aria-label="Lost reason">
              {LOST_REASONS.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </DeskSelect>
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setLostOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const quotes = inquiry.quotes.map((quote) =>
                  quote.sentAt && quote.outcome !== "accepted" ? { ...quote, outcome: "lost" as const } : quote,
                );
                save(
                  { ...inquiry, status: "lost", lostReason, quotes },
                  `Lost. Reason: ${lostReason}.`,
                  "outcome",
                );
                setLostOpen(false);
              }}
            >
              Record lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={wonOpen} onOpenChange={setWonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record accepted</DialogTitle>
          </DialogHeader>
          <label className="grid gap-1 text-[12px] text-zinc-600">
            Handover note
            <DeskText value={handover} onChange={(event) => setHandover(event.target.value)} />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setWonOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const quotes = inquiry.quotes.map((quote, index) =>
                  index === inquiry.quotes.length - 1 ? { ...quote, outcome: "accepted" as const } : quote,
                );
                save(
                  { ...inquiry, status: "won", handoverNote: handover.trim(), quotes },
                  "Accepted. Handed to operations as a demo step. No job file is created.",
                  "outcome",
                );
                setWonOpen(false);
              }}
            >
              Record accepted
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={mailOpen} onOpenChange={setMailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Clarification draft</DialogTitle>
          </DialogHeader>
          <DeskText readOnly className="min-h-64 font-mono text-[12px]" value={clarificationDraft(inquiry)} aria-label="Clarification draft" />
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(clarificationDraft(inquiry));
                save(
                  inquiry,
                  "Clarification draft copied. Nothing was emailed.",
                  "clarification",
                );
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[12px] text-zinc-500">{label}</dt>
      <dd className="text-[13px] text-zinc-900">{value}</dd>
    </div>
  );
}

function place(name: string, city: string, country: string): string {
  return [name, city, country].filter(Boolean).join(", ") || "—";
}

function StaffSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <DeskSelect aria-label="Staff" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Unassigned</option>
      {STAFF.map((person) => (
        <option key={person.id} value={person.id}>
          {person.name} · {person.duty}
        </option>
      ))}
    </DeskSelect>
  );
}

function GapList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; label: string; detail: string }[];
}) {
  return (
    <div>
      <h3 className="text-[13px] font-medium text-zinc-950">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-1 text-[13px] text-zinc-500">{empty}</p>
      ) : (
        <ul className="mt-1 grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <p className="text-[13px] text-zinc-900">{item.label}</p>
              <p className="text-[12px] leading-snug text-zinc-600">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FileList({
  inquiry,
  onChange,
}: {
  inquiry: Inquiry;
  onChange: (files: CargoFile[], timeline: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-[12px] text-zinc-600">
        Log a file received by email
        <input
          type="file"
          className="mt-1 block text-[13px]"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const added: CargoFile = {
              id: uid(),
              name: file.name,
              size: file.size,
              mime: file.type || "application/octet-stream",
              category: file.type.startsWith("image/") ? "photo" : "drawing",
              pieceId: "",
              revision: "",
              addedAt: nowIso(),
            };
            onChange([...inquiry.files, added], `File logged: ${file.name}. Kept in this browser only.`);
            event.target.value = "";
          }}
        />
      </label>
      {inquiry.files.length === 0 ? (
        <p className="text-[13px] text-zinc-600">No drawing or photo is attached.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {inquiry.files.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center gap-3 py-2 text-[13px]">
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-[12px] text-zinc-500">
                {fileCategoryLabel(file.category)} · {formatFileSize(file.size)}
                {file.pieceId ? ` · ${file.pieceId}` : ""}
                {file.revision ? ` · rev ${file.revision}` : ""}
              </span>
              {file.previewDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.previewDataUrl} alt="" className="h-10 w-10 object-cover" />
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function permitItems(inquiry: Inquiry): { id: string; label: string; detail: string }[] {
  const checks = inquiry.pieces.map((piece) => checkPiece(piece, inquiry.deckHeightM));
  const items: { id: string; label: string; detail: string }[] = [];
  if (
    checks.some(
      (check) =>
        check.road.widthOver ||
        check.road.lengthOver ||
        check.road.heightState === "over" ||
        check.road.heightState === "cargo_alone_over",
    )
  ) {
    items.push({
      id: "dpwh",
      label: "DPWH special permit / highway travel permit",
      detail:
        "Size over the RA 4136 references, or a configuration outside the normal matrix, generally needs a permit. A 2026 DPWH advisory describes filing at least one month ahead, with a separate highway travel permit from each regional office on the route. Nothing is filed from here.",
    });
  }
  const places = `${inquiry.origin.city} ${inquiry.destination.city} ${inquiry.origin.address} ${inquiry.destination.address}`.toLowerCase();
  if (/quezon|manila|parañaque|paranaque|pasay|makati|mandaluyong|taguig|pasig|caloocan|diliman/.test(places)) {
    items.push({
      id: "mmda",
      label: "Metro Manila truck window",
      detail: "MMDA truck rules and window hours change by road and by advisory. Check the current advisory. This demo does not.",
    });
  }
  const roads = `${places} ${inquiry.specialNotes} ${inquiry.origin.accessNotes} ${inquiry.destination.accessNotes}`.toLowerCase();
  if (/nlex|sctex|slex|tplex|expressway/.test(roads)) {
    items.push({
      id: "expressway",
      label: "Expressway oversize permit",
      detail: "Expressways have their own oversize rules. Verify the current operator rules. Manual reminder only.",
    });
  }
  return items;
}
