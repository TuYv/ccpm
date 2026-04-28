import type { Recipe, ScopeArg } from "../types/core";

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
  const writes: string[] = [];
  if (recipe.claude_md) writes.push(`${targetDir}/CLAUDE.md`);
  for (const s of recipe.skills ?? []) writes.push(`${targetDir}/skills/${s}/SKILL.md`);
  if ((recipe.mcps?.length ?? 0) > 0)
    writes.push(`${targetDir}/settings.json (mcpServers 字段合并)`);
  const overrideKeys = Object.keys(recipe.settings_override ?? {});
  if (overrideKeys.length > 0)
    writes.push(`${targetDir}/settings.json (覆盖字段：${overrideKeys.join(", ")})`);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-app-card border border-app-border rounded-xl w-full max-w-md p-6">
        <h2 className="text-base font-semibold text-app-text mb-1">
          激活「{recipe.name}」
        </h2>
        <div className="text-xs text-app-muted mb-4">
          目标 scope：{scope.kind === "global" ? "全局" : scope.path}
        </div>

        <div className="bg-app-surface rounded-lg border border-app-border p-3 mb-4">
          <div className="text-[10px] uppercase text-app-muted mb-2">将写入</div>
          <ul className="text-xs text-app-secondary space-y-1 font-mono">
            {writes.length === 0 ? (
              <li className="text-app-muted italic">空配方，无写入</li>
            ) : (
              writes.map((w) => (
                <li key={w} className="truncate">
                  → {w}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="text-[11px] text-yellow-400 mb-4">
          ⚠ 激活前会自动备份当前文件，可在「备份」tab 一键回滚。
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
            disabled={writes.length === 0}
            className="px-4 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover disabled:opacity-40"
          >
            确认激活
          </button>
        </div>
      </div>
    </div>
  );
}
