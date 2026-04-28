import { invoke } from "@tauri-apps/api/core";
import { CURRENT_RECIPE_ID } from "../utils/constants";
import type {
  ActivePresetInfo,
  ActiveState,
  AppConfig,
  BackupEntry,
  ClaudeSettings,
  ImportedBundle,
  InstalledState,
  ItemKindArg,
  LibraryItemMeta,
  McpIndex,
  McpMeta,
  PresetMeta,
  PresetIndex,
  PresetManifest,
  Recipe,
  RestoreArg,
  ScanResult,
  ScopeArg,
  SkillIndex,
  SkillMeta,
} from "../types/core";

export class ClaudePresetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudePresetError";
  }
}

const PREVIEW_SOURCE_URL =
  "https://raw.githubusercontent.com/TuYv/ccpm/main/preset-registry";
const PREVIEW_BASELINE_KEY = "claude-preset-preview-baseline";
const PREVIEW_INSTALLED_KEY = "claude-preset-preview-installed";

const previewPresets: PresetMeta[] = [
  {
    id: "safe-solo",
    name: "独立开发安全",
    version: "1.0.0",
    description:
      "个人开发保守基线：先读仓库再动手，保护密钥，完成前跑验证，不擅自删除用户代码。",
    author: "claude-preset",
    tags: ["通用", "独立开发", "安全"],
  },
  {
    id: "code-review",
    name: "代码审查",
    version: "1.0.0",
    description:
      "以发现问题为核心：按严重程度排序，聚焦回归、安全风险、数据丢失、缺失测试，精确到行。",
    author: "claude-preset",
    tags: ["审查", "质量"],
  },
  {
    id: "frontend-app",
    name: "前端应用构建",
    version: "1.0.0",
    description:
      "生产级前端预设：构建可用页面而非展示壳，响应式布局、无障碍访问、声明完成前视觉验证。",
    author: "claude-preset",
    tags: ["前端", "React", "UI"],
  },
  {
    id: "rust-cli",
    name: "Rust CLI 维护",
    version: "1.0.0",
    description:
      "Rust CLI 工作流：小模块、类型化错误、集成测试，发布前强制跑 fmt / clippy / release 构建。",
    author: "claude-preset",
    tags: ["Rust", "CLI", "测试"],
  },
  {
    id: "docs-writer",
    name: "文档写作",
    version: "1.0.0",
    description:
      "以最短路径引导用户跑通第一个结果，示例保持可执行并与当前命令一致，不写假设性内容。",
    author: "claude-preset",
    tags: ["文档", "写作"],
  },
];

export const SEED_INDEX: PresetIndex = { presets: previewPresets };

export function getSeedManifest(presetId: string): PresetManifest {
  return previewManifest(presetId);
}

export function getSeedFiles(presetId: string): Record<string, string> {
  return previewFiles[presetId] ?? {};
}

const previewFiles: Record<string, Record<string, string>> = {
  "safe-solo": {
    "CLAUDE.md":
      "# 独立开发安全\n\n编辑前先读相关文件。改动范围保持精确。未经明确要求不删除或回退用户代码。完成前运行验证。\n",
    "settings.json":
      '{\n  "permissions": {\n    "deny": [\n      "Read(./.env)",\n      "Read(./.env.*)",\n      "Read(./secrets/**)"\n    ]\n  }\n}\n',
  },
  "code-review": {
    "CLAUDE.md":
      "# 代码审查\n\n先列发现，按严重程度排序。聚焦 bug、回归、安全问题、数据丢失风险、缺失测试和运维风险。\n",
  },
  "frontend-app": {
    "CLAUDE.md":
      "# 前端应用构建\n\n构建可用的应用页面，而非展示壳。保持工作流高效、无障碍、响应式，声明完成前进行视觉验证。\n",
  },
  "rust-cli": {
    "CLAUDE.md":
      "# Rust CLI 维护\n\n保持模块小型化，写入前验证路径，使用类型化错误，发布前运行 fmt、clippy、测试和 release 构建。\n",
  },
  "docs-writer": {
    "CLAUDE.md":
      "# 文档写作\n\n以最短路径引导用户跑通第一个结果。保持示例可执行，与当前命令保持一致。\n",
  },
};

function tauriAvailable() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export const isTauriApp = tauriAvailable;

