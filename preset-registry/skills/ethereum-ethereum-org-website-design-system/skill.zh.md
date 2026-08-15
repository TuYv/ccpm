---
name: design-system
description: Use when building, refactoring, or styling any UI in the ethereum.org Next.js site (`src/components/`, `app/`, `src/styles/`, `public/content/`, or any `.tsx`/`.mdx`/`.css` change that affects the rendered UI). Provides canonical component choices, design tokens, RTL/i18n rules, server/client guidance, and the "use a variant, not a new component" pattern for the project's Tailwind v4 + Radix + shadcn-style design system.
---
# ethereum.org 设计系统

Tailwind v4（CSS 优先配置，无 `tailwind.config.ts`）+ React 19 / Next.js App Router + Radix UI 原语 + shadcn 风格的组件层。令牌定义在 CSS 中。激活时请完整阅读此文件；仅当列出的触发条件适用时，才读取 `references/` 中的内容。

## 核心习惯：复用优于重新发明

保持此代码库一致性最具杠杆效应的习惯是：**当你需要新的 UI 时，先寻找现有原语或变体，只有在没有合适选项时才自行创建。** 大多数“新组件”的直觉，其实只是伪装成“新组件”的“新变体”需求。

在编写任何 UI 代码之前，先问自己：
- 是否已有原语可以实现这一功能？（`Card`、`Button`、`Alert`、`Tag`、`Hero/*`）
- 差异是否足够小，可以通过现有原语的某个*变体*来表达？
- 能否组合现有原语，而不是内联一长串 Tailwind 类？

如果你发现自己正在为类似卡片的元素编写 `flex items-center gap-X rounded-Y border bg-... p-Z`，那就是在重新发明 `<Card>`。如果你为统计数据编写 `<p className="text-4xl font-bold">N</p>`，那就是在重新发明 `<BigNumber>`。如果你编写 `<div className="text-5xl font-bold">Title</div>`，那就是在重新发明 `<h1>`（它已经由 `base.css` 设置了样式）。**使用组合，不要内联。**

当现有原语不完全合适时，答案通常是“添加一个变体”，而不是“创建一个新文件”。参见 `references/variant-vs-new.md`。

## 首要规则

1. **禁止使用原生 `<a>` 或 `<button>`。** 使用来自 `@/components/ui/buttons/Button` 的 `<Button>`/`<ButtonLink>`，以及来自 `@/components/ui/Link` 的 `InlineLink`/`BaseLink`/`LinkWithArrow`。这些原语负责处理事件跟踪、外部链接安全性、区域设置路由和焦点环。
2. **禁止使用原始颜色值。** 使用语义令牌（`text-body`、`bg-background`、`border-border`、`text-primary`）。十六进制字面量和 `rgb()` 调用会绕过深色模式。
3. **优先为现有原语添加变体**，而不是创建新组件。Card、Button、Alert、Tag 是最常见的目标。
4. **默认使用服务器组件。** 仅当需要状态、副作用、浏览器 API 或内联事件处理程序时，才使用 `"use client"`。
5. **所有文本都必须可翻译。** 服务器端使用来自 `next-intl/server` 的 `getTranslations`，客户端使用来自 `next-intl` 的 `useTranslations`。每个命名空间使用一个绑定到该命名空间的 `t`——如需访问另一个命名空间，请绑定第二个函数（例如 `const tCommon = useTranslations("common")`）。旧版 `@/hooks/useTranslation` 包装器已弃用，不应在新代码中使用。绝不要硬编码面向用户的英文。**在 `app/[locale]/` 页面或 `generateMetadata` 中，必须先调用 `setRequestLocale(locale)`，然后再调用任何 next-intl API**，否则按需渲染会抛出 `static to dynamic ... reason: headers`——参见 `references/i18n-rtl.md`。
6. **为文本方向使用逻辑 CSS。** 使用 `ms-`/`me-`/`ps-`/`pe-`/`inset-s-`/`inset-e-`/`border-s`/`border-e`/`text-start`/`text-end`。网站支持阿拉伯语和乌尔都语（RTL）。硬编码的 `left-`/`right-`/`ml-`/`mr-`/`pl-`/`pr-` 会破坏 RTL。
7. **使用区域设置感知的格式化工具。** 使用来自 `@/lib/utils/numbers` 的 `numberFormat()` 和来自 `@/lib/utils/date` 的 `dateTimeFormat()`。绝不要直接使用 `toLocaleString` / `Intl.NumberFormat`。
8. **对方向性图标使用 `useRtlFlip()`**（指向右侧的箭头/尖括号）。或者使用来自 `@/components/Chevron` 的 `ChevronNext`/`ChevronPrev`。
9. **Markdown 内容必须通过 `MdComponents` 处理。** `<Card>` Markdown 短代码由 `@/components/MarkdownCard` 提供支持（这是对 `ui/card` 原语的轻量包装，具有适合 MDX 的 prop 形式）。对于应用代码，请直接组合来自 `@/components/ui/card` 的原语。
10. **新 UI 组件必须附带 Storybook 故事。** 不使用自动化单元测试；Storybook + Chromatic + 类型是验证层。
11. **不要添加新布局。** 有六种规范布局（`TopicLayout`、`StaticLayout`、`DocsLayout`、`TutorialLayout`、`ContentLayout`、`BaseLayout`）。新的分节内容应作为 `TopicLayout` 配置放入 `src/data/topics/<key>.ts`，而不是创建新的布局组件。参见 `references/layouts.md`。

