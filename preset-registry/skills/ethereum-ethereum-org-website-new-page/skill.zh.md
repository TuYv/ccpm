---
name: new-page
description: Interview-then-scaffold guide for adding a new page to ethereum.org. Forks first on markdown-backed vs App Router page, then picks the layout and hero, maps the Figma design to existing components, and builds it reuse-first. Invoke with /new-page.
disable-model-invocation: true
---
# 新页面

新的 ethereum.org 页面应**优先复用**：每个区域都应映射到已有的布局、首屏、基础组件或变体——你要做的是*配置*现有内容，而不是构建一个与之平行的版本。本技能会通过提问补全缺失的上下文，然后基于设计系统搭建页面框架。

请按顺序执行这些步骤。每一步都以一个可检查的条件结束——在当前条件满足之前，不要开始下一步。

## 步骤 0 — 加载设计系统

在询问任何其他问题之前，调用 `design-system` 技能并完整阅读其 `SKILL.md`。它是组件选择、令牌、布局、RTL/i18n 以及服务端/客户端边界的事实依据。**不要在这里复述其目录**——需要布局清单时，请阅读 `design-system/references/layouts.md`，并对照 `src/layouts/index.ts` 进行验证（布局会被重构）。

**完成条件：** 本次会话中已阅读 `design-system` 的 SKILL.md。

## 步骤 1 — 访谈

首要分支是**是否由 markdown 驱动**。它决定了布局系统、构建方式以及页面的翻译方式——因此必须先确定这一点。这是一个*内容创作*决策（内容如何编写和维护），**而不是**视觉决策：顶部带首屏的正文页面可以采用任一方式，因为 `ContentLayout` 能让 markdown `TopicLayout` 和 App Router 页面拥有相同的首屏 + 卡片式目录外观。因此，**必须询问；绝不能根据设计推断。**

使用 `AskUserQuestion`：

1. **Markdown 页面还是 App Router 页面？**
   - *Markdown 页面*——内容编写在 `public/content/<route>/index.md` 中，通过 `[...slug]` 渲染，由 intl-pipeline 翻译，并使用一组固定的 MDX 短代码构建。适合由作者使用 markdown 维护的编辑类或教育类内容。
   - *App Router 页面*——手工构建的 `app/[locale]/<route>/page.tsx`，用于组合 `ContentLayout`。当页面具有交互性、由数据驱动，或需要 markdown 短代码无法表达的布局/组件时，选择此方式。通过 `getTranslations` JSON 键进行翻译。
2. **路由**——URL 路径（例如 `/stablecoins/`）。文件夹名称*就是*路由。
3. **设计来源**——Figma 链接/选区、书面描述，或无设计来源。
4. **内容**（仅适用于 markdown）——用户是否已准备好正文，还是需要你起草？

然后**检查路由是否可用**：确认不存在现有的 `public/content/<route>/index.md` 或 `app/[locale]/<route>/page.tsx`。如果其中之一存在，那么你是在*编辑*而不是创建——请明确指出并在执行任何写入操作前进行确认；绝不能静默覆盖并非由你编写的页面。

**完成条件：** 已知页面采用 markdown 还是 App Router、路由和设计来源，并已确认路由可用（或已获准编辑）。

## 步骤 2 — 获取设计（仅当提供了 Figma 时）

使用 Figma MCP **重新**读取设计（设计可能会在不同运行之间发生变化——绝不要依赖之前轮次中读取的内容）：使用 `get_metadata` 获取框架树，然后对每个区域使用 `get_design_context` / `get_screenshot`；使用 `search_design_system` / `get_code_connect_map` 查找现有代码映射。在调用任何 `use_figma` 之前，先加载 `figma-use` 技能。

生成一份**组件映射表**，并且**始终以表格形式向用户展示**——包含三列：**区域**（从上到下的每个设计区域）· **映射到**（用于渲染该区域的现有原语及其变体——`PageHero`、`Card`、`BigNumber`……）· **状态**（`reuse`、`missing asset`、`placeholder copy`、`missing data`……）。映射必须**详尽无遗**——从上到下逐一检查整个画面；任何未映射的区域，都可能在未被察觉的情况下无法交付。该表格是用户了解你在画面中看到了什么的唯一窗口——用户依靠它在交付*之前*发现误读或遗漏，因此每次运行都必须展示该表格；绝不能只在内部推理映射关系而不展示。

