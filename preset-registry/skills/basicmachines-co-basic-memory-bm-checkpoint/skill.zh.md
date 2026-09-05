---
name: bm-checkpoint
description: Create an immutable Codex handoff in Basic Memory and return an exact bm-orient resume command.
---
# Checkpoint Codex Work

# Codex 检查点工作

## Gather

读取 `~/.codex/basic-memory.json`，然后读取最近的项目 `.codex/basic-memory.json`；项目键覆盖用户键：

- `primaryProject`，默认省略
- `captureFolder`，默认 `codex/<git top-level directory name>`
- `placementConventions`，可选
- `sessionProfile`，默认 `general`
- `repository`，当 `sessionProfile` 为 `coding` 时必需

起草笔记前应用 `bm-writing` 技能。

收集仓库证据：
- 启动线程的原始目标及其重要性
- 最新的用户意图，包括纠正或超出原始目标的范围变更
- 采用的方法及其解决问题的方式
- 当前系统状态和实际影响
- 权衡、尖锐边缘、有用简化，以及有意停放的工作
- `git status --short`
- 当前分支
- 仓库根目录和当前工作目录
- 当前 Git SHA
- 当前拉取请求编号、标题、URL、状态、base 和 head（如果存在）
- 你触及的文件
- 实际运行的测试或检查
- 失败或跳过的检查
- 本线程做出的决定
- 未解决的阻挡
- 下一步行动
- 当前用户名、主机名和时间戳
- 来自检查点请求的 host-provided `codex_session_id`、`codex_turn_id`、`trigger` 和 `model` 值（如果存在）

使用仓库和拉取请求状态的直接只读证据。除非你运行了它或用户提供了结果，否则不要声称测试通过。将 host-provided 会话元数据视为不透明的身份数据。保留精确的非空值；永远不要推断或重写它们。

## Write

检查点是一个持久的交接笔记，不是状态转储或逐提交的变更日志。为以后返回的人类或代理讲述故事。将其视为快照加上指向权威工件的指针，而不是任务、决定、计划、问题、拉取请求、提交、差异、已检查的文档或源文件的替代。

每次调用创建一个新的检查点。永远不要编辑、替换或追加到较早的检查点，即使主题不变。

使用标题：

`Codex checkpoint - <UTC YYYY-MM-DDTHH-MM-SSZ> - <short topic>`

UTC 时间戳是不可变检查点身份的一部分，并避免文件名不安全的冒号。如果 `write_note` 报告标题冲突，使用最小的可用数字后缀如 ` - 2` 重试。永远不要通过修改现有笔记来解决冲突。

在每次尝试中调用 `write_note`，参数为 `project=<configured primaryProject>`、`overwrite=False`，`output_format="json"`。当省略 `primaryProject` 时，保留项目参数未设置，以便 Basic Memory 使用其默认项目。前置元数据 `project` 字段是描述性元数据，不替代工具的项目参数。显式的非重写标志必须获胜，即使用户的 `write_note_overwrite_default` 设置为 true。只接受 `action: created` 的成功结果；将 `action: conflict` 或 `NOTE_ALREADY_EXISTS` 视为上述标题冲突，并在任何其他操作或错误时停止。

为 Basic Memory 编写笔记。对于 `general` 配置文件：

- `title`: 上面的带时间戳的检查点标题
- `directory`: 配置的 `captureFolder`
- `tags`: `["codex", "checkpoint"]`
- `frontmatter`：
  - `type: codex_session`
  - `status: open`
  - `project: <primaryProject if known>`
  - `cwd: <current cwd>`
  - `started: <current timestamp>`
  - `username: <current username>`
  - `hostname: <current hostname>`
  - `capture: deliberate`
  - `codex_session_id: <host-provided Codex session id>`，当提供时
  - `codex_turn_id: <host-provided Codex turn id>`，当提供时
  - `trigger: <host-provided checkpoint trigger>`，当提供时
  - `model: <host-provided model slug>`，当提供时

对于 `coding` 配置文件，写入 `type: coding_session` 并使用相同的通用 frontmatter 加上这些模式必需字段：

- `repository: <confirmed stable repository identifier>`
- `repo_root: <git rev-parse --show-toplevel>`
- `cwd: <current cwd>`
- `branch: <git rev-parse --abbrev-ref HEAD>`
- `git_sha: <git rev-parse HEAD>`

当当前分支存在拉取请求时，还需添加类型的可选字段

`pull_request_number`，`pull_request_title`，`pull_request_url`，

`pull_request_state`，`pull_request_base` 和 `pull_request_head`。使用只读 GitHub 查询解析拉取请求；当不存在 PR 时省略这些字段。

将数字写为带引号的字符串，例如 `pull_request_number: "123"`，