## 最值得关注的易踩坑点（请立即阅读）

这些地方很容易踩坑：代码看起来合理，但使用模式却是错误的。完整列表位于 `references/gotchas.md`；以下是最常遇到的问题。

### 看起来正确、实际却不对的导入方式

- **卡片**：对于应用代码，`import { Card } from "@/components/ui/card"` 是标准写法。`<Card>` Markdown 短代码由 `@/components/MarkdownCard` 提供支持——应用代码很少导入这个包装器，因为直接组合 `ui/card` 的各个部分更加灵活。
- **工具提示**：使用 `import Tooltip from "@/components/Tooltip"`（适配移动端、支持 Matomo 跟踪、滚动时关闭）。**不要**使用 `import { Tooltip } from "@/components/ui/tooltip"`（这是内部使用的基础 Radix 原语）。
- **模态框**：对于典型的模态框需求，使用 `import Modal from "@/components/ui/dialog-modal"`（默认导出，属于高层便捷组件）。`@/components/ui/dialog` 是原生的 shadcn 风格原语，用于对 Radix 进行细粒度控制。两个文件导出了相同的名称；**不要在同一个功能中混用不同来源**。
- **主视觉区**：从 `@/components/Hero` 导入（`PageHero`、`HubHero`、`HomeHero`）。`PageHero` 是标准的主力组件，涵盖图片、作为侧栏的组件（`heroComponent`）、纯文本以及文章样式的主视觉区（`variant="no-divider"`，无侧栏）。`title` 始终是 `<h1>`（没有 `header` 属性）；可选的 `eyebrow` 位于其上方。旧的 `MdxHero` 已被移除——对于它过去提供的面包屑 + h1 文章布局，请改用纯文本的 `PageHero`。

### 无法解析的过时 shadcn 令牌名称

`bg-popover`、`text-popover-foreground`、`bg-accent`、`text-accent-foreground`、`bg-muted`、`text-muted-foreground`、`focus:ring-ring`、`ring-offset-background` 出现在 `ui/select.tsx`、`ui/dialog.tsx`、`ui/dropdown-menu.tsx`、`ui/tabs.tsx` 中，但这些令牌在本项目中**并未定义**。它们会导致错误的渲染结果。如果修改这些文件，请将其替换为项目的语义化令牌（`bg-background-highlight`、`text-body`、`bg-accent-a`、`text-body-medium` 等）。不要引入新的用法。

