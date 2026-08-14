---
name: n8n-error-handling
description: Wire n8n error handling so failures are loud, structured, and recoverable. Use when building any webhook/API workflow, a scheduled or unattended workflow, or any path where a silent failure would drop user-visible work — and whenever the user mentions error handling, onError, continueErrorOutput, error branches/outputs, retries, retryOnFail, Respond to Webhook status codes, 4xx/5xx, Error Trigger, or "my workflow fails silently". Covers per-node error outputs and wiring, retry/self-healing, error-trigger workflows, and 4xx/5xx response shapes.
---
# n8n 错误处理

默认情况下，当 n8n 节点抛出错误时，**整个工作流都会停止**。对于你正在观察的交互式运行，这没什么问题——你会看到标红的节点并修复它。但对于任何无人值守的场景（Webhook API、定时任务、队列工作进程、智能体工具），这并不是合适的默认行为：调用方会收到超时或空的 500 响应，运维人员收不到任何警报，而呈现出的症状只是“集成突然停止工作”，既没有日志，也没有线索。

本技能旨在让故障变得**明显、结构化且可恢复**——而在最佳情况下，还能实现**自愈**，使暂时性故障根本无需人工介入。

以下两个理念能够避免大多数静默故障：

- **逐节点错误输出**——节点发生故障时，会沿着你控制的第二个输出进行路由，而不是终止运行。
- **工作流级错误工作流**——一个兜底机制，用于捕获所有未被逐节点错误处理拦截的问题（超时、节点之间的崩溃、未接线的故障）。

---

## 什么时候确实需要这样做

| 工作流形态 | 错误处理策略 |
|---|---|
| Webhook / API（任何包含 `Respond to Webhook` 的工作流） | **必需。** 为每个可能失败的节点连接错误输出；状态码应与错误原因相匹配。 |
| 定时任务 / cron / 队列工作进程 / 智能体工具（无人值守） | **必需。** 配置工作流级错误工作流，并在网络节点上启用 `retryOnFail`。 |
| 由你亲自运行并观察的一次性内部任务 | **可选。** 使用默认的 `onError: "stopWorkflow"` 即可——你会看到标红的节点并重新运行。 |

判断标准是：**只要除你之外还有其他人或系统会看到输出**——无论是下游系统、最终用户还是值班工程师——就必须处理故障，而不能将其悄悄吞掉。如果只有你自己在观察，并且失败的代价只是“我注意到后重新运行”，那么可以采用更宽松的处理方式。

---

## 头号静默陷阱：逐节点错误输出需要分两步设置

这是 n8n 工作流看似“处理”了错误、实际上却将其吞掉的最常见原因。要将节点故障路由到处理器，需要进行**两项**更改；只做其中一项，看起来似乎已经完成，实际运行时却会出现错误行为：

1. 在节点上**设置 `onError: "continueErrorOutput"`**。这一步会*创建*第二个输出。如果没有它，无论如何接线，`main[1]` 都不存在。
2. **将该错误输出连接**（`connections.<node>.main[1]`，即 `sourceIndex: 1`）到真正的处理器。如果没有目标，错误数据就会被输出到虚空中。

只完成其中一项，就会遇到以下故障模式：

| 你所做的操作 | 运行时会发生什么 |
|---|---|
| 设置了 `onError`，但**没有**连接错误输出 | 错误数据会被静默丢弃。下游不会触发。控制面板会将本次运行显示为**成功**。最糟糕的情况是——任何地方都没有错误日志。 |
| 连接了错误输出，但**没有**设置 `onError` | 该输出槽永远不会触发；处理器不可达。发生故障时，工作流只会直接**停止**（默认为 `stopWorkflow`）。 |
| 两项都完成 | 故障会沿 `main[1]` 路由到你的处理器。✅ |

### 使用 `n8n_update_partial_workflow` 完成这两项操作

```javascript
// 1) Turn on the error output (creates main[1])
{ type: "updateNode", nodeName: "HTTP Request",
  changes: { onError: "continueErrorOutput" } }

// 2) Wire the error output to a handler. sourceIndex: 1 = the error output.
{ type: "addConnection",
  source: "HTTP Request",
  target: "Handle Error",
  sourceIndex: 1 }
```

`sourceIndex: 0` 是成功路径，`sourceIndex: 1` 是错误路径。（对于 IF 节点，别名 `branch: "true"`/`"false"` 分别映射到索引 0/1；对于通用的可能失败节点，请显式使用 `sourceIndex: 1`。）

