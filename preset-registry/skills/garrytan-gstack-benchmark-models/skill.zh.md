---
name: benchmark-models
preamble-tier: 1
version: 1.0.0
description: Cross-model benchmark for gstack skills. (gstack)
triggers:
  - cross model benchmark
  - compare claude gpt gemini
  - benchmark skill across models
  - which model should I use
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<!-- 由 SKILL.md.tmpl 自动生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

将同一提示词分别发送给 Claude、GPT（通过 Codex CLI）和 Gemini，并排比较延迟、token、成本，以及可选的通过 LLM 评判器评估的质量。用数据而不是直觉回答“对于此技能，哪个模型实际表现最好？”这与用于衡量网页性能的 /benchmark 不同。适用于：“benchmark models”“compare models”“which model is best for X”“cross-model comparison”“model shootout”。

语音触发词（语音转文本别名）：“compare models”“model shootout”“which model is best”。

## 前置步骤（先运行）

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
_UPDATE_CHECK=$(~/.claude/skills/gstack/bin/gstack-config get update_check 2>/dev/null || echo "true")
echo "UPDATE_CHECK: $_UPDATE_CHECK"
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"benchmark-models","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
for _PF in $(find ~/.gstack/analytics -maxdepth 1 -name '.pending-*' 2>/dev/null); do
  if [ -f "$_PF" ]; then
    if [ "$_TEL" != "off" ] && [ -x "$HOME/.claude/skills/gstack/bin/gstack-telemetry-log" ]; then
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"benchmark-models","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
_HAS_ROUTING="no"
for _RF in CLAUDE.md AGENTS.md; do
  if [ -f "$_RF" ] && grep -q "## Skill routing" "$_RF" 2>/dev/null; then
    _HAS_ROUTING="yes"
  fi
done
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
# 为 /spec 等会根据计划模式状态改变行为的技能提供计划模式提示。
# Claude Code 通过系统提醒公开计划模式；我们根据 CLAUDE_PLAN_FILE（计划模式激活时由
# harness 设置）进行尽力检测，并在无法检测时回退到“inactive”。Codex 主机和 Claude 执行模式最终都会是
# inactive，这是安全的默认值（默认为文件+执行管线）。
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

在计划模式下，以下操作被允许，因为它们会为计划提供信息：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成的产物执行 `open`。

## 计划模式下的技能调用

如果用户在计划模式下调用技能，则该技能优先于通用的计划模式行为。**将技能文件视为可执行指令，而不是参考资料。** 从第 0 步开始逐步执行；技能触发的任何 AskUserQuestion 都属于计划模式中的工作流，不违反计划模式规则——如果技能指令自行解决了某个问题（例如计划模式自动选择），也可以不提问。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生版本；参见“AskUserQuestion 格式 → 工具解析”）满足计划模式在回合结束时的要求。如果 AskUserQuestion 不可用或调用失败，请遵循 AskUserQuestion 格式的失败回退规则：`headless` → BLOCKED；`interactive` → 使用文字回退方案（同样满足回合结束要求）。到达 STOP 点时，立即停止。不要继续工作流，也不要在此处调用 ExitPlanMode。只有在技能工作流完成后，或用户要求取消技能或离开计划模式时，才能调用 ExitPlanMode。标记为 "PLAN MODE EXCEPTION — ALWAYS RUN" 的命令必须执行。

如果 `PROACTIVE` 为 `"false"`，不要自动调用或主动建议技能。如果某个技能似乎有帮助，请询问：“我认为 /skillname 可能会有所帮助——要运行它吗？”

