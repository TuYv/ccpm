---
name: landing-report
version: 0.1.0
description: Read-only queue dashboard for workspace-aware ship. (gstack)
triggers:
  - landing report
  - version queue
  - ship queue
  - what version comes next
  - show open PR versions
allowed-tools:
  - Bash
  - Read
---
## 何时调用此技能

显示当前由未关闭的 PR 占用的 `VERSION` 插槽、哪些同级 Conductor 工作区有可能很快发布的 WIP 工作，以及 `/ship` 接下来会选择哪个插槽。不会进行任何变更——仅提供快照。适用于“landing report”“队列里有什么”“给我显示未完成的 PR”或“我下一步认领哪个版本”等提问。

# /landing-report — 版本队列面板

## 准备步骤（先运行）

```bash
_UPD=$(~/.claude/skills/gstack/bin/gstack-update-check 2>/dev/null || .claude/skills/gstack/bin/gstack-update-check 2>/dev/null || true)
[ -n "$_UPD" ] && echo "$_UPD" || true
mkdir -p ~/.gstack/sessions
touch ~/.gstack/sessions/"$PPID"
_SESSIONS=$(find ~/.gstack/sessions -mmin -120 -type f 2>/dev/null | wc -l | tr -d ' ')
find ~/.gstack/sessions -mmin +120 -type f -exec rm {} + 2>/dev/null || true
_PROACTIVE=$(~/.claude/skills/gstack/bin/gstack-config get proactive 2>/dev/null || echo "true")
_PROACTIVE_PROMPTED=$([ -f ~/.gstack/.proactive-prompted ] && echo "yes" || echo "no")
_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "BRANCH: $_BRANCH"
_SKILL_PREFIX=$(~/.claude/skills/gstack/bin/gstack-config get skill_prefix 2>/dev/null || echo "false")
echo "PROACTIVE: $_PROACTIVE"
echo "PROACTIVE_PROMPTED: $_PROACTIVE_PROMPTED"
echo "SKILL_PREFIX: $_SKILL_PREFIX"
source <(~/.claude/skills/gstack/bin/gstack-repo-mode 2>/dev/null) || true
REPO_MODE=${REPO_MODE:-unknown}
echo "REPO_MODE: $REPO_MODE"
_SESSION_KIND=$(~/.claude/skills/gstack/bin/gstack-session-kind 2>/dev/null || echo "interactive")
case "$_SESSION_KIND" in spawned|headless|interactive) ;; *) _SESSION_KIND="interactive" ;; esac
echo "SESSION_KIND: $_SESSION_KIND"
# Conductor host: AskUserQuestion is unreliable here (native disabled, MCP
# variant flaky), so skills render decisions as prose instead of calling the
# tool. Gated on !headless so an eval/CI run INSIDE Conductor (GSTACK_HEADLESS)
# still BLOCKs rather than rendering prose to nobody.
if [ "$_SESSION_KIND" != "headless" ] && { [ -n "${CONDUCTOR_WORKSPACE_PATH:-}" ] || [ -n "${CONDUCTOR_PORT:-}" ]; }; then
  echo "CONDUCTOR_SESSION: true"
fi
_ACTIVATED=$([ -f ~/.gstack/.activated ] && echo "yes" || echo "no")
_FIRST_LOOP_SHOWN=$([ -f ~/.gstack/.first-loop-tip-shown ] && echo "yes" || echo "no")
echo "ACTIVATED: $_ACTIVATED"
echo "FIRST_LOOP_SHOWN: $_FIRST_LOOP_SHOWN"
# First-run project detection: run the detector ONLY on the first-ever skill run
# (ACTIVATED=no, interactive) so it stays off the hot path for every run after.
_FIRST_TASK=""
if [ "$_ACTIVATED" = "no" ] && [ "$_SESSION_KIND" != "headless" ]; then
  _FIRST_TASK=$(~/.claude/skills/gstack/bin/gstack-first-task-detect 2>/dev/null || true)
fi
echo "FIRST_TASK: $_FIRST_TASK"
_LAKE_SEEN=$([ -f ~/.gstack/.completeness-intro-seen ] && echo "yes" || echo "no")
echo "LAKE_INTRO: $_LAKE_SEEN"
_TEL=$(~/.claude/skills/gstack/bin/gstack-config get telemetry 2>/dev/null || true)
_TEL_PROMPTED=$([ -f ~/.gstack/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
echo "TELEMETRY: ${_TEL:-off}"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
_EXPLAIN_LEVEL=$(~/.claude/skills/gstack/bin/gstack-config get explain_level 2>/dev/null || echo "default")
if [ "$_EXPLAIN_LEVEL" != "default" ] && [ "$_EXPLAIN_LEVEL" != "terse" ]; then _EXPLAIN_LEVEL="default"; fi
echo "EXPLAIN_LEVEL: $_EXPLAIN_LEVEL"
_QUESTION_TUNING=$(~/.claude/skills/gstack/bin/gstack-config get question_tuning 2>/dev/null || echo "false")
echo "QUESTION_TUNING: $_QUESTION_TUNING"
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"landing-report","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
for _PF in $(find ~/.gstack/analytics -maxdepth 1 -name '.pending-*' 2>/dev/null); do
  if [ -f "$_PF" ]; then
    if [ "$_TEL" != "off" ] && [ -x "~/.claude/skills/gstack/bin/gstack-telemetry-log" ]; then
      ~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type skill_run --skill _pending_finalize --outcome unknown --session-id "$_SESSION_ID" 2>/dev/null || true
    fi
    rm -f "$_PF" 2>/dev/null || true
  fi
  break
done
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
_LEARN_FILE="${GSTACK_HOME:-$HOME/.gstack}/projects/${SLUG:-unknown}/learnings.jsonl"
if [ -f "$_LEARN_FILE" ]; then
  _LEARN_COUNT=$(wc -l < "$_LEARN_FILE" 2>/dev/null | tr -d ' ')
  echo "LEARNINGS: $_LEARN_COUNT entries loaded"
  if [ "$_LEARN_COUNT" -gt 5 ] 2>/dev/null; then
    ~/.claude/skills/gstack/bin/gstack-learnings-search --limit 3 2>/dev/null || true
  fi
else
  echo "LEARNINGS: 0"
fi
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"landing-report","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
_HAS_ROUTING="no"
if [ -f CLAUDE.md ] && grep -q "## Skill routing" CLAUDE.md 2>/dev/null; then
  _HAS_ROUTING="yes"
fi
_ROUTING_DECLINED=$(~/.claude/skills/gstack/bin/gstack-config get routing_declined 2>/dev/null || echo "false")
echo "HAS_ROUTING: $_HAS_ROUTING"
echo "ROUTING_DECLINED: $_ROUTING_DECLINED"
_VENDORED="no"
if [ -d ".claude/skills/gstack" ] && [ ! -L ".claude/skills/gstack" ]; then
  if [ -f ".claude/skills/gstack/VERSION" ] || [ -d ".claude/skills/gstack/.git" ]; then
    _VENDORED="yes"
  fi
fi
echo "VENDORED_GSTACK: $_VENDORED"
echo "MODEL_OVERLAY: claude"
_CHECKPOINT_MODE=$(~/.claude/skills/gstack/bin/gstack-config get checkpoint_mode 2>/dev/null || echo "explicit")
_CHECKPOINT_PUSH=$(~/.claude/skills/gstack/bin/gstack-config get checkpoint_push 2>/dev/null || echo "false")
echo "CHECKPOINT_MODE: $_CHECKPOINT_MODE"
echo "CHECKPOINT_PUSH: $_CHECKPOINT_PUSH"
# Plan-mode hint for skills like /spec that branch behavior on plan-mode state.
# Claude Code exposes plan mode via system reminders; we detect best-effort
# from CLAUDE_PLAN_FILE (set by the harness when plan mode is active) and
# fall back to "inactive". Codex hosts and Claude execution mode both end up
# inactive, which is the safe default (defaults to file+execute pipeline).
if [ -n "${CLAUDE_PLAN_FILE:-}${GSTACK_PLAN_MODE_FORCE:-}" ]; then
  export GSTACK_PLAN_MODE="active"
elif [ "${GSTACK_PLAN_MODE:-}" = "active" ]; then
  export GSTACK_PLAN_MODE="active"
else
  export GSTACK_PLAN_MODE="inactive"
fi
echo "GSTACK_PLAN_MODE: $GSTACK_PLAN_MODE"
[ -n "$OPENCLAW_SESSION" ] && echo "SPAWNED_SESSION: true" || true
```

