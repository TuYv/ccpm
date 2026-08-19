---
name: setup-browser-cookies
preamble-tier: 1
version: 1.0.0
description: Import cookies from your real Chromium browser into the headless browse session. (gstack)
triggers:
  - import browser cookies
  - login to test site
  - setup authenticated session
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<!-- 从 SKILL.md.tmpl 自动生成——请勿直接编辑 -->
<!-- 重新生成：`bun run gen:skill-docs` -->


## 何时调用此 skill

打开一个交互式选择器 UI，用于选择要导入 Cookie 的域名。
在 QA 测试需要身份验证的页面之前使用。当被要求“导入 Cookie”、
“登录网站”或“验证浏览器身份”时使用。

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
echo '{"skill":"setup-browser-cookies","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"setup-browser-cookies","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

## 计划模式安全操作

在计划模式下，以下操作因其能够为计划提供信息而被允许：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成的工件使用 `open`。

## 计划模式下的技能调用

如果用户在计划模式下调用技能，则该技能优先于通用的计划模式行为。**将技能文件视为可执行指令，而不是参考资料。** 从第 0 步开始逐步执行；技能触发的任何 AskUserQuestion 都属于计划模式中的工作流，不违反计划模式规则——如果技能的指令自行解决了某个问题（例如计划模式自动选择），也可以合法地不提问。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生版本；参见“AskUserQuestion 格式 → 工具解析”）满足计划模式在回合结束时的要求。如果 AskUserQuestion 不可用或调用失败，请遵循 AskUserQuestion 格式的失败回退规则：`headless` → BLOCKED；`interactive` → 使用文字回退方案（同样满足回合结束要求）。在 STOP 点立即停止。不要继续工作流，也不要在此处调用 ExitPlanMode。只有在技能工作流完成后，或者用户告诉你取消技能或离开计划模式时，才调用 ExitPlanMode。标记为“计划模式例外 — 始终运行”的命令必须执行。

如果 `PROACTIVE` 为 `"false"`，不要自动调用或主动建议技能。如果某个技能看起来有用，请询问：“我认为 /skillname 可能会对此有所帮助——要运行它吗？”

如果 `SKILL_PREFIX` 为 `"true"`，建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果 `UPDATE_CHECK` 为 `"false"`，跳过接下来的两行——更新检查二进制程序在该模式下不会输出任何内容，因此无需处理 `UPGRADE_AVAILABLE` / `JUST_UPGRADED` 输出。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md`，并遵循“内联升级流程”（如果已配置则自动升级，否则使用 AskUserQuestion 提供 4 个选项；如果拒绝，则写入稍后提醒状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印“正在运行 gstack v{to}（刚刚更新！）”。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多提示一次：
- 缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 AskUserQuestion 询问是否启用连续检查点自动提交。如果接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终创建该标记文件。
- 缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：告知“模型覆盖层已启用。MODEL_OVERLAY 会显示补丁。”始终创建该标记文件。

升级提示完成后，继续工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：询问一次写作风格：

> v1 提示更简单：首次出现术语时提供释义、以结果为导向提问、使用更短的正文。保留默认设置，还是恢复简洁风格？

选项：
- A) 保留新默认设置（推荐——良好的写作对所有人都有帮助）
- B) 恢复 V0 正文风格——设置 `explain_level: terse`

如果选择 A：不设置 `explain_level`（默认为 `default`）。
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

无论选择何项，始终运行：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，则跳过。

如果 `LAKE_INTRO` 为 `no`：说“gstack 遵循 **Boil the Ocean** 原则 —— 当 AI 让边际成本接近于零时，就完成完整的事情。阅读更多：https://garryslist.org/posts/boil-the-ocean” 提供打开以下链接的选项：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

只有在用户选择“是”时才运行 `open`。始终运行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 询问一次遥测：

> 帮助 gstack 变得更好。仅分享使用数据：技能、持续时间、崩溃情况、稳定的设备 ID。不包含代码或文件路径。你的仓库名称仅记录在本地，并会在上传前删除。

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不用了

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果选择 B：进行后续询问：

> 匿名模式只发送汇总数据，不包含唯一 ID。

选项：
- A) 好的，匿名模式可以接受
- B) 不用了，完全关闭

如果选择 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果选择 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终运行：
```bash
touch ~/.gstack/.telemetry-prompted
```

如果 `TEL_PROMPTED` 为 `yes`，则跳过。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：询问一次：

> 允许 gstack 主动建议技能，例如针对“能正常工作吗？”建议使用 /qa，或针对 bug 建议使用 /investigate？

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

## 首次运行指导（一次性）

如果 `ACTIVATED` 为 `no`（这台机器上首次运行技能），并且前置说明打印了非空的 `FIRST_TASK:` 值，且该值不是 `nongit`：根据令牌显示一行简短的项目专属提示，然后继续执行用户实际请求的内容 —— 不要中断用户的任务。令牌映射如下：`greenfield` → “这是一个全新的仓库 —— 先用 `/spec` 或 `/office-hours` 确定结构。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里已有代码 —— 使用 `/qa` 查看其运行情况，或在出现异常时使用 `/investigate`。” `branch_ahead` → “此分支上有尚未发布的工作 —— 先执行 `/review`，然后执行 `/ship`。” `dirty_default` → “存在未提交的更改 —— 提交前先执行 `/review`。” `clean_default` → “选择一个：`/spec`、`/investigate` 或 `/qa`。” 然后将你看到的令牌替换为 TASK_TOKEN，并运行以下命令（尽力而为），同时标记为已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no`，但 `FIRST_TASK:` 为空或为 `nongit`（无头模式、非 git，或没有可执行的操作）：不显示任何内容，只运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则，如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：提示一次（然后继续）：

