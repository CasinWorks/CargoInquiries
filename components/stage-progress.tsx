import { formatDay } from "@/lib/time";
import { inquiryProgress } from "@/lib/progress";
import type { Inquiry } from "@/lib/types";

export function StageProgress({
  inquiry,
  audience,
  onChooseStage,
}: {
  inquiry: Inquiry;
  audience: "team" | "customer";
  onChooseStage?: (stageId: string) => void;
}) {
  const progress = inquiryProgress(inquiry, audience);
  const fill = Math.round((progress.stepNumber / progress.total) * 100);
  const ended = progress.ended === "lost" || progress.ended === "expired";

  return (
    <section className="border border-zinc-300 bg-white p-3 sm:p-4" data-tour="progress" aria-label="Where this inquiry is now">
      <div className="sm:hidden">
        <p className="text-[15px] font-medium text-zinc-950">
          Step {progress.stepNumber} of {progress.total}
          <span className="font-normal text-zinc-700"> · {progress.shortLabel}</span>
        </p>
        <div className="mt-2 h-2 bg-zinc-200" aria-hidden>
          <div className={ended ? "h-2 bg-rose-900" : "h-2 bg-zinc-900"} style={{ width: `${fill}%` }} />
        </div>
        <p className="mt-2 text-[16px] leading-snug text-zinc-800">{progress.now}</p>
      </div>
      <ol className="hidden gap-2 sm:grid" style={{ gridTemplateColumns: `repeat(${progress.total}, minmax(0, 1fr))` }}>
        {progress.stages.map((stage) => (
          <li key={stage.id} className="min-w-0" aria-current={stage.state === "current" || stage.state === "ended" ? "step" : undefined}>
            {onChooseStage && stage.state !== "current" ? (
              <button type="button" className="mb-1 text-left text-[12px] text-[#1e3a5f] underline" onClick={() => onChooseStage(stage.id)}>
                Move here
              </button>
            ) : null}
            <div
              className={
                stage.state === "future"
                  ? "h-1.5 bg-zinc-200"
                  : stage.state === "ended"
                    ? "h-1.5 bg-rose-900"
                    : "h-1.5 bg-zinc-900"
              }
            />
            <p
              className={
                stage.state === "future"
                  ? "mt-2 text-[13px] leading-tight text-zinc-400"
                  : stage.state === "ended"
                    ? "mt-2 text-[13px] leading-tight font-medium text-rose-950"
                    : "mt-2 text-[13px] leading-tight font-medium text-zinc-950"
              }
            >
              {stage.state === "done" && !(stage.id === "checking" && !stage.reachedAt) ? (
                <span className="mr-1 inline-block" aria-hidden>
                  <Check />
                </span>
              ) : null}
              {stage.label}
            </p>
            <p className="text-[12px] text-zinc-500">
              {stage.state === "future"
                ? "Not yet"
                : stage.reachedAt
                  ? formatDay(stage.reachedAt)
                  : stage.state === "current"
                    ? "Now"
                    : stage.id === "checking"
                      ? "Not needed"
                      : ""}
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-3 hidden text-[16px] leading-snug text-zinc-800 sm:block">{progress.now}</p>
      {onChooseStage && progress.ended == null && progress.stepNumber < progress.total ? (
        <button
          type="button"
          className="mt-3 min-h-11 bg-zinc-950 px-4 text-[16px] text-white"
          onClick={() => onChooseStage(progress.stages[progress.stepNumber].id)}
        >
          {progress.stages[progress.stepNumber].id === "result"
            ? "Record the result"
            : `Move to next stage: ${progress.stages[progress.stepNumber].label}`}
        </button>
      ) : null}
    </section>
  );
}

export function RowProgress({ inquiry }: { inquiry: Inquiry }) {
  const progress = inquiryProgress(inquiry, "team");
  const fill = Math.round((progress.stepNumber / progress.total) * 100);
  const ended = progress.ended === "lost" || progress.ended === "expired";
  return (
    <div className="mt-1">
      <div className="h-1.5 w-24 bg-zinc-200" aria-hidden>
        <div className={ended ? "h-1.5 bg-rose-900" : "h-1.5 bg-zinc-800"} style={{ width: `${fill}%` }} />
      </div>
      <p className="mt-0.5 text-[12px] text-zinc-600">
        {progress.stepNumber}/{progress.total} {progress.shortLabel}
      </p>
    </div>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="inline align-text-bottom" aria-hidden>
      <path d="M2 6.2 4.6 9 10 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