### `useColorModeValue` 是 Chakra 的遗留项

目前有 5 处使用。不要引入新的用法。请使用 Tailwind `dark:` 变体 + 语义化令牌。

### 容易忽略的组件行为

- `<Button isSecondary>` 仅对 `outline` 和 `ghost` 变体生效。在 `solid`/`link` 上不会产生任何效果，也不会发出提示。
- **`Card` 由变体驱动，而不是由 `className` 驱动。**内边距、间距、背景、圆角和文本颜色由 `variant` / `size` 变体及其设置的 CSS 变量（`--card-pad`、`--content-space`、`--banner-radius`）控制。通过 `Card`/`CardContent`/`CardHeader`/`CardFooter` 上的 `className` 调整其中任何一项，都是错误的规避方式——应改为在 `card.tsx` 中添加变体分支。参见 `references/card-walkthrough.md`。
- 当 `<CardBanner fit="contain">` 只有一个 `<Image>` 子元素时，会自动克隆该元素并将其用作模糊背景。传入两个子元素后，这种自动行为就会失效。
- `LinkBox` 要求其内部某处必须存在 `LinkOverlay`；如果没有，整张卡片可点击的模式就无法工作。
- `ui/checkbox.tsx` 中的 `commonControlClasses` 由 `Switch` 共享。修改它会同时影响两者。

### 不要使用 `Heading` 原语——请使用语义化标签

`base.css` 已使用正确的字号和 `font-black` 为 `<h1>`-`<h6>` 设置样式。直接编写 `<h1>Title</h1>` 即可。只有在确实需要时，才覆盖标题元素的字号（例如使用 `<h2 className="text-h1">` 让 `h2` 采用 `h1` 的字号），但不要重新应用字重——工具层的 `font-bold` 会悄然覆盖基础样式中的 `font-black`。使用 `<div className="text-5xl font-bold">` 重新实现标题会丢失语义和屏幕阅读器导航能力。

### 使用 `text-h1`-`text-h6` 匹配标题字号，绝不要使用原始的响应式组合

这里有六个字号工具类——`text-h1` 到 `text-h6`（`src/styles/utilities.css`）——每个标题级别对应一个。每个工具类都包含该级别的**字体大小和行高**（支持响应式，例如 `text-h2` = `text-3xl lg:text-4xl`）。`base.css` 本身会将这些工具类 `@apply` 到实际的 `<h1>`-`<h6>` 标签，因此它们是标题字号的唯一事实来源。

每当你希望非标题元素（或正在调整字号的标题）呈现某个标题级别的字号时，请使用对应的工具类——**不要**使用它展开后对应的响应式组合：

```tsx
// Wrong -- reconstructs h2 sizing by hand; drifts if the scale changes
<p className="text-3xl lg:text-4xl">Looks like an h2</p>

// Right -- one token, stays in sync with the heading scale
<p className="text-h2">Looks like an h2</p>
```

`text-h*` **仅**设置字号和行高——它不会设置 `font-black`。实际的标题会从 `base.css` 获得字重；对于其他元素，如有需要，请单独设置字重。

### 间距：使用 `.flow` + `page`/`space`/`hero` 令牌，而不是手写外边距

正文块之间的垂直节奏由需显式启用的 `.flow` 系统控制——使用 `flow` 包裹一个区域，编写语义化标签，并避免使用 `mt-*`/`mb-*`。页面/分区内边距、流式间距单位（手动使用时）以及首屏内边距都来自具名响应式令牌——`px-page`/`p-page`、`mt-space`/`gap-space`、`p-hero`——而不是 `px-4 md:px-8` 这样的组合或任意值 `p-(--var)`。应用页面遵循 `<main className="p-page"> > <MainArticle className="flow"> > <Section id>` 骨架。详细信息参见 `references/spacing-typography.md`；令牌表参见 `references/tokens.md`。

