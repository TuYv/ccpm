---
name: new-page
description: Interview-then-scaffold guide for adding a new page to ethereum.org. Forks first on markdown-backed vs App Router page, then picks the layout and hero, maps the Figma design to existing components, and builds it reuse-first. Invoke with /new-page.
disable-model-invocation: true
---
# 新页面

一个新的 ethereum.org 页面遵循**复用优先**原则：每个区域都映射到一个已经存在的布局、hero、基础组件或变体——你需要对现有内容进行*配置*，而不是构建一个与之平行的版本。此技能会询问缺失的上下文，然后基于设计系统搭建页面脚手架。

按顺序执行这些步骤。每一步结束时都有一个可检查的条件——在满足当前步骤之前，不要开始下一步。

## 步骤 0 — 加载设计系统

调用 `design-system` 技能，并在询问任何其他内容之前完整阅读其 `SKILL.md`。它是组件选择、设计令牌、布局、RTL/i18n 以及服务端/客户端边界的唯一依据。**不要在此处重复其目录**——需要布局清单时，阅读 `design-system/references/layouts.md`，并对照 `src/layouts/index.ts` 进行验证（布局会被重构）。

**完成条件：** 本次会话中已阅读 `design-system` SKILL.md。

## 步骤 1 — 访谈

首要分支是**由 markdown 驱动还是不是**。它决定布局系统、构建方式以及页面的翻译方式——因此要先确定这一点。这是一个*内容编写方式*的决策（即内容如何编写和维护），**而不是视觉方面的决策**：顶部带有 hero 的文章页面可以属于任一类型，因为 `ContentLayout` 会为 markdown 提供 `TopicLayout`，并为 App Router 页面提供相同的 hero + 卡片目录外观。因此，**要询问用户；绝不能根据设计推断。**

使用 `AskUserQuestion`：

1. **Markdown 页面还是 App Router 页面？**
   - *Markdown 页面* — 内容编写在 `public/content/<route>/index.md` 中，通过 `[...slug]` 渲染，由 intl-pipeline 翻译，并基于一组固定的 MDX 短代码构建。适用于由作者在 markdown 中维护的编辑类/教育类内容。
   - *App Router 页面* — 手动构建的 `app/[locale]/<route>/page.tsx`，组合使用 `ContentLayout`。适用于交互式、数据驱动，或需要 markdown 短代码无法表达的布局/组件的页面。通过 `getTranslations` JSON 键进行翻译。
2. **路由** — URL 路径（例如 `/stablecoins/`）。文件夹名称就是路由。
3. **设计来源** — Figma 链接/选区、文字描述，或无。
4. **内容**（仅限 markdown）— 用户是否已经准备好正文，还是需要你起草？

然后**检查路由是否空闲**：不存在 `public/content/<route>/index.md` 或 `app/[locale]/<route>/page.tsx`。如果其中一个存在，则你是在*编辑*，而不是创建——在进行任何写入之前，指出该文件并确认；绝不要静默覆盖并非由你创建的页面。

**完成条件：** 已知 markdown 与 App Router 的选择、路由和设计来源，并且已确认路由空闲（或已获准编辑）。

## 步骤 2 — 获取设计（仅当提供了 Figma 时）

使用 Figma MCP **重新读取**设计（设计可能会在不同运行之间发生变化——绝不要依赖更早轮次中的读取结果）：使用 `get_metadata` 获取框架树，然后对每个区域使用 `get_design_context` / `get_screenshot`；使用 `search_design_system` / `get_code_connect_map` 查找现有代码映射。在进行任何 `use_figma` 调用之前，先加载 `figma-use` 技能。

生成一份 **组件映射表**，并且**始终以表格形式向用户展示**——三列：**Region**（从上到下的每个设计区域）· **Maps to**（用于渲染该区域的现有基础组件 + 变体——`PageHero`、`Card`、`BigNumber` 等）· **Status**（`reuse`、`missing asset`、`placeholder copy`、`missing data` 等）。从上到下检查整个画面，为**每个**区域建立映射。该表是用户了解你在画面中看到的内容的唯一窗口——每次运行都要渲染它；绝不能只在内部思考映射关系。

