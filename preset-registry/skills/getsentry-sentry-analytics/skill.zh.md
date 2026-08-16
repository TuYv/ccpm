---
name: analytics
description: Instrument and discover analytics events in Sentry's frontend UI. Use when adding tracking to buttons, pages, modals, or custom interactions, when defining new analytics events, when searching for existing events, when auditing analytics coverage for a feature, or when answering questions about how users interact with a feature. Trigger on "add analytics", "track event", "instrument analytics", "analytics event", "track click", "track page view", "add tracking", "what events exist for", "audit analytics", "how many people", "how many users", "are people using", "is anyone clicking", "usage of", "who is using".
---
# 分析埋点

使用既有模式向 Sentry 的前端 UI 添加分析事件。

## 回答“有多少人执行了 X？”

当用户询问某项功能的使用量、采用率或交互次数时：

1. 查找事件：先搜索 Amplitude（速度最快），如果找不到，再对代码库执行 grep 搜索。
2. 如果已连接 Amplitude MCP，则直接查询数据并报告结果。
3. 如果不存在匹配的事件，请告知用户该事件尚未被追踪——然后使用 `AskUserQuestion` 询问他们是否希望添加埋点。未经明确确认，不要继续添加埋点。

阅读 `references/amplitude-mcp.md` 以了解完整的发现和查询工作流。

## 进行任何更改之前：先搜索

**在未检查是否已有相应事件之前，绝不要创建新事件。**

1. 在 `static/app/utils/analytics/` 中搜索与该功能领域匹配的事件。
2. 使用与交互相关的关键词执行 grep 搜索（例如 `clicked`、`viewed`、`created`）。
3. 如果存在匹配的事件，请复用它——如有需要，可添加参数，而不是创建重复事件。

```bash
grep -rn "keyword" static/app/utils/analytics/ --include="*.tsx"
```

## 事件命名规则

| 规则                                         | 示例                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| 使用 `snake_case`，并以点号作为分隔符        | `feedback.list-item-selected`                                          |
| 第一段 = 功能领域                            | `dashboards2.`、`issue_details.`、`feedback.`                          |
| 中间段 = 区域/上下文（可选）                 | `dashboards2.edit.`                                                    |
| 最后一段 = 操作                              | `.clicked`、`.viewed`、`.created`、`.changed`                          |
| 与现有领域文件的前缀保持一致                 | 如果事件位于 `feedbackAnalyticsEvents.tsx` 中，则使用 `feedback.` 前缀 |

**标准操作后缀：**

| 用户操作            | 后缀                       |
| ------------------- | -------------------------- |
| 点击按钮/链接       | `.clicked` 或 `_clicked`   |
| 查看页面            | `.viewed`                  |
| 提交表单            | `.submitted` 或 `.created` |
| 更改设置            | `.changed`                 |
| 渲染/加载内容       | `.rendered` 或 `.loaded`   |
| 关闭 UI             | `.dismissed`               |
| 打开模态框/面板     | `.opened`                  |

## 选择正确的追踪模式

| 要追踪的内容                            | 模式                            | 参考文档                                         |
| --------------------------------------- | ------------------------------- | ------------------------------------------------ |
| 路由导航时的页面浏览                    | 路由分析钩子                    | `references/tracking-patterns.md` § 路由级别     |
| 按钮或链接点击                          | 按钮的 `analyticsEventKey` 属性 | `references/tracking-patterns.md` § 按钮         |
| 自定义交互（切换、拖动、选择）          | 调用 `trackAnalytics()`         | `references/tracking-patterns.md` § 手动追踪     |
| 模态框或面板的打开/关闭                 | 在处理函数中调用 `trackAnalytics()` | `references/tracking-patterns.md` § 手动追踪 |
| 事件的 UI 区域上下文                    | `AnalyticsArea` 包装器          | `references/tracking-patterns.md` § 区域上下文   |

## 何时需要定义新事件

阅读 `references/event-definitions.md` 获取分步说明。

## 常见错误与调试

在以下情况下，请阅读 `references/troubleshooting.md`：

- 事件未触发或未出现在 Amplitude 中
- 调用 `trackAnalytics` 时出现 TypeScript 错误
- 需要在本地调试分析功能
- 不确定事件是否需要 Amplitude 名称

## 关键文件

