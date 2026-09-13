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

仅当存在上方触发条件时，才在进行大量生产工作之前运行此流程。只读的当前状态检查仍直接执行，除非用户要求查看历史。该流程的目的不是生成另一份摘要，而是回答：**已经存在什么、哪个来源是当前有效的、应复用什么，以及哪些内容确实是新的？**

## 完成标准

只有同时满足以下五项时，检索流程才算完成：

1. 任务的实际业务结果已用一句话写明。
2. 清单中声明的每个相关载体都报告为 `searched`、`manual_completed`，或明确的失败/覆盖范围缺口。
3. 候选声明已在其原始路径或记录中打开查看，不能仅依据搜索结果摘要接受。
4. 每个采用的项目都有 `reuse` 或 `adapt` 决策，并附有与当前任务相关的理由。如果没有采用任何项目，回执中必须包含具体的 `no_reuse_reason`。
5. `scripts/prior_work.py check` 接受本次会话的回执。

`retrieved` 不等于 `verified`；`verified` 也不等于 `reused`。应保持这些状态彼此独立，避免“我搜索过了”冒充“我使用了我们已有的最佳工作”。

## 工作流

### 1. 先阅读本地运行上下文

在查询之前，先阅读当前项目的 `AGENTS.md`/`CLAUDE.md`、导航索引，以及其中指定的任何 North Star/当前决策文件。历史材料不能覆盖更新的明确决策。

### 2. 验证显式来源清单

清单是唯一的发现范围。某个目录不会因为约定认为它应该存在就自动存在。默认路径：

```bash
uv run --no-project python scripts/prior_work.py \
  --manifest <path> validate-manifest
```

全局选项必须位于子命令之前。架构和载体示例位于 `references/source-manifest.md` 中。

### 3. 跨声明的载体执行检索

将用户实际世界中的结果与拟议实现分开书写。然后提供两组术语：

- `--outcome-term`：1–5 个工件/事件/实体/日期术语，用于定位已经完成的结果（已接受的交付物、规范记录、已部署的服务、决策或运营证据）。
- `--term`：1–8 个实现术语（代码符号、旧工作流名称、技术名词、故障症状）。

运行时会将业务结果查询发送到文档、会议、档案和对话中；将实现查询发送到代码和 Skill 载体中。结果候选项会优先排序。因此，代码搜索不再能够代替检查所请求的结果是否已经存在。不要只传入“做 / 优化 / 系统”等泛化动词。

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

不要重定向输出（`> /tmp/run.txt`）来保存它：这是有意设计的
（2026-08-27，在 `test_unquoted_redirection_even_after_
route_stays_gated` 中回归锁定），文件重定向即使对于只读路由命令也会触发
写入门禁，因此重定向的检索会被阻止，运行 JSON 也不会落到你指定的位置。
让输出直接打印，并从 transcript 中读取；持久化副本是 manifest 的
`state_dir` 下的运行 JSON（其 `run_path` 会在最后一行打印）。

`--session-id`：仅将它用于 `retrieve`、`complete` 和 `check`；`validate-manifest`
不接受它。在 Codex 中使用 `$CODEX_SESSION_ID`。Claude Code 没有此环境变量，
因此请从之前的工作钩子消息（UserPromptSubmit 注入 / PreToolUse 拒绝 / Stop
阻止）中逐字获取所携带的确切 id。其旁显示的回执文件名是该 id 的 sha256，
而不是 id 本身；使用猜测的 id 完成回执会写入一个 `check` 永远不会读取的文件，
门禁也会持续拒绝。绝不要将看起来像哈希的文件名替代 id。

当通常可选的实时载体对请求具有实质意义时，请显式提升其要求：
`--require-source live-wechat`。在记录该手动路由之前，回执无法完成。

该命令使用 `rg` 搜索文件系统载体，调用显式声明的命令适配器（例如正式的
Claude-history finder），并展示诸如实时微信之类的手动路由。内容搜索始终受
已声明的 glob 限制；只有当 outcome/implementation 术语明确呈现为路径形式
（文件名、路径或 ISO 日期）时，才会执行完整路径枚举。在工作区中遍历每个
文件名没有依据；诸如 `project_doc_max_bytes` 这样的符号并不能证明需要这样做。
该命令会在 manifest 的 `state_dir` 下写入不可变的运行 JSON，并返回其
`run_id`。

