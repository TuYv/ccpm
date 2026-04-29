// src/stores/scope.ts
import { create } from "zustand";
import type { ScopeArg } from "../types/core";

const STORAGE_KEY = "ccpm_scope";
const RECENTS_MAX = 5;

interface Persisted {
  scope: ScopeArg;
  recentProjects: string[];
}

function readPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { scope: { kind: "global" }, recentProjects: [] };
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed?.scope?.kind === "global" || parsed?.scope?.kind === "project") {
      return {
        scope: parsed.scope,
        recentProjects: Array.isArray(parsed.recentProjects) ? parsed.recentProjects : [],
      };
    }
  } catch {}
  return { scope: { kind: "global" }, recentProjects: [] };
}

function persist(p: Persisted) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

interface ScopeStore extends Persisted {
  setScope: (s: ScopeArg) => void;
}

const initial = readPersisted();

export const useScopeStore = create<ScopeStore>((set, get) => ({
  scope: initial.scope,
  recentProjects: initial.recentProjects,
  setScope: (s) => {
    let next = get().recentProjects;
    if (s.kind === "project") {
      next = [s.path, ...next.filter((p) => p !== s.path)].slice(0, RECENTS_MAX);
    }
    set({ scope: s, recentProjects: next });
    persist({ scope: s, recentProjects: next });
  },
}));
