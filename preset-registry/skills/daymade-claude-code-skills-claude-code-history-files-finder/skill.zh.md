---
name: claude-code-history-files-finder
description: >-
  Searches and recovers Claude Code JSONL history across all active config homes
  and archives registered in ~/.claude/history-sources.json. Use --all-projects
  when the project is unknown, --codex to include Codex rollout search, and
  --kimi to include Kimi CLI (kimi-code) session search. Uses internal
  timestamps and searches messages, thinking, tool inputs/results, queues,
  attachments, summaries, titles, and file-history paths. Recovers exact
  captured bytes from Claude file-history snapshots, including post-Write edits
  and binary files; otherwise labels Write checkpoints as lower fidelity. Use
  for keyword/date-bounded history search, prior-conversation forensics,
  deleted-file recovery, vanished ~/.claude/jobs artifacts, tool/file-operation
  analysis, or requests mentioning session history, find in history, previous
  conversation, or .claude/projects. For a recent Claude+Codex+Kimi CLI
  inventory, use local-conversation-history instead.
---
# Claude Code 历史文件查找器

搜索并恢复存储在活跃主目录和显式注册的长期归档中的 Claude Code 会话历史内容。

## 功能

- 从文件历史快照中恢复已删除或丢失文件的精确捕获字节，包括在最初的 Write 调用后发生更改的文件
- 在对话历史中搜索特定代码或内容
- 分析过往会话中的文件修改
- 追踪工具使用情况和文件操作
- 查找包含特定关键字或主题的会话

## 完整性不变量

常规历史搜索必须涵盖两类来源：

1. 自动发现的活跃主目录（`~/.claude`、配置文件主目录以及当前的
   `CLAUDE_CONFIG_DIR`）；以及
2. 在 `~/.claude/history-sources.json` 中注册的所有归档。

除非命令输出确认已搜索注册的归档，否则不要断定某个会话、主题、文件或操作不存在。任何必需的归档不可用都属于严重配置错误。`--home` 和
`--main-only` 是精确的诊断作用域，会有意绕过归档注册表；使用任一标志所得的结果都不能用于支持“整个历史中不存在”的结论。

完整的来源集合是必要条件，但并非充分条件——即使覆盖了所有来源，另外三种失败模式仍会产生错误的“未找到”结果，并且每一种都有专门的扩大搜索方式（匹配数为零时，脚本会自动输出这些方式）：

1. **项目猜测错误。** 你搜索了一个项目，但对话发生在另一个项目中。扩大方式：`--all-projects` 一次性扫描所有项目。
2. **工具错误。** 对话发生在 Codex 或 Kimi CLI 中，它们的
   rollout/wire 日志属于独立存储，Claude 注册表永远不会覆盖。扩大方式：`--codex` 和 `--kimi`（两者都需要显式启用；如果项目同时使用这两个工具开发，请同时传入）。
3. **措辞偏差。** 记忆中的引文在标点或少数词语上与实际措辞不同，导致精确短语搜索无法命中。扩大方式：改用更短且有辨识度的子字符串重试。

还有一个与上述三种情况都相关的陷阱：**当前会话总会匹配你刚刚输入的短语**（技能参数、你的命令以及此处的推理都会写入其记录）。如果首条结果的时间范围始于几分钟前，则几乎可以确定它就是当前会话——通过内部时间范围进行确认，然后使用 `--exclude-session <id>` 重新运行，以查看真正的结果。

## 会话文件位置

每个 Claude 历史记录根目录都将会话存储在
`<history-root>/projects/<encoded-project-path>/<session-id>.jsonl`。活跃根目录会被自动发现。持久归档根目录只需在
`~/.claude/history-sources.json` 中配置一次，之后默认会包含在搜索范围内。