如果某个必需载体表示 `manual_required`，请执行指定名称的 Skill 路由，并在完成
之前记录其结果。本地微信存档搜索不能证明覆盖了实时微信；conversation index
不能证明覆盖了会议或代码。

### 4. 在权威来源处验证候选项

在其原始路径打开有希望的候选项。检查：

- **匹配性**：它是否解决了相同的业务问题，而不只是共享一些词语？
- **权威性**：当前实现/SSOT 优先于历史提案；
  原始 transcript 能证明曾经说过什么，但不能证明其当前仍然正确。
- **新鲜度**：比较当前 Git HEAD、文件 mtime、决策日期以及任何 superseded 标记。
  不要使用存档覆盖当前行为。
- **结果证据**：相比仅仅看起来流程已完成的过程，更应优先考虑代码/测试/已接受的
  交付物和实际运行结果。

### 5. 完成复用回执

对你实际检查过的项目进行分类：

```bash
uv run --no-project python scripts/prior_work.py complete \
  --run <run_id> \
  --reuse '<candidate_id>=reuse unchanged because ...' \
  --adapt '<candidate_id>=adapt boundary X because ...' \
  --session-id "$CODEX_SESSION_ID"
```

如果没有任何项目符合条件，请使用 `--no-reuse-reason` 并说明经过验证的不匹配原因。
“没有命中”不是理由；它只是一次检索观察，可能需要扩大术语范围或解决失败的载体。

已完成的回执会保留 `business_outcome` 和 `outcome_terms`；如果缺少任一字段，`check`
会拒绝传统回执或手工构建的回执。回执的新鲜度与**required** carriers 的定义绑定。编辑可选 carrier
不会使已经验证的 required 覆盖失效；但更改 required root、route、mode、authority 或 limit 会使其失效。完整的 manifest hash
仍然用于溯源。
然后执行验证：

```bash
uv run --no-project python scripts/prior_work.py check \
  --session-id "$CODEX_SESSION_ID"
```

只有在此步骤通过后，才能开始实质性的生产工作。在实现/计划中引用所采用的候选 ID，使回执与结果建立关联，而不是让它沦为仪式性的文书。

## Companion hooks

在 manifest 有效且自测通过后安装：

```bash
scripts/prior-work-retrieval.sh --selftest
scripts/prior-work-retrieval.sh --install
```

版本化 wrapper 是同步 hook-runtime SSOT。它会解析直接的 Python 解释器，绝不会进入 package-manager/cache 生命周期；保留上面的
`uv run ... prior_work.py` 命令作为显式的检索和回执操作，不要将其作为 hook 启动器。

安装器会将必需的 handlers 添加到 Claude 和 Codex，同时不会替换无关的 hooks：

- `UserPromptSubmit` 仅在检测到明确的 prior-work/reuse/history 信号时创建 prompt-scoped requirement，并注入 Skill route。过滤器会阻止该信号在用户未提出相关要求时触发：
  - **不是用户在发言。** 内部模板（`You are a/an …`、`# Overview`）、harness 封装（`<agent-message …>`、
    `<task-notification …>`、`<system-reminder …>`）以及粘贴的 transcript 行（`⏺ …`）都会作为 prompts
    传递给此 handler。它们绝不会启动 requirement。
  - **executor 无法满足 gate。** 禁止读取 skills 或运行 shell 的 prompt 已经移除了完成回执所需的能力；对这样的 prompt
    设置 gate 会阻塞工作，并且没有解除阻塞的路径。明确表示退出 prior-work retrieval 的 prompt 会按照人们实际使用的拼写得到遵循（`Do NOT perform prior-work retrieval`、
    `opts out of prior-work retrieval`），而不仅仅识别 `skip`/`disable`。
  - **否定复用。** “不要复用 X”、“别沿用”、`don't reuse` 表示拒绝使用 prior work；将某项内容描述得很久以前（“很久之前写的”）表示它已过时，而不是要求查找它。两者都会在匹配前被剔除，因此同一句话中的真实请求仍会计入；而“别重复造轮子”/
    “不希望你重新造”是在要求复用，因此仍会启动 requirement。
  - **模糊回忆需要远指代词。** 上次 / 好像是 / 我记得是 / 记不清 只有与带有远指或不定限定词的工作名词（那个/某个/哪个 脚本）同时出现时才会启动，因为“这个脚本”指的是眼前的对象——“这个
    脚本好像是死循环”是 bug 报告，而不是回忆请求。单独出现的 `history` 同样需要 carrier（`conversation history`，而不是
    `git history`）。
  - **有效回执已经覆盖此 session。** 带有模糊措辞的回忆请求不会再创建新的 requirement，从而使已完成的回执失去作用。明确提出新的 prior-work 请求仍然会创建 requirement。

