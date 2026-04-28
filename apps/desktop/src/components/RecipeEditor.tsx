import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/claudePreset";
import { useRecipesStore, useUiStore } from "../stores";
import type { Recipe, RecipeMcpEntry } from "../types/core";
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
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableMcps, setAvailableMcps] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const isNew = !id || id === NEW_ID_SENTINEL;

  async function refreshLibrary() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const [cm, sk, mc] = await Promise.all([
        api.listLibraryItems("claude-md"),
        api.listLibraryItems("skill"),
        api.listLibraryItems("mcp"),
      ]);
      setAvailableClaudeMds(cm);
      setAvailableSkills(sk);
      setAvailableMcps(mc);
      addToast("✓ 已刷新库", "success");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    Promise.all([
      api.listLibraryItems("claude-md"),
      api.listLibraryItems("skill"),
      api.listLibraryItems("mcp"),
    ]).then(([cm, sk, mc]) => {
      setAvailableClaudeMds(cm);
      setAvailableSkills(sk);
      setAvailableMcps(mc);
    });
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
          <div className="grid grid-cols-2 gap-2">
            {availableSkills.map((sId) => (
              <label
                key={sId}
                className="flex items-center gap-2 px-3 py-2 bg-app-surface rounded-lg border border-app-border cursor-pointer hover:bg-app-cardHover"
              >
                <input
                  type="checkbox"
                  checked={skillIds.includes(sId)}
                  onChange={() => toggleSkill(sId)}
                  className="accent-app-accent"
                />
                <span className="text-xs text-app-text truncate">{sId}</span>
              </label>
            ))}
          </div>
          {availableSkills.length === 0 && (
            <div className="text-[11px] text-app-muted">
              库里还没有 skill。
              <button
                onClick={() => navigate("/skills")}
                className="ml-1 text-app-accent hover:underline"
              >
                去 Skills tab 下载 →
              </button>
            </div>
          )}
        </section>

        {/* MCPs */}
        <section>
          <div className="text-xs uppercase tracking-wider text-app-muted mb-2">
            🔌 MCPs
          </div>
          {availableMcps.length === 0 && (
            <div className="text-[11px] text-app-muted mb-2">
              库里还没有 MCP。
              <button
                onClick={() => navigate("/mcp")}
                className="ml-1 text-app-accent hover:underline"
              >
                去 MCP tab 下载 →
              </button>
            </div>
          )}
          <div className="space-y-2">
            {availableMcps.map((mId) => {
              const entry = mcpEntries.find((m) => m.library_id === mId);
              const checked = !!entry;
              return (
                <div
                  key={mId}
                  className="bg-app-surface rounded-lg border border-app-border px-3 py-2"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMcp(mId)}
                      className="accent-app-accent"
                    />
                    <span className="text-xs text-app-text">{mId}</span>
                  </label>
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
                            onChange={(e) => setMcpEnv(mId, k, e.target.value)}
                            className="flex-1 bg-app-bg text-[11px] text-app-text px-2 py-1 rounded border border-app-border font-mono"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const k = prompt("env key");
                          if (k) setMcpEnv(mId, k, "");
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
