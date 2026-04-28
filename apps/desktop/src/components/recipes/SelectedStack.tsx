import type { RecipeMcpEntry } from "../../types/core";
import { isSecretEnvKey } from "../../utils/env";
import { Badge, Button, Field, TextArea, TextInput } from "../ui";
import { EditorSection } from "./EditorSection";

interface SelectedStackProps {
  claudeMdId: string | null;
  skillIds: string[];
  mcpEntries: RecipeMcpEntry[];
  settingsOverride: string;
  onSettingsOverrideChange: (value: string) => void;
  onSetMcpEnv: (mcpId: string, key: string, value: string) => void;
}

export function SelectedStack({
  claudeMdId,
  skillIds,
  mcpEntries,
  settingsOverride,
  onSettingsOverrideChange,
  onSetMcpEnv,
}: SelectedStackProps) {
  const selectedCount = (claudeMdId ? 1 : 0) + skillIds.length + mcpEntries.length;

  return (
    <EditorSection
      title="Selected Stack"
      description="Review the selected components, configure MCP environment values, and edit settings overrides."
    >
      <div className="space-y-3">
        <div className="rounded-control border border-app-border bg-app-card px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={claudeMdId ? "success" : "neutral"}>
              {claudeMdId ? `CLAUDE.md: ${claudeMdId}` : "No CLAUDE.md"}
            </Badge>
            <Badge tone={skillIds.length > 0 ? "success" : "neutral"}>
              {skillIds.length} skills
            </Badge>
            <Badge tone={mcpEntries.length > 0 ? "success" : "neutral"}>
              {mcpEntries.length} MCPs
            </Badge>
            <span className="text-xs text-app-muted">{selectedCount} total components</span>
          </div>

          {skillIds.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skillIds.map((id) => (
                <code
                  key={id}
                  className="rounded bg-app-surface px-1.5 py-0.5 font-mono text-[11px] text-app-secondary"
                >
                  {id}
                </code>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-app-secondary">MCP environment</div>
          {mcpEntries.length === 0 ? (
            <div className="rounded-control border border-app-border bg-app-surface px-3 py-6 text-center text-sm text-app-muted">
              No MCP servers selected.
            </div>
          ) : (
            mcpEntries.map((entry) => {
              const env = entry.env ?? {};
              const keys = Object.keys(env);

              return (
                <div
                  key={entry.library_id}
                  className="rounded-control border border-app-border bg-app-card px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-app-text">
                        {entry.library_id}
                      </div>
                      <div className="text-xs text-app-muted">{keys.length} env values</div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        const key = prompt("env key");
                        if (key?.trim()) onSetMcpEnv(entry.library_id, key.trim(), "");
                      }}
                    >
                      Add env
                    </Button>
                  </div>

                  {keys.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {keys.map((key) => (
                        <div key={key} className="grid gap-1.5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                          <code className="truncate font-mono text-[11px] text-app-muted">
                            {key}
                          </code>
                          <TextInput
                            type={isSecretEnvKey(key) ? "password" : "text"}
                            value={env[key] ?? ""}
                            onChange={(event) =>
                              onSetMcpEnv(entry.library_id, key, event.target.value)
                            }
                            className="font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Field label="Settings override" helper="JSON merged into Claude settings when the recipe is activated.">
          <TextArea
            value={settingsOverride}
            onChange={(event) => onSettingsOverrideChange(event.target.value)}
            rows={8}
            spellCheck={false}
            className="font-mono text-xs"
          />
        </Field>
      </div>
    </EditorSection>
  );
}