**然后进行验证。** `validate_workflow` 无法发现这个陷阱——错误输出仅连接一半也能顺利通过验证。使用 `n8n_get_workflow` 拉取工作流，并确认以下**两个**部分：

- 节点的 `onError` 为 `"continueErrorOutput"`。
- `connections["HTTP Request"].main[1]` 包含你的处理节点。

有效的 `onError` 值：

| 值 | 效果 |
|---|---|
| `"stopWorkflow"`（默认） | 错误会中止整个工作流。 |
| `"continueRegularOutput"` | 错误项从**正常**输出流出。很少使用，通常是错误的选择——下游会收到错误形态的数据并继续运行。 |
| `"continueErrorOutput"` | 错误项从**单独的**错误输出（`main[1]`）流出。你需要连接的就是这个输出。 |

完整的故障模式目录、扇入/扇出结构及验证方法：**NODE_ERROR_OUTPUTS.md**。

---

## 自愈优先：先设置 `retryOnFail`，再连接错误路径

在构建错误分支之前，先消化瞬时故障，避免它们进入这些分支。对于**任何调用网络服务的节点**——HTTP Request、通信服务（Gmail/Slack/Discord）、数据库、AI 节点、第三方集成——请设置节点级重试：

```javascript
{ type: "updateNode", nodeName: "HTTP Request",
  changes: {
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 5000   // ms
  } }
```

之所以要**优先**这样做：遇到 429 或短暂的上游故障时，系统会重试，并且通常能够自行成功。这样，错误输出只会在发生*真正且持续存在*的故障时触发——因此，你的 5xx 响应和随叫随到告警反映的是实际问题，而不是噪声。

需要了解的引擎限制：重试会在发生**任何**错误时触发（无法按状态码筛选），`maxTries` 上限为 5，`waitBetweenTries` 上限为 5000ms——因此，5000 既是最大值，也是合理的默认值。有关节点特定的注意事项，请参阅 **n8n-node-configuration**（NODE_FAMILY_GOTCHAS.md）。

---

## API 工作流：规范结构

由 Webhook 触发并向调用方返回响应的工作流，有一条凌驾于其他所有规则之上的原则：**不能有悬空分支**。每条路径——成功路径和所有错误路径——都必须终止于一个 `Respond to Webhook`，否则调用方会一直等待，直至超时。

```
Webhook (responseMode: "responseNode")
  ├── validate input → process → Respond (200, body)
  └── (any fallible node's error output → sourceIndex 1)
            → Respond (4xx/5xx, structured error body)
            → optional: log full error privately / notify
```

要实现这一点，需要做到三件事：

1. **扇入到一个错误响应节点。** 多个可能失败的节点可以将其 `main[1]` 路由到同一个 `Respond` 节点。这样可以保持工作流图清晰易读。
2. **验证失败（4xx）应在*上游*检查，而不是通过错误输出处理。** 缺少字段并不意味着节点发生了*崩溃*——它是一种预期结果，具有明确的响应。请使用 IF/Switch（或下文的 schema 验证器）对此进行分支，并直接返回 400/401/403/404。错误输出用于处理*非预期*故障（5xx）。
3. **`responseCode` 默认为 200——即使是在错误分支上也是如此。** 这是另一个隐蔽陷阱（请参阅 RESPONSE_SHAPES.md 和 **n8n-node-configuration** NODE_FAMILY_GOTCHAS.md）：如果错误分支返回包含错误正文的 200 响应，调用方的 HTTP 客户端会将其视为成功，因此调用方的错误处理永远不会触发。请在每个 Respond 节点上显式设置 `responseCode`。

### 输入验证：Set 节点模式验证器

对于任何执行结构化输入验证的端点，都应在单个 **Set** 节点内以 IIFE 形式运行检查，而不是针对每个字段串联一系列 IF/Switch 节点。一个节点验证整个载荷，返回 `{ valid, validationError, details, requiredSchema }`，然后由 IF 根据 `valid` 进行分支 → 进入你的逻辑（200），或进入返回 400 的 Respond，并在响应中回显模式，以便调用方自行修正。与 Code 节点中的递归验证器 + 子工作流相比，这种方式的速度也快得多。完整模式、约束规则手册以及表达式转义的注意事项都在 **API_WORKFLOWS.md** 中。

