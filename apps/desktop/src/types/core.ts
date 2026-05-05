export interface AppConfig {
  preset_source_url: string;
  github_token: string | null;
  cache_ttl_minutes: number;
  sources: SourceEntry[];
}

export interface SourceEntry {
  name: string;
  url: string;
}

export interface PresetSource {
  repo: string;            // "owner/name"
  url: string;             // GitHub blob URL to the CLAUDE.md file
  homepage?: string | null;
  path: string;            // file path within the repo
  branch: string;
  stars: number;
  language?: string | null;
  pushed_at?: string;
  discovered_at: string;
  score?: number;
  readme?: string | null;  // upstream README.md content (truncated)
}

export interface PresetMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  source?: PresetSource;
}

export interface PresetIndex {
  presets: PresetMeta[];
}

export interface PresetManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  files: Record<string, string>;
  skills?: string[];
  mcps?: { ref: string; required_env?: string[] }[];
  source?: PresetSource;
}

export interface ActivePresetInfo {
  active_preset_id: string;
  preset_version: string;
  activated_at: string;
  files: string[];
  backup_ref: string;
}

export interface InstalledState {
  global: ActivePresetInfo | null;
  projects: Record<string, ActivePresetInfo>;
  global_skills?: string[];
  project_skills?: Record<string, string[]>;
  global_mcps?: string[];
  project_mcps?: Record<string, string[]>;
}

export interface BackupEntry {
  id: string;
  scope: string;
  previous_preset: string | null;
  created_at: string;
  files: string[];
}

export type ScopeArg =
  | { kind: "global" }
  | { kind: "project"; path: string };

export type RestoreArg = "baseline" | "lastbackup" | "keepfiles";

export type PermissionMode = "default" | "acceptEdits" | "plan" | "auto" | "dontAsk" | "bypassPermissions";
export type EffortLevel = "low" | "medium" | "high" | "highest";

export interface ClaudeSettings {
  // Model & reasoning
  model?: string;
  alwaysThinkingEnabled?: boolean;
  effortLevel?: EffortLevel;
  fastMode?: boolean;
  outputStyle?: string;

  // Permissions
  permissions?: {
    allow?: string[];
    deny?: string[];
    ask?: string[];
    additionalDirectories?: string[];
    defaultMode?: PermissionMode;
  };

  // Behavior
  autoMemoryEnabled?: boolean;
  includeGitInstructions?: boolean;
  cleanupPeriodDays?: number;
  respectGitignore?: boolean;
  claudeMdExcludes?: string[];

  // Display
  showTurnDuration?: boolean;
  terminalProgressBarEnabled?: boolean;
  prefersReducedMotion?: boolean;

  // Updates
  autoUpdatesChannel?: "latest" | "stable";

  // Environment
  env?: Record<string, string>;

  // Attribution
  attribution?: {
    commit?: string;
    pr?: string;
  };

  // Auth / API
  apiKeyHelper?: string;
}

// ── Skills ───────────────────────────────────────────────────────────────────

export interface SkillSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number | null;
  language?: string | null;
  pushed_at?: string | null;
  readme?: string | null;
}

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  compatible_tools: string[];
  version: string;
  author: string;
  install_path: string;
  source?: SkillSource | null;
}

export interface SkillIndex {
  version: string;
  updated_at: string;
  skills: SkillMeta[];
}

// ── MCPs ─────────────────────────────────────────────────────────────────────

export interface McpRequiredEnv {
  key: string;
  hint?: string;
  description?: string;
}

export interface McpSource {
  repo: string;
  url: string;
  path: string;
  branch: string;
  discovered_at: string;
  stars?: number | null;
  language?: string | null;
  pushed_at?: string | null;
  readme?: string | null;
}

export interface McpMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  command: string;
  args: string[];
  required_env: McpRequiredEnv[];
  optional_env: McpRequiredEnv[];
  source?: McpSource | null;
}

export interface McpIndex {
  version: string;
  updated_at: string;
  mcps: McpMeta[];
}

// ── Imported bundle ──────────────────────────────────────────────────────────

export interface ImportedBundle {
  suggested_id: string;
  suggested_name: string;
  source_repo: string;
  source_url: string;
  claude_md: string | null;
  settings_json: string | null;
  skills: Record<string, string>;
  mcps: Record<string, string>;
}

// ── Library + Recipe ──────────────────────────────────────────────────────────

export type ItemKindArg = "claude-md" | "skill" | "mcp";

export type ItemSource =
  | { kind: "remote"; repo: string; url: string }
  | { kind: "imported"; from: string }
  | { kind: "user-created" };

export interface LibraryItemMeta {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  source: ItemSource;
  downloaded_at: string;
}

export interface RecipeMcpEntry {
  library_id: string;
  env?: Record<string, string>;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  claude_md?: string | null;
  skills?: string[];
  mcps?: RecipeMcpEntry[];
  settings_override?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActiveState {
  global?: string | null;
  projects?: Record<string, string>;
}

export interface ScanResult {
  claude_md_imported: string | null;
  skills_imported: string[];
  mcps_imported: string[];
  recipe_id: string;
}
