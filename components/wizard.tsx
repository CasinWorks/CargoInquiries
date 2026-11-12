"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeskInput, DeskSelect, DeskText, Field, PageTitle } from "@/components/bits";
import { CalcSummary, OogTables } from "@/components/cargo-views";
import { Tip } from "@/components/shell";
import { draftToPiece, emptyDraft, nextPieceId } from "@/lib/draft";
import { FILE_CATEGORIES, HANDLING_OPTIONS, INCOTERMS, MODES, PACKING, SCOPE_OPTIONS, SOURCES } from "@/lib/labels";
import { useDesk } from "@/lib/store";
import { nowIso, uid } from "@/lib/time";
import type { CargoFile, DataSource, FileCategory, InquiryDraft, Packing, PieceDraft } from "@/lib/types";

const STEPS = ["Company", "Cargo", "Piece list", "Files", "Route and handling", "Review"] as const;
const DRAFT_KEY = "pcd-draft-v1";

export function Wizard() {
  const desk = useDesk();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<InquiryDraft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const skipSave = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let next = emptyDraft();
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        next = JSON.parse(raw) as InquiryDraft;
      } catch {
        next = emptyDraft();
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore an in-progress form after mount
    setDraft(next);
  }, []);

  useEffect(() => {
    if (!draft || skipSave.current) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  if (!draft) return <p className="text-[13px] text-zinc-600">Opening the form…</p>;

  function patch(partial: Partial<InquiryDraft>) {
    setDraft((current) => (current ? { ...current, ...partial } : current));
  }

  function validate(index: number): Record<string, string> {
    const next: Record<string, string> = {};
    if (!draft) return next;
    if (index === 0) {
      if (!draft.company.trim()) next.company = "Enter the company name.";
      if (!draft.contactName.trim()) next.contactName = "Enter a contact name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) next.email = "Enter an email address.";
      if (draft.phone.replace(/\D/g, "").length < 7) next.phone = "Enter a phone number.";
    }
    if (index === 1) {
      if (!draft.projectName.trim()) next.projectName = "Name the movement, not just the commodity.";
      if (!draft.commodity.trim()) next.commodity = "Say what the cargo is.";
      if (!draft.insurance) next.insurance = "Say whether insurance is wanted.";
    }
    if (index === 2) {
      if (draft.pieces.length === 0) next.pieces = "Add at least one piece.";
      draft.pieces.forEach((piece) => {
        if (!piece.description.trim()) next[`d-${piece.id}`] = "Description is required.";
        const parsed = draftToPiece(piece);
        if (!parsed) next[`n-${piece.id}`] = "Qty, length, width, height, and weight must be numbers above zero. Qty is a whole number.";
        else if (parsed.lengthM > 40 || parsed.widthM > 40 || parsed.heightM > 40) {
          next[`n-${piece.id}`] = "Enter metres. A side over 40 m is not accepted on this form.";
        }
        if (!piece.packing) next[`p-${piece.id}`] = "Choose the packing.";
        if (!piece.dataSource) next[`s-${piece.id}`] = "Say whether the figures are measured, from the manufacturer, or estimated.";
      });
    }
    if (index === 4) {
      if (!draft.origin.name.trim() || !draft.origin.city.trim() || !draft.origin.country.trim()) {
        next.origin = "Origin needs a site name, city, and country.";
      }
      if (!draft.destination.name.trim() || !draft.destination.city.trim() || !draft.destination.country.trim()) {
        next.destination = "Destination needs a site name, city, and country.";
      }
      if (!draft.incoterm) next.incoterm = "Choose an Incoterm.";
      if (!draft.cargoReady) next.cargoReady = "Enter the cargo-ready date.";
      if (!draft.mode) next.mode = "Choose a mode, or Not sure yet.";
      if (!draft.dg) next.dg = "Say whether the cargo is dangerous goods.";
      if (draft.dg === "yes" && draft.dgDetails.trim().length < 8) {
        next.dgDetails = "Describe the fuel, residue, battery, or pressure system.";
      }
    }
    return next;
  }

  function continueStep() {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStep((value) => Math.min(value + 1, STEPS.length - 1));
  }

  function submit() {
    if (!draft) return;
    for (let index = 0; index <= 4; index += 1) {
      const found = validate(index);
      if (Object.keys(found).length) {
        setStep(index);
        setErrors(found);
        return;
      }
    }
    skipSave.current = true;
    sessionStorage.removeItem(DRAFT_KEY);
    const inquiry = desk.addInquiry(draft);
    router.push(`/customer/${inquiry.id}?received=1`);
  }

  const pieces = draft.pieces.map(draftToPiece).filter((piece): piece is NonNullable<typeof piece> => piece != null);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle kicker="Customer form" title={STEPS[step]}>
        Step {step + 1} of {STEPS.length}. Packed dimensions, per piece. The desk keeps a missing-item list for anything you leave open.
      </PageTitle>
      <Tip id="wizard">
        Length, width, and height are packed size, in metres, for one piece. You can leave the centre of gravity blank. It will stay on the checklist.
      </Tip>
      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <ol className="no-print grid content-start gap-1">
          {STEPS.map((label, index) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => {
                  if (index <= step) setStep(index);
                }}
                disabled={index > step}
                className={
                  index === step
                    ? "flex w-full items-baseline gap-2 border-l-2 border-zinc-950 py-1 pl-3 text-left text-[13px] text-zinc-950"
                    : "flex w-full items-baseline gap-2 border-l-2 border-zinc-200 py-1 pl-3 text-left text-[13px] text-zinc-500 disabled:cursor-default"
                }
              >
                <span className="font-mono text-[11px]">{String(index + 1).padStart(2, "0")}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="sr-only">
            {STEPS[step]}
          </h2>
          {step === 0 ? <CompanyStep draft={draft} patch={patch} errors={errors} /> : null}
          {step === 1 ? <CargoStep draft={draft} patch={patch} errors={errors} /> : null}
          {step === 2 ? (
            <PieceStep
              draft={draft}
              patch={patch}
              errors={errors}
              pieces={pieces}
              onPaste={() => setPasteOpen(true)}
            />
          ) : null}
          {step === 3 ? <FileStep draft={draft} patch={patch} /> : null}
          {step === 4 ? <RouteStep draft={draft} patch={patch} errors={errors} /> : null}
          {step === 5 ? <ReviewStep draft={draft} pieces={pieces} /> : null}
          <div className="no-print mt-8 flex items-center justify-between border-t border-zinc-200 pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" size="sm" onClick={continueStep}>
                Continue
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={submit}>
                Send inquiry
              </Button>
            )}
          </div>
        </div>
      </div>
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Paste a piece list</DialogTitle>
          </DialogHeader>
          <p className="text-[12px] leading-snug text-zinc-600">
            One piece per line: description, qty, L, W, H, weight kg. Commas or tabs. Optional packing and source (crated, measured) after the weight.
          </p>
          <DeskText value={pasteText} onChange={(event) => setPasteText(event.target.value)} aria-label="Pasted piece list" />
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const rows = pasteRows(pasteText);
                if (rows.length) patch({ pieces: rows });
                setPasteOpen(false);
                setPasteText("");
              }}
            >
              Replace the piece list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyStep({
  draft,
  patch,
  errors,
}: {
  draft: InquiryDraft;
  patch: (partial: Partial<InquiryDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="grid max-w-xl gap-4">
      <Field label="Company" htmlFor="company" error={errors.company}>
        <DeskInput id="company" value={draft.company} onChange={(event) => patch({ company: event.target.value })} autoComplete="organization" />
      </Field>
      <Field label="Company city" htmlFor="companyCity" help="Where your office is. The cargo sites come later.">
        <DeskInput id="companyCity" value={draft.companyCity} onChange={(event) => patch({ companyCity: event.target.value })} />
      </Field>
      <Field label="Contact name" htmlFor="contactName" error={errors.contactName}>
        <DeskInput id="contactName" value={draft.contactName} onChange={(event) => patch({ contactName: event.target.value })} autoComplete="name" />
      </Field>
      <Field label="Role" htmlFor="contactRole">
        <DeskInput id="contactRole" value={draft.contactRole} onChange={(event) => patch({ contactRole: event.target.value })} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <DeskInput id="email" type="email" value={draft.email} onChange={(event) => patch({ email: event.target.value })} autoComplete="email" />
      </Field>
      <Field label="Phone" htmlFor="phone" error={errors.phone}>
        <DeskInput id="phone" value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} autoComplete="tel" />
      </Field>
    </div>
  );
}

