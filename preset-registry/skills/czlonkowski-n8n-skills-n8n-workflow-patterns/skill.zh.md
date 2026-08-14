---
name: n8n-workflow-patterns
description: Proven workflow architectural patterns from real n8n workflows. Use when building new workflows, designing workflow structure, choosing workflow patterns, planning workflow architecture, or asking about webhook processing, HTTP API integration, database operations, AI agent workflows, batch processing, or scheduled tasks. Always consult this skill when the user asks to create, build, or design an n8n workflow, automate a process, or connect services — even if they don't explicitly mention 'patterns'. Covers webhook, API, database, AI, batch processing, and scheduled automation architectures. Also use when optimizing a slow workflow or speeding up large-item-count processing (node count, batchSize, all-items vs per-item).
---
# n8n 工作流模式

用于构建 n8n 工作流的成熟架构模式。

---

## 6 种核心模式

基于对实际工作流使用情况的分析：

1. **[Webhook 处理](webhook_processing.md)**（最常见）
   - 接收 HTTP 请求 → 处理 → 输出
   - 模式：Webhook → 验证 → 转换 → 响应/通知

2. **[HTTP API 集成](http_api_integration.md)**
   - 从 REST API 获取数据 → 转换 → 存储/使用
   - 模式：触发器 → HTTP Request → 转换 → 操作 → 错误处理器

3. **[数据库操作](database_operations.md)**
   - 读取/写入/同步数据库数据
   - 模式：定时调度 → 查询 → 转换 → 写入 → 验证

4. **[AI Agent 工作流](ai_agent_workflow.md)**
   - 配备工具和记忆的 AI Agent
   - 模式：触发器 → AI Agent（模型 + 工具 + 记忆）→ 输出

5. **[定时任务](scheduled_tasks.md)**
   - 周期性自动化工作流
   - 模式：定时调度 → 获取 → 处理 → 交付 → 记录日志

6. **批处理**（见下文）
   - 在遵守 API 速率限制的情况下，分块处理大型数据集
   - 模式：准备 → SplitInBatches → 逐批处理 → 累积 → 聚合

---

## 模式选择指南

### 各种模式的适用场景：

**Webhook 处理** - 适用于：
- 从外部系统接收数据
- 构建集成（Slack 命令、表单提交、GitHub Webhook）
- 需要即时响应事件
- 示例：“接收 Stripe 支付 Webhook → 更新数据库 → 发送确认消息”

**HTTP API 集成** - 适用于：
- 从外部 API 获取数据
- 与第三方服务同步
- 构建数据管道
- 示例：“获取 GitHub Issue → 转换 → 创建 Jira 工单”

**数据库操作** - 适用于：
- 在数据库之间进行同步
- 按计划运行数据库查询
- ETL 工作流
- 示例：“读取 Postgres 记录 → 转换 → 写入 MySQL”

**AI Agent 工作流** - 适用于：
- 构建对话式 AI
- 需要 AI 访问工具
- 多步骤推理任务
- 示例：“与能够搜索文档、查询数据库和发送电子邮件的 AI 对话”

**定时任务** - 适用于：
- 周期性报告或摘要
- 定期获取数据
- 维护任务
- 示例：“每日：获取分析数据 → 生成报告 → 通过电子邮件发送给团队”

**批处理** - 适用于：
- 处理超出 API 批次限制的大型数据集
- 需要跨多次 API 调用累积结果
- 嵌套循环（例如，多个类别 × 每个类别对应分页 API 调用）
- 示例：“获取 4 个市场的产品，每次 API 调用获取 1000 条 → 聚合所有结果”

---

## 常见工作流组件

所有模式都共用以下构建模块：

### 1. 触发器
- **Webhook** - HTTP 端点（即时）
- **Schedule** - 基于 Cron 的定时机制（周期性）
- **Manual** - 点击执行（测试）
- **Polling** - 检查变更（按时间间隔）

### 2. 数据源
- **HTTP Request** - REST API
- **Database 节点** - Postgres、MySQL、MongoDB
- **Service 节点** - Slack、Google Sheets 等
- **Code** - 自定义 JavaScript/Python

### 3. 转换
- **Set** - 映射/转换字段
- **Code** - 复杂逻辑
- **IF/Switch** - 条件路由
- **Merge** - 合并数据流

