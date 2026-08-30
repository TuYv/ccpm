---
name: n8n-subworkflows
description: Build reusable, composable n8n sub-workflows. Use when extracting shared logic, building anything multi-step or reused across workflows, or any workflow over ~10 nodes — and whenever the user mentions sub-workflows, Execute Workflow, reuse, shared/common logic, modular workflows, "Define Below" inputs, waitForSubWorkflow, mode each vs all, or exposing a workflow as an agent tool. Covers typed sub-workflow inputs, all-vs-each execution, verb-first naming for discovery, stateless vs stateful design, and splitting by input shape.
---
# n8n 子工作流

子工作流是一种可复用的函数。**Execute Workflow Trigger** 声明类型化输入，主体执行具体工作，最后一个节点返回输出。调用方可以像调用其他步骤一样，通过 **Execute Workflow** 节点调用它。

这种设计为你带来了函数在任何地方都能带来的好处：封装、复用、可测试性和可替换性。它是 n8n 中主要的复用机制，但目前远未得到充分使用。没有子工作流，同一套逻辑就会被复制粘贴到多个工作流中——随后一个 bug 在两处被修复，第三份副本却被遗漏，而那些“完全相同”的副本也会悄悄产生偏差。

本技能介绍何时应该使用子工作流、如何定义输入/输出契约以便调用方（以及代理）真正使用它、如何正确调用它（`all` 与 `each`、阻塞式与即发即忘），以及如何为它命名，使其能够被找到，而不是被重新构建。

---

## 两条不可妥协的原则

其他所有事情都需要权衡判断。只有这两条不需要。

### 1. 构建前先搜索

在你为一个通用问题编写逻辑之前，先检查是否已经有子工作流能够完成这项工作。社区 MCP 无法按标签筛选工作流，因此**名称就是发现入口**：

```
n8n_list_workflows()                          # scan the library
n8n_get_workflow({ id: "<candidate>" })       # read its inputs/outputs + body
```

如果有合适的，就使用它并告知用户（“我找到了 `Subworkflow: Parse RFC2822 date`，将使用它”）。如果没有，就用一个便于发现的名称来构建它，这样下一次搜索就能找到它。发现约定（动词优先的前缀）位于 **NAMING_AND_DISCOVERY.md** 中。

### 2. Execute Workflow Trigger 使用带类型字段的 "Define Below"，而不是 passthrough

该触发器有两种输入模式。**默认使用 "Define Below"**，并配置明确的类型化字段。Define Below 是唯一能为调用方提供待填充 schema 的模式——它能让 AI 代理通过 `$fromAI` 传入值，也能让结构化调用方清晰地映射字段。Passthrough 没有 schema，因此无法将触发器连接为清晰的代理工具，结构化调用方也没有可绑定的字段。

只有两种例外，而且仅限这两种：

- **二进制输入。** 类型化字段仅支持 JSON。如果子工作流必须接收图像/文件/PDF，就需要使用 passthrough，使 `binary` 槽位能够传递过去。
- **零输入。** Define Below 至少需要一个字段。一个真正不带参数的操作（“列出活跃凭据”“当前数量”）没有地方放置空 schema，因此 passthrough 是唯一的选择。

除这两种情况之外，passthrough 都是 bug。请参阅下面的“将输入和输出作为契约”。

---

## 这应该是一个子工作流吗？

你即将编写一段逻辑。用下面的问题检查一下：

```
Could this plausibly be needed in another workflow?
  └─ Yes → extract.

Is it a generic concern (auth, retry, parsing, formatting, ID generation)?
  └─ Almost always → extract. These are the canonical reusable sub-workflows.

Is it >5 nodes and conceptually one thing?
  └─ Probably extract, even if reuse isn't certain. It's better isolated.

Is it one HTTP call with no logic around it?
  └─ Don't. A sub-workflow that's just trigger → HTTP → return adds a boundary
     for nothing.

Is it tightly coupled to this one caller's data shape?
  └─ Don't extract yet — fix the data shape first, or you just relocate the coupling.
```

提取的理由不止是复用：

