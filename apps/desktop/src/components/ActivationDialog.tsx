import { useNavigate } from "react-router-dom";
import { useInstalledStore, useMcpsStore } from "../stores";
import type { InstalledState, Recipe, ScopeArg } from "../types/core";
import { Banner, Button, SectionLabel } from "./ui";

function getScopeView(installed: InstalledState | null, scope: ScopeArg) {
  const isProject = scope.kind === "project";
  const path = isProject ? scope.path : null;
  return {
    installedSkills: path
      ? installed?.project_skills?.[path] ?? []
      : installed?.global_skills ?? [],
    installedMcps: path
      ? installed?.project_mcps?.[path] ?? []
      : installed?.global_mcps ?? [],
    activeFiles: path
      ? installed?.projects?.[path]?.files ?? []
      : installed?.global?.files ?? [],
    hasActive: path
      ? !!installed?.projects?.[path]
      : !!installed?.global,
  };
}

export default function ActivationDialog({
  recipe,
  scope,
  onCancel,
  onConfirm,
  onCustomize,
}: {
  recipe: Recipe;
  scope: ScopeArg;
  onCancel: () => void;
  onConfirm: () => void;
  onCustomize?: () => void;
}) {
  const navigate = useNavigate();
  const installed = useInstalledStore((s) => s.state);
  const mcpsIndex = useMcpsStore((s) => s.index?.mcps ?? []);

  const { installedSkills, installedMcps, activeFiles, hasActive } =
    getScopeView(installed, scope);

  const recipeSkillIds = recipe.skills ?? [];
  const recipeMcpIds = (recipe.mcps ?? []).map((m) => m.library_id);

  const diffLines: { kind: "+" | "-" | "~"; path: string }[] = [];

  for (const id of recipeSkillIds.filter((id) => !installedSkills.includes(id))) {
    diffLines.push({ kind: "+", path: `~/.claude/skills/${id}/` });
  }
  for (const id of recipeMcpIds.filter((id) => !installedMcps.includes(id))) {
    diffLines.push({ kind: "+", path: `~/.claude/mcps/${id}` });
  }
  if (recipe.claude_md && hasActive) {
    diffLines.push({ kind: "~", path: "~/.claude/CLAUDE.md" });
    diffLines.push({ kind: "~", path: "~/.claude/settings.json" });
  }
  const recipeFileBaseNames = new Set<string>([
    ...(recipe.claude_md ? ["CLAUDE.md", "settings.json"] : []),
  ]);
  for (const f of activeFiles) {
    const base = f.split("/").pop() ?? f;
    if (!recipeFileBaseNames.has(base)) {
      diffLines.push({ kind: "-", path: f });
    }
  }

  const envWarningCount = recipeMcpIds
    .map((id) => mcpsIndex.find((m) => m.id === id)?.required_env.length ?? 0)
    .filter((n) => n > 0).length;

  const scopeLabel =
    scope.kind === "global" ? "全局 ~/.claude" : `项目 ${scope.path}`;

  return (
    <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-head">
          <SectionLabel style={{ marginBottom: 8, display: "block" }}>
            Activate recipe
          </SectionLabel>
          <h3
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            切换到{" "}
            <span style={{ color: "var(--accent)" }}>{recipe.name}</span>?
          </h3>
        </div>
        <div className="modal-body">
          <p
            style={{
              fontSize: 13.5,
              color: "var(--ink-2)",
              lineHeight: 1.55,
              margin: "0 0 14px",
            }}
          >
            将替换 {scopeLabel} 的当前配置。原有文件会备份到{" "}
            <span className="mono" style={{ fontSize: 12 }}>
              ~/.claude/.ccpm/backups
            </span>
            。
          </p>
          <div
            style={{
              background: "var(--card-2)",
              borderRadius: 10,
              padding: "12px 14px",
              display: "grid",
              gap: 8,
            }}
          >
            <SectionLabel>Will overwrite</SectionLabel>
            <div
              className="mono"
              style={{ fontSize: 12, display: "grid", gap: 4 }}
            >
              {diffLines.slice(0, 8).map((line, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <span
                    style={{
                      color:
                        line.kind === "-"
                          ? "var(--red)"
                          : line.kind === "+"
                            ? "var(--green)"
                            : "var(--amber)",
                    }}
                  >
                    {line.kind}
                  </span>
                  <span>{line.path}</span>
                </div>
              ))}
              {diffLines.length > 8 && (
                <div style={{ color: "var(--ink-3)" }}>
                  + 还有 {diffLines.length - 8} 项…
                </div>
              )}
              {diffLines.length === 0 && (
                <div style={{ color: "var(--ink-3)" }}>无文件变更</div>
              )}
            </div>
          </div>
          {envWarningCount > 0 && (
            <div style={{ marginTop: 12 }}>
              <Banner
                tone="amber"
                dot
                onClick={() => {
                  navigate("/mcp");
                  onCancel();
                }}
              >
                {envWarningCount} 个 MCP 需要环境变量，激活前请先在 MCP 页配置
              </Banner>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <Button variant="subtle" onClick={onCancel}>
            取消
          </Button>
          {onCustomize && (
            <Button variant="subtle" onClick={onCustomize}>
              Customize files…
            </Button>
          )}
          <Button variant="primary" onClick={onConfirm}>
            激活
          </Button>
        </div>
      </div>
    </div>
  );
}
