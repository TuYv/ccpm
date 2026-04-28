import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecipesStore } from "../stores";
import { Badge, Button, EmptyState, Panel } from "../components/ui";

export default function InstalledPage() {
  const { recipes, active, load } = useRecipesStore();
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [load]);

  function findRecipe(id: string) {
    return recipes.find((r) => r.id === id);
  }

  const projectEntries = Object.entries(active?.projects ?? {});

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <div className="text-xs uppercase text-app-muted mb-2">全局 · ~/.claude/</div>
        {active?.global ? (
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-app-text">
                  {findRecipe(active.global)?.name ?? active.global}
                </div>
                <div className="mt-1 text-xs text-app-muted">
                  {findRecipe(active.global)?.description}
                </div>
              </div>
              <Badge tone="success">全局激活</Badge>
            </div>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => navigate(`/recipes/${active.global}`)}
            >
              查看配方
            </Button>
          </Panel>
        ) : (
          <EmptyState title="未激活任何配方" description="到「配方」页选择一个配方激活。" />
        )}
      </div>

      <div>
        <div className="text-xs uppercase text-app-muted mb-2">项目级</div>
        {projectEntries.length === 0 ? (
          <EmptyState
            title="未激活任何项目级配方"
            description="在项目目录下激活配方后会出现在这里。"
          />
        ) : (
          <div className="space-y-3">
            {projectEntries.map(([proj, rid]) => (
              <Panel key={proj} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-app-muted truncate">{proj}</div>
                    <div className="text-sm font-semibold text-app-text mt-1">
                      {findRecipe(rid)?.name ?? rid}
                    </div>
                  </div>
                  <Badge tone="success">项目激活</Badge>
                </div>
                <Button className="mt-3" size="sm" onClick={() => navigate(`/recipes/${rid}`)}>
                  查看配方
                </Button>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
