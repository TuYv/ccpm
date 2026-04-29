import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  useConfigStore,
  useInstalledStore,
  useMcpsStore,
  useRecipesStore,
  useSkillsStore,
  useUiStore,
} from "../stores";
import type { ActivePresetInfo, ScopeArg } from "../types/core";
import Topbar from "../components/Topbar";
import {
  Button,
  Chip,
  Glyph,
  SectionLabel,
  Tag,
} from "../components/ui";

// ── icons ──────────────────────────────────────────────────────────────────
const GlobeIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="8" cy="8" r="6" />
    <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" />
  </svg>
);

const FolderIcon = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.4l1.3 1.5h5.3A1.5 1.5 0 0 1 14 6v5.5A1.5 1.5 0 0 1 12.5 13h-9A1.5 1.5 0 0 1 2 11.5v-7Z" />
  </svg>
);

// ── helpers ────────────────────────────────────────────────────────────────
function relativeTime(iso?: string | null): string | null {
  if (!iso) return null;
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: zhCN });
  } catch {
    return null;
  }
}

interface ScopeSection {
  key: string;
  kind: "global" | "project";
  path: string;
  info: ActivePresetInfo | null;
  skills: string[];
  mcps: string[];
}

// ── active preset card ─────────────────────────────────────────────────────
function ActivePresetCard({
  section,
  recipeName,
  skillsLookup,
  mcpsLookup,
  onDeactivate,
}: {
  section: ScopeSection;
  recipeName: string;
  skillsLookup: (id: string) => string;
  mcpsLookup: (id: string) => string;
  onDeactivate: () => void;
}) {
  const info = section.info!;
  const rel = relativeTime(info.activated_at);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "12px 14px",
        background: "var(--card-2)",
        borderRadius: 10,
      }}
    >
      <Glyph name={recipeName} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14 }}>{recipeName}</span>
          <Chip tone="accent">v{info.preset_version}</Chip>
          <Chip tone="green" dot>
            active{rel ? ` · ${rel}` : ""}
          </Chip>
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <SectionLabel style={{ marginBottom: 4 }}>
              Skills · {section.skills.length}
            </SectionLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {section.skills.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>—</span>
              ) : (
                section.skills.map((id) => (
                  <Tag key={id}>{skillsLookup(id)}</Tag>
                ))
              )}
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <SectionLabel style={{ marginBottom: 4 }}>
              MCPs · {section.mcps.length}
            </SectionLabel>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {section.mcps.length === 0 ? (
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>—</span>
              ) : (
                section.mcps.map((id) => (
                  <Tag key={id}>{mcpsLookup(id)}</Tag>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Button size="sm" variant="subtle" onClick={onDeactivate}>
        Deactivate
      </Button>
    </div>
  );
}

// ── scope card ─────────────────────────────────────────────────────────────
function ScopeCard({
  section,
  recipeName,
  skillsLookup,
  mcpsLookup,
  onShowFiles,
  onRestoreBaseline,
  onDeactivate,
  onActivate,
}: {
  section: ScopeSection;
  recipeName: string;
  skillsLookup: (id: string) => string;
  mcpsLookup: (id: string) => string;
  onShowFiles: () => void;
  onRestoreBaseline: () => void;
  onDeactivate: () => void;
  onActivate: () => void;
}) {
  const isGlobal = section.kind === "global";
  return (
    <div className="card" style={{ padding: "18px 20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <span style={{ color: "var(--ink-2)", display: "inline-flex" }}>
          {isGlobal ? GlobeIcon : FolderIcon}
        </span>
        <span
          className="mono"
          style={{
            fontSize: 12.5,
            color: "var(--ink)",
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {isGlobal ? "Global · ~/.claude" : `Project · ${section.path}`}
        </span>
        <span style={{ flex: 1 }} />
        <Button
          size="sm"
          variant="subtle"
          onClick={onShowFiles}
          disabled={!section.info}
        >
          查看文件
        </Button>
        {isGlobal ? (
          <Button size="sm" variant="subtle" onClick={onRestoreBaseline}>
            Restore baseline
          </Button>
        ) : (
          <Button
            size="sm"
            variant="subtle"
            disabled
            title="项目级 baseline 暂不支持"
          >
            Restore baseline
          </Button>
        )}
      </div>

      {section.info ? (
        <ActivePresetCard
          section={section}
          recipeName={recipeName}
          skillsLookup={skillsLookup}
          mcpsLookup={mcpsLookup}
          onDeactivate={onDeactivate}
        />
      ) : (
        <div
          style={{
            padding: "18px 14px",
            background: "var(--card-2)",
            borderRadius: 10,
            color: "var(--ink-3)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          No preset active in this scope.
          <Button
            size="sm"
            variant="subtle"
            style={{ marginLeft: 10 }}
            onClick={onActivate}
          >
            + Activate one
          </Button>
        </div>
      )}
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────
export default function InstalledPage() {
  const navigate = useNavigate();
  const installed = useInstalledStore((s) => s.state);
  const loadInstalled = useInstalledStore((s) => s.load);
  const recipes = useRecipesStore((s) => s.recipes);
  const loadRecipes = useRecipesStore((s) => s.load);
  const deactivate = useRecipesStore((s) => s.deactivate);
  const skillsIndex = useSkillsStore((s) => s.index);
  const fetchSkillsIndex = useSkillsStore((s) => s.fetchIndex);
  const mcpsIndex = useMcpsStore((s) => s.index);
  const fetchMcpsIndex = useMcpsStore((s) => s.fetchIndex);
  const restoreBaseline = useConfigStore((s) => s.restoreBaseline);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    loadInstalled();
    loadRecipes();
    if (!skillsIndex) fetchSkillsIndex();
    if (!mcpsIndex) fetchMcpsIndex();
  }, [
    loadInstalled,
    loadRecipes,
    skillsIndex,
    fetchSkillsIndex,
    mcpsIndex,
    fetchMcpsIndex,
  ]);

  const sections: ScopeSection[] = [
    {
      key: "global",
      kind: "global" as const,
      path: "~/.claude",
      info: installed?.global ?? null,
      skills: installed?.global_skills ?? [],
      mcps: installed?.global_mcps ?? [],
    },
    ...Object.entries(installed?.projects ?? {}).map(([path, info]) => ({
      key: `project:${path}`,
      kind: "project" as const,
      path,
      info,
      skills: installed?.project_skills?.[path] ?? [],
      mcps: installed?.project_mcps?.[path] ?? [],
    })),
  ];

  const scopeCount = sections.length;
  const activeCount = sections.filter((s) => s.info).length;

  function recipeName(info: ActivePresetInfo): string {
    return (
      recipes.find((r) => r.id === info.active_preset_id)?.name ??
      info.active_preset_id
    );
  }

  function skillsLookup(id: string): string {
    return skillsIndex?.skills.find((s) => s.id === id)?.name ?? id;
  }

  function mcpsLookup(id: string): string {
    return mcpsIndex?.mcps.find((m) => m.id === id)?.name ?? id;
  }

  async function handleRestoreBaseline() {
    try {
      await restoreBaseline();
      addToast("已恢复基线", "success");
      await loadInstalled();
    } catch (e) {
      addToast(String(e), "error");
    }
  }

  async function handleDeactivate(section: ScopeSection) {
    const scopeArg: ScopeArg =
      section.kind === "global"
        ? { kind: "global" }
        : { kind: "project", path: section.path };
    try {
      await deactivate(scopeArg);
      addToast("已停用", "success");
      await loadInstalled();
    } catch (e) {
      addToast(`停用失败：${String(e)}`, "error");
    }
  }

  function handleShowFiles(section: ScopeSection) {
    if (!section.info) return;
    const count = section.info.files.length;
    addToast(`${count} 个文件 · ${section.info.files.slice(0, 3).join(", ")}${count > 3 ? "…" : ""}`, "success");
  }

  return (
    <>
      <Topbar
        title="已安装"
        crumb={`${scopeCount} 个 scope · ${activeCount} 个激活预设`}
      />
      <div
        className="content"
        style={{ display: "grid", gap: 16, padding: "22px 28px" }}
      >
        {sections.map((section) => (
          <ScopeCard
            key={section.key}
            section={section}
            recipeName={section.info ? recipeName(section.info) : ""}
            skillsLookup={skillsLookup}
            mcpsLookup={mcpsLookup}
            onShowFiles={() => handleShowFiles(section)}
            onRestoreBaseline={handleRestoreBaseline}
            onDeactivate={() => handleDeactivate(section)}
            onActivate={() => navigate("/recipes")}
          />
        ))}
      </div>
    </>
  );
}
