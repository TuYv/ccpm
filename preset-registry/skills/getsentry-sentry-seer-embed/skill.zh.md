---
name: seer-embed
description: Add a new Seer embed widget — a rich component rendered inline in Seer's markdown output via tag syntax. Covers schema, component, registration, and backend codegen. Use when asked to "add an embed", "new seer embed", "create a seer widget", "add a markdown widget", "new seer tag", or "embed widget".
---
# 添加 Seer Embed

Seer embed 是使用 Markdoc 风格标签语法（`{% name %}{ ... }{% /name %}`）以内联方式渲染在 Seer Markdown 输出中的富交互组件。每个 embed 都包含一个 Zod schema、一个 React 组件和一个注册表条目。

## 开始之前

1. 阅读 `static/app/components/seer/markdown/embeds/schemas.ts`，了解现有 schema。
2. 阅读 `static/app/components/seer/markdown/embeds/index.ts`，了解已注册的 embed。
3. 确认该 embed 名称尚不存在。

## 步骤 1：添加 Schema

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

- **`description`**：面向 LLM 编写，LLM 会根据它决定何时生成该 embed。请具体说明适用场景。
- **`level`**：对于在文本中随内容流动的组件（时间戳、徽章），使用 `['inline']`。对于需要独占一行的组件（卡片、图表），使用 `['block']`。如果 embed 能够适应两种场景，则同时使用两者。
- **`schema`**：使用 Zod。保持扁平且简单，因为 LLM 必须生成有效的 JSON。对于具有合理默认值的可选字段，使用 `.default()`。使用 `.enum()` 限制字符串值。
- **`examples`**：这是一个由 `{label, data, level?}` 对象组成的数组。每个 `data` 都必须符合 schema。生成的 JSON 会发送给 LLM，并将这些示例作为少样本示例。在 stories 页面中，一个 embed 的所有示例会组合成一个 Markdown 块，并通过单个 `<SeerMarkdown>` 渲染：inline 示例会用段落文本包裹，block 示例会追加到末尾。使用多个示例来展示不同的 prop 组合，或展示 block 与 inline 渲染方式。当某个示例的级别与 schema 的默认级别（`level` 的第一个条目）不同时，才在该示例上设置 `level`。
- **`featureFlag`**：设置此项可通过 feature flag 控制 embed。该 flag 关闭时，后端会将其从发送给 LLM 的 schema 中过滤掉。

## 步骤 2：创建组件

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

**`defineSeerEmbed` 会为你完成以下工作：**

- 按名称查找 Zod schema
- 根据该 schema 对 `data` prop 执行 `safeParse`
- 对无效数据返回 `null`（在开发环境中记录警告）
- 设置组件的 `displayName`（注册表会使用它）

**规则：**

- `name` 参数**必须**与 `SEER_EMBED_SCHEMAS` 中的键完全匹配。
- `render` 函数将 Zod 输出类型作为第一个参数接收，props 已经过解析和验证。
- 如果 schema 的 `level` 同时包含 `'inline'` 和 `'block'`，`render` 会接收第二个参数，告知当前正在渲染哪一种。使用它进行分支判断：当 block 侧具有实际内容后，请参阅步骤 2b 中的模式。
- 保持组件简单。导入现有的 Sentry 组件（`DateTime`、`TimeSince`、`Link` 等），不要从头构建。
- 组件不会收到关于自身出现位置的上下文，它只能获取标签正文中的数据。

## 步骤 2b：当 Embed 超出单个文件的范围时进行拆分

仅包含链接的 embed 保持为单个文件。一旦 embed 开始渲染 block 预览，例如需要
获取数据、延迟加载较重的视图，或根据子类型进行分支，就应当改用目录，以便审阅者可以
一次阅读一个关注点：

```
components/monitor/
  monitor.tsx          # defineSeerEmbed only: inline link vs lazily imported block
  monitorLink.tsx      # the inline level
  monitorBlock.tsx     # default export: fetch, card chrome, dispatch
  monitorTypes/        # one file per subtype, when the embed has subtypes
    cron.tsx
    uptime.tsx
  monitor.spec.tsx     # colocated, not in resourceEmbeds.spec.tsx
```

`<name>.tsx` 入口文件只负责选择要渲染的层级，使用步骤 2 中 `render` 的第二个参数：

