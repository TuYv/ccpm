---
name: sync
description: Scaffold a new sync capability with guided setup — asks about data source, mode, pagination, and cursor design, then generates working code
user-invocable: true
disable-model-invocation: true
allowed-tools: ["Read", "Edit", "Write", "Bash", "Glob", "Grep", "Agent"]
---
## 说明

你正在帮助用户为其 Notion Worker 创建新的同步功能。逐步引导用户，在每个步骤中提出问题并给出建议。最后生成可正常运行的代码。

开始之前，请阅读以下参考文件以了解同步模式：

- `.agents/skills/sync-guide/SKILL.md` — 概念、模式、范式和常见错误
- `.agents/skills/sync-guide/api-pagination-patterns.md` — 真实场景中的 API 策略
- `.agents/skills/sync-guide/examples/` — 可正常运行的代码模板

还需阅读当前的 `src/index.ts`，以了解现有内容。

### 第 1 步：了解数据源

询问用户：

- 你要同步什么数据？（例如，“Jira 问题”“Stripe 客户”“ServiceNow 工单”）

如果用户提到一个知名 API，请查找其分页机制和变更跟踪能力（是否有 `updated_at`？是否有事件端点？是否采用基于游标的分页？）。

### 第 2 步：确定合适的架构

根据你对数据源的了解，推荐以下两种架构之一：

#### 简单替换同步

适用场景：数据源较小（少于 1,000 条记录），或者 API 不支持变更跟踪
（没有 `updated_at`，也没有事件流）。

使用一个同步，以替换模式运行。每个周期都会重新获取所有数据。运行时会
自动删除已从数据源中消失的记录。这是最简单的方案。

#### 回填 + 增量同步组合

适用场景：API 支持变更跟踪（`updated_at`、事件或变更日志）——
这涵盖了大多数企业级 API（Salesforce、Stripe、Linear、GitHub、HubSpot）。

使用两个独立的同步，并写入**同一个数据库**：

- **回填同步**（替换模式，`schedule: "manual"`）：对完整数据集进行分页获取。
  需要完整重新导入时，通过 CLI 手动触发。替换模式的标记清除机制会自动
  清理已从数据源中删除的记录。
- **增量同步**（增量模式，`schedule: "5m"` 或类似设置）：仅获取最近发生
  变更的记录。通过定时任务运行，以实现低延迟更新。

与单个双模式同步相比，其优势包括：

- 状态中无需区分阶段——每个同步都具有简单、明确的状态
- 无需实现从回填到增量的转换逻辑
- 回填和增量同步彼此独立——可随时重新回填，而不会中断增量同步
- 更容易理解和调试

**决定架构的是变更跟踪能力，而不是数据集大小。** 一个 Linear 工作区
可能只有几千个问题，但其 API 支持增量同步所需的查询，因此回填 + 增量
同步是正确选择。相反，一个列出本地匹克球场地的网站，无论有多少条记录，
都没有 `updated_since` 端点。

推荐一种架构并给出简要说明。如果用户不同意，允许其选择其他方案。

### 第 3 步：设计 Schema

根据 API 的响应结构提出一个 Schema。查找 API 返回的字段，并将最有用的
字段映射到 Schema 类型。不要要求用户逐一列举字段——应提出合理的默认方案，
再让用户进行调整。

例如，如果要同步 Jira 问题，可建议：

```ts
const issuesDb = worker.database("issuesDb", {
  type: "managed",
  initialTitle: "Jira Issues",
  primaryKeyProperty: "Issue Key",
  schema: {
    properties: {
      "Issue Key": Schema.richText(), // primaryKeyProperty — the unique ID
      Summary: Schema.title(), // the main display field
      Status: Schema.select([
        { name: "To Do" },
        { name: "In Progress", color: "yellow" },
        { name: "Done", color: "green" },
      ]), // mapped from Jira statuses
      Assignee: Schema.richText(), // or Schema.people() if email available
      Updated: Schema.date(),
    },
  },
})
```

指南：

- 使用 `worker.database()` 声明数据库，并在 `worker.sync()` 中引用该句柄
- 每个架构都必须有且仅有一个 `Schema.title()`——选择描述性最强的字段
- 对主键属性（唯一 ID）使用 `Schema.richText()`
- 将属性顺序视为产品设计，而不是 API 顺序。将标题放在首位，
  然后依次放置最有助于最终用户识别、评估记录或对记录采取行动的五个属性。
- 不要将不透明 ID、同步键、仅用于游标的时间戳以及其他
  实现元数据放在前六个属性中。只有当用户确实依赖面向用户的
  标识符（例如订单号或问题键）时，才将其放在靠前的位置。
- 在数据类型适用时，使用 `Schema.url()`、`Schema.email()`、`Schema.date()`、`Schema.number()`、
  `Schema.checkbox()`、`Schema.select()`
