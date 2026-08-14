---
name: n8n-subworkflows
description: Build reusable, composable n8n sub-workflows. Use when extracting shared logic, building anything multi-step or reused across workflows, or any workflow over ~10 nodes — and whenever the user mentions sub-workflows, Execute Workflow, reuse, shared/common logic, modular workflows, "Define Below" inputs, waitForSubWorkflow, mode each vs all, or exposing a workflow as an agent tool. Covers typed sub-workflow inputs, all-vs-each execution, verb-first naming for discovery, stateless vs stateful design, and splitting by input shape.
---
# n8n 子工作流

子工作流是一种可复用的函数。**Execute Workflow Trigger** 声明带类型的输入，主体执行具体工作，最后一个节点返回输出。调用方可以像调用其他任何步骤一样，通过 **Execute Workflow** 节点调用它。

这种模式能带来函数所具备的一切优势：封装、复用、可测试性和可替换性。它是 n8n 中主要的复用机制，却远未得到充分利用。如果没有它，同一套逻辑就会被复制粘贴到多个工作流中——之后，某个错误在两个地方得到了修复，第三份副本却被遗漏，而那些“完全相同”的副本也会悄然产生差异。

本技能介绍何时应采用子工作流，如何定义其输入/输出契约以便调用方（以及智能体）能够真正使用它，如何正确调用它（`all` 与 `each`、阻塞与即发即弃），以及如何为其命名，使它能够被找到，而不是被重复构建。

---

## 两条不可妥协的原则

其他一切都可以酌情判断，但以下两条不行。

### 1. 构建之前先搜索

在为通用问题编写逻辑之前，先检查是否已有子工作流能够解决它。社区 MCP 无法按标签筛选工作流，因此**名称就是发现入口**：

```
n8n_list_workflows()                          # scan the library
n8n_get_workflow({ id: "<candidate>" })       # read its inputs/outputs + body
```

如果找到了合适的工作流，就使用它并告知用户（“我找到了 `Subworkflow: Parse RFC2822 date`——将使用它”）。如果没有找到，则使用一个*便于发现的名称*来构建它，以便下次搜索时能够找到。发现约定（动词优先的前缀）详见 **NAMING_AND_DISCOVERY.md**。

### 2. Execute Workflow Trigger 应使用带类型字段的“Define Below”，而不是 passthrough

该触发器有两种输入模式。**默认使用“Define Below”**，并显式定义带类型的字段。只有 Define Below 模式才能为调用方提供可填写的 schema——正是它让 AI 智能体能够通过 `$fromAI` 传递值，也让结构化调用方能够清晰地映射字段。Passthrough 没有 schema，因此无法将该触发器作为清晰的智能体工具进行连接，结构化调用方也没有可绑定的字段。

只有以下两种例外：

- **二进制输入。** 带类型字段仅支持 JSON。如果子工作流必须接收图像/文件/PDF，就需要使用 passthrough，以便 `binary` 槽位能够传递下去。
- **零输入。** Define Below 要求至少有一个字段。真正无参数的操作（“列出有效凭据”“当前计数”）无处放置空 schema，因此 passthrough 是唯一选择。

除这两种情况外，使用 passthrough 就是一个错误。请参阅下文的“将输入和输出视为契约”。

---

## 这是否应该成为子工作流？

当你准备编写一段逻辑时，请按照以下标准进行判断：

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

提取的理由不仅仅是复用：

- **可读性。** 调用方只显示一个节点（“解析日期”），而不是五个。
- **可测试性。** 使用固定输入单独运行子工作流（`n8n_test_workflow`）。
- **可替换性。** 替换实现，而不将改动波及调用方。

一个包含 20 个节点的工作流没有问题，*前提是它主要由线性的 Execute Workflow 调用和决策组成*——每个节点都有单一用途，而你可以通过打开其调用的子工作流来检查某个部分。一个包含 20 个内联转换节点的工作流则不可取。如果你的工作流有 15 个以上的节点，并且主要内容不是子工作流调用和分支，就应进一步提取。

---

## 无状态与有状态（有意为之）

