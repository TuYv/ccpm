---
name: diagram
preamble-tier: 1
version: 1.0.0
description: "Turn an English description (or mermaid source) into a diagram triplet: the source, an editable .excalidraw file you can open on excalidraw.com, and rendered SVG + PNG. (gstack)"
allowed-tools:
  - Bash
  - Read
  - Write
  - AskUserQuestion
triggers:
  - make a diagram
  - draw a diagram
  - create a flowchart
  - diagram this
  - visualize this flow
  - architecture diagram
---
<!-- 由 SKILL.md.tmpl 自动生成 — 请勿直接编辑 -->
<!-- 重新生成：bun run gen:skill-docs -->


## 何时调用此技能

SVG/PNG 采用简洁的 Mermaid 风格；
.excalidraw 则保留手绘美感。完全离线。
当用户要求“制作图表”“绘制架构”“创建流程图”
“用图表表示这个内容”或“可视化这个流程”时使用。

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
echo '{"skill":"diagram","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"diagram","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

在计划模式下，以下操作是允许的，因为它们可为计划提供信息：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及使用 `open` 打开生成的产物。

## 计划模式下的 Skill 调用

如果用户在计划模式下调用某个 Skill，则该 Skill 优先于通用的计划模式行为。**请将 Skill 文件视为可执行指令，而不是参考资料。** 从步骤 0 开始，逐步遵循其中的指令；该 Skill 触发的任何 AskUserQuestion 都属于在计划模式内运行的工作流，并不违反计划模式——而且，如果某个 Skill 的指令本身解决了问题（例如计划模式下自动选择），它也完全可以不提出问题。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生版本；请参阅“AskUserQuestion 格式 → 工具解析”）满足计划模式对回合结束的要求。如果 AskUserQuestion 不可用或调用失败，请遵循 AskUserQuestion 格式中的失败回退规则：`headless` → BLOCKED；`interactive` → 文本回退（同样满足回合结束要求）。到达 STOP 点时，立即停止。不要继续执行工作流，也不要在那里调用 ExitPlanMode。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令应当执行。仅在 Skill 工作流完成后，或者用户要求你取消该 Skill 或退出计划模式时，才调用 ExitPlanMode。

如果 `PROACTIVE` 为 `"false"`，不要自动调用或主动推荐 Skill。如果某个 Skill 看起来可能有用，请询问：“我认为 /skillname 在这里可能会有所帮助——要我运行它吗？”