- **可读性。** 调用方只显示一个节点（“Parse date”），而不是五个节点。
- **可测试性。** 使用固定输入单独运行子工作流：`n8n_test_workflow({workflowId, method: "prepare"})` 会列出需要数据的节点，然后 `method: "pinned"` 会使用你构造的数据运行它（需要 `N8N_MCP_ACCESS_TOKEN` 和工作流的 “Available in MCP” 设置——参见 **n8n-mcp-tools-expert**）。子工作流没有 HTTP 触发器，因此默认的 `method: "auto"` 无法运行它。
- **可替换性。** 替换实现时不会波及调用方。

如果一个 20 节点的工作流*主要由 Execute Workflow 调用和决策组成的线性序列*，那完全没问题——每个节点都有一个用途；要检查某个部分时，只需打开它调用的子工作流即可。一个包含 20 个内联转换节点的工作流就不合适了。如果你的工作流有 15 个以上节点，并且并非主要由子工作流调用和分支组成，就继续提取更多内容。

---

## 无状态与有状态（有意为之）

两者都是一等选择。如何选择取决于意图，以及契约所承诺的内容。

**无状态**——输入进去，输出出来，除此之外不进行 I/O。纯逻辑默认采用这种方式。当你再次需要它时，可以直接调用，而不必担心触发副作用。

- `Subworkflow: Parse RFC2822 date` — 日期字符串 → ISO 日期或错误。
- `Subworkflow: Compute MRR from subscription` — 订阅对象 → 数字。
- `Subworkflow: Format invoice as HTML` — 发票数据 → HTML 字符串。

**有状态（有意为之）**——在*清晰的契约*背后读取或写入外部状态。这就是仓储模式：子工作流抽象存储操作，让调用方使用领域术语，而不是 SQL。

- `Customer: get by id` — id → 客户对象或 `{ ok: false, error: "not_found" }`。读取数据库。
- `Customer: write billing record` — 记录 → `{ ok: true, id }`。写入数据库。
- `Notify: send to on-call` — 频道、消息 → `{ ok: true, messageId }`。调用 Slack/SMTP。

将这些构建为子工作流的原因是：调用方只需考虑 `get customer by id`，而不必编写查询；你可以替换存储方式（Postgres → Supabase、原生节点 → HTTP），而无需修改任何调用方；幂等性、重试和验证也能集中在一个地方。

需要避免的是**意外状态**——一个名称和描述都表明自身是纯逻辑的子工作流，却悄悄写入日志表。这会让每个合理地认为它可以安全重试或组合的调用方措手不及。要么将副作用作为契约的一部分（重命名、记录文档、返回其结果），要么将其移出。

---

## 将输入和输出作为契约

触发器声明的字段以及最后一个节点的输出形状，*就是*子工作流的 API。将它们作为一个整体对待。

### 声明类型化输入（Define Below）

每个已声明的输入都是调用方需要填写的类型化参数。要有意识地选择类型（`string`、`number`、`boolean`、`array`、`object`）——代理会将这些类型作为填写工具参数时所需的类型，而人类在连接调用方时也会依赖这些类型。触发器节点参数如下所示：

```json
{
  "type": "n8n-nodes-base.executeWorkflowTrigger",
  "parameters": {
    "workflowInputs": {
      "values": [
        { "name": "list_of_ids",        "type": "array" },
        { "name": "include_transcript", "type": "boolean" },
        { "name": "session_id",          "type": "string" }
      ]
    }
  }
}
```

在正文中，将它们读取为 `$json.list_of_ids`；或者在下游任意位置读取为 `$('When Executed by Another Workflow').first().json.<field>`（参见 **n8n-expression-syntax**）。

### 契约规则

- **在工作流的 `description` 中记录输入和输出。** 包括字段名称、类型、用途以及几个具有代表性的关键词。调用方（人和代理）会读取 description 了解契约；`n8n_list_workflows` 也会根据它进行匹配。
- **返回一致、自然的形状，而不是存储形状。** 拥有 Data Table 或 S3 文件的子工作流应向调用方隐藏这种表示形式。数组就以数组返回，对象就以对象返回，日期就以 ISO 字符串返回——无论底层存储是否为 JSON 字符串化的文本。返回契约是*接口*；存储布局是*实现细节*。常见错误：子工作流有一条“新鲜”路径（刚计算完成，使用自然形状）和一条“缓存”路径（刚从字符串化列中读取）；错误的直觉是将新鲜路径字符串化，以匹配缓存路径。正确的做法是解析缓存路径，使两条路径都返回自然形状。
- **返回错误，不要总是抛出错误。** 对于*预期内*的失败（解析错误、未找到），返回 `{ ok: false, error: "..." }`，这样调用方无需连接错误输出即可进行分支处理。只有真正意外的失败才应抛出错误——参见 **n8n-error-handling**。
- **一旦存在调用方，契约就被冻结。** 添加*可选*字段是安全的。重命名或删除字段则很危险：对于无法识别的输入字段，n8n 不会报错——正文只会看到 `undefined`，调用方毫不知情，从而造成静默的契约破坏。要修改字段，请枚举所有调用方（使用 `n8n_list_workflows`，并检查每个调用方的 Execute Workflow 节点），在同一项变更中完成迁移，并在结束前使用 `validate_workflow` 和 `n8n_get_workflow` 进行验证。