- 对与另一个托管数据库的关系使用 `Schema.relation("otherDatabaseKey")`
- 从 10-20 个属性开始——可以慷慨一些，包含 API 中大多数有用的字段
- 完整类型列表请参阅 `.agents/skills/sync-guide/SKILL.md` 中的“架构参考”

向用户展示建议的架构，并在生成代码之前询问他们是否想要添加、删除
或更改任何字段。

### 第 4 步：设计状态机

研究 API 以确定其分页和变更跟踪机制。
不要向用户询问分页细节——请根据 API 文档、
你对该 API 的了解或通过查找 API 资料自行确定。用户不应该需要
知道其 API 使用的是不透明游标还是页码。

你需要确定：

1. **API 如何对列表结果进行分页**（不透明游标、页码、偏移量、键集）
2. **API 是否具有变更跟踪机制**（updated_at 字段、事件端点、变更日志）
3. **API 是否具有删除信号**（归档筛选器、审计日志、删除事件）

然后据此设计状态：

**对于简单的替换同步：** 状态仅用于单次周期内的分页。

- 不透明游标：`{ cursor: string | null }`
- 页码：`{ page: number }`

**对于回填 + 增量同步组合：** 每个同步都有自己独立的简单状态——无需
使用双模式可辨识联合类型。

- **回填状态：** 仅包含用于遍历完整数据集的分页游标。
  具体取决于 API 如何对其列表端点进行分页：
  - 不透明游标：`{ cursor: string | null }`
  - 页码：`{ page: number }`
  - 键集：`{ cursorTimestamp: string | null; cursorId: string | null }`

- **增量状态：** 用于获取近期变更的变更跟踪游标。
  具体取决于 API 如何公开变更：
  - 不透明游标（API 按 updated_at 排序）：`{ cursor: string | null }`
  - 时间戳键集：`{ cursorTimestamp: string; cursorId: string }`
  - 事件 ID：`{ eventCursor: string }`

**一致性缓冲区（仅适用于增量同步）：** 在增量模式下，游标
永远不会重置，因此如果游标越过了一条尚未被索引的记录，
该记录就会永久丢失。应用一致性缓冲区：游标推进后与“当前时间”
之间始终至少保留 10-15 秒的间隔。对于具有最终一致性的 API
（Stripe、Salesforce 等），这一点尤其重要。

**删除处理：**
需要考虑三种情况：

1. **API 支持增量删除**（例如，具有 `*.deleted` 类型的 Stripe 事件，
   或在变更源中返回 `deleted: true` 的 API）：在增量同步中发出
   `{ type: "delete", key }`。这是最简洁的方法。
2. 对于该用例，**删除操作很少见或无关紧要**：无需采取任何操作。
   过期记录会保留在 Notion 中，但不会造成问题。
3. **删除操作很重要，但 API 没有删除信号**：回填同步的
   替换模式会自动处理这种情况——其标记清除机制会删除在整个周期中
   未出现的所有记录。定期触发回填，以清理过期记录。

如果 API 完全没有变更跟踪机制，请返回上一步，并建议改用简单的
替换同步。

向用户简要概述你的状态设计（例如，“此 API 使用
基于游标的分页并具有 `updated_at` 字段，因此我将使用
回填与增量同步组合：回填使用不透明游标，增量使用时间戳键集”）。在生成代码之前，
让他们确认或调整该设计。

### 第 5 步：设置身份验证

在生成代码之前，确定 API 所需的身份验证方式并完成设置，以便
你可以在本地进行测试。

有两种模式：

**模式 A：静态 API 令牌/密钥**
适用于用户拥有个人令牌或 API 密钥的 API（例如 Jira API 令牌、
GitHub PAT、简单 API 密钥）。

当令牌仅用于向已知域名发出的请求标头时，优先使用代理凭据。按照 `.agents/skills/auth-guide/SKILL.md`
中的说明，通过 `worker.credential()` 声明该凭据。

如果工作器需要明文令牌——例如用于签名或请求
正文——请告诉用户需要哪些变量，并让他们自行将值
直接添加到 `.env`。切勿要求他们在聊天中发送这些值：

```
JIRA_API_TOKEN=...
JIRA_EMAIL=user@example.com
```

如果 `.env` 不存在，请创建它。本地执行期间（使用 `--local` 标志），
会自动加载 `.env` 文件。

**模式 B：OAuth**
适用于需要 OAuth 的 API（例如 Google、Salesforce、HubSpot）。这包括
两个部分：

1. **客户端凭据**——OAuth 应用的客户端 ID 和密钥。它们应放在 `.env` 中：

   ```
   MY_OAUTH_CLIENT_ID=...
   MY_OAUTH_CLIENT_SECRET=...
   ```

