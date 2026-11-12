"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CalcSummary, OogTables, PieceReadout } from "@/components/cargo-views";
import { NextStepPanel } from "@/components/next-step";
import { SourceBadge } from "@/components/order-updates";
import { StageProgress } from "@/components/stage-progress";
import { useDesk } from "@/lib/store";
import { formatDay } from "@/lib/time";

export function CustomerInquiry({ id }: { id: string }) {
  const desk = useDesk();
  const params = useSearchParams();
  const inquiry = desk.inquiries.find((item) => item.id === id);
  if (!inquiry || inquiry.sample) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-[13px] text-zinc-700">Sample jobs are on the team desk.</p>
        <Link href="/" className="mt-2 inline-block text-[13px] text-[#1e3a5f] underline">
          Open the team desk
        </Link>
      </div>
    );
  }
  const received = params.get("received") === "1";
  return (
    <div className="mx-auto grid max-w-4xl gap-4">
      <p className="font-mono text-[12px] text-zinc-500">
        {inquiry.reference}
        <SourceBadge inquiry={inquiry} />
      </p>
      <StageProgress inquiry={inquiry} audience="customer" />
      <NextStepPanel inquiry={inquiry} today={desk.today} audience="customer" />
      <h1 className="text-[20px] font-medium text-zinc-950">{received ? "Inquiry received" : inquiry.projectName}</h1>
      {received ? (
        <p className="max-w-2xl text-[13px] leading-relaxed text-zinc-700">
          Reference {inquiry.reference}. Someone on the desk will read the piece list and write back if a drawing, a weight ticket, or a lifting point is still missing. This reference is stored in this browser only. Nothing was emailed.
        </p>
      ) : (
        <p className="text-[13px] text-zinc-600">{inquiry.projectName}</p>
      )}
      <p className="text-[13px] text-zinc-600">Internal notes and the costing sheet stay on the team side.</p>
      <p className="text-[13px] text-zinc-700">
        {inquiry.origin.city} → {inquiry.destination.city} · {inquiry.incoterm || "Incoterm not set"} · Ready {formatDay(inquiry.cargoReady)}
      </p>
      <PieceReadout pieces={inquiry.pieces} deckHeightM={inquiry.deckHeightM} />
      <CalcSummary pieces={inquiry.pieces} deckHeightM={inquiry.deckHeightM} />
      <OogTables pieces={inquiry.pieces} deckHeightM={inquiry.deckHeightM} />
      <div className="no-print flex flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href={`/inquiries/${inquiry.id}`}>Open it on the team desk</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/customer/new">Start another</Link>
        </Button>
      </div>
    </div>
  );
}