**节点名称不可信。** 名为 `Screenshot 2026-…` 或 `Frame 1789` 的节点通常是真实内容——可能是统计数据区（`BigNumber`）、视频嵌入（`YouTube`）或提示框（`Alert`），而不是可以忽略的临时内容。绝不能因为区域名称*看起来*像草稿就省略该区域；先对其执行 `get_screenshot`，确认它实际是什么，再做决定。

**缺少数据 → 提问，不要猜测。** 当某个区域需要设计稿中没有提供的值时——例如缩略图背后的 YouTube ID、真实目标 URL、实时数据源——你无法从画面中提取这些信息。请标记该问题并询问用户；猜测嵌入内容或编造链接不如留下一个待确认的问题。

**匹配，而不是仿制。** 使用现有组件及其变体还原设计。不要在基础组件上叠加自定义 Tailwind/CSS 来追求像素级一致。如果某个区域没有合适的基础组件或变体，正确做法是添加一个变体（`design-system/references/variant-vs-new.md`）——绝不能创建一次性组件或定制样式。标记所有此类缺口，并在自行设计之前获得确认。

**对作者方式分支进行压力测试。** 映射过程可能会揭示某个区域无法用 markdown shortcode 表达——例如交互式组件、由数据驱动的列表、定制的多列网格，或带有 **lucide** 图标的卡片（`MarkdownCard` 接受 `emoji` *或* `icon: ReactNode`，但普通 `.md` 文件无法编写 ReactNode，因此在 markdown 中，`<Card>` shortcode 实际上只能使用 emoji）。出现其中任意一种情况，都意味着该页面需要使用 App Router。如果 Step 1 选择的是 markdown，请明确指出这一冲突，并在搭建脚手架之前重新确认——之后再切换将导致重写。

**完成条件：** 组件映射表已经展示给用户，并且用户已经确认或修正；每个区域都已处理——完成映射、标记为待批准的变体，或提出数据缺失问题——同时作者方式分支仍然成立。

## Step 3 — 选择布局和 hero

根据 Step 1 选择分支。

### Markdown 页面 — 选择 `template:`

布局由 frontmatter 中的 `template:` 值决定（默认值为 `static`）。完整清单见 `design-system/references/layouts.md`；当前可用集合见 `src/layouts/index.ts`。

| `template:` | 布局 | 适用场景 | 它所渲染的 Hero |
|---|---|---|---|
| `static`（默认） | `StaticLayout` | 一次性的编辑内容，没有子导航 | 仅标题 + 面包屑（`PageHero variant="no-divider"`，**无图片**） |
| `use-cases` / `staking` / `roadmap` / `upgrade` | `TopicLayout` | 主题中心页：带侧边图片的完整 Hero + 同级页面子导航 | 来自 frontmatter `image` / `summary` / `buttons` 的图片 `PageHero` |
| `docs` | `DocsLayout` | 带文档侧边栏的开发者文档 | — |
| `tutorial` | `TutorialLayout` | 带作者/日期/技能元数据的开发者教程 | — |

- 每个 Topic 模板都有独特的 **MDX 组件列表**（`componentsMapping`, `src/layouts/index.ts`）——选择其短代码与内容匹配的模板。
- **设计中带侧边图片的 hero → 使用 Topic 模板**（`static` 仅渲染标题 hero）。`showDropdown`、新主题接入方式以及绝不新增布局的规则：`design-system/references/layouts.md`。

### App Router 页面 — 组合 `ContentLayout`，传入合适的 hero

手动构建 `app/[locale]/<route>/page.tsx`，组合 `ContentLayout`，并根据设计选择 hero：

- `PageHero` — 面包屑 + 标题 + 可选的 `heroImg` + 描述 + 按钮。主力组件；同时涵盖图片 hero 和纯标题 hero。
- `HubHero` — 大型 hub hero（范例：`/learn/`）。

手动构建 `tocItems` 数组，并将每个正文部分包裹在 `<Section id>` 中。`ContentLayout` 负责卡片式目录、贡献者区块和反馈功能。范例：`/learn/`、`/what-is-ethereum/`。

