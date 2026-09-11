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
# 先前工作检索

仅在**上方触发器出现**时，在开始实质性生产之前运行此流程。除非用户要求查看历史记录，否则只读当前状态检查应直接执行。其职责不是再生成一份摘要。其职责是回答：**已经存在什么、哪个来源是当前有效的、哪些内容应被复用、哪些内容是真正新增的？**

## 完成契约

一次检索通过仅在满足以下全部五项时才算完成：

1. 任务的真实商业成果已写为一句话。
2. 清单中声明的每个相关载体都报告了 `searched`、`manual_completed`，或明确的失败/覆盖缺口。
3. 候选主张在其原始路径或记录处打开，而不是仅凭搜索片段接受。
4. 每个采用的条目都具有 `reuse` 或 `adapt` 的决策，并且有与当前任务相关的理由。若未采用任何条目，记录必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的检索单据。

`retrieved` 不等于 `verified`；`verified` 不等于 `reused`。请将这些状态分开，以防“我已搜索”冒充“我使用了最佳既有工作”。

## 工作流

### 1. 首先读取本地运行上下文

在查询前，先读取当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及他们指定的任何 North Star/current-decision 文件。历史资料不能覆盖更新的明确决策。

### 2. 验证显式来源清单

该清单是唯一的发现范围。目录并非因为约定存在就自动存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

默认值为 `~/.config/daymade/prior-work/sources.json`；项目可能会指定其他路径。`schema` 与载体示例位于 `references/source-manifest.md`。

### 3. 在声明的载体中检索

将用户可见结果与拟议实现分开撰写。然后提供两组术语：

- `--outcome-term`：1–5 个可定位已有完成结果的术语（已验收交付物、规范记录、已部署服务、决策或运行依据）。
- `--term`：1–8 个实现术语（代码符号、旧工作流名称、技术名词、故障症状）。

运行时会将业务成果查询发送到文档、会议、归档和对话；将实现查询发送到代码和 Skill 载体。结果候选先按成果进行排序。因此，代码检索不再能代替检查请求结果是否已存在。不要只传入诸如“做 / 优化 / 系统”这类泛化动词。

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

`--session-id`：仅与 `retrieve`、`complete` 和 `check` 一起使用；`validate-manifest` 不接受该参数。在 Codex 中使用 `$CODEX_SESSION_ID`。Claude Code 没有该环境变量，因此请使用 prior-work hook 消息中逐字携带的确切 id（UserPromptSubmit inject / PreToolUse deny / Stop block）。与其并排显示的收据文件名是该 id 的 sha256，而非 id 本身；在猜测的 id 下完成收据会写入一个 `check` 永远不会读取的文件，门禁会持续拒绝。切勿用看起来像哈希的文件名替代 id。

当通常可选的 live carrier 对请求而言是关键时，应显式提升：`--require-source live-wechat`。在该手动路线被记录之前，收据无法完成。

该命令使用 `rg` 搜索文件系统 carriers，调用明确声明的命令适配器（例如正式的 Claude-history 查找器），并暴露诸如 live WeChat 的手动路线。内容搜索始终受已声明 globs 的限制；仅当 outcome/implementation 关键词本身明确具有路径形态（文件名、路径或 ISO 日期）时才进行完整路径枚举。像 `project_doc_max_bytes` 这样的符号不足以证明需要遍历工作区中的每个文件名。该命令在 manifest 的 `state_dir` 下写入一个不可变的 run JSON，并返回其 `run_id`。

如果必需 carrier 指示 `manual_required`，请在完成前执行该命名 Skill 路线并记录其结果。本地 WeChat 存档搜索不能证明 live WeChat 覆盖；会话索引也不能证明会议或代码覆盖。

### 4. 在权威性上验证候选项

打开有前景的候选项并访问其原始路径。检查：

- **匹配**：它是否解决同样的业务问题，而不仅仅是共享相同措辞？
- **权威性**：当前实现/SSOT 胜过历史提案；原始记录证明了当时所说内容，而非其仍然正确。
- **时效性**：比较当前 Git HEAD、文件 mtime、决策日期和任何 superseded 标记。不要使用归档内容覆盖当前行为。
- **结果证据**：优先采用代码/测试/已验收交付物和运行结果，而不是看起来完整的流程。

### 5. 完成复用收据

对你实际检查过的条目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何符合条件的项，请使用 `--no-reuse-reason` 并给出已核实的不匹配原因。“No hits”不是理由；它只是一次检索观察，可能需要拓宽检索词或解决失败的 carrier。

已完成的收据会保留 `business_outcome` 和 `outcome_terms`；`check` 会拒绝缺少任一字段的旧版或手工构建收据。收据时效性受 **required** carriers 定义的约束。编辑可选 carrier 不会使已验证的必需覆盖失效；更改必需的 root、route、mode、authority 或 limit 会使其失效。完整的 manifest hash 仍保持溯源性。然后验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有在此通过后，才应开始实质性的生产。请在 implementation/plan 中注明已采用的候选 ID，以便将凭据与结果连接起来，而不是流于形式的文书工作。

## 配套钩子

在 manifest 有效且自检通过后安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

版本化 wrapper 是同步 hook-runtime SSOT。它会解析一个
直接的 Python 解释器，并且从不进入包管理器/缓存生命周期；
请将上面的 `uv run ... prior_work.py` 命令保留为明确的检索和
凭据操作，而不要当作钩子启动器。

安装器会为 Claude 和 Codex 添加所需处理器，而不会替换不相关的钩子：

