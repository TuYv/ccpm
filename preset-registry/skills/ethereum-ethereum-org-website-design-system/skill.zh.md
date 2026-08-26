---
name: design-system
description: Use when building, refactoring, or styling any UI in the ethereum.org Next.js site (`src/components/`, `app/`, `src/styles/`, `public/content/`, or any `.tsx`/`.mdx`/`.css` change that affects the rendered UI). Provides canonical component choices, design tokens, RTL/i18n rules, server/client guidance, and the "use a variant, not a new component" pattern for the project's Tailwind v4 + Radix + shadcn-style design system.
---
# ethereum.org 设计系统

Tailwind v4（基于 CSS 的配置，不使用 `tailwind.config.ts`）+ React 19 / Next.js App Router + Radix UI primitives + shadcn 风格的组件层。Token 位于 CSS 中。激活时完整阅读此文件；仅在列出的触发条件适用时从 `references/` 中读取内容。

## 核心习惯：优先复用，而不是重新发明

要保持此代码库一致性，最具杠杆效应的单一习惯是：**当你需要新的 UI 时，先寻找现有的 primitive 或 variant，只有在没有合适选项时才自行创建。** 大多数“新组件”的直觉，实际上都是伪装成“新 variant”的直觉。

在编写任何 UI 代码之前，先问自己：
- 是否已经有能实现此功能的 primitive？（`Card`、`Button`、`Alert`、`Tag`、`Hero/*`）
- 差异是否足够小，可以通过在现有 primitive 上添加 *variant* 来表达？
- 是否可以组合现有 primitive，而不是内联一长串 Tailwind class？

如果你发现自己正在为类似卡片的元素编写 `flex items-center gap-X rounded-Y border bg-... p-Z`，那你其实是在重新发明 `<Card>`。如果你为某个统计数字编写 `<p className="text-4xl font-bold">N</p>`，那你其实是在重新发明 `<BigNumber>`。如果你编写 `<div className="text-5xl font-bold">Title</div>`，那你其实是在重新发明 `<h1>`（它已经由 `base.css` 设置了样式）。**组合，而不是内联。**

当现有 primitive 不完全适用时，答案通常是“添加一个 variant”，而不是“创建一个新文件”。参阅 `references/variant-vs-new.md`。

## 顶层规则

1. **不要使用原生 `<a>` 或 `<button>`。** 使用来自 `@/components/ui/buttons/Button` 的 `<Button>`/`<ButtonLink>`，以及来自 `@/components/ui/Link` 的 `InlineLink`/`BaseLink`/`LinkWithArrow`。这些 primitive 负责事件跟踪、外部链接安全、locale 路由和焦点环。
2. **不要使用原始颜色值。** 使用语义化 token（`text-body`、`bg-background`、`border-border`、`text-primary`）。十六进制字面量和 `rgb()` 调用会绕过深色模式。
3. **优先为现有 primitive 添加 variant，而不是创建新组件。** Card、Button、Alert、Tag 是最常见的目标。
4. **默认使用 Server Components。** 仅在需要状态、effect、浏览器 API 或内联事件处理程序时使用 `"use client"`。
5. **所有文本都必须可翻译。** 服务端使用 `next-intl/server` 中的 `getTranslations`，客户端使用 `next-intl` 中的 `useTranslations`。每个命名空间绑定一个 `t` —— 要访问另一个命名空间时，绑定第二个函数（例如 `const tCommon = useTranslations("common")`）。旧版 `@/hooks/useTranslation` wrapper 已弃用，不要在新代码中使用。绝不要硬编码面向用户的英文。**在 `app/[locale]/` 页面或 `generateMetadata` 中，必须在调用任何 next-intl API 之前调用 `setRequestLocale(locale)`**，否则按需渲染会抛出 `static to dynamic ... reason: headers` —— 参阅 `references/i18n-rtl.md`。
6. **使用用于方向适配的逻辑 CSS。** 使用 `ms-`/`me-`/`ps-`/`pe-`/`inset-s-`/`inset-e-`/`border-s`/`border-e`/`text-start`/`text-end`。网站支持阿拉伯语和乌尔都语（RTL）。硬编码的 `left-`/`right-`/`ml-`/`mr-`/`pl-`/`pr-` 会破坏 RTL。
7. **使用适配 locale 的格式化工具。** 使用来自 `@/lib/utils/numbers` 的 `numberFormat()`，以及来自 `@/lib/utils/date` 的 `dateTimeFormat()`。绝不要直接使用 `toLocaleString` / `Intl.NumberFormat`。
8. **对有方向性的图标**（指向右侧的箭头/尖括号）使用 `useRtlFlip()`。或者使用来自 `@/components/Chevron` 的 `ChevronNext`/`ChevronPrev`。
9. **Markdown 内容必须经过 `MdComponents`。** `<Card>` Markdown shortcode 由 `@/components/MarkdownCard` 支持（这是一个围绕 `ui/card` primitive 的薄封装，提供适用于 MDX 的 prop 形式）。对于 app 代码，直接从 `@/components/ui/card` 组合这些 primitive。
10. **新的 UI 组件必须同时提供 Storybook stories。** 不使用自动化单元测试；Storybook + Chromatic + 类型检查构成验证层。
11. **不要添加新的布局。** 目前有六种规范布局（`TopicLayout`、`StaticLayout`、`DocsLayout`、`TutorialLayout`、`ContentLayout`、`BaseLayout`）。新的分区内容应作为 `TopicLayout` 配置放入 `src/data/topics/<key>.ts`，而不是创建新的布局组件。参阅 `references/layouts.md`。

