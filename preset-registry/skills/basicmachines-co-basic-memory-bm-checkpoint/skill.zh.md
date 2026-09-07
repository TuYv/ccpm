---
name: bm-checkpoint
description: Create an immutable Codex handoff in Basic Memory and return an exact bm-orient resume command.
---
# Codex 检查点工作

为当前的 Codex 工作创建一份持久、不可变的交接记录。当用户要求创建检查点、收尾、交接、记住工作状态，或压缩后的 SessionStart 上下文要求进行有意的交接时，使用此功能。

## 收集

读取 `~/.codex/basic-memory.json`，然后读取最近的项目
`.codex/basic-memory.json`；项目级键覆盖用户级键：

- `primaryProject`，默认省略
- `captureFolder`，默认为 `codex/<git top-level directory name>`
- `placementConventions`，可选
- `sessionProfile`，默认为 `general`
- 当 `sessionProfile` 为 `coding` 时，必须提供 `repository`

起草记录前应用 `bm-writing` 技能。

收集仓库证据：

- 启动该线程的原始目标及其重要性
- 最新的用户意图，包括取代原始目标的更正或范围变更
- 采用的方法及其解决问题的原因
- 当前系统状态及实际影响
- 权衡、需要特别注意的问题、有用的简化措施，以及有意搁置的工作
- `git status --short`
- 当前分支
- 仓库根目录和当前工作目录
- 当前 Git SHA
- 当前拉取请求的编号、标题、URL、状态、基础分支和头分支（如果存在）
- 你修改过的文件
- 实际运行的测试或检查
- 失败或跳过的检查
- 本线程中作出的决定
- 未解决的阻塞因素
- 下一步操作
- 当前用户名、主机名和时间戳
- 检查点请求中由主机提供的 `session_id`、`agent`、`codex_turn_id`、`trigger` 和 `model` 值（如果存在）

对仓库和拉取请求状态使用直接的只读证据。除非你实际运行了测试或用户提供了测试结果，否则不要声称测试通过。将主机提供的会话元数据视为不透明的身份数据。保留非空值的精确内容；绝不要推断或改写这些值。对于仅提供 `codex_session_id` 的旧请求，使用该确切值作为 `session_id`，并设置 `agent: codex`。新检查点中不要输出旧字段。

## 写入

检查点是持久的交接记录，而不是状态转储或逐次提交的变更日志。为稍后返回的人员或代理讲述完整情况。将其视为带有权威工件指针的快照，而不是任务、决定、计划、问题、拉取请求、提交、差异、已签入文档或源文件的替代品。

每次调用都会创建一个新的检查点。即使主题相同，也绝不要编辑、替换或追加到较早的检查点。

使用以下标题：

`Codex checkpoint - <UTC YYYY-MM-DDTHH-MM-SSZ> - <short topic>`

UTC 时间戳是不可变检查点标识的一部分，并可避免文件名不安全的冒号。如果 `write_note` 报告标题冲突，则使用尽可能小的数字后缀重试，例如 ` - 2`。绝不要通过修改现有记录来解决冲突。

每次尝试都使用 `project=<configured primaryProject>`、`overwrite=False` 和 `output_format="json"` 调用 `write_note`。当省略 `primaryProject` 时，不设置 project 参数，让 Basic Memory 使用其默认项目。frontmatter 中的 `project` 字段是描述性元数据，不能替代工具的 project 参数。即使用户的 `write_note_overwrite_default` 设置为 true，也必须以显式的不可覆盖标志为准。只有 `action: created` 的成功结果才可接受；将 `action: conflict` 或 `NOTE_ALREADY_EXISTS` 视为上述标题冲突，并停止处理任何其他操作或错误。

向 Basic Memory 写入一条笔记。对于 `general` 配置：

- `title`：上方带时间戳的检查点标题
- `directory`：配置的 `captureFolder`
- `tags`：`["codex", "checkpoint"]`
- frontmatter：
  - `type: codex_session`
  - `status: open`
  - `project: <primaryProject if known>`
  - `cwd: <current cwd>`
  - `started: <current timestamp>`
  - `username: <current username>`
  - `hostname: <current hostname>`
  - `capture: deliberate`
  - `agent: codex`
  - `session_id: <host-provided Codex session id>`，如果已提供
  - `codex_turn_id: <host-provided Codex turn id>`，如果已提供
  - `trigger: <host-provided checkpoint trigger>`，如果已提供
  - `model: <host-provided model slug>`，如果已提供

对于 `coding` 配置，写入 `type: coding_session`，并使用相同的通用
frontmatter，以及以下架构要求的字段：

- `repository: <confirmed stable repository identifier>`
- `repo_root: <git rev-parse --show-toplevel>`
- `cwd: <current cwd>`
- `branch: <git rev-parse --abbrev-ref HEAD>`
- `git_sha: <git rev-parse HEAD>`

当前分支存在 pull request 时，还要添加类型化的可选字段
`pull_request_number`、`pull_request_title`、`pull_request_url`、
`pull_request_state`、`pull_request_base` 和 `pull_request_head`。通过只读的
GitHub 查询解析 pull request；不存在 PR 时省略这些字段。
将编号写成带引号的字符串，例如 `pull_request_number: "123"`，
以便跨存储后端的精确元数据查询保持一致。
绝不能仅根据对话文本推断或复制 repository/PR 身份。如果无法证明
coding 所需字段，则停止。

