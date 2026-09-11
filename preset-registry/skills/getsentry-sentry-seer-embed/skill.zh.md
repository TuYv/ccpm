---
name: seer-embed
description: Add a new Seer embed widget — a rich component rendered inline in Seer's markdown output via tag syntax. Covers schema, component, registration, and backend codegen. Use when asked to "add an embed", "new seer embed", "create a seer widget", "add a markdown widget", "new seer tag", or "embed widget".
---
# 添加一个 Seer Embed

Seer embed 是使用 Markdoc 风格标签语法（`{% name %}{ ... }{% /name %}`）在 Seer 的 markdown 输出中内联渲染的富文本组件。每个 embed 都有一个 Zod schema、一个 React 组件和一条注册入口。

## 开始之前

1. 阅读 `static/app/components/seer/markdown/embeds/schemas.ts` 以查看现有的 schema。
2. 阅读 `static/app/components/seer/markdown/embeds/index.ts` 以查看已注册的 embed。
3. 确认该 embed 名称尚未存在。

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

- **`description`**：为 LLM 编写——它会用这个来决定何时发出 embed。请明确说明具体使用场景。
- **`level`**：对在文本中流动的组件（例如时间戳、徽章）使用 `['inline']`。对需要独占一行显示的组件（例如卡片、图表）使用 `['block']`。若组件可自适应两者，请同时使用两者。
- **`schema`**：使用 Zod。保持扁平且简单——LLM 必须生成合法的 JSON。对可选字段使用 `.default()` 提供合理默认值。使用 `.enum()` 来约束字符串取值。
- **`examples`**：是由 `{label, data, level?}` 组成的数组。每个 `data` 都必须通过 schema 校验。`label` 和 `data` 会作为 few-shot 示例进入生成的 JSON 供 LLM 使用；`level` 不会——codegen 会移除它，因此它只影响 stories 页面。用多个示例来展示不同的属性组合，而不是用于区分 inline 与 block：在 stories 页面，每个示例都在独立 demo 中渲染，并且每个 demo 都会以 schema 声明的所有级别进行展示（inline 时会包裹在 prose 中，block 时单独成行）。只有当示例的级别与 schema 的默认级别（`level` 的第一个条目）不同时才设置示例级别——共享的 `<EmbedStory>` 回退逻辑会把 `level` 当作重命名该示例为 embed 名称的信号，并丢弃任何后续 `data` 相同的示例，因此多余的 `level` 会使多个示例被合并为同名示例。请确保每个示例的 `data` 都不同。
- **`featureFlag`**：通过 feature flag 控制是否展示该 embed。后端会在 flag 关闭时，从发送给 LLM 的 schema 中过滤掉它。

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

**`defineSeerEmbed` 为你做了什么：**

- 按名称查找 Zod schema
- 用它对 `data` 属性执行 `safeParse`
- 对无效数据返回 `null`（开发环境中记录警告）
- 为组件设置 `displayName`（注册表会使用它）

**规则：**

- `name` 参数必须与 `SEER_EMBED_SCHEMAS` 中的键名完全匹配。
- `render` 函数将 Zod 输出类型作为第一个参数接收——props 已经过解析和校验。
- 如果 schema 的 `level` 同时包含 `'inline'` 和 `'block'`，`render` 会收到第二个参数来告知当前渲染的是哪个级别。按需分支：当 block 侧具备真实内容后，参见 Step 2b 的模式。
- 保持组件简单。导入现有的 Sentry 组件（`DateTime`、`TimeSince`、`Link` 等），而不是从头构建。
- 组件不会收到其出现位置的上下文——只会接收到 tag body 中的数据。

## Step 2b: Embed 增长到单文件之外后再拆分

仅链接类 embed 保持为单文件。一旦 embed 渲染块级预览——
它会拉取数据、懒加载重型视图，或按子类型分支——就为其使用一个目录，以便 reviewer 一次只读取一个关注点：

```
components/monitor/
  monitor.tsx          # defineSeerEmbed only: inline link vs lazily imported block
  monitorLink.tsx      # the inline level
  monitorBlock.tsx     # default export: fetch, card chrome, dispatch
  monitorTypes/        # one file per subtype, when the embed has subtypes
    cron.tsx
    uptime.tsx
  monitor.spec.tsx     # colocated, not in a spec shared by every embed
```

`<name>.tsx` 入口不做其他事，只根据 Step 2 的 `render` 的第二个参数选择要渲染的级别：

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