### 最后的 Return 节点——合理使用 Set 的例外情况

使用最后一个 **Set / Edit Fields** 节点整理输出，并将其命名为 `Return` 或 `Return <thing>`。针对 **n8n-expression-syntax** 中通常“不要添加末尾 Set 节点”的建议，这是 Set 节点真正有用的一个场景：子工作流最后一个节点的隐式消费者是*所有调用方*，因此显式的 Set 会让返回契约清晰可见——读者只需查看一个节点就能了解完整 API，同时还可以移除最后一个计算节点携带的无关字段。

---

## 调用子工作流：`mode` 和 `waitForSubWorkflow`

调用方 **Execute Workflow** 节点上的两个设置决定子工作流的运行方式。

### `mode`：`all` 与 `each`

| `mode` | 子工作流运行次数 | 每次运行的项目数 |
|---|---|---|
| `all`（默认） | 一次 | 全部 N 个项目（按照通常方式逐项流经各节点） |
| `each` | N 次 | 每次运行恰好一个项目 |

对于只是按正常方式处理项目的主体而言，两者是等价的——n8n 节点无论采用哪种方式，都会逐项目迭代。**只有当主体假设自己恰好看到一个项目时，这种拆分才有影响**：例如每次运行进行聚合、执行“这就是要操作的那个客户”的逻辑，或应当针对每个输入只触发一次的最终写入。使用 `all` 时，主体会一次性获取全部 N 个项目，这一假设就会失效（你会把所有人聚合成一个结果，而不是为每个输入生成一个结果）。使用 `each` 时，每次调用获取一个项目，该假设成立。

因此：当你需要逐项目迭代时，优先使用 `mode: each`，而不是将 Loop Over Items 节点放在子工作流*内部*。该模式会替你完成迭代，同时让主体保持简单且只处理单个项目。

### `waitForSubWorkflow`：`true` 与 `false`

`waitForSubWorkflow` 默认为 `true`——调用方会阻塞，直到子工作流返回，然后再继续处理其输出。将 `options.waitForSubWorkflow: false` 设置为即发即忘：调用会被分派出去，调用方立即继续执行，子工作流在后台运行，下游不会看到返回数据。

### n8n 提供的唯一真正的并行化方式

`mode: each` + `waitForSubWorkflow: false` 是**实现真正并发执行子工作流的唯一方式**：N 个项目会分派出 N 次运行，并行执行（但仍受每个实例的并发限制约束）。调用方不知道这些运行何时完成——甚至不知道它们是否完成，因此这种方式只有在配合单独的完成跟踪机制时才有用，通常是由子工作流在执行过程中更新的 Data Table。完整的 阶段 → 分派 → 轮询 模式见 **SUBWORKFLOW_PATTERNS.md**（“即发即忘并行化”）。

---

## 按输入形状拆分（N+1 模式）

当一个子工作流有多个输入路径，且它们的契约*确实*不同——二进制与 JSON、同步与异步、不同的身份验证方案——不要将它们塞进一个带有 passthrough 和内部 Switch 的触发器中。这里的强制约束是真实存在的：在单个触发器上，passthrough（用于二进制或零输入）和 Define Below（用于类型化输入）互斥。下意识地“选择 passthrough，因为它最宽松，然后在内部进行分支”会让你失去类型化架构（无法提供整洁的 agent 工具），增加分支形状的杂乱，并让每种新的输入形状都变成更多的分支。