function previewManifest(presetId: string): PresetManifest {
  const meta = previewPresets.find((preset) => preset.id === presetId);
  if (!meta) {
    throw new ClaudePresetError(`Preview preset not found: ${presetId}`);
  }
  const fileNames = Object.keys(previewFiles[presetId] ?? {});
  return {
    ...meta,
    files: Object.fromEntries(fileNames.map((name) => [name, name])),
  };
}

function readPreviewInstalled(): InstalledState {
  const raw = localStorage.getItem(PREVIEW_INSTALLED_KEY);
  if (!raw) return { global: null, projects: {} };
  try {
    return JSON.parse(raw) as InstalledState;
  } catch {
    return { global: null, projects: {} };
  }
}

function writePreviewInstalled(state: InstalledState) {
  localStorage.setItem(PREVIEW_INSTALLED_KEY, JSON.stringify(state));
}

function previewActiveInfo(presetId: string): ActivePresetInfo {
  const manifest = previewManifest(presetId);
  return {
    active_preset_id: presetId,
    preset_version: manifest.version,
    activated_at: new Date().toISOString(),
    files: Object.values(manifest.files),
    backup_ref: `preview-${Date.now()}`,
  };
}

const previewApi = {
  getConfig: async (): Promise<AppConfig> => ({
    preset_source_url: PREVIEW_SOURCE_URL,
    github_token: null,
    cache_ttl_minutes: 60,
    sources: [{ name: "default", url: PREVIEW_SOURCE_URL }],
  }),
  setConfig: async () => undefined,
  captureBaseline: async () => {
    localStorage.setItem(PREVIEW_BASELINE_KEY, "true");
  },
  restoreBaseline: async () => {
    localStorage.removeItem(PREVIEW_INSTALLED_KEY);
  },
  baselineStatus: async () => localStorage.getItem(PREVIEW_BASELINE_KEY) === "true",
  fetchIndex: async (): Promise<PresetIndex> => ({ presets: previewPresets }),
  getManifest: async (presetId: string) => previewManifest(presetId),
  getPresetFiles: async (presetId: string) => previewFiles[presetId] ?? {},
  activatePreset: async (presetId: string, scope: ScopeArg) => {
    const state = readPreviewInstalled();
    const info = previewActiveInfo(presetId);
    if (scope.kind === "global") {
      state.global = info;
    } else if (scope.path) {
      state.projects[scope.path] = info;
    }
    writePreviewInstalled(state);
    return info.backup_ref;
  },
  deactivatePreset: async (scope: ScopeArg) => {
    const state = readPreviewInstalled();
    if (scope.kind === "global") {
      state.global = null;
    } else {
      delete state.projects[scope.path];
    }
    writePreviewInstalled(state);
  },
  getInstalled: async () => readPreviewInstalled(),
  listBackups: async (): Promise<BackupEntry[]> => [],
  restoreBackup: async () => undefined,
};

async function call<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (!tauriAvailable()) {
    throw new ClaudePresetError(
      "当前是浏览器预览模式；真实文件操作需要运行 Tauri 桌面应用。"
    );
  }
  try {
    return await invoke<T>(cmd, args);
  } catch (e) {
    throw new ClaudePresetError(String(e));
  }
}