Claude 还可能将检查点负载保存在
`<history-root>/file-history/<session-id>/<opaque-backup-name>`。JSONL 中的
`file-history-snapshot.snapshot.trackedFileBackups` 映射将每个原始路径与其不透明备份名称及版本关联起来。此配套存储与
`projects/` 相互独立：仅将 JSONL 复制到长期归档中，并不能证明其检查点字节也已一并复制。该格式是通过观察得到的 Claude Code
运行时细节，而不是有文档说明的稳定 API，因此随附的恢复解析器会验证所选映射、版本/名称是否一致、路径包含关系以及字节一致性，并在这些事实不一致时明确报错。

**目录名称是项目的绝对工作目录路径，其中每个 `/` 都被替换为 `-`——绝不能只使用基本名称。** 例如，`/Users/<name>/Desktop/my-app` 会变为 `-Users-<name>-Desktop-my-app`，因此单独的 `my-app` 无法直接匹配目录。

**在断定项目没有历史记录之前，请使用默认来源集运行随附命令。不要根据失败的 `ls` 推断历史记录不存在：**

```bash
python3 scripts/analyze_sessions.py list /path/to/project
python3 scripts/analyze_sessions.py search /path/to/project '<keyword>'
```

如果 `ls <basename>` 没有返回任何内容，这意味着查询时使用了错误的名称，而不是历史记录不存在。随附的 `analyze_sessions.py` 会展开 `~`、解析绝对路径、回退到无歧义的基本名称反向查找，并搜索每个已配置的来源。应优先向其传入项目的完整绝对路径；它也接受 `~`、相对路径和单独的名称。

注意：从 **Claude Desktop 的 cowork / 内置 Claude Code 模式**运行的会话也会存放在这里（Desktop 运行的是随附的 CLI）；只有 Desktop 的*原生*聊天存放在其他位置（LevelDB 存储，而非 JSONL）。因此，“它是在 Desktop 内运行的”并不意味着它未存放在 `~/.claude/projects/` 中。

### 活跃配置文件和长期归档——默认一并搜索

`~/.claude` 只是*默认*主目录。任何通过**按模型划分的配置文件，使用第三方模型**运行 Claude Code 的用户（每个配置文件都有自己的 `CLAUDE_CONFIG_DIR`），都会积累**完全不会写入 `~/.claude` 的并行历史记录**：

- `~/.claude-profiles/<name>/projects/…`——每个配置文件一个（例如 `kimi`、`deepseek`、`glm`、`step` 配置文件）
- `~/.claude-<name>/projects/…`——偶尔使用的同级主目录
- 当前 shell 中 `CLAUDE_CONFIG_DIR` 所指向的任意位置

长期归档是第二类独立来源。活跃目录可能只保留最近的会话，而归档会在较旧的 JSONL 文件从活跃目录树中消失后继续保留它们。因此，仅限活跃主目录的搜索可能会产生与仅搜索主主目录时相同的假阴性结果。

`analyze_sessions.py` 会处理这两类来源：**`list` 和 `search` 会自动发现每个活跃主目录并加载归档注册表**，按 ID 对会话去重、合并各副本的内部范围，并保留每个来源标签作为溯源信息。关键字搜索会流式扫描每个物理副本，并对相同记录进行去重，因此，仅存在于归档中的记录不会仅仅因为具有相同会话 ID 的较新活跃副本存在而消失。仅在有意进行诊断时才限定其范围：

```bash
# default: active homes + registered archives
scripts/analyze_sessions.py search /path/to/project keyword

# exact diagnostic scope; not a completeness check
scripts/analyze_sessions.py search /path/to/project keyword --main-only

# exact diagnostic scope (repeatable)
scripts/analyze_sessions.py search /path/to/project keyword --home ~/.claude-profiles/kimi

# test a non-default source registry
scripts/analyze_sessions.py search /path/to/project keyword \
  --history-sources /path/to/history-sources.json
```

**不要使用临时拼凑的原始 grep 来证明某内容不存在。** 必须独立解析注册表，覆盖每个活跃根目录，搜索非消息事件载荷，并根据内部记录时间戳应用日期筛选；随附的脚本已经实现了这些功能。