```tsx
const LazyMonitorBlock = lazy(() => import('./monitorBlock'));

export const Monitor = defineSeerEmbed({
  name: 'monitor',
  render(props, level) {
    if (level === 'block') {
      return <LazyLoad LazyComponent={LazyMonitorBlock} {...props} />;
    }
    return <MonitorLink {...props} />;
  },
});
```

**规则：**

- 目录中没有 `index.tsx`。入口文件应以 embed 命名（`monitor/monitor.tsx`），并在 `embeds/index.ts` 中显式导入。
- `<name>.tsx` 只包含 `defineSeerEmbed`，并像上面这样根据 `level` 进行分发。block 所需的全部内容都必须放在 `lazy(() => import('./<name>Block'))` 后面，其中 block 应为 `default` 导出（这是 `lazy()` 所要求的），这样资源的 inline mention 就不会将 block 引入 bundle。`dashboard` 和 `monitor` 都遵循这一模式。
- 当 block 根据子类型（检测器类型、widget 类型）进行分支时，每个分支都应放在以变化维度命名的同级目录中的独立文件内（使用 `monitorTypes/`，而不是 `types/`，后者看起来像 TypeScript 类型），block 中的分发器则使用单个 `switch`。添加子类型应当只需新增文件并添加一个 case，而不应再像该约定所取代的旧单体模块那样，编辑分散在长模块中的两个 switch。
- 在 block 中只推导一次共享条件，并将其作为 props 传递下去，而不是在每个变体中重新推导。正是每个子类型文件中的重复推导，使旧单体模块中的 switch 难以保持同步。
- 将 spec 与代码放在一起，命名为 `<name>.spec.tsx`，并使用 `embeds/testUtils.tsx` 中共享的 `renderEmbed` / `hrefFor` 辅助函数。`resourceEmbeds.spec.tsx` 仅用于链接级 embed，它由所有 embed 共享，因此 block embed 向其中添加用例时会频繁产生冲突。

## 第 3 步：注册组件

在 `static/app/components/seer/markdown/embeds/index.ts` 中导入组件，并将其添加到 `embeds` 数组中：

```ts
import {MyEmbed} from './components/myEmbed';
import {Timestamp} from './components/timestamp';
import {SeerEmbedRegistry} from './registry';

const embeds = [Timestamp, MyEmbed];
for (const embed of embeds) {
  SeerEmbedRegistry.register(embed.displayName, embed);
}
```

注册使用 `displayName`（由 `defineSeerEmbed` 设置）作为注册表键。

## 第 4 步：重新生成后端 Schema

运行代码生成脚本，更新后端发送给 Seer agent 的 JSON Schema 文件：

```bash
pnpm gen:embed-widgets
```

该命令会写入 `src/sentry/seer/agent/embed_widgets.generated.json`。**请提交此生成文件**，它已纳入版本控制，并未被 gitignore。

## 第 5 步：验证

1. **Lint**：对新文件运行 `pnpm run lint:js`。
2. **类型检查**：运行 `pnpm run typecheck`，确认 schema 类型能够正确传递。
3. **手动测试**：在 Seer Explorer 中触发一个会使用该 embed 的响应。或者直接进行测试：

```tsx
<SeerMarkdown raw={`{% myEmbed %}{"someField":"hello"}{% /myEmbed %}`} />
```

## 文件摘要

| 文件                                                               | 操作                                           |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `static/app/components/seer/markdown/embeds/schemas.ts`            | 添加 Zod schema 条目                            |
| `static/app/components/seer/markdown/embeds/components/<name>.tsx` | 使用 `defineSeerEmbed` 创建组件                 |
| `static/app/components/seer/markdown/embeds/components/<name>/`    | 一旦渲染为块级内容，则改用目录                   |
| `static/app/components/seer/markdown/embeds/index.ts`              | 导入并注册                                     |
| `src/sentry/seer/agent/embed_widgets.generated.json`               | 由 `pnpm gen:embed-widgets` 重新生成             |

## 可选：Feature Flag

如果该 embed 应受控于 feature flag：

1. 在 schema 条目中添加 `featureFlag: 'organizations:seer-explorer-<name>'`。
2. 在 `src/sentry/features/temporary.py` 中注册该 flag。
3. 后端 (`src/sentry/seer/agent/embed_widgets.py`) 会使用 `features.has()` 自动过滤受 flag 控制的 embed。