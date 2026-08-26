---
name: claude-code-history-files-finder
description: >-
  Searches and recovers Claude Code JSONL history across active config homes and
  registered archives. Use --all-projects when the project is unknown, --codex
  for Codex rollouts, and --kimi for Kimi CLI sessions. Uses internal timestamps
  and searches messages, thinking, tool inputs/results, queues, attachments,
  summaries, titles, and file-history paths. Recovers exact bytes from Claude
  file-history snapshots, including post-Write edits and binary files; otherwise
  labels Write checkpoints lower fidelity. Use for keyword/date-bounded search,
  Codex session-ID lookup, prior-conversation forensics, deleted-file
  recovery, vanished ~/.claude/jobs artifacts, tool/file-operation analysis,
  semantic recall when meaning is remembered but wording changed, or requests
  mentioning session history, find in history, previous conversation, or
  .claude/projects. Optional Claude-only recall uses Chinese-aware BM25 plus
  vectors; exact search stays authoritative. For a recent Claude+Codex+Kimi
  inventory, use local-conversation-history.
---
# Claude Code 历史文件查找器

从活动 home 目录和显式注册的长期归档中搜索并恢复 Claude Code 会话历史记录中的内容。

## 功能

- 从文件历史快照中恢复已删除或丢失文件的精确捕获字节，包括在最初执行 Write 后发生更改的文件
- 跨会话历史记录搜索特定代码或内容
- 在措辞发生变化时，回忆语义相似的用户/助手文本
- 分析过去会话中的文件修改
- 随时间跟踪工具使用情况和文件操作
- 查找包含特定关键词或主题的会话
- 从元数据中解析确切的 Codex 会话 UUID，而无需扫描 rollout 正文

## 完整性不变量

正常的历史搜索必须涵盖两类来源：

1. 自动发现的活动 home 目录（`~/.claude`、配置文件 home 目录以及当前的 `CLAUDE_CONFIG_DIR`），以及
2. 在 `~/.claude/history-sources.json` 中注册的每个归档。

除非命令输出确认已搜索注册的归档，否则不要断定某个会话、主题、文件或操作不存在。所需归档不可用属于硬配置错误。`--home` 和 `--main-only` 是有意绕过归档注册表的精确诊断范围；任一标志的结果都不能支持对整个历史记录作出的缺失断言。

完整的来源集合是必要条件，但并不充分——即使覆盖了所有来源，还有三种故障模式会导致错误的“未找到”结果，每种模式都有专门的扩展搜索方式（脚本会在匹配数为零时自动打印这些方式）：

1. **项目猜测错误。** 你搜索了一个项目，但对话实际发生在另一个项目中。扩展方式：`--all-projects` 一次扫描所有项目。
2. **工具错误。** 对话发生在 Codex 或 Kimi CLI 中，它们的 rollout/wire 日志存储在独立位置，Claude 注册表不会覆盖这些位置。扩展方式：`--codex` 和 `--kimi`（两者均需显式启用；如果项目同时使用了这两种工具进行开发，请同时传入这两个选项）。
3. **措辞漂移。** 记忆中的引文与实际措辞在标点或少数词语上有所不同，因此精确短语搜索未命中。扩展方式：重试更短且具有辨识度的子字符串。

有一个会与上述三种情况同时出现的陷阱：**当前会话始终会匹配你刚刚输入的短语**（skill 参数、你的命令以及此处的推理都会写入其记录）。排名靠前且范围从几分钟前开始的结果几乎肯定就是当前会话——请通过内部范围确认，然后使用 `--exclude-session <id>` 重新运行，以查看真正的结果。

## 会话文件位置

每个 Claude 历史记录根目录都将会话存储在
`<history-root>/projects/<encoded-project-path>/<session-id>.jsonl`。活动根目录会自动发现。持久归档根目录在 `~/.claude/history-sources.json` 中配置一次，之后默认会被纳入搜索范围。