两者都是一等模式。如何选择取决于设计意图以及契约所做的承诺。

**无状态**——输入进入，输出返回，除此之外没有 I/O。纯逻辑应默认采用这种方式。当你再次需要它时，可以直接调用，而不必担心触发副作用。

- `Subworkflow: Parse RFC2822 date`——日期字符串 → ISO 日期或错误。
- `Subworkflow: Compute MRR from subscription`——订阅对象 → 数字。
- `Subworkflow: Format invoice as HTML`——发票数据 → HTML 字符串。

**有状态（有意为之）**——在清晰契约的背后读取或写入外部状态。这就是存储库模式：子工作流对存储操作进行抽象，让调用方使用领域术语思考，而不是考虑 SQL。

- `Customer: get by id`——id → 客户对象或 `{ ok: false, error: "not_found" }`。读取数据库。
- `Customer: write billing record`——记录 → `{ ok: true, id }`。写入数据库。
- `Notify: send to on-call`——渠道、消息 → `{ ok: true, messageId }`。调用 Slack/SMTP。

将这些构建为子工作流的原因是：调用方考虑的是 `get customer by id`，而不是编写查询；你可以更换存储方案（Postgres → Supabase、原生节点 → HTTP），而不必修改任何调用方；并且幂等性、重试和验证可以集中在一个地方处理。

需要避免的是**意外状态**——一个在命名和描述上看似纯粹的子工作流，却暗中写入日志表。这会让每个调用方措手不及，因为它们有充分理由认为该子工作流可以安全地重试或组合。要么让副作用成为契约的一部分（重命名、记录说明并返回其结果），要么将其移出。

---

## 将输入和输出视为契约

触发器声明的字段和最后一个节点的输出结构*就是*子工作流的 API。应像对待 API 一样对待它们。

### 声明类型化输入（Define Below）

每个声明的输入都是由调用方填写的类型化参数。应有意识地选择类型（`string`、`number`、`boolean`、`array`、`object`）——智能体在填写工具参数时会将这些类型作为必需类型，而人类在连接调用方时也会依赖这些类型。触发器节点的参数如下所示：

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

在工作流主体内部，可以通过 `$json.list_of_ids` 读取这些字段；也可以在下游任意位置通过 `$('When Executed by Another Workflow').first().json.<field>` 读取（参见 **n8n-expression-syntax**）。

### 契约规则

- **在工作流 `description` 中记录输入和输出。** 包括字段名称、类型、用途以及一些具有代表性的关键词。调用方（人类和智能体）通过描述了解契约，`n8n_list_workflows` 也会根据描述进行匹配。
- **返回一致、自然的数据形态，而不是存储形态。** 拥有 Data Table 或 S3 文件的子工作流应向调用方隐藏这种内部表示。数组应返回为数组，对象应返回为对象，日期应返回为 ISO 字符串——无论底层存储是否采用了 JSON 字符串化文本。返回契约是*接口*；存储布局是*实现细节*。常见失误：子工作流具有一条“新鲜”路径（刚刚计算完成，采用自然形态）和一条“缓存”路径（刚从字符串化的列中读取）。错误做法：将新鲜路径的结果字符串化，以匹配缓存路径。正确做法：解析缓存路径的结果，使两条路径都返回自然形态。
- **返回错误，不要一律抛出错误。** 对于*预期内*的失败（解析错误、未找到），返回 `{ ok: false, error: "..." }`，以便调用方在不连接错误输出的情况下进行分支处理。仅对真正意外的失败抛出错误——参见 **n8n-error-handling**。
- **一旦存在调用方，契约便不可更改。** 添加*可选*字段是安全的。重命名或删除字段则很危险：n8n 不会因无法识别的输入字段而报错——工作流主体只会得到 `undefined`，调用方对此毫不知情，最终造成无提示的契约破坏。若要更改字段，应列出所有调用方（使用 `n8n_list_workflows`，并检查每个调用方的 Execute Workflow 节点），在同一次变更中迁移它们，并在完成前使用 `validate_workflow` 和 `n8n_get_workflow` 进行验证。

### 最终 Return 节点——合理使用 Set 的例外情况