### 4. 输出
- **HTTP Request** - 调用 API
- **Database** - 写入数据
- **Communication** - 电子邮件、Slack、Discord
- **Storage** - 文件、云存储

### 5. 错误处理
- **Error Trigger** - 捕获工作流错误
- **IF** - 检查错误条件
- **Stop and Error** - 显式失败
- **Continue On Fail** - 每个节点的设置

---

## 工作流创建检查清单

构建任何工作流时，请遵循此检查清单：

### 规划阶段
- [ ] 确定模式（webhook、API、数据库、AI、定时执行）
- [ ] 列出所需节点（使用 search_nodes）
- [ ] 理解数据流（输入 → 转换 → 输出）
- [ ] 规划错误处理策略

### 实施阶段
- [ ] 使用适当的触发器创建工作流
- [ ] 添加数据源节点
- [ ] 配置身份验证/凭据
- [ ] 添加转换节点（Set、Code、IF）
- [ ] 添加输出/操作节点
- [ ] 配置错误处理

### 验证阶段
- [ ] 验证每个节点的配置（validate_node）
- [ ] 验证完整工作流（validate_workflow）
- [ ] 使用示例数据进行测试
- [ ] 处理边界情况（空数据、错误）

### 部署阶段
- [ ] 检查工作流设置（执行顺序、超时、错误处理）
- [ ] 使用 `activateWorkflow` 操作激活工作流
- [ ] 监控最初几次执行
- [ ] 记录工作流的用途和数据流

---

## 工作流生命周期：激活前进行验证、核查和测试

构建节点只是开始，而不是结束。在工作流上线之前，应让它通过四道关卡——并牢记首要规则：**通过验证是必要条件，但并非充分条件。** 工作流可能顺利通过验证，却仍然会丢弃项目、选择错误的 Merge 输入，或者将 Slack 消息作为纯文本发布。顺利通过验证意味着其*结构*正确，并不意味着其*逻辑*正确。

1. **验证。** 在构建期间对完整 JSON 运行 `validate_workflow`，或者在实例上已存在工作流后运行 `n8n_validate_workflow({ id })`。修复所有错误并重新验证。这可以捕获 schema、节点配置、表达式和引用错误——即结构层面的问题。
2. **核查连接。** 使用 `n8n_get_workflow({ id })` 拉取工作流，并直接读取 `connections` 对象。验证可以确认连接没有*损坏*，但无法确认连接是否*正确*。你可以在此发现那些有效但错误的连线：`useDataOfInput` 与连接槽位不一致的 Merge、未连接任何节点的 Switch 回退分支、从未继续向后连接的扇出分支，或者无处可去的错误输出。（有关这些不易察觉的问题，请参阅 n8n Node Configuration skill 的 NODE_FAMILY_GOTCHAS.md。）
3. **测试。** 运行 `n8n_test_workflow`，并通过 `n8n_executions` 检查输出。确认输出结构符合使用方的预期、所有扇出分支均生成了数据，并且（对于 webhook API）状态码/正文/标头均正确。**测试期间会触发真实的副作用**——写入会提交、消息会发送、外部 API 会被调用。如果任何节点具有用户可见的副作用，请在运行前征得用户确认，或者先使用安全数据进行测试。
4. 只有在前三项均通过后才可**激活**——使用带有 `activateWorkflow` 操作的 `n8n_update_partial_workflow`。不要在刚通过验证后就直接激活；一个会丢失数据或重复发送的活跃工作流，比一个从未启动的工作流更糟糕。

跳过任何一道关卡，都是用现在节省的几分钟，换取以后调试一个正在运行、可能有状态、可能承载流量的工作流。这样的权衡永远不值得。

---

## 数据流模式

### 线性流
```
Trigger → Transform → Action → End
```
**适用场景**：只有单一路径的简单工作流

### 分支流
```
Trigger → IF → [True Path]
             └→ [False Path]
```
**适用场景**：根据条件执行不同操作

### 并行处理
```
Trigger → [Branch 1] → Merge
       └→ [Branch 2] ↗
```
**适用场景**：可以同时运行的独立操作

### 循环模式
```
Trigger → Split in Batches → Process → Loop (until done)
```
**适用场景**：分块处理大型数据集

### 错误处理器模式
```
Main Flow → [Success Path]
         └→ [Error Trigger → Error Handler]
```
**适用场景**：需要独立的错误处理工作流

---

## 批处理模式

### SplitInBatches 循环

