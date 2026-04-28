import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/claudePreset";
import { useRecipesStore, useUiStore } from "../stores";
import type { McpMeta, Recipe, RecipeMcpEntry, SkillMeta } from "../types/core";
import { ActivationSummary } from "./recipes/ActivationSummary";
import { ComponentPicker } from "./recipes/ComponentPicker";
import { EditorSection } from "./recipes/EditorSection";
import { SelectedStack } from "./recipes/SelectedStack";
import { Button, Field, TextArea, TextInput } from "./ui";

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
  const [saving, setSaving] = useState(false);

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
    if (isNew || !id) return;
    api
      .getRecipe(id)
      .then((r) => {
        setName(r.name);
        setDescription(r.description ?? "");
        setClaudeMdId(r.claude_md ?? null);
        setSkillIds(r.skills ?? []);
        setMcpEntries(r.mcps ?? []);
        setSettingsOverride(JSON.stringify(r.settings_override ?? {}, null, 2));
      })
      .catch((e) => addToast(`加载配方失败：${String(e)}`, "error"));
  }, [id, isNew, addToast]);

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

  const componentCount = useMemo(() => {
    let settingsCount = 0;
    try {
      settingsCount =
        Object.keys(JSON.parse(settingsOverride || "{}") as Record<string, unknown>).length > 0
          ? 1
          : 0;
    } catch {
      settingsCount = 0;
    }
    return (claudeMdId ? 1 : 0) + skillIds.length + mcpEntries.length + settingsCount;
  }, [claudeMdId, skillIds, mcpEntries, settingsOverride]);

  async function handleSave(activateAfter: boolean) {
    let parsedOverride: Record<string, unknown> = {};
    try {
      parsedOverride = JSON.parse(settingsOverride);
    } catch {
      addToast("settings 覆盖必须是合法 JSON", "error");
      return;
    }
    setSaving(true);
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
    } finally {
      setSaving(false);
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
    <div className="grid h-full min-h-0 grid-cols-[260px_minmax(340px,1fr)_300px] overflow-auto">
      <aside className="flex min-h-0 flex-col gap-4 border-r border-app-border bg-app-bg p-4">
        <button
          onClick={() => navigate("/recipes")}
          className="self-start text-xs text-app-muted hover:text-app-text"
        >
          ← 返回配方
        </button>
        <EditorSection title="配方信息">
          <Field label="名称">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="配方名称"
            />
          </Field>
          <Field label="说明">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要说明"
              rows={4}
            />
          </Field>
        </EditorSection>
        <EditorSection title="库状态">
          <Button variant="secondary" size="sm" onClick={refreshLibrary} disabled={refreshing}>
            {refreshing ? "刷新中…" : "刷新库"}
          </Button>
        </EditorSection>
        <div className="mt-auto">
          <ActivationSummary
            isNew={isNew}
            name={name}
            componentCount={componentCount}
            saving={saving}
            onSave={() => handleSave(false)}
            onSaveAndActivate={() => handleSave(true)}
          />
        </div>
      </aside>

      <section className="min-h-0 overflow-y-auto border-r border-app-border bg-app-bg p-4">
        <ComponentPicker
          claudeMds={availableClaudeMds}
          skills={sortedSkills}
          mcps={sortedMcps}
          selectedClaudeMd={claudeMdId}
          selectedSkills={skillIds}
          selectedMcps={mcpEntries}
          librarySkills={librarySkills}
          libraryMcps={libraryMcps}
          downloadingSkill={downloadingSkill}
          downloadingMcp={downloadingMcp}
          onSelectClaudeMd={setClaudeMdId}
          onToggleSkill={toggleSkill}
          onToggleMcp={toggleMcp}
          onDownloadSkill={handleDownloadSkill}
          onDownloadMcp={handleDownloadMcp}
        />
      </section>

      <aside className="min-h-0 overflow-y-auto bg-app-bg p-4">
        <SelectedStack
          claudeMdId={claudeMdId}
          skillIds={skillIds}
          mcpEntries={mcpEntries}
          settingsOverride={settingsOverride}
          onSettingsOverrideChange={setSettingsOverride}
          onSetMcpEnv={setMcpEnv}
        />
      </aside>
    </div>
  );
}
