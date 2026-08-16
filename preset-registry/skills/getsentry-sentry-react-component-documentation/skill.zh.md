---
name: react-component-documentation
description: Create or update component documentation in Sentry's MDX stories format. Use when asked to "document a component", "add stories", "write component docs", "create an mdx file", "add a stories.mdx", or document a design system component. Generates structured MDX with live demos, accessibility guidance, and auto-generated API docs from TypeScript types.
allowed-tools: Read, Grep, Glob, Write, Edit
---
# 组件文档（MDX Stories）

按照 `static/app/components/core/` 中的约定，为 Sentry 组件创建一个 `.mdx` 文件。

## 第 0 步：收集编辑性内容

在编写之前，先收集那些能让文档不止于机械式结构的信息。向用户询问以下问题；如果无法联系到用户，则在代码库中搜索现有用法（使用 `Grep` 在 `static/app/views/` 中搜索组件名称），以推断答案。

| 问题                                                                                    | 在文档中的呈现位置                                                                        |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **开发者应在何时使用此组件？**                                                          | 简介或 `## 何时使用` 章节                                                                 |
| **何时不应使用它——此时应改用什么？**                                                    | `> [!WARNING]` 提示框，或在 `## 另请参阅` 中提供指导                                      |
| **每种变体/优先级在语义上分别表示什么？**                                               | 各变体章节中的说明（例如，“`danger` = 具有破坏性且不可逆”）                               |
| **开发者通常会犯哪些错误？**                                                            | `> [!WARNING]` 提示框、仅图标场景的无障碍说明、必填 prop 提醒                             |
| **此组件是否需要特定的父组件、同级组件或 provider 才能正常工作？**                       | 在简介中说明，或使用 `> [!NOTE]` 提示框                                                   |
| **是否有用途重叠的相关组件？**                                                          | `## 另请参阅`，并用一行文字说明何时应优先选择各组件                                       |
| **哪些 props 和变体值得通过演示进行说明？**                                             | 请参阅下方的 prop 分级                                                                    |

并非每个组件都需要回答所有问题。不适用的问题可以跳过。目标是避免编写只说明 API _如何_ 使用的文档，而应告诉开发者应在 _何时以及为何_ 使用它。

### Prop 分级

并非每个 prop 都需要单独的演示章节。询问用户：**“我应该记录哪些 props？是否有任何变体或值具有特定的预期用途？”**

如果无法联系到用户，请阅读组件的 TypeScript props，并按以下方式对每个 prop 进行分类：

| 级别                                                                | 记录方式                                                                  | 示例                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| **核心**——定义组件的主要行为或外观                                  | 使用完整的 `##` 章节，提供实时演示，并说明每个值的语义                    | `priority`、`variant`、`size`               |
| **修饰项**——调整某一方面；值的含义不言自明                           | 通过演示简要提及，或与其他修饰项合并为一个演示                            | `disabled`、`busy`、`icon`、`showIcon`      |
| **结构项**——控制布局或组合方式                                      | 通过演示展示使用前后效果或复合用法                                        | `system`、`expand`、`trailingItems`         |
| **内部 / 透传项**——不面向用户                                       | 完全跳过                                                                  | `className`、`style`、`ref`、`data-test-id` |

特别是对于**枚举属性**，始终要问：“每个值是否都有不同的预期含义，还是它们仅仅在视觉上有所不同？”如果含义不同（例如，`danger` 表示破坏性操作，而不只是红色），请记录其语义，而不仅仅是视觉差异。

## 第 1 步：定位组件

查找组件源文件：

```
static/app/components/core/<category>/<component>/index.tsx
static/app/components/core/<category>/<component>/<component>.tsx
```

阅读组件文件以了解：

- 属性及其类型
- 导出的具名变体和子组件（例如，`Component.SubComponent`、`export {TabList, TabPanels}`）
- 枚举/联合类型属性的可用值
- 属性的默认值

MDX 文件应放在组件旁边：`<component-dir>/<component>.mdx`。

如果该文件已经存在，请先阅读并更新，而不是覆盖。

**确定导入路径：**

- `static/app/components/core/` 中的组件以 `@sentry/scraps/<name>` 发布
- 所有其他组件都使用 Sentry 内部路径：`sentry/components/<path>`

要确认准确的 `@sentry/scraps` 包名称和 type-loader 路径，请查看组件目录中的现有导入或相邻的 `.mdx` 文件——根据包结构，type-loader 路径可能是 `@sentry/scraps/<name>`，也可能是 `@sentry/scraps/<name>/<name>`。

## 第 2 步：确定 Frontmatter