以确保在所有存储后端中精确的元数据查询行为一致。

不要仅从对话文本推断或复制仓库/PR 身份。如果无法证明所需的编码字段，请停止。

### 从同一聊天中链接检查点

当 `codex_session_id` 可用时，使用它作为精确的同聊天身份：

1. 在编写之前，在配置的 `primaryProject` 中搜索 `codex_session` 和 `coding_session` 笔记，使用

   `metadata_filters={"codex_session_id": "<exact host-provided id>"}`。

2. 翻阅所有匹配项，并选择其有效 `started` 时间戳的最新的早期检查点。从 `primaryProject` 直接读取该笔记并

   确认其 frontmatter 包含精确的 `codex_session_id`。

3. 在 `## Relations` 下添加 `- continues [[Exact previous checkpoint title]]`。

不要编辑之前的不可变检查点以添加前向边；Basic Memory 反向链接使链在两个方向上可导航。如果没有验证的早期匹配，省略谱系关系。从仓库、分支、主题、时间戳或生命周期包络笔记中永远不要推断同聊天谱系。

正文以 `# <exact note title>` 开始。

使用以下部分，省略那些无价值的可选部分：

- `## Summary`：一个具体的句子，不仅仅重复标题
- `## Story`：原始目标 -> 最新用户意图 -> 方案 -> 当前状态和影响，用实质性散文
- `## Working State`：将持久状态与机器本地或易碎状态分开
- `## Changed Files`，当路径对恢复有用时
- `## Verification`，用于实际运行的检查及其结果
- `## References`，用于已验证的仓库、提交、拉取请求、问题、规范或文档链接
- `## Observations`
- `## Relations`，当线程有明显的图谱目标时

正文中优先使用相对于仓库的路径。必需的绝对 `repo_root` 和
`cwd` frontmatter 仍属于机器本地证据。当脏文件或未跟踪文件、
被忽略的文件、活动进程、开发服务器、临时目录以及本地工具缓存与恢复有关时，
将其标记为机器本地或易变内容。不要将它们呈现为持久的项目状态。

让笔记以指针为先：

- 命名权威工件，并包含其稳定标识符或链接
- 只总结理解每个指针为何重要所需的上下文
- 对现有图谱笔记使用关系；对图谱之外的工件使用普通链接或仓库路径
- 不要将大型计划、差异、日志或源文件复制到检查点中

对于由 GitHub 支持的仓库工作，使用只读 GitHub 查询解析规范仓库 URL。在
`## References` 下以及正文中出现这些内容的位置，将当前仓库、当前已推送的提交、
pull request，以及任何实质相关的 GitHub issue 或 commit 呈现为 Markdown
链接。对 pull request 和 issue 使用 GitHub 返回的规范 URL。在链接 commit
之前，验证 GitHub 能够在已确认的仓库中解析该 SHA。如果 commit 是本地的或尚未推送，
将 SHA 保持为代码，标记为本地或未推送，并且不要构造可能不存在的 GitHub 链接。不要在
未证明其所属仓库的情况下，将含义不明确的裸 issue 编号或 SHA 转换为链接。

使用观察结果为结构化回忆提炼持久事实，而不是重复每一句叙述：

- `[result]` 用于具体结果
- `[decision]` 用于所作出或保留的每项决策
- `[blocker]` 用于每个尚未解决的阻塞因素
- `[next_step]` 用于唯一的主要后续操作；必须恰好包含一个
- `[verification]` 或 `[changed_file]` 仅在该条目本身属于重要的项目记忆时使用，
  而非仅作为辅助细节

不要创建单独的 Decisions、Blockers 或 Next Action 部分并使用普通项目符号。省略空类别，
不要写入诸如 "None." 之类的占位文本。

关系不是观察结果。将其放在 `## Relations` 下，并使用 Basic
Memory 关系语法，例如 `- relates_to [[Exact existing note title]]`。
绝不要写 `[relates_to]` 或裸 `memory://` URL 作为观察结果。仅当目标是现有的检查点、
任务、决策、规范、issue 或 PR 笔记时，才添加关系。已验证的同一聊天中的 `continues`
边是检查点谱系关系；不要再向同一目标添加第二个通用关系。

## 确认

回复：

1. 用一句话总结检查点保留的内容
2. 从成功的 JSON 结果中选择的确切恢复标识符
3. 唯一的主要后续操作
4. 恰好一个 fenced resume command 作为最终代码块：

```text
$bm-orient "<exact returned resume identifier>"
```

按以下顺序选择第一个非空的返回值：`permalink`、
`file_path`，然后是 `title`。原样使用返回值；绝不要构造或猜测 permalink 或
文件路径。