import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore, useUiStore } from "../stores";
import type { Recipe, ScopeArg } from "../types/core";
import ActivationDialog from "../components/ActivationDialog";
import ScopeSelector from "../components/ScopeSelector";
import { RecipeListRow } from "../components/recipes/RecipeListRow";
import { Button, EmptyState } from "../components/ui";

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
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-app-border bg-app-bg px-4">
        <ScopeSelector scope={scope} onChange={setScope} />
        <div className="flex-1" />
        <Button size="sm" variant="primary" onClick={() => navigate("/recipes/new")}>
          新建配方
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading && recipes.length === 0 && (
          <div className="py-12 text-center text-sm text-app-muted">加载中…</div>
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
        {recipes.length > 0 && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(132px,0.75fr)_76px_minmax(156px,auto)] gap-3 px-3 text-[11px] font-medium text-app-muted">
              <div>配方</div>
              <div>组件</div>
              <div>状态</div>
              <div className="text-right">操作</div>
            </div>
            {recipes.map((r) => (
              <RecipeListRow
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
    </div>
  );
}