Claude 还可能将检查点负载保存在
`<history-root>/file-history/<session-id>/<opaque-backup-name>`。JSONL 中的 `file-history-snapshot.snapshot.trackedFileBackups` 映射会将每个原始路径连接到其不透明备份名称和版本。这个伴随存储与 `projects/` 分开；仅将 JSONL 复制到长期归档中，并不能证明其检查点字节也已复制。该格式是观察到的 Claude Code 运行时细节，而不是有文档说明的稳定 API，因此，随附的恢复解析器会验证所选映射、版本/名称一致性、路径包含关系以及字节身份；当这些事实不一致时，它会明确失败。

**目录名称是项目绝对工作目录路径，其中每个 `/` 都被替换为 `-`——绝不是基本名称。** 例如，`/Users/<name>/Desktop/my-app` 会变为 `-Users-<name>-Desktop-my-app`，因此单独的 `my-app` 无法直接匹配某个目录。

**在断定项目没有历史记录之前，请使用其默认源集合运行捆绑命令。不要根据失败的 `ls` 推断历史记录不存在：**

```bash
python3 scripts/analyze_sessions.py list /path/to/project
python3 scripts/analyze_sessions.py search /path/to/project '<keyword>'
```

返回空结果的 `ls <basename>` 表示查询使用了错误的名称，**并不意味着没有历史记录**。捆绑的 `analyze_sessions.py` 会展开 `~`、解析绝对路径，在必要时回退到无歧义的基本名称反向查找，并搜索每个已配置的源。优先向它传入完整的绝对项目路径；也接受 `~`、相对路径和单独的名称。

注意：从 **Claude Desktop 的 cowork / 内置 Claude Code 模式**运行的会话也会存放在这里（Desktop 运行的是捆绑的 CLI）；只有 Desktop 的*原生*聊天存储在其他位置（一个 LevelDB 存储，而不是 JSONL）。因此，“它是在 Desktop 中运行的”并不意味着它不在 `~/.claude/projects/` 中。

### 活跃配置与长期归档 — 默认一并搜索

`~/.claude` 只是*默认*主目录。任何通过按模型配置文件使用**第三方模型**运行 Claude Code 的人（每个配置文件都有自己的 `CLAUDE_CONFIG_DIR`），都会积累永远不会接触 `~/.claude` 的**并行历史记录**：

- `~/.claude-profiles/<name>/projects/…` — 每个配置文件一个（例如 `kimi`、`deepseek`、`glm`、`step` 配置文件）
- `~/.claude-<name>/projects/…` — 偶尔存在的同级主目录
- 当前 shell 中 `CLAUDE_CONFIG_DIR` 所指向的任何位置

长期归档是第二个独立的源类别。活跃目录可能只保留最近的会话，而归档会在较旧的 JSONL 文件从活跃目录树中消失后继续保留它们。因此，仅限于活跃主目录的搜索可能会产生与仅搜索主目录相同的假阴性结果。

`analyze_sessions.py` 同时处理这两类源：**`list` 和 `search` 会自动发现每个活跃主目录并加载归档注册表**，按 ID 对会话去重，合并不同副本中的内部范围，并保留每个源标签作为溯源信息。关键词搜索会流式处理每个物理副本并对相同记录去重，因此仅存在于归档中的记录不会因为较新的活跃副本拥有相同的会话 ID 而消失。仅在进行有意的诊断时才对其限定范围：

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

**不要使用临时的原始 grep 来证明不存在。**它必须独立解析注册表，覆盖每个处于活动状态的根目录，搜索非消息事件负载，并将日期应用于内部记录时间戳；捆绑脚本已经完成了这些工作。

有关详细的 JSONL 结构和提取模式，请参阅 `references/session_file_format.md`。

## 核心操作

### 1. 列出项目的会话

查找特定项目的所有会话文件：

```bash
python3 scripts/analyze_sessions.py list /path/to/project
```

会话按其内部 JSONL 时间戳的最大值排序，并显示完整的内部时间范围、大小、路径和来源信息。绝不会使用文件 mtime。

可选参数：`--limit N` 仅显示 N 个会话（默认为：10），`--from-date` 或 `--to-date` 保留内部时间范围与请求时间窗口重叠的会话。`--all-projects` 列出每个项目（按编码后的项目名称分组）；`--exclude-session <id>`（可重复）跳过指定会话。

### 2. 按关键词搜索会话

查找包含特定内容的会话：

