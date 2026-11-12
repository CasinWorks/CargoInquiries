"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDesk } from "@/lib/store";
import { HelpMenu, TourRoot } from "@/components/tour";

const TEAM_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/inquiries", label: "Inquiries" },
  { href: "/customer", label: "Customer form" },
  { href: "/handbook", label: "Handbook" },
  { href: "/guide", label: "How to read this" },
];

export function Shell({
  mode,
  children,
}: {
  mode: "team" | "customer";
  children: ReactNode;
}) {
  const desk = useDesk();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  if (!desk.ready) {
    return <p className="px-6 py-10 text-[13px] text-zinc-600">Loading the desk…</p>;
  }

  function go(role: "customer" | "team") {
    desk.setRole(role);
    setMenu(false);
    router.push(role === "team" ? "/" : "/customer");
  }

  return (
    <TourRoot mode={mode}>
    <div className="min-h-screen">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-2 focus:py-1"
      >
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-20 border-b border-zinc-200 bg-white">
        <div className="flex h-12 items-center gap-2 px-3 sm:gap-3 sm:px-4">
          <Link href={mode === "team" ? "/" : "/customer"} className="shrink-0 whitespace-nowrap">
            <span className="font-mono text-[11px] tracking-wide text-zinc-500">PCD</span>
            <span className="ml-2 text-[13px] font-medium text-zinc-950 sm:text-[14px]">Project Cargo Desk</span>
          </Link>
          <p className="hidden truncate text-[12px] text-zinc-500 md:block">Prepared for Interfreight Group (demo)</p>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <HelpMenu mode={mode} />
            <div className="flex items-center gap-2 text-[12px]" data-tour="view-as" role="group" aria-label="View as">
              <span className="hidden text-zinc-500 sm:inline">View as</span>
              <button
                type="button"
                onClick={() => go("customer")}
                aria-pressed={mode === "customer"}
                className={
                  mode === "customer"
                    ? "border-b border-zinc-950 text-zinc-950"
                    : "text-zinc-500 hover:text-zinc-950"
                }
              >
                Customer
              </button>
              <span className="text-zinc-300" aria-hidden>
                /
              </span>
              <button
                type="button"
                onClick={() => go("team")}
                aria-pressed={mode === "team"}
                className={
                  mode === "team" ? "border-b border-zinc-950 text-zinc-950" : "text-zinc-500 hover:text-zinc-950"
                }
              >
                <span className="sm:hidden">Team</span>
                <span className="hidden sm:inline">Interfreight team</span>
              </button>
            </div>
            {mode === "team" ? (
              <button
                type="button"
                className="text-[12px] text-zinc-700 lg:hidden"
                aria-expanded={menu}
                aria-controls="desk-nav"
                onClick={() => setMenu((open) => !open)}
              >
                {menu ? "Close" : "Menu"}
              </button>
            ) : null}
          </div>
        </div>
        {menu && mode === "team" ? (
          <nav id="desk-nav" className="border-t border-zinc-200 px-4 py-2 lg:hidden" aria-label="Desk">
            {TEAM_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-1.5 text-[13px] text-zinc-800"
                onClick={() => setMenu(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <div className="flex">
        {mode === "team" ? (
          <aside className="no-print sticky top-12 hidden h-[calc(100vh-3rem)] w-48 shrink-0 border-r border-zinc-200 bg-zinc-100 lg:block">
            <nav className="grid gap-0.5 p-3" aria-label="Desk">
              {TEAM_LINKS.map((link) => {
                const active = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "border border-zinc-200 bg-white px-2 py-1.5 text-[13px] text-zinc-950"
                        : "px-2 py-1.5 text-[13px] text-zinc-700 hover:bg-white"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        ) : null}
        <div className="min-w-0 flex-1">
          <main id="content" className="px-4 py-5 lg:px-8 lg:py-6">
            {children}
          </main>
          <footer className="no-print border-t border-zinc-200 px-4 py-4 text-[12px] leading-relaxed text-zinc-500 lg:px-8">
            <p>Demo build by CasinWorks · Christian Joshua Casin</p>
            <p className="mt-1">
              Prepared for Interfreight Group. Fictional sample data only. Not Interfreight’s system, rates, customers, or logo.
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <button type="button" className="underline" data-tour="reset" onClick={() => setResetOpen(true)}>
                Reset demo data
              </button>
              <button type="button" className="underline" onClick={() => desk.resetTips()}>
                Show tips again
              </button>
              <Link href="/guide" className="underline">
                How to read this demo
              </Link>
            </p>
          </footer>
        </div>
      </div>
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demo data</DialogTitle>
            <DialogDescription>
              This puts the 11 sample inquiries back and removes anything you added in this browser. It does not email anyone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                desk.resetDemo();
                setResetOpen(false);
              }}
            >
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TourRoot>
  );
}

export function Tip({ id, children }: { id: string; children: ReactNode }) {
  const desk = useDesk();
  if (!desk.ready || desk.tipsDismissed[id]) return null;
  return (
    <div className="no-print mb-4 flex items-start justify-between gap-4 border border-zinc-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-zinc-700">
      <p>{children}</p>
      <button type="button" className="shrink-0 text-[12px] text-zinc-500 underline" onClick={() => desk.dismissTip(id)}>
        Dismiss
      </button>
    </div>
  );
}