**节点名称并不可信。** 名为 `Screenshot 2026-…` 或 `Frame 1789` 的节点通常是真实内容——可能是统计数据带（`BigNumber`）、视频嵌入（`YouTube`）、提示框（`Alert`）——而非可随意丢弃的内容。绝不能因为某个区域的名称*看起来*像草稿就将其省略；在做出判断之前，先对它执行 `get_screenshot`，查看它究竟是什么。

**缺少数据 → 询问，不要猜测。** 当某个区域需要设计中并未包含的值时——例如缩略图背后的 YouTube ID、真实的目标 URL 或实时数据源——你无法从画面中提取这些信息。标记该问题并询问用户；猜测出来的嵌入内容或虚构的链接，比保留一个待确认问题更糟糕。

**匹配，而非模仿。** 使用现有组件及其变体复现设计。不要在原语之上叠加自定义 Tailwind/CSS 来追求像素级一致。如果某个区域没有合适的原语或变体，正确做法是*添加变体*（`references/variant-vs-new.md`）——绝不能创建一次性组件或定制样式。标记所有此类缺口，并在自行创作之前先征得确认。

**严格检验创作方式的分叉选择。** 映射表可能会揭示某些区域无法用 markdown 短代码表达——例如交互式小组件、数据驱动的列表、定制的多列网格，或带有 **lucide** 图标的卡片（markdown 的 `<Card>`/`MarkdownCard` 短代码只接受 `emoji` 属性，不支持 lucide）。出现其中任何一种情况，都意味着该页面应采用 App Router。如果第 1 步选择了 markdown，请明确指出这一冲突，并在搭建脚手架之前再次确认——后续再切换将意味着重写。

**完成条件：** 已向用户展示组件映射表，并且用户已确认或修正；每个区域都已得到处理——映射到现有组件、标记为需要获批的变体，或作为缺失数据提出——并且创作方式的分叉选择仍然成立。

## 第 3 步——选择布局和首屏区域

根据第 1 步的选择进行分支。

### Markdown 页面——选择 `template:`

布局由 frontmatter 中的 `template:` 值选择（默认为 `static`）。完整清单位于 `design-system/references/layouts.md`；当前实际可用集合位于 `src/layouts/index.ts`。

| `template:` | 布局 | 适用场景 | 渲染的首屏区域 |
|---|---|---|---|
| `static`（默认） | `StaticLayout` | 一次性的编辑型正文，无子导航 | 仅标题 + 面包屑（`PageHero variant="no-divider"`，**无图片**） |
| `use-cases` / `staking` / `roadmap` / `upgrade` | `TopicLayout` | 主题中心：完整的侧图首屏区域 + 同级子导航 | 根据 frontmatter 中的 `image` / `summary` / `buttons` 渲染带图片的 `PageHero` |
| `docs` | `DocsLayout` | 带文档侧边栏的开发者文档 | — |
| `tutorial` | `TutorialLayout` | 包含作者/日期/技能元数据的开发者教程 | — |

- 每个 Topic 模板都有不同的 **MDX 组件列表**（`componentsMapping`、`src/layouts/index.ts`）——请选择其短代码与内容相匹配的模板。
- **设计中采用侧边图片的首屏 → 使用 Topic 模板。** 如果同级页面之间没有子导航，请添加 `showDropdown: false`（示例：`public/content/what-are-apps/index.md`）。**`static` 只会渲染纯标题首屏，绝不会渲染侧边图片首屏**——因此，在 `static` 上使用侧边图片设计是错误的；应切换模板，而不是试图用自定义标记强行实现。
- 基本上永远不应该新建布局。新的 Topic 中心页面应通过 `src/data/topics/<key>.ts` 配置 + `layoutMapping`/`componentsMapping` 条目 + 翻译命名空间来实现，而不是新建布局文件。

### App Router 页面——组合 `ContentLayout`，传入符合设计的首屏

手动构建 `app/[locale]/<route>/page.tsx` 并组合 `ContentLayout`，然后根据设计选择首屏：

- `PageHero`——面包屑 + 标题 + 可选的 `heroImg` + 描述 + 按钮。最常用的组件；同时涵盖带图片和纯标题的首屏。
- `HubHero`——大型中心页面首屏（示例：`/learn/`）。

手动构建 `tocItems` 数组，并将每个正文小节包装在 `<Section id>` 中。`ContentLayout` 负责卡片式目录、贡献者区块和反馈。示例：`/learn/`、`/what-is-ethereum/`。

**完成标准：** markdown → 已选择 `template:`（如果相关，还包括 `showDropdown`）；App Router → 已选择首屏组件。已与用户确认。

## 第 4 步——搭建框架