### 链接来自同一聊天的检查点

当 `session_id` 可用时，将其与 `agent: codex` 配对以标识同一聊天：

1. 写入前，在配置的 `primaryProject` 中搜索同时包含
   `codex_session` 和 `coding_session` 的笔记，使用
   `metadata_filters={"agent": "codex", "session_id": "<exact host-provided id>"}`。
   同时使用
   `metadata_filters={"codex_session_id": "<exact host-provided id>"}`
   搜索旧版笔记。
2. 翻阅两组搜索结果，去重，并根据有效的 `started` 时间戳选择最早于当前检查点的最新检查点。
   直接从 `primaryProject` 读取它。确认准确的 `agent`/`session_id` 对，
   或者在共享身份缺失时确认准确的旧版 `codex_session_id`。
   拒绝存在冲突的 agent/session 字段；单独的 session ID 永远不能作为跨 agent 身份。
3. 在 `## Relations` 下添加
   `- continues [[Exact previous checkpoint title]]`。

不要编辑之前不可变的检查点来添加正向边；Basic
Memory 的反向链接会使链条在两个方向上都可导航。如果没有经过验证的较早匹配，则省略谱系关系。
绝不能仅根据 repository、branch、topic、时间戳或生命周期封装笔记推断同一聊天的谱系。

正文以 `# <exact note title>` 开始。

使用以下各节；没有价值的可选节应省略：

- `## Summary`：一句具体的句子，不得只是重复标题
- `## Story`：原始目标 -> 最新用户意图 -> 方法 -> 当前
  状态及影响，使用实质性 prose
- `## Working State`：将持久状态与机器本地或易失状态分开
- `## Changed Files`，路径对恢复工作有用时使用
- `## Verification`：记录实际运行的检查及其结果
- `## References`：记录已验证的 repository、commit、pull-request、issue、spec
  或文档链接
- `## Observations`
- `## Relations`，当线程存在明显的图谱目标时使用

优先在正文中使用相对于仓库的路径。必需的绝对路径 `repo_root` 和
`cwd` 前置元数据仍然是机器本地证据。对于恢复工作时有影响的脏文件或未跟踪文件、
被忽略的文件、活动进程、开发服务器、临时目录和本地工具缓存，应将其标记为机器本地或易变状态。
不要将它们呈现为持久的项目状态。

让笔记以指针为先：

- 指出权威构件，并包含其稳定标识符或链接
- 仅总结理解每个指针为何重要所需的上下文
- 对于已有的图谱笔记，使用关系；对于图谱之外的构件，使用普通链接或仓库路径
- 不要将大型计划、差异、日志或源文件复制到检查点中

对于由 GitHub 支持的仓库工作，使用只读 GitHub 查询解析规范仓库 URL。在 `## References` 下以及正文中相关位置，将当前仓库、当前已推送提交、拉取请求，以及任何实质相关的 GitHub issue 或提交呈现为 Markdown 链接。对于拉取请求和 issue，使用 GitHub 返回的规范 URL。在链接提交之前，验证 GitHub 能够在已确认的仓库中解析该 SHA。如果提交是本地提交或尚未推送，请将 SHA 保持为代码，标记为本地或未推送，并且不要构造可能不存在的 GitHub 链接。不要在未证明其所属仓库的情况下，将含义不明确的裸 issue 编号或 SHA 转换为链接。

使用观察结果为结构化回忆提炼持久事实，而不是复制每一句叙述：

- `[result]` 用于具体结果
- `[decision]` 用于每个已做出或保留的决定
- `[blocker]` 用于每个尚未解决的阻塞项
- `[next_step]` 用于唯一的主要下一步操作；必须且只能包含一个
- `[verification]` 或 `[changed_file]` 仅在该条目本身是重要的项目记忆，而不只是辅助细节时使用

不要使用普通项目符号创建单独的 Decisions、Blockers 或 Next Action 部分。省略空类别，不要写诸如
"None." 的占位文本。

关系不是观察结果。将其放在 `## Relations` 下，并使用 Basic
Memory 关系语法，例如 `- relates_to [[Exact existing note title]]`。
绝不要写 `[relates_to]` 或将裸 `memory://` URL 作为观察结果。仅当其目标是现有的检查点、任务、决定、规范、issue 或 PR 笔记时，才添加关系。同一聊天中已验证的 `continues` 边是检查点谱系关系；不要再向同一目标添加第二个通用关系。

## 确认

回复：

1. 用一句话总结检查点保留的内容
2. 从成功的 JSON 结果中选择的确切恢复标识符
3. 唯一的主要下一步操作
4. 最后一个代码块必须且只能是一个恢复命令：

```text
$bm-orient "<exact returned resume identifier>"
```

按以下顺序选择返回值中的第一个非空值：`permalink`、
`file_path`，然后是 `title`。逐字使用返回值；绝不要构造或猜测 permalink 或文件路径。