## 计划模式安全操作

在计划模式下允许这些操作，因为它们用于说明计划：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成产物执行 `open`。

## 计划模式下调用技能

如果用户在计划模式下调用技能，技能应优先于通用计划模式行为。**将技能文件视为可执行指令，而不是参考资料。** 从 Step 0 开始逐步执行；技能触发的任意 `AskUserQuestion` 都是计划模式内的工作流操作，而不是对规则的违反——并且技能自身若已解决问题（例如计划模式自动选择），则可以合理地不发起该提问。`AskUserQuestion`（任意变体——`mcp__*__AskUserQuestion` 或原生；参见“AskUserQuestion Format → Tool resolution”）满足计划模式的回合结束要求。如果 `AskUserQuestion` 不可用或调用失败，请按 `AskUserQuestion` 格式的失败回退处理：`headless` → BLOCKED；`interactive` → prose 回退（同样满足回合结束要求）。在 STOP 点应立即停止。不要在那里继续工作流，也不要调用 `ExitPlanMode`。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令将会执行。仅在技能工作流完成后，或用户要求你取消技能/退出计划模式时再调用 `ExitPlanMode`。

如果 `PROACTIVE` 是 `"false"`，不要自动调用或主动建议技能。若某个技能看起来有用，请询问：“我觉得 `/skillname` 在这里可能有帮助，要我运行它吗？”

如果 `SKILL_PREFIX` 是 `"true"`，请建议/调用 `/gstack-*` 名称。磁盘路径保持 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“内联升级流程”（若已配置则自动升级，否则通过 AskUserQuestion 提供 4 个选项，若被拒绝则写入 snooze 状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印 `Running gstack v{to} (just updated!)`。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多一次提示：
- 若缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：通过 AskUserQuestion 询问持续检查点自动提交。若接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终更新该标记。
- 若缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：提示“模型覆盖已启用。MODEL_OVERLAY 显示补丁。”。始终更新该标记。

升级提示结束后，继续工作流程。

如果 `WRITING_STYLE_PENDING` 为 `yes`：一次性询问写作风格：

> v1 prompts are simpler: first-use jargon glosses, outcome-framed questions, shorter prose. Keep default or restore terse?

选项：
- A) 保持新的默认设置（推荐——好的写作对每个人都有帮助）
- B) 恢复 V0 风格——设置 `explain_level: terse`

若选 A：保持 `explain_level` 未设置（默认使用 `default`）。
若选 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终运行（无论选择）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

若 `WRITING_STYLE_PENDING` 为 `no`，跳过此节。

如果 `LAKE_INTRO` 是 `no`，请说：“gstack 遵循**Boil the Ocean**原则——当 AI 让边际成本接近零时，去做完整的事情。更多阅读：https://garryslist.org/posts/boil-the-ocean” 并提供开启：
```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```
仅在用户同意时才运行 `open`。无论如何都执行 `touch`。

如果 `TEL_PROMPTED` 是 `no` 且 `LAKE_INTRO` 是 `yes`：仅通过 AskUserQuestion 询问一次：

> Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths. Your repo name is recorded locally only and stripped before any upload.

