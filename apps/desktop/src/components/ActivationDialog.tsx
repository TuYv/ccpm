import { useEffect, useState } from "react";
import { api } from "../api/claudePreset";
import type { Recipe, ScopeArg } from "../types/core";

type WriteEntry = {
  path: string;
  kind: "create" | "overwrite" | "update";
  preview?: string;
};

const SKILL_PREVIEW_LIMIT = 3;

const kindLabel = (k: WriteEntry["kind"]) =>
  k === "create"
    ? { text: "新增", cls: "bg-app-green/15 text-app-green border-app-green/30" }
    : k === "overwrite"
      ? { text: "覆盖", cls: "bg-yellow-900/30 text-yellow-300 border-yellow-700/40" }
      : { text: "更新字段", cls: "bg-app-accent/10 text-app-accent border-app-accent/20" };

export default function ActivationDialog({
  recipe,
  scope,
  onCancel,
  onConfirm,
}: {
  recipe: Recipe;
  scope: ScopeArg;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const targetDir = scope.kind === "global" ? "~/.claude/" : scope.path;
  const [writes, setWrites] = useState<WriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const list: WriteEntry[] = [];
      if (recipe.claude_md) {
        try {
          const [md] = await api.getLibraryClaudeMd(recipe.claude_md);
          list.push({ path: `${targetDir}/CLAUDE.md`, kind: "overwrite", preview: md });
        } catch {
          list.push({ path: `${targetDir}/CLAUDE.md`, kind: "overwrite" });
        }
      }
      const skills = recipe.skills ?? [];
      const previewSkills = skills.slice(0, SKILL_PREVIEW_LIMIT);
      for (const s of previewSkills) {
        try {
          const md = await api.getLibrarySkillMd(s);
          list.push({
            path: `${targetDir}/skills/${s}/SKILL.md`,
            kind: "create",
            preview: md,
          });
        } catch {
          list.push({ path: `${targetDir}/skills/${s}/SKILL.md`, kind: "create" });
        }
      }
      if (skills.length > SKILL_PREVIEW_LIMIT) {
        list.push({
          path: `${targetDir}/skills/… (+${skills.length - SKILL_PREVIEW_LIMIT} more)`,
          kind: "create",
        });
      }
      if ((recipe.mcps?.length ?? 0) > 0) {
        list.push({
          path: `${targetDir}/settings.json (mcpServers 字段合并)`,
          kind: "update",
        });
      }
      const overrideKeys = Object.keys(recipe.settings_override ?? {});
      if (overrideKeys.length > 0) {
        list.push({
          path: `${targetDir}/settings.json (覆盖字段：${overrideKeys.join(", ")})`,
          kind: "update",
        });
      }
      if (!cancelled) {
        setWrites(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [recipe, targetDir]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-app-card border border-app-border rounded-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-app-text mb-1">
          激活「{recipe.name}」
        </h2>
        <div className="text-xs text-app-muted mb-4">
          目标 scope：{scope.kind === "global" ? "全局" : scope.path}
        </div>

        <div className="bg-app-green/10 border border-app-green/30 rounded-lg px-3 py-2 mb-4 text-xs text-app-green">
          ✓ 激活前自动备份当前 ~/.claude/，可在「备份」tab 一键回滚
        </div>

        <div className="bg-app-surface rounded-lg border border-app-border p-3 mb-4 space-y-2">
          <div className="text-[10px] uppercase text-app-muted">
            {loading ? "加载预览中…" : `将写入 ${writes.length} 个文件`}
          </div>
          {loading ? (
            <div className="text-xs text-app-muted italic">加载预览中…</div>
          ) : writes.length === 0 ? (
            <div className="text-xs text-app-muted italic">空配方，无写入</div>
          ) : (
            writes.map((w) => {
              const b = kindLabel(w.kind);
              return (
                <div key={w.path}>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] rounded border ${b.cls}`}
                    >
                      {b.text}
                    </span>
                    <code className="text-xs font-mono text-app-secondary truncate flex-1">
                      {w.path}
                    </code>
                  </div>
                  {w.preview && (
                    <pre className="text-[10px] font-mono text-app-muted bg-app-bg rounded p-2 mt-1 max-h-24 overflow-hidden whitespace-pre-wrap">
                      {w.preview.slice(0, 200)}
                      {w.preview.length > 200 ? "…" : ""}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs bg-app-surface border border-app-border text-app-secondary rounded-lg"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={loading || writes.length === 0}
            className="px-4 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover disabled:opacity-40"
          >
            确认激活
          </button>
        </div>
      </div>
    </div>
  );
}