```bash
python3 scripts/analyze_sessions.py search /path/to/project keyword1 keyword2
```

返回按关键词出现频率排序的会话，并包含：
- 提及总数
- 每个关键词的细分统计
- 会话及匹配记录的内部时间范围
- 匹配字段类型、会话来源和匹配来源
- 主要匹配路径以及其他匹配副本

搜索范围包括消息、思考文本（不包括签名）、工具输入/结果、队列操作内容、附件、最后提示词、系统/摘要内容、自定义标题，以及文件历史快照中的原始路径。可选参数：`--case-sensitive` 区分大小写；`--from-date` 和 `--to-date` 按匹配记录自身的内部时间戳限制匹配范围，而不是依据会话 mtime。`--exclude-session <id>`（可重复）排除会话——当你搜索刚刚输入的某个短语时，请始终传入当前会话的 id，因为你自己的命令会使当前会话匹配。

Claude 将主代理发送给子代理的提示词存储为用户侧的 `isSidechain` 记录。精确搜索默认排除这类具有散文形态的记录，同时保留助手侧的子代理输出以及旁路链中的 `tool_result` 证据。仅当子代理收到的指令本身是搜索目标时，才添加 `--include-agent-prompts`。

仅包含日期的边界涵盖整个本地日历日。日期时间边界必须带有 `Z` 或显式的 UTC 偏移量。当日期筛选处于活动状态时，没有有效内部时间戳的记录会被排除，并显示可见提示；迁移或复制后绝不能使用文件 mtime 进行替代。

### 2a. 项目未知时进行搜索 — `--all-projects`

必需的项目参数编码的是一个猜测；当猜测错误时，限定项目范围的搜索会报告错误的“未找到”。此时应省略位置参数，改为扫描每个项目（`list` 接受相同的标志）：

```bash
python3 scripts/analyze_sessions.py search --all-projects 'some phrase'
```

使用 `--all-projects` 时，每个位置参数都是一个关键词，因此可以进行多关键词搜索：`search --all-projects keyword1 keyword2`。不使用该标志时，第一个位置参数是项目路径，其余参数是关键词。

预期输出：遍历所有来源中每个项目的会话一次，
并在每个命中项中使用一行 `Project:` 指明编码后的项目目录。这是一次完整的历史记录扫描——在大型目录树上预计需要几分钟，而不是几秒。

### 2b. 包含 Codex 历史记录 — `--codex`

Claude Code 并不是唯一拥有历史记录的工具。Codex 将运行记录保存在
`<codex-home>/sessions/<YYYY>/<MM>/<DD>/rollout-*.jsonl` 以及
`archived_sessions/` 中（codex home = `--codex-home`、`$CODEX_HOME` 或
`~/.codex`）。它们的架构不同于 Claude，因此默认搜索会完全跳过这些记录；`--codex` 会添加一次运行记录扫描：

```bash
python3 scripts/analyze_sessions.py search /path/to/project 'some phrase' --codex
```

如果你已经有确切的 Codex 会话 UUID，**不要将其作为对话文本进行搜索**。请使用元数据快速路径：

```bash
python3 scripts/analyze_sessions.py locate-codex \
  01234567-89ab-4cde-8fab-0123456789ab
```

定位器只会对文件名中带有该 UUID 的文件执行 glob，读取每个候选文件中有界的
`session_meta`，并验证权威的 `session_meta.id`。它不会解析无关的运行记录正文。为确保安全，`search ... --codex`
会在 Claude 或 Codex 历史记录扫描开始之前，自动将单独的 UUID 关键词路由到同一个定位器。

广泛的 Codex 搜索每 15 秒输出一次进度心跳，默认在 300 秒后停止。同一个计时器涵盖运行记录发现、原生
`rg`/`grep` 预过滤和结构化 JSONL 解析。超时或遇到任何不可读取/格式错误的候选文件时，程序会以非零状态退出，并明确拒绝将部分匹配结果呈现为完整结果。请按项目/日期缩小范围，或使用
`locate-codex`；当确实需要进行穷举式关键词搜索时，`--codex-max-scan-seconds 0` 可显式选择不受时限的扫描。