如果 `SKILL_PREFIX` 为 `"true"`，请使用 `/gstack-*` 名称来推荐/调用 Skill。磁盘路径仍为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果 `UPDATE_CHECK` 为 `"false"`，跳过接下来的两行——在该模式下，更新检查二进制文件不会输出任何内容，因此也就没有需要处理的 `UPGRADE_AVAILABLE` / `JUST_UPGRADED` 输出。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md`，并遵循“内联升级流程”（如果已配置则自动升级，否则使用包含 4 个选项的 AskUserQuestion；如果用户拒绝，则写入延后提醒状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：输出“正在运行 gstack v{to}（刚刚完成更新！）”。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多提示一次：
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 AskUserQuestion 询问是否启用持续检查点自动提交。如果接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。无论如何都要创建该标记文件。
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：告知“模型叠加层已启用。MODEL_OVERLAY 会显示补丁。”无论如何都要创建该标记文件。

升级提示处理完毕后，继续执行工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：询问一次写作风格：

> v1 提示词更加简洁：首次使用时解释术语、以结果为导向提出问题、文字更精炼。保留默认设置，还是恢复简练风格？

选项：
- A) 保留新的默认设置（推荐——良好的写作对每个人都有帮助）
- B) 恢复 V0 文风——设置 `explain_level: terse`

如果选择 A：保持 `explain_level` 未设置（默认为 `default`）。
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终运行（无论选择哪一项）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，则跳过。

如果 `LAKE_INTRO` 为 `no`：告知用户：“gstack 遵循 **Boil the Ocean** 原则——当 AI 让边际成本接近于零时，就把事情完整地做完。了解更多：https://garryslist.org/posts/boil-the-ocean” 并询问是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在用户选择是时运行 `open`。始终运行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 询问一次是否启用遥测：

> 帮助 gstack 变得更好。仅分享使用数据：技能、持续时间、崩溃情况、稳定设备 ID。不包含代码或文件路径。你的仓库名称仅记录在本地，并会在上传前移除。

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不用了，谢谢

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果选择 B：继续询问：

> 匿名模式仅发送汇总使用数据，不包含唯一 ID。

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

> 是否允许 gstack 主动建议技能，例如在遇到“这个能用吗？”时建议 /qa，或在遇到 bug 时建议 /investigate？

选项：
- A) 保持开启（推荐）
- B) 关闭——我会自己输入 /commands

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 为 `yes`，则跳过。

## 首次运行指引（仅一次）

如果 `ACTIVATED` 为 `no`（这是此机器上首次运行技能），并且前置输出中包含一个非空且不为 `nongit` 的 `FIRST_TASK:` 值：根据该标记显示一行简短且针对当前项目的提示，然后继续执行用户实际请求的内容——不要中止其任务。标记映射如下：`greenfield` → “这是一个全新的仓库——先使用 `/spec` 或 `/office-hours` 确定其方向。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里有代码——使用 `/qa` 查看它是否正常运行；如果有异常，则使用 `/investigate`。” `branch_ahead` → “此分支上有尚未发布的工作——依次使用 `/review` 和 `/ship`。” `dirty_default` → “存在未提交的更改——提交前使用 `/review`。” `clean_default` → “选择一个：`/spec`、`/investigate` 或 `/qa`。” 然后用你看到的标记替换 TASK_TOKEN 并运行（尽力而为），再将其标记为已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no`，但 `FIRST_TASK:` 为空或为 `nongit`（无头模式、非 Git 项目或没有可执行的操作）：不显示任何内容，只运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则，如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：仅提示一次以下内容（然后继续）：

> 提示：完成一个完整循环时，gstack 才能发挥最大价值——**规划 → 审查 → 发布**。常见的第一个循环是：使用 `/office-hours` 或 `/spec` 梳理思路，使用 `/plan-eng-review` 最终确定，然后使用 `/ship` 发布。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 均为 `yes`，则跳过本节。

如果 `HAS_ROUTING` 为 `no`，且 `ROUTING_DECLINED` 为 `false`，且 `PROACTIVE_PROMPTED` 为 `yes`：
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

如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并告知用户可使用 `gstack-config set routing_declined false` 重新启用。

每个项目只会执行一次此操作。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，除非 `~/.gstack/.vendoring-warned-$SLUG` 已存在，否则通过 AskUserQuestion 警告一次：

> 此项目已将 gstack 内置在 `.claude/skills/gstack/` 中。内置方式已弃用。
> 是否迁移到团队模式？

选项：
- A) 是，立即迁移到团队模式
- B) 否，我会自行处理

如果选择 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户：“完成。现在每位开发者都需运行：`cd ~/.claude/skills/gstack && ./setup --team`”

如果选择 B：告知用户“好的，你需要自行负责让内置副本保持最新。”

无论选择什么，始终运行：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记已存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你正在由 AI 编排器（例如 OpenClaw）生成的会话中运行。在生成的会话中：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐选项。
- 不要运行升级检查、遥测提示、路由注入或 lake 介绍。
- 专注于完成任务，并通过文字输出报告结果。
- 最后提供完成报告：交付了什么、做出了哪些决定，以及任何不确定之处。