有关 JSONL 详细结构和提取模式，请参阅 `references/session_file_format.md`。

## 核心操作

### 1. 列出项目的会话

查找特定项目的所有会话文件：

```bash
python3 scripts/analyze_sessions.py list /path/to/project
```

显示按各会话内部 JSONL 最大时间戳排序的会话，以及完整的内部时间范围、大小、路径和来源信息。绝不使用文件 mtime。

可选：使用 `--limit N` 仅显示 N 个会话（默认值：10）；使用 `--from-date` 或 `--to-date` 保留内部时间范围与请求时间窗口重叠的会话。`--all-projects` 列出所有项目（按编码后的项目名称分组）；`--exclude-session <id>`（可重复使用）跳过会话。

### 2. 在会话中搜索关键词

查找包含特定内容的会话：

```bash
python3 scripts/analyze_sessions.py search /path/to/project keyword1 keyword2
```

返回按关键词出现频次排序的会话，并包含：
- 出现总次数
- 各关键词的明细
- 会话及匹配记录的内部时间范围
- 匹配字段类型、会话来源和匹配来源
- 主要匹配路径以及其他所有匹配副本

搜索范围包括消息、思考文本（不包括签名）、工具输入/结果、队列操作内容、附件、最后的提示词、系统/摘要内容、自定义标题，以及文件历史快照中的原始路径。可选：使用 `--case-sensitive` 精确匹配大小写；`--from-date` 和 `--to-date` 根据匹配记录自身的内部时间戳限制结果，而不是根据会话 mtime。`--exclude-session <id>`（可重复使用）排除会话——每当搜索刚刚输入的短语时，请传入当前会话的 id，因为你自己的命令会使当前会话成为匹配项。

仅含日期的边界涵盖整个本地日历日。日期时间边界必须带有 `Z` 或明确的 UTC 偏移量。启用日期筛选器时，没有有效内部时间戳的记录会被排除，并显示提示；迁移或复制后，绝不要改用文件 mtime。

### 2a. 项目未知时进行搜索——`--all-projects`

必需的项目参数表达的是一种猜测；如果猜测错误，限定项目范围的搜索就会错误地报告“未找到”。此时应省略该位置参数，改为搜索所有项目（`list` 也接受相同的标志）：

```bash
python3 scripts/analyze_sessions.py search --all-projects 'some phrase'
```

使用 `--all-projects` 时，每个位置参数都是关键词，因此可以执行多关键词搜索：`search --all-projects keyword1 keyword2`。不使用该标志时，第一个位置参数是项目路径，其余参数是关键词。

预期输出：一次遍历所有来源中的每个项目会话，每个匹配项都包含一行 `Project:`，用于标明编码后的项目目录。这是一次完整历史记录扫描——对于大型目录树，预计需要数分钟，而不是数秒。

### 2b. 包含 Codex 历史记录 — `--codex`

Claude Code 并不是唯一保存历史记录的工具。Codex 将 rollout 保存在
`<codex-home>/sessions/<YYYY>/<MM>/<DD>/rollout-*.jsonl` 以及
`archived_sessions/` 中（Codex 主目录由 `--codex-home`、`$CODEX_HOME` 或
`~/.codex` 指定）。其架构与 Claude 的不同，因此默认搜索会完全跳过这些记录；
`--codex` 会增加一次 rollout 搜索：

```bash
python3 scripts/analyze_sessions.py search /path/to/project 'some phrase' --codex
```

Codex 命中结果会显示在其独立分区（📦）中，其中包含会话 ID、cwd、内部范围、
提及次数和匹配字段。如果提供了项目位置参数，则会根据 rollout 的 `session_meta`
cwd 对其进行筛选（递归匹配）；使用 `--all-projects` 时，则会搜索所有 rollout。
`event_msg` 中的消息镜像与 `response_item` 中的消息文本是严格重复的，因此只计数一次。
rollout 记录的结构记录在 `references/session_file_format.md` 中。