```yaml
---
title: <ComponentName>
description: <One sentence describing what it is and its primary purpose.>
category: <category> # See category table below; omit for principle docs
source: '@sentry/scraps/<component>' # or 'sentry/<path>' for product components
resources:
  figma: <figma-url> # Include if known
  js: https://github.com/getsentry/sentry/blob/master/static/app/components/core/<path>
  a11y: # Include for interactive components
    WCAG 1.4.3: https://www.w3.org/TR/WCAG22/#contrast-minimum
    WAI-ARIA <Pattern> Practices: https://www.w3.org/WAI/ARIA/apg/patterns/<pattern>/
---
```

**类别值：**

| 类别         | 组件                                           |
| ------------ | ---------------------------------------------- |
| `buttons`    | Button、ButtonBar、LinkButton                  |
| `forms`      | Input、Select、Checkbox、Radio、Slider、Switch |
| `navigation` | Tabs、SegmentedControl、Disclosure             |
| `status`     | Alert、Badge、Tag、Toast                       |
| `layout`     | Flex、Grid、Stack、Container、Surface          |
| `typography` | Text、Heading、Prose                           |
| `patterns`   | 设计模式、原则                                 |

对于原则/模式文档（没有交互式组件），请使用 `layout: document` 代替 `category`，并将资源下的 `a11y:` 替换为 `reference:`。

## 第 3 步：编写导入

严格遵循以下导入顺序：

```jsx
// 1. External packages (react, etc.) — only if needed for examples
import {useState} from 'react';
// 5. Type-loader for auto-generated API docs (@sentry/scraps components only)
import documentation from '!!type-loader!@sentry/scraps/<component>';

// 3. @sentry/scraps component(s)
import {ComponentName} from '@sentry/scraps/<component>';

// 2. Sentry internals used in examples (icons, utils)
import {IconAdd, IconEdit} from 'sentry/icons';
// 4. Stories namespace (always last before type-loader)
import * as Storybook from 'sentry/stories';

export {documentation};
```

省略所有不需要的组。对于产品组件（不在 `@sentry/scraps` 中），省略 type-loader 行，并在表格中手动记录 props（参见步骤 5）。

**复杂导出：** 如果需要筛选组件导出内容（例如隐藏内部导出），请使用显式形式，而不是 `export {documentation}`：

```jsx
import RawDocumentation from '!!type-loader!@sentry/scraps/<component>';

export const documentation = {
  exports: RawDocumentation.exports,
  props: {
    ...RawDocumentation?.props,
    // Remove internal props if needed
  },
};
```

## 步骤 4：编写内容

### 章节结构

按**功能或面向用户的变体**组织内容，而不是按 prop 名称组织：

1. **简介** — 1-2 句话，然后是一个最小用法代码块（不使用演示包装器）
2. **何时使用** _（如果组件存在有实际意义的替代方案或误用风险）_ — 文字指导，可选择使用用于展示应该/不应该做法的 `<Storybook.SideBySide>`
3. **功能章节** — 每项主要功能使用一个 `##`：`## Sizes`、`## Priorities`、`## States`、`## Composition`
4. **无障碍** — WCAG 声明和开发者责任
5. **另请参阅** — 指向相关组件的链接，并附带一行指导说明（可选）

标题应优先使用 `## Sizes`、`## Variants`、`## States`，而不是 `## The size prop`。

**何时使用 / 另请参阅模式：**

```mdx
## When to use

Use `<Alert>` for inline feedback within a page. For application-level banners that span the full viewport, use the `system` prop or reach for `<Toast>` if the message is transient.

> [!WARNING]
> Do not use `<Alert variant="danger">` for confirmation dialogs. Use a modal instead.
```

```mdx
## See Also

- [LinkButton](/stories/core/linkbutton/) — use when the action navigates to a new URL
- [Link](/stories/core/link/) — use for inline text navigation, not standalone CTAs
```

### 简介模式

````mdx
To create a basic <component>, wrap content in `<ComponentName>`.

```jsx
<ComponentName prop="value">Content</ComponentName>
```
````

````

### 子组件

当组件公开子组件时，应尽早展示完整的复合用法：

```mdx
`<Tabs>` is a compound component. Use `<TabList>` and `<TabPanels>` together:

```jsx
<Tabs>
  <TabList>
    <TabList.Item key="tab1">Tab 1</TabList.Item>
  </TabList>
  <TabPanels>
    <TabPanels.Item key="tab1">Content 1</TabPanels.Item>
  </TabPanels>
</Tabs>
````

````

### 演示模式

每个功能章节都必须包含一个 `<Storybook.Demo>`，并在其后**紧接着**放置对应的代码块：