选项：
- A) 帮助 gstack 变得更好！(推荐)
- B) 不用了，谢谢

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

若 B：再询问一次：

> Anonymous mode sends only aggregate usage, no unique ID.

选项：
- A) 行，匿名模式就可以
- B) 不用了，完全关闭

若 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
若 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

若 `TEL_PROMPTED` 为 `yes`，跳过。

如果 `PROACTIVE_PROMPTED` 是 `no` 且 `TEL_PROMPTED` 是 `yes`：只询问一次：

> Let gstack proactively suggest skills, like /qa for "does this work?" or /investigate for bugs?

选项：
- A) 保持开启（推荐）
- B) 关闭——我自己手动输入 /commands

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

若 `PROACTIVE_PROMPTED` 为 `yes`，跳过。

## 首次运行指引（一次性）

若 `ACTIVATED` 为 `no`（该机器上首次运行该技能）且前置提示中打印了非空且不为 `nongit` 的 `FIRST_TASK:` 值，先显示一条对应 token 的简短项目提示（项目级提醒），然后继续执行用户真实请求——不要中断任务。映射 token：`greenfield` → “新仓库——先用 `/spec` 或 `/office-hours` 塑形。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里有代码——先用 `/qa` 看是否正常，或在有问题时用 `/investigate`。” `branch_ahead` → “该分支有未发布工作——先 `/review` 再 `/ship`。” `dirty_default` → “有未提交更改——提交前先 `/review`。” `clean_default` → “请任选：`/spec`、`/investigate` 或 `/qa`。” 然后将看到的 token 代入 `TASK_TOKEN` 并执行（尽力而为）如下命令并标记已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

若 `ACTIVATED` 为 `no` 但 `FIRST_TASK:` 为空或为 `nongit`（无界面、非 git 仓库或无可执行动作）：不显示提示，仅运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

若 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：显示一次提示（随后继续执行）：

> 提示：gstack 在你完成一次完整循环时最有价值——**plan → review → ship**。一个常见的第一轮是：用 `/office-hours` 或 `/spec` 先定形，再用 `/plan-eng-review` 锁定，最后 `/ship`。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

若 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 同为 `yes`，则跳过本节。

若 `HAS_ROUTING` 为 `no` 且 `ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录是否存在 `CLAUDE.md` 文件。若不存在则创建它。

使用 AskUserQuestion 询问：

> gstack 在项目的 CLAUDE.md 中包含技能路由规则时效果最佳。

选项：
- A) 向 CLAUDE.md 添加路由规则（推荐）
- B) 不用了，我将手动调用技能

若 A：将以下内容追加到 `CLAUDE.md` 末尾：

```markdown

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
```

然后提交变更：`git add CLAUDE.md && git commit -m "chore: add gstack skill routing rules to CLAUDE.md"`

若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true` 并告诉用户可用 `gstack-config set routing_declined false` 重新启用。

这只在每个项目执行一次。若 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

若 `VENDORED_GSTACK` 为 `yes`，除非存在 `~/.gstack/.vendoring-warned-$SLUG`，否则通过 AskUserQuestion 提示一次：

> This project has gstack vendored in `.claude/skills/gstack/`. Vendoring is deprecated.
> Migrate to team mode?

选项：
- A) 是，立即迁移到 team mode
- B) 不，交给我自己处理

若 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户：“Done. Each developer now runs: `cd ~/.claude/skills/gstack && ./setup --team`”

若 B：说“OK，维护 vendored 副本的更新由你自行负责。”

始终执行（无论选择）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

若存在对应标记则跳过。

如果 `SPAWNED_SESSION` 是 `"true"`，你是在 AI 编排器（例如 OpenClaw）创建的会话中运行。在这类会话中：
- 不要对交互式提示使用 AskUserQuestion。自动选择推荐选项。
- 不执行升级检查、遥测提示、路由注入或 lake intro。
- 专注于完成任务并通过文本输出汇报结果。
- 最终输出一份完成报告：已交付内容、已做决策、以及任何不确定项。

## AskUserQuestion 格式

### 工具解析（先阅读）

"AskUserQuestion" 在运行时可以解析为两种工具：**host MCP 变体**（例如 `mcp__conductor__AskUserQuestion`，当它出现在你的工具列表中时）或原生 Claude Code 工具。

**Conductor 规则（先于 MCP 规则读取）：** 如果 preamble 回显了 `CONDUCTOR_SESSION: true`，则**不要调用 AskUserQuestion**，无论是原生工具还是任何 `mcp__*__AskUserQuestion` 变体。按如下所示将每个决策简报以**纯文本形式**渲染并停止。这是主动动作，而非对失败的反应：Conductor 会禁用原生 AUQ，而且它的 MCP 变体不稳定（会返回 `[Tool result missing due to internal error]`），因此 prose 是可靠路径。**Auto-decide 偏好仍然先执行：**如果某个问题已经出现了 `[plan-tune auto-decide] <id> → <option>` 结果，请直接按该选项进行（不使用 prose）。因为在 Conductor 下会直接进入 prose 而不会实际调用工具，这里的 auto-decide-first 顺序在此处执行，而不仅由 PreToolUse hook 强制。当你渲染 Conductor 的 prose 简报时，也要使用 `bin/gstack-question-log` 进行记录（在 prose 路径下 PostToolUse 采集钩子不会触发，因此 `/plan-tune` 的历史/学习依赖这次调用）。

**规则（非 Conductor）：**若工具列表中存在任何 `mcp__*__AskUserQuestion` 变体，请优先使用它。Host 可能通过 `--disallowedTools AskUserQuestion` 禁用原生 AUQ（Conductor 默认如此），并通过其 MCP 变体路由；此时调用原生工具会静默失败。问题和选项形态相同，决策简报格式同样适用。

如果 AskUserQuestion 不可用（工具列表中无该变体）或调用失败，请不要静默 auto-decide，也不要用替代方式将决策写入计划文件。改用下面的失败降级流程。