`--codex` **仅**扩大搜索范围。Codex rollout 不包含 Claude 的文件历史映射，因此
`recover_content.py` 在收到 Codex rollout 时会返回明确的边界错误，而不是返回空的、
表面上看似成功的恢复结果。

### 2c. 包含 Kimi CLI 历史记录 — `--kimi`

Kimi CLI（kimi-code）将会话保存在
`<kimi-home>/sessions/wd_<workspace>_<hash>/session_<uuid>/agents/<agent>/wire.jsonl`
中，每个会话还有一个 `state.json`，其中保存 id/cwd/title 以及以毫秒为单位的
created/updated 时间边界（Kimi 主目录由 `--kimi-home`、`$KIMI_HOME` 或
`~/.kimi-code` 指定）。wire 架构与 Claude 和 Codex 的架构均不相同，因此默认搜索会
完全跳过这些记录；`--kimi` 会增加一次 wire 搜索：

```bash
python3 scripts/analyze_sessions.py search /path/to/project 'some phrase' --kimi
```

Kimi 命中结果会显示在其独立分区（🌙）中，其中包含会话 ID、标题、cwd、内部范围、
提及次数和匹配字段。如果提供了项目位置参数，则会根据会话的 `state.json` cwd
对其进行筛选（递归匹配）；使用 `--all-projects` 时，则会搜索所有会话。子代理 wire
（`agents/agent-N/`）是同一对话的不同运行，因此匹配结果会在会话级别聚合，并在每个
匹配字段前加上代理名称（例如 `main:message`、`agent-0:tool_input`）。可搜索范围是
对话本身——提示词（`turn.prompt` / `turn.steer`，会为任何 `origin` 建立索引——搜索会
有意扩大覆盖范围）、追加的消息、助手内容部分、工具调用和工具结果。静态样板内容
（配置文件/配置方案中的系统提示词、工具快照、用量/token 指标）不会被有意建立索引：
如果某个关键字仅出现在共享系统提示词中，它将匹配每个会话，而该工具应当对对话内容
可靠给出的答案是“未找到”。

与 `--codex` 完全一样，`--kimi` **仅**扩大搜索范围。Kimi wire 日志不包含 Claude 的
文件历史映射，因此文件恢复仍然仅支持 Claude Code JSONL；不要将 Kimi wire 路径传给
`recover_content.py`。`--codex` 和 `--kimi` 可以组合使用——如果一个项目同时使用了
这两种工具进行开发，则需要在同一命令中同时使用这两个标志。

脚本输出的零匹配提示已经会建议尚未使用的
`--all-projects` / `--codex` / `--kimi` / 更短的子字符串——在断定任何内容不存在之前，
请先阅读 stderr。

### 3. 恢复已删除的内容

从选定的会话中恢复文件：

```bash
python3 scripts/recover_content.py <session-path-from-search>
```

对于每个路径，默认模式会合并具有相同会话 ID 的所有已知副本，
选择最新的有效文件历史检查点，并从活动或已注册归档的配套存储中
恢复其精确字节。这可以捕获较晚发生的 Edit 或由 shell 驱动的更改，
并且能够恢复二进制文件或未调用 Write 工具写入的文件。较晚出现的
`backupFileName: null` 是删除墓碑：系统会恢复最后一个可用检查点，
并在报告中说明之后发生的删除。如果某个路径没有可用的快照检查点，
脚本会恢复最新的 Write 调用，并在 `recovery_report.txt` 中将其标记为
较低保真度。若某次 Write 所匹配的 `tool_result` 明确包含
`is_error: true`，则会跳过该 Write；写入尝试不算作检查点。原始目录结构会
保留在 `./recovered_content/` 下。

**按关键词筛选**：

```bash
python3 scripts/recover_content.py <session-path-from-search> \
  -k ModelLoading FRONTEND deleted
```

仅恢复路径与任一关键词匹配的文件。