## 产物同步（技能启动时）

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
  _GBRAIN_MCP_ENTRY=$(jq -c --arg cwd "$PWD" '.mcpServers.gbrain // ((.projects // {}) | to_entries | map(select((.key as $k | $cwd == $k or ($cwd | startswith($k + "/"))) and ((try .value.mcpServers.gbrain catch null) != null))) | sort_by(.key | length) | last | .value.mcpServers.gbrain) // empty' "$HOME/.claude.json" 2>/dev/null)
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
  [ -f "$_GSTACK_HOME/.brain-queue.jsonl" ] && _BRAIN_QUEUE_DEPTH=$(wc -l < "$_GSTACK_HOME/.brain-queue.jsonl" | tr -d ' ')
  _BRAIN_LAST_PUSH="never"
  [ -f "$_GSTACK_HOME/.brain-last-push" ] && _BRAIN_LAST_PUSH=$(cat "$_GSTACK_HOME/.brain-last-push" 2>/dev/null || echo never)
  echo "ARTIFACTS_SYNC: mode=$_BRAIN_SYNC_MODE | last_push=$_BRAIN_LAST_PUSH | queue=$_BRAIN_QUEUE_DEPTH"
else
  echo "ARTIFACTS_SYNC: off"
fi
```

隐私停止门：如果输出显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 位于 PATH 中或 `gbrain doctor --fast --json` 可以运行，则询问一次：

> gstack 可以将你的产物（CEO 计划、设计、报告）发布到一个私有 GitHub 仓库，供 GBrain 建立索引并在多台机器间使用。需要同步多少内容？

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

如果选择 A/B 且缺少 `~/.gstack/.git`，询问是否运行 `gstack-artifacts-init`。不要阻塞该技能。

在技能结束时、遥测之前：

```bash
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 模型专用行为补丁（claude）

以下提示针对 claude 模型系列进行了调整。它们**从属于**技能工作流、停止点、AskUserQuestion 门、计划模式安全要求以及 /ship 审查门。如果以下提示与技能说明冲突，以技能为准。将这些内容视为偏好，而不是规则。

**待办事项列表纪律。** 执行多步骤计划时，每完成一项任务就单独将其标记为完成。不要在最后批量标记完成。如果某项任务最终不需要执行，请将其标记为已跳过，并用一行说明原因。

**执行重大操作前先思考。** 对于复杂操作（重构、迁移、重要的新功能），请在执行前简要说明你的处理方法。这样用户可以低成本地修正方向，而不必等到执行中途。

**优先使用专用工具，而非 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是对应的 shell 工具（cat、sed、find、grep）。专用工具成本更低，也更清晰。

## 表达风格

直接、具体，以构建者之间交流的方式表达。明确指出文件、函数、命令以及用户可见的影响。不要使用填充内容。

不要使用长破折号。不要使用 AI 常用词汇：delve、crucial、robust、comprehensive、nuanced、multifaceted。切勿采用企业化或学术化表达。使用短段落。以接下来要做什么结尾。

用户掌握你不知道的上下文。不同模型之间达成一致只是一项建议，而不是决定。由用户作出决定。

## 完成状态协议

完成技能工作流时，使用以下状态之一报告：
- **DONE** — 已完成，并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但需列出疑虑。
- **BLOCKED** — 无法继续；说明阻碍因素以及已尝试的操作。
- **NEEDS_CONTEXT** — 缺少信息；明确说明需要哪些信息。

尝试失败 3 次后、对安全敏感型更改存在不确定性时，或无法验证范围时，进行升级处理。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 操作层面的自我改进

完成前，如果你发现了可长期复用的项目特性或命令修复方法，并且能在下次节省 5 分钟以上，请将其记录下来：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的瞬态错误。

## 遥测（最后运行）

工作流完成后，记录遥测数据。使用 frontmatter 中 skill 的 `name:`。OUTCOME 为 success/error/abort/unknown。

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
将 `ERROR_MESSAGE` 替换为简短的错误描述（如果 outcome 为 error；
否则使用空字符串 `""`），并将 `FAILED_STEP` 替换为发生失败的步骤名称或编号
（如果 outcome 为 error；否则使用空字符串 `""`）。

## 计划状态页脚

