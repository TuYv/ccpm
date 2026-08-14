---
name: bm-checkpoint
description: Create an immutable Codex handoff in Basic Memory and return an exact bm-orient resume command.
---
# 为 Codex 工作创建检查点

为当前 Codex 工作创建一份持久、不可变的交接记录。当用户要求创建检查点、收尾、交接、记住工作状态，或压缩后的 SessionStart 上下文要求进行明确交接时，请使用此技能。

## 收集

读取 `~/.codex/basic-memory.json`，然后读取距离当前项目最近的 `.codex/basic-memory.json`；项目配置项覆盖用户配置项：

- `primaryProject`，默认省略
- `captureFolder`，默认为 `codex/<git top-level directory name>`
- `placementConventions`，可选
- `sessionProfile`，默认为 `general`
- 当 `sessionProfile` 为 `coding` 时，必须提供 `repository`

在起草记录之前应用 `bm-writing` 技能。

收集仓库证据：

- 启动该线程的最初目标，以及它为何重要
- 用户的最新意图，包括取代最初目标的修正或范围变更
- 所采用的方法，以及它为何能解决问题
- 当前系统状态及其实际影响
- 权衡、潜在问题、有用的简化，以及有意搁置的工作
- `git status --short`
- 当前分支
- 仓库根目录和当前工作目录
- 当前 Git SHA
- 当前拉取请求的编号、标题、URL、状态、基础分支和头部分支（如果存在）
- 你改动过的文件
- 实际运行过的测试或检查
- 失败或跳过的检查
- 此线程中做出的决策
- 尚未解决的阻塞项
- 下一步操作
- 当前用户名、主机名和时间戳
- 检查点请求中由主机提供的 `codex_session_id`、`codex_turn_id`、`trigger` 和 `model` 值（如果存在）

使用直接的只读证据确认仓库和拉取请求状态。除非你实际运行过测试，或用户提供了测试结果，否则不要声称测试已通过。将主机提供的会话元数据视为不透明的身份数据。精确保留所有非空值；绝不要推断或改写它们。

## 写入

检查点是一份持久的交接记录，而不是状态转储或逐提交的变更日志。应为日后返回的人员或代理讲清楚工作脉络。将其视为快照以及指向权威产物的指针，而不是任务、决策、计划、议题、拉取请求、提交、差异、已检入文档或源文件的替代品。

每次调用都创建一个新的检查点。绝不要编辑、替换或追加到先前的检查点，即使主题未发生变化。

使用以下标题：

`Codex checkpoint - <UTC YYYY-MM-DDTHH-MM-SSZ> - <short topic>`

UTC 时间戳是不可变检查点标识的一部分，并避免使用对文件名不安全的冒号。如果 `write_note` 报告标题冲突，请使用最小的可用数字后缀重试，例如 ` - 2`。绝不要通过修改现有记录来解决冲突。

每次尝试时，都使用 `project=<configured primaryProject>`、`overwrite=False` 和 `output_format="json"` 调用 `write_note`。当省略 `primaryProject` 时，不要设置 project 参数，以便 Basic Memory 使用其默认项目。frontmatter 中的 `project` 字段是描述性元数据，不能替代工具的 project 参数。即使用户的 `write_note_overwrite_default` 设置为 true，显式的非覆盖标志也必须优先。只接受 `action: created` 的成功结果；将 `action: conflict` 或 `NOTE_ALREADY_EXISTS` 视为上述标题冲突，并在出现任何其他操作或错误时停止。

向 Basic Memory 写入一条笔记。对于 `general` 配置：

- `title`：上方带时间戳的检查点标题
- `directory`：已配置的 `captureFolder`
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
  - `codex_session_id: <host-provided Codex session id>`，如果已提供
  - `codex_turn_id: <host-provided Codex turn id>`，如果已提供
  - `trigger: <host-provided checkpoint trigger>`，如果已提供
  - `model: <host-provided model slug>`，如果已提供

对于 `coding` 配置，写入 `type: coding_session`，并使用相同的通用
frontmatter，以及以下 schema 必需字段：

- `repository: <confirmed stable repository identifier>`
- `repo_root: <git rev-parse --show-toplevel>`
- `cwd: <current cwd>`
- `branch: <git rev-parse --abbrev-ref HEAD>`
- `git_sha: <git rev-parse HEAD>`

当当前分支有关联的拉取请求时，还要添加带类型的可选字段
`pull_request_number`、`pull_request_title`、`pull_request_url`、
`pull_request_state`、`pull_request_base` 和 `pull_request_head`。通过只读 GitHub 查询解析
拉取请求；不存在 PR 时省略这些字段。
将编号写为带引号的字符串，例如 `pull_request_number: "123"`，
以便精确的元数据查询在不同存储后端之间保持一致。
绝不要仅根据对话文本推断或复制仓库/PR 标识。如果无法证实
必需的 coding 字段，请停止。

