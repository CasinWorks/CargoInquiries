"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CUSTOMER_TOUR, TEAM_TOUR, type TourSide, type TourStep } from "@/lib/tour-steps";

const OFFER_KEY = "pcd-tour-offer-v1";
const WELCOME_KEY = "pcd-welcome-v1";
const ACTIVE_TOUR_KEY = "pcd-tour-active-v1";

type OfferState = { customer?: string; team?: string };

type ActiveTour = { side: TourSide; index: number };

type TourContextValue = {
  start: (side: TourSide) => void;
  showWelcome: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside TourRoot");
  return value;
}

function readOffer(): OfferState {
  try {
    return JSON.parse(localStorage.getItem(OFFER_KEY) || "{}") as OfferState;
  } catch {
    return {};
  }
}

function writeOffer(side: TourSide) {
  const next = { ...readOffer(), [side]: "dismissed" };
  localStorage.setItem(OFFER_KEY, JSON.stringify(next));
}

function readActiveTour(): ActiveTour | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_TOUR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveTour;
    if (parsed.side !== "team" && parsed.side !== "customer") return null;
    if (!Number.isFinite(parsed.index) || parsed.index < 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeActiveTour(tour: ActiveTour | null) {
  if (!tour) sessionStorage.removeItem(ACTIVE_TOUR_KEY);
  else sessionStorage.setItem(ACTIVE_TOUR_KEY, JSON.stringify(tour));
}

function stepsFor(side: TourSide | null): TourStep[] {
  if (side === "customer") return CUSTOMER_TOUR;
  if (side === "team") return TEAM_TOUR;
  return [];
}

export function TourRoot({ mode, children }: { mode: TourSide; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const restored = useRef(false);
  const startingTour = useRef(false);
  const [side, setSide] = useState<TourSide | null>(null);
  const [index, setIndex] = useState(0);
  const [offer, setOffer] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const welcomeChecked = useRef(false);

  const steps = stepsFor(side);
  const step = steps[index];

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const active = readActiveTour();
    if (!active) return;
    const list = stepsFor(active.side);
    if (!list.length) {
      writeActiveTour(null);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore tour after Shell remounts on navigation
    setSide(active.side);
    setIndex(Math.min(active.index, list.length - 1));
    setWelcome(false);
    setOffer(false);
  }, []);

  useEffect(() => {
    if (side) writeActiveTour({ side, index });
  }, [side, index]);

  useEffect(() => {
    const stored = readOffer();
    const quiet = pathname.startsWith("/handbook") || pathname.startsWith("/guide");
    const seen = localStorage.getItem(WELCOME_KEY) === "dismissed";
    const active = readActiveTour();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is read after mount
    setOffer(!quiet && !stored[mode] && seen && !active && !side);
    if (!welcomeChecked.current) {
      welcomeChecked.current = true;
      setWelcome(!seen && !active);
    }
  }, [mode, pathname, side]);

  useEffect(() => {
    if (!step) return;
    if (step.route && pathname !== step.route) router.push(step.route);
    if (step.wizardStep != null) {
      window.dispatchEvent(new CustomEvent("pcd-wizard-step", { detail: step.wizardStep }));
    }
    window.dispatchEvent(new CustomEvent("pcd-inquiry-section", { detail: step.target }));
  }, [step, pathname, router]);

  function dismissWelcome() {
    localStorage.setItem(WELCOME_KEY, "dismissed");
    setWelcome(false);
  }

  function begin(next: TourSide) {
    startingTour.current = true;
    dismissWelcome();
    writeOffer(next);
    setOffer(false);
    setIndex(0);
    setSide(next);
    writeActiveTour({ side: next, index: 0 });
    window.setTimeout(() => {
      startingTour.current = false;
    }, 0);
  }

  function close() {
    if (side) writeOffer(side);
    writeActiveTour(null);
    setSide(null);
    setIndex(0);
  }

  function setTourIndex(nextIndex: number) {
    setIndex(nextIndex);
    if (side) writeActiveTour({ side, index: nextIndex });
  }

  return (
    <TourContext.Provider value={{ start: begin, showWelcome: () => setWelcome(true) }}>
      {children}
      <WelcomeModal
        open={welcome && !side}
        onTour={() => begin(mode)}
        onClose={() => {
          if (startingTour.current) return;
          dismissWelcome();
          writeOffer(mode);
          setOffer(false);
        }}
      />
      {offer && !side && !welcome ? (
        <FirstPrompt
          mode={mode}
          onTour={() => begin(mode)}
          onLater={() => {
            writeOffer(mode);
            setOffer(false);
          }}
        />
      ) : null}
      {side && step ? (
        <Spotlight
          step={step}
          index={index}
          total={steps.length}
          onBack={() => setTourIndex(Math.max(0, index - 1))}
          onNext={() => {
            if (index >= steps.length - 1) close();
            else setTourIndex(index + 1);
          }}
          onClose={close}
        />
      ) : null}
    </TourContext.Provider>
  );
}

function WelcomeModal({ open, onTour, onClose }: { open: boolean; onTour: () => void; onClose: () => void }) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-[22px] leading-snug">Welcome to Project Cargo Desk</DialogTitle>
          <DialogDescription className="text-[16px] leading-relaxed text-zinc-800">
            A demo inquiry and quotation desk prepared for Interfreight Group.
          </DialogDescription>
        </DialogHeader>
        <p className="text-[16px] leading-relaxed text-zinc-800">Thank you for taking the time to try this.</p>
        <p className="border border-zinc-300 bg-zinc-50 px-3 py-2 text-[16px] leading-relaxed text-zinc-900">
          Demo notice. Sample data only. It is saved in this browser. Nothing is emailed or filed.
        </p>
        <p className="text-[16px] leading-relaxed text-zinc-800">
          This is a starting point. Screens, steps, fields and wording can all be changed to match Interfreight&apos;s own business process.
        </p>
        <p className="text-[14px] text-zinc-600">
          Prepared by{" "}
          <a className="text-[#1e3a5f] underline" href="https://casinworks.com">
            CasinWorks
          </a>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 bg-zinc-950 px-4 text-[16px] text-white"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onTour();
            }}
          >
            Take the tour
          </button>
          <Link href="/handbook" className="inline-flex min-h-11 items-center border border-zinc-300 px-4 text-[16px] text-zinc-950" onClick={onClose}>
            Read the handbook
          </Link>
          <button type="button" className="min-h-11 px-3 text-[16px] text-zinc-800 underline" onClick={onClose}>
            Explore on my own
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FirstPrompt({
  mode,
  onTour,
  onLater,
}: {
  mode: TourSide;
  onTour: () => void;
  onLater: () => void;
}) {
  return (
    <div className="fixed right-3 bottom-3 left-3 z-30 mx-auto max-w-xl border border-zinc-300 bg-white p-4 sm:left-auto">
      <p className="text-[16px] leading-snug font-medium text-zinc-950">New to this screen?</p>
      <p className="mt-1 text-[16px] leading-snug text-zinc-700">
        {mode === "customer"
          ? "A short tour walks through the form in everyday words. The handbook is a set of large slides, if you would rather read first."
          : "A short tour walks through the team desk in everyday words. The handbook is a set of large slides, written for someone new to freight."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="min-h-11 bg-zinc-950 px-4 text-[16px] text-white" onClick={onTour}>
          Take the tour
        </button>
        <Link href="/handbook" className="inline-flex min-h-11 items-center border border-zinc-300 px-4 text-[16px] text-zinc-950" onClick={onLater}>
          Open the handbook
        </Link>
        <button type="button" className="min-h-11 px-3 text-[16px] text-zinc-700 underline" onClick={onLater}>
          Not now
        </button>
      </div>
    </div>
  );
}

export function HelpMenu({ mode }: { mode: TourSide }) {
  const tour = useTour();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={panel}>
      <button
        type="button"
        className="min-h-9 border border-zinc-300 px-2 text-[13px] text-zinc-950"
        aria-expanded={open}
        aria-controls="help-menu"
        onClick={() => setOpen((value) => !value)}
      >
        Help
      </button>
      {open ? (
        <div id="help-menu" role="menu" className="absolute right-0 z-30 mt-1 w-56 border border-zinc-300 bg-white p-1">
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-[16px] text-zinc-950 hover:bg-zinc-100"
            onClick={() => {
              setOpen(false);
              tour.start(mode);
            }}
          >
            Take the tour
          </button>
          <Link role="menuitem" href="/handbook" className="block px-3 py-2 text-[16px] text-zinc-950 hover:bg-zinc-100" onClick={() => setOpen(false)}>
            Handbook
          </Link>
          <Link role="menuitem" href="/guide" className="block px-3 py-2 text-[16px] text-zinc-950 hover:bg-zinc-100" onClick={() => setOpen(false)}>
            How to read this
          </Link>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-2 text-left text-[16px] text-zinc-950 hover:bg-zinc-100"
            onClick={() => {
              setOpen(false);
              tour.showWelcome();
            }}
          >
            Show welcome
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Spotlight({
  step,
  index,
  total,
  onBack,
  onNext,
  onClose,
}: {
  step: TourStep;
  index: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const holeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    let stop = false;
    let found = false;
    function place() {
      if (stop) return;
      const hole = holeRef.current;
      const card = cardRef.current;
      if (!hole || !card) return;
      const target = document.querySelector(`[data-tour="${step.target}"]`);
      const cardRect = card.getBoundingClientRect();
      const mobile = window.innerWidth < 700;
      if (!target) {
        hole.style.display = "none";
        card.style.top = `${Math.max(16, (window.innerHeight - cardRect.height) / 2)}px`;
        card.style.left = "16px";
        card.style.right = "16px";
        card.style.width = "auto";
        return;
      }
      if (!found) {
        found = true;
        target.scrollIntoView({ block: "center", inline: "nearest" });
        window.requestAnimationFrame(place);
        return;
      }
      const rect = target.getBoundingClientRect();
      const pad = 6;
      hole.style.display = "block";
      hole.style.top = `${Math.max(4, rect.top - pad)}px`;
      hole.style.left = `${Math.max(4, rect.left - pad)}px`;
      hole.style.width = `${Math.min(window.innerWidth - 8, rect.width + pad * 2)}px`;
      hole.style.height = `${rect.height + pad * 2}px`;
      if (mobile) {
        card.style.top = "auto";
        card.style.bottom = "12px";
        card.style.left = "12px";
        card.style.right = "12px";
        card.style.width = "auto";
        return;
      }
      card.style.bottom = "auto";
      card.style.right = "auto";
      card.style.width = "380px";
      let top = rect.bottom + 12;
      if (top + cardRect.height > window.innerHeight - 12) top = Math.max(12, rect.top - cardRect.height - 12);
      let left = rect.left;
      if (left + 380 > window.innerWidth - 12) left = window.innerWidth - 380 - 12;
      card.style.top = `${Math.max(12, top)}px`;
      card.style.left = `${Math.max(12, left)}px`;
    }
    place();
    const timer = window.setInterval(place, 250);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const focusTimer = window.setTimeout(() => nextRef.current?.focus(), 350);
    return () => {
      stop = true;
      window.clearInterval(timer);
      window.clearTimeout(focusTimer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [step, index]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack, onClose, onNext]);

  return (
    <>
      <div className="fixed inset-0 z-40" />
      <div
        ref={holeRef}
        className="pointer-events-none fixed z-40 border-2 border-zinc-950"
        style={{ boxShadow: "0 0 0 9999px rgba(24, 24, 27, 0.55)" }}
      />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        className="fixed z-50 max-h-[70vh] overflow-auto border border-zinc-300 bg-white p-4"
      >
        <p className="text-[14px] text-zinc-600">
          {index + 1} of {total}
        </p>
        <h2 id="tour-title" className="mt-1 text-[18px] leading-snug font-medium text-zinc-950">
          {step.title}
        </h2>
        <p className="mt-2 text-[16px] leading-relaxed text-zinc-800">{step.body}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 border border-zinc-300 px-4 text-[16px] text-zinc-950 disabled:opacity-40"
            onClick={onBack}
            disabled={index === 0}
          >
            Back
          </button>
          <button ref={nextRef} type="button" className="min-h-11 bg-zinc-950 px-4 text-[16px] text-white" onClick={onNext}>
            {index === total - 1 ? "Finish" : "Next"}
          </button>
          <button type="button" className="min-h-11 px-3 text-[16px] text-zinc-700 underline" onClick={onClose}>
            Skip tour
          </button>
        </div>
      </div>
    </>
  );
}