---

## 响应结构：将原因映射到状态码

返回带有 `text/plain "Internal Server Error"` 的 5xx，技术上属于错误响应，但实际上毫无用处。并且，并非每种失败都属于 5xx。**应根据请求失败的原因匹配状态码**，因为调用方会据此进行分支：他们的监控会对 5xx（你的问题）发出警报，而不会对 4xx（他们的问题）发出警报；同时，5xx 表示“重试”，而 4xx 表示“不要重试”。

**常见错误：**将所有情况——包括错误输入——都连接到同一个返回 500 `internal_error` 的 `Respond`。这样，调用方就无法区分是他们的 bug 还是你的服务中断，而你的错误率也无法将真实事故与客户端噪声区分开来。

| 原因 | 状态码 | `error` 代码 | 处理位置 |
|---|---|---|---|
| 缺少必填字段 / 类型错误 | 400 | `validation_error` | 上游检查（模式验证器 / IF），而非错误输出 |
| 缺少身份验证或身份验证无效 | 401 | `unauthorized` | 上游检查 |
| 已通过身份验证但无权访问 | 403 | `forbidden` | 上游检查 |
| 请求中的资源 ID 有效，但你的数据中不存在 | 404 | `not_found` | 根据查询*结果*进行分支，而不是根据其错误进行分支 |
| 与当前状态冲突（重复、竞态） | 409 | `conflict` | 通过逻辑检测 |
| 调用方超过速率限制 | 429 | `rate_limit_exceeded` | 设置 `Retry-After` 标头 |
| 节点抛出异常，原因未知 | 500 | `internal_error` | 错误输出路径 |
| 第三方 API 返回错误 | 502 | `upstream_error` | HTTP 节点的错误输出 |
| 当前无法处理（下游不可用） | 503 | `service_unavailable` | 检测特定错误，并提示重试 |
| 第三方 API 超时 | 504 | `upstream_timeout` | 根据消息筛选错误输出 |

因此，这里存在两种不同的流程：**4xx 在执行工作之前决定**（IF/Switch + 专用 Respond），**5xx 来自错误输出**（“我们尝试了，但失败了”）。

**一个 Respond，通过表达式驱动状态码。** 当错误路径之间仅有*状态码和消息*不同（响应体结构相同、标头相同）时，不要通过 Switch 分流到 N 个 Respond 节点。Respond 节点的 `Response Code` 和响应体都接受表达式——直接以内联方式计算状态码：

```javascript
// Response Code field on a single Respond to Webhook:
{{ (() => {
    const msg = $json.error?.message || $json.message || '';
    if (msg.includes('INVALID_ID')) return 400;
    if (/429|too many/i.test(msg)) return 429;
    if (/timeout/i.test(msg))      return 504;
    if (/upstream|llm|api/i.test(msg)) return 502;
    return 500;
})() }}
```

将 Switch + 多个 Respond 保留给在*结构上*存在分歧的路径（不同的标头、不同的正文结构、重定向）。结构相同、只有数字不同的情况，应使用一个由表达式驱动的 Respond。

默认信封格式为 `{ "error": "<code>", "message": "<human text>" }`——HTTP 状态已经表明成功或失败，因此不需要 `ok: false` 标志。**绝不要在响应中泄露内部信息**（堆栈跟踪、SQL、上游响应正文、令牌）——应私下记录这些信息，并返回经过净化的消息。关联 ID、`retry_after`、验证 `details` 以及完整的禁止泄露清单，参见 **RESPONSE_SHAPES.md**。

---

## 工作流级错误工作流（兜底机制）

逐节点输出可以处理你预见到的、并且记得为相应节点接线的故障。**错误工作流**则会捕获其他所有故障：某个你忘记接线的节点、节点之间发生的崩溃、整个工作流超时、触发器故障。对于无人值守的工作流，这是一个安全网，能将“它悄无声息地停止了”变成“收到了一条警报”。

将其构建为一个以 **Error Trigger** 节点开始的独立工作流。n8n 会使用以下故障上下文调用它：

```json
{
  "execution": { "id": "...", "url": "...", "lastNodeExecuted": "Fetch order",
    "error": { "name": "NodeApiError", "message": "...", "timestamp": 1715000000000 } },
  "workflow": { "id": "...", "name": "Sync Stripe customers" }
}
```

