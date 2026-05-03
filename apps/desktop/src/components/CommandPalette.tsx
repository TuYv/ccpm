// src/components/CommandPalette.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCmdkStore } from "../stores/cmdk";
import { useMcpsStore, usePresetsStore, useRecipesStore, useSkillsStore } from "../stores";
import type { CmdkKind } from "../stores/cmdk";
import type { McpIndex, PresetIndex, SkillIndex } from "../types/core";

interface ResultItem {
  kind: CmdkKind;
  id: string;
  name: string;
  sub?: string;
}

const KIND_LABEL: Record<CmdkKind, string> = {
  recipe: "配方",
  preset: "Preset",
  skill: "Skill",
  mcp: "MCP",
};

const EMPTY_PRESETS: PresetIndex["presets"] = [];
const EMPTY_SKILLS: SkillIndex["skills"] = [];
const EMPTY_MCPS: McpIndex["mcps"] = [];

function matches(q: string, name: string, id: string, tags?: string[]): boolean {
  const lower = q.toLowerCase();
  if (name.toLowerCase().includes(lower)) return true;
  if (id.toLowerCase().includes(lower)) return true;
  if (tags?.some((t) => t.toLowerCase().includes(lower))) return true;
  return false;
}

export default function CommandPalette() {
  const navigate = useNavigate();
  const open = useCmdkStore((s) => s.open);
  const query = useCmdkStore((s) => s.query);
  const setOpen = useCmdkStore((s) => s.setOpen);
  const setQuery = useCmdkStore((s) => s.setQuery);
  const pushRecent = useCmdkStore((s) => s.pushRecent);
  const recents = useCmdkStore((s) => s.recents);

  const recipes = useRecipesStore((s) => s.recipes);
  const presets = usePresetsStore((s) => s.index?.presets ?? EMPTY_PRESETS);
  const skills = useSkillsStore((s) => s.index?.skills ?? EMPTY_SKILLS);
  const mcps = useMcpsStore((s) => s.index?.mcps ?? EMPTY_MCPS);

  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useCmdkStore.getState().toggle();
      } else if (e.key === "Escape" && useCmdkStore.getState().open) {
        useCmdkStore.getState().setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const grouped = useMemo<Record<CmdkKind, ResultItem[]>>(() => {
    const q = query.trim();
    if (!q) {
      const lookup = (kind: CmdkKind, id: string): ResultItem | null => {
        if (kind === "recipe") {
          const r = recipes.find((x) => x.id === id);
          return r ? { kind, id: r.id, name: r.name, sub: r.description } : null;
        }
        if (kind === "preset") {
          const p = presets.find((x) => x.id === id);
          return p ? { kind, id: p.id, name: p.name, sub: p.id } : null;
        }
        if (kind === "skill") {
          const s = skills.find((x) => x.id === id);
          return s ? { kind, id: s.id, name: s.name, sub: s.category } : null;
        }
        const m = mcps.find((x) => x.id === id);
        return m ? { kind, id: m.id, name: m.name, sub: m.category } : null;
      };
      const items = recents
        .map((r) => lookup(r.kind, r.id))
        .filter((x): x is ResultItem => x !== null);
      return {
        recipe: items.filter((i) => i.kind === "recipe").slice(0, 5),
        preset: items.filter((i) => i.kind === "preset").slice(0, 5),
        skill: items.filter((i) => i.kind === "skill").slice(0, 5),
        mcp: items.filter((i) => i.kind === "mcp").slice(0, 5),
      };
    }
    return {
      recipe: recipes
        .filter((r) => matches(q, r.name, r.id, r.description ? [r.description] : []))
        .slice(0, 5)
        .map<ResultItem>((r) => ({ kind: "recipe", id: r.id, name: r.name, sub: r.description })),
      preset: presets
        .filter((p) => matches(q, p.name, p.id, p.tags))
        .slice(0, 5)
        .map<ResultItem>((p) => ({ kind: "preset", id: p.id, name: p.name, sub: p.id })),
      skill: skills
        .filter((s) => matches(q, s.name, s.id, [s.category]))
        .slice(0, 5)
        .map<ResultItem>((s) => ({ kind: "skill", id: s.id, name: s.name, sub: s.category })),
      mcp: mcps
        .filter((m) => matches(q, m.name, m.id, [m.category]))
        .slice(0, 5)
        .map<ResultItem>((m) => ({ kind: "mcp", id: m.id, name: m.name, sub: m.category })),
    };
  }, [query, recipes, presets, skills, mcps, recents]);

  const flat = useMemo(
    () => [...grouped.recipe, ...grouped.preset, ...grouped.skill, ...grouped.mcp],
    [grouped],
  );

  function pick(item: ResultItem) {
    pushRecent(item.kind, item.id);
    setOpen(false);
    if (item.kind === "recipe") {
      navigate(`/recipes/${item.id}`);
    } else if (item.kind === "preset") {
      navigate("/presets");
      usePresetsStore.getState().selectPreset(item.id);
    } else if (item.kind === "skill") {
      navigate("/skills");
      useSkillsStore.getState().setFocusId(item.id);
    } else {
      navigate("/mcp");
      useMcpsStore.getState().setFocusId(item.id);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      e.preventDefault();
      pick(flat[active]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="modal-shell"
      style={{ position: "fixed", inset: 0, zIndex: 100 }}
      onClick={() => setOpen(false)}
    >
      <div
        className="modal"
        style={{ width: 560, maxHeight: 480, display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="搜索 recipes / presets / skills / mcps…"
            className="input"
            style={{ width: "100%", height: 38 }}
            autoFocus
          />
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {(["recipe", "preset", "skill", "mcp"] as CmdkKind[]).map((kind) => {
            const items = grouped[kind];
            if (!items.length) return null;
            return (
              <div key={kind} style={{ padding: "10px 14px" }}>
                <div className="section-label" style={{ marginBottom: 6 }}>
                  {query ? KIND_LABEL[kind] : `Recent ${KIND_LABEL[kind]}`}
                </div>
                {items.map((it) => {
                  const idx = flat.indexOf(it);
                  const isActive = idx === active;
                  return (
                    <button
                      key={`${it.kind}-${it.id}`}
                      type="button"
                      className="row"
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => pick(it)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: isActive ? "var(--accent-soft)" : "var(--card)",
                        borderColor: isActive ? "var(--accent)" : "transparent",
                      }}
                    >
                      <div className="name" style={{ fontSize: 13 }}>{it.name}</div>
                      <div className="meta">{it.sub}</div>
                    </button>
                  );
                })}
              </div>
            );
          })}
          {flat.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "var(--ink-3)", fontSize: 13 }}>
              {query ? "无匹配结果" : "开始输入以搜索"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
