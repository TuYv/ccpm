// src/stores/cmdk.ts
import { create } from "zustand";

const STORAGE_KEY = "ccpm_cmdk_recents";
const RECENTS_MAX = 10;

export type CmdkKind = "recipe" | "preset" | "skill" | "mcp";
export interface CmdkRecent { kind: CmdkKind; id: string; ts: number }

function readRecents(): CmdkRecent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, RECENTS_MAX) : [];
  } catch { return []; }
}

function persist(recents: CmdkRecent[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recents)); } catch {}
}

interface CmdkStore {
  open: boolean;
  query: string;
  recents: CmdkRecent[];
  setOpen: (v: boolean) => void;
  toggle: () => void;
  setQuery: (q: string) => void;
  pushRecent: (kind: CmdkKind, id: string) => void;
}

export const useCmdkStore = create<CmdkStore>((set, get) => ({
  open: false,
  query: "",
  recents: readRecents(),
  setOpen: (v) => set({ open: v, query: v ? "" : get().query }),
  toggle: () => set({ open: !get().open, query: "" }),
  setQuery: (q) => set({ query: q }),
  pushRecent: (kind, id) => {
    const next: CmdkRecent[] = [
      { kind, id, ts: Date.now() },
      ...get().recents.filter((r) => !(r.kind === kind && r.id === id)),
    ].slice(0, RECENTS_MAX);
    set({ recents: next });
    persist(next);
  },
}));
