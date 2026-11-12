"use client";

import { focusTarget, inquiryTodos, type TodoAction, type TodoItem } from "@/lib/todos";
import type { Inquiry } from "@/lib/types";

export function NextStepPanel({
  inquiry,
  today,
  audience,
  onAction,
  onOpenItem,
}: {
  inquiry: Inquiry;
  today: string;
  audience: "team" | "customer";
  onAction?: (action: TodoAction) => void;
  onOpenItem?: (item: TodoItem) => void;
}) {
  const todos = inquiryTodos(inquiry, today, audience);
  const actionable = todos.items.filter((item) => item.kind !== "next" || item.target || item.action);
  const nextOnly = todos.items.find((item) => item.kind === "next");
  function go(item: (typeof todos.items)[number]) {
    if (item.action && onAction) onAction(item.action);
    if (onOpenItem) onOpenItem(item);
    else focusTarget(item.target);
  }
  return (
    <section className="border border-zinc-300 bg-white p-3 sm:p-4" data-tour="next-step" aria-label="What is missing and the next step">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[18px] font-medium text-zinc-950">What is missing / Next step</h2>
        <span className="border border-zinc-300 px-2 py-1 text-[15px] text-zinc-800">{todos.summary}</span>
      </div>
      <p className="mt-2 text-[14px] leading-snug text-zinc-600">
        Click a line to jump to the field and fill it in. Centre of gravity, lifting points, and drawings are optional extras — they do not block you from moving on.
      </p>
      {todos.complete ? (
        <div className="mt-3">
          <p className="text-[16px] leading-snug text-zinc-800">{todos.summary}</p>
          {actionable.length > 1 ? (
            <ul className="mt-3 grid gap-2">
              {actionable.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      item.kind === "additional"
                        ? "min-h-11 w-full border border-dashed border-zinc-300 px-3 text-left text-[16px] leading-snug text-zinc-700 hover:bg-zinc-50"
                        : "min-h-11 w-full border border-zinc-200 px-3 text-left text-[16px] leading-snug text-zinc-950 hover:bg-zinc-50"
                    }
                    onClick={() => go(item)}
                  >
                    {item.kind === "next" ? item.label.replace(/^Next:\s*/, "") : item.label}
                    {item.kind !== "next" ? (
                      <span className="mt-0.5 block text-[13px] text-zinc-500">Opens the field below</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : nextOnly ? (
            <button type="button" className="mt-3 min-h-11 bg-zinc-950 px-4 text-[16px] text-white" onClick={() => go(nextOnly)}>
              {todos.nextLabel}
            </button>
          ) : null}
        </div>
      ) : todos.items.length === 0 ? (
        <p className="mt-3 text-[16px] text-zinc-700">{todos.summary}</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {todos.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.kind === "additional"
                    ? "min-h-11 w-full border border-dashed border-zinc-300 px-3 text-left text-[16px] leading-snug text-zinc-700 hover:bg-zinc-50"
                    : "min-h-11 w-full border border-zinc-200 px-3 text-left text-[16px] leading-snug text-zinc-950 hover:bg-zinc-50"
                }
                onClick={() => go(item)}
              >
                {item.label}
                {item.kind !== "next" ? (
                  <span className="mt-0.5 block text-[13px] text-zinc-500">Opens the field below</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
