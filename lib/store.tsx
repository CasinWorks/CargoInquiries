"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { shellInquiry } from "./draft";
import { neededGaps, factsFromInquiry } from "./missing";
import { seedInquiries } from "./seed";
import { manilaToday, nowIso, uid } from "./time";
import type { Inquiry, InquiryDraft, Role } from "./types";

const DATA_KEY = "pcd-desk-v1";
const ROLE_KEY = "pcd-role";
const TIPS_KEY = "pcd-tips";

type DeskContextValue = {
  ready: boolean;
  today: string;
  inquiries: Inquiry[];
  role: Role;
  setRole: (role: Role) => void;
  tipsDismissed: Record<string, boolean>;
  dismissTip: (id: string) => void;
  resetTips: () => void;
  resetDemo: () => void;
  addInquiry: (draft: InquiryDraft) => Inquiry;
  addQuickInquiry: (inquiry: Inquiry) => void;
  updateInquiry: (id: string, updater: (current: Inquiry) => Inquiry) => void;
};

const DeskContext = createContext<DeskContextValue | null>(null);

function persist(inquiries: Inquiry[]) {
  const payload = JSON.stringify({ v: 1, inquiries });
  try {
    localStorage.setItem(DATA_KEY, payload);
  } catch {
    const slim = inquiries.map((inquiry) => ({
      ...inquiry,
      files: inquiry.files.map((file) => {
        const copy = { ...file };
        delete copy.previewDataUrl;
        return copy;
      }),
    }));
    localStorage.setItem(DATA_KEY, JSON.stringify({ v: 1, inquiries: slim }));
  }
}

function coerce(value: Partial<Inquiry>): Inquiry {
  const blank = shellInquiry();
  return {
    ...blank,
    ...value,
    origin: { ...blank.origin, ...value.origin },
    destination: { ...blank.destination, ...value.destination },
    assignment: { ...blank.assignment, ...value.assignment },
    pieces: value.pieces ?? [],
    files: value.files ?? [],
    quotes: value.quotes ?? [],
    notes: value.notes ?? [],
    timeline: value.timeline ?? [],
    scope: value.scope ?? [],
    specialHandling: value.specialHandling ?? [],
    permitDone: value.permitDone ?? [],
  };
}

function loadInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return seedInquiries();
    const parsed = JSON.parse(raw) as { inquiries?: Partial<Inquiry>[] };
    if (!parsed || !Array.isArray(parsed.inquiries)) return seedInquiries();
    return parsed.inquiries.filter((item) => item && typeof item.id === "string").map((item) => coerce(item));
  } catch {
    return seedInquiries();
  }
}

function nextReference(inquiries: Inquiry[]): string {
  const used = new Set(inquiries.map((inquiry) => inquiry.reference));
  let n = 1901;
  while (used.has(`PCD-26-${n}`)) n += 1;
  return `PCD-26-${n}`;
}

export function DeskProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [role, setRoleState] = useState<Role>("team");
  const [tipsDismissed, setTips] = useState<Record<string, boolean>>({});
  const [today, setToday] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem(ROLE_KEY);
    let tips: Record<string, boolean> = {};
    try {
      tips = JSON.parse(localStorage.getItem(TIPS_KEY) || "{}") as Record<string, boolean>;
    } catch {
      tips = {};
    }
    // Browser storage is unavailable during server render. Read it once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    setInquiries(loadInquiries());
    if (storedRole === "customer" || storedRole === "team") setRoleState(storedRole);
    setTips(tips);
    setToday(manilaToday());
  }, []);

  const api = useMemo<DeskContextValue>(() => {
    const commit = (next: Inquiry[]) => {
      setInquiries(next);
      persist(next);
    };
    return {
      ready: inquiries != null,
      today,
      inquiries: inquiries ?? [],
      role,
      setRole: (next) => {
        setRoleState(next);
        localStorage.setItem(ROLE_KEY, next);
      },
      tipsDismissed,
      dismissTip: (id) => {
        const next = { ...tipsDismissed, [id]: true };
        setTips(next);
        localStorage.setItem(TIPS_KEY, JSON.stringify(next));
      },
      resetTips: () => {
        setTips({});
        localStorage.removeItem(TIPS_KEY);
      },
      resetDemo: () => {
        const fresh = seedInquiries();
        commit(fresh);
      },
      addInquiry: (draft) => {
        const pieces = draft.pieces
          .map((item) => {
            const qty = Number(item.qty);
            const lengthM = Number(item.lengthM);
            const widthM = Number(item.widthM);
            const heightM = Number(item.heightM);
            const weightKg = Number(item.weightKg);
            if (![qty, lengthM, widthM, heightM, weightKg].every((n) => Number.isFinite(n))) return null;
            return {
              id: item.id,
              description: item.description.trim(),
              qty,
              lengthM,
              widthM,
              heightM,
              weightKg,
              packing: item.packing,
              stackable: item.stackable,
              cogKnown: item.cogKnown,
              cogNote: item.cogNote.trim(),
              liftingKnown: item.liftingKnown,
              liftingNote: item.liftingNote.trim(),
              dataSource: item.dataSource,
              revisionDate: item.revisionDate,
            };
          })
          .filter((item): item is Inquiry["pieces"][number] => item != null);
        const current = inquiries ?? [];
        const status = neededGaps(factsFromInquiry({ ...shellInquiry(), ...draft, pieces })).length
          ? "info_incomplete"
          : "new";
        const stamp = nowIso();
        const inquiry: Inquiry = {
          ...shellInquiry(),
          ...draft,
          pieces,
          id: uid(),
          reference: nextReference(current),
          sample: false,
          source: "web",
          createdAt: stamp,
          updatedAt: stamp,
          status,
          timeline: [
            {
              id: uid(),
              at: stamp,
              kind: "created",
              text:
                status === "info_incomplete"
                  ? "Received from the customer form. The stage is Info incomplete because items on the checklist are still open."
                  : "Received from the customer form.",
            },
          ],
        };
        commit([inquiry, ...current]);
        return inquiry;
      },
      addQuickInquiry: (inquiry) => {
        commit([inquiry, ...(inquiries ?? [])]);
      },
      updateInquiry: (id, updater) => {
        const current = inquiries ?? [];
        commit(
          current.map((inquiry) => {
            if (inquiry.id !== id) return inquiry;
            const next = updater(inquiry);
            return { ...next, updatedAt: nowIso() };
          }),
        );
      },
    };
  }, [inquiries, role, tipsDismissed, today]);

  return <DeskContext.Provider value={api}>{children}</DeskContext.Provider>;
}

export function useDesk(): DeskContextValue {
  const value = useContext(DeskContext);
  if (!value) throw new Error("useDesk must be used inside DeskProvider");
  return value;
}