SplitInBatches 节点将大型数据集拆分为较小的数据块进行处理。理解它的输出至关重要：

- `main[0]` = **完成** — 在所有批次完成后触发一次
- `main[1]` = **每个批次** — 每个批次触发一次（这是循环体）

```
Prepare Items → SplitInBatches → [main[1]: Process Batch] → (loops back)
                                  [main[0]: Done] → Limit 1 → Aggregate
```

始终在完成输出后添加一个 **Limit 1** 节点。

### 选择 batchSize（成本调节杠杆）

SplitInBatches 循环每次迭代都会重新运行整个循环体——引擎开销约为 0.8 毫秒/次迭代，再加上循环体本身的成本——因此总成本约为 `⌈items / batchSize⌉ × (overhead + body)`。batchSize 是一个直接的速度调节旋钮：

- 选择**实际约束所允许的最大批次**（API 页面大小、速率限制、内存）。批次越大 = 迭代次数越少 = 开销越低；循环体仍会处理每个项目。
- `batchSize: 1` 是成本最高的极端情况——每个项目都要完整执行一次引擎流程。仅当必须逐个处理项目时才使用它（嵌套循环控制，或 API 每次只接受一个 id）。
- 如果循环只是为了“遍历项目”，并没有外部约束，通常不需要这个循环——单个 All Items Code 节点可以用低得多的成本处理整个集合。

### 跨迭代数据

循环结束后，`$('Node Inside Loop').all()` **只会返回最后一个批次的项目**。要跨所有迭代累积数据，请在循环内部的 Code 节点中使用 `$getWorkflowStaticData('global')`。完整模式请参阅 n8n Code JavaScript skill。

### 嵌套循环

处理 N 个类别 × 每个类别 M 个项目时（其中 API 存在批次限制）：

```
Define Categories (N items)
  → Outer Loop (SplitInBatches, batchSize=1)
    → Prepare category data
    → Inner Loop (SplitInBatches, batchSize=1000)
      → API Call → Verify → (loops back to Inner Loop via main[1])
    → Inner done[0] → Rate Limit Delay → back to Outer Loop
  → Outer done[0] → Limit 1 → Final Aggregate
```

**连线陷阱**：内部循环的 done[0] 必须连接回外部循环的输入，而不是聚合节点。外部循环的 done[0] 连接到最终聚合节点。

### API 分页

对于不支持多 ID 筛选的 API，使用 `id_from` + 日期窗口进行高效分页：

```
Schedule → Set Date Window → Fetch Page → Process
  → IF has more? → [true] Update id_from → Fetch Page (loop)
                  → [false] → Aggregate → Output
```

### 试运行 / 验证容错

当测试时禁用 API 写入节点（用于试运行），下游验证节点接收到的是请求体，而不是响应。应使验证具有容错能力：

```javascript
// In verification Code node
const body = $input.first().json;
const looksLikeRequest = body.method && body.parameters && !body.status;
if (looksLikeRequest) {
  return [{ json: { status: 'SKIPPED', message: 'Upstream disabled for testing' }}];
}
// Normal response verification below...
```

---

## 热路径性能

当工作流处理**数千个项目**且 I/O 很少时，其速度取决于 n8n 跨越逐项目 / 逐迭代边界的次数——每次跨越都会建立执行上下文并复制项目。以下四种架构选择起决定性作用：

1. **相比冗长的转换链，优先使用数量更少、处理内容更多的 All-Items 节点。** 每次节点→节点跳转都会重新复制所有项目（每次跳转约为 0.05 ms/item），因此，六个串联的 Code/Set 节点执行相同步骤时，成本约为单个 All-Items Code 节点的 7 倍。应整合热路径。
2. **使用 Code 的 "Run Once for All Items"，不要使用 "Each Item"**——约为 0.02 ms/item，而后者约为 0.6 ms/item（约 25–30 倍）。由多个 *Each-Item* Code 节点组成的链是最糟糕的情况；逐项目开销会随着节点数量成倍增加。
3. **在 SplitInBatches 循环中最大化 batchSize**（参见上面的批处理模式）——成本来自迭代次数。
4. **不要对表达式进行微优化**——复杂度不产生额外成本；真正需要付出成本的是节点数和迭代次数。

