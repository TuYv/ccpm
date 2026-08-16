---
name: seer-embed
description: Add a new Seer embed widget — a rich component rendered inline in Seer's markdown output via tag syntax. Covers schema, component, registration, and backend codegen. Use when asked to "add an embed", "new seer embed", "create a seer widget", "add a markdown widget", "new seer tag", or "embed widget".
---
# 添加 Seer 嵌入组件

Seer 嵌入组件是使用 Markdoc 风格标签语法（`{% name %}{ ... }{% /name %}`）在 Seer 的 Markdown 输出中内联渲染的富交互组件。每个嵌入组件都有一个 Zod schema、一个 React 组件和一个注册表条目。

## 开始之前

1. 阅读 `static/app/components/seer/markdown/embeds/schemas.ts`，查看现有 schema。
2. 阅读 `static/app/components/seer/markdown/embeds/index.ts`，查看已注册的嵌入组件。
3. 确认该嵌入组件名称尚不存在。

## 第 1 步：添加 Schema

在 `static/app/components/seer/markdown/embeds/schemas.ts` 中，向 `SEER_EMBED_SCHEMAS` 添加一个条目：

```ts
export const SEER_EMBED_SCHEMAS = {
  // ...existing entries

  myEmbed: {
    description:
      "One sentence describing what this embed does—this passes through directly to the LLM's system prompt.",
    level: ['inline'], // 'inline', 'block', or both
    schema: z.object({
      // Define the data shape the LLM will produce
      someField: z.string(),
      optionalField: z.number().optional(),
    }),
    examples: [{label: 'Basic', data: {someField: 'hello'}}],
    // featureFlag: 'organizations:seer-explorer-my-embed',  // optional
  },
} as const satisfies Record<string, SeerEmbedSchema>;
```

**关键决策：**

- **`description`**：面向 LLM 编写——它会据此决定何时输出该嵌入组件。请具体说明使用场景。
- **`level`**：对于需要随文本流动的小组件（时间戳、徽章），使用 `['inline']`。对于需要独占一行的小组件（卡片、图表），使用 `['block']`。如果嵌入组件能够自适应，则两者都使用。
- **`schema`**：使用 Zod。保持扁平且简单——LLM 必须生成有效的 JSON。对于具有合理默认值的可选字段，使用 `.default()`。使用 `.enum()` 约束字符串值。
- **`examples`**：由 `{label, data, level?}` 对象组成的数组。每个 `data` 都必须通过 schema 验证。这些示例会作为少样本示例包含在发送给 LLM 的生成 JSON 中。在 stories 页面中，一个嵌入组件的所有示例会被组合成一个 Markdown 块，并通过单个 `<SeerMarkdown>` 渲染——内联示例会被包裹在正文文本中，块级示例则会追加到末尾。使用多个示例来展示不同的 prop 组合或块级与内联渲染方式。仅当某个示例的层级与 schema 的默认层级（`level` 中的第一项）不同时，才在该示例上设置 `level`。
- **`featureFlag`**：设置此项可通过功能开关控制该嵌入组件。当功能开关关闭时，后端会将其从发送给 LLM 的 schema 中过滤掉。

## 第 2 步：创建组件

创建 `static/app/components/seer/markdown/embeds/components/<name>.tsx`：

```tsx
import {defineSeerEmbed} from 'sentry/components/seer/markdown/embeds/utils';

export const MyEmbed = defineSeerEmbed({
  name: 'myEmbed', // must match the key in SEER_EMBED_SCHEMAS
  render({someField, optionalField}) {
    // Props are typed from the Zod schema — already validated
    return <span>{someField}</span>;
  },
});
```

**`defineSeerEmbed` 为你完成的工作：**

- 按名称查找 Zod schema
- 使用它对 `data` prop 执行 `safeParse`
- 对于无效数据返回 `null`（在开发环境中记录警告）
- 在组件上设置 `displayName`（供注册表使用）

**规则：**

- `name` 参数**必须**与 `SEER_EMBED_SCHEMAS` 中的键完全匹配。
- `render` 函数接收 Zod 输出类型——props 已完成解析和验证。
- 保持组件简单。请导入现有的 Sentry 组件（`DateTime`、`TimeSince`、`Link` 等），而不是从头构建。
- 组件不会收到有关其出现位置的任何上下文——它只能获取标签正文中的数据。

## 第 3 步：注册组件

在 `static/app/components/seer/markdown/embeds/index.ts` 中，导入组件并将其添加到 `embeds` 数组：

```ts
import {MyEmbed} from './components/myEmbed';
import {Timestamp} from './components/timestamp';
import {SeerEmbedRegistry} from './registry';

const embeds = [Timestamp, MyEmbed];
for (const embed of embeds) {
  SeerEmbedRegistry.register(embed.displayName, embed);
}
```

注册时使用 `displayName`（由 `defineSeerEmbed` 设置）作为注册表的键。

## 第 4 步：重新生成后端 Schema

运行代码生成脚本，更新后端发送给 Seer agent 的 JSON Schema 文件：

```bash
pnpm gen:embed-widgets
```

该命令会写入 `src/sentry/seer/agent/embed_widgets.generated.json`。**请提交这个生成的文件**——它已纳入版本控制，并未被 gitignore 忽略。

## 第 5 步：验证

1. **Lint**：对新文件运行 `pnpm run lint:js`。
2. **类型**：运行 `pnpm run typecheck`，确认 schema 类型能够正确传递。
3. **手动测试**：在 Seer Explorer 中触发一个会使用该嵌入组件的响应。也可以直接测试：

```tsx
<SeerMarkdown raw={`{% myEmbed %}{"someField":"hello"}{% /myEmbed %}`} />
```

## 文件汇总

| 文件                                                               | 操作                                    |
| ------------------------------------------------------------------ | --------------------------------------- |
| `static/app/components/seer/markdown/embeds/schemas.ts`            | 添加 Zod schema 条目                    |
| `static/app/components/seer/markdown/embeds/components/<name>.tsx` | 使用 `defineSeerEmbed` 创建组件         |
| `static/app/components/seer/markdown/embeds/index.ts`              | 导入并注册                              |
| `src/sentry/seer/agent/embed_widgets.generated.json`               | 由 `pnpm gen:embed-widgets` 重新生成     |

## 可选：Feature Flag

如果该嵌入组件需要受 Feature Flag 控制：

1. 在 schema 条目中添加 `featureFlag: 'organizations:seer-explorer-<name>'`。
2. 在 `src/sentry/features/temporary.py` 中注册该 Feature Flag。
3. 后端（`src/sentry/seer/agent/embed_widgets.py`）会使用 `features.has()` 自动过滤受 Feature Flag 控制的嵌入组件。