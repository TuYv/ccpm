---
name: n8n-multi-instance
description: Use when an n8n-mcp account targets more than one n8n instance — i.e. the `n8n_instances` tool is available, the user mentions multiple n8n instances or environments (prod vs staging, several teams or clients), a workflow / datatable / credential / execution call returns an unexpected NOT_FOUND or reads data you don't recognize, or a credential create/update/delete is refused with an `INSTANCE_AMBIGUOUS` error. Covers choosing and switching which instance this MCP session targets, verifying the target before high-stakes work — credential writes above all — and recovering from misroutes and ambiguous-write fail-closes. Always consult this skill before operating on a specific instance, before any credential create/update/delete on a multi-instance account, or when a call hits the wrong/empty data or an `INSTANCE_AMBIGUOUS` error.
---
# 通过 MCP 使用多个 n8n 实例

当 `n8n_instances` 工具可用时，用户已启用**多实例模式**：一个 MCP
连接可以访问多个 n8n 实例（例如 `prod`、`staging`，或每个客户/团队对应一个实例）。
其他所有 n8n 工具（`n8n_get_workflow`、`n8n_list_workflows`、`n8n_update_partial_workflow`、
`n8n_manage_datatable`、`n8n_manage_credentials`、`n8n_executions`、`n8n_test_workflow`，……）都会
针对**此会话当前指向的实例**运行。每次调用都没有单独的实例参数：
只能通过切换来更改目标。如果指向了错误的实例，读取操作会返回错误的数据，而写入操作会落到错误的位置——通常
**不会报错**（唯一的例外是存在歧义的凭据写入，这种操作会以安全方式失败；见下文）。因此，请谨慎选择目标实例。

如果不存在 `n8n_instances` 工具，则该账户为单实例模式：忽略此技能，
直接使用 n8n 工具。

## 黄金法则

六条规则。每条规则都能防止一类静默误路由问题。

1. **先发现。** 在执行操作之前调用 `n8n_instances({mode:"list"})`，以了解实例
   名称以及哪个实例是 `current`。
2. **按名称切换到目标实例**，然后再对非默认实例执行操作：
   `n8n_instances({mode:"switch", name:"<instance name>"})`。匹配不区分大小写。
3. **在单独的轮次中切换。** 切勿将 `switch` 与依赖它的操作放在**同一个
   并行工具调用批次**中。同一批次内的调用无法保证顺序，因此在切换后的会话状态可见之前，
   依赖调用可能会针对*之前的*实例进行解析。
   先切换，等待其返回，*然后*再执行操作。
4. **执行高风险操作前进行验证。** 在创建/更新/删除**凭据**之前
   （以及进行破坏性工作流编辑之前），确认 `current` 是你预期的实例——首要
   检查方式是 `n8n_instances({mode:"list"})`。系统只会对存在*歧义*的凭据
   情况以安全方式失败（规则 6）；显式切换到**错误的**实例仍会在那里静默写入，因此
   此检查需要由你负责。
5. **意外出现的 `NOT_FOUND` 几乎总是由错误实例误路由导致，而不是对象已被删除。** 不要
   重新创建该对象。重新检查当前实例并重试（参见“恢复”）。
6. **遇到 `INSTANCE_AMBIGUOUS` 时，请在*此*会话中进行切换，然后重试。** 系统拒绝
   写入密钥，是因为此会话从未自行选择目标。请按要求操作——在此处运行 `switch` 以
   确认实例，然后重试写入。不要绕过它，也不要盲目重试。

## 核心工作流

```
1. n8n_instances({mode:"list"})                      # see available[] + current + default
2. n8n_instances({mode:"switch", name:"prod"})       # bind THIS session to "prod"
   → returns { previous, current }; confirm current.name == "prod"
3. (do your work) n8n_list_workflows / n8n_get_workflow / n8n_manage_datatable / ...
4. Before a credential write or a delete:
   n8n_instances({mode:"list"})  → re-confirm current, THEN n8n_manage_credentials({action:"create", ...})
```

要移至另一个实例，只需再次执行 `switch`。整个会话都会遵循这次切换。

## `n8n_instances` 工具

有两种模式（`mode` 为必填项，并通过枚举验证）：

- `{mode:"list"}` → `{ current, default, available }`，无副作用。
  - `current` 和 `default` 各自为一个实例 `{ id, name, url, isDefault }`（或 `null`）。
  - `available` 包含所有实例，每个实例还带有一个额外的 `isCurrent` 布尔值。通过 **`name`** 匹配；
    切勿硬编码 `id`。
- `{mode:"switch", name:"<name>"}` → `{ previous, current }`，并将此会话绑定到指定名称的
  实例。`name` 不区分大小写。