**自定义输出目录**：

```bash
python3 scripts/recover_content.py <session-path-from-search> -o ./my_recovery/
```

已注册的归档根目录和具有相同 ID 的 JSONL 副本会自动包含在内。
如果未注册的配套检查点存储位于其他位置，请添加直接包含
`<session-id>/` 目录的根目录：

```bash
python3 scripts/recover_content.py <session-path-from-search> \
  --file-history-root /path/to/file-history \
  -o ./my_recovery/
```

如果快照元数据引用的备份不存在，则属于保真度错误：恢复过程会在写入
任何选定文件之前中止，而不会静默改用过时的 Write 内容。仅当用户明确
接受之后的 Edit 或 shell 更改可能缺失时，才使用 `--write-only`。

### 4. 分析会话统计信息

获取详细的会话指标：

```bash
python3 scripts/analyze_sessions.py stats /path/to/session.jsonl
```

报告内容：
- 消息数量（用户/助手）
- 工具使用明细
- 文件操作数量（Write/Edit/Read）

可选：使用 `--show-files` 列出所有文件操作。

### 5. 逐字提取用户消息

生成一个阅读页面，展示用户实际输入的内容——涵盖所有主目录和归档中的
每一条用户消息，并将运行框架产生的干扰内容归入附录：

```bash
python3 scripts/extract_user_messages.py --days 7
```

默认写入 `~/.claude-flow-viewer/user-words.html`（主要格式）和 `.md`——
这是一个持久化路径；请避免使用 `/tmp`（操作系统会清理该目录）。传入位置参数
`OUT_BASE` 可写入其他位置。实用标志：`--group-by project|day`
（默认为 `project`）、`--min-dup N`（样板文本频率阈值）、
`--home <path>`（精确限定范围，可重复指定）。

这项任务的难点不在于解析，而在于*作者身份判定*：一条 `user` 记录
不一定由用户编写。提取器实现了 `references/session_file_format.md` 中的五类
内容污染识别——命令封装、由 hook/loop 注入的样板文本（通过频率检测，
同时识别独立出现和追加在末尾的形式）、`[Image #N]` 占位符、整篇文档粘贴，
以及以代理口吻重新注入的内容（通过与较早的助手文本进行内容匹配）——还会从
`attachment.queued_command` 记录中恢复工作过程中途输入的内容，并与之后送达的
用户记录进行去重。修改过滤器之前，请先阅读该参考文档中的相关章节。

### 6. 会话结束状态分类（崩溃恢复 / 待办审计）

对某个时间窗口或项目内会话的结束方式进行分类，并完整打印每个会话的最后一条
助手消息——该工具用于查明“哪些会话因重启/崩溃而中断”，或者“哪些较早的会话
仍在等待回复，实际上尚未完成”：

```bash
python3 scripts/analyze_sessions.py triage --all-projects \
  --from-date 2026-08-05T12:30:00+00:00 --to-date 2026-08-05T13:05:00+00:00
```

报告范围内每个会话的会话 ID（始终完整，绝不截断——
可直接复制到任何后续报告中）、cwd，以及五种结构性
`kind` 之一：`interrupted_explicit`（会话的最后一条相关记录是
显式中断标记）、`net_error`（最后一个助手轮次因
API/传输错误而终止）、`done`（最后一个助手轮次生成了实际文本，
且并非以 API 错误开头）、`empty`（完全没有助手轮次），
或 `stuck_no_result`——涵盖其他所有结构的兜底类别，因为从
分类处置的角度来看，它们都意味着同一件事：**最后一个轮次没有生成
文本回复，因此文件停止记录时模型仍在工作。** 这包括仍在等待结果的
工具调用、结果已经返回但此后没有助手轮次的工具调用（执行框架很可能
在结果返回后、模型下一轮被捕获前停止），以及仅包含思考内容或
因其他原因而为空的最后一个轮次。