运行 `scripts/prior_work.py audit` 以检查 gate 是否按预期运行：它会报告触发器构成、空 gate 比率（已启用但从未生成 receipt 的要求，这是对无法满足的条件进行 gate 的表现）、孤立 receipt、非用户输入的启用项，以及每个仍在启用状态的条目背后匹配到的 token。使用 `--json` 获取机器可读输出。应根据这个数字评估 gate，而不是根据其自身测试是否通过。
- `PreToolUse` 仅在该明确要求已经存在且缺少有效 receipt 时，才会阻止实质性写入。它绝不会把普通写入变成检索义务。要求处于激活状态时，只读发现和小型机械式编辑仍然可用。
- `Stop` 会验证已经存在的明确要求。它绝不会根据输出长度、代码、工具使用情况或通用的生产请求来臆造要求。

它会将范围更窄的、未版本化的 `recall-first-evidence` UserPromptSubmit handler 迁移到这个超集，同时将其脚本保留在磁盘上以便恢复。旧的触发器族（“我们之前”、“什么来着”、模糊记忆）属于回归测试。安装后运行机器的 profile-settings synchronizer，使每个 Claude profile 都获得主设置。Codex 需要通过 `/hooks` 进行一次人工信任审查；安装程序绝不会伪造这一步。

用户可以明确表示当前 prompt 不要搜索 prior work。该选择退出会成为 prompt 范围内的状态，而不是环境变量绕过方式。可识别的表达方式要求在同一句话中，将拒绝动词（不用/不要/不需要/跳过，或 skip/disable/opt out/do not perform）与检索名词（查历史/历史检索/prior-work/prior work/history retrieval）配对。单独的「不需要检索」不匹配，因此在 gate 期间向用户提供建议时，请引用完整的可用表达，例如「本任务不需要 prior work 检索」。
清单或 receipt 状态格式错误或缺失时，仅在实质性生产操作中 fail closed；只读调查以及恰好针对清单路径的写入仍然可用，以便 agent 修复 gate，而不绕过它。

## Search routing

| 需求 | 路由 |
|---|---|
| 已知的精确字符串、符号、路径 | Filesystem carrier (`rg`) |
| 记得含义但措辞已改变 | Declared semantic adapter (gbrain，或 Claude-history hybrid recall — 该索引仅覆盖 Claude sessions) |
| 精确的既往 Claude 工具/思考/文件历史证据 | `read-claude-code-history search` |
| 平台未知、涉及多个平台或并非 Claude 的既往对话证据 | `local-conversation-history`；每个 provider 都是独立存储，因此仅 Claude 的答案无法支持“我们从未讨论过它” |
| 会议决定或发言者的主张 | Project transcript carrier；打开原始发言者回合 |
| 已归档的微信文本/语音转录 | Declared WeChat archive carrier |
| 实时/最新微信 | `read-wechat-messages`；记录手动覆盖范围 |
| 当前代码行为 | 在当前 Git revision 打开实现/测试 |

## Boundaries

- 清单是明确的，并且与可变的索引状态分别进行版本控制。
- 搜索结果是待验证的假设。receipt 记录验证和复用情况。
- 不要将私有项目数据复制到公开示例或 Skill fixture 中。
- 所需 carrier 失败时，不要静默回退。记录该缺口。
- 外部网页研究应在本地 prior work 之后开始，除非用户明确要求当前的外部事实，或本地证据无法回答。
- 此 Skill 是工作流。配套 hooks 可能要求在 `Write`/`Edit` 之前获取新的 receipt；Stop 可能强制执行同一个已有义务，但最终答案的形式无法创建新的义务。Hooks 不决定哪个候选项是好的。

## 维护者验证

```bash
uv run --no-project python -m unittest discover -s tests -p 'test_*.py'
uv run --no-project python scripts/prior_work.py \
  --manifest tests/fixtures/manifest.json validate-manifest
scripts/prior-work-retrieval.sh --selftest
```

回归用例必须涵盖真实的失败类型：未加载跨项目规则、忽略现有的 provider contract、旧决策优先于 North Star、声明了不存在的 artifact capability、遗漏相邻 agent 的证据，以及被全局“已搜索”声明掩盖的 conversation/meeting/WeChat carrier 缺口。