---
name: shadcn
description: Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file. Also triggers for "shadcn init", "create an app with --preset", or "switch to --preset".
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---
# shadcn/ui

一个用于构建 UI、组件和设计系统的框架。组件通过 CLI 以源代码形式添加到用户的项目中。

> **重要：** 请根据项目的 `packageManager`，使用项目的软件包运行器执行所有 CLI 命令：`npx shadcn@latest`、`pnpm dlx shadcn@latest` 或 `bunx --bun shadcn@latest`。以下示例使用 `npx shadcn@latest`，但请替换为适用于项目的正确运行器。

## 当前项目上下文

```json
!`npx shadcn@latest info --json`
```

上述 JSON 包含项目配置和已安装的组件。使用 `npx shadcn@latest docs <component>` 获取任意组件的文档和示例 URL。

## 原则

1. **优先使用现有组件。** 在编写自定义 UI 之前，使用 `npx shadcn@latest search` 检查注册表。也要检查社区注册表。
2. **组合，而非重新发明。** 设置页面 = Tabs + Card + 表单控件。仪表盘 = Sidebar + Card + Chart + Table。
3. **优先使用内置变体，而非自定义样式。** `variant="outline"`、`size="sm"` 等。
4. **使用语义化颜色。** 使用 `bg-primary`、`text-muted-foreground`，绝不要使用 `bg-blue-500` 这样的原始值。

## 关键规则

这些规则**始终强制执行**。每条规则都链接到一个包含错误/正确代码对的文件。

### 样式与 Tailwind → [styling.md](./rules/styling.md)

- **将 `className` 用于布局，而非样式。** 绝不要覆盖组件的颜色或排版。
- **不要使用 `space-x-*` 或 `space-y-*`。** 使用带有 `gap-*` 的 `flex`。对于垂直堆叠，使用 `flex flex-col gap-*`。
- **当宽度和高度相等时，使用 `size-*`。** 使用 `size-10`，而不是 `w-10 h-10`。
- **使用 `truncate` 简写。** 不要使用 `overflow-hidden text-ellipsis whitespace-nowrap`。
- **不要手动使用 `dark:` 覆盖颜色。** 使用语义化令牌（`bg-background`、`text-muted-foreground`）。
- **使用 `cn()` 处理条件类。** 不要手动编写模板字面量三元表达式。
- **不要为覆盖层组件手动设置 `z-index`。** Dialog、Sheet、Popover 等组件会自行处理堆叠顺序。

### 表单与输入控件 → [forms.md](./rules/forms.md)

- **表单使用 `FieldGroup` + `Field`。** 绝不要使用带有 `space-y-*` 或 `grid gap-*` 的原始 `div` 进行表单布局。
- **`InputGroup` 使用 `InputGroupInput`/`InputGroupTextarea`。** 绝不要在 `InputGroup` 内使用原始 `Input`/`Textarea`。
- **输入控件内的按钮使用 `InputGroup` + `InputGroupAddon`。**
- **选项集（2–7 个选项）使用 `ToggleGroup`。** 不要循环渲染 `Button` 并手动管理激活状态。
- **使用 `FieldSet` + `FieldLegend` 对相关的复选框/单选按钮进行分组。** 不要使用带标题的 `div`。
- **字段验证使用 `data-invalid` + `aria-invalid`。** 在 `Field` 上设置 `data-invalid`，在控件上设置 `aria-invalid`。对于禁用状态：在 `Field` 上设置 `data-disabled`，在控件上设置 `disabled`。

### 组件结构 → [composition.md](./rules/composition.md)