## 价值最高的易错点（索引）

代码看起来合理，但模式实际上是错误的陷阱。每项一行；规范说明见对应的参考文档。

- **容易混淆的导入** -- Tooltip（`@/components/Tooltip`，而不是 `ui/tooltip`）、Modal（`ui/dialog-modal` 与 `ui/dialog`；同一功能内不要混用来源）、Card（应用代码使用 `ui/card`，而不是 `MarkdownCard`）、Heroes（`@/components/Hero` 的具名导出；`title` 始终对应 `<h1>`，没有 `header` prop）。决策树：`references/canonical-imports.md`。
- **过时的 shadcn token 名称**（`bg-popover`、`bg-muted`、`text-muted-foreground`，……）仍残留在少数 `ui/` 文件中，但无法解析为本项目的 tokens。不要新增使用。列表：`references/tokens.md`；替换方案：`references/cleanup-playbook.md`。
- **`useColorModeValue` 是已弃用的 Chakra 遗留项** -- 使用 `dark:` + 语义化 tokens。
- **`Card` 由 variant 驱动，而不是由 `className` 驱动。** 内边距/间距/背景/圆角/文字颜色都应通过 `variant`/`size` 设置；使用 `className` 覆盖意味着缺少对应的 variant 用例。完整系统：`references/card-walkthrough.md`。意外行为（`solid` 上的 `isSecondary` 不起作用、`CardBanner fit="contain"` 自动添加背景、`LinkBox` 需要 `LinkOverlay`、与 `Switch` 共享的 `commonControlClasses`）：`references/gotchas.md`。
- **没有 `Heading` 原语** -- `base.css` 会为 `<h1>`-`<h6>` 设置样式；直接写标签即可。若要在任意位置匹配某个标题级别的字号，请使用 `text-h1`-`text-h6`（仅包含字号 + 行高）-- 永远不要使用原始的 `text-3xl lg:text-4xl` 组合，也不要在真实标题上再次设置字重。规范说明：`references/spacing-typography.md`。
- **间距应使用 `.flow` + `page`/`space`/`hero` tokens**，而不是手写 margin。应用页面遵循 `<main className="p-page"> > <MainArticle className="flow"> > <Section id>` 骨架。详情：`references/spacing-typography.md`；token 表：`references/tokens.md`。
- **Locale 格式化** -- `ui/chart.tsx` 中还残留一个 `toLocaleString`；不要再添加。请使用 `numberFormat()`。

### 阴影：默认使用 Tailwind 的等级

根据表面选择：下拉菜单/工具提示使用 `shadow-md`，卡片/popover/modal 使用 `shadow-lg`，大型带边框盒子/sheet 使用 `shadow-xl`。三条规则：

1. 只有两个自定义阴影（`shadow-primary-xl`、`shadow-primary-no-blur-*`，均位于 `utilities.css` 中）-- 任何新增阴影都需要有品牌色调方面的理由。
2. 悬停提升效果使用 `hover-lift-*` utility 或 `Card hoverLift`（两者都受 `motion-safe` 控制），绝不要为每个组件单独设置静止/悬停阴影组合。
3. 真正需要的自定义阴影必须是原始 `box-shadow` `@utility`，绝不要使用任意值 `shadow-[...]` -- 任意阴影会通过 `--tw-shadow-color` 处理颜色，而全局的 `* { dark:shadow-body }` 规则会在深色模式下将其变灰。

