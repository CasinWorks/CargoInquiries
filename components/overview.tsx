"use client";

import Link from "next/link";
import { staffName } from "@/lib/labels";
import { inquiryTodos } from "@/lib/todos";
import { PageTitle, SampleMark } from "@/components/bits";
import { Tip } from "@/components/shell";
import { statusLabel, STATUSES } from "@/lib/labels";
import { deskStats } from "@/lib/stats";
import { useDesk } from "@/lib/store";
import { formatDay } from "@/lib/time";

export function Overview() {
  const desk = useDesk();
  const stats = deskStats(desk.inquiries, desk.today);
  const mean = stats.meanDays == null ? "—" : stats.meanDays.toFixed(1);

  return (
    <div>
      <PageTitle kicker="Team desk" title="Overview">
        Counts come from the inquiries saved in this browser. Sample jobs are marked SAMPLE. They are not Interfreight’s book of business.
      </PageTitle>
      <p className="mb-4">
        <Link href="/inquiries/new" data-tour="new-from-call" className="inline-flex min-h-11 items-center bg-zinc-950 px-4 text-[16px] text-white">
          New inquiry from email or call
        </Link>
      </p>
      <Tip id="overview">
        You are on the team desk. Use Search in the top bar for a reference, company, or city. Open a sample, then use View as Customer to send one yourself. Nothing is emailed.
      </Tip>
      <div className="flex flex-wrap gap-x-5 gap-y-3 border-y border-zinc-200 py-3" data-tour="pipeline">
        {STATUSES.map((status) => (
          <Link key={status.id} href={`/inquiries?status=${status.id}`} className="group">
            <span className="text-[18px] font-medium text-zinc-950">{stats.byStatus[status.id]}</span>
            <span className="ml-1.5 text-[12px] text-zinc-600 group-hover:text-zinc-950">{status.label}</span>
          </Link>
        ))}
      </div>
      <p className="mt-3 max-w-3xl text-[12px] leading-relaxed text-zinc-500">
        Mean time to first quote: {mean} days, on {stats.quotedCount} inquiries that were marked sent. Closed as won or lost:{" "}
        {stats.won} won, {stats.lost} lost. Demo figures only.
      </p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section data-tour="waiting">
          <h2 className="text-[15px] font-medium text-zinc-950">Waiting on information</h2>
          <Queue
            empty="No open inquiry has a needed item on the checklist."
            rows={stats.needing.map((inquiry) => ({
              href: `/inquiries/${inquiry.id}`,
              title: inquiry.projectName,
              meta: `${inquiry.reference}${inquiry.sample ? " · SAMPLE" : ""} · ${inquiry.company}`,
            }))}
          />
        </section>
        <section data-tour="followups">
          <h2 className="text-[15px] font-medium text-zinc-950">Sign-off, follow-up, validity</h2>
          <h3 className="mt-3 text-[12px] font-medium tracking-[0.04em] text-zinc-500 uppercase">Awaiting sign-off</h3>
          <Queue
            empty="Nothing is waiting on a manager."
            rows={stats.awaiting.map((inquiry) => ({
              href: `/inquiries/${inquiry.id}#quote`,
              title: inquiry.projectName,
              meta: inquiry.reference,
            }))}
          />
          <h3 className="mt-4 text-[12px] font-medium tracking-[0.04em] text-zinc-500 uppercase">Follow-up due</h3>
          <Queue
            empty="No follow-up is due."
            rows={stats.followUps.map((inquiry) => ({
              href: `/inquiries/${inquiry.id}`,
              title: inquiry.projectName,
              meta: `${inquiry.reference} · ${formatDay(inquiry.followUpDate)}${inquiry.followUpWho ? ` · ${staffName(inquiry.followUpWho)}` : ""} · ${inquiryTodos(inquiry, desk.today).summary}`,
            }))}
          />
          <h3 className="mt-4 text-[12px] font-medium tracking-[0.04em] text-zinc-500 uppercase">Validity inside 7 days</h3>
          <Queue
            empty="No sent quote expires in the next 7 days."
            rows={stats.expiring.map((inquiry) => ({
              href: `/inquiries/${inquiry.id}#quote`,
              title: inquiry.projectName,
              meta: inquiry.reference,
            }))}
          />
        </section>
      </div>
      <section className="mt-8">
        <h2 className="mb-2 text-[15px] font-medium text-zinc-950">Recently updated</h2>
        <div className="overflow-x-auto border border-zinc-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-[11px] font-medium tracking-[0.04em] text-zinc-500 uppercase">
                <th scope="col" className="px-2 py-2 font-medium">Reference</th>
                <th scope="col" className="px-2 py-2 font-medium">Project</th>
                <th scope="col" className="px-2 py-2 font-medium">Stage</th>
                <th scope="col" className="px-2 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-zinc-100">
                  <td className="px-2 py-2 font-mono text-[12px]">
                    <Link href={`/inquiries/${inquiry.id}`} className="text-[#1e3a5f] hover:underline">
                      {inquiry.reference}
                    </Link>
                  </td>
                  <td className="px-2 py-2">
                    {inquiry.projectName}
                    {inquiry.sample ? <SampleMark /> : null}
                    <p className="mt-1 text-[12px] text-zinc-600">{inquiryTodos(inquiry, desk.today).summary}</p>
                  </td>
                  <td className="px-2 py-2">{statusLabel(inquiry.status)}</td>
                  <td className="px-2 py-2 text-zinc-600">{formatDay(inquiry.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Queue({ rows, empty }: { rows: { href: string; title: string; meta: string }[]; empty: string }) {
  if (rows.length === 0) return <p className="mt-2 text-[13px] text-zinc-500">{empty}</p>;
  return (
    <ul className="mt-2 divide-y divide-zinc-200 border-y border-zinc-200">
      {rows.map((row) => (
        <li key={row.href + row.title}>
          <Link href={row.href} className="block py-2 hover:bg-white">
            <span className="block text-[13px] text-zinc-950">{row.title}</span>
            <span className="block text-[12px] text-zinc-500">{row.meta}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
