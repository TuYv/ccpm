import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore, useUiStore } from "../stores";
import type { Recipe, ScopeArg } from "../types/core";
import ActivationDialog from "../components/ActivationDialog";
import ScopeSelector from "../components/ScopeSelector";

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
  const skillsCount = recipe.skills?.length ?? 0;
  const mcpsCount = recipe.mcps?.length ?? 0;
  return (
    <div
      className={`bg-app-card rounded-xl px-5 py-4 flex items-center gap-4 ${
        isActive ? "border-2 border-app-green/50" : "border border-app-border"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isActive && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-app-green/20 text-app-green border border-app-green/30">
              ✓ 激活中
            </span>
          )}
          <span className="text-base font-semibold text-app-text">{recipe.name}</span>
        </div>
        <div className="text-xs text-app-muted mt-1 truncate">{recipe.description}</div>
        <div className="text-[11px] text-app-secondary mt-2 flex gap-3">
          {recipe.claude_md && <span>📄 {recipe.claude_md}</span>}
          {skillsCount > 0 && <span>⚡ {skillsCount} skills</span>}
          {mcpsCount > 0 && <span>🔌 {mcpsCount} MCPs</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isActive && (
          <button
            onClick={onActivate}
            className="px-3 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
          >
            激活
          </button>
        )}
        <button
          onClick={onEdit}
          className="px-3 py-1.5 text-xs bg-app-surface border border-app-border text-app-secondary rounded-lg hover:bg-app-cardHover"
        >
          编辑
        </button>
        <button
          onClick={onDelete}
          className="px-2 py-1.5 text-xs text-app-muted hover:text-app-red"
          title="删除"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const { recipes, active, loading, load, remove, activate } =
    useRecipesStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();
  const [scope, setScope] = useState<ScopeArg>({ kind: "global" });
  const [pendingActivate, setPendingActivate] = useState<Recipe | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const activeId = scope.kind === "global" ? active?.global : active?.projects?.[scope.path];

  async function handleDelete(id: string) {
    if (!confirm("删除该配方？")) return;
    try {
      await remove(id);
      addToast("✓ 已删除", "success");
    } catch (e) {
      addToast(`删除失败：${String(e)}`, "error");
    }
  }

  async function confirmActivate(recipe: Recipe) {
    try {
      await activate(recipe.id, scope);
      addToast(`✓ 已激活 ${recipe.name}`, "success");
      setPendingActivate(null);
    } catch (e) {
      addToast(`激活失败：${String(e)}`, "error");
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-app-border flex items-center gap-3">
        <button
          onClick={() => navigate("/recipes/new")}
          className="px-3 py-1.5 text-xs bg-app-accent text-white rounded-lg hover:bg-app-accentHover"
        >
          + 新建配方
        </button>
        <ScopeSelector scope={scope} onChange={setScope} />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {loading && recipes.length === 0 && (
          <div className="text-app-muted text-sm text-center py-12">加载中…</div>
        )}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="text-app-muted text-sm">还没有配方</div>
            <button
              onClick={() => navigate("/recipes/new")}
              className="px-4 py-2 text-sm bg-app-accent text-white rounded-lg"
            >
              创建第一个配方
            </button>
          </div>
        )}
        {recipes.map((r) => (
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

      {pendingActivate && (
        <ActivationDialog
          recipe={pendingActivate}
          scope={scope}
          onCancel={() => setPendingActivate(null)}
          onConfirm={() => confirmActivate(pendingActivate)}
        />
      )}
    </div>
  );
}