如果 `SKILL_PREFIX` 为 `"true"`，请建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果 `UPDATE_CHECK` 为 `"false"`，跳过接下来的两行——更新检查二进制程序在该模式下不会输出任何内容，因此无需处理 `UPGRADE_AVAILABLE` / `JUST_UPGRADED` 输出。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md`，并遵循“内联升级流程”（如果已配置则自动升级，否则使用 AskUserQuestion 提供 4 个选项；如果拒绝，则写入暂缓状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印 "Running gstack v{to} (just updated!)"。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多提示一次：
- 缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 AskUserQuestion 询问是否启用持续检查点自动提交。如果接受，运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终创建该标记文件。
- 缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：告知“模型叠加层已启用。MODEL_OVERLAY 会显示补丁。”始终创建该标记文件。

升级提示之后，继续工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：询问一次写作风格：

> v1 提示语更简单：首次使用术语时提供释义、以结果为导向的问题、更简短的正文。保留默认设置，还是恢复简洁风格？

选项：
- A) 保留新的默认设置（推荐——良好的写作对每个人都有帮助）
- B) 恢复 V0 正文——设置 `explain_level: terse`

如果选择 A：不设置 `explain_level`（默认为 `default`）。
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终运行（无论选择哪项）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，则跳过。

如果 `LAKE_INTRO` 为 `no`：说“gstack 遵循 **Boil the Ocean** 原则 —— 当 AI 使边际成本接近于零时，完成完整的事情。了解更多：https://garryslist.org/posts/boil-the-ocean”。提供打开以下链接的选项：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅当选择 yes 时运行 `open`。始终运行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 询问一次遥测：

> 帮助 gstack 变得更好。仅分享使用数据：技能、持续时间、崩溃情况、稳定的设备 ID。不包含代码或文件路径。你的仓库名称仅记录在本地，并会在上传前被删除。

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不用了

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果选择 B：进行后续询问：

> 匿名模式仅发送汇总数据，不包含唯一 ID。

选项：
- A) 好的，匿名模式可以接受
- B) 不用了，完全关闭

如果 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

如果 `TEL_PROMPTED` 为 `yes`，则跳过。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：询问一次：

> 允许 gstack 主动建议技能，例如针对“这样能正常工作吗？”建议使用 /qa，或针对错误建议使用 /investigate？

选项：
- A) 保持开启（推荐）
- B) 关闭 —— 我会自行输入 /commands

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 为 `yes`，则跳过。

## 首次运行指引（一次性）

如果 `ACTIVATED` 为 `no`（此机器上首次运行技能），且前置信息输出了非空的 `FIRST_TASK:` 值，并且该值不是 `nongit`：根据令牌显示一行简短的、针对项目的提示，然后继续执行用户实际请求的内容 —— 不要中断用户的任务。令牌映射如下：`greenfield` → “全新仓库 —— 先使用 `/spec` 或 `/office-hours` 确定其形态。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里已有代码 —— 使用 `/qa` 查看其运行情况，或在发现异常时使用 `/investigate`。” `branch_ahead` → “此分支上有尚未发布的工作 —— 先执行 `/review`，然后执行 `/ship`。” `dirty_default` → “存在未提交的更改 —— 提交前先执行 `/review`。” `clean_default` → “请选择一个：`/spec`、`/investigate` 或 `/qa`。” 然后将你看到的令牌替换为 TASK_TOKEN，并运行以下命令（尽力而为），然后标记为已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no`，但 `FIRST_TASK:` 为空或为 `nongit`（无头模式、非 git 项目或没有可执行的操作）：不显示任何内容，只运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则，如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：提示一次（然后继续）：

> 提示：完成一个循环后，gstack 才能真正发挥作用——**规划 → 评审 → 发布**。一个常见的首次循环是：使用 `/office-hours` 或 `/spec` 明确需求，使用 `/plan-eng-review` 确定方案，然后使用 `/ship`。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 都为 `yes`，则跳过此部分。