```mdx
## Sizes

<brief description>

<Storybook.Demo>
  <Component size="sm">Small</Component>
  <Component size="md">Medium</Component>
  <Component size="lg">Large</Component>
</Storybook.Demo>
```jsx
<Component size="sm">Small</Component>
<Component size="md">Medium</Component>
<Component size="lg">Large</Component>
````

````

**演示布局辅助组件：**

| 组件 | 使用场景 |
|-----------|----------|
| `<Storybook.Demo>` | 默认选择；横向排列示例 |
| `<Storybook.Grid>` | 用于展示许多变体的网格布局 |
| `<Storybook.SideBySide>` | 双栏对比（应该做/不应该做） |
| `<Storybook.TokenReference>` | 展示设计 token（间距、颜色等） |
| `<Storybook.ColorReference>` | 专门用于展示颜色 token |

### 无障碍章节

```mdx
## Accessibility

This component meets [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) standards:

- **Color contrast**: Meets 4.5:1 ratio (WCAG 1.4.3)
- **Keyboard navigation**: <what interactions are supported>
- **Screen reader support**: <ARIA role and labeling behavior>

### Developer responsibilities

- Always provide <required accessible prop> (e.g., `aria-label` or visible label text)
- <other requirement>
````

### 标注语法

```mdx
> [!TIP]
> Use the `<prop>` prop when you need <use case>.

> [!WARNING]
> Avoid <pattern> because <reason>.

> [!NOTE]
>
> <Additional context.>
```

## 第 5 步：属性表（仅限产品组件）

对于不在 `@sentry/scraps` 中的组件，请手动列出属性，而不是使用 type-loader：

```mdx
## Props

| Prop      | Type                              | Default  | Description               |
| --------- | --------------------------------- | -------- | ------------------------- |
| `variant` | `'info' \| 'warning' \| 'danger'` | `'info'` | Controls the visual style |
| `size`    | `'sm' \| 'md' \| 'lg'`            | `'md'`   | Controls the size         |
```

## 完整示例

````mdx
---
title: Alert
description: Alerts provide contextual feedback messages with different severity levels.
category: status
source: '@sentry/scraps/alert'
resources:
  js: https://github.com/getsentry/sentry/blob/master/static/app/components/core/alert/index.tsx
  a11y:
    WCAG 1.4.3: https://www.w3.org/TR/WCAG22/#contrast-minimum
    WCAG 2.1.1: https://www.w3.org/TR/WCAG22/#keyboard
    WAI-ARIA Alert Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
---

import {Alert} from '@sentry/scraps/alert';

import * as Storybook from 'sentry/stories';

import documentation from '!!type-loader!@sentry/scraps/alert';

export {documentation};

To create a basic alert, wrap a message in `<Alert>` and specify the appropriate type.

```jsx
<Alert variant="info">This is an informational message</Alert>
```
````

## 类型

警报分为五种类型：`muted`、`info`、`warning`、`success` 和 `danger`。

<Storybook.Demo>
<Alert.Container>
<Alert variant="muted">Muted</Alert>
<Alert variant="info">Info</Alert>
<Alert variant="warning">Warning</Alert>
<Alert variant="success">Success</Alert>
<Alert variant="danger">Danger</Alert>
</Alert.Container>
</Storybook.Demo>

```jsx
<Alert.Container>
  <Alert variant="muted">Muted</Alert>
  <Alert variant="info">Info</Alert>
  <Alert variant="warning">Warning</Alert>
  <Alert variant="success">Success</Alert>
  <Alert variant="danger">Danger</Alert>
</Alert.Container>
```

## 无障碍

此组件符合 [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) 标准：

- **颜色对比度**：所有变体均满足 4.5:1 的对比度要求（WCAG 1.4.3）
- **键盘无障碍**：可完全通过键盘操作（WCAG 2.1.1）

```

```

## 检查清单

完成前，请确认：

- [ ] MDX 文件与组件源文件位于同一目录（命名为 `<component>.mdx`）
- [ ] Frontmatter 包含 `title`、`description` 和 `source`
- [ ] 导入遵循正确顺序（外部依赖 → 图标/工具 → @sentry/scraps → Storybook → type-loader）
- [ ] `@sentry/scraps` 组件包含 type-loader 导入
- [ ] 每个 `<Storybook.Demo>` 后面都紧跟与之匹配的代码块
- [ ] 各章节按功能/变体组织，而不是按属性名称组织
- [ ] 使用复合用法示例记录子组件
- [ ] 无障碍章节涵盖 WCAG 合规性和开发者责任
- [ ] 不使用原始 `<img>` 标签（使用 `<Image>`），不使用内联 SVG，不使用 styled components