### 当 AskUserQuestion 不可用或调用失败时

需区分三类结果：

1. **Auto-decide 拒绝（不是失败）。** 结果中包含 `[plan-tune auto-decide] <id> → <option>`，说明偏好钩子按设计工作。按该选项继续，不要重试，不要降级到 prose。
2. **真实失败**——工具列表中没有变体，或变体存在但调用返回错误/缺失结果（MCP 传输错误、空结果、主机缺陷，例如 Conductor 的 MCP AskUserQuestion 不稳定并返回 `[Tool result missing due to internal error]`）。
   - 如果调用存在且出错（非缺失），在仅当无法已向用户展示问题时重试同一调用一次；若可能已展示给用户（如缺失结果错误可能在用户看到问题后返回），不要重试，而应将其视为待回复，不重试。
   - 然后按 `SESSION_KIND`（由 preamble 回显；为空或缺失视为 `interactive`）分支：
     - `spawned` → 走 **Spawned 会话**分支：自动选择推荐选项。绝不 prose，绝不 BLOCKED。
     - `headless` → `BLOCKED — AskUserQuestion unavailable`，停住等待（无人工可回复）。
     - `interactive` → 使用**文本降级**（如下）。
3. **文本降级**——将决策简报渲染为 Markdown 消息，而非工具调用。结构与工具格式一致，但信息组织改为段落而非 ✅/❌ 列表。必须包含以下三项核心内容：
   1. **用直白方式说明问题本身**——用英文说明正在决策的内容及其重要性（问题本身而非各选项），说明后果与关注点，必须放在最前。
   2. **每个选项的完整度分数**——每个选项都要写出 `Completeness: X/10`（10 为完整，7 为走通路径，3 为快捷实现）；当选项类型不同导致不可比时仍要附注说明，但不得省略分数。
   3. **推荐与理由**——写出 `Recommendation: <choice> because <reason>`，并在被推荐项上保留 `(recommended)` 标记。
  
布局要求：一个 `D<N>` 标题 + 一行回复字母的说明（在 Conductor 下这是默认路径；其他场景仅表示 AskUserQuestion 不可用或报错），再接问题 ELI10；再写 Recommendation 行；接着每个选项一段，包含该选项的 `(recommended)` 标记、`Completeness: X/10`，以及 2–4 句理由（禁止纯粹的项目符号列表）；最后写 `Net:` 总结。遇到链式问题或 5+ 选项时按每个选项单独输出 prose 区块，依次排列。然后停止并等待——用户的文本回复即为最终决策。在 plan mode 下，这与工具调用一样可作为本轮结束。
  
### 决策续接——把用户回复映射回简报

每个简报都有稳定标签（`D<N>`，分链场景为 `D<N>.k`）。用户可能回复“3.2: B”。单字母回复应映射到最近一个未回答的简报；若当前有多个未回答简报（链式场景），不要猜测——应询问其对应的 `D<N>.k`。在链式场景中，禁止用单字母跨分支歧义应用。

### 一次性/破坏性确认的文本化降级

当决策属于一次性门禁（不可逆或破坏性操作，如删除、强制推送、丢弃、覆盖）时，文本降级比工具调用更弱，因此要增强约束：要求用户明确输入选项字母或完整词汇进行确认，清晰说明不可逆事项，并且不能接受模糊或不完整回复（如“ok”“sure”）直接继续；若存在歧义则需重新提问。

### 格式

每次 AskUserQuestion 都是一个决策简报，应以 tool_use 发送，而非 prose，除非在交互式会话中该调用不可用或报错时触发文本降级流程。

```
D<N> — <one-line question title>
Project/branch/task: <1 short grounding sentence using _BRANCH>
ELI10: <plain English a 16-year-old could follow, 2-4 sentences, name the stakes>
Stakes if we pick wrong: <one sentence on what breaks, what user sees, what's lost>
Recommendation: <choice> because <one-line reason>
Completeness: A=X/10, B=Y/10   (or: Note: options differ in coverage, not coverage — no completeness score)
Pros / cons:
A) <option label> (recommended)
  ✅ <pro — concrete, observable, ≥40 chars>
  ❌ <con — honest, ≥40 chars>
B) <option label>
  ✅ <pro>
  ❌ <con>
Net: <one-line synthesis of what you're actually trading off>
```

D 编号规则：同一次 skill 调用中的首个问题为 `D1`，随后递增。这是模型层面的要求，不是运行时计数器。

ELI10 始终需要，使用普通英文说明，且必须是 16 岁读者能理解的 2–4 句，并点明影响；Recommendation 必须始终出现。请保留 `(recommended)` 标记；AUTO_DECIDE 依赖该标记。

当选项在覆盖范围上不同、不可直接比较时，请使用：`Note: options differ in kind, not coverage — no completeness score`。  

Pros / cons 使用 ✅/❌。真实选择时每个选项至少 2 个优点和 1 个缺点；每条至少 40 字。若为一次性/破坏性确认，写为强制终止选项时，固定为：`✅ No cons — this is a hard-stop choice`。  

中性策略写法：`Recommendation: <default> — this is a taste call, no strong preference either way`；AUTO_DECIDE 下也必须在默认项上保留 `(recommended)`。  

当涉及工作量时，需同时标注人力与 CC+gstack 时间，例如 `(human: ~2 days / CC: ~15 min)`，以便决策时看清 AI 压缩比例。  

Net 行要收束权衡关系。特定 skill 的说明可能施加更严格规则。

### 处理 5+ 选项——拆分，不丢弃

AskUserQuestion 的每次调用最多支持 **4 个选项**。当真实选项超过 5 个时，绝不合并、删除或偷偷延后。应采用合规方案：