2. **用户令牌**——部署后通过 OAuth 流程获取。运行时会通过
   `worker.oauth()` 和 `.accessToken()` 自动处理此令牌。

对于 OAuth 同步，你需要在生成的代码中添加 `worker.oauth()` 调用。
始终使用 `UserManagedOAuthConfiguration`（包含显式端点和
客户端凭据的结构），不要使用 `{ provider: "..." }` 简写，因为
由 Notion 管理的 OAuth 仍处于 alpha 阶段，用户很可能没有访问权限。

```ts
const myAuth = worker.oauth("myAuth", {
  name: "my-provider",
  authorizationEndpoint: "https://provider.example.com/oauth/authorize",
  tokenEndpoint: "https://provider.example.com/oauth/token",
  scope: "read write",
  clientId: process.env.MY_OAUTH_CLIENT_ID ?? "",
  clientSecret: process.env.MY_OAUTH_CLIENT_SECRET ?? "",
})
```

然后，在 execute 函数中使用 `await myAuth.accessToken()`，而不是从 `process.env` 读取静态令牌。

注意：OAuth 流程本身需要已部署的 worker，但在首次授权完成且 `ntn workers env pull` 将访问令牌复制到 `.env` 后，即可在本地执行。在完成此引导过程之前，由于缺少本地令牌，`.accessToken()` 会失败。请前往步骤 8 完成初始授权。

### 步骤 6：生成代码

将同步逻辑写入 `src/index.ts`。以 `.agents/skills/sync-guide/examples/` 中最接近的示例作为起点：

- `replace-simple.ts` — 静态数据，无 API
- `replace-paginated.ts` — 分页替换模式（也用于回填同步）
- `incremental-basic.ts` — 使用不透明游标的增量同步
- `incremental-bimodal.ts` — 完整回填 + 增量配对示例
- `incremental-events.ts` — 使用事件源的增量同步

生成的代码中应包含：

- 正确的导入（`Worker`、`Builder`、`Schema`）
- 通过 `worker.database()` 声明数据库，并指定 schema 和 `primaryKeyProperty`
- 通过 `worker.pacer()` 为上游 API 配置速率调节器，并在每次 API 请求前调用 `await pacer.wait()`
- 状态类型——使用简单类型，每个同步一个（无需可辨识联合类型）
- 引用数据库句柄的 `worker.sync()` 调用
- 对于回填 + 增量：两个同步以同一个数据库为目标；回填同步使用 `schedule: "manual"`，增量同步使用定时计划
- 为增量同步设置一致性缓冲区（如果 API 是最终一致的）
- 使用行内注释说明每项设计选择的_原因_
- 使用 `fetch` 发起 API 调用，并通过代理凭据或 `process.env` 获取身份验证信息

**代码生成检查清单：**

- [ ] 使用 `worker.database()` 声明数据库，并通过句柄引用
- [ ] 使用 `worker.pacer()` 为上游 API 声明速率调节器
- [ ] 每次通过 `fetch` 请求上游 API 前均调用 `await pacer.wait()`
- [ ] 状态类型保持简单（不使用双模可辨识联合类型）
- [ ] 回填同步使用 `mode: "replace"` 和 `schedule: "manual"`（如适用）
- [ ] 增量同步使用 `mode: "incremental"` 和定时计划（如适用）
- [ ] 对增量游标的推进应用一致性缓冲区（如适用）
- [ ] 删除处理与步骤 4 中的三种情况之一相匹配

### 步骤 7：本地测试

在部署前测试同步。这可以尽早发现错误，而无需经历部署周期。

**对于使用静态 API 令牌的同步（模式 A）：**

代理凭据必须在步骤 8 部署后进行测试。对于从 `process.env` 读取的令牌，请在本地测试：

1. 运行 `npm run check`，验证 TypeScript 类型是否可以编译。修复所有错误。

2. 运行 `ntn workers exec <key> --local`，在本地执行同步。
   这会在你的计算机上运行 execute 函数，并加载 `.env`。
   - 检查：是否返回数据？各属性是否正确填充？
   - 检查：`hasMore` 是否合理？游标是否推进？

3. 如果返回 `hasMore: true`，请测试下一页：
   `ntn workers exec <key> --local -d '<nextState from previous output>'`

4. 如果出现错误（身份验证失败、字段映射错误、崩溃）：
   修复代码并重新运行——无需部署，迭代速度很快。

5. 对于回填与增量同步组合，请分别测试每个同步：
   - 测试回填同步：`ntn workers exec <backfillKey> --local`
   - 测试增量同步：`ntn workers exec <deltaKey> --local`
   - 验证二者均返回格式正确且包含正确属性的数据。