解决方法是：对于 N 个不同的输入契约，构建 **N+1 个子工作流**——每个契约对应一个外层子工作流，各自执行特定于输入的准备工作（验证、获取、哈希、提取），然后以规范化的形状调用**一个共享的下游**子工作流。共享核心只有一个类型化的输入契约，并且无需知道是哪个外层子工作流调用了它。完整示例（从外部 ID 或上传的 PDF 处理论文）见 **SUBWORKFLOW_PATTERNS.md**。

---

## 将子工作流用作 agent 工具

带有类型化 Define Below 触发器的子工作流也可以充当 AI agent 工具：agent 通过 `$fromAI` 填充已声明的字段，主体运行，结果作为工具观测结果返回。这就是默认使用 Define Below 的高价值原因——passthrough 触发器无法暴露可填写的架构。

零输入场景仍然可以作为工具使用：智能体唯一需要决定的是是否调用它。二进制场景则无法顺利接入为工具，因为智能体无法直接传递二进制数据。

有关工具命名、描述和二进制输入的变通方案，请参阅 **n8n-agents**；有关二进制数据本身的处理，请参阅 **n8n-binary-and-data**。

---

## 反模式

| 反模式 | 问题所在 | 修复方法 |
|---|---|---|
| 在三个工作流中重复相同的逻辑 | 修复了其中两个地方的 bug，第三个地方却逐渐偏离 | 将逻辑提取一次，放入一个命名的子工作流 |
| 未搜索就构建新的子工作流 | 库中会产生重复项；今后的搜索会同时找到两个工作流 | 先使用 `n8n_list_workflows` / `n8n_get_workflow` |
| 在既不处理二进制数据、也不是零输入的情况下，将触发器设置为 passthrough | 没有 schema → 智能体无法填写参数，结构化调用方也无法进行绑定 | 使用 Define Below，并填写带类型的 `workflowInputs.values` |
| 零输入 passthrough 没有执行清理和记录说明 | 请求体会悄悄读取调用方转发过来的任意多余字段 | 从一个 Set 开始（选择 "Keep Only Set"，不设置任何字段），并添加便签说明“无需输入” |
| 子工作流被命名或描述为纯函数，却悄悄写入状态 | 调用方无法判断重试行为和幂等性；副作用会突然出现 | 将副作用纳入契约，或将其移出 |
| 子工作流没有 `description` | 今后的搜索无法找到它；也没人知道它的作用 | 设置 `description`，包含输入/输出结构和关键词 |
| 名称类似 `Helper 3` / 没有前缀 | 无法说明其作用，也无法匹配任何前缀搜索 | 使用动词开头的前缀（`Subworkflow:`、`<Domain>:`、`Tool:`） |
| 对假设只有一个项目的请求体使用 `mode: all` | 会将所有输入聚合成一个结果，而不是每个输入生成一个结果 | 使用 `mode: each`（并跳过内部的 Loop Over Items） |
| 重命名正在使用的输入字段，却不迁移调用方 | 调用方仍发送旧名称 → 请求体得到 `undefined`，任何地方都不会报错 | 在同一次变更中迁移所有调用方；使用 `validate_workflow` 进行验证 |
| 包含 30 个节点的工作流却没有进行提取 | 难以阅读、测试和替换 | 将逻辑部分提取到子工作流中 |

---

## 社区 MCP 不提供的功能

| 想要执行的操作 | 实际情况 |
|---|---|
| 按**标签**筛选/发现工作流 | MCP 无法读取或按标签筛选（仅 UI 支持）。发现工作流依靠的是*名称* — 使用动词开头的前缀和 `n8n_list_workflows`。 |
| 捕获**无法识别的输入字段** | n8n 不会针对单个无法识别的字段报错。请求体会得到 `undefined`，调用方也不会知道 — 这是一次静默的契约破坏。请手动检查所有调用方，确认字段重命名已完成。 |
| 在没有类型化触发器的情况下设置输入模式/字段 | 触发器节点本身必须声明 `workflowInputs.values`。使用 `n8n_update_partial_workflow`（`updateNode` / `patchNodeField`）进行配置；使用 `get_node` / `validate_node` 进行验证。 |

MCP **可以**完成以下操作：构建子工作流及其调用方（使用 `n8n_update_partial_workflow` 的 `addNode` / `addConnection` / `updateNode` / `patchNodeField`），发现现有工作流（`n8n_list_workflows`、`n8n_get_workflow`），执行验证（`validate_workflow`、`n8n_validate_workflow`），独立测试（`n8n_test_workflow`），检查运行记录（`n8n_executions`），使用 Data Table 支持有状态的子工作流（`n8n_manage_datatable`），以及激活工作流（`activateWorkflow`）。