- **分组到 ≤4 组**——为同类备选方案分组（如版本更新、布局变体）。一次性提交，若前 4 项不足再补出第 5 项。
- **按选项拆分**——对互相独立的范围项采用每选项一次调用（如“是否发布 E1..E6？”）。
  当不确定时默认采用这种方式。  

按选项拆分时的简报格式为 `D<N>.k`（如 D3.1..D3.5），每个选项都包含 ELI10、Recommendation、类型说明（Include/Defer/Cut/Hold 为决策动作，故无完整度分数）和 4 个选项桶：  
**A) Include**，**B) Defer**，**C) Cut**，**D) Hold**（停链讨论）。

链路完成后，触发 `D<N>.final` 来校验已组装好的选项集（reprompt 依赖冲突）并确认可发布。使用 `D<N>.revise-<k>` 可在不重跑链路的情况下修订单个选项。

当 `N>6` 时，请先触发 `D<N>.0` 的 meta-AskUserQuestion（proceed / narrow / batch）。

split 链的 `question_ids` 为 `<skill>-split-<option-slug>`（kebab-case ASCII，≤64 字符，冲突时加 `-2` / `-3` 后缀）。运行时检查器（`bin/gstack-question-preference`）会拒绝对任何 `*-split-*` ID 使用 `never-ask`，因此 split 链永远没有 AUTO_DECIDE 资格——用户的选项集是神圣不可变的。

**完整规则 + 示例 + Hold/依赖语义：** 见 gstack 仓库中的 `docs/askuserquestion-split.md`。当 `N>4` 时按需阅读。

**Non-ASCII 字符——直接写出，不要用 \u 转义。** 当任何字符串字段包含中文（繁體/簡體）、日文、韩文或其他非 ASCII 文本时，请直接输出 UTF-8 字符，不要转义为 `\uXXXX`（管道本身是 UTF-8 原生的，手动转义会导致长 CJK 字符串乱码）。仅允许 `\n`、`\t`、`\"`、`\\`。完整 rationale 与示例见 `docs/askuserquestion-cjk.md`。当问题包含 CJK 时按需阅读。

### 发出前自检

在调用 AskUserQuestion 前，先确认：
- [ ] 存在 `D<N>` 标题
- [ ] 存在 ELI10 段（包含 stakes 行）
- [ ] 存在 Recommendation 行且有具体理由
- [ ] 完整性评分（coverage）存在，或有 kind 提示（kind）
- [ ] 每个选项至少有 ≥2 个 ✅ 和 ≥1 个 ❌，且每个均不少于 40 个字符（或触发 hard-stop 兜底）
- [ ] 至少一个选项带有 (recommended) 标记（即使是 neutral-posture 也如此）
- [ ] 带有工作量的选项包含双尺度标签（human / CC）
- [ ] Net 行用于关闭该决策
- [ ] 你是在调用工具，而不是写 prose——除非 `CONDUCTOR_SESSION: true`（此时 prose 为默认行为，不是工具）或文档化的失败回退情形（此时输出 prose，需包含必备三件事：issue ELI10、每项 completeness、Recommendation + `(recommended)`，并附上“用字母回复”指示后立即停止）
- [ ] Non-ASCII 字符（CJK / 重音字符）直接写出，不使用 \u 转义
- [ ] 若有 5 个及以上选项，则已拆分（或批处理为每组 ≤4）且未丢弃任何选项
- [ ] 若拆分，已在发起链路前检查过选项间依赖
- [ ] 若某选项触发 per-option Hold，则立即停止链路（不入队）

## Artifacts Sync (skill start)