- **条目始终放在对应的 Group 内。** `SelectItem` → `SelectGroup`。`DropdownMenuItem` → `DropdownMenuGroup`。`CommandItem` → `CommandGroup`。
- **对自定义触发器使用 `asChild`（radix）或 `render`（base）。** 检查 `npx shadcn@latest info` 返回的 `base` 字段。→ [base-vs-radix.md](./rules/base-vs-radix.md)
- **Dialog、Sheet 和 Drawer 始终需要 Title。** 为确保无障碍访问，必须使用 `DialogTitle`、`SheetTitle`、`DrawerTitle`。如果需要在视觉上隐藏，请使用 `className="sr-only"`。
- **使用完整的 Card 组合结构。** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`。不要把所有内容都塞进 `CardContent`。
- **Button 没有 `isPending`/`isLoading`。** 使用 `Spinner` + `data-icon` + `disabled` 进行组合。
- **`TabsTrigger` 必须位于 `TabsList` 内。** 绝不要直接在 `Tabs` 中渲染触发器。
- **`Avatar` 始终需要 `AvatarFallback`。** 用于图片加载失败时显示。

### 使用组件，而非自定义标记 → [composition.md](./rules/composition.md)

- **优先使用现有组件，而非自定义标记。** 在编写带样式的 `div` 之前，先检查是否已有对应组件。
- **标注框使用 `Alert`。** 不要构建自定义样式的 div。
- **空状态使用 `Empty`。** 不要构建自定义空状态标记。
- **通过 `sonner` 显示 Toast。** 使用 `sonner` 中的 `toast()`。
- **使用 `Separator`**，而不是 `<hr>` 或 `<div className="border-t">`。
- **使用 `Skeleton`** 作为加载占位符。不要使用自定义的 `animate-pulse` div。
- **使用 `Badge`**，而不是自定义样式的 span。

### 图标 → [icons.md](./rules/icons.md)

- **`Button` 中的图标使用 `data-icon`。** 在图标上使用 `data-icon="inline-start"` 或 `data-icon="inline-end"`。
- **不要对组件内的图标使用尺寸类。** 组件会通过 CSS 处理图标尺寸。不要使用 `size-4` 或 `w-4 h-4`。
- **将图标作为对象传递，而不是字符串键。** 使用 `icon={CheckIcon}`，而不是字符串查找。

### CLI

- **切勿手动解码或获取预设代码。** 对于现有项目，直接将其传递给 `npx shadcn@latest apply --preset <code>`；初始化时，则传递给 `npx shadcn@latest init --preset <code>`。

## 关键模式

以下是区分正确 shadcn/ui 代码的最常见模式。有关边界情况，请参阅上面链接的规则文件。

```tsx
// Form layout: FieldGroup + Field, not div + Label.
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// Validation: data-invalid on Field, aria-invalid on the control.
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// Icons in buttons: data-icon, no sizing classes.
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*.
<div className="flex flex-col gap-4">  // correct
<div className="space-y-4">           // wrong

// Equal dimensions: size-*, not w-* h-*.
<Avatar className="size-10">   // correct
<Avatar className="w-10 h-10"> // wrong

