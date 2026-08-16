---
name: gstack
preamble-tier: 1
version: 1.2.0
description: Router for the gstack skill suite. (gstack)
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
triggers:
  - gstack
  - which gstack skill
  - route this with gstack

---
<!-- 由 SKILL.md.tmpl 自动生成——请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

将任何 gstack 请求发送到正确的技能
（规划、审查、QA、发布、调试、文档、安全、设计）。对于浏览器/QA
和实际体验测试，它会将你引导至 /browse。当你在未指定具体技能的情况下调用 gstack，
或询问“哪个 gstack 技能适合此任务？”时使用。

## 前置步骤（首先运行）

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
echo '{"skill":"gstack","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"gstack","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

## 计划模式下的安全操作

在计划模式下，以下操作因有助于制定计划而被允许：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及使用 `open` 打开生成的产物。

## 计划模式下的 Skill 调用

如果用户在计划模式下调用某个 Skill，该 Skill 的优先级高于通用的计划模式行为。**应将 Skill 文件视为可执行指令，而不是参考资料。** 从 Step 0 开始逐步执行；Skill 触发的任何 AskUserQuestion 都是在计划模式内运行工作流，并不违反计划模式——如果某个 Skill 的指令能够自行解决问题（例如在计划模式下自动选择），则可以合理地不发起询问。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生版本；参见“AskUserQuestion Format → Tool resolution”）均满足计划模式的回合结束要求。如果 AskUserQuestion 不可用或调用失败，请遵循 AskUserQuestion Format 的失败回退方式：`headless` → BLOCKED；`interactive` → 使用文字回退方式（同样满足回合结束要求）。遇到 STOP 点时，立即停止。不得继续执行工作流，也不得在此处调用 ExitPlanMode。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令必须执行。仅在 Skill 工作流完成后，或用户要求取消 Skill 或退出计划模式时，才调用 ExitPlanMode。

如果 `PROACTIVE` 为 `"false"`，不要自动调用或主动建议使用 Skill。如果某个 Skill 似乎有用，请询问：“我觉得 /skillname 在这里可能会有帮助——要我运行它吗？”

如果 `SKILL_PREFIX` 为 `"true"`，建议/调用 `/gstack-*` 名称。磁盘路径仍为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果 `UPDATE_CHECK` 为 `"false"`，跳过接下来的两行——在该模式下，更新检查二进制文件不会产生任何输出，因此无需处理 `UPGRADE_AVAILABLE` / `JUST_UPGRADED` 输出。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“Inline upgrade flow”（如果已配置则自动升级，否则使用包含 4 个选项的 AskUserQuestion；如果用户拒绝，则写入延后提醒状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：输出“正在运行 gstack v{to}（刚刚更新！）”。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多提示一次：
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 AskUserQuestion 询问是否启用 Continuous checkpoint 自动提交。如果接受，运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。无论如何都要创建标记文件。
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：告知“Model overlays 已启用。MODEL_OVERLAY 会显示补丁。”无论如何都要创建标记文件。

完成升级提示后，继续执行工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：就写作风格询问一次：

> v1 提示词更简单：首次使用时解释术语、以结果为导向提出问题、行文更简短。保留默认设置，还是恢复简洁风格？

选项：
- A) 保留新的默认设置（推荐——良好的写作对所有人都有帮助）
- B) 恢复 V0 文风——设置 `explain_level: terse`

如果选择 A：不设置 `explain_level`（默认为 `default`）。
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

无论选择什么，始终运行：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，则跳过。

如果 `LAKE_INTRO` 为 `no`：告知用户“gstack 遵循 **Boil the Ocean** 原则——当 AI 让边际成本接近于零时，就把事情完整地做完。了解更多：https://garryslist.org/posts/boil-the-ocean”并询问是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在用户同意时运行 `open`。始终运行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 询问一次遥测数据相关选项：

> 帮助 gstack 变得更好。仅共享使用数据：技能、持续时间、崩溃信息、稳定设备 ID。不包含代码或文件路径。你的仓库名称仅记录在本地，并会在上传前移除。

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不用了，谢谢

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果选择 B：继续询问：

> 匿名模式仅发送汇总的使用数据，不包含唯一 ID。