使用最终的 **Set / Edit Fields** 节点整理输出结构，并将其命名为 `Return` 或 `Return <thing>`。通常，**n8n-expression-syntax** 建议“不要添加末尾 Set 节点”，但这是 Set 节点理应发挥作用的唯一场景：子工作流最后一个节点的隐式使用者是*每一个调用方*，因此，显式的 Set 节点能让返回契约清晰可见——读者只需查看一个节点就能了解完整的 API，同时还可以移除上一个计算节点所携带的所有无关字段。

---

## 调用子工作流：`mode` 和 `waitForSubWorkflow`

调用方 **Execute Workflow** 节点上的两个设置决定了子工作流的运行方式。

### `mode`：`all` 与 `each`

| `mode` | 子工作流运行次数 | 每次运行的项目数 |
|---|---|---|
| `all`（默认） | 一次 | 全部 N 个项目（像往常一样逐项目流经各节点） |
| `each` | N 次 | 每次运行恰好一个项目 |

对于仅以常规方式处理项目的工作流主体，这两种模式是等效的——无论哪种模式，n8n 节点都会逐项目迭代。**只有当工作流主体假定自己恰好只接收到一个项目时，这种区别才有意义**：例如每次运行执行一次聚合、包含“这就是要处理的那位客户”的逻辑，或者最终写入操作应针对每个输入分别执行一次。使用 `all` 时，该工作流主体会一次性接收到全部 N 个项目，这一假设便会失效（所有项目会被聚合为一个结果，而不是每个输入各生成一个结果）。使用 `each` 时，每次调用只接收一个项目，因此这一假设成立。

所以：当你需要逐项迭代时，优先使用 `mode: each`，而不是在子工作流*内部*放置 Loop Over Items 节点。该模式会替你完成迭代，使工作流主体保持简单，并且一次只处理一个条目。

### `waitForSubWorkflow`：`true` 与 `false`

`waitForSubWorkflow` 默认为 `true`——调用方会阻塞，直到子工作流返回，然后使用其输出继续执行。将 `options.waitForSubWorkflow: false` 设置为即发即弃模式：调用发出后，调用方立即继续执行，子工作流在后台运行，下游不会看到任何返回数据。

### n8n 提供的唯一真正并行化方式

`mode: each` + `waitForSubWorkflow: false` 是**实现子工作流真正并发执行的唯一方式**：N 个条目会分派 N 次并行执行的运行（但仍受每个实例并发限制的约束）。调用方不知道它们何时完成，甚至不知道是否有任何一个完成，因此这种方式只有配合独立的完成状态跟踪机制才有用，通常是由子工作流随着处理进度持续更新的 Data Table。完整的阶段处理 → 分派 → 轮询模式见 **SUBWORKFLOW_PATTERNS.md**（“即发即弃并行化”）。

---

## 按输入形态拆分（N+1 模式）

当一个子工作流有多条输入路径，且这些路径的契约*确实*不同——二进制与 JSON、同步与异步、不同的身份验证方案——不要把它们硬塞到一个采用 passthrough 的触发器下，再使用内部 Switch。实际约束确实存在：对于单个触发器，passthrough（用于二进制输入或零输入）和 Define Below（用于类型化输入）是互斥的。“选择 passthrough，因为它最宽松，然后在内部进行分支”的惯性做法会让你失去类型化 schema（无法获得简洁的智能体工具），增加分支形态的冗余，并使每一种新输入形态都需要更多分支。

解决办法是：对于 N 种不同的输入契约，构建 **N+1 个子工作流**——每种契约对应一个外层子工作流，各自执行其输入特定的准备工作（验证、获取、哈希、提取），并调用**同一个共享下游**子工作流，传入标准化后的形态。共享核心只有一个类型化输入契约，并且完全不需要知道是哪个外层子工作流调用了它。完整示例（通过外部 ID *或*上传的 PDF 处理论文）见 **SUBWORKFLOW_PATTERNS.md**。

---

## 将子工作流用作智能体工具