**但应先进行性能分析。** 大多数生产工作流都受 I/O 限制——串行 HTTP / DB / Sheets 调用（每次耗时数百毫秒）会让上述所有因素都显得微不足道。这些规则适用于转换工作构成性能下限的情况，或者反模式（Each-Item Code、batchSize 1、冗长的逐项目链）将廉价操作变成缓慢操作的情况。项目数量低于几百时，这些因素都无关紧要。**n8n Code JavaScript** 技能中提供了完整的实测模型。

---

## 特定集成的注意事项

### Google Sheets

- 对包含公式列的工作表，**绝不要使用 `append`**——它会破坏公式。应通过带有 `googleApi` 凭据的 HTTP Request 节点，使用 Google Sheets API `values.update` (PUT)
- 对依赖公式的列，**应写入数字，而不是字符串**——字符串 "4.98" 会破坏 `ADD()` 公式。应在 Code 节点中使用 `parseFloat()`
- **逐项目执行陷阱**：Google Sheets 节点会为每个输入项目执行一次。如果需要执行单次批量写入，应先在 Code 节点中将项目聚合为一个项目
- **UNFORMATTED_VALUE 返回数字**，而不是 "N/A" 之类的文本——应在 Code 节点中显式筛选

### Google Drive

- **`convertToGoogleDocument: true` 会创建 Google Doc（文本）**，而不是 Google Sheet——要上传供下载的 CSV，请完全省略此选项
- **CSV 下载链接格式**：`https://drive.google.com/uc?id={fileId}&export=download`——应使用此格式，而不是 `/view` 链接

### 双向阈值检查

比较数值（价格、数量、指标）时，始终检查两个方向：

```javascript
// ❌ Only catches increases
if (diff > threshold) { flag(); }

// ✅ Catches both spikes AND crashes — both are data-quality signals
if (Math.abs(diff) > threshold) { flag(); }
```

---

## 常见陷阱

### 1. Webhook 数据结构
**问题**：无法访问 Webhook 负载数据

**解决方案**：数据嵌套在 `$json.body` 下
```javascript
❌ {{$json.email}}
✅ {{$json.body.email}}
```
参见：n8n Expression Syntax 技能

### 2. 多个输入项
**问题**：节点会处理所有输入项，但我只想处理一个

**解决方案**：使用“Execute Once”模式，或仅处理第一项
```javascript
{{$json[0].field}}  // First item only
```

### 3. 身份验证问题
**问题**：API 调用失败，返回 401/403

**解决方案**：
- 正确配置凭据
- 使用“Credentials”部分，而不是参数
- 在激活工作流之前测试凭据

### 4. 节点执行顺序
**问题**：节点以意外的顺序执行

**解决方案**：检查工作流设置 → 执行顺序
- v0：从上到下（旧版）
- v1：基于连接（推荐）

### 5. 表达式错误
**问题**：表达式显示为纯文本

**解决方案**：使用 {{}} 包裹表达式
- 有关详细信息，请参阅 n8n Expression Syntax 技能

---

## 与其他技能集成

这些技能可与 Workflow Patterns 配合使用：

**n8n MCP Tools Expert** - 用于：
- 查找适合你的模式的节点（search_nodes）
- 了解节点操作（get_node）
- 创建工作流（n8n_create_workflow）
- 部署模板（n8n_deploy_template）
- 使用 `tools_documentation({topic: "ai_agents_guide", depth: "full"})` 获取 AI 模式指导
- 使用 `n8n_manage_datatable` 管理数据表
- 使用 `n8n_manage_folders` 将工作流整理到文件夹中

**n8n Expression Syntax** - 用于：
- 在转换节点中编写表达式
- 正确访问 Webhook 数据（{{$json.body.field}}）
- 引用之前的节点（{{$node["Node Name"].json.field}}）

**n8n Node Configuration** - 用于：
- 为模式节点配置特定操作
- 了解节点特定要求

**n8n Validation Expert** - 用于：
- 验证工作流结构
- 修复验证错误
- 确保工作流在部署前正确无误

---

## 模式统计数据

常见工作流模式：

**最常见的触发器**：
1. Webhook - 35%
2. 定时计划（周期性任务）- 28%
3. 手动（测试/管理）- 22%
4. 服务触发器（Slack、电子邮件等）- 15%

**最常见的转换**：
1. Set（字段映射）- 68%
2. Code（自定义逻辑）- 42%
3. IF（条件路由）- 38%
4. Switch（多条件）- 18%

