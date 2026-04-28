import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/claudePreset";
import { useRecipesStore, useUiStore } from "../stores";
import type { McpMeta, Recipe, RecipeMcpEntry, SkillMeta } from "../types/core";
import { isSecretEnvKey } from "../utils/env";

const NEW_ID_SENTINEL = "new";

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export default function RecipeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { save } = useRecipesStore();
  const { addToast } = useUiStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [claudeMdId, setClaudeMdId] = useState<string | null>(null);
  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [mcpEntries, setMcpEntries] = useState<RecipeMcpEntry[]>([]);
  const [settingsOverride, setSettingsOverride] = useState("{}");

  const [availableClaudeMds, setAvailableClaudeMds] = useState<string[]>([]);
  const [librarySkills, setLibrarySkills] = useState<Set<string>>(new Set());
  const [libraryMcps, setLibraryMcps] = useState<Set<string>>(new Set());
  const [remoteSkills, setRemoteSkills] = useState<SkillMeta[]>([]);
  const [remoteMcps, setRemoteMcps] = useState<McpMeta[]>([]);
  const [downloadingSkill, setDownloadingSkill] = useState<string | null>(null);
  const [downloadingMcp, setDownloadingMcp] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const isNew = !id || id === NEW_ID_SENTINEL;

  async function loadAll() {
    const [cmLib, skLib, mcLib, skIndex, mcIndex] = await Promise.all([
      api.listLibraryItems("claude-md"),
      api.listLibraryItems("skill"),
      api.listLibraryItems("mcp"),
      api.fetchSkillsIndex(false).catch(() => ({ skills: [] as SkillMeta[] })),
      api.fetchMcpsIndex(false).catch(() => ({ mcps: [] as McpMeta[] })),
    ]);
    setAvailableClaudeMds(cmLib);
    setLibrarySkills(new Set(skLib));
    setLibraryMcps(new Set(mcLib));
    setRemoteSkills(skIndex.skills ?? []);
    setRemoteMcps(mcIndex.mcps ?? []);
  }

  async function refreshLibrary() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadAll();
      addToast("✓ 已刷新库", "success");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (isNew) return;
    api.getRecipe(id!).then((r) => {
      setName(r.name);
      setDescription(r.description ?? "");
      setClaudeMdId(r.claude_md ?? null);
      setSkillIds(r.skills ?? []);
      setMcpEntries(r.mcps ?? []);
      setSettingsOverride(JSON.stringify(r.settings_override ?? {}, null, 2));
    });
  }, [id, isNew]);

  // Sort: in-library first, then alphabetical
  const sortedSkills = useMemo(() => {
    const arr = [...remoteSkills];
    arr.sort((a, b) => {
      const aIn = librarySkills.has(a.id) ? 0 : 1;
      const bIn = librarySkills.has(b.id) ? 0 : 1;
      if (aIn !== bIn) return aIn - bIn;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [remoteSkills, librarySkills]);

  const sortedMcps = useMemo(() => {
    const arr = [...remoteMcps];
    arr.sort((a, b) => {
      const aIn = libraryMcps.has(a.id) ? 0 : 1;
      const bIn = libraryMcps.has(b.id) ? 0 : 1;
      if (aIn !== bIn) return aIn - bIn;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [remoteMcps, libraryMcps]);

  async function handleSave(activateAfter: boolean) {
    let parsedOverride: Record<string, unknown> = {};
    try {
      parsedOverride = JSON.parse(settingsOverride);
    } catch {
      addToast("settings 覆盖必须是合法 JSON", "error");
      return;
    }
    const now = new Date().toISOString();
    const recipe: Recipe = {
      id: isNew ? newId() : id!,
      name: name.trim() || "未命名配方",
      description,
      claude_md: claudeMdId,
      skills: skillIds,
      mcps: mcpEntries,
      settings_override: parsedOverride,
      created_at: now,
      updated_at: now,
    };
    try {
      await save(recipe);
      addToast("✓ 已保存", "success");
      if (activateAfter) {
        await api.activateRecipe(recipe.id, { kind: "global" });
        addToast(`✓ 已激活 ${recipe.name}`, "success");
      }
      navigate("/recipes");
    } catch (e) {
      addToast(`保存失败：${String(e)}`, "error");
    }
  }

  function toggleSkill(skillId: string) {
    setSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId],
    );
  }

  function toggleMcp(mcpId: string) {
    setMcpEntries((prev) => {
      const idx = prev.findIndex((m) => m.library_id === mcpId);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      return [...prev, { library_id: mcpId, env: {} }];
    });
  }

  function setMcpEnv(mcpId: string, key: string, val: string) {
    setMcpEntries((prev) =>
      prev.map((m) =>
        m.library_id === mcpId ? { ...m, env: { ...m.env, [key]: val } } : m,
      ),
    );
  }

  async function handleDownloadSkill(skill: SkillMeta) {
    if (downloadingSkill) return;
    setDownloadingSkill(skill.id);
    try {
      await api.downloadSkillToLibrary(skill);
      setLibrarySkills((s) => new Set(s).add(skill.id));
      // auto-tick
      setSkillIds((prev) => (prev.includes(skill.id) ? prev : [...prev, skill.id]));
      addToast(`✓ 已下载 ${skill.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    } finally {
      setDownloadingSkill(null);
    }
  }

  async function handleDownloadMcp(mcp: McpMeta) {
    if (downloadingMcp) return;
    setDownloadingMcp(mcp.id);
    try {
      await api.downloadMcpToLibrary(mcp);
      setLibraryMcps((s) => new Set(s).add(mcp.id));
      // auto-add to mcpEntries with empty env
      setMcpEntries((prev) =>
        prev.find((m) => m.library_id === mcp.id)
          ? prev
          : [...prev, { library_id: mcp.id, env: {} }],
      );
      addToast(`✓ 已下载 ${mcp.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    } finally {
      setDownloadingMcp(null);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-6 max-w-3xl space-y-6">
        <div>
          <button
            onClick={() => navigate("/recipes")}
            className="text-xs text-app-muted hover:text-app-text mb-3"
          >
            ← 返回
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="配方名称"
            className="w-full bg-transparent text-2xl font-bold text-app-text outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简要说明"
            className="w-full bg-transparent text-sm text-app-muted outline-none mt-2"
          />
        </div>

        <div>
          <button
            onClick={refreshLibrary}
            disabled={refreshing}
            className="text-[11px] text-app-accent hover:underline mb-2 disabled:opacity-50"
          >
            {refreshing ? "刷新中…" : "↻ 刷新库"}
          </button>
        </div>

        {/* CLAUDE.md */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            📄 CLAUDE.md
          </div>
          <select
            value={claudeMdId ?? ""}
            onChange={(e) => setClaudeMdId(e.target.value || null)}
            className="w-full bg-app-surface text-sm text-app-text px-3 py-2 rounded-lg border border-app-border"
          >
            <option value="">— 不使用 —</option>
            {availableClaudeMds.map((cmId) => (
              <option key={cmId} value={cmId}>
                {cmId}
              </option>
            ))}
          </select>
          {availableClaudeMds.length === 0 && (
            <div className="text-[11px] text-app-muted mt-1">
              库里还没有 CLAUDE.md，去「预设」tab 下载一些
            </div>
          )}
        </section>

        {/* Skills */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            ⚡ Skills <span className="text-app-secondary">({skillIds.length} 已选)</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sortedSkills.map((skill) => {
              const inLib = librarySkills.has(skill.id);
              const ticked = skillIds.includes(skill.id);
              const downloading = downloadingSkill === skill.id;
              return (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 px-3 py-2 bg-app-surface rounded-lg border border-app-border"
                >
                  {inLib ? (
                    <input
                      type="checkbox"
                      checked={ticked}
                      onChange={() => toggleSkill(skill.id)}
                      className="accent-app-accent"
                    />
                  ) : (
                    <span className="w-4 h-4 inline-block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-app-text truncate">{skill.name}</div>
                    <div className="text-[10px] text-app-muted truncate">
                      {skill.description}
                    </div>
                  </div>
                  {!inLib ? (
                    <button
                      onClick={() => handleDownloadSkill(skill)}
                      disabled={downloading}
                      className="px-2 py-1 text-[10px] bg-app-accent text-white rounded hover:bg-app-accentHover disabled:opacity-50 shrink-0"
                    >
                      {downloading ? "下载中…" : "下载到库"}
                    </button>
                  ) : ticked ? (
                    <span className="text-[10px] text-app-green shrink-0">✓ 已选</span>
                  ) : (
                    <span className="text-[10px] text-app-muted shrink-0">已下载</span>
                  )}
                </div>
              );
            })}
          </div>
          {sortedSkills.length === 0 && (
            <div className="text-[11px] text-app-muted">
              远程暂无 skill 索引，
              <button
                onClick={refreshLibrary}
                className="ml-1 text-app-accent hover:underline"
              >
                试试刷新 →
              </button>
            </div>
          )}
        </section>

        {/* MCPs */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            🔌 MCPs
          </div>
          <div className="space-y-2">
            {sortedMcps.map((mcp) => {
              const inLib = libraryMcps.has(mcp.id);
              const entry = mcpEntries.find((m) => m.library_id === mcp.id);
              const checked = !!entry;
              const downloading = downloadingMcp === mcp.id;
              return (
                <div
                  key={mcp.id}
                  className="bg-app-surface rounded-lg border border-app-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {inLib ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleMcp(mcp.id)}
                        className="accent-app-accent"
                      />
                    ) : (
                      <span className="w-4 h-4 inline-block" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-app-text truncate">{mcp.name}</div>
                      <div className="text-[10px] text-app-muted truncate">
                        {mcp.description}
                      </div>
                    </div>
                    {!inLib ? (
                      <button
                        onClick={() => handleDownloadMcp(mcp)}
                        disabled={downloading}
                        className="px-2 py-1 text-[10px] bg-app-accent text-white rounded hover:bg-app-accentHover disabled:opacity-50 shrink-0"
                      >
                        {downloading ? "下载中…" : "下载到库"}
                      </button>
                    ) : checked ? (
                      <span className="text-[10px] text-app-green shrink-0">✓ 已选</span>
                    ) : (
                      <span className="text-[10px] text-app-muted shrink-0">已下载</span>
                    )}
                  </div>
                  {checked && (
                    <div className="mt-2 ml-5 space-y-1">
                      {Object.entries(entry?.env ?? {}).map(([k, v]) => (
                        <div key={k} className="flex gap-2 items-center">
                          <span className="text-[10px] font-mono text-app-muted w-32 truncate">
                            {k}
                          </span>
                          <input
                            type={isSecretEnvKey(k) ? "password" : "text"}
                            value={v}
                            onChange={(e) => setMcpEnv(mcp.id, k, e.target.value)}
                            className="flex-1 bg-app-bg text-[11px] text-app-text px-2 py-1 rounded border border-app-border font-mono"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const k = prompt("env key");
                          if (k) setMcpEnv(mcp.id, k, "");
                        }}
                        className="text-[10px] text-app-accent hover:underline"
                      >
                        + 添加 env 变量
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {sortedMcps.length === 0 && (
            <div className="text-[11px] text-app-muted">
              远程暂无 MCP 索引，
              <button
                onClick={refreshLibrary}
                className="ml-1 text-app-accent hover:underline"
              >
                试试刷新 →
              </button>
            </div>
          )}
        </section>

        {/* settings override */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            ⚙️ Settings 覆盖（JSON）
          </div>
          <textarea
            value={settingsOverride}
            onChange={(e) => setSettingsOverride(e.target.value)}
            rows={6}
            className="w-full bg-app-surface text-xs text-app-text px-3 py-2 rounded-lg border border-app-border font-mono"
          />
        </section>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-app-border">
          <button
            onClick={() => handleSave(false)}
            className="px-4 py-2 text-sm bg-app-surface border border-app-border text-app-secondary rounded-lg hover:text-app-text"
          >
            保存
          </button>
          <button
            onClick={() => handleSave(true)}
            className="px-4 py-2 text-sm bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
          >
            保存并激活
          </button>
        </div>
      </div>
    </div>
  );
}