**`done` 是一个结构性标签，并不表示没有未决事项。** 一个
会话可能恰恰因为助手提出了发现、决定或问题，却始终未收到回复，而以一个正常的
`text` 块结束——要区分“已完全收尾”和“正在等待你的回复”，必须阅读打印出的
`last_assistant_text`；这也正是该命令默认打印其中最多 4000 个字符
（使用 `--tail-chars 0` 可取消限制），而不是只显示截断标题的原因。
完整的判断逻辑请参阅 `references/session_file_format.md` 中的“检测会话
中断”，其中也说明了为什么这与 `kind` 字段确实是两个不同的判断维度。

实用标志：`--kind KIND`（可重复使用，将结果限制为特定类别——例如
使用 `--kind stuck_no_result --kind interrupted_explicit` 表示“仅查看
有可能由崩溃造成的会话”）；`--exclude-title-prefix TEXT`（可重复使用——
排除开场提示以 TEXT 开头的会话，可用于项目自身的自动化约定，例如
总是以相同固定提示开场的代码审查钩子；否则这些会话会占据分类处置结果的大部分，
因为它们以常规的结构化工具调用结束，而非因中断结束）；`--tail-chars N`
（限制打印的最后一条助手文本；默认为 4000，0 = 无限制）。与
`list` 共用 `--from-date`/`--to-date`/`--home`/`--main-only`/`--history-sources`，
并与 `list` 和 `search` 共用
`--all-projects`/项目路径/`--exclude-session`。

## 工作流示例

有关文件恢复、跟踪文件演变和批量操作等详细工作流示例，请参阅 `references/workflow_examples.md`。

## 恢复最佳实践

### 去重

`recover_content.py` 会合并 ID 相同的会话副本，为每个原始路径保留最高的
file-history 版本，并使用检查点时间戳处理版本相同的情况。较晚的删除墓碑不会抹除较早的可恢复备份；
它只会改变报告的状态。对于没有可用检查点的路径，恢复过程会保留内部时间戳最新的 Write 调用。
不同副本中 JSONL 行的物理顺序不会被视为充分的时间证据，而明确失败的 Write 工具结果会使该次
Write 尝试被排除在恢复范围之外。

### 关键词选择

选择出现在以下位置的、有辨识度的关键词：
- 文件名或路径
- 函数名/类名
- 代码中的唯一字符串
- 错误消息或注释

### 输出组织

创建描述性明确的输出目录：

```bash
# Bad
python3 scripts/recover_content.py session.jsonl -o ./output/

# Good
python3 scripts/recover_content.py session.jsonl -o ./recovered_deleted_docs/
python3 scripts/recover_content.py session.jsonl -o ./feature_xy_history/
```

### 验证

恢复后，始终验证内容：

```bash
# Check directory structure (files preserved in subdirectories)
find ./recovered_content/ -type f

# Read recovery report (shows full output paths)
cat ./recovered_content/recovery_report.txt

# Spot-check content and compare the report's SHA-256 with the source backup
head -20 ./recovered_content/src/components/ImportantFile.jsx
```

将 `Source: file-history` 及其 SHA-256 视为精确的已捕获检查点证据。将 `Source: Write`
视为可恢复的检查点，而不是文件最终状态的证明。

## 局限性

### 可以恢复的内容

✅ 可用 file-history 快照所引用的精确字节
✅ 配套 file-history 存储中存在的二进制文件
✅ 通过 Edit 或 shell 命令更改、且随后被某个检查点捕获的文件
✅ 在不存在快照元数据时使用 Write 写入的文件（保真度较低）
✅ 消息或工具结果中明确存在的文本（手动提取）

### 无法恢复的内容

❌ 从未写入磁盘的文件（仅在讨论中提及）
❌ 在会话开始前已删除的文件
❌ 已被删除或未随归档 JSONL 一同复制的快照有效载荷
❌ 未在会话中捕获的外部工具输出

Edit/Read 记录可以揭示路径和 Edit 差异，但它们本身并不是完整文件的恢复来源。