```bash
_GSTACK_HOME="${GSTACK_HOME:-$HOME/.gstack}"
# Prefer the v1.27.0.0 artifacts file; fall back to brain file for users
# upgrading mid-stream before the migration script runs.
if [ -f "$HOME/.gstack-artifacts-remote.txt" ]; then
  _BRAIN_REMOTE_FILE="$HOME/.gstack-artifacts-remote.txt"
else
  _BRAIN_REMOTE_FILE="$HOME/.gstack-brain-remote.txt"
fi
_BRAIN_SYNC_BIN="~/.claude/skills/gstack/bin/gstack-brain-sync"
_BRAIN_CONFIG_BIN="~/.claude/skills/gstack/bin/gstack-config"

# /sync-gbrain context-load: teach the agent to use gbrain when it's available.
# Per-worktree pin: post-spike redesign uses kubectl-style `.gbrain-source` in the
# git toplevel to scope queries. Look for the pin in the worktree (not a global
# state file) so that opening worktree B without a pin doesn't claim "indexed"
# just because worktree A was synced. Empty string when gbrain is not
# configured (zero context cost for non-gbrain users).
_GBRAIN_CONFIG="$HOME/.gbrain/config.json"
if [ -f "$_GBRAIN_CONFIG" ] && command -v gbrain >/dev/null 2>&1; then
  _GBRAIN_VERSION_OK=$(gbrain --version 2>/dev/null | grep -c '^gbrain ' || echo 0)
  if [ "$_GBRAIN_VERSION_OK" -gt 0 ] 2>/dev/null; then
    _GBRAIN_PIN_PATH=""
    _REPO_TOP=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [ -n "$_REPO_TOP" ] && [ -f "$_REPO_TOP/.gbrain-source" ]; then
      _GBRAIN_PIN_PATH="$_REPO_TOP/.gbrain-source"
    fi
    if [ -n "$_GBRAIN_PIN_PATH" ]; then
      echo "GBrain configured. Prefer `gbrain search`/`gbrain query` over Grep for"
      echo "semantic questions; use `gbrain code-def`/`code-refs`/`code-callers` for"
      echo "symbol-aware code lookup. See \"## GBrain Search Guidance\" in CLAUDE.md."
      echo "Run /sync-gbrain to refresh."
    else
      echo "GBrain configured but this worktree isn't pinned yet. Run `/sync-gbrain --full`"
      echo "before relying on `gbrain search` for code questions in this worktree."
      echo "Falls back to Grep until pinned."
    fi
  fi
fi

_BRAIN_SYNC_MODE=$("$_BRAIN_CONFIG_BIN" get artifacts_sync_mode 2>/dev/null || echo off)

# Detect remote-MCP mode (Path 4 of /setup-gbrain). Local artifacts sync is
# a no-op in remote mode; the brain server pulls from GitHub/GitLab on its
# own cadence. Read claude.json directly to keep this preamble fast (no
# subprocess to claude CLI on every skill start).
_GBRAIN_MCP_MODE="none"
if command -v jq >/dev/null 2>&1 && [ -f "$HOME/.claude.json" ]; then
  _GBRAIN_MCP_TYPE=$(jq -r '.mcpServers.gbrain.type // .mcpServers.gbrain.transport // empty' "$HOME/.claude.json" 2>/dev/null)
  case "$_GBRAIN_MCP_TYPE" in
    url|http|sse) _GBRAIN_MCP_MODE="remote-http" ;;
    stdio) _GBRAIN_MCP_MODE="local-stdio" ;;
  esac
fi

if [ -f "$_BRAIN_REMOTE_FILE" ] && [ ! -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" = "off" ]; then
  _BRAIN_NEW_URL=$(head -1 "$_BRAIN_REMOTE_FILE" 2>/dev/null | tr -d '[:space:]')
  if [ -n "$_BRAIN_NEW_URL" ]; then
    echo "ARTIFACTS_SYNC: artifacts repo detected: $_BRAIN_NEW_URL"
    echo "ARTIFACTS_SYNC: run 'gstack-brain-restore' to pull your cross-machine artifacts (or 'gstack-config set artifacts_sync_mode off' to dismiss forever)"
  fi
fi

if [ -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" != "off" ]; then
  _BRAIN_LAST_PULL_FILE="$_GSTACK_HOME/.brain-last-pull"
  _BRAIN_NOW=$(date +%s)
  _BRAIN_DO_PULL=1
  if [ -f "$_BRAIN_LAST_PULL_FILE" ]; then
    _BRAIN_LAST=$(cat "$_BRAIN_LAST_PULL_FILE" 2>/dev/null || echo 0)
    _BRAIN_AGE=$(( _BRAIN_NOW - _BRAIN_LAST ))
    [ "$_BRAIN_AGE" -lt 86400 ] && _BRAIN_DO_PULL=0
  fi
  if [ "$_BRAIN_DO_PULL" = "1" ]; then
    ( cd "$_GSTACK_HOME" && git fetch origin >/dev/null 2>&1 && git merge --ff-only "origin/$(git rev-parse --abbrev-ref HEAD)" >/dev/null 2>&1 ) || true
    echo "$_BRAIN_NOW" > "$_BRAIN_LAST_PULL_FILE"
  fi
  "$_BRAIN_SYNC_BIN" --once 2>/dev/null || true
fi

if [ "$_GBRAIN_MCP_MODE" = "remote-http" ]; then
  # Remote-MCP mode: local artifacts sync is a no-op (brain admin's server
  # pulls from GitHub/GitLab). Show the user this is by design, not broken.
  _GBRAIN_HOST=$(jq -r '.mcpServers.gbrain.url // empty' "$HOME/.claude.json" 2>/dev/null | sed -E 's|^https?://([^/:]+).*|\1|')
  echo "ARTIFACTS_SYNC: remote-mode (managed by brain server ${_GBRAIN_HOST:-remote})"
elif [ -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" != "off" ]; then
  _BRAIN_QUEUE_DEPTH=0
  [ -f "$_GSTACK_HOME/.brain-queue.jsonl" ] && _BRAIN_QUEUE_DEPTH=$(wc -l < "$_GSTACK_HOME/.brain-queue.jsonl" | tr -d ' ')
  _BRAIN_LAST_PUSH="never"
  [ -f "$_GSTACK_HOME/.brain-last-push" ] && _BRAIN_LAST_PUSH=$(cat "$_GSTACK_HOME/.brain-last-push" 2>/dev/null || echo never)
  echo "ARTIFACTS_SYNC: mode=$_BRAIN_SYNC_MODE | last_push=$_BRAIN_LAST_PUSH | queue=$_BRAIN_QUEUE_DEPTH"
else
  echo "ARTIFACTS_SYNC: off"
fi
```

隐私停机门：如果输出显示 `ARTIFACTS_SYNC: off`、`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 在 PATH 上或 `gbrain doctor --fast --json` 可用，则询问一次：

> gstack 可以将你的 artifacts（CEO 计划、设计、报告）发布到一个私有的 GitHub 仓库，由 GBrain 在多台机器间建立索引。你希望同步到什么程度？

选项：
- A) 允许所有内容（recommended）
- B) 仅同步 artifacts
- C) 拒绝，保持一切本地

回答后执行：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-artifacts-init`。不要阻塞该 skill。