### 阴影：默认使用 Tailwind 标度，几乎绝不要添加自定义阴影

层级效果使用 **Tailwind 默认标度**——`shadow-sm`/`-md`/`-lg`/`-xl`/`-2xl`，使用 `shadow-none` 重置。根据界面表面进行选择：下拉菜单/工具提示使用 `shadow-md`，卡片/弹出框/模态框使用 `shadow-lg`，大型带边框容器/面板使用 `shadow-xl`。这里**不存在自定义多层阴影令牌集**。

项目中只有**两个**阴影，都位于 `utilities.css` 中，用于实现默认阴影无法表达的品牌色调效果：
- `shadow-primary-xl`——使用 `primary-low-contrast` 着色的 `shadow-xl`，适用于大型带边框容器或窗口式容器。
- `shadow-primary-no-blur-*`——功能性的、按间距缩放的纯色（无模糊）偏移阴影（`-1` = 4px，`-0.5` = 2px），颜色为 `primary-low-contrast`，用于生硬的悬停偏移效果。

在考虑使用任何新阴影之前：默认阴影几乎总能满足需求，而且**悬停抬升效果应使用 `hover-lift-*` 工具类**（`-xs`/`-base`/`-sm`/`-md`）或 `Card hoverLift`——而不是自行设计阴影切换效果。这些工具类通过 `motion-safe:` 限制其缩放效果，因此在 `prefers-reduced-motion` 下，仅阴影变化就能传达提示；任何新的悬停变换也应采用相同做法。如果确实需要自定义阴影，请将其编写为**原始 `box-shadow`**（类似上述两个阴影），绝不要使用任意值 `shadow-[...]`：任意阴影会通过 `--tw-shadow-color` 处理其颜色，而全局 `* { dark:shadow-body }` 规则会在深色模式下覆盖该颜色，悄然将你的颜色变成灰色。原始 `box-shadow` 工具类不受此影响。

### `ui/chart.tsx:241` 中有一处遗漏的 `toLocaleString`

不要再添加。请使用 `numberFormat()`。

## 快速“该从哪里导入？”速查表

| 我需要…… | 导入方式 |
|---|---|
| 卡片 | `import { Card, CardBanner, CardContent, CardTitle, CardParagraph } from "@/components/ui/card"` |
| 模态框/对话框（典型用法） | `import Modal from "@/components/ui/dialog-modal"`（默认导出） |
| 侧边抽屉 | `import { Sheet, ... } from "@/components/ui/sheet"` |
| 工具提示 | `import Tooltip from "@/components/Tooltip"`（不是 `@/components/ui/tooltip`） |
| 按钮 | `import { Button, ButtonLink } from "@/components/ui/buttons/Button"` |
| 锚点链接（正文中） | `import InlineLink from "@/components/ui/Link"`（默认导出） |
| 锚点链接（带箭头的 CTA） | `import { LinkWithArrow } from "@/components/ui/Link"` |
| 页面主视觉区 | `import { PageHero, HubHero } from "@/components/Hero"` |
| 行内提醒 | `import { Alert, AlertContent, AlertDescription } from "@/components/ui/alert"` |
| 页面顶部横幅 | `import { Alert } from "@/components/ui/alert"`，然后使用 `<Alert variant="banner">` |
| 大号数值展示 | `import BigNumber from "@/components/BigNumber"` |
| 布局 | `import { Stack, HStack, VStack, Flex, Center } from "@/components/ui/flex"` |
| 数字格式化 | `import { numberFormat } from "@/lib/utils/numbers"` |
| 日期格式化 | `import { dateTimeFormat } from "@/lib/utils/date"` |
| RTL 翻转辅助函数 | `import { useRtlFlip } from "@/hooks/useRtlFlip"` |

有关包含所有易混淆陷阱的完整决策树，请参阅 `references/canonical-imports.md`。

## 何时加载各个参考文档

