import { create } from "zustand";
import { SEED_INDEX, api, getSeedFiles, getSeedManifest } from "../api/claudePreset";
import type {
  ActiveState,
  AppConfig,
  BackupEntry,
  InstalledState,
  McpIndex,
  PresetIndex,
  PresetManifest,
  Recipe,
  ScopeArg,
  SkillIndex,
} from "../types/core";

interface Toast {
  id: number;
  message: string;
  kind: "success" | "error";
}

interface PresetsStore {
  index: PresetIndex | null;
  loading: boolean;
  error: string | null;
  detailError: string | null;
  sourceMode: "remote" | "seed";
  lastUpdated: string | null;
  selectedId: string | null;
  manifest: PresetManifest | null;
  files: Record<string, string>;
  fetchIndex: (force?: boolean) => Promise<void>;
  selectPreset: (id: string) => Promise<void>;
}

interface InstalledStore {
  state: InstalledState | null;
  load: () => Promise<void>;
}

interface ConfigStore {
  config: AppConfig | null;
  baselineExists: boolean;
  load: () => Promise<void>;
  save: (c: AppConfig) => Promise<void>;
  captureBaseline: () => Promise<void>;
  restoreBaseline: () => Promise<void>;
  checkBaseline: () => Promise<void>;
}

interface BackupsStore {
  entries: BackupEntry[];
  load: () => Promise<void>;
}

interface SkillsStore {
  index: SkillIndex | null;
  loading: boolean;
  error: string | null;
  installed: Record<string, string[]>; // scope key → installed skill ids
  fetchIndex: (force?: boolean) => Promise<void>;
  loadInstalled: (scope: ScopeArg) => Promise<void>;
  install: (skillId: string, scope: ScopeArg) => Promise<void>;
  uninstall: (skillId: string, scope: ScopeArg) => Promise<void>;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}

interface McpsStore {
  index: McpIndex | null;
  loading: boolean;
  error: string | null;
  installed: Record<string, string[]>;
  fetchIndex: (force?: boolean) => Promise<void>;
  loadInstalled: (scope: ScopeArg) => Promise<void>;
  install: (
    mcpId: string,
    scope: ScopeArg,
    env: Record<string, string>,
  ) => Promise<void>;
  uninstall: (mcpId: string, scope: ScopeArg) => Promise<void>;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
}

interface UiStore {
  toasts: Toast[];
  nextId: number;
  addToast: (message: string, kind: "success" | "error") => void;
  removeToast: (id: number) => void;
}

export const usePresetsStore = create<PresetsStore>((set, get) => ({
  index: null,
  loading: false,
  error: null,
  detailError: null,
  sourceMode: "remote",
  lastUpdated: null,
  selectedId: null,
  manifest: null,
  files: {},
  fetchIndex: async (force = false) => {
    set({ loading: true, error: null });
    try {
      const index = await api.fetchIndex(force);
      set({ index, sourceMode: "remote", lastUpdated: new Date().toISOString() });
      if (!get().selectedId && index.presets[0]) {
        get().selectPreset(index.presets[0].id);
      }
    } catch (e) {
      set({ index: SEED_INDEX, sourceMode: "seed", error: String(e) });
      if (!get().selectedId && SEED_INDEX.presets[0]) {
        get().selectPreset(SEED_INDEX.presets[0].id);
      }
    } finally {
      set({ loading: false });
    }
  },
  selectPreset: async (id: string) => {
    set({ selectedId: id, manifest: null, files: {}, detailError: null });
    try {
      if (get().sourceMode === "seed") {
        const manifest = getSeedManifest(id);
        const files = getSeedFiles(id);
        set({ manifest, files });
      } else {
        const [manifest, files] = await Promise.all([
          api.getManifest(id),
          api.getPresetFiles(id),
        ]);
        set({ manifest, files });
      }
    } catch (e) {
      set({ detailError: String(e) });
    }
  },
}));

export const useInstalledStore = create<InstalledStore>((set) => ({
  state: null,
  load: async () => {
    const state = await api.getInstalled();
    set({ state });
  },
}));

