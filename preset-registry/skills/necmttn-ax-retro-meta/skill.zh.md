---
name: retro-meta
description: Deep retro of retros - investigation pass that surfaces improvements across older retros and the current ax setup. External AI agent drives the reasoning with high thinking enabled. Triggers when user says "deep retro", "investigate ax", "what should I fix in my setup", "retro of retros", or invokes /ax:retro-meta. Use after `ax:retro` if proposals are sparse or you want broader exploration.
---
# ax:retro-meta - 深度复盘之复盘

`ax:retro` 的配套功能。`ax:retro` 会逐一检查由启发式方法生成的提案，而 `retro-meta` 则会追问：*现有流水线还有哪些改进点尚未发现？*

外部智能体（即当前这个使用高强度思考的 Claude Code 或 Codex）负责推理。CLI 仅生成结构化证据，并接收经用户批准的计划。

## 何时触发

仅在明确触发时使用：
- “让我们进行一次深度复盘”/“复盘之复盘”
- “调查我的 ax 配置”/“我的配置应该修复什么”
- “审查启发式方法遗漏的提案”
- `/ax:retro-meta` 斜杠命令
- `ax:retro` 完成后，用户希望进行更广泛的探索时

不要在泛泛提出“看看最近的工作”时自动触发。

## 前置条件

- `ax` (axctl) 已位于 PATH 中。如果 `ax doctor` 失败，请停止并引导用户查看
  `docs/development.md#setup`（DuckDB dylib 设置——无需守护进程）。
- 最近 30 天内至少有 3 次复盘。少于这个数量时，用于元复盘的证据过于
  单薄——建议先使用 `ax:retro`。

## 工作流程

### 第 1 步——快照

```bash
ax retro meta --json --since=30 > /tmp/ax-meta.json
```

读取 `/tmp/ax-meta.json`。你需要关注的键：
- `experiment_status[]`——**首先阅读此项**（参见第 2 步）。每个条目包含：
  `experiment_id`、`proposal_dedupe_sig`、`proposal_title`、
  `proposal_form`、`artifact_path`、`days_since_accepted`、
  `opportunities_count`、`addressed_count`、`address_ratio`、
  `latest_checkpoint{kind,suggested,observed_at}`、`locked_verdict`。
  待定结论（`locked_verdict=null`）排在最前面。
- `retros[]`——每个会话的原始 `tried/worked/failed/next`。
- `patterns.tool_failures`——按 total_count 降序排列。
- `patterns.corrections`——总数 + 每个会话的最大值 + session_count。
- `patterns.friction_kinds`——跨会话反复出现的类型。
- `current_state.skills`——已安装的内容（不要提出重复项）。
- `current_state.open_proposals`——现有的启发式提案。
- `current_state.accepted_experiments`——已接受但结论待定的实验。
- `current_state.claude_md_user` / `claude_md_project`——指导文件
  路径（不存在时为 null）。
- `investigation_prompts[]`——你必须逐一检查的提示词。

### 第 2 步——首先审查现有实验

按顺序检查 `experiment_status`。对于每个
`locked_verdict=null` 的条目：

a. 如果 `latest_checkpoint.suggested` 为 `ignored` 或 `regressed`：
   调查原因（读取 `artifact_path`，抽样检查匹配的
   opportunities），然后运行
   `ax improve verdict --set=<v> <proposal_dedupe_sig>` 以锁定
   结论。
b. 如果 `latest_checkpoint.suggested` 为 `adopted` 且
   `days_since_accepted > 30`：将其锁定为 `adopted`，使其不再
   干扰未决列表：
   `ax improve verdict --set=adopted <proposal_dedupe_sig>`。
c. 如果 `latest_checkpoint` 为 null 或 `suggested` 为 `partial`：保持
   未决。在最终摘要中注明它仍在收集信号。

`investigation_prompts` 中也体现了一条经验法则：如果
t+30 后 `address_ratio < 0.1`，则默认将其锁定为 `ignored`，
除非该工件有明显的“尚未被实际使用”的原因。

### 第 3 步 - 逐一处理调查提示（高强度思考）