如果 `HAS_ROUTING` 为 `no`、`ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录中是否存在 CLAUDE.md 文件。如果不存在，则创建该文件。

使用 AskUserQuestion：

> 当项目的 CLAUDE.md 包含技能路由规则时，gstack 的效果最佳。

选项：
- A) 将路由规则添加到 CLAUDE.md（推荐）
- B) 不用了，我会手动调用技能

如果选择 A：将以下部分追加到 CLAUDE.md 的末尾：

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

然后提交更改：`git add CLAUDE.md && git commit -m "chore: add gstack skill routing rules to CLAUDE.md"`

如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并说明可以通过 `gstack-config set routing_declined false` 重新启用。

每个项目只执行一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，且 `~/.gstack/.vendoring-warned-$SLUG` 不存在，则通过 AskUserQuestion 提示一次：

> 此项目在 `.claude/skills/gstack/` 中内置了 gstack。内置方式已弃用。
> 要迁移到团队模式吗？

选项：
- A) 是，现在迁移到团队模式
- B) 不用了，我会自行处理

如果选择 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户："完成。现在每位开发者都需要运行：`cd ~/.claude/skills/gstack && ./setup --team`"

如果选择 B：说："好的，内置副本的更新由你自行负责。"

始终运行（无论选择哪一项）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你正在由 AI 编排器（例如 OpenClaw）生成的会话中运行。在生成的会话中：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐选项。
- 不要运行升级检查、遥测提示、路由注入或 lake intro。
- 专注于完成任务，并通过文字输出报告结果。
- 以完成报告结束：说明已交付的内容、作出的决策以及任何不确定之处。

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
_BRAIN_SYNC_BIN="$HOME/.claude/skills/gstack/bin/gstack-brain-sync"
_BRAIN_CONFIG_BIN="$HOME/.claude/skills/gstack/bin/gstack-config"

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
      echo "GBrain configured. Prefer \`gbrain search\`/\`gbrain query\` over Grep for"
      echo "semantic questions; use \`gbrain code-def\`/\`code-refs\`/\`code-callers\` for"
      echo "symbol-aware code lookup. See \"## GBrain Search Guidance\" in CLAUDE.md."
      echo "Run /sync-gbrain to refresh."
    else
      echo "GBrain configured but this worktree isn't pinned yet. Run \`/sync-gbrain --full\`"
      echo "before relying on \`gbrain search\` for code questions in this worktree."
      echo "Falls back to Grep until pinned."
    fi
  fi
fi

_BRAIN_SYNC_MODE=$("$_BRAIN_CONFIG_BIN" get artifacts_sync_mode 2>/dev/null || echo off)

# Detect remote-MCP mode (Path 4 of /setup-gbrain). Local artifacts sync is
# a no-op in remote mode; the brain server pulls from GitHub/GitLab on its
# own cadence. Read claude.json directly to keep this preamble fast (no
# subprocess to claude CLI on every skill start). Both registration scopes
# are read (#2499): user scope, then the nearest-ancestor project scope.
_GBRAIN_MCP_MODE="none"
_GBRAIN_MCP_ENTRY=""
if command -v jq >/dev/null 2>&1 && [ -f "$HOME/.claude.json" ]; then
  _GBRAIN_MCP_ENTRY=$(jq -c --arg cwd "$PWD" '((.projects // {}) | to_entries | map(select((.key as $k | $cwd == $k or ($cwd | startswith($k + "/")) or ($cwd | startswith($k + "\\"))) and ((try .value.mcpServers.gbrain catch null) != null))) | sort_by(.key | length) | last | .value.mcpServers.gbrain) // .mcpServers.gbrain // empty' "$HOME/.claude.json" 2>/dev/null)
  _GBRAIN_MCP_TYPE=$(printf '%s' "$_GBRAIN_MCP_ENTRY" | jq -r '.type // .transport // empty' 2>/dev/null)
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
    case "$_BRAIN_LAST" in ''|*[!0-9]*) _BRAIN_LAST=0 ;; esac
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
  _GBRAIN_HOST=$(printf '%s' "${_GBRAIN_MCP_ENTRY:-}" | jq -r '.url // empty' 2>/dev/null | sed -E 's|^https?://([^/:]+).*|\1|' | head -1 | tr -cd 'A-Za-z0-9._-')
  echo "ARTIFACTS_SYNC: remote-mode (managed by brain server ${_GBRAIN_HOST:-remote})"
elif [ -d "$_GSTACK_HOME/.git" ] && [ "$_BRAIN_SYNC_MODE" != "off" ]; then
  _BRAIN_QUEUE_DEPTH=0
  # Spool-dir queue (one file per record); legacy .brain-queue.jsonl lines are
  # counted too until the drain migrates them.
  [ -d "$_GSTACK_HOME/.brain-queue.d" ] && _BRAIN_QUEUE_DEPTH=$(find "$_GSTACK_HOME/.brain-queue.d" -maxdepth 1 -name '*.json' 2>/dev/null | wc -l | tr -d ' ')
  [ -f "$_GSTACK_HOME/.brain-queue.jsonl" ] && _BRAIN_QUEUE_DEPTH=$(( _BRAIN_QUEUE_DEPTH + $(wc -l < "$_GSTACK_HOME/.brain-queue.jsonl" | tr -d ' ') ))
  [ -f "$_GSTACK_HOME/.brain-queue.jsonl.migrating" ] && _BRAIN_QUEUE_DEPTH=$(( _BRAIN_QUEUE_DEPTH + $(wc -l < "$_GSTACK_HOME/.brain-queue.jsonl.migrating" | tr -d ' ') ))
  _BRAIN_LAST_PUSH="never"
  [ -f "$_GSTACK_HOME/.brain-last-push" ] && _BRAIN_LAST_PUSH=$(cat "$_GSTACK_HOME/.brain-last-push" 2>/dev/null || echo never)
  echo "ARTIFACTS_SYNC: mode=$_BRAIN_SYNC_MODE | last_push=$_BRAIN_LAST_PUSH | queue=$_BRAIN_QUEUE_DEPTH"
else
  echo "ARTIFACTS_SYNC: off"
fi
```