最简版本——**捕获 → 通知**：

```
Error Trigger → Set (build alert from execution + error) → Slack/email (post to #incidents)
```

一条好的警报应包含工作流名称、编辑器链接和失败执行的链接、失败节点名称，以及**真实的**错误消息（而不是“工作流失败”）。字段表达式，以及可选的“通过 n8n 节点获取导致失败的输入”升级方案，参见 **ERROR_WORKFLOWS.md**。

有两个陷阱值得预先指出：

- **递归陷阱。** 如果错误工作流通过 Slack 发送通知，而恰好是 Slack 宕机，那么错误工作流本身也会失败——原始错误也会随之消失。通知渠道应与受监控工作流使用的渠道*不同*（大多数工作流通过 Slack 发出警报 → 错误工作流则使用电子邮件），并添加一个后备方案（写入 Data Table），确保即使通知失败也能留下痕迹。
- **被“处理”的错误不会向上冒泡。** 如果某个节点的错误输出被连接到一个丢弃数据的空操作，n8n 会认为该错误已被*处理*，因此错误工作流**不会**触发。只有在你确实会对错误执行某些操作时，才应在逐节点层面捕获错误。

> **社区 MCP 无法做到的事情：**分配错误工作流（实例默认值或逐工作流覆盖）是一项 n8n **UI 设置**——Workflow Settings → Error Workflow。没有可用于设置它的 MCP 工具。先使用 MCP 构建错误工作流，然后告知用户在 UI 中完成连接所需的确切步骤，并要求用户对每个无人值守的工作流重复该操作（或设置实例默认值）。

---

## 社区 MCP 无法提供的功能

| 想要执行的操作 | 实际情况 |
|---|---|
| 设置工作流的 **Error Workflow** 配置 | 仅限 UI（Workflow Settings → Error Workflow）。没有 MCP 工具。先构建工作流，再向用户提供 UI 操作步骤。 |
| 切换其他**工作流设置**（Save Execution Data、时区、超时、调用方策略） | 仅限 UI。`n8n_update_partial_workflow` 提供 `updateSettings`，但错误工作流分配并未被可靠地公开——请在 UI 中确认。 |
| 启用实例级错误日志记录（Sentry、服务器日志） | 属于实例配置，完全位于 n8n 工作流之外。 |

MCP **可以**执行的操作：构建错误处理工作流、在节点上设置 `onError`/`retryOnFail`（`updateNode`/`patchNodeField`）、连接错误输出（使用带有 `sourceIndex: 1` 的 `addConnection`）、验证（`validate_workflow`、`n8n_validate_workflow`）、自动修复常见问题（`n8n_autofix_workflow`）、测试（`n8n_test_workflow`），以及检查失败情况（`n8n_executions`）。

---

## 反模式

| 反模式 | 问题 | 修复方法 |
|---|---|---|
| 设置了 `onError`，但错误输出未连接 | 错误被静默丢弃；运行结果显示为**成功** | 将 `sourceIndex: 1` 连接到实际的处理节点，或者将 `onError` 恢复为 `stopWorkflow`，以便错误能明确暴露出来 |
| 已连接错误输出，但未设置 `onError` | 该输出插槽永远不会触发；处理节点不可达；工作流失败时会停止 | 设置 `onError: "continueErrorOutput"` |
| Webhook → 处理 → 响应，但没有错误分支 | 调用方会遇到超时，或收到 n8n 的通用 500 响应 | 将每个可能失败的节点的错误输出连接到 Respond 节点 |
| 错误分支返回 200，并在正文中包含 `{error}` | 调用方客户端会将其视为成功；其错误处理逻辑永远不会触发 | 在错误 Respond 节点上将 `responseCode` 明确设置为 4xx/5xx |
| 对所有错误都返回同一个 500 `internal_error` | 调用方无法区分是其输入有误，还是你的服务发生故障 | 将原因映射到状态码（调用方问题用 4xx，你方问题用 5xx） |
| 在 Code 节点中捕获错误，并将其作为数据返回 | 下游会把具有错误结构的数据当作正常数据继续处理 | 让其抛出错误；使用 `onError: "continueErrorOutput"` 并连接错误路径 |
| 网络节点未设置 `retryOnFail` | 每次临时性的 429 或网络抖动都会表现为 5xx；告警会被噪声触发 | `retryOnFail: true, maxTries: 3, waitBetweenTries: 5000` |
| Switch → N 个仅状态码不同的 Respond 节点 | 本可用一个 Respond 节点完成，却使用了 5 个节点 | 在一个由表达式驱动的 Respond 节点中内联计算状态码 |
| 无人值守的工作流未配置错误工作流 | 真正的失败无人处理 | 构建一个 Error Trigger 工作流，并在 UI 中为其完成分配 |
| 错误工作流向被工作流自身监控的同一渠道发送通知 | 渠道宕机 → 错误工作流也失败 → 错误消失 | 使用不同的渠道，并将 Data Table 作为后备方案 |
| 将 `$json.error`（堆栈/SQL/令牌）泄露到响应中 | 向调用方/攻击者暴露内部信息 | 私下记录日志，返回经过清理的消息 |