- 块级渲染永远不自行绘制卡片。`<name>Block.tsx` 返回 `<SeerEmbedBlock>` 并让它负责 chrome——见下方“Block chrome”。
- 目录下不要有 `index.tsx`。将入口按 embed 命名（例如 `monitor/monitor.tsx`），并在 `embeds/index.ts` 中显式导入。
- `<name>.tsx` 仅包含 `defineSeerEmbed`，并像上文那样按 `level` 分发。块所需的一切内容都放在 `lazy(() => import('./<name>Block'))` 后面，块使用 `default` 导出（这是 `lazy()` 所要求的），从而通过内联引用不会把块打包进主 bundle。`dashboard` 和 `monitor` 都遵循这一点。
- 当块按子类型分支（如 detector 类型、widget 类型）时，每个分支放在同级目录中的一个文件，目录名称按变化的维度命名（如 `monitorTypes/`，而不是 `types/`，后者看起来像 TypeScript types），并且分发逻辑使用块中的单一 `switch`。新增子类型应只需新增一个文件并加一个 `case`，而不是像旧版单体模块那样修改两个分散在不同位置的 `switch`。
- 在块内一次性派生共享条件并将其作为 props 向下传递，而不是在每个变体里重复派生——旧单体中每个子类型文件都重新派生条件，导致分支难以同步。
- 将 spec 与 `<name>.spec.tsx` 并置，并使用 `embeds/components/resourceEmbedTestUtils.tsx` 中的共享 `renderEmbed` /
  `getEmbedLinkHref` 助手函数。不要把 case 添加到每个 embed 共享的一个 spec 文件中——当块级 embed 开始向其中添加 case 时，共享文件会持续产生冲突。

## 第2c步：块 Chrome

块级 embed 在 `SeerEmbedBlock`（`embeds/components/seerEmbedBlock.tsx`）内渲染，它负责绘制每个块共用的卡片：标题栏左侧的资源名称和折叠切换开关、右侧的 `View <resource>` 链接，以及下方可折叠面板中的 embed 预览。

```tsx
export default function MonitorBlock({id, name}: EmbedOutput<'monitor'>) {
  const organization = useOrganization();

  return (
    <SeerEmbedBlock
      badge={<Tag variant="muted">{t('Cron')}</Tag>}
      href={makeMonitorDetailsPathname(organization.slug, id)}
      icon={IconTimer}
      linkLabel={t('View Monitor')}
      testId="seer-monitor-embed"
      title={name ?? t('Monitor %s', id)}
    >
      {/* the preview */}
    </SeerEmbedBlock>
  );
}
```

**规则：**

- `title` 是资源自身的名称；`linkLabel` 是固定的行动号召，命名目标（`View Dashboard`、`View Query`）。名称作为折叠切换的标签，且刻意**不是**链接——点击标题不应跳出对话。
- 查询 embed 通过 `QueryEmbedCard` 实现，它是在 `SeerEmbedBlock` 上再加一行格式化查询；它使用相同的 `title`/`href`/`icon`/`linkLabel` 属性。
- 不要把一个块包在你自己的带边框 `Container` 中。如果共享卡片无法表达所需 chrome，应为 `SeerEmbedBlock` 添加一个插槽，而不是再加一个卡片。
- `badge` 位于标题和链接之间，用于描述内容的标签（查询模式、启用/禁用状态、小部件数量）。
- 块与内联链接不能各自重复派生同一个 `href` 或 `title`。从 `<name>Link.tsx` 导出 `get<X>Href` / `get<X>Title` 辅助函数，并在两处调用。
- `defaultExpanded={false}` 会以折叠状态渲染块，以便处理较高或加载较慢的预览。

## 第3步：注册组件

在 `static/app/components/seer/markdown/embeds/index.ts` 中导入并添加到 `embeds` 数组：

```ts
import {MyEmbed} from './components/myEmbed';
import {Timestamp} from './components/timestamp';
import {SeerEmbedRegistry} from './registry';

const embeds = [Timestamp, MyEmbed];
for (const embed of embeds) {
  SeerEmbedRegistry.register(embed.displayName, embed);
}
```

注册使用 `displayName`（由 `defineSeerEmbed` 设置）作为注册表 key。

## 第4步：重新生成后端 Schema

运行 codegen 脚本以更新后端发送给 Seer agent 的 JSON Schema 文件：

```bash
pnpm gen:embed-widgets
```

这会写入 `src/sentry/seer/agent/embed_widgets.generated.json`。请提交该生成文件——它是已签入的文件，不在 gitignore 中。

## 第5步：将 Embed 添加到 Stories 页面