### 文件版本

- file-history 备份是精确捕获的检查点，但不能保证之后未发生未经检查点捕获的文件系统更改。
- 如果没有 file-history 条目，Write 恢复无法重建后续的 Edit 或 shell 更改；Edit 记录包含的是差异，而不是完整的结果文件。
- file-history JSONL/存储契约是通过运行时观察得出的，可能会发生演变；对于格式错误或相互冲突的元数据，必须明确报错，而不能靠猜测处理。

## 故障排除

### 未找到会话

```bash
# Re-run with the full absolute project path and the default source set.
python3 scripts/analyze_sessions.py list /absolute/path/to/project

# Inspect a custom registry only when diagnosing its configuration.
python3 scripts/analyze_sessions.py list /absolute/path/to/project \
  --history-sources /path/to/history-sources.json
```

**“未找到”通常意味着项目标识错误或源集合不完整。**
确认输出中显示 `Searched N source(s)`，并且同时包含预期的
`active:<label>` 和 `archive:<label>` 条目。如果使用了 `--main-only` 或 `--home`，
请在不使用该选项的情况下重新运行。缺失的必需归档必须予以修复，或有意更改其
注册表条目；不要悄然忽略该错误并声称会话不存在。如果已确认源集合完整，请按照
“完整性不变量”一节中的逐步扩大范围策略操作：`--all-projects` →
`--codex` → `--kimi` → 更短的子字符串，并使用 `--exclude-session` 排除当前
会话。

### 空结果恢复

可能的原因：
- 关键字与会话中的文件路径不匹配
- 会话早于文件创建时间
- 该路径从未被文件历史记录或 Write 捕获

解决方案：
- 尝试使用 `--show-edits` 标志查看 Edit 操作
- 扩大关键字搜索范围
- 搜索相邻会话
- 如果精确备份错误指出缺少配套存储，请找到它并传入
  `--file-history-root`；不要声称陈旧的 Write 检查点是最终版本

### 大型会话文件

对于大于 100MB 的会话：
- 逐行流式搜索 JSONL，而不是加载整个会话。
- 恢复过程会分块复制精确的备份字节，并且仅保留五条轻量级
  Edit 摘要，绝不保留完整的 Edit 旧/新负载。
- 恢复过程仍会保留有效的 Write 负载以及复制合并所需的记录指纹，
  因此内存占用并非常量。使用 `-k` 限制恢复范围，并预计运行时间会随发现的每个物理副本而增加。

## 安全与隐私

### 分享恢复内容之前

会话文件可能包含：
- 带有用户名的绝对路径
- API 密钥或凭据
- 公司特定信息

分享前务必进行脱敏：

```bash
# Read-only audit; review every hit before creating a separate redacted copy.
rg -n --hidden -S \
  '(api[_-]?key|password|token|secret|/Users/[^/]+/|/home/[^/]+/)' \
  recovered_content/
```

`recovery_report.txt` 同样敏感：它会记录请求的会话副本、
原始绝对路径、检查点位置和输出路径。请将报告与恢复的文件一并审计和
脱敏；默认情况下不要分享该报告。

### 安全存储

恢复内容会继承原始会话的敏感性。请安全地存储，并遵循组织处理会话数据的相关政策。

## 下一步：恢复中断的工作

找到相关会话历史记录后，建议继续该工作：

```
Found [N] relevant sessions with recoverable context.

Options:
A) Resume work — run /daymade-claude-code:continue-claude-work to pick up where you left off (Recommended)
B) Just show me the content — I'll decide what to do with it
```

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、
`local-conversation-history`、`continue-claude-work` 和
`continue-codex-work` 共享代码的 SSOT。`sync_core.py` 会将该
包捆绑到每个技能的 `scripts/_core/` 中；绝不要直接编辑捆绑的副本。

共享代码发生更改后，同步并验证全部四个捆绑包，然后运行 finder 的隔离夹具：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```