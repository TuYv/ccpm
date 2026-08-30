---
name: prior-work-retrieval
description: >-
  Only for explicit prior-work/reuse/history requests; never for read-only status or inspection.
  Finds and verifies existing successful work before substantial new production when reuse is
  materially plausible. Use when the user explicitly references earlier work, existing code/SOPs,
  history, prior decisions, another project, or says 以前做过, 已有代码, 别重复造轮子, reuse, or
  retrieve before produce. A mention of current/现有 tests, README, files, implementation, behavior,
  or validation is not a prior-work request. Do not infer the trigger merely because new work might
  duplicate something. Do not invoke for current-file inspection, ordinary bug fixes, mechanical
  verification, or merely because the final answer is a report/summary.
  Produces a source-verified reuse/adapt/reject receipt; zero hits never prove absence.
argument-hint: "<task or question>"
---
# 既有工作检索

仅当上面的触发条件存在时，才在进行大量产出**之前**运行此流程。只读的当前状态检查仍应直接进行，除非用户要求查看历史记录。它的目的不是再生成一份摘要，而是回答：**已经存在什么、哪个来源是当前版本、应该复用什么，以及哪些内容确实是新的？**

## 完成标准

只有同时满足以下五点，检索流程才算完成：

1. 将任务真正的业务结果写成一句话。
2. manifest 中声明的每个相关载体都报告为 `searched`、`manual_completed`，或明确的失败/覆盖范围缺口。
3. 候选声明必须在其原始路径或记录中打开查看，不能仅凭搜索结果片段接受。
4. 每个采用的项目都必须有 `reuse` 或 `adapt` 决策，并附上与当前任务相关的理由。如果没有采用任何项目，回执中必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的回执。

`retrieved` 不等于 `verified`；`verified` 不等于 `reused`。请保持这些状态彼此分离，避免“我搜索过了”冒充“我使用了之前最好的工作”。

## 工作流

### 1. 先读取本地运行上下文

在进行查询之前，先读取当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及它们指定的任何 North Star/当前决策文件。历史材料不能覆盖更新的明确决策。

### 2. 验证显式源 manifest

manifest 是唯一的发现范围。某个目录不会仅仅因为某种约定认为它应该存在就实际存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

默认值为 `~/.config/daymade/prior-work/sources.json`；项目可以指定其他路径。全局选项必须放在子命令之前。schema 和载体示例位于 `references/source-manifest.md`。

### 3. 跨已声明的载体进行检索

将用户世界中的结果与拟议的实现方式分开书写。然后提供两组术语：

- `--outcome-term`：1–5 个工件/事件/实体/日期术语，用于定位已经完成的结果（已接受的交付物、规范 transcript、已部署的服务、决策或运行证据）。
- `--term`：1–8 个实现术语（代码符号、旧工作流名称、技术名词、故障症状）。

运行时会将业务结果查询发送到文档、会议、档案和对话中；将实现查询发送到代码和 Skill 载体中。结果候选项会优先排序。因此，代码搜索不再能够代替检查所请求的结果是否已经存在。不要单独传入“做 / 优化 / 系统”等通用动词。

```bash
uv run --no-project python scripts/prior_work.py retrieve \
  --business-outcome 'the observable result the user actually needs' \
  --outcome-term 'accepted artifact, entity, event, or date' \
  --query 'the implementation or workflow currently being considered' \
  --term 'distinctive entity' \
  --term 'old workflow name' \
  --term 'failure symptom' \
  --session-id "$CODEX_SESSION_ID"
```

`--session-id`：仅将其与 `retrieve`、`complete` 和 `check` 一起使用；`validate-manifest`
不接受该参数。在 Codex 中使用 `$CODEX_SESSION_ID`。Claude Code 没有这样的环境
变量，因此请使用 prior-work hook 消息中逐字传递的确切 id
（UserPromptSubmit inject / PreToolUse deny / Stop block）。其旁显示的回执文件名是
该 id 的 sha256，而不是 id 本身；在猜测的 id 下完成回执会写入一个 `check` 永远不会读取的
文件，门禁也会持续拒绝。绝不要用看起来像哈希的文件名替代 id。

