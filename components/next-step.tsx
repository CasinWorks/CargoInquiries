"use client";

import { focusTarget, inquiryTodos, type TodoAction } from "@/lib/todos";
import type { Inquiry } from "@/lib/types";

export function NextStepPanel({
  inquiry,
  today,
  audience,
  onAction,
}: {
  inquiry: Inquiry;
  today: string;
  audience: "team" | "customer";
  onAction?: (action: TodoAction) => void;
}) {
  const todos = inquiryTodos(inquiry, today, audience);
  function go(item: (typeof todos.items)[number]) {
    if (item.action && onAction) onAction(item.action);
    focusTarget(item.target);
  }
  return (
    <section className="border border-zinc-300 bg-white p-3 sm:p-4" data-tour="next-step" aria-label="What is missing and the next step">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[18px] font-medium text-zinc-950">What is missing / Next step</h2>
        <span className="border border-zinc-300 px-2 py-1 text-[15px] text-zinc-800">{todos.summary}</span>
      </div>
      {todos.complete ? (
        <div className="mt-3">
          <p className="text-[16px] leading-snug text-zinc-800">All details complete. Next: {todos.nextLabel}</p>
          {todos.items[0] ? (
            <button type="button" className="mt-3 min-h-11 bg-zinc-950 px-4 text-[16px] text-white" onClick={() => go(todos.items[0])}>
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
              <button type="button" className="min-h-11 w-full border border-zinc-200 px-3 text-left text-[16px] leading-snug text-zinc-950 hover:bg-zinc-50" onClick={() => go(item)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