6. 编写一个测试文件（`test.ts`）来运行同步。直接导入 worker
   并调用其 `.run()` 方法。

   如果用户在 `.env` 中配置了 API 凭据，请编写调用真实
   API 的测试——这是最有价值的测试，因为它能够针对真实服务验证实际的字段
   映射、分页行为和身份验证。如果没有可用的凭据，则改为模拟 HTTP 调用。

   **集成测试（有可用凭据时首选）：**

   ```ts
   import "dotenv/config" // load .env
   import worker from "./src/index.ts"
   import assert from "node:assert"

   async function test() {
     // First page (backfill start, no prior state)
     const page1 = await worker.run("mySync", undefined, {
       concreteOutput: true,
     })
     console.log(
       `Page 1: ${page1.changes.length} records, hasMore: ${page1.hasMore}`
     )
     assert(page1.changes.length > 0, "Should return records")

     // Verify fields are populated
     const first = page1.changes[0]
     assert(first.key, "Record should have a key")
     console.log("Sample record:", JSON.stringify(first, null, 2))

     // Test pagination
     if (page1.hasMore) {
       const page2 = await worker.run("mySync", page1.nextState, {
         concreteOutput: true,
       })
       console.log(
         `Page 2: ${page2.changes.length} records, hasMore: ${page2.hasMore}`
       )
       assert(page2.changes.length > 0, "Second page should return records")
     }

     console.log("All tests passed!")
   }

   test().catch((err) => {
     console.error(err)
     process.exit(1)
   })
   ```

   使用 `npx tsx test.ts` 运行。根据具体同步进行调整：使用实际的
   capability key，添加对特定字段值的断言，验证回填与增量同步组合中的
   回填同步和增量同步等。

**对于使用 OAuth 的同步（模式 B）：**
首次授权之前，本地执行无法工作，因为
`.accessToken()` 需要已完成的 OAuth 流程所生成的令牌。部署、
完成该流程并运行 `ntn workers env pull` 后，本地执行即可工作。
你始终可以运行 `npm run check` 进行类型验证。

### 第 8 步：使用预览进行部署和验证

本地测试通过后（OAuth 同步则可立即进行），部署并远程测试。

如果部署时需要使用密钥（例如，在 capability 注册期间从
`process.env` 读取 OAuth `clientSecret`），请先创建 worker 并推送
密钥：

1. `ntn workers create --name <name>`——创建 worker，但不进行部署
2. `ntn workers env push`——将 `.env` 密钥推送到远程
3. `ntn workers deploy`——现在在密钥可用的情况下进行部署

否则，可采用更简单的流程：

1. `ntn workers deploy` — 构建并发布
2. `ntn workers env push` — 将 `.env` 中的密钥推送到远程环境

3. 然后，如果同步使用 OAuth，请在预览前完成 OAuth 流程。
   **重要：** 必须先执行 `env push`，再执行 `oauth start`——已部署的 worker 需要使用客户端密钥将授权码交换为令牌。
   - `ntn workers oauth show-redirect-url` — 获取重定向 URL
   - 告知用户在其 OAuth 提供商的应用设置中配置此 URL
   - `ntn workers oauth start <oauthKey>` — 打开浏览器以完成 OAuth 流程

4. `ntn workers sync trigger <syncKey> --preview` — 在远程执行，但不写入 Notion
   - 检查输出：记录数量、属性值、hasMore 状态
   - 如果 `hasMore: true`，则继续执行：`ntn workers sync trigger <syncKey> --preview --context '<nextState>'`
5. 如果预览显示存在问题，请修复代码并重新部署（返回步骤 1）

对于回填+增量同步对，请预览这两个同步：

- `ntn workers sync trigger <backfillKey> --preview`
- `ntn workers sync trigger <deltaKey> --preview`

### 步骤 9：上线

预览结果正常后：

1. `ntn workers sync trigger <key>` — 触发一次真实同步
2. `ntn workers sync status` — 检查同步是否正在运行并持续推进
3. `ntn workers runs list`，然后执行 `ntn workers runs logs <runId>` — 检查是否有错误
4. 再次运行 `ntn workers sync status` 以确认进度（记录数量持续增加，且没有错误）

对于回填+增量同步对，请先初始化增量游标，再加载所有数据，
这样便不会遗漏回填期间发生的更改：

1. `ntn workers sync trigger <deltaKey>` — 初始化增量游标
2. `ntn workers sync trigger <backfillKey>` — 开始加载完整数据集
3. 使用 `ntn workers sync status` 进行监控，直到回填完成
4. 增量同步将按照其配置的计划自动继续运行

告知用户：在开始回填之前初始化增量游标。回填所需时间可能较长，
具体取决于数据集大小。用户应定期运行 `ntn workers sync status`
来监控进度，直到初始回填完成。之后，增量同步会按照其配置的
计划自动运行。若要稍后重新执行回填：
`ntn workers sync state reset <backfillKey> && ntn workers sync trigger <backfillKey>`