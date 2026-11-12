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
    <section
      className="border border-zinc-300 bg-white p-3 sm:p-4"
      data-tour="progress"
      aria-label="Where this inquiry is now"
    >
      <div className="sm:hidden">
        <p className="text-[15px] font-medium text-zinc-950">
          Step {progress.stepNumber} of {progress.total}
          <span className="font-normal text-zinc-700"> · {progress.shortLabel}</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden bg-zinc-200" aria-hidden>
          <div
            className={`h-2 transition-[width,background-color] duration-500 ease-out ${ended ? "bg-rose-900" : "bg-zinc-900"}`}
            style={{ width: `${fill}%` }}
          />
        </div>
        <p
          key={progress.now}
          className="mt-2 min-h-[3rem] animate-[desk-fade-in_320ms_ease-out] text-[16px] leading-snug text-zinc-800"
        >
          {progress.now}
        </p>
      </div>
      <ol
        className="hidden gap-x-2 sm:grid"
        style={{ gridTemplateColumns: `repeat(${progress.total}, minmax(0, 1fr))` }}
      >
        {progress.stages.map((stage) => (
          <li
            key={stage.id}
            className="grid min-h-[7.5rem] min-w-0 grid-rows-[1.5rem_0.375rem_2.75rem_1.25rem] gap-y-2 transition-colors duration-300"
            aria-current={stage.state === "current" || stage.state === "ended" ? "step" : undefined}
          >
            <div className="flex items-start">
              {onChooseStage && stage.state !== "current" && stage.state !== "ended" ? (
                <button
                  type="button"
                  className="text-left text-[12px] leading-tight text-[#1e3a5f] underline transition-opacity duration-200"
                  onClick={() => onChooseStage(stage.id)}
                >
                  Move here
                </button>
              ) : (
                <span className="text-[12px] leading-tight text-transparent" aria-hidden>
                  Move here
                </span>
              )}
            </div>
            <div
              className={
                stage.state === "future"
                  ? "h-1.5 bg-zinc-200 transition-colors duration-500 ease-out"
                  : stage.state === "ended"
                    ? "h-1.5 bg-rose-900 transition-colors duration-500 ease-out"
                    : "h-1.5 bg-zinc-900 transition-colors duration-500 ease-out"
              }
            />
            <p
              className={
                stage.state === "future"
                  ? "text-[13px] leading-tight text-zinc-400 transition-colors duration-300"
                  : stage.state === "ended"
                    ? "text-[13px] leading-tight font-medium text-rose-950 transition-colors duration-300"
                    : "text-[13px] leading-tight font-medium text-zinc-950 transition-colors duration-300"
              }
            >
              {stage.state === "done" && !(stage.id === "checking" && !stage.reachedAt) ? (
                <span className="mr-1 inline-block animate-[desk-fade-in_280ms_ease-out]" aria-hidden>
                  <Check />
                </span>
              ) : null}
              {stage.label}
            </p>
            <p className="text-[12px] leading-tight text-zinc-500 transition-colors duration-300">
              {stage.state === "future"
                ? "Not yet"
                : stage.reachedAt
                  ? formatDay(stage.reachedAt)
                  : stage.state === "current"
                    ? "Now"
                    : stage.id === "checking"
                      ? "Not needed"
                      : "\u00a0"}
            </p>
          </li>
        ))}
      </ol>
      <p
        key={progress.now}
        className="mt-3 hidden min-h-[3rem] animate-[desk-fade-in_320ms_ease-out] text-[16px] leading-snug text-zinc-800 sm:block"
      >
        {progress.now}
      </p>
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
      <div className="h-1.5 w-24 overflow-hidden bg-zinc-200" aria-hidden>
        <div
          className={`h-1.5 transition-[width,background-color] duration-500 ease-out ${ended ? "bg-rose-900" : "bg-zinc-800"}`}
          style={{ width: `${fill}%` }}
        />
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