每个 embed 在 `static/app/components/seer/markdown/seerMarkdown.mdx` 中都有一个区段，顺序与 schema 保持一致：

```mdx
### myEmbed

<EmbedStory name="myEmbed" />
```

`<EmbedStory name>` 会渲染该 schema 自身的 `examples`。这在**仅从标签体渲染**的 embed 上就足够——比如 timestamp、badge、基于 props 构建的链接。

**按 ID 拉取资源的 embed 需要改为独立的 story。** `examples` 中的 `ID` 是为 LLM 提示语生成的虚构值，因此不会被解析：该块会渲染错误状态，`stories` 页面也不会展示任何内容。编写 `__stories__/<name>EmbedStory.tsx`，为当前查看者所属组织查询一个真实资源，并将其 `ID` 传给 `EmbedVariant`：

```tsx
export function MyEmbedStory() {
  const {data, isError, isPending} = useQuery(/* a list endpoint, limit 1 */);
  const resource = data?.[0];

  return (
    <EmbedStory name="myEmbed">
      {isPending ? (
        <LoadingIndicator />
      ) : isError ? (
        <Text variant="muted">Unable to load a my-embed example.</Text>
      ) : resource ? (
        <EmbedVariant name="myEmbed" label="My embed" data={{id: resource.id}} />
      ) : (
        <Text variant="muted">No my-embed is available for this organization.</Text>
      )}
    </EmbedStory>
  );
}
```

然后在 `.mdx` 中导入它，并将 `<EmbedStory name="myEmbed" />` 替换为 `<MyEmbedStory />`。`replayEmbedStory.tsx` 和 `savedQueryEmbedStory.tsx` 是最小化示例；`alertEmbedStory.tsx` 展示了如何把一次查询链式接到下一次。

**规则：**

- 一个 `EmbedVariant` 会渲染模式声明的**每一个** `level` —— `formatVariant` 会遍历 `schema.level` —— 因此通过 prop 组合变化变体，而不是按 level 分开变体。
- 始终渲染全部四种状态（pending、error、empty、loaded）。Story 会在查看者当前所在组织下运行，没有重放数据或没有保存查询的组织也不应渲染出损坏页面。
- 当 story 有非显式选择逻辑时（例如按条件选择第一个满足条件的资源、查询链式调用），应与其共置 `<name>EmbedStory.spec.tsx`。为 `SeerMarkdown` 打桩，使其回显 `raw` prop，并断言 story 选择的数据，而不是断言 embed 自身的渲染结果；该 embed 的渲染行为已由其共置 spec 覆盖。

## 第 6 步：验证

1. **Lint**：对新增文件运行 `pnpm run lint:js`。
2. **Types**：运行 `pnpm run typecheck` 以确认 schema 类型已正确流转。
3. **手动测试**：在 Seer Explorer 触发一次会使用该 embed 的响应。或者直接测试：

```tsx
<SeerMarkdown raw={`{% myEmbed %}{"someField":"hello"}{% /myEmbed %}`} />
```

## 文件清单

| 文件                                                                       | 要做的内容                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| `static/app/components/seer/markdown/embeds/schemas.ts`                    | 添加 Zod schema 条目                            |
| `static/app/components/seer/markdown/embeds/components/<name>.tsx`         | 使用 `defineSeerEmbed` 创建组件                  |
| `static/app/components/seer/markdown/embeds/components/<name>/`            | 一旦它渲染为一个 block，请改用目录结构         |
| `static/app/components/seer/markdown/embeds/components/seerEmbedBlock.tsx` | 所有 block 渲染所使用的卡片外壳                |
| `static/app/components/seer/markdown/embeds/index.ts`                      | 导入并注册                                      |
| `static/app/components/seer/markdown/seerMarkdown.mdx`                     | 为该 embed 新增一个章节                         |
| `static/app/components/seer/markdown/__stories__/<name>EmbedStory.tsx`     | 如果该 embed 按 ID 拉取数据，请新增此文件         |
| `src/sentry/seer/agent/embed_widgets.generated.json`                       | 通过 `pnpm gen:embed-widgets` 重新生成           |

## 可选：功能开关

如果嵌入内容应受功能开关控制：

1. 将 `featureFlag: 'organizations:seer-explorer-<name>'` 添加到架构条目中。
2. 在 `src/sentry/features/temporary.py` 中注册该开关。
3. 后端（`src/sentry/seer/agent/embed_widgets.py`）会使用 `features.has()` 自动过滤受功能开关控制的嵌入内容。