| 文件                                                              | 用途                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `static/app/utils/analytics.tsx`                                  | 主注册表——合并所有事件映射，并导出 `trackAnalytics`                      |
| `static/app/utils/analytics/{domain}AnalyticsEvents.tsx`          | 特定领域的事件类型定义和名称映射                                  |
| `static/app/utils/analytics/makeAnalyticsFunction.tsx`            | 创建带类型的 `trackAnalytics` 的工厂——不要直接调用                    |
| `static/app/utils/routeAnalytics/useRouteAnalyticsEventNames.tsx` | 用于路由级页面浏览事件名称的 Hook                                            |
| `static/app/utils/routeAnalytics/useRouteAnalyticsParams.tsx`     | 用于路由级页面浏览参数的 Hook                                             |
| `static/app/components/analyticsArea.tsx`                         | `AnalyticsArea` 组件和 `useAnalyticsArea` Hook                                 |
| `static/app/components/core/button/types.tsx`                     | 按钮分析属性（`analyticsEventKey`、`analyticsEventName`、`analyticsParams`） |

## 交互规则

此技能的用户可能技术水平有限。在每个决策点都使用 `AskUserQuestion`，而不是直接抛出计划或代码。

| 情况                                                             | 操作                                                                                                                             |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 未找到事件，且用户提出了数据问题                           | 使用 `AskUserQuestion`：“此事件尚未被跟踪。需要我添加埋点吗？”                                                   |
| 用户确认需要添加埋点                               | 直接进行实现。不要展示代码预览或分步计划——只需进行更改并总结所做的工作。 |
| 实现已完成，但仍需用户操作（例如，重新加载注册） | 在总结中明确说明剩余步骤。                                                                                  |

**绝不要**把代码块作为“计划”直接贴出来，然后再问“要我进行这些更改吗？”——要么通过 `AskUserQuestion` 提供简短的通俗英文摘要以供确认，要么在用户已经要求添加插桩时直接进行操作。

## 事件管道

每次 `trackAnalytics` 调用都会流经 `static/gsApp/utils/rawTrackAnalyticsEvent.tsx` 中的 GetSentry 覆盖层：

| 目标          | 触发时机                                    | 使用的字段    | 查询方式            |
| ------------- | ------------------------------------------- | ------------- | ------------------- |
| **Reload**    | 始终                                        | `eventKey`    | Redash              |
| **Amplitude** | 当 `eventName` 非空且组织存在时             | `eventName`   | Amplitude UI 或 MCP |
| **Pendo**     | 与 Amplitude 相同                           | `eventName`   | Pendo               |

- 将 `eventName` 设置为字符串（例如 `'Logs Trace Link Clicked'`），即可同时发送到 Reload 和 Amplitude。几乎所有事件都默认采用这种方式。
- 仅对于数量巨大、发送到 Amplitude 成本过高的事件，才将 `eventName` 设置为 `null`。这些事件仅发送到 Reload，可通过 Redash 查询。
- Reload 接受带有 `allow_no_schema: true` 的事件——无需单独执行注册步骤。
- 搜索事件时，请注意仅发送到 Reload 的事件（名称为 `null`）不会出现在 Amplitude 搜索中。如果 Amplitude 未返回结果，请改为在代码库中使用 grep 搜索。

## 不可协商的约束

1. **`trackAnalytics()` 调用必须是类型安全的。** 传递给 `trackAnalytics()` 的每个事件键都必须存在于某个 `*EventParameters` 类型中，并注册到相应领域的事件映射中。这可以确保始终传递 `organization`，并确保使用相同事件键的调用点采用一致的参数。声明式辅助工具——按钮的 `analyticsEventKey`/`analyticsParams` 属性和 `useRouteAnalyticsParams`——不受此限制，因为每个实例都是一次性的：两个标有“Save”的按钮本质上并不相同（表单不同、上下文不同），因此不存在共享调用点，集中定义类型的价值也较低。
2. **优先使用声明式辅助工具。** 适用时，请使用按钮分析属性和路由分析钩子。仅当这些辅助工具无法覆盖某类交互时，才改用 `trackAnalytics()`。
3. **所有事件都必须流经 `trackAnalytics()` 或内置辅助工具。** 绝不要直接调用 `window.analytics`、`Amplitude.track()` 或任何其他分析 SDK。
4. **组织上下文会自动处理。** 将 `organization` 传递给 `trackAnalytics`——覆盖系统会处理其余事项。
5. **优先复用，而非新建。** 定义新事件之前，始终先搜索现有事件。
6. **每次交互只触发一个事件。** 不要为同一个用户操作触发多个事件。
7. **事件参数中不得包含 PII。** 绝不要包含用户电子邮件地址、IP 地址、全名或其他个人身份信息。需要身份上下文时，请使用不透明 ID（组织 ID、用户 ID）。