仅在符合触发条件时加载这些文档。不要一开始就全部阅读。

- **`references/canonical-imports.md`** -- 当你即将导入组件，但不确定哪个文件是规范来源时加载（Card、Modal、Tooltip、Hero、Tabs 都有多个看似合理的导入路径）。
- **`references/components.md`** -- 当你需要完整清单时加载：每个组件的用途、变体及规范用法示例。
- **`references/tokens.md`** -- 当你需要添加新 token、定义渐变、选择 z-index，或不确定该使用哪个语义化 token 时加载。此外，在处理 `src/styles/` 时也应加载。
- **`references/spacing-typography.md`** -- 当你进行页面或区块布局、确定标题字号、选择间距节奏，或处理文本密度时加载。
- **`references/gotchas.md`** -- 当你遇到基础组件中的意外行为（自动模糊背景、slot-prop 耦合、隐藏的客户端边界等），或想了解上文行内内容未涵盖的长尾易混淆模式时加载。
- **`references/variant-vs-new.md`** -- 当你想要创建新的组件文件时加载。请先阅读此文档，以确认使用变体是否才是正确做法。
- **`references/cleanup-playbook.md`** -- 当你重构存在反模式的现有代码时加载（一次性样式、原始 `<a>`/`<button>`、十六进制颜色、硬编码英文等）。其中包含“旧模式 -> 新模式”映射。
- **`references/i18n-rtl.md`** -- 当你添加面向用户的文本、格式化数字/日期、处理方向性间距、编写翻译 key，或编写 `app/[locale]/` 页面或 `generateMetadata` 时加载（`setRequestLocale` 优先规则）。
- **`references/server-vs-client.md`** -- 当你决定是否将组件标记为 `"use client"`、组织混合静态与交互部分的页面，或跨 SSR 边界进行重构时加载。
- **`references/a11y.md`** -- 当你添加交互元素（模态框、下拉菜单、自定义点击目标）、构建表单，或处理图片和标题时加载。
- **`references/card-walkthrough.md`** -- 开始任何卡片形态的 UI 工作时加载；其中包含一个端到端的完整示例。
- **`references/callout-walkthrough.md`** -- 当你添加或修改内容中的 `Callout`（图片/表情符号 + 标题 + 描述 + CTA）时加载；其中涵盖横幅形态、并排等高、变体以及 CSS 变量钩子。
- **`references/page-hero-walkthrough.md`** -- 开始构建需要主视觉区的新页面时加载；其中包含一个端到端的完整示例。
- **`references/layouts.md`** -- 当你想要创建新布局、添加新的主题中心区块，或重构一次性的 `src/layouts/md/<Section>Layout` 文件时加载。其中包含规范清单，以及“极少需要新建布局”这一规则。
- **`references/new-component-checklist.md`** -- 在为新组件提交 PR 之前加载。合并前检查清单。

## 其他可能适用的项目 Skill

- **`data-layer`** -- 用于数据获取/数据源。需要数据的 UI 工作应与此 Skill 组合使用。

## 合并前冒烟测试

在为任何 UI 工作创建 PR 之前：

- [ ] 不使用原生 `<a>` 或 `<button>`
- [ ] 不使用硬编码颜色（`#hex`、`rgb()`、`hsla()`）；仅使用语义化 token
- [ ] 不使用 `left-`/`right-`/`ml-`/`mr-`/`pl-`/`pr-`（使用逻辑方向的等效形式）
- [ ] 所有面向用户的字符串均可翻译
- [ ] 使用 `numberFormat()`/`dateTimeFormat()` 进行格式化（不使用原生 API）
- [ ] 尽可能使用服务器组件
- [ ] 新的 UI 基础组件须包含 `.stories.tsx`
- [ ] 标题使用 `<h1>`-`<h6>`（而非 `<div className="text-5xl font-bold">`）
- [ ] 如果引入新组件，请说明为什么它不能作为现有组件的变体