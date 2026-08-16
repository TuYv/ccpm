---
name: triage-frontend-issues
description: Triage new issues in the Sentry `javascript` project by archiving non-actionable noise. Use when asked to "triage issues", "triage the javascript project", "archive non-actionable issues", "triage new frontend issues", or "clean up the sentry/javascript queue". Operates only on the sentry/javascript project, only archives (never resolves), and always archives with `untilEscalating`.
allowed-tools: Read, mcp__sentry__search_issues, mcp__sentry__get_sentry_resource, mcp__sentry__update_issue
---
# 分流前端问题

归档 `sentry/javascript` 问题队列中无需处理的噪声：只能归档，始终使用 `untilEscalating`，并且必须说明原因。对于看起来可在我们的代码中采取行动的问题，或你无法确信其分类的问题，必须跳过。

## 硬性规则

这些规则优先于其他任何规则。不得放宽。

1. **项目范围。** 仅操作 `organizationSlug=sentry`、项目 slug 为 `javascript` 的项目。如果被要求分流其他项目，请停止并要求用户确认。
2. **仅归档。** 唯一允许的状态变更是 `status=ignored`。绝不解决、绝不取消解决、绝不分配、绝不删除，也绝不批量更新状态以外的字段。
3. **始终使用 `untilEscalating`。** 使用 `ignoreMode=untilEscalating`。绝不使用 `forever`、`forDuration`、`untilOccurrenceCount` 或 `untilUserCount`。如果用户要求使用其他模式，请停止并让其手动归档该问题——此技能不执行非升级触发式归档。
4. **始终包含 `reason`。** `reason` 必须是一个简短、客观的句子，并明确指出 `references/archive-criteria.md` 中的类别（例如，“第三方库噪声——echarts 内部问题；无法在我们的代码中采取行动”）。
5. **绝不处理未解决队列之外的问题。** 跳过 `status` 为 `resolved`、`ignored` 或 `reprocessing` 的任何问题。
6. **未经确认绝不归档。** 制定完整计划，向用户展示，并在调用 `update_issue` 前等待明确批准。一次批准仅适用于已展示的计划；新的批次需要重新批准。
7. **如有疑问，跳过。** 如果某个问题有可能是我们代码中的真实缺陷，请勿归档。在计划中将其标记为 `needs-human`，并附上一行说明。

## 前置条件

- 已通过 `mcp.sentry.dev` 对 Sentry MCP 进行身份验证。所需工具：`search_issues`、`get_sentry_resource`、`update_issue`。
- 如果 `update_issue` 不可用，请停止并要求用户对 Sentry MCP 服务器进行身份验证。

## 输入

`$ARGUMENTS` 是以下形式之一：

| 输入形式 | 含义 |
|-------------|---------|
| Sentry 问题 URL（`https://sentry.sentry.io/issues/JAVASCRIPT-…`） | 分流该单个问题。 |
| 问题短 ID（`JAVASCRIPT-…`） | 分流该单个问题。 |
| Sentry 问题查询（包含冒号，例如 `is:unresolved firstSeen:-24h`） | 将其用作搜索查询。 |
| 空 | 使用默认分流队列：`is:unresolved is:unassigned firstSeen:-7d`，排序方式为 `new`，上限为 `50`。 |

如果 `$ARGUMENTS` 存在歧义，请在搜索前要求用户澄清。

## 工作流程

### 1. 加载队列

对于单问题输入：
- 调用 `get_sentry_resource(url=<issue-url>)` 或 `get_sentry_resource(resourceType='issue', organizationSlug='sentry', resourceId=<shortId>)`。
- 确认项目是 javascript 前端项目。如果不是，请停止。

对于查询/默认输入：
- 调用 `search_issues(organizationSlug='sentry', projectSlugOrId='javascript', query=<query>, sort='new', limit=50)`。
- 然后为每个结果并行调用 `get_sentry_resource`，以获取问题源、子状态、受理人和堆栈帧提示（搜索响应会省略部分字段）。

如果问题符合以下任一条件，请立即跳过：

- `status` 不是 `unresolved`（已归档、已解决或正在重新处理）。
- `assignedTo` 已设置为某个人（已经有人负责该问题）。
- `assignedTo` 已设置为 `frontend`/`issues` 之外的团队，并且该问题看起来是特定于该团队的（交由负责团队进行分诊）。

### 2. 对每个问题进行分类

阅读 `references/archive-criteria.md`，了解类别分类体系、识别启发法和示例。对于每个候选问题，给出以下决策之一：