Codex 命中项会在其专属部分（📦）中输出，其中包含会话 id、cwd、内部范围、提及次数和匹配字段。项目位置参数会根据运行记录的
`session_meta` cwd（递归匹配）过滤运行记录；使用
`--all-projects` 时会搜索所有运行记录。`event_msg` 消息镜像严格重复了
`response_item` 消息文本，因此只会计数一次。运行记录的结构已记录在
`references/session_file_format.md` 中。

`--codex` **仅扩大搜索范围**。Codex 运行记录不包含 Claude 的
文件历史映射，因此 `recover_content.py` 会以明确的边界错误拒绝 Codex 运行记录，而不是返回一个看似成功但实际为空的恢复结果。

### 2c. 包含 Kimi CLI 历史记录 — `--kimi`

Kimi CLI（kimi-code）将会话保存在
`<kimi-home>/sessions/wd_<workspace>_<hash>/session_<uuid>/agents/<agent>/wire.jsonl` 中，
并为每个会话提供一个 `state.json`，其中包含 id/cwd/title 以及以毫秒为单位的
created/updated 边界（kimi home = `--kimi-home`、`$KIMI_HOME` 或
`~/.kimi-code`）。wire 架构不同于 Claude 和 Codex，因此默认搜索会完全跳过这些记录；`--kimi` 会添加一次 wire 扫描：

```bash
python3 scripts/analyze_sessions.py search /path/to/project 'some phrase' --kimi
```

Kimi 命中项会在其专属部分（🌙）中输出，其中包含会话 id、标题、cwd、
内部范围、提及次数和匹配字段。项目位置参数会根据会话的
`state.json` cwd（递归匹配）过滤会话；使用
`--all-projects` 时会搜索所有会话。子代理 wire
（`agents/agent-N/`）是同一对话的多次运行，因此匹配结果会在会话级别聚合，并在每个匹配字段前加上代理名称（例如
`main:message`、`agent-0:tool_input`）。可搜索的内容范围是对话本身——提示（`turn.prompt` / `turn.steer`，无论
`origin` 为何都会建立索引；搜索会刻意采用宽松策略）、追加的消息、助手内容部分、工具调用和工具结果。静态的
样板内容（配置/配置文件系统提示、工具快照、使用量/token 指标）会被有意排除在索引之外：如果某个关键词只出现在共享系统提示中，它就会匹配每个会话，而这个工具受信赖要针对对话内容给出“未找到”的结果。

`--kimi` 仅扩大**搜索范围**，其行为与 `--codex` 完全一致。Kimi wire 日志不包含 Claude 的文件历史映射，因此文件恢复仍然仅支持 Claude Code JSONL；不要将 Kimi wire 路径传给 `recover_content.py`。`--codex` 和 `--kimi` 可以组合使用——同时使用这两种工具开发的项目需要在同一命令中同时指定这两个标志。

脚本打印的零匹配提示已经会指出尚未应用的 `--all-projects` / `--codex` / `--kimi` / 更短的子字符串中的相应选项——在断定某项内容不存在之前，请先阅读 stderr。

### 2d. 措辞发生变化时的排序召回

当你记得含义但不记得确切措辞时，可以使用可选的混合索引：

```bash
python3 scripts/history_index.py recall 'meaning remembered, wording forgotten'
```

这是针对 Claude 用户/助手文本的候选生成器，不能替代精确搜索，也绝不能作为某项内容不存在的证据。结果包含项目、会话 ID、来源标签、内部时间戳、路径和片段，因此原始 JSONL 仍是证据来源。设置、版本化重建、增量刷新、BM25/向量模式、新鲜度状态、平台边界和实际冒烟检查均记录在 `references/hybrid_history_recall.md` 中；首次使用或维护前请阅读该参考文档。

### 3. 恢复已删除的内容

从选定的会话中恢复文件：

```bash
python3 scripts/recover_content.py <session-path-from-search>
```