带有类型化 Define Below 触发器的子工作流也可以作为 AI 智能体工具：智能体通过 `$fromAI` 填充已声明的字段，工作流主体运行，结果作为工具观察返回。这正是默认使用 Define Below 的高价值原因——passthrough 触发器无法公开可供填充的 schema。

零输入场景仍然可以作为工具使用：智能体唯一需要决定的是是否调用。二进制场景则无法顺畅地接入工具，因为智能体无法直接传递二进制数据。

有关工具命名、描述和二进制输入的变通方法，请参阅 **n8n-agents**；有关二进制数据本身的处理，请参阅 **n8n-binary-and-data**。

---

## 反模式

| 反模式 | 会出现什么问题 | 修复方法 |
|---|---|---|
| 在三个工作流中复制相同逻辑 | 一个 bug 只在两个地方得到修复，第三处逐渐偏离 | 将其提取一次，放入一个具有明确名称的子工作流 |
| 未经搜索就构建新的子工作流 | 库中出现重复项；未来搜索时会同时找到两者 | 先使用 `n8n_list_workflows` / `n8n_get_workflow` |
| 在不处理二进制数据且并非零输入时，将触发器设置为 passthrough | 没有 schema → 智能体无法填充参数，结构化调用方无法绑定 | 使用带类型化 `workflowInputs.values` 的 Define Below |
| 零输入 passthrough 未执行清空并提供说明 | 工作流主体会悄无声息地读取调用方转发的任意多余字段 | 从一个 Set（“Keep Only Set”，不含任何字段）开始，并添加注明“不需要输入”的 sticky |
| 子工作流在名称或描述中声称是纯函数，却暗中写入状态 | 调用方无法推断重试和幂等性行为；副作用会令其措手不及 | 将副作用纳入契约，或将其移出 |
| 子工作流没有 `description` | 未来搜索时无法找到；没人知道它的用途 | 设置包含输入/输出形态和关键词的 `description` |
| 使用 `Helper 3` 之类的名称或没有前缀 | 名称无法说明其用途，也无法匹配任何前缀搜索 | 使用动词优先的前缀（`Subworkflow:`、`<Domain>:`、`Tool:`） |
| 在假设只有一个条目的工作流主体上使用 `mode: all` | 所有输入会聚合为一个结果，而不是每个输入对应一个结果 | 使用 `mode: each`（并跳过内部的 Loop Over Items） |
| 在未迁移调用方的情况下重命名正在使用的输入字段 | 调用方发送旧名称 → 工作流主体看到 `undefined`，且任何地方都不会报错 | 在同一次变更中迁移所有调用方；使用 `validate_workflow` 验证 |
| 30 个节点的工作流未做任何提取 | 难以阅读、测试和替换 | 将逻辑区段提取到子工作流中 |

---

## 社区 MCP 无法提供的功能

| 想要执行的操作 | 实际情况 |
|---|---|
| 按**标签**筛选/发现工作流 | MCP 无法读取标签或按标签筛选（仅 UI 支持）。发现工作流依靠的是*名称*——使用动词优先的前缀和 `n8n_list_workflows`。 |
| 捕获**无法识别的输入字段** | n8n 不会因此报错。工作流主体会得到 `undefined`，而调用方对此毫不知情——这会导致静默的契约破坏。字段重命名后，需手动逐一核查所有调用方。 |
| 在没有类型化触发器的情况下设置输入模式/字段 | 触发器节点本身必须声明 `workflowInputs.values`。使用 `n8n_update_partial_workflow`（`updateNode` / `patchNodeField`）进行配置；使用 `get_node` / `validate_node` 进行验证。 |

MCP **可以**执行的操作：构建子工作流及其调用方（使用带有 `addNode` / `addConnection` / `updateNode` / `patchNodeField` 的 `n8n_update_partial_workflow`）、发现现有工作流（`n8n_list_workflows`、`n8n_get_workflow`）、进行验证（`validate_workflow`、`n8n_validate_workflow`）、单独测试（`n8n_test_workflow`）、检查运行记录（`n8n_executions`）、使用数据表为有状态子工作流提供支持（`n8n_manage_datatable`），以及激活工作流（`activateWorkflow`）。