### 链接同一聊天中的检查点

当 `codex_session_id` 可用时，将其用作完全一致的同一聊天标识：

1. 写入前，在已配置的 `primaryProject` 中搜索同时包含
   `codex_session` 和 `coding_session` 的笔记，并使用
   `metadata_filters={"codex_session_id": "<exact host-provided id>"}`。
2. 遍历所有匹配结果的分页，并根据有效的 `started` 时间戳选择最新的较早检查点。直接从 `primaryProject` 读取该笔记，并
   确认其 frontmatter 包含完全相同的 `codex_session_id`。
3. 在 `## Relations` 下添加 `- continues [[Exact previous checkpoint title]]`。

不要编辑之前的不可变检查点来添加正向边；Basic Memory 的反向链接
可让该链在两个方向上均可导航。如果没有经过验证的较早匹配项，则省略沿袭关系。绝不要仅根据
仓库、分支、主题、时间戳或生命周期封装笔记推断同一聊天的沿袭关系。

正文以 `# <exact note title>` 开头。

使用以下章节，省略没有增添价值的可选章节：

- `## Summary`：一个具体的句子，不能只是重复标题
- `## Story`：以实质性文字描述原始目标 -> 用户最新意图 -> 方法 -> 当前
  状态及影响
- `## Working State`：将持久状态与机器本地或脆弱状态分开
- `## Changed Files`，当路径有助于恢复工作时使用
- `## Verification`，用于记录实际运行的检查及其结果
- `## References`，用于记录已验证的仓库、提交、拉取请求、议题、规范
  或文档链接
- `## Observations`
- `## Relations`，当该线程有明显的图关系目标时使用

正文中优先使用仓库相对路径。Frontmatter 中必需的绝对路径 `repo_root` 和
`cwd` 仍属于机器本地证据。当脏文件或未跟踪文件、被忽略的文件、活动进程、开发服务器、
临时目录和本地工具缓存与恢复工作相关时，应将其标记为机器本地或脆弱状态。不要将它们
表述为持久的项目状态。

让笔记以指针为先：

- 指明权威制品，并包含其稳定标识符或链接
- 仅总结理解每个指针为何重要所需的上下文
- 对已有的图谱笔记使用关系，对图谱外的制品使用普通链接或仓库路径
- 不要将大型计划、差异、日志或源文件复制到检查点中

对于由 GitHub 托管的仓库工作，使用只读 GitHub 查询解析规范仓库 URL。在
`## References` 下以及正文中出现相应内容的位置，将当前仓库、当前已推送提交、
拉取请求以及任何实质相关的 GitHub 议题或提交呈现为 Markdown 链接。对拉取请求和
议题使用 GitHub 返回的规范 URL。链接提交之前，应验证 GitHub 能否在已确认的仓库中
解析该 SHA。如果提交位于本地或尚未推送，则将 SHA 保留为代码，将其标记为本地或
未推送，并且不要构造可能不存在的 GitHub 链接。若无法确定裸议题编号或 SHA 所属的
仓库，则不要在未经验证的情况下将其转换为链接。

使用观察项提炼用于结构化回忆的持久事实，而不是重复每一句叙述：

- `[result]` 用于具体结果
- `[decision]` 用于做出或保留的每项决定
- `[blocker]` 用于每个尚未解决的阻碍
- `[next_step]` 用于唯一的首要后续行动；必须恰好包含一个
- 仅当 `[verification]` 或 `[changed_file]` 条目本身是重要的项目记忆，而不只是
  辅助细节时才使用它们

不要使用普通项目符号创建单独的 Decisions、Blockers 或 Next Action 章节。省略空类别，
而不是写入诸如“无”之类的占位文本。

关系不是观察项。使用 Basic Memory 关系语法将其放在 `## Relations` 下，例如
`- relates_to [[Exact existing note title]]`。绝不要将 `[relates_to]` 或裸
`memory://` URL 写成观察项。仅当关系目标是已有的检查点、任务、决策、规范、议题或
PR 笔记时才添加关系。已验证的同一聊天中的 `continues` 边是检查点谱系关系；不要再
向同一目标添加第二个泛化关系。

## 确认

回复以下内容：

1. 用一句话概括检查点保留的内容
2. 从成功返回的 JSON 结果中选出的准确恢复标识符
3. 唯一的首要后续行动
4. 以恰好一个带围栏的恢复命令作为最后一个块：

```text
$bm-orient "<exact returned resume identifier>"
```

按以下顺序选择第一个非空返回值：`permalink`、`file_path`，然后是 `title`。
这样可以在 Basic Memory 项目禁用永久链接时保留一个直接恢复游标。逐字使用返回值；
绝不要构造或猜测永久链接或文件路径。