运行计划审查的 skill（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于在调用 ExitPlanMode 之前验证计划文件以 `## GSTACK REVIEW REPORT` 结尾。不运行计划审查的 skill（如 `/ship`、`/qa`、`/review` 等操作型 skill）通常不在计划模式下运行，也没有需要验证的审查报告；此页脚对它们不起任何作用。写入计划文件是计划模式下唯一允许的编辑操作。

# /diagram — 输入英文，输出可编辑图表

每次运行都会生成一个**三件套**，绝不会只生成无用的像素图：

| 产物 | 用途 |
|---|---|
| `<slug>.mmd` | mermaid 源文件——对 LLM 友好的交换格式 |
| `<slug>.excalidraw` | 可编辑场景——在 excalidraw.com 中打开它，移动方框，然后继续编辑 |
| `<slug>.svg` + `<slug>.png` | 用于文档的清晰矢量图 + 用于聊天、议题和 README 的光栅图 |

渲染完全离线，通过浏览守护进程中的 diagram-render 包
（`lib/diagram-render/dist/diagram-render.html`）完成。无 CDN，无网络。

## 步骤 1 — 编写图表

根据用户的请求编写 mermaid。规则：

- **流程图（`graph LR`/`graph TD`）**是最合适的选择：它们可以转换为
  完全可编辑的 excalidraw 场景。流水线/流程优先使用 `graph LR`，
  层级结构优先使用 `graph TD`。
- 序列图、状态图、甘特图和其他 mermaid 类型可以正常渲染为 SVG/PNG，但
  官方转换器仅支持流程图——对于这些类型，会跳过
  `.excalidraw` 产物，并且你必须告知用户：
  “序列图可以渲染，但目前还不能在 excalidraw 中编辑（上游
  转换器的限制——流程图可以）。”
- 保持节点标签简短；将详细信息放在边标签中。5–15 个节点是
  易于阅读的范围。如果用户的需求需要更多节点，请拆分为多个图表
  并说明原因。

确定输出目录：当 cwd 是 git 仓库时使用 `./diagrams/`
（用户可以提交这些产物），否则使用 `/tmp/gstack-diagrams/`。根据图表的主题生成
`<slug>`（kebab-case，≤40 个字符）。

## 步骤 2 — 暂存渲染包（每个会话一次）

暂存副本按内容寻址（与 make-pdf 预处理阶段采用相同约定），
因此并发会话和不同 gstack 版本绝不会相互覆盖：

```bash
BUNDLE=""
for c in "$HOME/.claude/skills/gstack/lib/diagram-render/dist/diagram-render.html" \
         "$(git rev-parse --show-toplevel 2>/dev/null)/lib/diagram-render/dist/diagram-render.html"; do
  [ -f "$c" ] && BUNDLE="$c" && break
done
[ -z "$BUNDLE" ] && echo "BUNDLE_MISSING — run: cd ~/.claude/skills/gstack && bun run build:diagram-render" && exit 1
SHA=$(shasum -a 256 "$BUNDLE" | cut -c1-16)
STAGED="/tmp/gstack-diagram-render-$SHA.html"
[ -f "$STAGED" ] && shasum -a 256 "$STAGED" | grep -q "^$SHA" || { cp "$BUNDLE" "$STAGED.$$" && mv "$STAGED.$$" "$STAGED"; }
TAB=$($B newtab --json | sed -n 's/.*"tabId":\s*\([0-9]*\).*/\1/p')
[ -z "$TAB" ] && echo "TAB_OPEN_FAILED — daemon busy? check browse status" && exit 1
$B load-html "$STAGED" --tab-id "$TAB"
$B wait '#done' --tab-id "$TAB"
echo "RENDER_TAB_READY: tab $TAB"
```

记住 `$TAB`——下方的**每一次** `$B js` / `$B wait` / `$B closetab` 调用都必须传入
`--tab-id $TAB`。如果不传，调用将作用于当前处于活动状态的任意标签页，而该标签页可能是
共享同一守护进程的实时 /qa 或 /scrape 会话。