// Status colors: Badge variants or semantic tokens, not raw colors.
<Badge variant="secondary">+20.1%</Badge>    // correct
<span className="text-emerald-600">+20.1%</span> // wrong
```

## 组件选择

| 需求                       | 使用                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| 按钮/操作              | 使用具有适当变体的 `Button`                                                                   |
| 表单输入                | `Input`、`Select`、`Combobox`、`Switch`、`Checkbox`、`RadioGroup`、`Textarea`、`InputOTP`、`Slider` |
| 在 2–5 个选项之间切换 | `ToggleGroup` + `ToggleGroupItem`                                                                   |
| 数据展示               | `Table`、`Card`、`Badge`、`Avatar`                                                                  |
| 导航                 | `Sidebar`、`NavigationMenu`、`Breadcrumb`、`Tabs`、`Pagination`                                     |
| 覆盖层                   | `Dialog`（模态框）、`Sheet`（侧边面板）、`Drawer`（底部面板）、`AlertDialog`（确认）       |
| 反馈                   | `sonner`（Toast）、`Alert`、`Progress`、`Skeleton`、`Spinner`                                        |
| 命令面板            | `Dialog` 内的 `Command`                                                                           |
| 图表                     | `Chart`（封装 Recharts）                                                                            |
| 布局                     | `Card`、`Separator`、`Resizable`、`ScrollArea`、`Accordion`、`Collapsible`                          |
| 空状态               | `Empty`                                                                                             |
| 菜单                      | `DropdownMenu`、`ContextMenu`、`Menubar`                                                            |
| 工具提示/信息              | `Tooltip`、`HoverCard`、`Popover`                                                                   |

## 关键字段

注入的项目上下文包含以下关键字段：

- **`aliases`** → 导入时使用实际的别名前缀（例如 `@/`、`~/`），切勿硬编码。
- **`isRSC`** → 当值为 `true` 时，使用 `useState`、`useEffect`、事件处理程序或浏览器 API 的组件需要在文件顶部添加 `"use client"`。在提供有关该指令的建议时，务必参考此字段。
- **`tailwindVersion`** → `"v4"` 使用 `@theme inline` 块；`"v3"` 使用 `tailwind.config.js`。
- **`tailwindCssFile`** → 定义自定义 CSS 变量的全局 CSS 文件。始终编辑此文件，切勿新建文件。
- **`style`** → 组件的视觉样式（例如 `nova`、`vega`）。
- **`base`** → 基础组件库（`radix` 或 `base`）。这会影响组件 API 和可用的属性。
- **`iconLibrary`** → 决定图标的导入方式。`lucide` 使用 `lucide-react`，`tabler` 使用 `@tabler/icons-react`，依此类推。切勿默认使用 `lucide-react`。
- **`resolvedPaths`** → 组件、工具函数、钩子等内容在文件系统中的确切目标路径。
- **`framework`** → 路由和文件约定（例如 Next.js App Router 与 Vite SPA）。
- **`packageManager`** → 安装任何非 shadcn 依赖项时使用此字段（例如 `pnpm add date-fns` 与 `npm install date-fns`）。

有关完整的字段参考，请参阅 [cli.md — `info` 命令](./cli.md)。

## 组件文档、示例和用法

运行 `npx shadcn@latest docs <component>` 以获取组件的文档、示例和 API 参考地址。获取这些地址的实际内容。

```bash
npx shadcn@latest docs button dialog select
```

**在创建、修复、调试或使用组件时，务必先运行 `npx shadcn@latest docs` 并获取这些地址的内容。** 这可确保你依据正确的 API 和使用模式进行操作，而不是凭空猜测。

## 工作流程

1. **获取项目上下文** — 已在上方注入。如需刷新，请再次运行 `npx shadcn@latest info`。
2. **首先检查已安装的组件** — 在运行 `add` 之前，务必检查项目上下文中的 `components` 列表，或列出 `resolvedPaths.ui` 目录。不要导入尚未添加的组件，也不要重复添加已安装的组件。
3. **查找组件** — `npx shadcn@latest search`。
4. **获取文档和示例** — 运行 `npx shadcn@latest docs <component>` 获取地址，然后获取其内容。使用 `npx shadcn@latest view` 浏览尚未安装的注册表条目。如需预览对已安装组件的更改，请使用 `npx shadcn@latest add --diff`。
5. **安装或更新** — `npx shadcn@latest add`。更新现有组件时，先使用 `--dry-run` 和 `--diff` 预览更改（请参阅下方的[更新组件](#updating-components)）。
6. **修复第三方组件中的导入** — 从社区注册表（例如 `@bundui`、`@magicui`）添加组件后，检查新增的非 UI 文件中是否存在类似 `@/components/ui/...` 的硬编码导入路径。这些路径与项目的实际别名不匹配。使用 `npx shadcn@latest info` 获取正确的 `ui` 别名（例如 `@workspace/ui/components`），并据此重写导入。CLI 会重写其自身 UI 文件中的导入，但第三方注册表组件可能使用与项目不匹配的默认路径。
7. **审查新增的组件** — 从任何注册表添加组件或区块后，**务必阅读新增的文件并验证其正确性**。检查是否缺少子组件（例如存在 `SelectItem` 但没有 `SelectGroup`）、缺少导入、组合方式不正确，或违反[关键规则](#critical-rules)。还应根据项目上下文中的 `iconLibrary` 替换所有图标导入（例如，如果注册表条目使用 `lucide-react`，但项目使用 `hugeicons`，则应相应替换导入和图标名称）。在继续下一步之前修复所有问题。
8. **必须明确指定注册表** — 当用户要求添加区块或组件时，**不要猜测注册表**。如果未指定注册表（例如用户只说“添加一个登录区块”，却没有指定 `@shadcn`、`@tailark` 等），请询问要使用哪个注册表。切勿代替用户默认选择注册表。
9. **切换预设** — 先询问用户：**覆盖**、**合并**还是**跳过**？
   - **覆盖**：`npx shadcn@latest apply --preset <code>`。覆盖检测到的组件、字体和 CSS 变量。
   - **合并**：`npx shadcn@latest init --preset <code> --force --no-reinstall`，然后运行 `npx shadcn@latest info` 列出已安装的组件，再对每个已安装的组件使用 `--dry-run` 和 `--diff`，逐一进行[智能合并](#updating-components)。
   - **跳过**：`npx shadcn@latest init --preset <code> --force --no-reinstall`。仅更新配置和 CSS，组件保持不变。
   - **重要**：始终在用户的项目目录中运行预设命令。`apply` 仅适用于包含 `components.json` 文件的现有项目。CLI 会自动保留 `components.json` 中当前的基础库（`base` 或 `radix`）。如果必须使用临时目录（例如用于 `--dry-run` 比较），请显式传入 `--base <current-base>`——预设代码并不包含基础库信息。

## 更新组件

当用户要求从上游更新组件，同时保留其本地更改时，请使用 `--dry-run` 和 `--diff` 进行智能合并。**绝不要手动从 GitHub 获取原始文件——始终使用 CLI。**

1. 运行 `npx shadcn@latest add <component> --dry-run`，查看所有将受影响的文件。
2. 对每个文件运行 `npx shadcn@latest add <component> --diff <file>`，查看上游版本与本地版本之间的差异。
3. 根据差异逐个文件决定如何处理：
   - 没有本地更改 → 可以安全覆盖。
   - 存在本地更改 → 读取本地文件，分析差异，并在保留本地修改的同时应用上游更新。
   - 用户说“直接更新所有内容” → 使用 `--overwrite`，但要先确认。
4. **未经用户明确批准，绝不要使用 `--overwrite`。**

## 快速参考

```bash
# Create a new project.
npx shadcn@latest init --name my-app --preset base-nova
npx shadcn@latest init --name my-app --preset a2r6bw --template vite