选项：
- A) 可以，匿名模式没问题
- B) 不用了，谢谢，完全关闭

如果 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

如果 `TEL_PROMPTED` 为 `yes`，则跳过。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：询问一次：

> 是否允许 gstack 主动建议技能，例如针对“这个能正常工作吗？”建议 /qa，或针对错误建议 /investigate？

选项：
- A) 保持开启（推荐）
- B) 将其关闭——我会自己输入 /commands

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 为 `yes`，则跳过。

## 首次运行指引（仅一次）

如果 `ACTIVATED` 为 `no`（在这台机器上首次运行技能），并且前置步骤输出了一个非空的 `FIRST_TASK:` 值，且该值不是 `nongit`：根据该标记显示一行简短的项目专属提示，然后继续执行用户实际要求的任务——不要中止其任务。标记映射如下：`greenfield` → “这是一个全新的仓库——先使用 `/spec` 或 `/office-hours` 确定其方向。”`code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里已有代码——使用 `/qa` 检查它能否正常工作；如果有问题，则使用 `/investigate`。”`branch_ahead` → “这个分支上有尚未发布的工作——先运行 `/review`，然后运行 `/ship`。”`dirty_default` → “存在未提交的更改——提交前先运行 `/review`。”`clean_default` → “请选择一个：`/spec`、`/investigate` 或 `/qa`。”然后用你看到的标记替换 TASK_TOKEN 并运行（尽力而为），再将状态标记为已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no`，但 `FIRST_TASK:` 为空或为 `nongit`（无界面、非 Git 或没有可执行的操作）：不显示任何内容，只运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则，如果 `ACTIVATED` 为 `yes` **且** `FIRST_LOOP_SHOWN` 为 `no`：仅提示一次以下预告信息（然后继续）：

> 提示：当你完成一个完整循环——**规划 → 审查 → 发布**——时，gstack 才能充分发挥价值。常见的第一个循环是：使用 `/office-hours` 或 `/spec` 梳理内容，使用 `/plan-eng-review` 将其敲定，然后使用 `/ship` 发布。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 均为 `yes`，则跳过本节。

如果 `HAS_ROUTING` 为 `no` **且** `ROUTING_DECLINED` 为 `false` **且** `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录中是否存在 CLAUDE.md 文件。如果不存在，则创建该文件。

使用 AskUserQuestion：

> 当项目的 CLAUDE.md 包含技能路由规则时，gstack 的效果最佳。

选项：
- A) 将路由规则添加到 CLAUDE.md（推荐）
- B) 不用了，我会手动调用技能

如果选择 A：将以下部分追加到 CLAUDE.md 末尾：

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

如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并告知用户可以使用 `gstack-config set routing_declined false` 重新启用。

每个项目只会执行一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，除非 `~/.gstack/.vendoring-warned-$SLUG` 已存在，否则通过 AskUserQuestion 警告一次：

> 此项目已将 gstack 内置于 `.claude/skills/gstack/` 中。内置方式已弃用。
> 是否迁移到团队模式？

选项：
- A) 是，立即迁移到团队模式
- B) 否，我会自行处理

如果选择 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户：“已完成。现在每位开发者都需要运行：`cd ~/.claude/skills/gstack && ./setup --team`”

如果选择 B：提示“好的，你需要自行负责让内置副本保持最新。”

始终运行（无论选择哪一项）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记已存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你正在由 AI 编排器（例如 OpenClaw）生成的会话中运行。在生成的会话中：
- 不要使用 AskUserQuestion 发起交互式提示。自动选择推荐选项。
- 不要运行升级检查、遥测提示、路由注入或 lake 介绍。
- 专注于完成任务，并通过文字输出报告结果。
- 最后提供一份完成报告：交付了什么、做出了哪些决定，以及任何不确定之处。

## 构件同步（技能启动时）

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

隐私停止检查点：如果输出显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 位于 PATH 中或 `gbrain doctor --fast --json` 可以运行，则询问一次：

> gstack 可以将你的产物（CEO 计划、设计、报告）发布到一个私有 GitHub 仓库，供 GBrain 跨机器索引。需要同步多少内容？

选项：
- A) 允许列表中的所有内容（推荐）
- B) 仅产物
- C) 拒绝，所有内容保留在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且缺少 `~/.gstack/.git`，询问是否运行 `gstack-artifacts-init`。不要阻塞该 Skill。

在 Skill 结束时、遥测之前：

```bash
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 模型特定行为补丁（claude）