如果出现 `BUNDLE_MISSING`：停止并向用户显示构建命令。不要自行设计
CDN 回退方案——离线是约定的一部分。

## 步骤 3 — 渲染三件套

首先使用 Write 工具将 mermaid 源码写入 `<outdir>/<slug>.mmd`。页面
本身无法读取文件，因此请通过 **base64** 传入源码——绝不要把
文件内容拼接到 JS 模板字面量中（源码中的反引号、`${` 和反斜杠
会被解释并导致内容损坏）：

```bash
# SVG (always). atob() decodes the base64 inside the page.
$B js --tab-id "$TAB" "window.__renderMermaid('diagram-1', atob('$(base64 < <outdir>/<slug>.mmd | tr -d '\n')')).then(s => { window.__svg = s; return 'SVG OK ' + s.length })"
$B js --tab-id "$TAB" "window.__svg" --out <outdir>/<slug>.svg

# PNG at 300dpi of a 6.5in placement (1950px)
$B js --tab-id "$TAB" "window.__rasterize(window.__svg, 1950)" --out <outdir>/<slug>.png

# Editable scene (flowcharts only)
$B js --tab-id "$TAB" "window.__mermaidToExcalidraw(atob('$(base64 < <outdir>/<slug>.mmd | tr -d '\n')')).then(j => { window.__scene = j; return 'SCENE OK ' + JSON.parse(j).elements.length + ' elements' })"
$B js --tab-id "$TAB" "window.__scene" --out <outdir>/<slug>.excalidraw
```

注意：`atob()` 会生成 Latin-1；对于标签中包含非 ASCII 字符的源码，请使用
`decodeURIComponent(escape(atob('…')))` 精确恢复 UTF-8。

如果 mermaid 渲染返回错误，请向用户显示解析错误，修复
mermaid 后重试——不要把损坏的源文件交给用户。如果
`__mermaidToExcalidraw` 在非流程图类型上失败，请跳过 `.excalidraw`
产物，并在交付其余内容时附上步骤 1 中的限制说明。

## 第 4 步 — 展示并交付

1. 使用 Read 工具读取 PNG，以便用户在行内查看图表。
2. 列出三件套文件的路径。
3. 用一行说明可编辑性：“`.excalidraw` 文件可在 excalidraw.com 中打开
   （File → Open）— 在那里编辑后，我可以根据编辑后的场景重新渲染。”
4. 如果用户需要更改，请编辑 `.mmd` 源文件并重新执行第 3 步 — 该源文件是唯一事实来源。

重新渲染编辑后的 `.excalidraw`（用户往返编辑）：加载场景文件并直接导出，
无需改动 mermaid — 仍使用 base64 传输，因为场景 JSON 中包含大量引号和反斜杠：

```bash
$B js --tab-id "$TAB" "window.__excalidrawToSvg(atob('$(base64 < <outdir>/<slug>.excalidraw | tr -d '\n')')).then(s => { window.__svg = s; return 'OK' })"
$B js --tab-id "$TAB" "window.__svg" --out <outdir>/<slug>.svg
$B js --tab-id "$TAB" "window.__rasterize(window.__svg, 1950)" --out <outdir>/<slug>.png
```

## 规则

- **绝不要在未渲染的情况下交付三件套文件。** 单独的 `.mmd` 文件并不是
  图表。如果无法渲染（缺少 bundle、browse 不可用），请说明情况并停止。
- **清理：** 在当前对话中的图表工作全部完成后关闭渲染标签页
  （`$B closetab $TAB`），不要在处理多个图表之间关闭。
- 对于要用于 PDF 的图表：提醒用户，`make-pdf` 可以原生渲染
  ` ```mermaid ` 围栏 — 将 `.mmd` 嵌入其 markdown 中比嵌入 PNG 更好。

## 完成状态

- DONE — 已交付并展示三件套文件（或 SVG/PNG 文件对及限制说明）。
- BLOCKED — bundle 或 browse 不可用；已提供构建/设置命令。