"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTitle, SampleMark } from "@/components/bits";
import { Tip } from "@/components/shell";
import { DeskInput, DeskSelect } from "@/components/bits";
import { shipmentTotals } from "@/lib/calc";
import { formatFixed } from "@/lib/format";
import { isClosed, MODES, modeLabel, statusLabel, STATUSES } from "@/lib/labels";
import { factsFromInquiry, neededGaps } from "@/lib/missing";
import { matchesQuery } from "@/lib/stats";
import { useDesk } from "@/lib/store";
import { formatDay } from "@/lib/time";
import type { Mode, Status } from "@/lib/types";

export function InquiryList() {
  const desk = useDesk();
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const status = params.get("status") ?? "";
  const mode = params.get("mode") ?? "";
  const follow = params.get("follow") === "1";
  const gaps = params.get("gaps") === "1";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/inquiries?${next.toString()}`);
  }

  const rows = desk.inquiries.filter((inquiry) => {
    if (q && !matchesQuery(inquiry, q)) return false;
    if (status && inquiry.status !== status) return false;
    if (mode && inquiry.mode !== mode) return false;
    if (follow && !(inquiry.followUpDate && desk.today && inquiry.followUpDate <= desk.today && !isClosed(inquiry.status))) {
      return false;
    }
    if (gaps && neededGaps(factsFromInquiry(inquiry)).length === 0) return false;
    return true;
  });

  return (
    <div>
      <PageTitle kicker="Team desk" title="Inquiries">
        Search looks at the reference, company, project, commodity, contact, and the cities or ports.
      </PageTitle>
      <Tip id="list">SAMPLE marks a fictional job. An inquiry you send as a customer is not marked SAMPLE.</Tip>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Search
          <DeskInput
            value={q}
            onChange={(event) => setParam("q", event.target.value)}
            placeholder="PCD, company, Batangas…"
            aria-label="Search inquiries"
            className="w-56"
          />
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Stage
          <DeskSelect value={status} onChange={(event) => setParam("status", event.target.value)} aria-label="Filter by stage" className="w-44">
            <option value="">All stages</option>
            {STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </DeskSelect>
        </label>
        <label className="grid gap-1 text-[12px] text-zinc-600">
          Mode
          <DeskSelect value={mode} onChange={(event) => setParam("mode", event.target.value)} aria-label="Filter by mode" className="w-52">
            <option value="">All modes</option>
            {MODES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </DeskSelect>
        </label>
        <label className="flex items-center gap-2 pb-1 text-[13px] text-zinc-700">
          <input type="checkbox" checked={follow} onChange={(event) => setParam("follow", event.target.checked ? "1" : "")} />
          Follow-up due
        </label>
        <label className="flex items-center gap-2 pb-1 text-[13px] text-zinc-700">
          <input type="checkbox" checked={gaps} onChange={(event) => setParam("gaps", event.target.checked ? "1" : "")} />
          Still missing info
        </label>
      </div>
      <p className="mt-3 text-[12px] text-zinc-500">
        {rows.length} {rows.length === 1 ? "inquiry" : "inquiries"}
      </p>
      <p className="mt-1 text-[12px] text-zinc-500 lg:hidden">Scroll sideways for lane, ready date, and freight tons.</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-zinc-600">No inquiry matches that filter.</p>
      ) : (
        <div className="mt-2 overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full min-w-[880px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase">
                <th scope="col" className="px-2 py-2 font-medium">Reference</th>
                <th scope="col" className="px-2 py-2 font-medium">Project</th>
                <th scope="col" className="px-2 py-2 font-medium">Company</th>
                <th scope="col" className="px-2 py-2 font-medium">Stage</th>
                <th scope="col" className="px-2 py-2 font-medium">Lane</th>
                <th scope="col" className="px-2 py-2 font-medium">Ready</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Freight tons</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inquiry) => {
                const totals = shipmentTotals(inquiry.pieces);
                return (
                  <tr key={inquiry.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-2 py-2 font-mono text-[12px]">
                      <Link href={`/inquiries/${inquiry.id}`} className="text-[#1e3a5f] hover:underline">
                        {inquiry.reference}
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      <Link href={`/inquiries/${inquiry.id}`} className="text-zinc-950 hover:underline">
                        {inquiry.projectName}
                      </Link>
                      {inquiry.sample ? <SampleMark /> : null}
                    </td>
                    <td className="px-2 py-2">{inquiry.company}</td>
                    <td className="px-2 py-2">{statusLabel(inquiry.status as Status)}</td>
                    <td className="px-2 py-2 text-zinc-600">
                      {inquiry.origin.city || "—"} → {inquiry.destination.city || "—"}
                      <span className="block text-[12px] text-zinc-500">{modeLabel(inquiry.mode as Mode | "")}</span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2">{formatDay(inquiry.cargoReady)}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-right">{totals.counted ? formatFixed(totals.freightTons, 2) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
