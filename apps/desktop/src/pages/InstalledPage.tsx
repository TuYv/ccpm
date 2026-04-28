import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore } from "../stores";

export default function InstalledPage() {
  const { recipes, active, load } = useRecipesStore();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [load]);

  function findRecipe(id: string) {
    return recipes.find((r) => r.id === id);
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <div className="text-xs uppercase text-app-muted mb-2">全局 · ~/.claude/</div>
        {active?.global ? (
          <div className="bg-app-card border border-app-green/40 rounded-xl p-5">
            <div className="text-base font-semibold text-app-text">
              ✓ {findRecipe(active.global)?.name ?? active.global}
            </div>
            <div className="text-xs text-app-muted mt-1">
              {findRecipe(active.global)?.description}
            </div>
            <button
              onClick={() => navigate(`/recipes/${active.global}`)}
              className="mt-3 px-3 py-1 text-xs bg-app-surface border border-app-border rounded-lg text-app-secondary"
            >
              查看配方
            </button>
          </div>
        ) : (
          <div className="text-app-muted text-sm">未激活任何配方</div>
        )}
      </div>

      <div>
        <div className="text-xs uppercase text-app-muted mb-2">项目级</div>
        {Object.keys(active?.projects ?? {}).length === 0 ? (
          <div className="text-app-muted text-sm">未激活任何项目级配方</div>
        ) : (
          <div className="space-y-3">
            {Object.entries(active?.projects ?? {}).map(([proj, rid]) => (
              <div
                key={proj}
                className="bg-app-card border border-app-border rounded-xl p-4"
              >
                <div className="text-xs font-mono text-app-muted">{proj}</div>
                <div className="text-sm font-semibold text-app-text mt-1">
                  ✓ {findRecipe(rid)?.name ?? rid}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