根据第 2 步的组件映射进行构建。始终优先复用——不要使用原始 `<a>`/`<button>`，不要使用十六进制颜色，使用逻辑 CSS 属性（`ms-`/`me-`/……），并使用支持区域设置的 `numberFormat()`/`dateTimeFormat()`。图标：**在 `.tsx` 中使用 lucide，在 markdown 中使用 emoji**（`<Card>` 短代码仅支持 emoji）。

**Markdown 页面：**
- 创建包含 frontmatter（`title`、`description`、`lang: en`，以及除 static 外所需的 `template:`）的 `public/content/<route>/index.md`。只写英文——绝不要手动编写翻译副本；intl-pipeline 会传播这些副本。
- **内联图片应放在同一位置**：将它们放在 `index.md` 旁边，并使用相对路径引用（`![alt](./hero.png)`）。内联图片使用 `/images/...` 路径会导致 MDX 渲染返回 500。（`TopicLayout` 上 frontmatter 中的 `image:` 首屏图片是例外——它接受 `/images/...` 公共路径。）
- 每个 h1–h4 都需要一个 `{#kebab-id}`；运行 `pnpm lint:md:fix`。
- 如果使用 `TopicLayout`：添加 `src/data/topics/<key>.ts`，在 `src/layouts/index.ts` 中接入 `layoutMapping`/`componentsMapping`，并添加 `src/intl/en/page-<key>.json`。

**App Router 页面：**
- 创建组合 `ContentLayout` 的 `app/[locale]/<route>/page.tsx`（仿照 `/learn/` 或 `/what-is-ethereum/`）：传入 `heroSection`、手动构建的 `tocItems` 和 `contributors`；将正文包装在 `<Section id>` 中。除非需要状态、effect 或处理程序，否则应使用服务器组件。
- 所有面向用户的字符串都通过 `getTranslations` 获取；将键添加到 `src/intl/en/`。

**完成标准：** 页面通过其布局完成渲染，内容/字符串均已就位，并且没有通过内联方式重复实现现有的基础组件。

## 第 5 步——验证（静态检查）

- `pnpm type-check`（可捕获无效的链名称和类型错误）。
- 逐项完成设计系统的 **合并前冒烟测试** 清单。
- 为任何真正新增的 UI 基础组件添加一个 `.stories.tsx`。

**完成标准：** 类型检查通过，冒烟检查清单无异常。

## 第 6 步 — 通过对抗式审查循环进行 QA

静态检查可能会在页面明显损坏的情况下通过——例如图片路径错误、MDX 编译失败，或某个区块未渲染却没有报错。因此，必须实际运行并审查页面。这里的 QA **不是**肉眼比对，而是**对抗式审查者循环**：由文案和设计系统审查子代理对照设计稿审查实际运行的页面，你对发现的问题进行分类和修复，然后重新审查，直到新一轮审查结果为**绿色**。只搭建页面而不运行此循环，等于只完成了一半工作。

1. **运行页面。** 启动 `pnpm dev`，等待出现 "Ready"，然后加载页面（对于 `en`，需去掉区域设置前缀：`/<route>/`）。确认返回 **HTTP 200**——500 几乎总是由 MDX 或资源错误导致；查看开发日志（最典型的问题是使用了未与页面放在同一位置的内联图片）。损坏的页面没有任何可审查的内容。
2. **运行审查循环。** 阅读 `review-page/SKILL.md`，并针对该路由执行其中的循环（第 1–5 步）：获取 Figma 和实际运行页面的产物，并行启动 `review-page/reviewers/` 中的两个审查者，对它们发现的问题进行分类、修复并重新审查，直到结果为绿色。你已经从第 1–2 步中获得了设计源和路由，因此其第 0 步（页面正在运行且设计源已知）已经满足——直接开始获取产物并启动审查者。阅读并执行该流程；不要尝试从这里将 `/review-page` 作为技能调用。
   - **首屏主视觉区问题属于模板缺陷，而不是 CSS 差异。** 当设计系统审查者发现只有标题的首屏主视觉区与带侧边图片的设计不符时：对于 Markdown 页面，这是 `template:` 错误（应使用 Topic 模板，而不是 `static`）；对于 App Router 页面，应将 `heroImg` 传递给 `PageHero`。绝不要使用自定义标记重新构建首屏主视觉区。
3. **交接。** 保持开发服务器运行，并将服务器输出的本地 URL 提供给用户（例如 `http://localhost:3000/<route>/`）。

**完成标准：** 审查循环结果为绿色（或已达到轮次上限，并已交接剩余问题），且用户已获得实际运行页面的 URL。