**完成标准：** 已选择 markdown → `template:`（以及相关时的 `showDropdown`）；已选择 App Router → hero 组件。并已与用户确认。

## 第 4 步 — 搭建骨架

根据第 2 步的组件映射进行构建。始终优先复用——不要使用原始的 `<a>`/`<button>`，不要使用十六进制颜色，使用逻辑 CSS 属性（`ms-`/`me-`/…），使用支持 locale 的 `numberFormat()`/`dateTimeFormat()`。图标：`.tsx` 中使用 **lucide**，markdown 中使用 emoji（markdown 无法传递 `icon` ReactNode prop）。

**Markdown 页面：**
- 创建包含 frontmatter 的 `public/content/<route>/index.md`（`title`、`description`、`lang: en`，以及除非是 static，否则还要包含 `template:`）。仅使用英文——绝不要手动编写翻译副本；intl-pipeline 会将其传播出去。
- **内联图片与 `index.md` 放在同一目录中**，并使用相对路径引用——`/images/...` 形式的内联路径会导致 MDX 渲染返回 500；frontmatter 中的 `image:` hero 是例外。详情：`design-system/references/gotchas.md`。
- 每个 h1–h4 都需要一个 `{#kebab-id}`；运行 `pnpm lint:md:fix`。
- 如果使用 `TopicLayout`：添加 `src/data/topics/<key>.ts`，在 `src/layouts/index.ts` 中接入 `layoutMapping`/`componentsMapping`，并添加 `src/intl/en/page-<key>.json`。

**App Router 页面：**
- 创建组合 `ContentLayout` 的 `app/[locale]/<route>/page.tsx`（参考 `/learn/` 或 `/what-is-ethereum/`）：传入 `heroSection`、手动构建的 `tocItems` 和 `contributors`；将正文包裹在 `<Section id>` 中。如果不需要状态/副作用/处理函数，则使用 Server Component。
- 所有面向用户的字符串都通过 `getTranslations` 提供；将键添加到 `src/intl/en/`。

**完成标准：** 页面通过其布局渲染，内容/字符串均已就位，并且没有将现有基础组件重新内联实现。

## 第 5 步 — 验证（静态检查）

- `pnpm type-check`（可捕获无效的链名称和类型错误）。
- 按照设计系统的 **Pre-Merge Smoke Test** 检查清单逐项执行。
- 对任何真正新增的 UI 基础组件添加 `.stories.tsx`。

**完成标准：** 类型检查通过，且冒烟测试检查清单无误。

## 第 6 步 — 通过对抗式审查循环进行 QA

静态检查通过的页面也可能存在明显问题——错误的图片路径、MDX 编译失败、某个部分静默地未能渲染。因此，必须通过**对抗式审查循环**运行并审计页面，而不是凭肉眼对比。

1. **运行它。** 启动 `pnpm dev`，等待 "Ready"，加载页面（对于 `en`，去掉 locale：`/<route>/`）。确认 **HTTP 200** — 500 几乎总是 MDX 或资源错误；阅读开发日志（非同目录的内联图像是最常见的一种）。页面损坏时无需进行审查。
2. **运行审查循环。** 阅读 `review-page/SKILL.md`，并针对该路由执行其中的步骤 1–5，直到通过。你已经持有步骤 1–2 中的设计源和路由，因此其中的步骤 0（运行中的页面 + 已知的设计源）已经满足。阅读并运行该流程；不要尝试从这里将 `/review-page` 作为 skill 调用。
   - **hero 发现的是模板错误，而不是 CSS 间距问题。** 当设计系统审查者针对侧边图像设计指出仅包含标题的 hero 时：对于 markdown 页面，这是错误的 `template:`（使用 Topic 模板，而不是 `static`）；对于 App Router 页面，将 `heroImg` 传递给 `PageHero`。绝不要使用自定义标记重新构建 hero。
3. **交接。** 保持开发服务器运行，并将服务器打印的本地 URL 提供给用户（例如 `http://localhost:3000/<route>/`）。

**完成条件：** 审查循环通过（或达到轮次上限，并将剩余发现交接出去），且用户已获得可访问的实时 URL。