以下引导针对 claude 模型系列进行了调整。它们
**从属于** Skill 工作流、STOP 点、AskUserQuestion 检查点、计划模式
安全机制和 /ship 审查检查点。如果以下引导与 Skill 指令冲突，
以 Skill 为准。将这些视为偏好，而不是规则。

**待办列表规范。** 执行多步骤计划时，每完成一项任务就单独将其
标记为已完成。不要在最后批量标记完成。如果某项任务最终没有必要执行，
将其标记为已跳过，并用一行说明原因。

**执行繁重操作前先思考。** 对于复杂操作（重构、迁移、
重要的新功能），在执行前简要说明你的方法。这样用户可以低成本地
纠正方向，而不必等到执行过程中再调整。

**优先使用专用工具而不是 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是 shell
中的等效命令（cat、sed、find、grep）。专用工具成本更低，也更清晰。

## 表达风格

直接、具体，以构建者对构建者的方式交流。明确指出文件、函数、命令以及对用户可见的影响。不要说空话。

不要使用长破折号。不要使用 AI 用语：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要使用企业或学术腔调。段落要短。结尾说明下一步该做什么。

用户掌握你不了解的上下文。不同模型之间的一致意见只是建议，而不是决定。由用户做决定。

## 完成状态协议

完成 Skill 工作流时，使用以下状态之一报告：
- **DONE** — 已完成，并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但需列出疑虑。
- **BLOCKED** — 无法继续；说明阻塞原因以及已尝试的操作。
- **NEEDS_CONTEXT** — 缺少信息；明确说明需要哪些信息。

在尝试失败 3 次、涉及不确定的安全敏感变更，或无法验证范围时升级处理。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 操作层面的自我改进

完成前，如果你发现了一个长期存在的项目特性或命令修复方法，且能为下次节省 5 分钟以上，请记录它：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的瞬态错误。

## 遥测（最后运行）

工作流完成后，记录遥测。使用 frontmatter 中的技能 `name:`。OUTCOME 为 success/error/abort/unknown。

**计划模式例外——始终运行：** 此命令会将遥测数据写入
`~/.gstack/analytics/`，与前置分析数据写入的位置一致。

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
将 `ERROR_MESSAGE` 替换为简短的错误描述（如果结果为 error；
否则使用空字符串 ""），并将 `FAILED_STEP` 替换为发生失败的步骤名称或编号
（如果结果为 error；否则使用空字符串 ""）。

## 计划状态页脚

运行计划审查的技能（`/plan-*-review`、`/codex review`）会在技能末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于在调用 ExitPlanMode 之前验证计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。不运行计划审查的技能（例如 `/ship`、`/qa`、`/review` 等操作型技能）通常不会在计划模式下运行，也没有需要验证的审查报告；此页脚对它们不起作用。写入计划文件是计划模式下唯一允许的编辑操作。

## 首先进行路由

这是 gstack 路由器。它唯一的任务是将请求发送给正确的技能。

1. 如果请求与浏览器、QA、实际试用、截图或检查页面有关
   （打开网站、测试部署、截图、直观检查流程）→ 调用 `/browse`。
2. 否则，按照以下规则进行路由。如果没有匹配项，则直接回答。