在 skill 结束前、上报 telemetry 前执行：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```

## 模型专属行为修订（claude）

以下提示针对 `claude` 模型族进行了调优。它们**从属**于 skill 工作流、`STOP` 点、`AskUserQuestion` 门控、`plan-mode` 安全，以及 `/ship` 审核门控。如果下方某条提示与 skill 指令冲突，则以 skill 为准。将其当作偏好，而非规则。

**待办清单规范。** 在执行多步骤计划时，按任务完成时逐一标记为完成，不要在最后一次性批量标记。如果某项任务最终不需要执行，请用一行原因标记为跳过。

**重操作前先思考。** 对于复杂操作（重构、迁移、非平凡的新功能），在执行前简要说明你的方案。这能让用户以更低成本提前纠偏，而不是中途飞行式改动。

**专用工具优先于 Bash。** 优先使用 `Read`、`Edit`、`Write`、`Glob`、`Grep`，而不是 shell 等价命令（`cat`、`sed`、`find`、`grep`）。专用工具更便宜，也更清晰。

## 语音风格

GStack voice：面向运行时压缩的 Garry 式产品与工程判断。

- 先说结论。说明它做了什么、为何重要，以及对构建者有何变化。
- 说得具体。指出文件、函数、行号、命令、输出和实际数据。
- 将技术取舍与用户结果绑定：真实用户能看到、错过、等待或新增的能力是什么。
- 对质量保持直接。要修 bug，要修边界情况。修通路，不要只做 demo。
- 像构建者对构建者说话，而不是顾问对客户汇报。
- 绝不生硬、学术化、PR 风格或哗众取宠。去掉废话、赘词、空泛乐观和创业者姿态。
- 不要使用破折号。避免 AI 常见词汇：delve、crucial、robust、comprehensive、nuanced、multifaceted、furthermore、moreover、additionally、pivotal、landscape、tapestry、underscore、foster、showcase、intricate、vibrant、fundamental、significant。
- 用户有你没有的上下文：领域知识、时机、关系和品味。跨模型一致性是建议，不是决定。最终由用户做决定。

示例好：`auth.ts:47` 在会话 cookie 过期时返回 `undefined`，导致用户遇到白屏。修复：加一个空值检查并重定向到 `/login`。两行代码。  
示例差：`I’ve identified a potential issue in the authentication flow that may cause problems under certain conditions.`

## 上下文恢复

```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)"
_PROJ="${GSTACK_HOME:-$HOME/.gstack}/projects/${SLUG:-unknown}"
if [ -d "$_PROJ" ]; then
  echo "--- RECENT ARTIFACTS ---"
  find "$_PROJ/ceo-plans" "$_PROJ/checkpoints" -type f -name "*.md" 2>/dev/null | xargs ls -t 2>/dev/null | head -3
  [ -f "$_PROJ/${_BRANCH}-reviews.jsonl" ] && echo "REVIEWS: $(wc -l < "$_PROJ/${_BRANCH}-reviews.jsonl" | tr -d ' ') entries"
  [ -f "$_PROJ/timeline.jsonl" ] && tail -5 "$_PROJ/timeline.jsonl"
  if [ -f "$_PROJ/timeline.jsonl" ]; then
    _LAST=$(grep "\"branch\":\"${_BRANCH}\"" "$_PROJ/timeline.jsonl" 2>/dev/null | grep '"event":"completed"' | tail -1)
    [ -n "$_LAST" ] && echo "LAST_SESSION: $_LAST"
    _RECENT_SKILLS=$(grep "\"branch\":\"${_BRANCH}\"" "$_PROJ/timeline.jsonl" 2>/dev/null | grep '"event":"completed"' | tail -3 | grep -o '"skill":"[^"]*"' | sed 's/"skill":"//;s/"//' | tr '\n' ',')
    [ -n "$_RECENT_SKILLS" ] && echo "RECENT_PATTERN: $_RECENT_SKILLS"
  fi
  _LATEST_CP=$(find "$_PROJ/checkpoints" -name "*.md" -type f 2>/dev/null | xargs ls -t 2>/dev/null | head -1)
  [ -n "$_LATEST_CP" ] && echo "LATEST_CHECKPOINT: $_LATEST_CP"
  if [ -f "$_PROJ/decisions.active.json" ]; then
    echo "--- ACTIVE DECISIONS (recent, scope-relevant) ---"
    ~/.claude/skills/gstack/bin/gstack-decision-search --recent 5 2>/dev/null
    echo "--- END DECISIONS ---"
  fi
  echo "--- END ARTIFACTS ---"
fi
```

如果列出了 artifacts，请阅读最新有用的一份。如果出现 `LAST_SESSION` 或 `LATEST_CHECKPOINT`，给出一句两句的欢迎回归总结。如果 `RECENT_PATTERN` 明确指向下一步 skill，请提一次建议。

## 跨会话决策

如果列出了 `ACTIVE DECISIONS`，将其视为已通过并附带理由的既往决议——不要悄悄重新争论；如果你要推翻某项决议，请明确说明。只要问题涉及既往决策（“我们决定了什么 / 为什么 / 有没有尝试过”），就调用 `~/.claude/skills/gstack/bin/gstack-decision-search`。当你或用户做出**持久性决策**（架构、范围、工具/供应商选择，或反向决定）——而非回合级或琐碎选择——应使用 `~/.claude/skills/gstack/bin/gstack-decision-log` 记录（反向时用 `--supersede <id>`）。该机制可靠且本地化，不需要 gbrain。

## 写作风格（若在前置回显中出现 `EXPLAIN_LEVEL: terse`，或用户当前消息明确要求简洁/不解释输出，请完全跳过）

适用于 `AskUserQuestion`、用户回复和调查结果。`AskUserQuestion` 的格式是结构化的，这里是文风质量。

- 每次调用 skill 时首次出现经过筛选的术语都要先做术语注释，即便用户贴出了该术语。
- 用结果导向提问：避免什么痛点、解锁什么能力、用户体验有什么变化。
- 句子短、名词具体、使用主动语态。
- 决策结尾要有用户影响：用户能看到什么、等待什么、失去什么、获得什么。
- 用户回合优先：若当前消息要求简洁/无解释/仅给答案，跳过本节。
- 简洁模式（`EXPLAIN_LEVEL: terse`）：不做术语注释，不做结果导向层，保持更短的回复。

筛选术语表位于 `~/.claude/skills/gstack/scripts/jargon-list.json`（80+ 条）。本会话首次遇到术语时读取一次该文件，并将 `terms` 数组视为权威列表。该列表由仓库维护，版本之间可能会新增。

## 完整性原则——一网打尽

AI 让完整性更容易实现，因此完整才是目标。建议全覆盖（测试、边界条件、错误路径）——一湖一湖地煮干净。真正不在范围内的是完全不相关的工作（重写、跨季度迁移）；要把这类内容标为单独范围，而不是拿它当捷径借口。

当选项在覆盖范围上不同，请写明 `Completeness: X/10`（10=全部边界用例，7=只走主路径，3=走捷径）。当选项本质不同，请写：`Note: options differ in kind, not coverage — no completeness score.` 不要捏造分数。

## 混淆处理协议

对高风险歧义（架构、数据模型、破坏性范围、上下文缺失）应当 `STOP`。用一句话命名问题，给出 2-3 个方案及权衡，并提问。不要用于日常编码或显而易见的改动。

## 连续检查点模式

如果 `CHECKPOINT_MODE` 为 `"continuous"`：在完成逻辑单元后用 `WIP:` 前缀自动提交。

在新增文件、完成函数/模块、验证后的 bug 修复，以及长时间的安装/构建/测试命令之前提交。

提交格式：

```
WIP: <concise description of what changed>

