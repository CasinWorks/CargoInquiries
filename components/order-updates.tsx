"use client";

import { Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeskSelect, DeskText } from "@/components/bits";
import { LOST_REASONS, STAFF, staffName, statusLabel } from "@/lib/labels";
import { factsFromInquiry, neededGaps } from "@/lib/missing";
import { logKindToTimeline, sourceLabel, sourceOf, stageLabelForMove, statusForStage, type LogKind } from "@/lib/order";
import { useDesk } from "@/lib/store";
import { nowIso, uid } from "@/lib/time";
import type { Inquiry, Status, TimelineKind } from "@/lib/types";

export function SourceBadge({ inquiry }: { inquiry: Inquiry }) {
  return (
    <span className="ml-2 inline-block border border-zinc-300 px-1 align-middle text-[11px] tracking-wide text-zinc-700 uppercase">
      {sourceLabel(sourceOf(inquiry))}
    </span>
  );
}

export function TimelineMark({ kind }: { kind: TimelineKind }) {
  if (kind === "call") return <Phone className="mr-1 inline size-3.5" aria-hidden />;
  if (kind === "email") return <Mail className="mr-1 inline size-3.5" aria-hidden />;
  return null;
}

const LOGS: { id: LogKind; label: string }[] = [
  { id: "call", label: "Logged a call" },
  { id: "email_in", label: "Received email" },
  { id: "email_out", label: "Sent email" },
  { id: "info", label: "Customer sent missing info" },
];

