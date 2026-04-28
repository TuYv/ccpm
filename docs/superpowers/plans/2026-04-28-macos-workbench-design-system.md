# macOS Workbench Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable macOS-style workbench design system for the desktop app, then migrate the app shell, recipes list, and recipe editor onto it.

**Architecture:** Establish design tokens and primitive UI components first, then compose workflow-specific components for the shell and recipe flows. Page files keep data loading and mutations; new components own layout, visual states, and reusable interaction structure.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, Tauri v2, Zustand stores.

---

## Source Spec

Implement from:

- `docs/superpowers/specs/2026-04-28-macos-workbench-design-system-design.md`

## File Structure

### Existing Files To Modify

- `apps/desktop/tailwind.config.js`: add design token aliases for sidebar, row, panel, subtle borders, focus rings, and status surfaces.
- `apps/desktop/src/index.css`: add base focus, body, scrollbar, and reusable utility layer rules.
- `apps/desktop/src/components/ui/index.ts`: export new primitive components.
- `apps/desktop/src/components/ui/IconButton.tsx`: align existing icon button with new primitive states.
- `apps/desktop/src/components/Layout.tsx`: replace top-tab layout with `AppShell` usage or convert the component into the app shell.
- `apps/desktop/src/pages/RecipesPage.tsx`: replace large recipe cards with compact rows and toolbar.
- `apps/desktop/src/components/RecipeEditor.tsx`: migrate from single-column long form to three-column builder.
- `apps/desktop/src/pages/SkillsPage.tsx`: align search/header/list surfaces with primitives.
- `apps/desktop/src/pages/McpPage.tsx`: align search/header/list surfaces with primitives.
- `apps/desktop/src/pages/InstalledPage.tsx`: align panels and empty states with primitives.

### New Files To Create

- `apps/desktop/src/components/ui/Button.tsx`: shared command button.
- `apps/desktop/src/components/ui/Badge.tsx`: shared status badge.
- `apps/desktop/src/components/ui/Field.tsx`: shared input, textarea, and field wrapper.
- `apps/desktop/src/components/ui/Panel.tsx`: framed content region.
- `apps/desktop/src/components/ui/ListRow.tsx`: compact operational row.
- `apps/desktop/src/components/ui/Toolbar.tsx`: page toolbar layout.
- `apps/desktop/src/components/ui/SidebarItem.tsx`: app navigation item.
- `apps/desktop/src/components/ui/EmptyState.tsx`: operational empty state.
- `apps/desktop/src/components/ui/StatusDot.tsx`: small status indicator.
- `apps/desktop/src/components/recipes/RecipeListRow.tsx`: recipe list presentation row.
- `apps/desktop/src/components/recipes/ComponentPicker.tsx`: searchable/filterable editor library.
- `apps/desktop/src/components/recipes/SelectedStack.tsx`: selected components summary and MCP env editing.
- `apps/desktop/src/components/recipes/ActivationSummary.tsx`: activation target and save action summary.
- `apps/desktop/src/components/recipes/EditorSection.tsx`: consistent recipe editor column section.

### Files Not To Touch In Stage 1

- Rust/Tauri API files under `apps/desktop/src-tauri/src/`.
- Generated directories: `apps/desktop/dist/`, `apps/desktop/node_modules/`, `apps/desktop/src-tauri/target/`, `apps/desktop/src-tauri/gen/`.
- Marketplace information architecture beyond light primitive alignment in existing pages.

---

## Task 1: Baseline Verification

**Files:**
- Read: `apps/desktop/package.json`
- Read: `apps/desktop/src/App.tsx`
- Read: `apps/desktop/src/components/Layout.tsx`
- Read: `apps/desktop/src/components/RecipeEditor.tsx`
- Read: `apps/desktop/src/pages/RecipesPage.tsx`

- [ ] **Step 1: Confirm the working tree**