对于每个路径，默认模式会合并同一会话 ID 的所有已知副本，选择最新的有效文件历史检查点，并从活动存储或已注册的归档伴随存储中恢复其精确字节内容。这样可以捕获之后的 Edit 或由 shell 驱动的更改，也可以恢复二进制文件或没有 Write 工具调用的文件。之后出现的 `backupFileName: null` 表示删除墓碑：恢复最后一个可用检查点，并在报告中说明之后发生了删除。如果某个路径没有可用的快照检查点，脚本会恢复最近一次 Write 调用，并在 `recovery_report.txt` 中将其标记为保真度较低。如果某次 Write 匹配的 `tool_result` 明确包含 `is_error: true`，则会跳过该次 Write；尝试写入并不构成检查点。原始目录结构会保留在 `./recovered_content/` 下。

**按关键词筛选**：

```bash
python3 scripts/recover_content.py <session-path-from-search> \
  -k ModelLoading FRONTEND deleted
```

仅恢复路径中匹配任意关键词的文件。

**自定义输出目录**：

```bash
python3 scripts/recover_content.py <session-path-from-search> -o ./my_recovery/
```

已注册的归档根目录和同一 ID 的 JSONL 副本会自动包含在内。如果未注册的伴随检查点存储位于其他位置，请添加直接包含 `<session-id>/` 目录的根目录：

```bash
python3 scripts/recover_content.py <session-path-from-search> \
  --file-history-root /path/to/file-history \
  -o ./my_recovery/
```

没有其所引用备份的快照元数据属于保真度错误：恢复会在写入任何选定文件之前中止，而不是悄悄替换为过时的 Write 内容。只有在用户明确接受之后的 Edit 或 shell 更改可能缺失时，才使用 `--write-only`。

### 4. 分析会话统计信息

获取详细的会话指标：

```bash
python3 scripts/analyze_sessions.py stats /path/to/session.jsonl
```

报告内容：
- 消息数量（用户/助手）
- 工具使用明细
- 文件操作数量（Write/Edit/Read）

可选参数：`--show-files` 用于列出所有文件操作。

### 5. 提取用户的逐字消息

生成一份用户实际输入内容的阅读页面——涵盖所有主目录和归档中的每条用户消息，并将 harness 噪声归入附录：

```bash
python3 scripts/extract_user_messages.py --days 7
```

默认将 `~/.claude-flow-viewer/user-words.html`（主要输出）和 `.md` 写入磁盘——这是一个持久化路径；避免使用 `/tmp`（操作系统会清理该目录）。传入一个 `OUT_BASE` 位置参数即可写入其他位置。有用的选项包括：`--group-by project|day`（默认为 `project`）、`--min-dup N`（模板文本频率阈值）、`--home <path>`（精确范围，可重复指定）。

这项任务的难点不在于解析，而在于判断*作者身份*：一条 `user` 记录不一定是用户亲自编写的。提取器实现了 `references/session_file_format.md` 中的五类污染处理——命令封装、hook/循环注入的模板文本（通过频率检测，同时处理独立形式和追加到末尾的形式）、`[Image #N]` 占位符、整篇文档粘贴内容，以及代理以用户口吻重新注入的内容（与更早的 assistant 文本进行内容匹配）——并从 `attachment.queued_command` 记录中恢复中途输入，再与之后传递的用户记录进行去重。修改过滤器前，请先阅读该参考文档中的对应章节。

### 6. 分流会话结束状态（崩溃恢复 / 待办审计）

对某个时间范围或项目中的会话结束方式进行分类，并打印每个会话的完整最后一条 assistant 消息——用于回答“哪些会话被重启/崩溃中断了”或“哪些较早的会话仍在等待回复，而不是已经真正完成”：

```bash
python3 scripts/analyze_sessions.py triage --all-projects \
  --from-date 2026-08-05T12:30:00+00:00 --to-date 2026-08-05T13:05:00+00:00
```

报告每个属于范围内的会话的会话 ID（始终完整显示，绝不截断——可直接将其复制到任何后续报告中）、cwd，以及五种结构化 `kind` 之一：`interrupted_explicit`（会话的最后一条相关记录是明确的中断标记）、`net_error`（最后一个 assistant 回合因 API/传输错误而终止）、`done`（最后一个 assistant 回合生成了真实文本，且不是以 API 错误开头）、`empty`（完全没有 assistant 回合），或 `stuck_no_result`——其他所有形态的兜底类别，因为对于分流而言，它们都意味着同一件事：**最后一个回合没有生成文本回复，因此文件停止记录时模型仍在工作。** 这包括仍在等待结果的工具调用、工具调用的结果已经到达但之后没有 assistant 回合跟进的情况（harness 很可能在结果到达与捕获模型下一回合之间停止了），以及最后一个回合只有思考内容或以其他方式为空的情况。