---

## 参考文件

| 文件 | 何时阅读 |
|---|---|
| **NODE_ERROR_OUTPUTS.md** | 为各个可能失败的节点连接逐节点错误输出时 |
| **API_WORKFLOWS.md** | 构建/审查 Webhook → Respond 工作流时，包括模式验证器 |
| **RESPONSE_SHAPES.md** | 定义响应正文约定、状态码以及不得泄露的内容时 |
| **ERROR_WORKFLOWS.md** | 为无人值守的工作流设置工作流级兜底错误处理时 |

---

## 与其他技能的集成

- **n8n-workflow-patterns** — 错误处理主要存在于 Webhook/API 和定时工作流模式中。使用该技能确定整体结构；使用本技能增强其健壮性。
- **n8n-node-configuration** — `onError`/`retryOnFail` 属于节点配置；NODE_FAMILY_GOTCHAS.md 深入介绍了 Webhook/Respond 响应状态码方面的陷阱。
- **n8n-validation-expert** — 错误输出只配置了一半（两个步骤中缺少一个）属于连接/配置审计问题，而不是验证错误。本技能用于修复此问题。
- **n8n-expression-syntax** — 由表达式驱动的 `Response Code` 和告警消息表达式依赖正确的 `{{ }}` 语法以及对 `$json.error` 的访问。
- **n8n-code-javascript / n8n-code-python** — 如果在 Code 节点*内部*捕获错误，请有意识地作出决定：重新抛出以使用错误输出，或者处理后继续执行。不要返回具有错误结构的数据并假装执行成功。
- **n8n-code-tool** — 智能体的 Code Tool 会将抛出的错误返回给 LLM，后者随后会重试；这与工作流节点的错误契约不同。
- **n8n-binary-and-data** — 文件/二进制操作同样可能失败；请像处理任何网络节点一样连接其错误输出。

---

## 快速参考检查清单

对于 **API / webhook** 工作流：

- [ ] Webhook 触发器使用 `responseMode: "responseNode"`
- [ ] 在上游验证输入 → 通过 Respond 节点返回 4xx（使用模式验证器或 IF 节点）
- [ ] 每个可能失败的节点都设置了 `onError: "continueErrorOutput"`，**并且**已连接 `main[1]`
- [ ] 网络节点设置了 `retryOnFail: true, maxTries: 3, waitBetweenTries: 5000`
- [ ] 错误路径终止于一个设置了**明确** 4xx/5xx `responseCode` 的 Respond 节点
- [ ] 状态码与原因相匹配（调用方问题用 4xx，你方问题用 5xx）
- [ ] 错误响应体为 `{ error, message }`——不得包含堆栈跟踪、SQL 或令牌
- [ ] 已使用 `n8n_get_workflow` 验证：每个可能失败的节点都同时存在 `onError` 和 `main[1]`

对于**无人值守**（定时/cron/队列）工作流：

- [ ] 网络节点已配置 `retryOnFail`
- [ ] 存在 Error Trigger 工作流（捕获 → 通知，可选重试）
- [ ] 错误工作流通过不同渠道发送通知，并设有备用方案（避免递归陷阱）
- [ ] 已在 n8n UI 中指定错误工作流设置（MCP 无法执行此操作——请提醒用户）

---

**请记住**：默认行为是保持沉默。错误处理需要两个动作——让失败能够被*路由*（为每个节点设置 `onError` 并连接相应输出，或使用兜底错误工作流），并让它能够*发声*（通过状态码和响应体如实说明情况）。只完成其中一半比完全不做更糟，因为它看起来像是已经完成了。