隐私停止门：如果输出显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 位于 PATH 中，或 `gbrain doctor --fast --json` 可正常运行，请询问一次：

> gstack 可以将你的制品（CEO 计划、设计、报告）发布到一个私有 GitHub 仓库，供 GBrain 跨机器建立索引。你希望同步多少内容？

选项：
- A) 所有列入允许列表的内容（推荐）
- B) 仅制品
- C) 拒绝，全部保留在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-artifacts-init`。不要阻塞 skill。

在 skill 结束时、遥测之前：

```bash
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 针对模型的行为补丁（claude）

以下提示针对 claude 模型系列进行了调整。它们服从于 skill 工作流、STOP 点、AskUserQuestion 门、计划模式安全要求以及 /ship 审查门。如果以下提示与 skill 指令冲突，以 skill 指令为准。将这些内容视为偏好，而非规则。

**待办列表纪律。** 执行多步骤计划时，每完成一个任务就单独将其标记为完成。不要在最后批量标记完成。如果某个任务后来变得没有必要，用一行原因将其标记为跳过。

**重大操作前先思考。** 对于复杂操作（重构、迁移、非平凡的新功能），在执行前简要说明你的方法。这样用户可以低成本地调整方向，而不必等到执行过程中途。

**优先使用专用工具，而不是 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是对应的 shell 命令（cat、sed、find、grep）。专用工具成本更低，也更清晰。

## 语气

直接、具体，以构建者对构建者的方式沟通。说清楚文件、函数、命令以及对用户可见的影响。不要添加废话。

不要使用破折号。不要使用 AI 术语：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要使用企业化或学术化语言。使用简短段落。以接下来要做什么结束。

用户掌握你不了解的上下文。跨模型一致意见只是建议，不是决定。由用户决定。

## 完成状态协议

完成 skill 工作流时，使用以下状态之一进行报告：
- **DONE** — 已完成，并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出相关问题。
- **BLOCKED** — 无法继续，说明阻塞原因以及已尝试的操作。
- **NEEDS_CONTEXT** — 缺少信息，准确说明需要什么。

在 3 次尝试失败、不确定的安全敏感变更，或无法验证范围之后进行升级。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 运营自我改进

完成前，回顾本次会话并记录每一条可长期复用的经验。此步骤 ALWAYS 运行，并不取决于是否觉得有什么值得记录的内容（#2402：44 条经验中有 43 条来自明确的 /learn，因为“如果你发现了”被理解成了可选步骤）。可长期复用的经验包括项目特性、命令修复、容易踩坑的地方或能在未来会话中节省 5 分钟以上的模式。如果回顾确实没有发现任何内容，请在完成总结中写明 “No durable learnings this session”，这是明确的空结果，而不是跳过该步骤。

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的瞬时错误。

## Telemetry（最后运行）

工作流完成后，记录 telemetry。使用 frontmatter 中的 `name:` 作为 skill。OUTCOME 为 success/error/abort/unknown。

**PLAN MODE EXCEPTION — ALWAYS RUN：** 此命令会将 telemetry 写入
`~/.gstack/analytics/`，与前置 analytics 写入位置一致。

运行以下 bash：

