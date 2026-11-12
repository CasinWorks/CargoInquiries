"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageTitle, SampleMark } from "@/components/bits";
import { Tip } from "@/components/shell";
import { statusLabel } from "@/lib/labels";
import { useDesk } from "@/lib/store";
import { formatDay } from "@/lib/time";

export function CustomerHome() {
  const desk = useDesk();
  const mine = desk.inquiries.filter((inquiry) => !inquiry.sample);

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle kicker="Customer" title="Your inquiries">
        Sent from this browser. The team desk reads the same saved set. Sample jobs stay on the team side.
      </PageTitle>
      <Tip id="customer">
        An inquiry you send here appears for the Interfreight team view in this same browser. Nothing is emailed.
      </Tip>
      <div className="mb-4">
        <Button asChild size="sm">
          <Link href="/customer/new">New inquiry</Link>
        </Button>
      </div>
      {mine.length === 0 ? (
        <p className="text-[13px] text-zinc-600">No inquiry has been sent from this browser yet.</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase">
                <th scope="col" className="px-2 py-2 font-medium">Reference</th>
                <th scope="col" className="px-2 py-2 font-medium">Project</th>
                <th scope="col" className="px-2 py-2 font-medium">Stage</th>
                <th scope="col" className="px-2 py-2 font-medium">Ready</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-zinc-100">
                  <td className="px-2 py-2 font-mono text-[12px]">
                    <Link href={`/customer/${inquiry.id}`} className="text-[#1e3a5f] hover:underline">
                      {inquiry.reference}
                    </Link>
                  </td>
                  <td className="px-2 py-2">
                    {inquiry.projectName}
                    {inquiry.sample ? <SampleMark /> : null}
                  </td>
                  <td className="px-2 py-2">{statusLabel(inquiry.status)}</td>
                  <td className="px-2 py-2">{formatDay(inquiry.cargoReady)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