> 提示：完成一个循环后，gstack 才能真正发挥作用——**规划 → 审查 → 发布**。常见的第一个循环是：使用 `/office-hours` 或 `/spec` 梳理需求，使用 `/plan-eng-review` 将其确定下来，然后使用 `/ship`。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 都为 `yes`，跳过此部分。

如果 `HAS_ROUTING` 为 `no`、`ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录中是否存在 CLAUDE.md 文件。如果不存在，则创建它。

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

如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并说明可以通过 `gstack-config set routing_declined false` 重新启用。

每个项目只会执行一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，跳过此部分。

如果 `VENDORED_GSTACK` 为 `yes`，且 `~/.gstack/.vendoring-warned-$SLUG` 不存在，则通过 AskUserQuestion 警告一次：

> 此项目已将 gstack 内置在 `.claude/skills/gstack/` 中。内置方式已弃用。
> 要迁移到团队模式吗？

选项：
- A) 是，现在迁移到团队模式
- B) 不用了，我会自行处理

如果选择 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户："完成。现在每位开发者运行：`cd ~/.claude/skills/gstack && ./setup --team`"

如果选择 B：说："好的，内置副本的更新由你自行维护。"

始终运行（无论选择什么）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记已存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你正在由 AI 编排器（例如 OpenClaw）生成的会话中运行。在生成的会话中：
- 不要使用 AskUserQuestion 进行交互式提问。自动选择推荐选项。
- 不要运行升级检查、遥测提示、路由注入或 lake intro。
- 专注于完成任务，并通过 prose 输出报告结果。
- 以完成报告结束：说明已交付的内容、所作的决策以及任何不确定之处。

## 工件同步（技能启动）

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

隐私停止门：如果输出显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 位于 PATH 中，或 `gbrain doctor --fast --json` 可以正常运行，则询问一次：

> gstack 可以将你的工件（CEO 计划、设计、报告）发布到一个由 GBrain 在多台机器间建立索引的私有 GitHub 仓库。你希望同步多少内容？

选项：
- A) 所有列入允许列表的内容（推荐）
- B) 仅工件
- C) 拒绝，全部保留在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-artifacts-init`。不要阻塞 skill。

在 skill 结束、遥测之前：

