"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeskInput, DeskSelect, DeskText, PageTitle } from "@/components/bits";
import { shellInquiry } from "@/lib/draft";
import { SOURCES } from "@/lib/order";
import { useDesk } from "@/lib/store";
import { nowIso, uid } from "@/lib/time";
import type { InquirySource, Piece } from "@/lib/types";

export function QuickEntry() {
  const desk = useDesk();
  const router = useRouter();
  const [source, setSource] = useState<InquirySource>("phone");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState("");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [pieces, setPieces] = useState([{ description: "", qty: "1", lengthM: "", widthM: "", heightM: "", weightKg: "" }]);

  function save() {
    if (!company.trim() || !contact.trim() || !project.trim()) {
      setError("Company, contact, and a short description are required.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setError("Add a phone number or an email, so someone can reply.");
      return;
    }
    const savedPieces: Piece[] = [];
    pieces.forEach((piece, index) => {
      const hasAny =
        piece.description.trim() ||
        piece.weightKg.trim() ||
        piece.lengthM.trim() ||
        piece.widthM.trim() ||
        piece.heightM.trim();
      if (!hasAny) return;
      const lengthM = Number(piece.lengthM);
      const widthM = Number(piece.widthM);
      const heightM = Number(piece.heightM);
      const weightKg = Number(piece.weightKg);
      const qtyRaw = Number(piece.qty || "1");
      const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? Math.floor(qtyRaw) : 1;
      const dim = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
      const complete =
        dim(lengthM) > 0 && dim(widthM) > 0 && dim(heightM) > 0 && dim(weightKg) > 0;
      savedPieces.push({
        id: `P-${String(index + 1).padStart(2, "0")}`,
        description: piece.description.trim() || "Piece (provisional)",
        qty,
        lengthM: dim(lengthM),
        widthM: dim(widthM),
        heightM: dim(heightM),
        weightKg: dim(weightKg),
        packing: "",
        stackable: "unknown",
        cogKnown: "unknown",
        cogNote: "",
        liftingKnown: "unknown",
        liftingNote: "",
        dataSource: complete ? "" : "estimated",
        revisionDate: "",
      });
    });
    const stamp = nowIso();
    const used = new Set(desk.inquiries.map((item) => item.reference));
    let n = 1901;
    while (used.has(`PCD-26-${n}`)) n += 1;
    const inquiry = {
      ...shellInquiry(),
      id: uid(),
      reference: `PCD-26-${n}`,
      sample: false,
      source,
      createdAt: stamp,
      updatedAt: stamp,
      status: "info_incomplete" as const,
      company: company.trim(),
      contactName: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      projectName: project.trim(),
      commodity: project.trim(),
      pieces: savedPieces,
      notes: paste.trim() ? [{ id: uid(), at: stamp, author: "You (demo)", text: paste.trim() }] : [],
      timeline: [
        {
          id: uid(),
          at: stamp,
          kind: "created" as const,
          text: `Opened from ${SOURCES.find((item) => item.id === source)?.label ?? "a message"}. Sizes can be added later. Nothing was emailed.`,
        },
      ],
    };
    desk.addQuickInquiry(inquiry);
    router.push(`/inquiries/${inquiry.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl" data-tour="new-from-call">
      <PageTitle kicker="Team desk" title="New inquiry from email or call">
        Fill this in while you are on the phone or reading an email. Sizes can wait. Nothing is sent from this screen.
      </PageTitle>
      <div className="grid gap-4">
        <label className="grid gap-1 text-[16px] text-zinc-900">
          How it came in
          <DeskSelect className="h-11 text-[16px]" value={source} onChange={(event) => setSource(event.target.value as InquirySource)} aria-label="Source">
            {SOURCES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </DeskSelect>
        </label>
        <label className="grid gap-1 text-[16px]">
          Company
          <DeskInput className="h-11 text-[16px]" value={company} onChange={(event) => setCompany(event.target.value)} />
        </label>
        <label className="grid gap-1 text-[16px]">
          Contact name
          <DeskInput className="h-11 text-[16px]" value={contact} onChange={(event) => setContact(event.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-[16px]">
            Phone
            <DeskInput className="h-11 text-[16px]" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="grid gap-1 text-[16px]">
            Email
            <DeskInput className="h-11 text-[16px]" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        </div>
        <label className="grid gap-1 text-[16px]">
          Short description
          <DeskInput className="h-11 text-[16px]" value={project} onChange={(event) => setProject(event.target.value)} placeholder="One transformer, Singapore to Batangas" />
        </label>
        <label className="grid gap-1 text-[16px]">
          Paste the email, if you have it
          <DeskText className="min-h-28 text-[16px]" value={paste} onChange={(event) => setPaste(event.target.value)} />
        </label>
        <div className="grid gap-3">
          <p className="text-[16px] font-medium">Pieces, if you already know them</p>
          <p className="text-[13px] text-zinc-600">
            Partial rows are kept as provisional. Missing length, width, height, or weight stays on the checklist.
          </p>
          {pieces.map((piece, index) => (
            <div key={index} className="grid gap-2 border border-zinc-200 p-3 sm:grid-cols-3">
              <DeskInput className="h-11 sm:col-span-3" aria-label={`Piece ${index + 1} description`} placeholder="Description" value={piece.description} onChange={(event) => setPieces((rows) => rows.map((row, i) => (i === index ? { ...row, description: event.target.value } : row)))} />
              <DeskInput className="h-11" inputMode="decimal" aria-label="Length metres" placeholder="L m" value={piece.lengthM} onChange={(event) => setPieces((rows) => rows.map((row, i) => (i === index ? { ...row, lengthM: event.target.value } : row)))} />
              <DeskInput className="h-11" inputMode="decimal" aria-label="Width metres" placeholder="W m" value={piece.widthM} onChange={(event) => setPieces((rows) => rows.map((row, i) => (i === index ? { ...row, widthM: event.target.value } : row)))} />
              <DeskInput className="h-11" inputMode="decimal" aria-label="Height metres" placeholder="H m" value={piece.heightM} onChange={(event) => setPieces((rows) => rows.map((row, i) => (i === index ? { ...row, heightM: event.target.value } : row)))} />
              <DeskInput className="h-11" inputMode="decimal" aria-label="Weight kg" placeholder="kg each" value={piece.weightKg} onChange={(event) => setPieces((rows) => rows.map((row, i) => (i === index ? { ...row, weightKg: event.target.value } : row)))} />
            </div>
          ))}
          <button type="button" className="min-h-11 self-start border border-zinc-300 px-3 text-[16px]" onClick={() => setPieces((rows) => [...rows, { description: "", qty: "1", lengthM: "", widthM: "", heightM: "", weightKg: "" }])}>
            Add another piece
          </button>
        </div>
        {error ? <p className="text-[16px] text-rose-800">{error}</p> : null}
        <button type="button" className="min-h-12 bg-zinc-950 px-4 text-[16px] text-white" onClick={save}>
          Save inquiry
        </button>
      </div>
    </div>
  );
}