当某个通常可选的实时载体对请求至关重要时，请显式提升其要求级别：`--require-source live-wechat`。在记录该手动路径之前，回执无法完成。

该命令使用 `rg` 搜索文件系统载体，调用显式声明的命令适配器（例如正式的 Claude-history finder），并展示实时微信等手动路径。内容搜索始终受声明的 glob 限制；仅当某个结果/实现术语明确呈现为路径形式（文件名、路径或 ISO 日期）时，才会枚举完整路径。像
`project_doc_max_bytes` 这样的符号不足以证明应遍历工作区中的每个文件名。
该命令会在 manifest 的 `state_dir` 下写入不可变的运行 JSON，并返回其 `run_id`。

如果某个必需载体表示 `manual_required`，请执行指定的 Skill 路径，并在完成前记录其结果。在本地搜索微信存档不能证明覆盖了实时微信；对话索引不能证明覆盖了会议或代码。

### 4. 在权威来源处验证候选项

在其原始路径打开有希望的候选项。检查：

- **匹配度**：它是否解决了相同的业务问题，而不仅仅是共享某些词语？
- **权威性**：当前实现/SSOT 优先于历史提案；
  原始记录能够证明曾经说过什么，但不能证明其当前仍然正确。
- **时效性**：比较当前 Git HEAD、文件 mtime、决策日期以及任何
  superseded 标记。不要使用存档内容覆盖当前行为。
- **结果证据**：相较于仅仅看起来已完成的流程，优先选择代码/测试/已接受的交付物以及实际运行结果。

### 5. 完成复用回执

对你实际检查过的项目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何项目符合条件，请将经验证的不匹配原因传给 `--no-reuse-reason`。 “没有命中”
不是理由；它只是一次检索观察，可能需要扩大术语范围或解决失败的载体。

已完成的回执会保留 `business_outcome` 和 `outcome_terms`；`check`
会拒绝缺少这两个字段的旧版或手工构造的回执。回执时效性绑定于**必需**载体的定义。
编辑可选载体不会使已经验证的必需覆盖失效；但更改必需的根路径、路由、模式、权威来源或限制条件会使其失效。完整的 manifest 哈希仍作为溯源信息保留。
然后验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有在此检查通过后，才应开始实质性的生产工作。在实现/计划中引用所采用的候选项 ID，使回执与结果建立关联，而不是让回执沦为形式主义的文书工作。

## 配套 hooks

清单有效且自测通过后再进行安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

安装程序会向 Claude 和 Codex 各添加三个处理器，不会替换无关的 hooks：

- `UserPromptSubmit` 仅在检测到明确的既有工作/复用/历史信号时，创建作用域为当前提示的要求，并注入 Skill 路由。五个过滤器确保该信号不会因用户未提出的事项而触发：
  - **不能把用户之外的内容当作用户发言。** 内部模板（`You are a/an …`、`# Overview`）、工具链封装（`<agent-message …>`、`<task-notification …>`、`<system-reminder …>`）以及粘贴的对话记录行（`⏺ …`）都会以提示的形式到达此处理器。它们绝不会激活要求。
  - **执行器无法满足的要求不应设置门槛。** 禁止读取 skills 或运行 shell 的提示，已经移除了完成回执所需的能力；为其设置门槛会在没有解除路径的情况下阻塞工作。对于明确表示退出既有工作检索的提示，会按人们实际使用的拼写方式予以遵从（`Do NOT perform prior-work retrieval`、`opts out of prior-work retrieval`），而不只是识别 `skip`/`disable`。
  - **否定复用。** “不要复用 X”、“别沿用”、`don't reuse` 表示拒绝采用既有工作；将某项工作描述为很久以前的旧内容（“很久之前写的”）表示它可能已经过时，而不是要求查找它。这两类内容都会在匹配前被排除，因此同一句中真正的请求仍会被计入；而“别重复造轮子”/“不希望你重新造”是在要求复用，因此仍会激活要求。
  - **含糊的回忆需要远距离指称。** 上次 / 好像是 / 我记得是 / 记不清只有在与带有远距离或不定指示词的工作名词（那个/某个/哪个 脚本）同时出现时才会激活，因为这个脚本就是眼前的对象——“这个脚本好像是死循环”是 bug 报告，而不是回忆请求。单独出现的 `history` 同样需要一个承载词（`conversation history`，而不是 `git history`）。
  - **有效回执已经覆盖当前会话。** 含糊表述的回忆不再创建新的要求，以免已完成的回执被置于无效状态。明确提出的新既有工作请求仍会创建要求。