```bash
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 针对模型的行为补丁（claude）

以下提示针对 claude 模型系列进行了调整。它们
**从属于** skill 工作流、STOP 点、AskUserQuestion 闸门、计划模式安全措施以及 /ship 审查闸门。如果以下提示与 skill 指令冲突，
以 skill 为准。将这些视为偏好，而不是规则。

**待办列表纪律。** 处理多步骤计划时，每完成一项任务就单独将其标记为完成。不要在最后批量标记完成。如果某项任务最终不需要执行，则将其标记为已跳过，并附上一行原因。

**执行重大操作前先思考。** 对于复杂操作（重构、迁移、非平凡的新功能），在执行前简要说明方案。这样用户可以低成本地在执行过程中调整方向。

**优先使用专用工具而不是 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是对应的 shell 命令（cat、sed、find、grep）。专用工具成本更低，也更清晰。

## 语言风格

直接、具体，面向构建者。说清文件、函数、命令和对用户可见的影响。不要填充语句。

不要使用破折号。不要使用 AI 术语：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要采用企业化或学术化表达。使用短段落。以需要执行的事项结尾。

用户掌握你不了解的上下文。跨模型一致性只是建议，不是决策。由用户决定。

## 完成状态协议

完成 skill 工作流时，使用以下状态之一报告：
- **DONE** — 已完成，并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出注意事项。
- **BLOCKED** — 无法继续，说明阻塞原因以及已尝试的操作。
- **NEEDS_CONTEXT** — 缺少信息，准确说明需要哪些信息。

在 3 次尝试失败、涉及不确定的安全敏感变更，或无法验证范围后升级。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 运营自我改进

完成前，检查本次会话并记录每一项可长期复用的经验。
此步骤**始终执行**，不以是否觉得有值得记录的内容为条件
（#2402：44 条经验中有 43 条来自显式的 /learn，因为“如果你发现了”被理解成了可选项）。可长期复用的经验包括项目特有行为、命令修复、容易踩坑的地方或模式，这些内容应能在未来会话中节省 5 分钟以上。如果检查确实没有发现任何内容，则在完成摘要中写明“No durable learnings this session”
，明确表示结果为空，而不是跳过此步骤。

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的临时错误。

## Telemetry (run last)

工作流完成后，记录 telemetry。使用 frontmatter 中的 `name:` skill。OUTCOME 是 success/error/abort/unknown。

**PLAN MODE EXCEPTION — ALWAYS RUN:** 此命令会将 telemetry 写入
`~/.gstack/analytics/`，与 preamble analytics 写入位置一致。

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
如果 outcome 是 error，则将 `ERROR_MESSAGE` 替换为错误的简短描述；
否则使用空字符串 `""`；如果 outcome 是 error，则将 `FAILED_STEP` 替换为发生失败的步骤名称或编号，
否则使用空字符串 `""`。

## Plan Status Footer

运行计划审查的 skills（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于验证在调用 ExitPlanMode 前，计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。不运行计划审查的 skills（如 `/ship`、`/qa`、`/review` 等操作型 skills）通常不会在计划模式下运行，也没有需要验证的审查报告；此页脚对它们不执行任何操作。在计划模式下唯一允许的编辑是写入计划文件。

# Setup Browser Cookies

将真实 Chromium 浏览器中的已登录会话导入无头 browse 会话。

## CDP mode check

首先，检查 browse 是否已连接到用户的真实浏览器：
```bash
$B status 2>/dev/null | grep -q "Mode: cdp" && echo "CDP_MODE=true" || echo "CDP_MODE=false"
```
如果 `CDP_MODE=true`：告知用户“无需执行 — 你已通过 CDP 连接到真实浏览器。你的 cookies 和会话已经可用。”然后停止。不需要导入 cookies。

## 工作原理

1. 查找 browse 二进制文件
2. 运行 `cookie-import-browser`，检测已安装的浏览器并打开选择器界面
3. 用户在浏览器中选择要导入 Cookie 的域名
4. Cookie 会被解密并加载到 Playwright 会话中

## 步骤

### 1. 查找 browse 二进制文件

## 设置（在运行任何 browse 命令之前执行此检查）

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
B=""
[ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/browse/dist/browse" ] && B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
[ -z "$B" ] && B="$HOME/.claude/skills/gstack/browse/dist/browse"
if [ -x "$B" ]; then
  echo "READY: $B"
else
  echo "NEEDS_SETUP"
fi
```

如果输出 `NEEDS_SETUP`：
1. 告诉用户："gstack browse 需要进行一次性构建（约 10 秒）。是否可以继续？" 然后停止并等待。
2. 运行：`cd <SKILL_DIR> && ./setup`
3. 如果未安装 `bun`：
   ```bash
   if ! command -v bun >/dev/null 2>&1; then
     BUN_VERSION="1.3.10"
     BUN_INSTALL_SHA="bab8acfb046aac8c72407bdcce903957665d655d7acaa3e11c7c4616beae68dd"
     tmpfile=$(mktemp)
     curl -fsSL "https://bun.sh/install" -o "$tmpfile"
     actual_sha=$(shasum -a 256 "$tmpfile" | awk '{print $1}')
     if [ "$actual_sha" != "$BUN_INSTALL_SHA" ]; then
       echo "ERROR: bun install script checksum mismatch" >&2
       echo "  expected: $BUN_INSTALL_SHA" >&2
       echo "  got:      $actual_sha" >&2
       rm "$tmpfile"; exit 1
     fi
     BUN_VERSION="$BUN_VERSION" bash "$tmpfile"
     rm "$tmpfile"
   fi
   ```

### 2. 打开 Cookie 选择器

```bash
$B cookie-import-browser
```

此命令会自动检测已安装的 Chromium 浏览器，并在默认浏览器中打开一个交互式选择器界面，你可以：
- 在已安装的浏览器之间切换
- 搜索域名
- 点击“+”导入某个域名的 Cookie
- 点击垃圾桶图标移除已导入的 Cookie

告诉用户：**"Cookie 选择器已打开——请在浏览器中选择要导入的域名，完成后告诉我。"**

### 3. 直接导入（替代方式）

如果用户直接指定了域名（例如 `/setup-browser-cookies github.com`），则跳过界面：

```bash
$B cookie-import-browser comet --domain github.com
```

如果用户指定了浏览器，请将 `comet` 替换为相应的浏览器。

### 4. 验证

用户确认完成后：

```bash
$B cookies
```

向用户显示已导入 Cookie 的摘要（域名数量）。

## 注意事项

- 在 macOS 上，每个浏览器首次导入时可能会触发钥匙串对话框——点击“允许”或“始终允许”
- 在 Linux 上，`v11` Cookie 可能需要访问 `secret-tool`/libsecret；`v10` Cookie 使用 Chromium 的标准备用密钥
- Cookie 选择器与 browse 服务器使用同一端口提供服务（无需额外进程）
- 界面中只会显示域名和 Cookie 数量，不会暴露 Cookie 值
- browse 会话会在命令之间持久化 Cookie，因此导入的 Cookie 可立即使用