[gstack-context]
Decisions: <key choices made this step>
Remaining: <what's left in the logical unit>
Tried: <failed approaches worth recording> (omit if none)
Skill: </skill-name-if-running>
[/gstack-context]
```

规则：仅暂存有意修改的文件，**绝不** `git add -A`，不要提交失败测试或编辑中间状态；只有 `CHECKPOINT_PUSH` 为 `"true"` 时才推送。不要每次 WIP 提交都通报。

`/context-restore` 读取 `[gstack-context]`；`/ship` 会把 WIP 提交压缩成干净提交。

如果 `CHECKPOINT_MODE` 是 `"explicit"`：忽略本节，除非某个 skill 或用户要求提交。

## 上下文健康（软性要求）

在长时间运行的 skill 会话中，定期写简短的 `[PROGRESS]` 小结：已完成、接下来、意外情况。

若你在同一诊断、同一文件或同一修复变体上反复循环，请 `STOP` 并重新评估。考虑升级或 `/context-save`。进度小结**绝对不能**改动 git 状态。

## 提问调优（若 `QUESTION_TUNING: false` 请完整跳过）

在每次 `AskUserQuestion` 之前，从 `scripts/question-registry.ts` 或 `{skill}-{slug}` 选择 `question_id`，然后运行  
`printf '%s' "<question summary>" | ~/.claude/skills/gstack/bin/gstack-question-preference --check "<id>" --summary-stdin`（该命令将总结喂给单向关键词网络，#2024）。`AUTO_DECIDE` 表示选择推荐项并说明 `Auto-decided [summary] → [option] (your preference). Change with /plan-tune.`；`ASK_NORMALLY` 表示提问。

收到。按当前窗口要求，我先确认本次仅用于翻译任务，请你先指定要启用的 skill / plugin：

- 直接给出**具体 skill 或整组 plugin 名称**（可多选）；
- 也可直接要求“全部禁用/仅使用默认内置能力”。  

例如可回：
- `agent-reach, browser, openai-docs`  
- 或 `baoyu-skills（仅某个 skill）`  

确认后我再开始翻译。

╔══════════════════════════════════════════════════════════════════╗
║                     GSTACK LANDING REPORT                        ║
╠══════════════════════════════════════════════════════════════════╣
║ 仓库:    <owner/repo>                                            ║
║ 基线:    <base> @ v<base-version>                                ║
║ 主机:    <github|gitlab|unknown>                                 ║
║ 状态:    <ONLINE|OFFLINE: queue-awareness unavailable>           ║
╚══════════════════════════════════════════════════════════════════╝

在 <base> 上声明版本的 PR：
  #1152  alpha-branch         → v1.7.0.0
  #1153  beta-branch          → v1.7.0.0  ⚠ 与 #1152 冲突
  #1151  gamma-branch         → v1.6.5.0

同级 Conductor 工作树 (<workspace_root>)：
  path                        branch                 VERSION      last commit   PR
  ──────────────────────────────────────────────────────────────────────────────────
  ../tokyo-v2                 feat/dashboard         v1.7.1.0    3h ago         none  ★ active
  ../melbourne                feat/review            v1.6.0.0    12d ago        none
  ../osaka                    feat/payments          v1.8.0.0    5h ago         #1155

★ active = VERSION 高于 base 且 last commit < 24h 且没有未合并 PR。
  这些最可能很快会落地。

如果你现在运行 /ship，会声明：
  micro bump:  v1.6.3.1   (queue-advance: none)
  patch bump:  v1.7.1.0   (bumped past claimed 1.7.0.0)
  minor bump:  v1.8.0.0   (bumped past claimed 1.7.0.0)
  major bump:  v2.0.0.0   (no major collisions)

╔══════════════════════════════════════════════════════════════════╗
║                     GSTACK LANDING REPORT                        ║
╠══════════════════════════════════════════════════════════════════╣
║ 状态:  OFFLINE — queue-awareness unavailable                   ║
║ 原因:  <offline reason from warnings>                          ║
╚══════════════════════════════════════════════════════════════════╝

Fallback: local VERSION bumps still work, but collisions cannot be detected.

## Step 5: Suggest next action

渲染表格后，建议以下一项：

1. **如果队列中存在冲突**（两个未合并 PR 声明了同一版本）：
   ⚠ Two open PRs collide on v<X>. Whoever merges second will either overwrite
   the first's CHANGELOG entry or land a duplicate. Consider asking one author
   to rerun /ship to pick up the next free slot.

2. **如果有同级分支的版本高于用户分支版本**：
   Sibling worktree <path> has v<X> committed <N>h ago and hasn't PR'd yet.
   If that work ships first, your branch will need to rebump at land time.

3. **如果一切正常**：
   Queue is clean. Next /ship will claim a slot without conflict.

## Plan Mode

PLAN MODE EXCEPTION — ALWAYS RUN. This skill is entirely read-only: no file
writes, no git mutations, no network state changes. Safe to run in plan mode.
