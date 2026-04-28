import type { Recipe } from "../../types/core";
import { Badge, Button, ListRow } from "../ui";

interface RecipeListRowProps {
  recipe: Recipe;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getComponentSummary(recipe: Recipe) {
  const parts: string[] = [];
  const skillsCount = recipe.skills?.length ?? 0;
  const mcpsCount = recipe.mcps?.length ?? 0;

  if (recipe.claude_md) parts.push("CLAUDE.md");
  if (skillsCount > 0) parts.push(`${skillsCount} skills`);
  if (mcpsCount > 0) parts.push(`${mcpsCount} MCP`);

  return parts.length > 0 ? parts.join(" / ") : "空配方";
}

export function RecipeListRow({
  recipe,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: RecipeListRowProps) {
  return (
    <ListRow
      active={isActive}
      className="grid min-h-[52px] grid-cols-[minmax(0,1.55fr)_minmax(132px,0.75fr)_76px_minmax(156px,auto)] items-center gap-3 px-3 py-2"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-app-text">{recipe.name}</div>
        <div className="mt-0.5 truncate text-xs text-app-muted">
          {recipe.description || "无描述"}
        </div>
      </div>

      <div className="truncate text-xs text-app-secondary">{getComponentSummary(recipe)}</div>

      <div>{isActive && <Badge tone="active">激活中</Badge>}</div>

      <div className="flex items-center justify-end gap-1.5">
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
    </ListRow>
  );
}