**`done` 是一个结构化标签，并不表示没有任何事项待处理。** 会话可能恰好以一个干净的 `text` 块结束，因为 assistant 提出了某个发现、决定或问题，却始终没有得到回复——要区分“完全收尾”与“等待你的回复”，需要阅读打印出的 `last_assistant_text`。这也是该命令默认打印其中最多 4000 个字符（使用 `--tail-chars 0` 可取消上限）的原因，而不是打印一段截断的标题。关于完整的判断依据，请参阅 `references/session_file_format.md` 中的“检测会话中断”，其中还解释了为什么这与 `kind` 字段实际上是不同的维度。

有用的标志：`--kind KIND`（可重复，用于限制为特定种类——例如
`--kind stuck_no_result --kind interrupted_explicit` 表示“仅包含崩溃可能合理解释的
项目”）；`--exclude-title-prefix TEXT`（可重复——排除其开场提示以 TEXT
开头的会话，用于项目自身的自动化约定，例如始终以相同固定提示开头的代码审查钩子；这些会话通常会在分类检查中占据主导，因为它们以例行的结构化工具调用结束，而不是被中断）；`--tail-chars N`
（限制打印的最后一段 assistant 文本；默认值为 4000，0 = 不限制）。与
`list` 共享 `--from-date`/`--to-date`/`--home`/`--main-only`/`--history-sources`，
并与 `list` 和 `search` 共享 `--all-projects`/project-path/`--exclude-session`。

## 工作流示例

有关文件恢复、跟踪文件演变和批量操作的详细工作流示例，请参阅
`references/workflow_examples.md`。

## 恢复最佳实践

### 去重

`recover_content.py` 会合并具有相同 ID 的会话副本，为每个原始路径保留最高的
文件历史版本，并在版本相同的情况下使用检查点时间戳。较晚的删除墓碑不会抹去较早的可恢复备份；
它只会改变报告的状态。对于没有可用检查点的路径，恢复过程会保留内部时间戳最新的
Write 调用。不同副本之间的物理 JSONL 行顺序不会被视为充分的时间证据，并且显式失败的
Write 工具结果会将该次尝试的 Write 排除在恢复范围之外。

### 关键词选择

选择具有区分度且出现在以下位置的关键词：
- 文件名或路径
- 函数名/类名
- 代码中的唯一字符串
- 错误消息或注释

### 输出组织

创建具有描述性的输出目录：

```bash
# Bad
python3 scripts/recover_content.py session.jsonl -o ./output/

# Good
python3 scripts/recover_content.py session.jsonl -o ./recovered_deleted_docs/
python3 scripts/recover_content.py session.jsonl -o ./feature_xy_history/
```

### 验证

恢复后，务必验证内容：

```bash
# Check directory structure (files preserved in subdirectories)
find ./recovered_content/ -type f

# Read recovery report (shows full output paths)
cat ./recovered_content/recovery_report.txt

# Spot-check content and compare the report's SHA-256 with the source backup
head -20 ./recovered_content/src/components/ImportantFile.jsx
```

将 `Source: file-history` 及其 SHA-256 视为精确的已捕获检查点证据。将
`Source: Write` 视为可恢复的检查点，而不是文件最终状态的证明。

## 局限性

### 可以恢复的内容

✅ 可用文件历史快照所引用的确切字节
✅ 伴随文件历史存储中存在的二进制文件
✅ 一旦后续检查点捕获了内容，便可恢复通过 Edit 或 shell 命令修改的文件
✅ 在不存在快照元数据时，使用 Write 写入的文件（保真度较低）
✅ 消息或工具结果中明确存在的文本（手动提取）

### 无法恢复的内容

❌ 从未写入磁盘的文件（仅被讨论过）
❌ 会话开始前已删除的文件
❌ 已删除或未与归档 JSONL 一起复制的快照负载
❌ 会话中未捕获的外部工具输出

