import { useMemo, useState } from "react";
import type { McpMeta, RecipeMcpEntry, SkillMeta } from "../../types/core";
import { Badge, Button, Card, TextInput } from "../ui";
import { EditorSection } from "./EditorSection";

type PickerTab = "claude" | "skills" | "mcps";
type LibraryIds = ReadonlySet<string> | readonly string[];

interface ComponentPickerProps {
  claudeMds: string[];
  skills: SkillMeta[];
  mcps: McpMeta[];
  selectedClaudeMd: string | null;
  selectedSkills: string[];
  selectedMcps: RecipeMcpEntry[];
  librarySkills: LibraryIds;
  libraryMcps: LibraryIds;
  downloadingSkill: string | null;
  downloadingMcp: string | null;
  onSelectClaudeMd: (id: string | null) => void;
  onToggleSkill: (id: string) => void;
  onToggleMcp: (id: string) => void;
  onDownloadSkill: (skill: SkillMeta) => void;
  onDownloadMcp: (mcp: McpMeta) => void;
}

const tabs: { id: PickerTab; label: string }[] = [
  { id: "claude", label: "CLAUDE.md" },
  { id: "skills", label: "Skills" },
  { id: "mcps", label: "MCPs" },
];

function hasId(ids: LibraryIds, id: string): boolean {
  return "has" in ids ? ids.has(id) : ids.includes(id);
}

function matchesQuery(query: string, values: Array<string | undefined>): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some((value) => value?.toLowerCase().includes(q));
}

export function ComponentPicker({
  claudeMds,
  skills,
  mcps,
  selectedClaudeMd,
  selectedSkills,
  selectedMcps,
  librarySkills,
  libraryMcps,
  downloadingSkill,
  downloadingMcp,
  onSelectClaudeMd,
  onToggleSkill,
  onToggleMcp,
  onDownloadSkill,
  onDownloadMcp,
}: ComponentPickerProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>("claude");
  const [query, setQuery] = useState("");

  const filteredClaudeMds = useMemo(
    () => claudeMds.filter((id) => matchesQuery(query, [id])),
    [claudeMds, query],
  );

  const filteredSkills = useMemo(
    () =>
      skills.filter((skill) =>
        matchesQuery(query, [skill.id, skill.name, skill.description, skill.category]),
      ),
    [skills, query],
  );

  const filteredMcps = useMemo(
    () =>
      mcps.filter((mcp) =>
        matchesQuery(query, [mcp.id, mcp.name, mcp.description, mcp.category]),
      ),
    [mcps, query],
  );

  const selectedMcpIds = useMemo(
    () => new Set(selectedMcps.map((entry) => entry.library_id)),
    [selectedMcps],
  );

  return (
    <EditorSection
      title="组件"
      description="选择此配方包含的 CLAUDE.md、Skills 和 MCP。"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-full bg-app-bg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-app-accent text-white"
                    : "text-app-secondary hover:text-app-text"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <TextInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按名称、描述或 ID 搜索…"
            className="sm:max-w-xs"
          />
        </div>

        {activeTab === "claude" && (
          <div className="space-y-2">
            <Card
              active={!selectedClaudeMd}
              onClick={() => onSelectClaudeMd(null)}
              className="px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-app-text">不使用 CLAUDE.md</div>
                  <div className="text-xs text-app-muted">此配方不附带 prompt 文件。</div>
                </div>
                {!selectedClaudeMd && <Badge tone="active">已选</Badge>}
              </div>
            </Card>

            {filteredClaudeMds.map((id) => {
              const selected = selectedClaudeMd === id;
              return (
                <Card
                  key={id}
                  active={selected}
                  onClick={() => onSelectClaudeMd(id)}
                  className="px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-app-text">{id}</div>
                      <div className="text-xs text-app-muted">库内 CLAUDE.md</div>
                    </div>
                    <Badge tone={selected ? "active" : "success"}>
                      {selected ? "已选" : "已下载"}
                    </Badge>
                  </div>
                </Card>
              );
            })}

            {filteredClaudeMds.length === 0 && (
              <div className="rounded-control border border-app-border bg-app-surface px-3 py-6 text-center text-sm text-app-muted">
                没有匹配的 CLAUDE.md。
              </div>
            )}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="grid grid-cols-1 gap-2">
            {filteredSkills.map((skill) => {
              const inLibrary = hasId(librarySkills, skill.id);
              const selected = selectedSkills.includes(skill.id);
              const downloading = downloadingSkill === skill.id;

              return (
                <Card key={skill.id} active={selected} className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!inLibrary}
                      onChange={() => onToggleSkill(skill.id)}
                      className="mt-1 accent-app-accent disabled:opacity-40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-app-text">{skill.name}</span>
                        <Badge tone={selected ? "active" : inLibrary ? "success" : "neutral"}>
                          {selected ? "已选" : inLibrary ? "已下载" : "远程"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-app-muted">{skill.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-app-muted">
                        <code className="rounded bg-app-surface px-1.5 py-0.5 font-mono">
                          {skill.id}
                        </code>
                        <span>{skill.category}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {inLibrary ? (
                        <Button size="sm" variant={selected ? "subtle" : "secondary"} onClick={() => onToggleSkill(skill.id)}>
                          {selected ? "移除" : "选择"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={downloading}
                          onClick={() => onDownloadSkill(skill)}
                        >
                          {downloading ? "下载中…" : "下载"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredSkills.length === 0 && (
              <div className="rounded-control border border-app-border bg-app-surface px-3 py-6 text-center text-sm text-app-muted">
                没有匹配的 Skill。
              </div>
            )}
          </div>
        )}

        {activeTab === "mcps" && (
          <div className="grid grid-cols-1 gap-2">
            {filteredMcps.map((mcp) => {
              const inLibrary = hasId(libraryMcps, mcp.id);
              const selected = selectedMcpIds.has(mcp.id);
              const downloading = downloadingMcp === mcp.id;

              return (
                <Card key={mcp.id} active={selected} className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={!inLibrary}
                      onChange={() => onToggleMcp(mcp.id)}
                      className="mt-1 accent-app-accent disabled:opacity-40"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-app-text">{mcp.name}</span>
                        <Badge tone={selected ? "active" : inLibrary ? "success" : "neutral"}>
                          {selected ? "已选" : inLibrary ? "已下载" : "远程"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-app-muted">{mcp.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-app-muted">
                        <code className="rounded bg-app-surface px-1.5 py-0.5 font-mono">
                          {mcp.id}
                        </code>
                        <span>{mcp.category}</span>
                        {mcp.required_env.length > 0 && (
                          <span>{mcp.required_env.length} 个必填 env</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {inLibrary ? (
                        <Button size="sm" variant={selected ? "subtle" : "secondary"} onClick={() => onToggleMcp(mcp.id)}>
                          {selected ? "移除" : "选择"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={downloading}
                          onClick={() => onDownloadMcp(mcp)}
                        >
                          {downloading ? "下载中…" : "下载"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredMcps.length === 0 && (
              <div className="rounded-control border border-app-border bg-app-surface px-3 py-6 text-center text-sm text-app-muted">
                没有匹配的 MCP。
              </div>
            )}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