---

## 参考文件

| 文件 | 阅读时机 |
|---|---|
| **SUBWORKFLOW_PATTERNS.md** | 深入了解 `mode: all` 与 `each`、根据输入形状进行拆分（N+1 工作示例）、使用 Data Table 轮询实现即发即忘的并行化 |
| **NAMING_AND_DISCOVERY.md** | 命名新的子工作流、动词优先的前缀约定、搜索现有工作流、编写便于发现的描述 |

---

## 与其他技能的集成

- **n8n-workflow-patterns** — 用它确定编排工作流的整体形状；使用本技能决定哪些部分应成为子工作流。
- **n8n-mcp-tools-expert** — `n8n_list_workflows`、`n8n_get_workflow`、`n8n_update_partial_workflow` 和 `n8n_manage_datatable` 的参数格式（Data Table 是有状态子工作流和即发即忘轮询背后的实现）。
- **n8n-node-configuration** — `workflowInputs` 以及 `inputSource`（Define Below 与 passthrough）切换项，是由 displayOptions 驱动的 Execute Workflow Trigger 配置。
- **n8n-expression-syntax** — 读取输入（`$json`、`$('When Executed by Another Workflow')`）以及合法的最终 Set 例外情况都在这里介绍。
- **n8n-error-handling** — 预期失败返回 `{ ok: false, error }`；意外失败则抛出错误，并通过错误输出路由。子工作流边界是定义这条界线的自然位置。
- **n8n-validation-expert** — 验证子工作流及其调用方；无法识别的输入字段不会在此处显现，因此需要手动核对字段变更。
- **n8n-code-javascript / n8n-code-python** — 当子工作流的主体是单个 Code 节点时，其契约仍然是触发器的类型化输入和返回形状，而不是 Code 节点的内部实现。
- **n8n-code-tool** — Custom Code Tool 是*内联*的 agent-tool 选项；子工作流工具则是可复用的多步骤选项。当逻辑需要在多个代理之间共享，或需要完整的 Code-node 沙箱时，应选择子工作流。
- **n8n-agents** — 将类型化子工作流连接为 agent tool，包括零输入和二进制输入的情况。
- **n8n-binary-and-data** — 二进制输入的 passthrough 触发器，以及二进制数据为什么不能直接通过 agent tool 传递。
- **using-n8n-mcp-skills** — 在构建过程中何时应查阅哪项技能。

---

## 快速参考检查清单

发布子工作流之前：

- [ ] **先进行搜索**，使用 `n8n_list_workflows` / `n8n_get_workflow` — 确认它尚不存在
- [ ] **触发器使用 Define Below**，并配置类型化的 `workflowInputs.values`（二进制输入或零输入情况除外）
- [ ] **零输入 passthrough**（如果使用）以一个“Keep Only Set”Set 节点开头，并添加说明没有输入的 sticky note
- [ ] **名称**包含动词优先的前缀（`Subworkflow:`、`<Domain>:`、`Tool:`）
- [ ] **描述**记录输入/输出形状，并包含便于搜索的关键词
- [ ] **通过最终的 `Return` Set 节点返回自然且一致的形状** — 而不是存储形状
- [ ] **预期失败**返回 `{ ok: false, error }`；只有意外失败才抛出错误
- [ ] **调用方的 `mode`** 在主体假设只有单个 item 时应设置为 `each`（而不是使用内部的 Loop Over Items）
- [ ] **有意设置 `waitForSubWorkflow`**（只有在具备完成跟踪机制时才设为 `false`）
- [ ] **有状态子工作流**应在名称和描述中声明其副作用 — 不得意外产生状态
- [ ] **已使用** `validate_workflow` **完成验证**；使用 `n8n_test_workflow` **进行隔离测试**

---

**请记住**：子工作流就是一个函数。它的 API 由触发器的类型化输入和最后一个节点的输出形状构成——明确这两者，为它命名以便能够被找到，并使用其主体所期望的 `mode` 来调用它。一个既不是用于二进制数据也不是用于零参数操作的透传触发器，或者一个无人能够搜索到的名称，都会让可复用函数悄然变成下一个重复实现。