| 决策 | 含义 |
|----------|---------|
| `archive` | 符合某个已记录的类别；在原因中包含类别名称。 |
| `skip` | 可能是我们代码中的真实错误，或证据不足；不要归档。 |
| `needs-human` | 看起来像噪声，但无法明确归入某个类别，或者数量异常高；标记出来供用户审核。 |

评估时，请按以下顺序权衡这些信号：

1. **最靠前的非 Sentry SDK 堆栈帧。** 如果最靠前的应用内堆栈帧位于 `node_modules/`、`chrome-extension://`、第三方主机或 `<unknown>` 中，这是强烈的归档信号。
2. **标题模式。** 许多应归档的问题仅从标题就能识别出来（请参阅标准参考文档）。
3. **数量并非否决因素。** 如果最靠前的堆栈帧来自第三方，那么某些数量很高的问题（1 万以上事件、数千名用户）仍然值得归档。数量本身也绝不会强制要求归档。
4. **时间新近程度。** 超过 30 天且未再次发生的单事件问题通常属于噪声。
5. **客户组织分布。** 如果事件仅来自一个客户子域名（检查 `customerDomain.subdomain` 标签），则很可能是客户环境噪声。

### 3. 制定计划

向用户输出一个 Markdown 表格，严格采用以下格式：

```
## Triage plan — sentry/javascript (<N> candidates)

| # | Issue | Title | Volume | Decision | Category | Reason |
|---|-------|-------|--------|----------|----------|--------|
| 1 | [JAVASCRIPT-XXXX](url) | TypeError: ... | 12e/3u | archive | browser-api-noise | Browser clipboard permission denied; not actionable. |
| 2 | [JAVASCRIPT-YYYY](url) | <unknown> | 4945e/123u | needs-human | — | High volume, no title — please review before archiving. |
| 3 | [JAVASCRIPT-ZZZZ](url) | ZodError: ... | 360e/132u | skip | — | Schema validation failure in our code; looks actionable. |
```

然后汇总数量：`N archive / M skip / K needs-human`。最后以以下内容结尾：

```
Reply `apply` to archive the N issues marked `archive`, `apply N,M,...` to archive a subset, or `cancel` to take no action.
```

### 4. 批准后执行

当用户回复 `apply`（或 `apply <subset>`）时：

对于已批准集合中的每个问题，调用：

```
update_issue(
  organizationSlug='sentry',
  issueId=<shortId>,
  status='ignored',
  ignoreMode='untilEscalating',
  reason=<category-tagged reason from the plan>,
)
```

按顺序运行这些调用（不要并行）。如果某次调用失败，请记录失败情况，继续处理剩余问题，并在第 5 步中报告失败的 ID。

如果用户回复 `cancel` 或要求修改计划，请勿调用 `update_issue`。如果用户回复了修改内容（“将第 2 行改为 skip”），请重新制定计划并再次请求确认。

### 5. 报告

应用操作后，输出：

```
## Triage report

- Archived: N
- Skipped: M
- Needs human review: K
- Failures: F (with issue IDs)

<details><summary>Archived issues</summary>

- JAVASCRIPT-XXXX — <reason>
- ...

</details>
```

## 恢复

- 如果某一项的 `update_issue` 失败，记录该失败并继续处理其余项。最后报告失败的 ID。
- 如果用户发现错误归档，可以自行在 Sentry 中取消归档。该技能绝不会自动撤销其自身操作。
- 如果用户在流程中途要求“根据这些调整重新制定计划”，则从头重新生成计划——不要假设之前的计划仍然适用。

## 原因示例（使用这种语气）

- `第三方库噪声 — echarts tooltip；无法在我们的代码中采取行动。`
- `浏览器 API 权限噪声 — 用户代理拒绝了 Clipboard writeText。`
- `客户环境中的代理干扰 — 200 响应被视为错误（企业代理返回了 HTML 正文）。`
- `暂时性后端 5xx — /api/0/organizations/.../events-meta/ 出现 InternalServerError；后端暂时性故障。`
- `测试/合成事件 — 冒烟测试或安全探测，并非生产流量。`
- `项目错误 — Prisma/Python 错误被错误路由到前端项目。`
- `单次事件偶发问题 — 1 个事件、1 个用户，30 多天内未复现。`
- `浏览器扩展噪声 — 扩展注入的全局变量（DarkReader/WeixinJSBridge）引发 ReferenceError。`