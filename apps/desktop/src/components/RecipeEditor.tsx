import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/claudePreset";
import { useRecipesStore, useUiStore } from "../stores";
import type { McpMeta, Recipe, RecipeMcpEntry, SkillMeta } from "../types/core";
import Topbar from "./Topbar";
import { isSecretEnvKey } from "../utils/env";
import {
  Button,
  Chip,
  Field,
  Glyph,
  IconButton,
  SectionLabel,
  SelectInput,
  TextArea,
  TextInput,
} from "./ui";

const NEW_ID_SENTINEL = "new";

function newId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const XIcon = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

const PlusGlyph = (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

// ── library picker popover ────────────────────────────────────────────────

interface PickerOption {
  id: string;
  name: string;
  description?: string;
  inLibrary: boolean;
}

function LibraryPicker({
  options,
  onPick,
  onDownloadAndPick,
  onClose,
  downloadingId,
  emptyHint,
}: {
  options: PickerOption[];
  onPick: (id: string) => void;
  onDownloadAndPick?: (id: string) => void;
  onClose: () => void;
  downloadingId?: string | null;
  emptyHint: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      `${o.id} ${o.name} ${o.description ?? ""}`.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 6px)",
        left: 0,
        zIndex: 30,
        width: 360,
        maxHeight: 360,
        background: "var(--card)",
        border: "1px solid var(--hairline)",
        borderRadius: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 8, borderBottom: "1px solid var(--hairline)" }}>
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索…"
          autoFocus
        />
      </div>
      <div style={{ overflowY: "auto", flex: 1, padding: 6 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "20px 12px", fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
            {emptyHint}
          </div>
        ) : (
          filtered.map((opt) => {
            const downloading = downloadingId === opt.id;
            return (
              <div
                key={opt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--card-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
                onClick={() => {
                  if (opt.inLibrary) {
                    onPick(opt.id);
                  } else if (onDownloadAndPick && !downloading) {
                    onDownloadAndPick(opt.id);
                  }
                }}
              >
                <Glyph name={opt.name} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                    {opt.name}
                  </div>
                  {opt.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-3)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {opt.description}
                    </div>
                  )}
                </div>
                <Chip tone={opt.inLibrary ? "green" : "neutral"}>
                  {opt.inLibrary ? "已下载" : downloading ? "下载中…" : "下载"}
                </Chip>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── main editor ───────────────────────────────────────────────────────────

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
  const [saving, setSaving] = useState(false);

  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [mcpPickerOpen, setMcpPickerOpen] = useState(false);

  const isNew = !id || id === NEW_ID_SENTINEL;
  const recipeId = isNew ? "new" : id!;

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

  const skillsMetaIndex = useMemo(() => {
    const m = new Map<string, SkillMeta>();
    for (const s of remoteSkills) m.set(s.id, s);
    return m;
  }, [remoteSkills]);

  const mcpsMetaIndex = useMemo(() => {
    const m = new Map<string, McpMeta>();
    for (const m2 of remoteMcps) m.set(m2.id, m2);
    return m;
  }, [remoteMcps]);

  const canSave = name.trim().length > 0 && !saving;

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
      addToast("已保存", "success");
      if (activateAfter) {
        await api.activateRecipe(recipe.id, { kind: "global" });
        addToast(`已激活 ${recipe.name}`, "success");
      }
      navigate("/recipes");
    } catch (e) {
      addToast(`保存失败：${String(e)}`, "error");
    } finally {
      setSaving(false);
    }
  }

  function addSkill(skillId: string) {
    setSkillIds((prev) => (prev.includes(skillId) ? prev : [...prev, skillId]));
    setSkillPickerOpen(false);
  }

  function removeSkill(skillId: string) {
    setSkillIds((prev) => prev.filter((s) => s !== skillId));
  }

  function addMcp(mcpId: string) {
    setMcpEntries((prev) =>
      prev.find((m) => m.library_id === mcpId) ? prev : [...prev, { library_id: mcpId, env: {} }],
    );
    setMcpPickerOpen(false);
  }

  function removeMcp(mcpId: string) {
    setMcpEntries((prev) => prev.filter((m) => m.library_id !== mcpId));
  }

  function setMcpEnv(mcpId: string, key: string, val: string) {
    setMcpEntries((prev) =>
      prev.map((m) =>
        m.library_id === mcpId ? { ...m, env: { ...m.env, [key]: val } } : m,
      ),
    );
  }

  function removeMcpEnv(mcpId: string, key: string) {
    setMcpEntries((prev) =>
      prev.map((m) => {
        if (m.library_id !== mcpId) return m;
        const env = { ...m.env };
        delete env[key];
        return { ...m, env };
      }),
    );
  }

  async function handleDownloadAndAddSkill(skillId: string) {
    const meta = skillsMetaIndex.get(skillId);
    if (!meta || downloadingSkill) return;
    setDownloadingSkill(skillId);
    try {
      await api.downloadSkillToLibrary(meta);
      setLibrarySkills((s) => new Set(s).add(skillId));
      addSkill(skillId);
      addToast(`已下载 ${meta.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    } finally {
      setDownloadingSkill(null);
    }
  }

  async function handleDownloadAndAddMcp(mcpId: string) {
    const meta = mcpsMetaIndex.get(mcpId);
    if (!meta || downloadingMcp) return;
    setDownloadingMcp(mcpId);
    try {
      await api.downloadMcpToLibrary(meta);
      setLibraryMcps((s) => new Set(s).add(mcpId));
      addMcp(mcpId);
      addToast(`已下载 ${meta.name}`, "success");
    } catch (e) {
      addToast(`下载失败：${String(e)}`, "error");
    } finally {
      setDownloadingMcp(null);
    }
  }

  // ── picker option lists ─────────────────────────────────────────────────

  const skillOptions: PickerOption[] = useMemo(() => {
    const out: PickerOption[] = [];
    const seen = new Set<string>();
    for (const sid of librarySkills) {
      if (skillIds.includes(sid)) continue;
      const meta = skillsMetaIndex.get(sid);
      out.push({
        id: sid,
        name: meta?.name ?? sid,
        description: meta?.description,
        inLibrary: true,
      });
      seen.add(sid);
    }
    for (const s of remoteSkills) {
      if (seen.has(s.id) || skillIds.includes(s.id)) continue;
      out.push({
        id: s.id,
        name: s.name,
        description: s.description,
        inLibrary: false,
      });
    }
    return out.sort((a, b) => {
      if (a.inLibrary !== b.inLibrary) return a.inLibrary ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [librarySkills, remoteSkills, skillIds, skillsMetaIndex]);

  const mcpOptions: PickerOption[] = useMemo(() => {
    const selectedSet = new Set(mcpEntries.map((m) => m.library_id));
    const out: PickerOption[] = [];
    const seen = new Set<string>();
    for (const mid of libraryMcps) {
      if (selectedSet.has(mid)) continue;
      const meta = mcpsMetaIndex.get(mid);
      out.push({
        id: mid,
        name: meta?.name ?? mid,
        description: meta?.description,
        inLibrary: true,
      });
      seen.add(mid);
    }
    for (const m of remoteMcps) {
      if (seen.has(m.id) || selectedSet.has(m.id)) continue;
      out.push({
        id: m.id,
        name: m.name,
        description: m.description,
        inLibrary: false,
      });
    }
    return out.sort((a, b) => {
      if (a.inLibrary !== b.inLibrary) return a.inLibrary ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, [libraryMcps, remoteMcps, mcpEntries, mcpsMetaIndex]);

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <>
      <Topbar
        title={isNew ? "新建配方" : "编辑配方"}
        crumb={isNew ? "recipes / new" : `recipes / ${recipeId}`}
        actions={
          <>
            <Button variant="subtle" onClick={() => navigate(-1)} disabled={saving}>
              取消
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSave(false)}
              disabled={!canSave}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={!canSave}
            >
              {saving ? "保存中…" : "保存并激活"}
            </Button>
          </>
        }
      />

      <div
        className="content"
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "grid",
          gap: 24,
          padding: "24px 28px",
        }}
      >
        {/* Basic fields */}
        <section style={{ display: "grid", gap: 14 }}>
          <SectionLabel>基本信息</SectionLabel>
          <Field label="名称" helper="此配方的展示名称">
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：日常开发"
            />
          </Field>
          <Field label="说明" helper="可选，简要介绍这个配方做什么">
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要说明"
              rows={3}
            />
          </Field>
        </section>

        {/* CLAUDE.md */}
        <section style={{ display: "grid", gap: 8 }}>
          <SectionLabel>CLAUDE.md</SectionLabel>
          <Field helper="选择库内的 CLAUDE.md 作为此配方的 prompt 文件">
            <SelectInput
              value={claudeMdId ?? ""}
              onChange={(e) => setClaudeMdId(e.target.value || null)}
            >
              <option value="">不使用 CLAUDE.md</option>
              {availableClaudeMds.map((cid) => (
                <option key={cid} value={cid}>
                  {cid}
                </option>
              ))}
            </SelectInput>
          </Field>
        </section>

        {/* Skills */}
        <section style={{ display: "grid", gap: 8 }}>
          <SectionLabel>Skills · {skillIds.length}</SectionLabel>

          {skillIds.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 10,
              }}
            >
              {skillIds.map((sid) => {
                const meta = skillsMetaIndex.get(sid);
                const displayName = meta?.name ?? sid;
                return (
                  <div
                    key={sid}
                    className="card"
                    style={{
                      padding: 12,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <Glyph name={displayName} size="sm" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayName}
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11,
                          color: "var(--ink-3)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sid}
                      </div>
                    </div>
                    <IconButton
                      icon={XIcon}
                      title="移除"
                      onClick={() => removeSkill(sid)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ position: "relative", justifySelf: "start" }}>
            <Button
              size="sm"
              variant="subtle"
              icon={PlusGlyph}
              onClick={() => setSkillPickerOpen((v) => !v)}
            >
              添加 skill
            </Button>
            {skillPickerOpen && (
              <LibraryPicker
                options={skillOptions}
                onPick={addSkill}
                onDownloadAndPick={handleDownloadAndAddSkill}
                onClose={() => setSkillPickerOpen(false)}
                downloadingId={downloadingSkill}
                emptyHint="没有可添加的 skill"
              />
            )}
          </div>
        </section>

        {/* MCPs */}
        <section style={{ display: "grid", gap: 8 }}>
          <SectionLabel>MCPs · {mcpEntries.length}</SectionLabel>

          {mcpEntries.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              {mcpEntries.map((entry) => {
                const meta = mcpsMetaIndex.get(entry.library_id);
                const displayName = meta?.name ?? entry.library_id;
                const env = entry.env ?? {};
                const keys = Object.keys(env);
                return (
                  <div
                    key={entry.library_id}
                    className="card"
                    style={{ padding: 12, display: "grid", gap: 10 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Glyph name={displayName} size="sm" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--ink)",
                          }}
                        >
                          {displayName}
                        </div>
                        <div
                          className="mono"
                          style={{ fontSize: 11, color: "var(--ink-3)" }}
                        >
                          {entry.library_id}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          const key = prompt("env key");
                          if (key?.trim()) setMcpEnv(entry.library_id, key.trim(), "");
                        }}
                      >
                        + 变量
                      </Button>
                      <IconButton
                        icon={XIcon}
                        title="移除"
                        onClick={() => removeMcp(entry.library_id)}
                      />
                    </div>

                    {keys.length > 0 && (
                      <div style={{ display: "grid", gap: 6 }}>
                        {keys.map((key) => (
                          <div
                            key={key}
                            style={{
                              display: "grid",
                              gridTemplateColumns: "140px 1fr auto",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <code
                              className="mono"
                              style={{
                                fontSize: 11,
                                color: "var(--ink-2)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {key}
                            </code>
                            <TextInput
                              type={isSecretEnvKey(key) ? "password" : "text"}
                              value={env[key] ?? ""}
                              onChange={(e) =>
                                setMcpEnv(entry.library_id, key, e.target.value)
                              }
                              className="font-mono text-xs"
                            />
                            <IconButton
                              icon={XIcon}
                              title="删除变量"
                              onClick={() => removeMcpEnv(entry.library_id, key)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ position: "relative", justifySelf: "start" }}>
            <Button
              size="sm"
              variant="subtle"
              icon={PlusGlyph}
              onClick={() => setMcpPickerOpen((v) => !v)}
            >
              添加 MCP
            </Button>
            {mcpPickerOpen && (
              <LibraryPicker
                options={mcpOptions}
                onPick={addMcp}
                onDownloadAndPick={handleDownloadAndAddMcp}
                onClose={() => setMcpPickerOpen(false)}
                downloadingId={downloadingMcp}
                emptyHint="没有可添加的 MCP"
              />
            )}
          </div>
        </section>

        {/* Settings override */}
        <section style={{ display: "grid", gap: 8 }}>
          <SectionLabel>Settings 覆盖</SectionLabel>
          <Field helper="激活配方时合并入 Claude settings 的 JSON。">
            <TextArea
              value={settingsOverride}
              onChange={(e) => setSettingsOverride(e.target.value)}
              rows={8}
              spellCheck={false}
              className="font-mono text-xs"
            />
          </Field>
        </section>
      </div>
    </>
  );
}