Run:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git status --short
```

Expected: existing generated/untracked desktop artifacts may be present. Do not delete them and do not add them to commits.

- [ ] **Step 2: Run baseline build**

Run:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes before UI changes. If it fails before changes, record the exact TypeScript/Vite error in the task notes and fix only if it blocks this plan.

- [ ] **Step 3: Commit nothing**

Do not commit after this task. It is a verification checkpoint only.

---

## Task 2: Add Design Tokens And UI Primitives

**Files:**
- Modify: `apps/desktop/tailwind.config.js`
- Modify: `apps/desktop/src/index.css`
- Modify: `apps/desktop/src/components/ui/index.ts`
- Modify: `apps/desktop/src/components/ui/IconButton.tsx`
- Create: `apps/desktop/src/components/ui/Button.tsx`
- Create: `apps/desktop/src/components/ui/Badge.tsx`
- Create: `apps/desktop/src/components/ui/Field.tsx`
- Create: `apps/desktop/src/components/ui/Panel.tsx`
- Create: `apps/desktop/src/components/ui/ListRow.tsx`
- Create: `apps/desktop/src/components/ui/Toolbar.tsx`
- Create: `apps/desktop/src/components/ui/SidebarItem.tsx`
- Create: `apps/desktop/src/components/ui/EmptyState.tsx`
- Create: `apps/desktop/src/components/ui/StatusDot.tsx`

- [ ] **Step 1: Extend Tailwind tokens**

Update `tailwind.config.js` so `theme.extend.colors.app` contains these keys in addition to compatible existing keys:

```js
app: {
  bg: "#171717",
  surface: "#202022",
  sidebar: "#1d1d1f",
  panel: "#242426",
  panelRaised: "#2a2a2d",
  row: "#202022",
  rowHover: "#29292c",
  rowActive: "#17251b",
  card: "#242426",
  cardHover: "#29292c",
  cardActive: "#17251b",
  border: "#343438",
  borderSubtle: "#2b2b2f",
  borderStrong: "#48484d",
  accent: "#0a84ff",
  accentHover: "#0070e0",
  focus: "#4ea1ff",
  text: "#f5f5f7",
  secondary: "#b2b2b8",
  muted: "#7c7c84",
  disabled: "#57575f",
  link: "#4ea1ff",
  green: "#34c759",
  orange: "#ff9500",
  red: "#ff453a",
}
```

Also add:

```js
borderRadius: {
  control: "6px",
  panel: "8px",
},
boxShadow: {
  popover: "0 18px 48px rgba(0, 0, 0, 0.38)",
}
```

- [ ] **Step 2: Add base CSS**

Update `src/index.css` with these rules after the `body` block:

```css
button,
input,
select,
textarea {
  font: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px solid #4ea1ff;
  outline-offset: 2px;
}

::selection {
  background: rgba(10, 132, 255, 0.35);
}
```

Keep the existing scrollbar rules.

- [ ] **Step 3: Create `Button.tsx`**

Create `src/components/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-app-accent text-white hover:bg-app-accentHover border-transparent",
  secondary: "bg-app-panel border-app-border text-app-secondary hover:text-app-text hover:bg-app-panelRaised",
  subtle: "bg-transparent border-transparent text-app-secondary hover:text-app-text hover:bg-app-rowHover",
  danger: "bg-transparent border-app-border text-app-red hover:bg-app-red/10",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs",
  md: "h-8 px-3 text-sm",
};

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-control border transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Create `Badge.tsx`**

Create `src/components/ui/Badge.tsx`:

```tsx
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "active";

const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-app-panel text-app-secondary border-app-border",
  info: "bg-app-accent/10 text-app-accent border-app-accent/25",
  success: "bg-app-green/10 text-app-green border-app-green/30",
  warning: "bg-app-orange/10 text-app-orange border-app-orange/30",
  danger: "bg-app-red/10 text-app-red border-app-red/30",
  active: "bg-app-green/10 text-app-green border-app-green/30",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] leading-4 ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Create field primitives**

Create `src/components/ui/Field.tsx`:

```tsx
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  helper,
  error,
  children,
}: {
  label?: string;
  helper?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-xs font-medium text-app-secondary">{label}</span>}
      {children}
      {error ? (
        <span className="block text-[11px] text-app-red">{error}</span>
      ) : helper ? (
        <span className="block text-[11px] text-app-muted">{helper}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-1.5 text-sm text-app-text placeholder:text-app-muted transition-colors focus:border-app-focus outline-none ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text placeholder:text-app-muted transition-colors focus:border-app-focus outline-none ${className}`}
      {...props}
    />
  );
}

export function SelectInput({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-control border border-app-border bg-app-surface px-3 py-1.5 text-sm text-app-text transition-colors focus:border-app-focus outline-none ${className}`}
      {...props}
    />
  );
}
```

- [ ] **Step 6: Create structural primitives**

Create `Panel.tsx`, `ListRow.tsx`, `Toolbar.tsx`, `SidebarItem.tsx`, `EmptyState.tsx`, and `StatusDot.tsx` with these APIs:

```tsx
// Panel.tsx
import type { HTMLAttributes } from "react";

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-panel border border-app-border bg-app-panel ${className}`} {...props} />;
}
```

```tsx
// ListRow.tsx
import type { HTMLAttributes } from "react";

export function ListRow({
  active,
  selected,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { active?: boolean; selected?: boolean }) {
  const state = active
    ? "bg-app-rowActive border-app-green/35"
    : selected
      ? "bg-app-panel border-app-accent/35"
      : "bg-app-row border-app-borderSubtle hover:bg-app-rowHover";
  return (
    <div
      className={`relative rounded-control border transition-colors ${state} ${active ? "before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-full before:bg-app-green" : ""} ${className}`}
      {...props}
    />
  );
}
```

```tsx
// Toolbar.tsx
import type { ReactNode } from "react";

export function Toolbar({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-app-border bg-app-bg px-4">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-app-text">{title}</h1>
        {subtitle && <div className="truncate text-[11px] text-app-muted">{subtitle}</div>}
      </div>
      {left && <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>}
      {!left && <div className="flex-1" />}
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}
```