### 错误封装（来自 `n8n_instances` 工具）

每个错误都会返回 `{ error: "<CODE>", message, … }`。你实际会遇到的错误如下：

| 代码 | 何时发生 | 如何处理 |
|---|---|---|
| `UNKNOWN_INSTANCE` | `name` 未匹配任何实例 | 从错误载荷的 `available` 列表中选择一个名称，然后重试。 |
| `NAME_REQUIRED` | 调用 `switch` 时未提供 `name` | 使用一个 `name` 重新调用（错误会在 `available` 中列出有效名称）。 |
| `MULTI_INSTANCE_DISABLED` | 多实例模式已关闭 | 没有可切换的实例；直接使用 n8n 工具。用户可以在 n8n-mcp 控制面板中启用该模式。 |
| `NO_SESSION` | 请求中既**没有** MCP 会话 ID，**也没有**凭据 ID | 选择结果无处保存。重新连接／初始化会话，然后切换。 |
| `UNKNOWN_MODE` | `mode` 不是 `list`/`switch` | 使用 `list` 或 `switch`。 |
| `INVALID_CONTEXT` | 缺少服务器端元数据 | 这是服务器缺陷，而不是你的输入问题——请报告该问题。 |

> 实例名称绝不能是 `default`、`current`、`list` 或 `switch`（这些是保留名称），因此你永远
> 不会看到名称与某个模式或字段完全相同的实例。

### `INSTANCE_AMBIGUOUS`（来自凭据写入路径，而非该工具）

这是一个单独的、风险更高的错误。它**不是**由 `n8n_instances` 返回，而是当你调用
`n8n_manage_credentials` **创建／更新／删除**凭据，且目标实例不明确时由服务器返回：
此会话本身从未执行过切换，却继承了其他位置所做的切换（扇出／重新连接），并指向一个
**非默认**实例。为避免将密钥写入错误的实例，服务器会**阻止写入**（请求永远不会到达 n8n，
也不会消耗配额）并返回：

```json
{
  "error": "INSTANCE_AMBIGUOUS",
  "message": "… the session issuing this request never switched there itself … Re-run n8n_instances({mode:\"switch\", name:\"…\"}) on this session to confirm the target …",
  "lastSelected": { "id": "…", "name": "…" },
  "default":      { "id": "…", "name": "…" }
}
```

**修复方法：**确定你实际想使用哪个实例（`lastSelected` 是继承的切换目标，`default`
是账户默认实例），在**此**会话上运行 `n8n_instances({mode:"switch", name:"…"})`，然后
重试写入。请参阅规则 6。

## 目标选择的行为方式（心智模型）

- `switch` 会将**此会话绑定**到所选实例。该绑定会在会话的剩余生命周期内**持续有效，
  并在重新连接、空闲和后端部署后继续保留**（约 24 小时，即 MCP 会话的生命周期）
  ——你无需在每次调用前重新切换。
- 其他会话／终端是**相互独立**的：在此处切换不会改变它们的目标。
- 一个会话一次只能以**一个实例为目标**。没有按调用指定实例的参数；只能通过 `switch`
  更改目标。
- **读取和非凭据写入**会静默路由到当前选定的实例——错误路由会产生错误的数据或
  `NOT_FOUND`，而不是报错。
- **凭据写入是唯一受保护的情况。**它们的路由方式相同，但服务器会在出现*歧义*状态
  （从未执行切换，却恢复到非默认实例的会话）时以 `INSTANCE_AMBIGUOUS` 采取失败关闭策略。
  这是一项安全保障，不能替代规则 4：显式切换到错误的实例仍会将数据写入该实例。
- **如果你选定的实例被删除**（用户在会话中途将其移除），下一次调用会静默回退到你的
  **默认**实例——不会报错。因此，当默认实例的数据出现在你原本预期看到另一个实例数据的
  位置时，看起来可能就像“我的数据消失了”。请重新列出实例以查看你当前所在的位置。

## 恢复操作手册