# Create a monorepo project.
npx shadcn@latest init --name my-app --preset base-nova --monorepo
npx shadcn@latest init --name my-app --preset base-nova --template next --monorepo

# Initialize existing project.
npx shadcn@latest init --preset base-nova
npx shadcn@latest init --defaults  # shortcut: --template=next --preset=nova (base style implied)

# Apply a preset to an existing project.
npx shadcn@latest apply --preset a2r6bw
npx shadcn@latest apply a2r6bw

# Add components.
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add --all

# Preview changes before adding/updating.
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx
npx shadcn@latest add @acme/form --view button.tsx

# Search registries.
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest search @tailark -q "stats"

# Get component docs and example URLs.
npx shadcn@latest docs button dialog select

# View registry item details (for items not yet installed).
npx shadcn@latest view @shadcn/button
```

**命名预设：** `nova`、`vega`、`maia`、`lyra`、`mira`、`luma`
**模板：** `next`、`vite`、`start`、`react-router`、`astro`（均支持 `--monorepo`）以及 `laravel`（不支持 monorepo）
**预设代码：** 带版本前缀的 base62 字符串（例如 `a2r6bw` 或 `b0`），来自 [ui.shadcn.com](https://ui.shadcn.com)。

## 详细参考

- [rules/forms.md](./rules/forms.md) — FieldGroup、Field、InputGroup、ToggleGroup、FieldSet、验证状态
- [rules/composition.md](./rules/composition.md) — Groups、overlays、Card、Tabs、Avatar、Alert、Empty、Toast、Separator、Skeleton、Badge、Button 加载状态
- [rules/icons.md](./rules/icons.md) — data-icon、图标尺寸、以对象形式传递图标
- [rules/styling.md](./rules/styling.md) — 语义化颜色、变体、className、间距、尺寸、truncate、深色模式、cn()、z-index
- [rules/base-vs-radix.md](./rules/base-vs-radix.md) — asChild 与 render、Select、ToggleGroup、Slider、Accordion
- [cli.md](./cli.md) — 命令、标志、预设、模板
- [customization.md](./customization.md) — 主题设置、CSS 变量、扩展组件