Edit/Read 记录可以揭示路径和 Edit 增量，但它们本身并不是完整的文件恢复来源。

### 文件版本

- 文件历史备份是精确捕获的检查点，并不保证此后没有发生未经检查点记录的文件系统更改。
- 如果没有文件历史条目，Write 恢复无法重建之后的 Edit 或 shell 更改；Edit 记录包含的是增量，而不是文件最终结果的完整内容。
- 文件历史 JSONL/存储契约是运行时观察到的，未来可能发生变化；格式错误或相互冲突的元数据必须明确失败，而不能靠猜测处理。

## 故障排除

### 未找到会话

```bash
# Re-run with the full absolute project path and the default source set.
python3 scripts/analyze_sessions.py list /absolute/path/to/project

# Inspect a custom registry only when diagnosing its configuration.
python3 scripts/analyze_sessions.py list /absolute/path/to/project \
  --history-sources /path/to/history-sources.json
```

**“Not found”通常意味着项目标识错误或来源集合不完整。**
确认输出包含 `Searched N source(s)`，并同时包含预期的
`active:<label>` 和 `archive:<label>` 条目。如果使用了 `--main-only` 或 `--home`，请在不带这些选项的情况下重新运行。缺失的必需归档必须修复，或有意修改其注册表条目；不要静默忽略错误并声称会话不存在。如果确认来源集合完整，请按照完整性不变量部分中的逐步扩大范围策略操作：`--all-projects` →
`--codex` → `--kimi` → 更短的子字符串，并使用 `--exclude-session` 排除当前会话。

### 恢复结果为空

可能的原因：
- 关键词与会话中的文件路径不匹配
- 会话早于文件创建时间
- 该路径从未被文件历史或 Write 捕获

解决方案：
- 尝试使用 `--show-edits` 标志查看 Edit 操作
- 扩大关键词搜索范围
- 搜索相邻会话
- 如果精确备份错误指出缺少配套存储，请找到它并传入
  `--file-history-root`；不要声称旧的 Write 检查点是最终版本

### 会话文件过大

对于大于 100MB 的会话：
- 逐行流式搜索 JSONL，而不是将整个会话加载到内存中。
- 恢复过程会分块复制精确的备份字节，并且只保留五条轻量级 Edit 摘要，绝不保留完整的 Edit old/new 载荷。
- 恢复过程仍会保留有效的 Write 载荷以及复制联合所需的记录指纹，因此内存占用并非常量。使用 `-k` 限制恢复范围，并预计运行时间会随着发现的物理副本数量增加而增长。

## 安全与隐私

### 分享恢复内容之前

会话文件可能包含：
- 带有用户名的绝对路径
- API 密钥或凭据
- 公司特定信息

分享之前务必进行清理：

```bash
# Read-only audit; review every hit before creating a separate redacted copy.
rg -n --hidden -S \
  '(api[_-]?key|password|token|secret|/Users/[^/]+/|/home/[^/]+/)' \
  recovered_content/
```

`recovery_report.txt` 同样敏感：其中记录了请求的会话副本、原始绝对路径、检查点位置和输出路径。请将报告与恢复的文件一起进行审查和脱敏；默认不要分享该报告。

### 安全存储

恢复的内容会继承原始会话的敏感性。请安全存储，并遵循组织关于处理会话数据的政策。

## 下一步：继续中断的工作

找到相关的会话历史记录后，建议继续进行工作：

```
Found [N] relevant sessions with recoverable context.

Options:
A) Resume work — run /daymade-claude-code:continue-claude-work to pick up where you left off (Recommended)
B) Just show me the content — I'll decide what to do with it
```

## 维护者验证

在源代码仓库中，`daymade-claude-code/_conversation_core/` 是此技能、`local-conversation-history`、`continue-claude-work` 和 `continue-codex-work` 共享的代码 SSOT。`sync_core.py` 会将该软件包打包到每个技能的 `scripts/_core/` 中；不要直接编辑已打包的副本。

完成共享代码更改后，同步并验证全部四个副本，然后运行 finder 的隔离测试夹具，包括版本化的召回索引：

```text
uv run python ../sync_core.py sync
uv run python ../sync_core.py check
python -m unittest discover -s tests -p "test_*.py"
```