```bash
_TEL_END=$(date +%s)
_TEL_DUR=$(( _TEL_END - _TEL_START ))
rm -f ~/.gstack/analytics/.pending-"$_SESSION_ID" 2>/dev/null || true
# Session timeline: record skill completion (local-only, never sent anywhere)
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"SKILL_NAME","event":"completed","branch":"'$(git branch --show-current 2>/dev/null || echo unknown)'","outcome":"OUTCOME","duration_s":"'"$_TEL_DUR"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null || true
# Local analytics (gated on telemetry setting)
if [ "$_TEL" != "off" ]; then
echo '{"skill":"SKILL_NAME","duration_s":"'"$_TEL_DUR"'","outcome":"OUTCOME","browse":"USED_BROWSE","session":"'"$_SESSION_ID"'","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
fi
# Remote telemetry (opt-in, requires binary)
if [ "$_TEL" != "off" ] && [ -x ~/.claude/skills/gstack/bin/gstack-telemetry-log ]; then
  ~/.claude/skills/gstack/bin/gstack-telemetry-log \
    --skill "SKILL_NAME" --duration "$_TEL_DUR" --outcome "OUTCOME" \
    --used-browse "USED_BROWSE" --session-id "$_SESSION_ID" \
    --error-message "ERROR_MESSAGE" --failed-step "FAILED_STEP" 2>/dev/null &
fi
```

运行前替换 `SKILL_NAME`、`OUTCOME` 和 `USED_BROWSE`。
如果 outcome 为 error，则将 `ERROR_MESSAGE` 替换为错误的简短描述；
否则使用空字符串 `""`；如果 outcome 为 error，则将 `FAILED_STEP` 替换为
发生失败的步骤名称或编号；否则使用空字符串 `""`。

## 计划状态页脚

运行计划审查的 skills（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于在调用 ExitPlanMode 前验证计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。不运行计划审查的 skills（如 `/ship`、`/qa`、`/review` 等操作型 skills）通常不会在 plan mode 下运行，也没有需要验证的审查报告；此页脚对它们不起作用。在 plan mode 下唯一允许的编辑是编写计划文件。

# /benchmark-models — 跨模型 Skill 基准测试

你正在运行 `/benchmark-models` 工作流。该工作流通过交互流程封装 `gstack-model-benchmark` 二进制程序，用于选择提示词、确认提供商、预览身份验证并运行基准测试。

不同于 `/benchmark` —— 后者用于测量网页性能（Core Web Vitals、加载时间）。此 skill 用于测量 AI 模型在 gstack skills 或任意提示词上的性能。

---

## 步骤 0：定位二进制程序

```bash
BIN="$HOME/.claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || BIN=".claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || { echo "ERROR: gstack-model-benchmark not found. Run ./setup in the gstack install dir." >&2; exit 1; }
echo "BIN: $BIN"
```

如果未找到，则停止并告知用户重新安装 gstack。

---

## 步骤 1：选择提示词

使用 `AskUserQuestion`，并采用以下前置说明格式：
- **重新定位：** 当前项目 + 分支。
- **简化说明：**“跨模型基准测试会将同一个提示词分别交给 2-3 个 AI 模型运行，并展示它们在速度、成本和输出质量方面的对比。我们应该使用什么提示词？”
- **推荐：** A，因为针对真实 skill 进行基准测试可以揭示工具使用方面的差异，而不仅仅是原始生成能力。
- **选项：**
  - A) 对我的某个 gstack skill 进行基准测试（下一步选择具体 skill）。完整度：10/10。
  - B) 使用内联提示词——下一轮输入。完整度：8/10。
  - C) 指定磁盘上的提示词文件——下一轮指定路径。完整度：8/10。

如果选择 A：列出包含 SKILL.md 文件的顶层 gstack skill（使用 `find . -maxdepth 2 -name SKILL.md -not -path './.*'`），然后使用第二个 `AskUserQuestion` 让用户选择一个。使用所选的 SKILL.md 路径作为提示词文件。

如果选择 B：询问用户内联提示词。通过 `--prompt "<text>"` 原样使用该提示词。

如果选择 C：询问路径。验证该路径是否存在。将其作为位置参数使用。

---

## 步骤 2：选择提供商

```bash
"$BIN" --prompt "unused, dry-run" --models claude,gpt,gemini --dry-run
```

显示 dry-run 输出。“Adapter availability”部分会告知用户哪些提供商实际上会运行（OK），哪些会跳过（NOT READY——其中包含修复提示）。

