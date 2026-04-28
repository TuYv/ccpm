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
  const trimmed = name.trim();
  const displayName = trimmed || "未命名配方";
  const disabled = saving || !trimmed;

  return (
    <div className="border-t border-app-border px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-app-text">{displayName}</span>
            <Badge tone={isNew ? "info" : "neutral"}>{isNew ? "新建" : "编辑中"}</Badge>
            <Badge tone={componentCount > 0 ? "success" : "neutral"}>{componentCount} 项</Badge>
          </div>
          <div className="mt-0.5 text-xs text-app-muted">
            {trimmed ? "保存或保存并全局激活此配方。" : "请先填写配方名称。"}
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="secondary" disabled={disabled} onClick={onSave}>
            {saving ? "保存中…" : "保存"}
          </Button>
          <Button variant="primary" disabled={disabled} onClick={onSaveAndActivate}>
            {saving ? "保存中…" : "保存并激活"}
          </Button>
        </div>
      </div>
    </div>
  );
}