export const api = {
  getConfig: () => (tauriAvailable() ? call<AppConfig>("get_config") : previewApi.getConfig()),
  setConfig: (config: AppConfig) =>
    tauriAvailable() ? call<void>("set_config", { config }) : previewApi.setConfig(),

  captureBaseline: () =>
    tauriAvailable() ? call<void>("capture_baseline_cmd") : previewApi.captureBaseline(),
  restoreBaseline: () =>
    tauriAvailable() ? call<void>("restore_baseline_cmd") : previewApi.restoreBaseline(),
  baselineStatus: () =>
    tauriAvailable() ? call<boolean>("baseline_status") : previewApi.baselineStatus(),

  fetchIndex: (forceRefresh = false) =>
    tauriAvailable()
      ? call<PresetIndex>("fetch_index_cmd", { forceRefresh })
      : previewApi.fetchIndex(),
  getManifest: (presetId: string) =>
    tauriAvailable()
      ? call<PresetManifest>("get_manifest", { presetId })
      : previewApi.getManifest(presetId),
  getPresetFiles: (presetId: string) =>
    tauriAvailable()
      ? call<Record<string, string>>("get_preset_files", { presetId })
      : previewApi.getPresetFiles(presetId),

  activatePreset: (presetId: string, scope: ScopeArg) =>
    tauriAvailable()
      ? call<string>("activate_preset_cmd", { presetId, scope })
      : previewApi.activatePreset(presetId, scope),

  activateSeedPreset: (presetId: string, scope: ScopeArg) => {
    const manifest = previewManifest(presetId);
    const fileContents = previewFiles[presetId] ?? {};
    return tauriAvailable()
      ? call<string>("activate_seed_preset_cmd", { scope, manifest, fileContents })
      : previewApi.activatePreset(presetId, scope);
  },

  activateAdHoc: (manifest: PresetManifest, fileContents: Record<string, string>, scope: ScopeArg) =>
    tauriAvailable()
      ? call<string>("activate_seed_preset_cmd", { scope, manifest, fileContents })
      : Promise.reject(new ClaudePresetError("Tauri only")),

  deactivatePreset: (scope: ScopeArg, restore: RestoreArg) =>
    tauriAvailable()
      ? call<void>("deactivate_preset_cmd", { scope, restore })
      : previewApi.deactivatePreset(scope),

  getInstalled: () =>
    tauriAvailable() ? call<InstalledState>("get_installed") : previewApi.getInstalled(),

  listBackups: () =>
    tauriAvailable() ? call<BackupEntry[]>("list_backups") : previewApi.listBackups(),
  restoreBackup: (backupId: string) =>
    tauriAvailable()
      ? call<void>("restore_backup", { backupId })
      : previewApi.restoreBackup(),

  // Skills
  fetchSkillsIndex: (forceRefresh = false) =>
    tauriAvailable()
      ? call<SkillIndex>("fetch_skills_index_cmd", { forceRefresh })
      : Promise.resolve<SkillIndex>({ version: "1", updated_at: "", skills: [] }),
  installSkill: (meta: SkillMeta, scope: ScopeArg) =>
    tauriAvailable()
      ? call<void>("install_skill_cmd", { meta, scope })
      : Promise.resolve(),
  downloadSkillToLibrary: (skill: SkillMeta) =>
    tauriAvailable()
      ? call<void>("download_skill_to_library_cmd", { skill })
      : Promise.resolve(),
  // Note: uninstall_skill_cmd takes full meta (Rust uses files list to clean up),
  // while uninstall_mcp_cmd takes only the id (Rust looks up by id in install record).
  // Store-level `uninstall(id, scope)` is symmetric; this layer mirrors the Rust signatures.
  uninstallSkill: (meta: SkillMeta, scope: ScopeArg) =>
    tauriAvailable()
      ? call<void>("uninstall_skill_cmd", { meta, scope })
      : Promise.resolve(),
  listInstalledSkills: (scope: ScopeArg) =>
    tauriAvailable()
      ? call<string[]>("list_installed_skills_cmd", { scope })
      : Promise.resolve([]),

  // MCPs
  fetchMcpsIndex: (forceRefresh = false) =>
    tauriAvailable()
      ? call<McpIndex>("fetch_mcps_index_cmd", { forceRefresh })
      : Promise.resolve<McpIndex>({ version: "1", updated_at: "", mcps: [] }),
  installMcp: (meta: McpMeta, scope: ScopeArg, env: Record<string, string>) =>
    tauriAvailable()
      ? call<void>("install_mcp_cmd", { meta, scope, env })
      : Promise.resolve(),
  downloadMcpToLibrary: (mcp: McpMeta) =>
    tauriAvailable()
      ? call<void>("download_mcp_to_library_cmd", { mcp })
      : Promise.resolve(),
  uninstallMcp: (mcpId: string, scope: ScopeArg) =>
    tauriAvailable()
      ? call<void>("uninstall_mcp_cmd", { mcpId, scope })
      : Promise.resolve(),
  listInstalledMcps: (scope: ScopeArg) =>
    tauriAvailable()
      ? call<string[]>("list_installed_mcps_cmd", { scope })
      : Promise.resolve([]),

  // Import
  importFromGithub: (url: string) =>
    tauriAvailable()
      ? call<ImportedBundle>("import_from_github_cmd", { url })
      : Promise.reject(new ClaudePresetError("Tauri only")),

  // Recent projects from Claude Code history
  listRecentProjects: () =>
    tauriAvailable()
      ? call<{ path: string; name: string; last_used: string | null }[]>(
          "list_recent_projects",
        )
      : Promise.resolve([]),

  // Library
  listLibraryItems: (kind: ItemKindArg) =>
    tauriAvailable() ? call<string[]>("list_library_items", { kind }) : Promise.resolve([]),
  getLibraryMeta: (kind: ItemKindArg, id: string) =>
    tauriAvailable()
      ? call<LibraryItemMeta>("get_library_meta", { kind, id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibraryClaudeMd: (id: string) =>
    tauriAvailable()
      ? call<[string, string | null]>("get_library_claude_md", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibrarySkillMd: (id: string) =>
    tauriAvailable()
      ? call<string>("get_library_skill_md", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  getLibraryMcpJson: (id: string) =>
    tauriAvailable()
      ? call<string>("get_library_mcp_json", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  addLibraryClaudeMd: (
    meta: LibraryItemMeta,
    claudeMd: string,
    settingsJson?: string,
  ) =>
    tauriAvailable()
      ? call<void>("add_library_claude_md", { meta, claudeMd, settingsJson })
      : Promise.resolve(),
  addLibrarySkill: (meta: LibraryItemMeta, skillMd: string) =>
    tauriAvailable()
      ? call<void>("add_library_skill", { meta, skillMd })
      : Promise.resolve(),
  addLibraryMcp: (id: string, mcpJson: string) =>
    tauriAvailable()
      ? call<void>("add_library_mcp", { id, mcpJson })
      : Promise.resolve(),
  removeLibraryItem: (kind: ItemKindArg, id: string) =>
    tauriAvailable()
      ? call<void>("remove_library_item", { kind, id })
      : Promise.resolve(),

  // Recipes
  listRecipes: () =>
    tauriAvailable() ? call<Recipe[]>("list_recipes_cmd") : Promise.resolve([]),
  getRecipe: (id: string) =>
    tauriAvailable()
      ? call<Recipe>("get_recipe_cmd", { id })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  saveRecipe: (recipe: Recipe) =>
    tauriAvailable() ? call<void>("save_recipe_cmd", { recipe }) : Promise.resolve(),
  deleteRecipe: (id: string) =>
    tauriAvailable() ? call<void>("delete_recipe_cmd", { id }) : Promise.resolve(),
  activateRecipe: (id: string, scope: ScopeArg) =>
    tauriAvailable()
      ? call<string>("activate_recipe_cmd", { id, scope })
      : Promise.reject(new ClaudePresetError("Tauri only")),
  deactivateRecipe: (scope: ScopeArg) =>
    tauriAvailable() ? call<void>("deactivate_recipe_cmd", { scope }) : Promise.resolve(),
  getActiveState: () =>
    tauriAvailable()
      ? call<ActiveState>("get_active_state_cmd")
      : Promise.resolve({ global: null, projects: {} }),
  getActiveRecipeId: (scope: ScopeArg) =>
    tauriAvailable()
      ? call<string | null>("get_active_recipe_id_cmd", { scope })
      : Promise.resolve(null),

  // First launch
  isFirstLaunch: () =>
    tauriAvailable() ? call<boolean>("is_first_launch_cmd") : Promise.resolve(false),
  scanAndSeed: () =>
    tauriAvailable()
      ? call<ScanResult>("scan_and_seed_cmd")
      : Promise.resolve({ claude_md_imported: null, skills_imported: [], mcps_imported: [], recipe_id: CURRENT_RECIPE_ID }),

  readClaudeSettings: (): Promise<ClaudeSettings> =>
    tauriAvailable()
      ? call<ClaudeSettings>("read_claude_settings")
      : Promise.resolve(JSON.parse(localStorage.getItem("preview-claude-settings") ?? "{}")),

  writeClaudeSettings: (settings: ClaudeSettings): Promise<void> =>
    tauriAvailable()
      ? call<void>("write_claude_settings", { settings })
      : Promise.resolve(void localStorage.setItem("preview-claude-settings", JSON.stringify(settings))),
};