| 症状 | 通常意味着什么 | 应执行的操作 |
|---|---|---|
| 创建/更新/删除凭据时出现 `INSTANCE_AMBIGUOUS` | 此会话从未主动切换过实例；系统不会猜测应将密钥写入哪个实例 | 在此会话中运行 `n8n_instances({mode:"switch", name:"<target>"})`（错误信息会列出 `lastSelected` 和 `default`——选择你需要的实例），然后重试写入。切勿盲目重试。 |
| 对于你**确定存在**的工作流/数据表/凭据出现 `NOT_FOUND` | 你当前指向了错误的实例——**并非**该对象已被删除 | `n8n_instances({mode:"list"})` → 检查 `current`。如果它不是目标实例，请执行 `switch` 后重试。**不要重新创建该对象。** |
| 读取返回**空数据或陌生数据** | 从错误实例读取，或者你的实例被删除后静默回退到了 `default` | 运行 `n8n_instances({mode:"list"})`，确认 `current`，必要时切换实例，并在得出结论前重新读取。 |
| 执行 `switch` 时出现 `UNKNOWN_INSTANCE` | `name` 错误（存在拼写错误，或者你是猜的） | 查看错误信息中的 `available` 名称，并切换到其中一个实例。名称不区分大小写。 |
| `n8n_health_check` 报告了非预期的 `instanceName` | 此会话当前所在的实例与你认为的不同 | 执行 `switch` 切换到目标实例，然后继续操作。 |
| 在同一轮中反复路由错误 | 你将 `switch` 与依赖该切换的操作进行了批处理 | 将它们拆开：单独执行 `switch`，等待结果，然后每次只执行一个逻辑步骤。 |

每次通过切换完成恢复后，使用 `n8n_instances({mode:"list"})`（读取 `current`）进行健全性检查，并将其作为
主要判断信号。`n8n_health_check` 也会在 `details.instanceName` 中返回解析后的实例，
但在某些路径（旧版/聊天）中可能不存在，因此应将其视为辅助确认手段。

## 凭据操作（风险最高）

凭据包含实时密钥，而路由错误的凭据写入会将密钥写入**错误的
实例**。服务器会自动防范**存在歧义**的情况——如果此会话从未选择过
目标，却继承了一个切换到非默认实例的操作，则写入会以
`INSTANCE_AMBIGUOUS`（规则 6）安全失败，并且绝不会到达 n8n。但这层防护的适用范围很窄：如果会话
**确实执行过**切换，凭据写入就会进入其切换到的实例，系统不会再次
确认。因此：

- 在使用 `n8n_manage_credentials` 创建/更新/删除凭据**之前立即验证 `current`**——在
  同一段简短操作序列中调用 `n8n_instances({mode:"list"})`，而不是提前 10 个步骤调用，因为后续
  切换可能已经改变了目标实例。
- **出现 `INSTANCE_AMBIGUOUS` 时**，在此会话中切换实例以确认目标，然后重试——不要
  绕过该错误。
- 凭据**读取**（`action:"list"`/`"get"`/`"getSchema"`）不受此门控限制，也不会写入
  密钥，但从错误实例读取会返回错误的架构或列表——因此，如果结果看起来不对，仍应验证
  `current`。
- 有关 `n8n_manage_credentials` 工具本身（CRUD 结构、`getSchema` 发现，以及绝不将
  密钥内联到文本字段中），请参阅 `n8n-mcp-tools-expert`。

## 常见的多实例任务：在实例之间复制内容

要在实例 B 上重新创建实例 A 中的凭据或工作流：

```
1. switch → A;  read the source (n8n_manage_credentials get / n8n_get_workflow)
2. switch → B   (its own call — never batched with the create below)
3. n8n_instances({mode:"list"})  → confirm current == B
4. create on B  (n8n_manage_credentials create / n8n_create_workflow)
```

在单独的一轮中执行每个实例的步骤；切勿将 `switch → B` 与在 B 上创建的调用重叠执行
（规则 3），并且在写入凭据前，必须在当前会话中显式切换，以免目标不明确
（规则 4 和 6）。

## 快速参考

- 查看实例及当前所在位置：`n8n_instances({mode:"list"})` → `{ current, default, available }`
- 更改目标：`n8n_instances({mode:"switch", name:"<name>"})` — 单独一轮调用，然后再执行操作
- 确认目标：以 `list` 返回的 `current` 为准（主要方式）；也可使用 `n8n_health_check` 返回的 `details.instanceName`（辅助方式，可能不存在）
- `UNKNOWN_INSTANCE` → 切换到错误信息的 `available` 列表中的某个名称，然后重试
- `INSTANCE_AMBIGUOUS`（凭据写入）→ 在当前会话中执行 `switch` 以确认目标，然后重试
- 意外出现 `NOT_FOUND` → 验证实例、切换并重试；**不要重新创建**
- 写入凭据前 → 再次执行 `list`，确认 `current`，然后写入（故障关闭机制仅覆盖目标不明确的情况）

## 与其他技能的集成

- **n8n-mcp-tools-expert** — 负责 `n8n_manage_credentials`（CRUD + `getSchema`），并规定密钥必须通过凭据系统传递，绝不能放在文本字段中。本技能在此基础上增加了“使用哪个实例？”这一层。
- **using-n8n-mcp-skills** — 路由技能；要确定某个构建步骤由哪个技能负责，请查阅该技能。