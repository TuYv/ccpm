# macOS Workbench Design System Design

## Purpose

Redesign the desktop app UI around a macOS-style configuration workbench. The first implementation stage should build a reusable design system foundation, then migrate the main shell, recipes list, and recipe editor onto that foundation.

The goal is not a decorative refresh. The app manages Claude configuration, so the interface must feel compact, trustworthy, reversible, and easy to scan during repeated use.

## Chosen Direction

Use a **macOS native workbench** direction:

- Left sidebar navigation instead of a crowded top segmented tab bar.
- Restrained dark UI with clearer borders, hover states, status indicators, and page hierarchy.
- Compact rows and panels rather than large decorative cards.
- Explicit state for active recipes, current scope, and write targets.
- Workflow clarity over visual ornament.

The selected implementation approach is **systematic design components first**. This means the first stage establishes tokens, primitives, and workflow components before migrating the key pages.

## Stage 1 Scope

Stage 1 includes:

1. Design tokens and primitive UI components.
2. App shell migration from top tabs to sidebar + page toolbar.
3. Recipes list migration from large cards to compact rows.
4. Recipe editor migration from a long form to a three-column builder.
5. Minimal token/component alignment for secondary pages.

Stage 1 does not fully redesign Presets, Skills, MCP, Installed, Backups, or Settings. Those pages should receive only the component/token changes needed to keep the app visually coherent.

## Design System Layers

### Layer 1: Design Tokens

Centralize visual decisions in Tailwind theme and shared CSS:

- Backgrounds: app base, sidebar, surface, raised panel, hover, selected.
- Borders: default, subtle, active, danger, success, warning.
- Text: primary, secondary, muted, disabled, inverse.
- Accents: blue primary, green success, orange warning, red danger.
- Radius: small controls and rows should stay near 6-8px.
- Shadows: minimal, used only for popovers/modals.
- Typography: keep macOS/system readability, avoid display styling.

The app can keep its existing dark palette family, but values should be tuned toward a more native utility surface and less VS Code-like card heaviness.

### Layer 2: Primitive UI Components

Create or expand shared primitives under `src/components/ui/`:

- `Button`: variants for primary, secondary, subtle, danger, icon-adjacent commands.
- `IconButton`: consistent square sizing, focus, disabled, hover, active states.
- `Badge`: neutral, active, success, warning, danger, info.
- `Field`: label, helper text, error text, text input, textarea wrapper.
- `Select`: consistent surface, border, text, disabled states.
- `Panel`: simple framed content region, not a decorative card.
- `ListRow`: compact row foundation with active/selected/disabled states.
- `Toolbar`: page title, scope area, secondary actions, primary action.
- `SidebarItem`: navigation row with active state and optional count/status.
- `EmptyState`: compact empty states for operational pages.
- `StatusDot`: small status indicator for active, warning, error, neutral.

These primitives should reduce duplicated Tailwind strings and make later page migrations cheaper.

### Layer 3: Workflow Components

Create workflow-specific components where the UI expresses app concepts:

- `AppShell`: sidebar navigation, page toolbar slot, settings entry, preview/baseline banners, refresh routing.
- `RecipeListRow`: compact recipe row showing name, description, components, scope/status, and actions.
- `ComponentPicker`: searchable/filterable picker for CLAUDE.md, Skills, and MCP items.
- `SelectedStack`: right-side selected components summary for the editor.
- `ActivationSummary`: shows target scope, write target, active state, and activation action.
- `EditorSection`: consistent section wrapper for editor columns.

Page files should own data loading and mutations. Components should own structure and presentation.

## Page Layouts

### AppShell

Replace the current top segmented navigation with a persistent left sidebar:

- Sidebar top: app identity.
- Sidebar main: Recipes, Presets, Skills, MCP, Installed, Backups, Claude Config.
- Sidebar bottom: Settings.
- Main toolbar: current page title, contextual scope, refresh button, primary action.
- Banners remain above content but should use consistent status styling.

The toolbar should no longer carry every navigation item. It should support the active workflow.

### RecipesPage

Replace large recipe cards with a compact operational list:

- Header toolbar contains scope selector and “New Recipe”.
- List columns/regions: recipe name, description, component counts, scope, active state, actions.
- Active recipe uses a green left status bar plus a compact “Active” badge.
- Rows should have stable height and avoid layout shift as actions appear.
- Empty state should include a concise explanation and a primary create action.

The page remains responsible for loading recipes, deleting, selecting activation target, and opening the activation dialog.

### RecipeEditor

Replace the long single-column form with a three-column builder:

1. Left column: recipe identity and save controls.
   - Name.
   - Description.
   - Current validation status.
   - Save and save+activate actions.

2. Middle column: component library.
   - Search.
   - Segmented filter for CLAUDE.md, Skills, MCP.
   - In-library vs remote/downloadable state.
   - Add/select/download controls.

3. Right column: selected stack and activation preview.
   - Selected CLAUDE.md.
   - Selected Skills.
   - Selected MCPs.
   - MCP env editing.
   - Settings override JSON.
   - Activation summary showing global/project target.

The editor should still use the existing API calls and state shape. No Rust/Tauri API changes are required for Stage 1.

### Secondary Pages

Presets, Skills, MCP, Installed, Backups, Settings, and Claude Settings should be aligned through the new tokens and primitives. Stage 1 should not redesign their workflows unless required by a shared component migration.

## Interaction Rules

- Destructive actions require confirmation.
- Activation actions must show the current scope before writing.
- Project scope must display the selected path in a scannable way.
- Remote/downloadable components must visually differ from installed/in-library components.
- Settings JSON errors must remain immediate and clear.
- Secret MCP env values should remain password fields.
- Keyboard focus states should be visible on all interactive controls.

## Testing And Verification

Automated verification:

- Run `pnpm build` in `apps/desktop`.
- Treat TypeScript errors as blocking.

Manual Tauri verification:

- Run `pnpm tauri dev`.
- Navigate all sidebar entries.
- Verify settings/back navigation.
- Switch global/project scope.
- Create a recipe.
- Edit an existing recipe.
- Add/remove Skills and MCP entries.
- Edit MCP env values, including secret-looking keys.
- Enter invalid settings JSON and verify the error.
- Save.
- Save and activate.
- Confirm active recipe state appears in the recipes list.
- Confirm preview/browser mode warning still appears when not running in Tauri.

## Future Roadmap

These items are not Stage 1 implementation requirements, but the implementation plan should keep them visible as later phases.

### Phase 2: Icon System

Evaluate adding a single icon library, likely lucide-react, to replace emoji and hand-written SVGs. This should happen after primitives exist so icons land inside stable `Button`, `IconButton`, `SidebarItem`, and `Badge` APIs.

Trigger: Stage 1 components are merged and repeated emoji/SVG usage remains visible across pages.

### Phase 2: Marketplace Pages

Redesign Presets, Skills, and MCP as a stronger marketplace/browser experience:

- Better detail previews.
- File preview tabs for CLAUDE.md/settings.
- Trust metadata and source clarity.
- Clear distinction between remote, downloaded, selected, and active.

Trigger: Recipes and editor workflows are stable enough that discovery becomes the main friction.

### Phase 3: Light Mode

Add light mode only after token usage is consistent across the app. The first task should be token coverage, not per-page color fixes.

Trigger: design tokens are used consistently enough that mode switching is mostly variable changes.

### Phase 3: API/Data Shape Review

Review whether UI needs better backend support for previews, diffs, validation, or activation summaries. Do not change Rust/Tauri APIs in Stage 1.

Trigger: UI implementation reveals repeated derived state or expensive client-side composition that belongs in the core layer.

## Non-Goals For Stage 1

- No full marketplace redesign.
- No light mode.
- No Rust/Tauri API changes.
- No new icon dependency unless implementation cannot achieve clear states with existing UI.
- No unrelated refactors outside the desktop frontend.
- No generated artifact cleanup.

## Acceptance Criteria

Stage 1 is complete when:

- The app uses sidebar navigation and a page toolbar.
- Recipes list uses compact rows with clear active state.
- Recipe editor is organized as a three-column builder.
- Shared UI primitives replace repeated ad hoc Tailwind patterns in migrated pages.
- Secondary pages remain functional and visually compatible with the new shell.
- `pnpm build` passes.
- Manual Tauri verification confirms the key recipe workflow still works.