export function LogUpdate({ inquiry, initialKind = "" }: { inquiry: Inquiry; initialKind?: LogKind | "" }) {
  const desk = useDesk();
  const [kind, setKind] = useState<LogKind | "">(initialKind);
  const [note, setNote] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const open = neededGaps(factsFromInquiry(inquiry)).filter((gap) => !(inquiry.clearedGaps ?? []).includes(gap.id));

  function save() {
    if (!kind) return;
    const mapped = logKindToTimeline(kind);
    const chosen = kind === "info" ? open.filter((gap) => picked.includes(gap.id)) : [];
    const extra = chosen.length ? ` Noted as received: ${chosen.map((gap) => gap.label).join("; ")}.` : "";
    const text = `${mapped.lead}${note.trim() ? ` ${note.trim()}` : ""}${extra}`;
    desk.updateInquiry(inquiry.id, (current) => ({
      ...current,
      clearedGaps: [...new Set([...(current.clearedGaps ?? []), ...chosen.map((gap) => gap.id)])],
      timeline: [...current.timeline, { id: uid(), at: nowIso(), kind: mapped.timeline, text }],
    }));
    setNote("");
    setPicked([]);
    setKind("");
  }

  return (
    <div className="border border-zinc-300 bg-white p-3" id="log-update" data-tour="log-update">
      <p className="text-[16px] font-medium text-zinc-950">Log an update</p>
      <p className="mt-1 text-[15px] leading-snug text-zinc-600">Use this after a phone call or an email. The time is saved for you. Nothing is sent from here.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {LOGS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              kind === item.id
                ? "min-h-11 border border-zinc-950 bg-zinc-950 px-3 text-[16px] text-white"
                : "min-h-11 border border-zinc-300 bg-white px-3 text-[16px] text-zinc-950"
            }
            onClick={() => setKind(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="mt-3 grid gap-1 text-[15px] text-zinc-800">
        Short note
        <DeskText value={note} onChange={(event) => setNote(event.target.value)} aria-label="Update note" className="text-[16px]" />
      </label>
      {kind === "info" ? (
        <fieldset className="mt-3 grid gap-2">
          <legend className="text-[15px] text-zinc-800">Tick what the customer says they sent</legend>
          {open.length === 0 ? <p className="text-[15px] text-zinc-600">Nothing is still listed as missing.</p> : null}
          {open.map((gap) => (
            <label key={gap.id} className="flex items-start gap-2 text-[15px]">
              <input
                type="checkbox"
                className="mt-1 size-4"
                checked={picked.includes(gap.id)}
                onChange={(event) =>
                  setPicked((current) => (event.target.checked ? [...current, gap.id] : current.filter((id) => id !== gap.id)))
                }
              />
              <span>{gap.label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      <button type="button" className="mt-3 min-h-11 bg-zinc-950 px-4 text-[16px] text-white disabled:opacity-40" disabled={!kind} onClick={save}>
        Save update
      </button>
    </div>
  );
}

export function MoveStageDialog({
  inquiry,
  stageId,
  onClose,
}: {
  inquiry: Inquiry;
  stageId: string | null;
  onClose: () => void;
}) {
  const desk = useDesk();
  const [note, setNote] = useState("");
  const [result, setResult] = useState<"won" | "lost" | "expired" | "">("");
  const [reason, setReason] = useState<string>(LOST_REASONS[0]);
  const open = stageId != null;
  const isResult = stageId === "result";

  function apply(status: Status, lead: string) {
    const text = `${lead}${note.trim() ? ` ${note.trim()}` : ""} This does not send an email.`;
    desk.updateInquiry(inquiry.id, (current) => ({
      ...current,
      status,
      lostReason: status === "lost" ? reason : current.lostReason,
      handoverNote: status === "won" ? note.trim() || "Accepted from a call or email. No job file is created." : current.handoverNote,
      timeline: [...current.timeline, { id: uid(), at: nowIso(), kind: "status", text }],
    }));
    setNote("");
    setResult("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isResult ? "Record the result" : `Move to ${stageLabelForMove(stageId || "")}?`}</DialogTitle>
          <DialogDescription>This updates the progress only. It does not email the customer.</DialogDescription>
        </DialogHeader>
        {isResult ? (
          <div className="grid gap-2">
            {(
              [
                ["won", "Won"],
                ["lost", "Lost"],
                ["expired", "Expired"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={result === id ? "min-h-11 border border-zinc-950 bg-zinc-950 px-3 text-[16px] text-white" : "min-h-11 border border-zinc-300 px-3 text-[16px]"}
                onClick={() => setResult(id)}
              >
                {label}
              </button>
            ))}
            {result === "lost" ? (
              <label className="grid gap-1 text-[15px]">
                Reason
                <DeskSelect value={reason} onChange={(event) => setReason(event.target.value)} aria-label="Lost reason">
                  {LOST_REASONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </DeskSelect>
              </label>
            ) : null}
          </div>
        ) : (
          <p className="text-[15px] text-zinc-700">The stage will become {stageLabelForMove(stageId || "")}.</p>
        )}
        <label className="grid gap-1 text-[15px]">
          Note, if you want one
          <DeskText value={note} onChange={(event) => setNote(event.target.value)} aria-label="Stage note" />
        </label>
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (isResult) {
                if (!result) return;
                if (result === "lost" && !reason) return;
                apply(result, result === "won" ? "Marked won." : result === "lost" ? `Marked lost. Reason: ${reason}.` : "Marked expired.");
                return;
              }
              if (!stageId) return;
              const status = statusForStage(stageId, inquiry.status);
              apply(status, `Moved to ${stageLabelForMove(stageId)} (${statusLabel(status)}).`);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FollowUpWho({ inquiry }: { inquiry: Inquiry }) {
  const desk = useDesk();
  return (
    <label className="mt-3 grid gap-1 text-[12px] text-zinc-600">
      Follow-up with
      <DeskSelect
        aria-label="Who follows up"
        value={inquiry.followUpWho ?? ""}
        onChange={(event) => {
          const who = event.target.value;
          desk.updateInquiry(inquiry.id, (current) => ({
            ...current,
            followUpWho: who,
            timeline: [
              ...current.timeline,
              { id: uid(), at: nowIso(), kind: "assignment", text: who ? `Follow-up owner set to ${staffName(who)}.` : "Follow-up owner cleared." },
            ],
          }));
        }}
      >
        <option value="">Unassigned</option>
        {STAFF.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name} · {person.duty}
          </option>
        ))}
      </DeskSelect>
    </label>
  );
}

export function RowUpdate({ inquiry }: { inquiry: Inquiry }) {
  const [open, setOpen] = useState(false);
  const [stageId, setStageId] = useState<string | null>(null);
  return (
    <>
      <button type="button" className="min-h-9 border border-zinc-300 px-2 text-[13px]" onClick={() => setOpen(true)}>
        Update
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update {inquiry.reference}</DialogTitle>
            <DialogDescription>Log a call or an email, or move the stage. Nothing is emailed.</DialogDescription>
          </DialogHeader>
          <LogUpdate inquiry={inquiry} />
          <button type="button" className="min-h-11 border border-zinc-950 px-3 text-[16px]" onClick={() => setStageId("next")}>
            Move stage
          </button>
        </DialogContent>
      </Dialog>
      <MoveStageDialog
        inquiry={inquiry}
        stageId={stageId === "next" ? nextStageId(inquiry) : stageId}
        onClose={() => setStageId(null)}
      />
    </>
  );
}

function nextStageId(inquiry: Inquiry): string {
  const order = ["received", "checking", "preparing", "approval", "sent", "result"];
  const index = order.indexOf(currentStageId(inquiry.status));
  return order[Math.min(order.length - 1, index + 1)] ?? "result";
}

function currentStageId(status: Status): string {
  switch (status) {
    case "new":
      return "received";
    case "info_incomplete":
      return "checking";
    case "feasibility":
    case "costing":
    case "revision_requested":
      return "preparing";
    case "internal_approval":
      return "approval";
    case "quoted_budgetary":
    case "quoted_firm":
      return "sent";
    default:
      return "result";
  }
}