运行 `scripts/prior_work.py audit`，查看门控行为是否正常：它会报告触发类型、空门控率（已激活但从未产生回执的要求——这是对无法遵从的内容设置门槛的特征）、无对应要求的回执、非用户输入触发的要求，以及每个仍会触发的条目背后匹配到的词元。使用 `--json` 获取机器可读的输出。应根据这个数字判断门控效果，而不是根据它自身的测试是否通过。
- `PreToolUse` 仅在该明确要求已经存在且缺少有效回执时，阻止实质性写入。它绝不会将普通写入转换为检索义务。在要求处于激活状态时，只读探索和小型机械性编辑仍然可用。
- `Stop` 会验证已经存在的明确要求。它绝不会根据输出长度、代码、工具使用情况或一般性的生产请求凭空创建要求。

它将较窄的、未进行版本控制的 `recall-first-evidence` UserPromptSubmit
处理程序迁移到这个超集之中，同时将其脚本保留在磁盘上以便恢复。旧的触发词族（“我们之前”、“什么来着”、模糊记忆）都是回归测试。安装后运行机器的 profile-settings synchronizer，使每个
Claude profile 都获得主设置。Codex 需要通过 `/hooks` 进行一次人工信任审核；安装程序绝不会伪造这一审核。

用户可以明确表示不要为当前提示搜索先前的工作。这个选择退出会成为提示范围内的状态，而不是环境变量绕过机制。格式错误或缺失的 manifest 或 receipt 状态只有在实质性生产操作时才会 fail closed；只读调查以及恰好以 manifest 路径为目标的写入仍然可以进行，这样 agent 可以修复该门禁而不会绕过它。

## 搜索路由

| 需求 | 路由 |
|---|---|
| 已知的精确字符串、符号、路径 | 文件系统载体（`rg`） |
| 记得含义，但措辞发生变化 | 已声明的语义适配器（gbrain，或 Claude-history hybrid recall — 该索引仅覆盖 Claude 会话） |
| 先前 Claude 工具/思考/文件历史的精确证据 | `read-claude-code-history search` |
| 平台未知、涉及多个平台或并非 Claude 的先前对话证据 | `local-conversation-history`；每个 provider 都是独立存储，因此仅 Claude 的回答无法支持“我们从未讨论过它”这一说法 |
| 会议决策或发言者主张 | 项目转录载体；打开原始发言者话语 |
| 已归档的微信文本/语音转录 | 已声明的微信归档载体 |
| 实时/最新微信 | `read-wechat-messages`；记录手动覆盖范围 |
| 当前代码行为 | 在当前 Git revision 打开实现/测试 |

## 边界

- manifest 是显式的，并且与可变的索引状态分开进行版本控制。
- 搜索结果只是待验证的假设。receipt 记录验证和复用情况。
- 不要将私有项目数据复制到公共示例或 Skill fixture 中。
- 不要在必需的载体失败后静默回退。记录这一缺口。
- 外部网络研究应在本地先前工作之后开始，除非用户明确要求当前的外部事实，或本地证据无法回答。
- 此 Skill 是工作流。配套 hooks 可能要求在执行 `Write`/`Edit` 前获得新的 receipt；Stop 可能强制执行同一项已有义务，但最终答案的形式不能创建新的义务。Hooks 不决定哪个候选项是合适的。

## 维护者验证

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须包含真实的失败族：未加载跨项目规则、忽略已有的 provider contract、旧决策胜过北极星、声明了不存在的 artifact capability、遗漏相邻 agent 的证据，以及被全局“已搜索”声明掩盖的对话/会议/微信载体缺口。