尽力记录所采用的路由方式（绝不能因此阻塞）。将 `ROUTE_OUTCOME` 设置为
`browse`（发送至 /browse）、`routed`（发送至其他技能）或 `direct`（直接回答，
没有匹配的技能）：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type route --skill gstack --outcome ROUTE_OUTCOME --session-id "$_SESSION_ID" 2>/dev/null || true
```

如果 `PROACTIVE` 为 `false`：在本次会话期间，不要主动调用或建议其他 gstack 技能。仅运行用户明确调用的技能。此偏好通过 `gstack-config` 跨会话持久保留。

如果 `PROACTIVE` 为 `true`（默认值）：当用户的请求与某项技能的用途相匹配时，**调用 Skill 工具**。当存在适用于该任务的技能时，不要直接回答。使用 Skill 工具调用该技能。该技能具有专门的工作流、检查清单和质量关卡，能够产生比内联回答更好的结果。

**路由规则——当你看到以下模式时，通过 Skill 工具调用相应技能：**
- 用户描述一个新想法、询问“这值得构建吗”、进行头脑风暴、推介一个概念 → 调用 `/office-hours`
- 用户要求详细说明某项内容、提交 issue、编写工单、“把它转成 GitHub issue”、“待办事项” → 调用 `/spec`
- 用户询问战略、范围、目标、“想得更大一些”、“我们应该构建什么” → 调用 `/plan-ceo-review`
- 用户要求审查架构、敲定计划、“这个设计合理吗” → 调用 `/plan-eng-review`
- 用户询问设计系统、品牌、视觉识别、“它应该是什么样子” → 调用 `/design-consultation`
- 用户要求审查计划的设计 → 调用 `/plan-design-review`
- 用户询问计划的开发者体验、API/CLI/SDK 设计 → 调用 `/plan-devex-review`
- 用户希望自动完成所有审查、“审查所有内容” → 调用 `/autoplan`
- 用户报告 bug、错误、行为异常、“为什么坏了”、“这不工作”、“搞什么鬼”、“哪里不对劲” → 调用 `/investigate`
- 用户要求测试网站、查找 bug、进行 QA、“这能用吗”、“检查部署” → 调用 `/qa`
- 用户要求只报告 bug 而不修复 → 调用 `/qa-only`
- 用户要求审查代码、检查 diff、进行合入前审查、“看看我的改动” → 调用 `/review`
- 用户询问视觉精修、对线上网站进行设计审计、“这看起来不太对” → 调用 `/design-review`
- 用户要求审计线上的开发者体验、首次成功运行所需时间 → 调用 `/devex-review`
- 用户要求发布、部署、推送、创建 PR、“让我们合入它”、“发出去” → 调用 `/ship`
- 用户要求将合并、部署和验证作为一个流程完成 → 调用 `/land-and-deploy`
- 用户要求为项目配置部署 → 调用 `/setup-deploy`
- 用户要求在发布后监控生产环境、执行部署后检查 → 调用 `/canary`
- 用户要求在发布后更新文档 → 调用 `/document-release`
- 用户要求从头编写文档、生成文档、“为此功能/模块编写文档” → 调用 `/document-generate`
- 用户要求进行每周复盘、询问我们发布了什么、“我们做得怎么样” → 调用 `/retro`
- 用户要求获得第二意见、进行 codex 审查 → 调用 `/codex`
- 用户要求启用安全模式、谨慎模式 → 调用 `/careful` 或 `/guard`
- 用户要求将编辑限制在某个目录中 → 调用 `/freeze` 或 `/unfreeze`
- 用户要求升级 gstack → 调用 `/gstack-upgrade`
- 用户要求保存进度、创建检查点、“保存我的工作” → 调用 `/context-save`
- 用户要求继续、恢复、“我做到哪了” → 调用 `/context-restore`
- 用户询问安全性、OWASP、漏洞、“这安全吗” → 调用 `/cso`
- 用户要求制作 PDF、文档、出版物 → 调用 `/make-pdf`
- 用户要求启动真实浏览器进行 QA、“打开浏览器” → 调用 `/open-gstack-browser`
- 用户要求导入 cookie 以进行身份验证测试 → 调用 `/setup-browser-cookies`
- 用户询问页面速度、性能回归、基准测试 → 调用 `/benchmark`
- 用户询问 gstack 学到了什么、“显示学习成果” → 调用 `/learn`
- 用户要求调整问题敏感度、“别再问我那个了” → 调用 `/plan-tune`
- 用户要求查看代码质量仪表板、“健康检查” → 调用 `/health`

**如有疑问，请调用技能。** 误报（调用了不需要的技能）的代价低于漏报（在已有结构化工作流时仍临时作答）。技能提供多步骤工作流、检查清单和质量门禁，始终能比临时作答产生更好的结果。如果没有匹配的技能，则照常直接回答。

如果用户选择不接收建议，请运行 `gstack-config set proactive false`。
如果他们选择重新接收建议，请运行 `gstack-config set proactive true`。