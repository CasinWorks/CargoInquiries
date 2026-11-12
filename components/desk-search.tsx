"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { DeskInput } from "@/components/bits";
import { statusLabel } from "@/lib/labels";
import { searchInquiries } from "@/lib/stats";
import { useDesk } from "@/lib/store";

export function DeskSearch() {
  const desk = useDesk();
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = searchInquiries(desk.inquiries, q, 8);

  useEffect(() => {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q]);

  function goList() {
    const value = q.trim();
    setOpen(false);
    router.push(value ? `/inquiries?q=${encodeURIComponent(value)}` : "/inquiries");
  }

  function goResult(id: string) {
    setOpen(false);
    setQ("");
    router.push(`/inquiries/${id}`);
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:max-w-56 md:max-w-64 lg:max-w-72" data-tour="desk-search">
      <label className="sr-only" htmlFor="desk-search">
        Search inquiries
      </label>
      <DeskInput
        id="desk-search"
        value={q}
        role="combobox"
        aria-expanded={open && q.trim().length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
        placeholder="Search jobs…"
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQ(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            return;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
            return;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((value) => Math.max(value - 1, 0));
            return;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && results[active]) goResult(results[active].id);
            else goList();
          }
        }}
      />
      {open && q.trim() ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-80 overflow-auto border border-zinc-300 bg-white shadow-sm"
        >
          {results.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-zinc-600">No job matches “{q.trim()}”.</p>
          ) : (
            <ul>
              {results.map((inquiry, index) => (
                <li key={inquiry.id} role="option" id={`${listId}-${inquiry.id}`} aria-selected={index === active}>
                  <button
                    type="button"
                    className={
                      index === active
                        ? "grid w-full gap-0.5 bg-zinc-100 px-3 py-2 text-left"
                        : "grid w-full gap-0.5 px-3 py-2 text-left hover:bg-zinc-50"
                    }
                    onMouseEnter={() => setActive(index)}
                    onClick={() => goResult(inquiry.id)}
                  >
                    <span className="font-mono text-[11px] text-zinc-500">{inquiry.reference}</span>
                    <span className="truncate text-[13px] text-zinc-950">{inquiry.projectName}</span>
                    <span className="truncate text-[12px] text-zinc-600">
                      {inquiry.company} · {statusLabel(inquiry.status)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/inquiries?q=${encodeURIComponent(q.trim())}`}
            className="block border-t border-zinc-200 px-3 py-2 text-[12px] text-[#1e3a5f] hover:bg-zinc-50"
            onClick={() => setOpen(false)}
          >
            See all matches on Inquiries
          </Link>
        </div>
      ) : null}
    </div>
  );
}