---

## 参考文件

| 文件 | 何时阅读 |
|---|---|
| **SUBWORKFLOW_PATTERNS.md** | 深入了解 `mode: all` 与 `each`、根据输入形态进行拆分（N+1 完整示例），以及使用数据表轮询实现即发即弃式并行化 |
| **NAMING_AND_DISCOVERY.md** | 为新子工作流命名、动词优先的前缀约定、搜索现有子工作流，以及编写便于发现的描述 |

---

## 与其他技能的集成

- **n8n-workflow-patterns** — 用它确定编排工作流的整体结构；用本技能决定哪些部分应成为子工作流。
- **n8n-mcp-tools-expert** — `n8n_list_workflows`、`n8n_get_workflow`、`n8n_update_partial_workflow` 和 `n8n_manage_datatable` 的参数格式（后者用于支撑有状态子工作流的数据表以及即发即弃式轮询）。
- **n8n-node-configuration** — `workflowInputs` 和 `inputSource`（Define Below 与透传）切换项是 Execute Workflow Trigger 上由 displayOptions 驱动的配置。
- **n8n-expression-syntax** — 读取输入（`$json`、`$('When Executed by Another Workflow')`）以及合理的末尾 Set 例外情况均在此说明。
- **n8n-error-handling** — 预期内的失败返回 `{ ok: false, error }`；意外失败则抛出异常并通过错误输出进行路由。子工作流边界是划定这条界线的自然位置。
- **n8n-validation-expert** — 验证子工作流及其调用方；无法识别的输入字段不会在此暴露，因此需手动验证字段变更。
- **n8n-code-javascript / n8n-code-python** — 当子工作流的主体是单个 Code 节点时，其契约仍然是触发器的类型化输入和返回的数据结构，而不是 Code 节点的内部实现。
- **n8n-code-tool** — Custom Code Tool 是*内联*智能体工具选项；子工作流工具则是可复用的多步骤选项。当逻辑由多个智能体共享或需要完整的 Code 节点沙箱时，应选择子工作流。
- **n8n-agents** — 将类型化子工作流连接为智能体工具，包括零输入和二进制数据场景。
- **n8n-binary-and-data** — 用于二进制输入的透传触发器，以及二进制数据为何无法直接流经智能体工具。
- **using-n8n-mcp-skills** — 在构建过程中，何时应查阅哪个技能。

---

## 快速参考检查清单

在交付子工作流之前：

- [ ] **已先行搜索** `n8n_list_workflows` / `n8n_get_workflow`——确保它尚不存在
- [ ] **触发器使用“在下方定义”**，并配置带类型的 `workflowInputs.values`（二进制或零输入情况除外）
- [ ] **零输入直通**（如使用）以启用了“仅保留设置项”的 Set 节点开始，并通过便笺注明无输入
- [ ] **名称**带有动词优先的前缀（`Subworkflow:`、`<Domain>:`、`Tool:`）
- [ ] **描述**记录输入/输出结构，并包含可搜索的关键词
- [ ] **通过最终的 `Return` Set 节点返回自然且一致的结构**——而非存储结构
- [ ] **预期内的失败**返回 `{ ok: false, error }`；仅对意外失败抛出异常
- [ ] 如果工作流主体假定只有一个条目（而不是使用内部的 Loop Over Items），则**调用方的 `mode`**为 `each`
- [ ] **`waitForSubWorkflow`**经过有意设置（仅在具备完成状态跟踪机制时才设为 `false`）
- [ ] **有状态的子工作流**在名称和描述中声明其副作用——不得意外引入状态
- [ ] 已使用 `validate_workflow` **验证**；已使用 `n8n_test_workflow` 单独测试

---

**请记住**：子工作流就是函数。它的 API 是触发器的类型化输入和最后一个节点的输出结构——请明确指定二者，为其取一个易于搜索的名称，并使用其工作流主体所期望的 `mode` 调用它。一个既不用于二进制数据也不用于零参数操作的直通触发器，或者一个无人能够搜索到的名称，都会让可复用函数在不知不觉中成为下一个重复实现。