对于 `investigation_prompts` 中的每个提示：

1. 使用 Read / Glob / Grep 检查引用的状态：
   - `~/.claude/skills/` 和 `~/.agents/skills/` 中的 skill 文件
   - 如果 `claude_md_user` 非空，则检查它
   - 如果 `claude_md_project` 非空，则检查它
2. 推理出一个候选改进方案。投入较高的思考预算——
   重点是找出启发式方法遗漏的内容。
3. 如果你发现了真正的改进点（并且不是现有 skill 或 open_proposal
   的重复项）：
   a. 在 `~/.claude/plans/<YYYY-MM-DD>-<slug>.md` 起草一份计划文档，
      长度为 30–100 行。章节包括：问题、证据（引用 retro id）、
      拟议变更、成功信号。
   b. 向用户展示 4–6 行摘要。
   c. 明确询问：*"将其注册为已接受的实验吗？(y/n)"*
   d. 仅在回答为 yes 时：
      ```bash
      ax retro plan \
        --slug=<kebab-slug> \
        --form=skill|hook|guidance|automation \
        --title="<short title>" \
        --hypothesis="<one sentence>" \
        --plan-path=~/.claude/plans/<file>.md \
        --evidence-retros=<retro:id1,retro:id2> \
        --confidence=low|medium|high
      ```
4. 如果提示的结论是“无需变更”或“与现有内容重复”，请明确说出来，然后继续处理下一个提示。

### 第 4 步 - 可选：移交给脚手架生成器

对于你注册的每个计划，可以运行：

```bash
ax improve accept --with-agent <dedupe_sig>
```

这会启动内部脚手架生成代理，根据计划起草产物
（SKILL.md、hook 脚本等）。如果计划本身已经足够完整，则跳过此步骤。

### 第 5 步 - 总结

输出一个段落，包含：
- 注册了 N 个计划，其中 M 个已生成脚手架
- 锁定了 V 个裁决（注明类型，例如“2× ignored，1× adopted”）
- 审查了 K 个 open_proposals（以及对它们的处置结果）
- 所有结论为“此处无内容”的提示
- 建议的下一个 retro 时间窗口

## 反模式

- 如果每个计划都没有得到用户明确的 yes，绝不要注册该计划。
  人类是最终的筛选者。
- 绝不要自动接受所有 open_proposals——启发式方法会将它们呈现出来，
  但深度检查的存在正是为了通过推理对它们进行分流，而不是按频率排名。
- 绝不要直接写入 `~/.claude/skills/`。请使用 `ax retro plan` +
  `ax improve accept --with-agent`。
- 绝不要跳过第 2 步的重复项检查。如果 Pre-Bash 防护机制已经被接受，
  再提出一个只会浪费用户的时间。
- 不要只相信频率。frequency=1 的 retro 仍可能至关重要，
  如果它代表的是 Claude 无法正确处理的某一类问题。
- 绝不要提出与待定实验重叠的新改进。应先审查该实验——锁定其裁决或将其升级，
  然后再在同一领域叠加更多提案。如果旧实验一直悬而未决，
  回顾循环就不完整。

## CLI 参考

```bash
# Snapshot only (no side effects)
ax retro meta --since=30 [--limit-retros=50] [--pretty]

# Register a user-approved plan as accepted proposal + experiment
ax retro plan \
  --slug=<kebab> \
  --form=skill|hook|guidance|automation \
  --title="<title>" \
  --hypothesis="<hyp>" \
  --plan-path=<path-to-plan.md> \
  [--evidence-retros=retro:a,retro:b] \
  [--artifact-path=<path>] \
  [--confidence=low|medium|high] \
  [--frequency=<N>] \
  [--json]

# Optionally hand off scaffolding to the internal agent
ax improve accept --with-agent <dedupe_sig>

# Lock the verdict on a previously-accepted experiment
ax improve verdict --set=adopted|ignored|regressed|partial|no_longer_needed <dedupe_sig>
```

`ax retro meta` 的输出默认为 JSON，因为读取者是你，
而不是人类。