"use client";

import { SECTION_TUTORIALS } from "@/lib/section-tutorials";
import type { InquirySectionId } from "@/lib/todos";

export function SectionTutorial({ section }: { section: InquirySectionId }) {
  const guide = SECTION_TUTORIALS[section];
  return (
    <aside
      className="no-print border border-zinc-300 bg-white p-3 sm:p-4"
      aria-label={`How to use section ${guide.number}: ${guide.title}`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex size-7 items-center justify-center border border-zinc-950 bg-zinc-950 text-[13px] font-medium text-white">
          {guide.number}
        </span>
        <h2 className="text-[16px] font-medium text-zinc-950">How to use this section</h2>
        <span className="text-[13px] text-zinc-500">{guide.title}</span>
      </div>
      <p className="mt-2 text-[14px] leading-snug text-zinc-700">{guide.why}</p>
      <ol className="mt-3 grid gap-2">
        {guide.steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-[14px] leading-snug text-zinc-800">
            <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center border border-zinc-400 text-[11px] font-medium text-zinc-700">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