旧阴影 token 映射表：`references/cleanup-playbook.md`。

## “应该从哪里导入？”速查表

| 我需要…… | 导入 |
|---|---|
| Card | `import { Card, CardBanner, CardContent, CardTitle, CardParagraph } from "@/components/ui/card"` |
| Modal/Dialog（典型用法） | `import Modal from "@/components/ui/dialog-modal"`（默认导出） |
| 侧边 sheet | `import { Sheet, ... } from "@/components/ui/sheet"` |
| Tooltip | `import Tooltip from "@/components/Tooltip"`（不是 `@/components/ui/tooltip`） |
| Button | `import { Button, ButtonLink } from "@/components/ui/buttons/Button"` |
| Anchor（正文中） | `import InlineLink from "@/components/ui/Link"`（默认导出） |
| Anchor（带箭头的 CTA） | `import { LinkWithArrow } from "@/components/ui/Link"` |
| 页面 hero | `import { PageHero, HubHero } from "@/components/Hero"` |
| 行内 alert | `import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert"` |
| 页面顶部 banner | `import { Alert } from "@/components/ui/alert"`，然后使用 `<Alert variant="banner">` |
| 大号数字显示 | `import BigNumber from "@/components/BigNumber"` |
| 布局 | `import { Stack, HStack, VStack, Flex, Center } from "@/components/ui/flex"` |
| 数字格式化 | `import { numberFormat } from "@/lib/utils/numbers"` |
| 日期格式化 | `import { dateTimeFormat } from "@/lib/utils/date"` |
| RTL 翻转辅助工具 | `import { useRtlFlip } from "@/hooks/useRtlFlip"` |

如需查看包含所有相似项陷阱的完整决策树，请参阅 `references/canonical-imports.md`。

## 何时加载各个参考文档

仅在触发相应条件时加载这些文档。不要一开始就全部阅读。

- **`references/canonical-imports.md`** -- 不确定几个相似的导入中哪个是规范导入。
- **`references/components.md`** -- 完整的组件清单、变体及用法。
- **`references/tokens.md`** -- 添加 token、渐变、z-index、语义 token 选择，以及在 `src/styles/` 中进行工作。
- **`references/spacing-typography.md`** -- 页面/区块布局、标题字号、间距节奏、`.flow` 系统。
- **`references/gotchas.md`** -- 原语行为出乎意料的情况；容易引发长期困惑的模式。
- **`references/variant-vs-new.md`** -- 创建任何新的组件文件之前。
- **`references/cleanup-playbook.md`** -- 重构现有反模式；“旧模式 -> 新模式”映射。
- **`references/i18n-rtl.md`** -- 面向用户的文本、数字/日期格式化、RTL、翻译 key、`setRequestLocale`。
- **`references/server-vs-client.md`** -- `"use client"` 决策和 SSR 边界结构。
- **`references/a11y.md`** -- 交互元素、表单、图片、标题层级。
- **`references/card-walkthrough.md`** -- 任何卡片形状的 UI 工作。
- **`references/callout-walkthrough.md`** -- 添加或修改内容中的 `Callout`。
- **`references/page-hero-walkthrough.md`** -- 需要 hero 的新页面。
- **`references/layouts.md`** -- 布局选择、新主题中心、一次性布局重构。
- **`references/new-component-checklist.md`** -- 为新组件创建 PR 之前。

## 可能适用的其他项目 Skill

- **`data-layer`** -- 用于数据获取/数据源。需要数据的 UI 工作应与此组合使用。

## 合并前冒烟测试

在为任何 UI 工作创建 PR 之前：

- [ ] 没有原始的 `<a>` 或 `<button>`
- [ ] 没有硬编码的颜色（`#hex`、`rgb()`、`hsla()`）；仅使用语义 token
- [ ] 没有 `left-`/`right-`/`ml-`/`mr-`/`pl-`/`pr-`（使用逻辑等价类）
- [ ] 所有面向用户的字符串都可翻译
- [ ] 使用 `numberFormat()`/`dateTimeFormat()` 进行格式化（不要使用原生 API）
- [ ] 尽可能使用 Server Components
- [ ] 新的 UI 原语都有一个 `.stories.tsx`
- [ ] 标题使用 `<h1>`-`<h6>`（不要使用 `<div className="text-5xl font-bold">`）
- [ ] 如果引入新组件，请说明为什么它不是现有组件的变体