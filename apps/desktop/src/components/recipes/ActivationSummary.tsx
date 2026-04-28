import { Badge, Button } from "../ui";

interface ActivationSummaryProps {
  isNew: boolean;
  name: string;
  componentCount: number;
  saving: boolean;
  onSave: () => void;
  onSaveAndActivate: () => void;
}

export function ActivationSummary({
  isNew,
  name,
  componentCount,
  saving,
  onSave,
  onSaveAndActivate,
}: ActivationSummaryProps) {
  const displayName = name.trim() || "Untitled recipe";

  return (
    <div className="sticky bottom-0 z-10 border-t border-app-border bg-app-bg/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-app-text">{displayName}</span>
            <Badge tone={isNew ? "info" : "neutral"}>{isNew ? "New" : "Editing"}</Badge>
            <Badge tone={componentCount > 0 ? "success" : "neutral"}>
              {componentCount} components
            </Badge>
          </div>
          <div className="mt-0.5 text-xs text-app-muted">
            Save changes or save and activate this recipe globally.
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="secondary" disabled={saving} onClick={onSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="primary" disabled={saving} onClick={onSaveAndActivate}>
            {saving ? "Saving..." : "Save + Activate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
