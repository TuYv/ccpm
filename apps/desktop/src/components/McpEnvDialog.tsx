// src/components/McpEnvDialog.tsx
import { useMemo, useState } from "react";
import type { McpMeta, McpRequiredEnv } from "../types/core";
import { Button, Field, SectionLabel, TextInput } from "./ui";

export default function McpEnvDialog({
  mcp,
  existingEnv,
  onCancel,
  onConfirm,
}: {
  mcp: McpMeta;
  existingEnv?: Record<string, string>;
  onCancel: () => void;
  onConfirm: (env: Record<string, string>) => void;
}) {
  const [env, setEnv] = useState<Record<string, string>>(() => ({ ...(existingEnv ?? {}) }));

  const missingRequired = useMemo(
    () => mcp.required_env.filter((e) => !env[e.key]?.trim()),
    [env, mcp.required_env],
  );
  const canSave = missingRequired.length === 0;

  function update(k: string, v: string) {
    setEnv((p) => ({ ...p, [k]: v }));
  }

  function row(e: McpRequiredEnv, required: boolean) {
    return (
      <Field
        key={e.key}
        label={`${e.key}${required ? "" : " (可选)"}`}
        helper={e.description ?? e.hint}
      >
        <TextInput
          className="mono"
          value={env[e.key] ?? ""}
          onChange={(ev) => update(e.key, ev.target.value)}
          placeholder={e.hint}
        />
      </Field>
    );
  }

  return (
    <div className="modal-shell" style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-head">
          <SectionLabel style={{ marginBottom: 8, display: "block" }}>
            {existingEnv ? "Configure MCP" : "Install MCP"}
          </SectionLabel>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {mcp.name}
          </h3>
        </div>
        <div className="modal-body" style={{ display: "grid", gap: 14 }}>
          {mcp.required_env.length === 0 && mcp.optional_env.length === 0 && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>
              该 MCP 无需环境变量。
            </p>
          )}
          {mcp.required_env.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              <SectionLabel>必填</SectionLabel>
              {mcp.required_env.map((e) => row(e, true))}
            </div>
          )}
          {mcp.optional_env.length > 0 && (
            <div style={{ display: "grid", gap: 10 }}>
              <SectionLabel>可选</SectionLabel>
              {mcp.optional_env.map((e) => row(e, false))}
            </div>
          )}
          {!canSave && (
            <span style={{ fontSize: 11.5, color: "var(--red)" }}>
              请填写所有必填字段
            </span>
          )}
        </div>
        <div className="modal-foot">
          <Button variant="subtle" onClick={onCancel}>
            取消
          </Button>
          <Button
            variant="primary"
            disabled={!canSave}
            onClick={() => canSave && onConfirm(env)}
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