```tsx
// SidebarItem.tsx
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export function SidebarItem({
  to,
  label,
  icon,
  end,
}: {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex h-8 items-center gap-2 rounded-control px-2.5 text-sm transition-colors ${
          isActive
            ? "bg-app-accent text-white"
            : "text-app-secondary hover:bg-app-rowHover hover:text-app-text"
        }`
      }
    >
      {icon && <span className="flex h-4 w-4 items-center justify-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}
```

```tsx
// EmptyState.tsx
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="text-sm font-medium text-app-secondary">{title}</div>
      {description && <div className="max-w-sm text-xs text-app-muted">{description}</div>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
```

```tsx
// StatusDot.tsx
type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  neutral: "bg-app-muted",
  success: "bg-app-green",
  warning: "bg-app-orange",
  danger: "bg-app-red",
  info: "bg-app-accent",
};

export function StatusDot({ tone = "neutral" }: { tone?: StatusTone }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${toneClass[tone]}`} />;
}
```

- [ ] **Step 7: Update `IconButton.tsx`**

Change the button class to use new tokens:

```tsx
className={`flex h-8 w-8 items-center justify-center rounded-control border border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
  active
    ? "bg-app-accent text-white"
    : "text-app-secondary hover:border-app-border hover:bg-app-rowHover hover:text-app-text"
}`}
```

- [ ] **Step 8: Export primitives**

Update `src/components/ui/index.ts`:

```ts
export { Avatar } from "./Avatar";
export { Badge } from "./Badge";
export { Button } from "./Button";
export { Card } from "./Card";
export { EmptyState } from "./EmptyState";
export { Field, SelectInput, TextArea, TextInput } from "./Field";
export { IconButton } from "./IconButton";
export { ListRow } from "./ListRow";
export { Panel } from "./Panel";
export { SegmentedTabs } from "./SegmentedTabs";
export { SidebarItem } from "./SidebarItem";
export { StatusDot } from "./StatusDot";
export { Toolbar } from "./Toolbar";
```

- [ ] **Step 9: Run build**

Run:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: TypeScript and Vite build pass.

- [ ] **Step 10: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/tailwind.config.js apps/desktop/src/index.css apps/desktop/src/components/ui
git commit -m "feat(desktop): add workbench ui primitives"
```

---

## Task 3: Migrate App Shell To Sidebar Navigation

**Files:**
- Modify: `apps/desktop/src/components/Layout.tsx`
- Use: `apps/desktop/src/components/ui/SidebarItem.tsx`
- Use: `apps/desktop/src/components/ui/Toolbar.tsx`
- Use: `apps/desktop/src/components/ui/IconButton.tsx`
- Use: `apps/desktop/src/components/ui/Button.tsx`

- [ ] **Step 1: Replace tab-centered navigation model**

In `Layout.tsx`, replace `MAIN_TABS` with `NAV_ITEMS`:

```tsx
const NAV_ITEMS = [
  { to: "/", label: "配方", end: true },
  { to: "/presets", label: "预设" },
  { to: "/skills", label: "Skills" },
  { to: "/mcp", label: "MCP" },
  { to: "/installed", label: "已安装" },
  { to: "/backups", label: "备份" },
  { to: "/claude-settings", label: "Claude 配置" },
];
```

Add a page title helper:

```tsx
function pageTitle(pathname: string): string {
  if (pathname === "/" || pathname.startsWith("/recipes")) return "配方";
  if (pathname.startsWith("/presets")) return "预设";
  if (pathname.startsWith("/skills")) return "Skills";
  if (pathname.startsWith("/mcp")) return "MCP";
  if (pathname.startsWith("/installed")) return "已安装";
  if (pathname.startsWith("/backups")) return "备份";
  if (pathname.startsWith("/claude-settings")) return "Claude 配置";
  if (pathname.startsWith("/settings")) return "设置";
  return "Claude Preset";
}
```

- [ ] **Step 2: Use sidebar and toolbar**

Rewrite the returned layout shape in `Layout.tsx` to:

```tsx
return (
  <div className="flex h-screen overflow-hidden bg-app-bg text-app-text">
    <aside className="flex w-[216px] shrink-0 flex-col border-r border-app-border bg-app-sidebar">
      <div className="flex h-12 items-center gap-2 border-b border-app-border px-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-control bg-app-accent text-xs font-bold text-white">
          CP
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-app-text">Claude Preset</div>
          <div className="truncate text-[10px] text-app-muted">Manager</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>
      <div className="border-t border-app-border p-2">
        <SidebarItem to="/settings" label="设置" />
      </div>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col">
      {isPreview && (
        <div className="flex shrink-0 items-center justify-center border-b border-orange-800/40 bg-orange-900/30 px-4 py-1 text-xs text-orange-300">
          预览模式 · 浏览器预览，不会写入真实文件
        </div>
      )}
      <BaselineBanner />
      <Toolbar
        title={pageTitle(location.pathname)}
        right={
          isSettings ? (
            <IconButton icon={<BackIcon />} title="返回" onClick={() => navigate(-1)} />
          ) : (
            <>
              <IconButton icon={<RefreshIcon />} title="刷新数据源" onClick={refresh} disabled={loading} />
              <IconButton icon={<GearIcon />} title="设置" onClick={() => navigate("/settings")} />
            </>
          )
        }
      />
      <main className="min-h-0 flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);
```

Remove `SegmentedTabs` usage from `Layout.tsx`.

- [ ] **Step 3: Preserve settings back behavior**

Verify `isSettings` still uses `navigate(-1)` and the settings page can return to the previous page. `isClaudeSettings` no longer needs a special header branch after sidebar migration; remove that special case.

- [ ] **Step 4: Run build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes.

- [ ] **Step 5: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src/components/Layout.tsx
git commit -m "feat(desktop): migrate app shell to sidebar"
```

---

## Task 4: Migrate Recipes List To Compact Rows

**Files:**
- Modify: `apps/desktop/src/pages/RecipesPage.tsx`
- Create: `apps/desktop/src/components/recipes/RecipeListRow.tsx`
- Use: `apps/desktop/src/components/ui/Button.tsx`
- Use: `apps/desktop/src/components/ui/Badge.tsx`
- Use: `apps/desktop/src/components/ui/ListRow.tsx`
- Use: `apps/desktop/src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Create `RecipeListRow.tsx`**

Create `src/components/recipes/RecipeListRow.tsx`:

```tsx
import type { Recipe } from "../../types/core";
import { Badge, Button, ListRow } from "../ui";

export function RecipeListRow({
  recipe,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const skillsCount = recipe.skills?.length ?? 0;
  const mcpsCount = recipe.mcps?.length ?? 0;
  const parts = [
    recipe.claude_md ? "CLAUDE.md" : null,
    skillsCount > 0 ? `${skillsCount} skill${skillsCount > 1 ? "s" : ""}` : null,
    mcpsCount > 0 ? `${mcpsCount} MCP${mcpsCount > 1 ? "s" : ""}` : null,
  ].filter(Boolean);

  return (
    <ListRow active={isActive} className="grid min-h-[52px] grid-cols-[minmax(220px,1.5fr)_minmax(160px,0.8fr)_110px_150px] items-center gap-3 px-3 py-2">
      <div className="min-w-0 pl-2">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-app-text">{recipe.name}</span>
          {isActive && <Badge tone="active">激活中</Badge>}
        </div>
        <div className="truncate text-xs text-app-muted">{recipe.description || "无说明"}</div>
      </div>
      <div className="truncate text-xs text-app-secondary">{parts.length > 0 ? parts.join(" · ") : "空配方"}</div>
      <div className="text-xs text-app-muted">{isActive ? "当前作用域" : "未激活"}</div>
      <div className="flex justify-end gap-1.5">
        {!isActive && (
          <Button size="sm" variant="primary" onClick={onActivate}>
            激活
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onEdit}>
          编辑
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} title="删除配方">
          删除
        </Button>
      </div>
    </ListRow>
  );
}
```

- [ ] **Step 2: Replace inline `RecipeRow`**

In `RecipesPage.tsx`, remove the existing `RecipeRow` function and import:

```tsx
import { RecipeListRow } from "../components/recipes/RecipeListRow";
import { Button, EmptyState } from "../components/ui";
```

- [ ] **Step 3: Replace page header**

Replace the top page header with:

```tsx
<div className="flex h-12 shrink-0 items-center gap-3 border-b border-app-border bg-app-bg px-4">
  <ScopeSelector scope={scope} onChange={setScope} />
  <div className="flex-1" />
  <Button variant="primary" size="sm" onClick={() => navigate("/recipes/new")}>
    新建配方
  </Button>
</div>
```

- [ ] **Step 4: Replace list body**

Use this body structure:

```tsx
<div className="flex-1 overflow-y-auto p-4">
  {loading && recipes.length === 0 && (
    <div className="text-center text-sm text-app-muted py-12">加载中…</div>
  )}
  {!loading && recipes.length === 0 && (
    <EmptyState
      title="还没有配方"
      description="创建一个配方来组合 CLAUDE.md、Skills、MCP 和 settings 覆盖。"
      action={
        <Button variant="primary" onClick={() => navigate("/recipes/new")}>
          创建第一个配方
        </Button>
      }
    />
  )}
  {recipes.length > 0 && (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[minmax(220px,1.5fr)_minmax(160px,0.8fr)_110px_150px] gap-3 px-3 pb-2 text-[10px] uppercase tracking-wide text-app-muted">
        <span className="pl-2">名称</span>
        <span>组件</span>
        <span>状态</span>
        <span className="text-right">操作</span>
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
```

- [ ] **Step 5: Run build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes.

- [ ] **Step 6: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src/pages/RecipesPage.tsx apps/desktop/src/components/recipes/RecipeListRow.tsx
git commit -m "feat(desktop): compact recipes workbench list"
```

---

## Task 5: Add Recipe Editor Workflow Components

**Files:**
- Create: `apps/desktop/src/components/recipes/EditorSection.tsx`
- Create: `apps/desktop/src/components/recipes/ComponentPicker.tsx`
- Create: `apps/desktop/src/components/recipes/SelectedStack.tsx`
- Create: `apps/desktop/src/components/recipes/ActivationSummary.tsx`
- Use: `apps/desktop/src/types/core.ts`
- Use: `apps/desktop/src/utils/env.ts`

- [ ] **Step 1: Create `EditorSection.tsx`**

```tsx
import type { ReactNode } from "react";

export function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-app-secondary">{title}</h2>
        {description && <p className="mt-0.5 text-[11px] text-app-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Create `ComponentPicker.tsx`**

Create a component that accepts already-sorted arrays and callbacks from `RecipeEditor`:

```tsx
import { useMemo, useState } from "react";
import type { McpMeta, SkillMeta } from "../../types/core";
import { Badge, Button, TextInput } from "../ui";
import { EditorSection } from "./EditorSection";

type PickerTab = "claude" | "skills" | "mcps";

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
}: {
  claudeMds: string[];
  skills: SkillMeta[];
  mcps: McpMeta[];
  selectedClaudeMd: string | null;
  selectedSkills: string[];
  selectedMcps: string[];
  librarySkills: Set<string>;
  libraryMcps: Set<string>;
  downloadingSkill: string | null;
  downloadingMcp: string | null;
  onSelectClaudeMd: (id: string | null) => void;
  onToggleSkill: (id: string) => void;
  onToggleMcp: (id: string) => void;
  onDownloadSkill: (skill: SkillMeta) => void;
  onDownloadMcp: (mcp: McpMeta) => void;
}) {
  const [tab, setTab] = useState<PickerTab>("claude");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filteredSkills = useMemo(
    () => skills.filter((s) => !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)),
    [skills, q],
  );
  const filteredMcps = useMemo(
    () => mcps.filter((m) => !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)),
    [mcps, q],
  );
  const filteredClaudeMds = useMemo(
    () => claudeMds.filter((id) => !q || id.toLowerCase().includes(q)),
    [claudeMds, q],
  );

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索组件…" />
      <div className="flex gap-1 rounded-control border border-app-border bg-app-surface p-1">
        {[
          ["claude", "CLAUDE.md"],
          ["skills", "Skills"],
          ["mcps", "MCP"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key as PickerTab)}
            className={`h-7 flex-1 rounded-control text-xs transition-colors ${tab === key ? "bg-app-accent text-white" : "text-app-secondary hover:bg-app-rowHover hover:text-app-text"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1">
        {tab === "claude" && (
          <EditorSection title="CLAUDE.md">
            <button
              type="button"
              onClick={() => onSelectClaudeMd(null)}
              className={`w-full rounded-control border px-3 py-2 text-left text-xs ${selectedClaudeMd === null ? "border-app-accent bg-app-cardActive text-app-text" : "border-app-border bg-app-row text-app-secondary hover:bg-app-rowHover"}`}
            >
              不使用 CLAUDE.md
            </button>
            {filteredClaudeMds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onSelectClaudeMd(id)}
                className={`w-full rounded-control border px-3 py-2 text-left text-xs ${selectedClaudeMd === id ? "border-app-accent bg-app-cardActive text-app-text" : "border-app-border bg-app-row text-app-secondary hover:bg-app-rowHover"}`}
              >
                {id}
              </button>
            ))}
          </EditorSection>
        )}

        {tab === "skills" && filteredSkills.map((skill) => {
          const inLib = librarySkills.has(skill.id);
          const selected = selectedSkills.includes(skill.id);
          return (
            <div key={skill.id} className="rounded-control border border-app-border bg-app-row p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-app-text">{skill.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-app-muted">{skill.description}</div>
                </div>
                {selected ? <Badge tone="active">已选</Badge> : inLib ? <Badge>已下载</Badge> : <Badge tone="warning">远程</Badge>}
              </div>
              <div className="mt-2 flex justify-end">
                {inLib ? (
                  <Button size="sm" variant={selected ? "secondary" : "primary"} onClick={() => onToggleSkill(skill.id)}>
                    {selected ? "移除" : "添加"}
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" disabled={downloadingSkill === skill.id} onClick={() => onDownloadSkill(skill)}>
                    {downloadingSkill === skill.id ? "下载中…" : "下载并添加"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {tab === "mcps" && filteredMcps.map((mcp) => {
          const inLib = libraryMcps.has(mcp.id);
          const selected = selectedMcps.includes(mcp.id);
          return (
            <div key={mcp.id} className="rounded-control border border-app-border bg-app-row p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-app-text">{mcp.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] text-app-muted">{mcp.description}</div>
                </div>
                {selected ? <Badge tone="active">已选</Badge> : inLib ? <Badge>已下载</Badge> : <Badge tone="warning">远程</Badge>}
              </div>
              <div className="mt-2 flex justify-end">
                {inLib ? (
                  <Button size="sm" variant={selected ? "secondary" : "primary"} onClick={() => onToggleMcp(mcp.id)}>
                    {selected ? "移除" : "添加"}
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" disabled={downloadingMcp === mcp.id} onClick={() => onDownloadMcp(mcp)}>
                    {downloadingMcp === mcp.id ? "下载中…" : "下载并添加"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `SelectedStack.tsx`**

Create `src/components/recipes/SelectedStack.tsx`:

```tsx
import type { RecipeMcpEntry } from "../../types/core";
import { isSecretEnvKey } from "../../utils/env";
import { Badge, Button, TextArea, TextInput } from "../ui";
import { EditorSection } from "./EditorSection";

export function SelectedStack({
  claudeMdId,
  skillIds,
  mcpEntries,
  settingsOverride,
  onSettingsOverrideChange,
  onSetMcpEnv,
}: {
  claudeMdId: string | null;
  skillIds: string[];
  mcpEntries: RecipeMcpEntry[];
  settingsOverride: string;
  onSettingsOverrideChange: (value: string) => void;
  onSetMcpEnv: (mcpId: string, key: string, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <EditorSection title="已选组件">
        <div className="space-y-2 rounded-panel border border-app-border bg-app-panel p-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-app-secondary">CLAUDE.md</span>
            {claudeMdId ? <Badge tone="info">{claudeMdId}</Badge> : <Badge>未使用</Badge>}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-app-secondary">Skills</span>
            <Badge tone={skillIds.length > 0 ? "info" : "neutral"}>{skillIds.length}</Badge>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-app-secondary">MCP</span>
            <Badge tone={mcpEntries.length > 0 ? "info" : "neutral"}>{mcpEntries.length}</Badge>
          </div>
        </div>
      </EditorSection>

      {mcpEntries.length > 0 && (
        <EditorSection title="MCP Env">
          <div className="space-y-2">
            {mcpEntries.map((entry) => (
              <div key={entry.library_id} className="rounded-panel border border-app-border bg-app-panel p-3">
                <div className="mb-2 truncate text-xs font-medium text-app-text">{entry.library_id}</div>
                <div className="space-y-1.5">
                  {Object.entries(entry.env ?? {}).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[96px_1fr] gap-2">
                      <code className="truncate text-[10px] text-app-muted">{key}</code>
                      <TextInput
                        type={isSecretEnvKey(key) ? "password" : "text"}
                        value={value}
                        onChange={(e) => onSetMcpEnv(entry.library_id, key, e.target.value)}
                        className="h-7 px-2 py-1 font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="subtle"
                  onClick={() => {
                    const key = prompt("env key");
                    if (key) onSetMcpEnv(entry.library_id, key, "");
                  }}
                >
                  添加 env 变量
                </Button>
              </div>
            ))}
          </div>
        </EditorSection>
      )}

      <EditorSection title="Settings 覆盖" description="保存前必须是合法 JSON。">
        <TextArea
          value={settingsOverride}
          onChange={(e) => onSettingsOverrideChange(e.target.value)}
          rows={7}
          className="font-mono text-xs"
        />
      </EditorSection>
    </div>
  );
}
```

- [ ] **Step 4: Create `ActivationSummary.tsx`**

Create `src/components/recipes/ActivationSummary.tsx`:

```tsx
import { Badge, Button } from "../ui";

export function ActivationSummary({
  isNew,
  name,
  componentCount,
  saving,
  onSave,
  onSaveAndActivate,
}: {
  isNew: boolean;
  name: string;
  componentCount: number;
  saving: boolean;
  onSave: () => void;
  onSaveAndActivate: () => void;
}) {
  return (
    <div className="rounded-panel border border-app-border bg-app-panel p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-app-text">{name.trim() || "未命名配方"}</div>
          <div className="mt-0.5 text-[11px] text-app-muted">{isNew ? "新配方" : "编辑配方"} · {componentCount} 个组件</div>
        </div>
        <Badge tone={componentCount > 0 ? "info" : "neutral"}>{componentCount > 0 ? "可保存" : "空配方"}</Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" disabled={saving} onClick={onSave}>
          保存
        </Button>
        <Button variant="primary" disabled={saving} onClick={onSaveAndActivate}>
          保存并激活
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes after unused import cleanup.

- [ ] **Step 6: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src/components/recipes
git commit -m "feat(desktop): add recipe editor workflow components"
```

---

## Task 6: Migrate RecipeEditor To Three-Column Builder

**Files:**
- Modify: `apps/desktop/src/components/RecipeEditor.tsx`
- Use: `apps/desktop/src/components/recipes/ComponentPicker.tsx`
- Use: `apps/desktop/src/components/recipes/SelectedStack.tsx`
- Use: `apps/desktop/src/components/recipes/ActivationSummary.tsx`
- Use: `apps/desktop/src/components/recipes/EditorSection.tsx`
- Use: `apps/desktop/src/components/ui/Button.tsx`
- Use: `apps/desktop/src/components/ui/Field.tsx`

- [x] **Step 1: Add saving state**

In `RecipeEditor.tsx`, add:

```tsx
const [saving, setSaving] = useState(false);
```

Wrap `handleSave` with `setSaving(true)` and `setSaving(false)`:

```tsx
async function handleSave(activateAfter: boolean) {
  let parsedOverride: Record<string, unknown> = {};
  try {
    parsedOverride = JSON.parse(settingsOverride);
  } catch {
    addToast("settings 覆盖必须是合法 JSON", "error");
    return;
  }
  setSaving(true);
  const now = new Date().toISOString();
  const recipe: Recipe = {
    id: isNew ? newId() : id!,
    name: name.trim() || "未命名配方",
    description,
    claude_md: claudeMdId,
    skills: skillIds,
    mcps: mcpEntries,
    settings_override: parsedOverride,
    created_at: now,
    updated_at: now,
  };
  try {
    await save(recipe);
    addToast("✓ 已保存", "success");
    if (activateAfter) {
      await api.activateRecipe(recipe.id, { kind: "global" });
      addToast(`✓ 已激活 ${recipe.name}`, "success");
    }
    navigate("/recipes");
  } catch (e) {
    addToast(`保存失败：${String(e)}`, "error");
  } finally {
    setSaving(false);
  }
}
```

- [x] **Step 2: Add component count**

Add a safe memoized component count. It must tolerate invalid JSON while the user is editing the settings override:

```tsx
const componentCount = useMemo(() => {
  let settingsCount = 0;
  try {
    settingsCount = Object.keys(JSON.parse(settingsOverride || "{}") as Record<string, unknown>).length > 0 ? 1 : 0;
  } catch {
    settingsCount = 0;
  }
  return (claudeMdId ? 1 : 0) + skillIds.length + mcpEntries.length + settingsCount;
}, [claudeMdId, skillIds.length, mcpEntries.length, settingsOverride]);
```

- [x] **Step 3: Replace returned JSX**

Replace the current single-column JSX body with:

```tsx
return (
  <div className="grid h-full min-h-0 grid-cols-[280px_minmax(360px,1fr)_320px] overflow-hidden">
    <aside className="flex min-h-0 flex-col gap-4 border-r border-app-border bg-app-bg p-4">
      <button
        onClick={() => navigate("/recipes")}
        className="self-start text-xs text-app-muted hover:text-app-text"
      >
        ← 返回配方
      </button>
      <EditorSection title="配方信息">
        <Field label="名称">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="配方名称" />
        </Field>
        <Field label="说明">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="简要说明" rows={4} />
        </Field>
      </EditorSection>
      <EditorSection title="库状态">
        <Button variant="secondary" size="sm" onClick={refreshLibrary} disabled={refreshing}>
          {refreshing ? "刷新中…" : "刷新库"}
        </Button>
      </EditorSection>
      <div className="mt-auto">
        <ActivationSummary
          isNew={isNew}
          name={name}
          componentCount={componentCount}
          saving={saving}
          onSave={() => handleSave(false)}
          onSaveAndActivate={() => handleSave(true)}
        />
      </div>
    </aside>

    <section className="min-h-0 border-r border-app-border bg-app-bg p-4">
      <ComponentPicker
        claudeMds={availableClaudeMds}
        skills={sortedSkills}
        mcps={sortedMcps}
        selectedClaudeMd={claudeMdId}
        selectedSkills={skillIds}
        selectedMcps={mcpEntries.map((entry) => entry.library_id)}
        librarySkills={librarySkills}
        libraryMcps={libraryMcps}
        downloadingSkill={downloadingSkill}
        downloadingMcp={downloadingMcp}
        onSelectClaudeMd={setClaudeMdId}
        onToggleSkill={toggleSkill}
        onToggleMcp={toggleMcp}
        onDownloadSkill={handleDownloadSkill}
        onDownloadMcp={handleDownloadMcp}
      />
    </section>

    <aside className="min-h-0 overflow-y-auto bg-app-bg p-4">
      <SelectedStack
        claudeMdId={claudeMdId}
        skillIds={skillIds}
        mcpEntries={mcpEntries}
        settingsOverride={settingsOverride}
        onSettingsOverrideChange={setSettingsOverride}
        onSetMcpEnv={setMcpEnv}
      />
    </aside>
  </div>
);
```

Add imports:

```tsx
import { ActivationSummary } from "./recipes/ActivationSummary";
import { ComponentPicker } from "./recipes/ComponentPicker";
import { EditorSection } from "./recipes/EditorSection";
import { SelectedStack } from "./recipes/SelectedStack";
import { Button, Field, TextArea, TextInput } from "./ui";
```

Remove imports that are no longer used, including `isSecretEnvKey` from `RecipeEditor.tsx`.

- [ ] **Step 4: Fix narrow-window overflow**

If the Tauri window at 1100px clips the three-column layout, change the grid to:

```tsx
<div className="grid h-full min-h-0 min-w-[960px] grid-cols-[260px_minmax(340px,1fr)_300px] overflow-auto">
```

Expected: the layout remains usable at the configured 1100px window width.

- [x] **Step 5: Run build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes.

- [x] **Step 6: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src/components/RecipeEditor.tsx
git commit -m "feat(desktop): migrate recipe editor to builder layout"
```

---

## Task 7: Align Secondary Pages With Primitives

**Files:**
- Modify: `apps/desktop/src/pages/SkillsPage.tsx`
- Modify: `apps/desktop/src/pages/McpPage.tsx`
- Modify: `apps/desktop/src/pages/InstalledPage.tsx`
- Use: `apps/desktop/src/components/ui/Button.tsx`
- Use: `apps/desktop/src/components/ui/Badge.tsx`
- Use: `apps/desktop/src/components/ui/Panel.tsx`
- Use: `apps/desktop/src/components/ui/EmptyState.tsx`
- Use: `apps/desktop/src/components/ui/TextInput.tsx` through `Field.tsx` export

- [x] **Step 1: Update SkillsPage imports**

Add:

```tsx
import { Badge, Button, EmptyState, Panel, TextInput } from "../components/ui";
```

Replace inline status spans with:

```tsx
{isInstalled ? <Badge tone="success">已下载</Badge> : <Badge>未下载</Badge>}
```

Replace install/uninstall buttons with `Button`.

- [x] **Step 2: Update SkillsPage search and group panels**

Replace search input class with:

```tsx
<TextInput
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="搜索 skills…"
  className="max-w-md"
/>
```

Replace `bg-app-card rounded-xl overflow-hidden divide-y...` group container with:

```tsx
<Panel className="overflow-hidden divide-y divide-app-borderSubtle">
  {list.map(...)}
</Panel>
```

Replace empty state with:

```tsx
<EmptyState
  title={search ? `没有匹配 "${search}" 的 skill` : "暂无 skill"}
  description="调整搜索条件或刷新数据源。"
/>
```

- [x] **Step 3: Update McpPage the same way**

Add:

```tsx
import { Badge, Button, EmptyState, Panel, TextInput } from "../components/ui";
```

Use `TextInput` for search, `Panel` for grouped lists, `Badge` for installed state, and `Button` for download/remove actions.

Use this empty state:

```tsx
<EmptyState
  title={search ? `没有匹配 "${search}" 的 MCP` : "暂无 MCP"}
  description="调整搜索条件或刷新数据源。"
/>
```

- [x] **Step 4: Update InstalledPage**

Add:

```tsx
import { Badge, Button, EmptyState, Panel } from "../components/ui";
```

Use `Panel` for global and project sections:

```tsx
<Panel className="p-5">
  <div className="flex items-start justify-between gap-3">
    <div>
      <div className="text-base font-semibold text-app-text">{findRecipe(active.global)?.name ?? active.global}</div>
      <div className="mt-1 text-xs text-app-muted">{findRecipe(active.global)?.description}</div>
    </div>
    <Badge tone="success">全局激活</Badge>
  </div>
  <Button className="mt-3" size="sm" onClick={() => navigate(`/recipes/${active.global}`)}>
    查看配方
  </Button>
</Panel>
```

Use `EmptyState` for no active global/project state.

- [x] **Step 5: Run build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes.

- [x] **Step 6: Commit**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src/pages/SkillsPage.tsx apps/desktop/src/pages/McpPage.tsx apps/desktop/src/pages/InstalledPage.tsx
git commit -m "feat(desktop): align secondary pages with workbench primitives"
```

---

## Task 8: Manual Tauri Verification And Polish Fixes

**Files:**
- Modify only files touched in Tasks 2-7 if verification finds issues.

- [ ] **Step 1: Run production build**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: build passes.

- [ ] **Step 2: Run Tauri app**

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm tauri dev
```

Expected: macOS app launches and shows sidebar navigation.

- [ ] **Step 3: Verify navigation**

Manual checks:

- Sidebar entries navigate to Recipes, Presets, Skills, MCP, Installed, Backups, Claude Config.
- Settings entry opens settings.
- Settings back button returns to previous page.
- Refresh button still refreshes the active data source for Presets, Skills, and MCP.

- [ ] **Step 4: Verify recipe list**

Manual checks:

- Recipe rows render with stable height.
- Active recipe shows green status.
- New recipe button opens `/recipes/new`.
- Edit opens `/recipes/:id`.
- Delete confirmation still appears.
- Activation dialog still opens from inactive rows.

- [ ] **Step 5: Verify recipe editor**

Manual checks:

- Existing recipe loads name, description, CLAUDE.md, Skills, MCP, env, and settings override.
- New recipe starts empty.
- Search filters component library.
- CLAUDE.md selection updates selected stack.
- Skill add/remove works.
- MCP add/remove works.
- MCP env edits update state.
- Secret-looking env keys render password fields.
- Invalid settings JSON shows existing toast error and does not save.
- Save returns to recipes.
- Save and activate activates globally, matching existing behavior.

- [ ] **Step 6: Verify secondary pages**

Manual checks:

- Skills search, expand, download, remove still work.
- MCP search, expand, download, remove still work.
- Installed page global/project active states still render.
- Empty states render without layout jumps.

- [ ] **Step 7: Commit polish fixes**

If fixes were required:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git add apps/desktop/src
git commit -m "fix(desktop): polish workbench verification issues"
```

If no fixes were required, do not create an empty commit.

---

## Future Roadmap After Stage 1

- Phase 2 Icon System: evaluate adding lucide-react after primitives stabilize, then replace emoji and hand-written SVGs through primitive component APIs.
- Phase 2 Marketplace Pages: redesign Presets, Skills, and MCP discovery with previews, file tabs, trust metadata, and clearer remote/downloaded/selected/active states.
- Phase 3 Light Mode: add only after token usage is consistent enough for variable-driven theme switching.
- Phase 3 API/Data Shape Review: review backend support for previews, diffs, validation, and activation summaries after UI migration exposes repeated derived state.

---

## Final Verification

- [ ] Run:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm/apps/desktop
pnpm build
```

Expected: pass.

- [ ] Run:

```bash
cd /Users/rick/SourceLib/fishNotExist/claudeInit/ccpm
git status --short
```

Expected: only user/generated artifacts remain uncommitted. Product code and docs from this plan should be committed.