**最常见的输出**：
1. HTTP Request（API）- 45%
2. Slack - 32%
3. 数据库写入 - 28%
4. 电子邮件 - 24%

**平均工作流复杂度**：
- 简单（3-5 个节点）：42%
- 中等（6-10 个节点）：38%
- 复杂（11+ 个节点）：20%

---

## 快速入门示例

### 示例 1：简单的 Webhook → Slack
```
1. Webhook (path: "form-submit", POST)
2. Set (map form fields)
3. Slack (post message to #notifications)
```

### 示例 2：定时报告
```
1. Schedule (daily at 9 AM)
2. HTTP Request (fetch analytics)
3. Code (aggregate data)
4. Email (send formatted report)
5. Error Trigger → Slack (notify on failure)
```

### 示例 3：数据库同步
```
1. Schedule (every 15 minutes)
2. Postgres (query new records)
3. IF (check if records exist)
4. MySQL (insert records)
5. Postgres (update sync timestamp)
```

### 示例 4：AI 助手
```
1. Webhook (receive chat message)
2. AI Agent
   ├─ OpenAI Chat Model (ai_languageModel)
   ├─ HTTP Request Tool (ai_tool)
   ├─ Database Tool (ai_tool)
   └─ Window Buffer Memory (ai_memory)
3. Webhook Response (send AI reply)
```

### 示例 5：API 集成
```
1. Manual Trigger (for testing)
2. HTTP Request (GET /api/users)
3. Split In Batches (process 100 at a time)
4. Set (transform user data)
5. Postgres (upsert users)
6. Loop (back to step 3 until done)
```

---

## 详细模式文件

有关每种模式的完整指南：

- **[webhook_processing.md](webhook_processing.md)** - Webhook 模式、数据结构、响应处理
- **[http_api_integration.md](http_api_integration.md)** - REST API、身份验证、分页、重试
- **[database_operations.md](database_operations.md)** - 查询、同步、事务、批处理
- **[ai_agent_workflow.md](ai_agent_workflow.md)** - AI 智能体、工具、记忆、langchain 节点
- **[scheduled_tasks.md](scheduled_tasks.md)** - Cron 调度、报告、维护任务

---

## 真实模板示例

来自 n8n 模板库：

**模板 #2947**：天气信息发送到 Slack
- 模式：定时任务
- 节点：Schedule → HTTP Request（天气 API）→ Set → Slack
- 复杂度：简单（4 个节点）

**Webhook 处理**：最常见的模式
- 最常见用途：表单提交、支付 Webhook、聊天集成

**HTTP API**：常见模式
- 最常见用途：数据获取、第三方集成

**数据库操作**：常见模式
- 最常见用途：ETL、数据同步、备份工作流

**AI 智能体**：使用量不断增长
- 最常见用途：聊天机器人、内容生成、数据分析

使用 n8n-mcp 工具中的 `search_templates` 和 `get_template` 查找示例！

---

## 最佳实践

### ✅ 应该做

- 从能够解决问题的最简单模式开始
- 在构建之前规划工作流结构
- 为所有工作流添加错误处理
- 激活前使用示例数据进行测试
- 遵循工作流创建检查清单
- 使用描述性节点名称
- 为复杂工作流编写文档（notes 字段）
- 部署后监控工作流执行情况

### ❌ 不要做

- 一次性构建完整工作流（要迭代！每次编辑的平均间隔为 56 秒）
- 激活前跳过验证
- 忽略错误场景
- 在简单模式足够时使用复杂模式
- 在参数中硬编码凭据
- 忘记处理空数据情况
- 在没有明确边界的情况下混合多种模式
- 未经测试就部署

---

## 总结

**要点**：
1. **6 种核心模式**覆盖 90% 以上的工作流用例
2. **Webhook 处理**是最常见的模式
3. 每个工作流都应使用**工作流创建检查清单**
4. **规划模式** → **选择节点** → **构建** → **验证** → **部署**
5. 与其他技能集成，以完成完整的工作流开发

**后续步骤**：
1. 确定你的用例模式
2. 阅读详细的模式文件
3. 使用 n8n MCP 工具专家查找节点
4. 遵循工作流创建检查清单
5. 使用 n8n 验证专家进行验证

**相关技能**：
- n8n MCP 工具专家 - 查找和配置节点
- n8n 表达式语法 - 正确编写表达式
- n8n 验证专家 - 验证并修复错误
- n8n 节点配置 - 配置特定操作