function CargoStep({
  draft,
  patch,
  errors,
}: {
  draft: InquiryDraft;
  patch: (partial: Partial<InquiryDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="grid max-w-xl gap-4">
      <Field label="Project" htmlFor="projectName" error={errors.projectName} help="A name a colleague would recognise. Example: 110 MVA transformer, Batangas to Calauan.">
        <DeskInput id="projectName" value={draft.projectName} onChange={(event) => patch({ projectName: event.target.value })} />
      </Field>
      <Field label="Commodity" htmlFor="commodity" error={errors.commodity} help="What it is, in words. Not an HS code.">
        <DeskInput id="commodity" value={draft.commodity} onChange={(event) => patch({ commodity: event.target.value })} />
      </Field>
      <Field label="HS code" htmlFor="hsCode" help="Optional. This demo does not classify the goods or compute duty.">
        <DeskInput id="hsCode" value={draft.hsCode} onChange={(event) => patch({ hsCode: event.target.value })} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <Field label="Cargo value" htmlFor="cargoValue" help="For insurance context. Not a customs value.">
          <DeskInput id="cargoValue" inputMode="decimal" value={draft.cargoValue} onChange={(event) => patch({ cargoValue: event.target.value })} />
        </Field>
        <Field label="Currency" htmlFor="cargoValueCurrency">
          <DeskSelect
            id="cargoValueCurrency"
            value={draft.cargoValueCurrency}
            onChange={(event) => patch({ cargoValueCurrency: event.target.value as InquiryDraft["cargoValueCurrency"] })}
          >
            <option value="USD">USD</option>
            <option value="PHP">PHP</option>
            <option value="EUR">EUR</option>
          </DeskSelect>
        </Field>
      </div>
      <Field label="Insurance" htmlFor="insurance" error={errors.insurance}>
        <DeskSelect id="insurance" value={draft.insurance} onChange={(event) => patch({ insurance: event.target.value as InquiryDraft["insurance"] })}>
          <option value="">Choose</option>
          <option value="yes">Yes, please include it</option>
          <option value="no">No</option>
          <option value="unsure">Not sure</option>
        </DeskSelect>
      </Field>
      <fieldset>
        <legend className="text-[13px] font-medium text-zinc-800">Services in scope</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {SCOPE_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-[13px] text-zinc-800">
              <Checkbox
                checked={draft.scope.includes(option.id)}
                onCheckedChange={(checked) => {
                  const scope = checked ? [...draft.scope, option.id] : draft.scope.filter((id) => id !== option.id);
                  patch({ scope });
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function PieceStep({
  draft,
  patch,
  errors,
  pieces,
  onPaste,
}: {
  draft: InquiryDraft;
  patch: (partial: Partial<InquiryDraft>) => void;
  errors: Record<string, string>;
  pieces: NonNullable<ReturnType<typeof draftToPiece>>[];
  onPaste: () => void;
}) {
  function updatePiece(id: string, partial: Partial<PieceDraft>) {
    patch({ pieces: draft.pieces.map((piece) => (piece.id === id ? { ...piece, ...partial } : piece)) });
  }
  function removePiece(id: string) {
    patch({ pieces: draft.pieces.filter((piece) => piece.id !== id) });
  }
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-[12px] leading-snug text-zinc-600">
          Packed dimensions, per piece, in metres. Include the crate, the skid, and any protrusion. Weight is gross, for one piece, not the line total.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPaste}>
            Paste rows
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => patch({ pieces: [...draft.pieces, { ...emptyPiece(nextPieceId(draft.pieces)) }] })}
          >
            Add piece
          </Button>
        </div>
      </div>
      {errors.pieces ? <p className="text-[12px] text-rose-800">{errors.pieces}</p> : null}
      <div className="grid gap-3 lg:hidden">
        {draft.pieces.map((piece) => (
          <PieceCard key={piece.id} piece={piece} errors={errors} onChange={updatePiece} onRemove={removePiece} />
        ))}
      </div>
      <div className="hidden overflow-x-auto border border-zinc-200 bg-white lg:block">
        <table className="w-full min-w-[980px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase">
              <th className="px-2 py-2 font-medium">Piece</th>
              <th className="px-2 py-2 font-medium">Description</th>
              <th className="px-2 py-2 font-medium">Qty</th>
              <th className="px-2 py-2 font-medium">L m</th>
              <th className="px-2 py-2 font-medium">W m</th>
              <th className="px-2 py-2 font-medium">H m</th>
              <th className="px-2 py-2 font-medium">kg each</th>
            </tr>
          </thead>
          <tbody>
            {draft.pieces.map((piece) => (
              <PieceRows key={piece.id} piece={piece} errors={errors} onChange={updatePiece} onRemove={removePiece} />
            ))}
          </tbody>
        </table>
      </div>
      <CalcSummary pieces={pieces} deckHeightM={draft.deckHeightM} />
      <OogTables pieces={pieces} deckHeightM={draft.deckHeightM} />
    </div>
  );
}

function emptyPiece(id: string): PieceDraft {
  return {
    id,
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

function PieceRows({
  piece,
  errors,
  onChange,
  onRemove,
}: {
  piece: PieceDraft;
  errors: Record<string, string>;
  onChange: (id: string, partial: Partial<PieceDraft>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <>
      <tr className="border-b border-zinc-100">
        <td className="px-2 py-1.5 font-mono text-[12px] text-zinc-500">{piece.id}</td>
        <td className="px-2 py-1.5">
          <DeskInput aria-label={`${piece.id} description`} value={piece.description} onChange={(event) => onChange(piece.id, { description: event.target.value })} />
        </td>
        <td className="px-2 py-1.5">
          <DeskInput className="w-16" inputMode="numeric" aria-label={`${piece.id} quantity`} value={piece.qty} onChange={(event) => onChange(piece.id, { qty: event.target.value })} />
        </td>
        {(["lengthM", "widthM", "heightM", "weightKg"] as const).map((key) => (
          <td key={key} className="px-2 py-1.5">
            <DeskInput
              className="w-24"
              inputMode="decimal"
              aria-label={`${piece.id} ${key}`}
              value={piece[key]}
              onChange={(event) => onChange(piece.id, { [key]: event.target.value })}
            />
          </td>
        ))}
      </tr>
      <tr className="border-b border-zinc-200 bg-zinc-50">
        <td colSpan={7} className="px-2 py-2">
          <PieceMeta piece={piece} errors={errors} onChange={onChange} onRemove={onRemove} />
        </td>
      </tr>
    </>
  );
}

function PieceCard({
  piece,
  errors,
  onChange,
  onRemove,
}: {
  piece: PieceDraft;
  errors: Record<string, string>;
  onChange: (id: string, partial: Partial<PieceDraft>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="border border-zinc-200 bg-white p-3">
      <p className="font-mono text-[12px] text-zinc-500">{piece.id}</p>
      <div className="mt-2 grid gap-2">
        <DeskInput aria-label={`${piece.id} description`} placeholder="Description" value={piece.description} onChange={(event) => onChange(piece.id, { description: event.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <DeskInput inputMode="numeric" aria-label={`${piece.id} quantity`} placeholder="Qty" value={piece.qty} onChange={(event) => onChange(piece.id, { qty: event.target.value })} />
          <DeskInput inputMode="decimal" aria-label={`${piece.id} weight kg`} placeholder="kg each" value={piece.weightKg} onChange={(event) => onChange(piece.id, { weightKg: event.target.value })} />
          <DeskInput inputMode="decimal" aria-label={`${piece.id} length`} placeholder="L m" value={piece.lengthM} onChange={(event) => onChange(piece.id, { lengthM: event.target.value })} />
          <DeskInput inputMode="decimal" aria-label={`${piece.id} width`} placeholder="W m" value={piece.widthM} onChange={(event) => onChange(piece.id, { widthM: event.target.value })} />
          <DeskInput inputMode="decimal" aria-label={`${piece.id} height`} placeholder="H m" value={piece.heightM} onChange={(event) => onChange(piece.id, { heightM: event.target.value })} />
        </div>
        <PieceMeta piece={piece} errors={errors} onChange={onChange} onRemove={onRemove} />
      </div>
    </div>
  );
}

function PieceMeta({
  piece,
  errors,
  onChange,
  onRemove,
}: {
  piece: PieceDraft;
  errors: Record<string, string>;
  onChange: (id: string, partial: Partial<PieceDraft>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <DeskSelect aria-label={`${piece.id} packing`} className="w-36" value={piece.packing} onChange={(event) => onChange(piece.id, { packing: event.target.value as Packing | "" })}>
          <option value="">Packing</option>
          {PACKING.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </DeskSelect>
        <DeskSelect aria-label={`${piece.id} data source`} className="w-40" value={piece.dataSource} onChange={(event) => onChange(piece.id, { dataSource: event.target.value as DataSource | "" })}>
          <option value="">Data source</option>
          {SOURCES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </DeskSelect>
        <DeskSelect aria-label={`${piece.id} stackable`} className="w-36" value={piece.stackable} onChange={(event) => onChange(piece.id, { stackable: event.target.value as PieceDraft["stackable"] })}>
          <option value="unknown">Stack unknown</option>
          <option value="yes">Stackable</option>
          <option value="no">Do not stack</option>
        </DeskSelect>
        <label className="flex items-center gap-1 text-[12px] text-zinc-600">
          Revised
          <DeskInput type="date" aria-label={`${piece.id} revision date`} className="w-36" value={piece.revisionDate} onChange={(event) => onChange(piece.id, { revisionDate: event.target.value })} />
        </label>
        <button type="button" className="text-[12px] text-zinc-500 underline" onClick={() => onRemove(piece.id)}>
          Remove {piece.id}
        </button>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Centre of gravity
          <span className="flex gap-1">
            <DeskSelect aria-label={`${piece.id} centre of gravity`} className="w-32" value={piece.cogKnown} onChange={(event) => onChange(piece.id, { cogKnown: event.target.value as PieceDraft["cogKnown"] })}>
              <option value="unknown">Not known</option>
              <option value="yes">Known</option>
              <option value="no">Not available</option>
            </DeskSelect>
            <DeskInput aria-label={`${piece.id} centre of gravity note`} placeholder="Where it sits, if known" value={piece.cogNote} onChange={(event) => onChange(piece.id, { cogNote: event.target.value })} />
          </span>
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Lifting points
          <span className="flex gap-1">
            <DeskSelect aria-label={`${piece.id} lifting points`} className="w-32" value={piece.liftingKnown} onChange={(event) => onChange(piece.id, { liftingKnown: event.target.value as PieceDraft["liftingKnown"] })}>
              <option value="unknown">Not known</option>
              <option value="yes">Known</option>
              <option value="no">Not available</option>
            </DeskSelect>
            <DeskInput aria-label={`${piece.id} lifting note`} placeholder="Lugs, slings, frame" value={piece.liftingNote} onChange={(event) => onChange(piece.id, { liftingNote: event.target.value })} />
          </span>
        </label>
      </div>
      {errors[`d-${piece.id}`] || errors[`n-${piece.id}`] || errors[`p-${piece.id}`] || errors[`s-${piece.id}`] ? (
        <p className="text-[12px] text-rose-800" role="alert">
          {errors[`d-${piece.id}`] || errors[`n-${piece.id}`] || errors[`p-${piece.id}`] || errors[`s-${piece.id}`]}
        </p>
      ) : null}
    </div>
  );
}

function FileStep({ draft, patch }: { draft: InquiryDraft; patch: (partial: Partial<InquiryDraft>) => void }) {
  async function onFiles(list: FileList | null) {
    if (!list) return;
    const added: CargoFile[] = [];
    for (const file of Array.from(list)) {
      let previewDataUrl: string | undefined;
      if (file.type.startsWith("image/") && file.size < 120_000) {
        previewDataUrl = await readDataUrl(file);
      }
      added.push({
        id: uid(),
        name: file.name,
        size: file.size,
        mime: file.type || "application/octet-stream",
        category: file.type.startsWith("image/") ? "photo" : "drawing",
        pieceId: "",
        revision: "",
        addedAt: nowIso(),
        previewDataUrl,
      });
    }
    patch({ files: [...draft.files, ...added] });
  }
  return (
    <div className="grid max-w-3xl gap-4">
      <p className="text-[12px] leading-snug text-zinc-600">
        Drawings, photos, a packing list, an MSDS, a lift plan. The file stays in this browser. It is not uploaded to a server. A photo preview is kept only if the image is under 120 KB.
      </p>
      <Field label="Add files" htmlFor="files">
        <input
          id="files"
          type="file"
          multiple
          className="block text-[13px]"
          onChange={(event) => {
            void onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </Field>
      {draft.files.length === 0 ? (
        <p className="text-[13px] text-zinc-600">No file attached yet. You can still send the inquiry. The checklist will say a drawing is missing if a piece looks out of gauge.</p>
      ) : (
        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {draft.files.map((file) => (
            <li key={file.id} className="grid gap-2 py-2 sm:grid-cols-[1fr_140px_120px_auto] sm:items-center">
              <span className="truncate text-[13px]">{file.name}</span>
              <DeskSelect
                aria-label={`Category for ${file.name}`}
                value={file.category}
                onChange={(event) =>
                  patch({
                    files: draft.files.map((item) =>
                      item.id === file.id ? { ...item, category: event.target.value as FileCategory } : item,
                    ),
                  })
                }
              >
                {FILE_CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </DeskSelect>
              <DeskSelect
                aria-label={`Piece for ${file.name}`}
                value={file.pieceId}
                onChange={(event) =>
                  patch({
                    files: draft.files.map((item) => (item.id === file.id ? { ...item, pieceId: event.target.value } : item)),
                  })
                }
              >
                <option value="">No piece</option>
                {draft.pieces.map((piece) => (
                  <option key={piece.id} value={piece.id}>
                    {piece.id}
                  </option>
                ))}
              </DeskSelect>
              <button
                type="button"
                className="text-[12px] text-zinc-500 underline"
                onClick={() => patch({ files: draft.files.filter((item) => item.id !== file.id) })}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RouteStep({
  draft,
  patch,
  errors,
}: {
  draft: InquiryDraft;
  patch: (partial: Partial<InquiryDraft>) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="grid max-w-3xl gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <SiteFields title="Origin site" site={draft.origin} error={errors.origin} onChange={(origin) => patch({ origin })} idPrefix="origin" />
        <SiteFields
          title="Destination site"
          site={draft.destination}
          error={errors.destination}
          onChange={(destination) => patch({ destination })}
          idPrefix="destination"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Port of loading" htmlFor="pol" help="Leave blank for an inland haul.">
          <DeskInput id="pol" value={draft.pol} onChange={(event) => patch({ pol: event.target.value })} />
        </Field>
        <Field label="Port of discharge" htmlFor="pod">
          <DeskInput id="pod" value={draft.pod} onChange={(event) => patch({ pod: event.target.value })} />
        </Field>
      </div>
      <Field label="Incoterm" htmlFor="incoterm" error={errors.incoterm} help="Incoterms 2020. FAS, FOB, CFR and CIF are sea and inland-waterway rules.">
        <DeskSelect id="incoterm" value={draft.incoterm} onChange={(event) => patch({ incoterm: event.target.value as InquiryDraft["incoterm"] })}>
          <option value="">Choose</option>
          {INCOTERMS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.id}
              {item.seaOnly ? " · sea / inland waterway" : ""}
            </option>
          ))}
        </DeskSelect>
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Cargo-ready date" htmlFor="cargoReady" error={errors.cargoReady} help="The date the packed cargo can actually be collected.">
          <DeskInput id="cargoReady" type="date" value={draft.cargoReady} onChange={(event) => patch({ cargoReady: event.target.value })} />
        </Field>
        <Field label="Required on site" htmlFor="requiredOnSite" help="Optional. When the site needs it.">
          <DeskInput id="requiredOnSite" type="date" value={draft.requiredOnSite} onChange={(event) => patch({ requiredOnSite: event.target.value })} />
        </Field>
      </div>
      <Field label="Mode preference" htmlFor="mode" error={errors.mode}>
        <DeskSelect id="mode" value={draft.mode} onChange={(event) => patch({ mode: event.target.value as InquiryDraft["mode"] })}>
          <option value="">Choose</option>
          {MODES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </DeskSelect>
      </Field>
      <Field label="Trailer deck height (m)" htmlFor="deck" help="Road height includes the deck. Enter it if you know the trailer. This form does not assume one. Leave blank if you do not know.">
        <DeskInput id="deck" inputMode="decimal" value={draft.deckHeightM} onChange={(event) => patch({ deckHeightM: event.target.value })} className="max-w-40" />
      </Field>
      <Field label="Dangerous goods" htmlFor="dg" error={errors.dg} help="Fuel, hydraulic oil, batteries, pressure systems, residues. This is not a dangerous-goods declaration.">
        <DeskSelect id="dg" value={draft.dg} onChange={(event) => patch({ dg: event.target.value as InquiryDraft["dg"] })}>
          <option value="">Choose</option>
          <option value="no">No</option>
          <option value="yes">Yes</option>
          <option value="unsure">Not sure</option>
        </DeskSelect>
      </Field>
      {draft.dg === "yes" || draft.dg === "unsure" ? (
        <Field label="What is in or on the cargo" htmlFor="dgDetails" error={errors.dgDetails}>
          <DeskText id="dgDetails" value={draft.dgDetails} onChange={(event) => patch({ dgDetails: event.target.value })} />
        </Field>
      ) : null}
      <fieldset>
        <legend className="text-[13px] font-medium text-zinc-800">Special handling</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {HANDLING_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-[13px]">
              <Checkbox
                checked={draft.specialHandling.includes(option.id)}
                onCheckedChange={(checked) => {
                  const specialHandling = checked
                    ? [...draft.specialHandling, option.id]
                    : draft.specialHandling.filter((id) => id !== option.id);
                  patch({ specialHandling });
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Notes for the desk" htmlFor="specialNotes">
        <DeskText id="specialNotes" value={draft.specialNotes} onChange={(event) => patch({ specialNotes: event.target.value })} />
      </Field>
      <p className="text-[12px] text-zinc-500">Sailing dates are not shown. There is no schedule feed. Coming later.</p>
    </div>
  );
}

function SiteFields({
  title,
  site,
  error,
  onChange,
  idPrefix,
}: {
  title: string;
  site: InquiryDraft["origin"];
  error?: string;
  onChange: (site: InquiryDraft["origin"]) => void;
  idPrefix: string;
}) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-[13px] font-medium text-zinc-800">{title}</legend>
      <Field label="Site name" htmlFor={`${idPrefix}-name`}>
        <DeskInput id={`${idPrefix}-name`} value={site.name} onChange={(event) => onChange({ ...site, name: event.target.value })} />
      </Field>
      <Field label="Address" htmlFor={`${idPrefix}-address`}>
        <DeskInput id={`${idPrefix}-address`} value={site.address} onChange={(event) => onChange({ ...site, address: event.target.value })} />
      </Field>
      <Field label="City" htmlFor={`${idPrefix}-city`}>
        <DeskInput id={`${idPrefix}-city`} value={site.city} onChange={(event) => onChange({ ...site, city: event.target.value })} />
      </Field>
      <Field label="Country" htmlFor={`${idPrefix}-country`}>
        <DeskInput id={`${idPrefix}-country`} value={site.country} onChange={(event) => onChange({ ...site, country: event.target.value })} />
      </Field>
      <Field label="Access" htmlFor={`${idPrefix}-access`} help="Gate, crane on site, overhead lines, road approach. A route survey still has to confirm this.">
        <DeskText id={`${idPrefix}-access`} value={site.accessNotes} onChange={(event) => onChange({ ...site, accessNotes: event.target.value })} />
      </Field>
      {error ? (
        <p className="text-[12px] text-rose-800" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function ReviewStep({
  draft,
  pieces,
}: {
  draft: InquiryDraft;
  pieces: NonNullable<ReturnType<typeof draftToPiece>>[];
}) {
  return (
    <div className="grid gap-4">
      <p className="text-[13px] text-zinc-700">
        {draft.company} · {draft.contactName} · {draft.email}
      </p>
      <p className="text-[15px] text-zinc-950">{draft.projectName}</p>
      <p className="text-[13px] text-zinc-600">
        {draft.origin.city || "Origin"} → {draft.destination.city || "Destination"} · {draft.incoterm || "Incoterm not set"} · Ready {draft.cargoReady || "—"}
      </p>
      <CalcSummary pieces={pieces} deckHeightM={draft.deckHeightM} />
      <OogTables pieces={pieces} deckHeightM={draft.deckHeightM} />
      <p className="text-[12px] leading-snug text-zinc-500">
        Sending stores the inquiry in this browser and opens it on the team desk. Nothing is emailed. Internal notes and prices stay on the team side.
      </p>
    </div>
  );
}

function pasteRows(text: string): PieceDraft[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const start = /description/i.test(lines[0] ?? "") ? 1 : 0;
  const packingIds = new Set(PACKING.map((item) => item.id));
  const sourceIds = new Set(SOURCES.map((item) => item.id));
  const rows: PieceDraft[] = [];
  lines.slice(start).forEach((line, index) => {
    const cells = line.split(/\t|,/).map((cell) => cell.trim());
    if (cells.length < 6) return;
    const packing = packingIds.has(cells[6] as Packing) ? (cells[6] as Packing) : "";
    const dataSource = sourceIds.has(cells[7] as DataSource) ? (cells[7] as DataSource) : "";
    rows.push({
      ...emptyPiece(`P-${String(index + 1).padStart(2, "0")}`),
      description: cells[0].replace(/^"|"$/g, ""),
      qty: cells[1],
      lengthM: cells[2],
      widthM: cells[3],
      heightM: cells[4],
      weightKg: cells[5],
      packing,
      dataSource,
    });
  });
  return rows;
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