export const useConfigStore = create<ConfigStore>((set) => ({
  config: null,
  baselineExists: false,
  load: async () => {
    const [config, baselineExists] = await Promise.all([
      api.getConfig(),
      api.baselineStatus(),
    ]);
    set({ config, baselineExists });
  },
  save: async (config) => {
    await api.setConfig(config);
    set({ config });
  },
  captureBaseline: async () => {
    await api.captureBaseline();
    set({ baselineExists: true });
  },
  restoreBaseline: async () => {
    await api.restoreBaseline();
  },
  checkBaseline: async () => {
    const baselineExists = await api.baselineStatus();
    set({ baselineExists });
  },
}));

export const useBackupsStore = create<BackupsStore>((set) => ({
  entries: [],
  load: async () => {
    const entries = await api.listBackups();
    set({ entries });
  },
}));

const MAX_TOASTS = 10;

export const useUiStore = create<UiStore>((set, get) => ({
  toasts: [],
  nextId: 0,
  addToast: (message, kind) => {
    const id = get().nextId;
    set((s) => ({
      toasts: [...s.toasts.slice(-(MAX_TOASTS - 1)), { id, message, kind }],
      nextId: id + 1,
    }));
    setTimeout(() => get().removeToast(id), 4000);
  },
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

function scopeKey(scope: ScopeArg): string {
  return scope.kind === "global" ? "global" : scope.path;
}

export const useSkillsStore = create<SkillsStore>((set, get) => ({
  index: null,
  loading: false,
  error: null,
  installed: {},
  focusId: null,
  setFocusId: (id) => set({ focusId: id }),
  fetchIndex: async (force = false) => {
    set({ loading: true, error: null });
    try {
      const index = await api.fetchSkillsIndex(force);
      set({ index });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  loadInstalled: async (_scope) => {
    const ids = await api.listLibraryItems("skill");
    set((s) => ({ installed: { ...s.installed, [scopeKey(_scope)]: ids } }));
  },
  install: async (skillId, _scope) => {
    const meta = get().index?.skills.find((s) => s.id === skillId);
    if (!meta) throw new Error(`skill not found: ${skillId}`);
    await api.downloadSkillToLibrary(meta);
    await get().loadInstalled(_scope);
  },
  uninstall: async (skillId, _scope) => {
    await api.removeLibraryItem("skill", skillId);
    await get().loadInstalled(_scope);
  },
}));

export const useMcpsStore = create<McpsStore>((set, get) => ({
  index: null,
  loading: false,
  error: null,
  installed: {},
  focusId: null,
  setFocusId: (id) => set({ focusId: id }),
  fetchIndex: async (force = false) => {
    set({ loading: true, error: null });
    try {
      const index = await api.fetchMcpsIndex(force);
      set({ index });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  loadInstalled: async (_scope) => {
    const ids = await api.listLibraryItems("mcp");
    set((s) => ({ installed: { ...s.installed, [scopeKey(_scope)]: ids } }));
  },
  install: async (mcpId, _scope, _env) => {
    const meta = get().index?.mcps.find((m) => m.id === mcpId);
    if (!meta) throw new Error(`mcp not found: ${mcpId}`);
    await api.downloadMcpToLibrary(meta);
    await get().loadInstalled(_scope);
  },
  uninstall: async (mcpId, _scope) => {
    await api.removeLibraryItem("mcp", mcpId);
    await get().loadInstalled(_scope);
  },
}));

interface RecipesStore {
  recipes: Recipe[];
  active: ActiveState | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (recipe: Recipe) => Promise<void>;
  remove: (id: string) => Promise<void>;
  activate: (id: string, scope: ScopeArg) => Promise<void>;
  deactivate: (scope: ScopeArg) => Promise<void>;
}

export const useRecipesStore = create<RecipesStore>((set, get) => ({
  recipes: [],
  active: null,
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null });
    try {
      const [recipes, active] = await Promise.all([
        api.listRecipes(),
        api.getActiveState(),
      ]);
      set({ recipes, active });
    } catch (e) {
      set({ error: String(e) });
    } finally {
      set({ loading: false });
    }
  },
  save: async (recipe) => {
    await api.saveRecipe(recipe);
    await get().load();
  },
  remove: async (id) => {
    await api.deleteRecipe(id);
    await get().load();
  },
  activate: async (id, scope) => {
    await api.activateRecipe(id, scope);
    await get().load();
  },
  deactivate: async (scope) => {
    await api.deactivateRecipe(scope);
    await get().load();
  },
}));