如果三个提供商全部显示 NOT READY：停止并明确说明——至少需要一个已完成身份验证的提供商才能运行基准测试。建议执行 `claude login`、`codex login` 或 `gemini login` / `export GOOGLE_API_KEY`。

如果至少有一个显示 OK：使用 `AskUserQuestion`：
- **简化说明：**“我们应该包含哪些模型？上面的 dry-run 显示了哪些模型已完成身份验证。未完成身份验证的模型会被正常跳过，不会中止批处理。”
- **推荐：** A（所有已完成身份验证的提供商），因为尽可能运行更多模型可以获得更丰富的对比结果。
- **选项：**
  - A) 所有已完成身份验证的提供商。完整度：10/10。
  - B) 仅 Claude。完整度：6/10（没有跨模型信号——单独的 Claude 基准测试请改用 /ship 的 review）。
  - C) 选择两个——下一轮指定。完整度：8/10。

---

## 步骤 3：决定是否使用评审器

```bash
[ -n "$ANTHROPIC_API_KEY" ] || grep -q 'ANTHROPIC' "$HOME/.claude/.credentials.json" 2>/dev/null && echo "JUDGE_AVAILABLE" || echo "JUDGE_UNAVAILABLE"
```

如果评审器可用，使用 `AskUserQuestion`：
- **简化说明：**“质量评审器会使用 Anthropic 的 Claude 作为仲裁者，以 0-10 分的标准为每个模型的输出评分。每次运行增加约 0.05 美元。如果你关心输出质量，而不仅仅是延迟和成本，建议启用。”
- **推荐：** A——核心目标是比较质量，而不仅仅是速度。
- **选项：**
  - A) 启用评审器（增加约 0.05 美元）。完整度：10/10。
  - B) 跳过评审器——仅比较速度、成本和 token 数。完整度：7/10。

如果 judge 不可用，则跳过此问题，并省略 `--judge` 标志。

---

## 第 4 步：运行基准测试

根据第 1、2、3 步的决策构造命令：

```bash
"$BIN" <prompt-spec> --models <picked-models> [--judge] --output table
```

其中，`<prompt-spec>` 可以是 `--prompt "<text>"`（第 1B 步）、文件路径（第 1A 或 1C 步），而 `<picked-models>` 是第 2 步中以逗号分隔的列表。

随着输出到达，实时输出结果。这一步速度较慢，因为每个 provider 都会完整运行一次 prompt。根据 prompt 的复杂程度以及是否启用 `--judge`，预计耗时 30 秒到 5 分钟。

---

## 第 5 步：解读结果

表格输出后，向用户总结：
- **最快** — 延迟最低的 provider。
- **最便宜** — 成本最低的 provider。
- **质量最高**（如果运行了 `--judge`）— 得分最高的 provider。
- **总体最佳** — 根据判断得出。如果运行了 judge：按质量加权。如果未运行：指出用户需要权衡的因素。

如果任何 provider 遇到错误（auth/timeout/rate_limit），请指出该错误以及对应的解决路径。

---

## 第 6 步：提供保存结果的选项

AskUserQuestion：
- **简化版：**“是否将此次基准测试保存为 JSON，以便今后与其进行比较？”
- **推荐：**A — 随着 provider 更新其模型，skill 的性能会发生变化；保存的基线可以发现质量回归。
- **选项：**
  - A) 保存到 `~/.gstack/benchmarks/<date>-<skill-or-prompt-slug>.json`。完整性：10/10。
  - B) 仅打印，不保存。完整性：5/10（会丢失趋势数据）。

如果选择 A：使用 `--output json` 重新运行，并将输出 tee 到按日期命名的文件中。打印文件路径，以便用户将来与其进行差异比较。

---

## 重要规则

- **绝不要在完成第 2 步的试运行之前运行真实基准测试。** 用户需要先查看 auth 状态，再决定是否花费 API 调用。
- **绝不要硬编码模型名称。** 始终传入用户在第 2 步选择的 provider — 由二进制程序处理其余部分。
- **绝不要自动包含 `--judge`。** 它会产生实际成本；必须由用户选择启用。
- **如果没有任何 provider 完成 auth，立即停止。** 不要尝试运行基准测试，因为不会产生有用的输出。
- **成本是可见的。** 每次运行都会在表格中显示各 provider 的成本。用户应该在下一次运行之前看到这些信息。