- `UserPromptSubmit` 仅针对明确的
  prior-work/reuse/history 信号创建提示范围内的需求，并注入 Skill 路由。过滤器确保该信号不会在用户未请求的内容上触发：
  - **非用户发言。** 内部模板（`You are a/an …`、`# Overview`）、harness 外壳（`<agent-message …>`、`<task-notification …>`、`<system-reminder …>`）和粘贴的对话记录行
    （`⏺ …`）都以提示形式到达该处理器。它们从不触发需求。
  - **执行器无法满足闸门。** 若提示禁止读取
    skills 或运行 shell，就已移除了完成凭据所需的能力；对其进行闸门拦截会导致工作被阻塞且无解锁路径。明确表示放弃 prior-work 检索的提示会按人们实际使用的表述被尊重（`Do NOT perform prior-work retrieval`、`opts out of prior-work retrieval`），而不仅仅是 `skip`/`disable`。
  - **否定复用。** “不要复用 X”、“别沿用”、`don't reuse` 表明
    prior work 不应采纳；将某事描述为“很久之前写的”意味着它是过时而非要求查找。两者都会在匹配前被剔除，因此同一句中的真实请求仍会计入，而“别重复造轮子 / 不希望你重新造”——该类请求是为了复用——仍会继续触发。
  - **含蓄召回需要远指代。** “上次” / “好像是” / “我记得是” / “记不清”
    只有在与带有远指代或不定限定词的工作名词（那个/某个/哪个 脚本）并列时才会触发，因为“这个脚本”是你眼前的对象——“这个
    脚本好像是死循环”是一个缺陷报告，不是召回。单独的 `history` 也同样
    需要一个承载项（`conversation history`，而不是 `git history`）。
  - **有效凭据已覆盖本次会话。** 含蓄措辞的召回不再创建新需求并将已完成的凭据悬置。明确的新 prior-work 请求仍会如此。

运行 `scripts/prior_work.py audit` 查看闸门是否正常：它会报告触发组合、空闸门率（已触发却未生成凭据的需求——这是对无法满足内容施加闸门的特征）、悬置的凭据、非用户输入触发，以及每个仍在触发条目背后的匹配 token。`--json` 用于机器可读输出。请以该数值判断闸门表现，而不是看其自身测试是否通过。
- `PreToolUse` 只在显式需求已存在且缺少有效凭据时阻止实质性写入。它不会把普通写入变成检索义务。只读发现和小规模机械性编辑在需求激活期间仍可进行。
- `Stop` 会验证一个已存在的显式需求。它不会基于输出长度、代码、工具使用或通用生产请求而虚构需求。

它将较窄的无版本化 `recall-first-evidence` `UserPromptSubmit` 处理器迁移到这个超集，同时将其脚本保留在磁盘上以便恢复。旧的触发族（“我们之前”、“什么来着”、fuzzy memory）是回归测试。安装后运行该机器的 profile-settings 同步器，以便每个 Claude profile 都接收主设置。Codex 需要通过 `/hooks` 进行一次人工信任审查；安装器从不伪造该审查。

用户可以明确表示当前提示词不需要检索历史工作。该选择会变为提示词作用域的状态，而不是环境变量绕过。识别到的表述会在同一句内将一个拒绝动词（不用/不要/不需要/跳过，或 skip/disable/opt out/do not perform）与一个检索名词（查历史/历史检索/prior-work/prior work/history retrieval）配对——单独的「不需要检索」不匹配。因此在门控中途给用户建议时，应引用完整有效表述，例如「本任务不需要 prior work 检索」。  
manifest 或 receipt 状态损坏/缺失只在实质性生产场景下 fail-closed；只读调查以及对 manifest 路径的精确写入仍然允许，以便代理可修复 gate 而不绕过它。

## Search routing

| Need | Route |
|---|---|
| 已知精确字符串、符号或路径 | 文件系统载体（`rg`） |
| 语义相同但措辞改变 | 声明式语义适配器（gbrain，或 Claude-history 混合检索——该索引仅覆盖 Claude 会话） |
| 精确的先前 Claude 工具/思考/文件历史证据 | `read-claude-code-history search` |
| 平台未知、复数或非 Claude 的先前对话证据 | `local-conversation-history`；每个 provider 都是独立存储，因此 Claude-only 的回答无法支撑“we never discussed it” |
| 会议决策或发言者主张 | 项目会议记录载体；打开原始发言回合 |
| 已归档的微信文本/语音转录 | 声明式微信归档载体 |
| 实时/最新微信 | `read-wechat-messages`；记录手动覆盖范围 |
| 当前代码行为 | 在当前 Git 修订版本中打开实现和测试 |

## Boundaries

- manifest 明确且与可变索引状态分开版本化。
- 搜索结果是“假设”。receipt 记录验证和复用。
- 不要把私有项目数据复制到公开示例或 Skill fixture 中。
- 不要在必需载体失败时悄然回退。要记录缺口。
- 除非用户明确要求当前外部事实，或本地证据无法回答问题，否则外部网络调研应在本地 prior work 之后进行。
- 本 Skill 即为该工作流。伴生 hooks 可能在 `Write`/`Edit` 之前要求新的 receipt；`Stop` 可能强制执行同样的既有义务，但最终答案形态不能创建新的义务。Hooks 不决定候选答案是否合格。

## Maintainer verification

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须包含真实的故障类别：跨项目规则未加载、已存在的 provider 合同被忽略、旧决策盖过 North Star、artifact 能力被声明为不存在、adjacent agent 的证据遗漏，以及由全局“searched”声明掩盖的 conversation/meeting/WeChat 载体缺失。