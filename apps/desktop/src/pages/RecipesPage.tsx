import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useInstalledStore, useRecipesStore, useUiStore } from "../stores";
import { useScopeStore } from "../stores/scope";
import type { Recipe } from "../types/core";
import ActivationDialog from "../components/ActivationDialog";
import Topbar from "../components/Topbar";
import {
  Banner,
  Button,
  Chip,
  EmptyState,
  Glyph,
  SectionLabel,
  Tag,
  TextInput,
} from "../components/ui";

// ── helpers ────────────────────────────────────────────────────────────────
function recipeTags(r: Recipe): string[] {
  return ((r as unknown as { tags?: string[] }).tags ?? []).filter(Boolean);
}

function relativeTime(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: zhCN });
  } catch {
    return null;
  }
}

function scopeLabel(scope: { kind: "global" } | { kind: "project"; path: string }): string {
  return scope.kind === "global" ? "全局" : scope.path;
}

// ── tags popover ───────────────────────────────────────────────────────────
function TagsFilter({
  allTags,
  selected,
  onToggle,
  onClear,
}: {
  allTags: string[];
  selected: Set<string>;
  onToggle: (t: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <Button size="sm" variant="subtle" onClick={() => setOpen((v) => !v)}>
        Tags{selected.size > 0 ? ` · ${selected.size}` : ""}
      </Button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            zIndex: 20,
            minWidth: 200,
            maxHeight: 280,
            overflowY: "auto",
            background: "var(--card)",
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            padding: 8,
            boxShadow: "var(--shadow-md)",
          }}
        >
          {allTags.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)", padding: "6px 8px" }}>
              暂无标签
            </div>
          ) : (
            <>
              {allTags.map((t) => {
                const checked = selected.has(t);
                return (
                  <label
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 8px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "var(--ink)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(t)}
                    />
                    <span>{t}</span>
                  </label>
                );
              })}
              {selected.size > 0 && (
                <div
                  style={{
                    borderTop: "1px solid var(--hairline)",
                    marginTop: 6,
                    paddingTop: 6,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button size="sm" variant="subtle" onClick={onClear}>
                    清空
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── recipe row ─────────────────────────────────────────────────────────────
function RecipeRow({
  recipe,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const updatedRel = relativeTime(recipe.updated_at);
  const skillsCount = recipe.skills?.length ?? 0;
  const mcpsCount = recipe.mcps?.length ?? 0;
  const tags = recipeTags(recipe);

  return (
    <div
      className="card"
      style={{
        padding: "16px 18px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 16,
        alignItems: "center",
        borderColor: isActive ? "var(--accent)" : undefined,
        boxShadow: isActive ? "0 0 0 3px var(--accent-soft)" : undefined,
      }}
    >
      <Glyph name={recipe.name} size="lg" />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em" }}>
            {recipe.name}
          </span>
          {isActive && (
            <Chip tone="accent" dot>
              active
            </Chip>
          )}
          {updatedRel && (
            <span style={{ fontSize: 11, color: "var(--ink-3)", marginLeft: 4 }}>
              更新于 {updatedRel}
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--ink-2)",
            marginBottom: 8,
            lineHeight: 1.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {recipe.description || "无描述"}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {recipe.claude_md && <Chip>CLAUDE.md</Chip>}
          {skillsCount > 0 && <Chip tone="blue">{skillsCount} skills</Chip>}
          {mcpsCount > 0 && <Chip tone="green">{mcpsCount} mcps</Chip>}
          {tags.length > 0 && (
            <span
              style={{
                width: 1,
                height: 12,
                background: "var(--hairline)",
                margin: "0 4px",
              }}
            />
          )}
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {!isActive && (
          <Button size="sm" variant="primary" onClick={onActivate}>
            激活
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onEdit}>
          编辑
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete}>
          删除
        </Button>
      </div>
    </div>
  );
}

// ── icons (inline SVG) ─────────────────────────────────────────────────────
const RefreshIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 8a6 6 0 1 1-1.76-4.24" />
    <path d="M14 2v4h-4" />
  </svg>
);

const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

// ── page ───────────────────────────────────────────────────────────────────
export default function RecipesPage() {
  const { recipes, active, loading, load, remove, activate, deactivate } =
    useRecipesStore();
  const installedState = useInstalledStore((s) => s.state);
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const scope = useScopeStore((s) => s.scope);
  const [pendingActivate, setPendingActivate] = useState<Recipe | null>(null);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
  }, [load]);

  const activeId =
    scope.kind === "global" ? active?.global : active?.projects?.[scope.path];
  const activeRecipe = activeId
    ? recipes.find((r) => r.id === activeId) ?? null
    : null;
  const activeMeta =
    scope.kind === "global"
      ? installedState?.global ?? null
      : installedState?.projects?.[scope.path] ?? null;
  const activatedRel = relativeTime(activeMeta?.activated_at ?? null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of recipes) for (const t of recipeTags(r)) set.add(t);
    return Array.from(set).sort();
  }, [recipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (q) {
        const hay = `${r.name} ${r.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedTags.size > 0) {
        const tags = recipeTags(r);
        for (const t of selectedTags) if (!tags.includes(t)) return false;
      }
      return true;
    });
  }, [recipes, query, selectedTags]);

  async function handleDelete(id: string) {
    if (!confirm("删除该配方？")) return;
    try {
      await remove(id);
      addToast("已删除", "success");
    } catch (e) {
      addToast(`删除失败：${String(e)}`, "error");
    }
  }

  async function confirmActivate(recipe: Recipe) {
    try {
      await activate(recipe.id, scope);
      addToast(`已激活 ${recipe.name}`, "success");
      setPendingActivate(null);
    } catch (e) {
      addToast(`激活失败：${String(e)}`, "error");
    }
  }

  async function handleDeactivate() {
    try {
      await deactivate(scope);
      addToast("已停用", "success");
    } catch (e) {
      addToast(`停用失败：${String(e)}`, "error");
    }
  }

  function toggleTag(t: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  return (
    <>
      <Topbar
        title="配方"
        crumb={`recipes / ${scopeLabel(scope)}`}
        actions={
          <>
            <Button size="sm" variant="subtle" onClick={() => load()} title="刷新">
              {RefreshIcon}
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate("/recipes/new")}
            >
              {PlusIcon}
              <span>新建配方</span>
            </Button>
          </>
        }
      />

      <div
        className="content"
        style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr" }}
      >
        {activeRecipe && (
          <Banner
            tone="accent"
            dot
            lead={<strong>{activeRecipe.name}</strong>}
            actions={
              <>
                <Button size="sm" variant="secondary" onClick={handleDeactivate}>
                  停用
                </Button>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => navigate("/installed")}
                >
                  查看文件
                </Button>
              </>
            }
          >
            <span style={{ color: "var(--ink-3)" }}>
              在 {scopeLabel(scope)} 已激活
              {activatedRel ? ` · ${activatedRel}` : ""}
            </span>
          </Banner>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SectionLabel>你的配方 · {recipes.length}</SectionLabel>
          <div style={{ flex: 1 }} />
          <div style={{ width: 240 }}>
            <TextInput
              placeholder="筛选…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <TagsFilter
            allTags={allTags}
            selected={selectedTags}
            onToggle={toggleTag}
            onClear={() => setSelectedTags(new Set())}
          />
        </div>

        {loading && recipes.length === 0 && (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 13, color: "var(--ink-3)" }}>
            加载中…
          </div>
        )}

        {!loading && recipes.length === 0 && (
          <EmptyState
            title="还没有配方"
            description="创建配方后，可以按全局或项目范围激活。"
            action={
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate("/recipes/new")}
              >
                创建第一个配方
              </Button>
            }
          />
        )}

        {recipes.length > 0 && filtered.length === 0 && (
          <EmptyState
            title="没有匹配的配方"
            description="试试清空筛选条件。"
          />
        )}

        {filtered.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((r) => (
              <RecipeRow
                key={r.id}
                recipe={r}
                isActive={activeId === r.id}
                onActivate={() => setPendingActivate(r)}
                onEdit={() => navigate(`/recipes/${r.id}`)}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {pendingActivate && (
        <ActivationDialog
          recipe={pendingActivate}
          scope={scope}
          onCancel={() => setPendingActivate(null)}
          onConfirm={() => confirmActivate(pendingActivate)}
        />
      )}
    </>
  );
}
