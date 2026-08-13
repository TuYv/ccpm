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
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此技能

打开一个交互式选择器界面，在其中选择要导入的 cookie 域名。
在对已认证页面进行 QA 测试之前使用。当被要求“import cookies”、“login to the site”或“authenticate the browser”时使用。

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
mkdir -p ~/.gstack/analytics
if [ "$_TEL" != "off" ]; then
echo '{"skill":"setup-browser-cookies","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"setup-browser-cookies","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

在计划模式下，这是允许的，因为它们用于为计划提供信息：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成产物执行 `open`。

## 计划模式下的技能调用

如果用户在计划模式中调用某个技能，则该技能优先于通用计划模式行为。**将技能文件视为可执行指令，而不是参考资料。** 从 Step 0 开始按步骤执行；技能触发的任何 `AskUserQuestion` 都属于计划模式内的工作流，不构成违规——并且技能若自行解决问题（例如 plan-mode auto-select）则可以不提问。`AskUserQuestion`（任意变体——`mcp__*__AskUserQuestion` 或原生；参见“AskUserQuestion Format → Tool resolution”）满足计划模式的回合结束要求。如果 `AskUserQuestion` 不可用或调用失败，请遵循 `AskUserQuestion` 格式的失败回退：`headless` → `BLOCKED`；`interactive` → 文本回退（同样满足回合结束）。到达 `STOP` 点时应立即停止。不要在该处继续工作流或调用 `ExitPlanMode`。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令应执行。仅在技能工作流完成后，或用户要求取消技能或退出计划模式时，才调用 `ExitPlanMode`。

如果 `PROACTIVE` 为 `"false"`，则不要自动调用或主动建议技能。如果某个技能看起来有用，请询问：“I think /skillname might help here — want me to run it?”

如果 `SKILL_PREFIX` 是 `"true"`，建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出中出现 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md`，并按照“Inline upgrade flow”执行（如果已配置则自动升级，否则使用 `AskUserQuestion` 提供4个选项；若被拒绝则写入延迟状态）。

如果输出中出现 `JUST_UPGRADED <from> <to>`：打印“Running gstack v{to} (just updated!)”。如果 `SPAWNED_SESSION` 为 `true`，则跳过功能发现。

**功能发现，每个会话最多一次提示：**
- 缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 `AskUserQuestion` 询问是否启用 Continuous checkpoint 自动提交。如果接受，运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。无论如何都要触发标记文件。
- 缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：提示“Model overlays are active. MODEL_OVERLAY shows the patch.”。无论如何都要触发标记文件。

在升级提示之后，继续流程。

如果 `WRITING_STYLE_PENDING` 为 `yes`：仅询问一次写作风格：

> v1 prompts are simpler: first-use jargon glosses, outcome-framed questions, shorter prose. Keep default or restore terse?

选项：
- A) 保持新的默认设置（推荐 — 良好的写作帮助所有人）
- B) 恢复 V0 文风 — 设置 `explain_level: terse`

如果选 A：保留 `explain_level` 未设置（默认值为 `default`）。
如果选 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终执行（无论选择）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，跳过。

如果 `LAKE_INTRO` 为 `no`：输出“gstack follows the **Boil the Ocean** principle — do the complete thing when AI makes marginal cost near-zero. Read more: https://garryslist.org/posts/boil-the-ocean”。可选询问是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

只在用户同意时运行 `open`。无论是否同意，始终执行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：在 `AskUserQuestion` 中询问一次：

> Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths. Your repo name is recorded locally only and stripped before any upload.

选项：
- A) 帮助 gstack 做得更好！（推荐）
- B) 不用了

若选 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

若选 B：继续追问：

> Anonymous mode sends only aggregate usage, no unique ID.

选项：
- A) 可以，匿名模式就行
- B) 不用了，完全关闭

如果 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终执行：
```bash
touch ~/.gstack/.telemetry-prompted
```

如果 `TEL_PROMPTED` 为 `yes`，跳过。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：仅询问一次：

> Let gstack proactively suggest skills, like /qa for "does this work?" or /investigate for bugs?

选项：
- A) 保持开启（推荐）
- B) 关闭 — 我自己手动输入 /commands

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终执行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 为 `yes`，跳过。

## 首次运行指引（一次性）

如果 `ACTIVATED` 为 `no`（本机首次运行该技能）且前置提示中打印了非空的 `FIRST_TASK:` 且不等于 `nongit`：显示一行与项目相关的简短提示（对应 token 映射）作为提醒，然后继续执行用户实际请求，不中断任务。映射 token：`greenfield` → “Fresh repo — shape it first with `/spec` or `/office-hours`.” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “There's code here — `/qa` to see it work, or `/investigate` if something's off.” `branch_ahead` → “Unshipped work on this branch — `/review` then `/ship`.” `dirty_default` → “Uncommitted changes — `/review` before committing.” `clean_default` → “Pick one: `/spec`, `/investigate`, or `/qa`.”。然后用你看到的 token 替换为 `TASK_TOKEN` 并尽力执行以下命令，同时标记激活状态：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no` 但 `FIRST_TASK:` 为空或为 `nongit`（无头、非 git 仓库，或无可执行建议）：不显示提示，只执行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：显示一次提醒（然后继续）：

> Tip: gstack pays off when you complete one loop — **plan → review → ship**. A common first loop: `/office-hours` or `/spec` to shape it, `/plan-eng-review` to lock it, then `/ship`.

然后执行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 都是 `yes`，则跳过本节。

如果 `HAS_ROUTING` 为 `no` 且 `ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录是否存在 CLAUDE.md 文件；如果不存在则创建。

使用 `AskUserQuestion`：

> gstack works best when your project's CLAUDE.md includes skill routing rules.

选项：
- A) 将路由规则添加到 CLAUDE.md（推荐）
- B) 不用了，我将手动调用 skills

若 A：将以下段落追加到 CLAUDE.md 的末尾：

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

若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并告知可通过 `gstack-config set routing_declined false` 重新启用。

该流程在每个项目仅执行一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，并且不存在 `~/.gstack/.vendoring-warned-$SLUG`，则通过 `AskUserQuestion` 警告一次：

> This project has gstack vendored in `.claude/skills/gstack/`. Vendoring is deprecated.
> Migrate to team mode?

选项：
- A) 是，立即迁移到团队模式
- B) 不，交给我自己处理

若 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户：“Done. Each developer now runs: `cd ~/.claude/skills/gstack && ./setup --team`”

若 B：提示“OK, you're on your own to keep the vendored copy up to date.”

无论选择如何，都执行（始终）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

若标记文件已存在则跳过。

如果标记文件存在，则跳过。

如果 `SPAWNED_SESSION` 是 `"true"`，则表示你在由 AI orchestrator（例如 OpenClaw）启动的会话中运行。在这种会话内：
- 不要对交互式提示使用 `AskUserQuestion`。自动选择推荐项。
- 不执行升级检查、遥测提示、路由注入或 Lake intro。
- 专注于完成任务，并通过自然语言输出结果。
- 以完成报告结束：已交付内容、做出的决策、以及任何不确定项。

## Artifacts 同步（skill start）

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

隐私拦截门：如果输出中显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 在 PATH 中或 `gbrain doctor --fast --json` 可用，请只询问一次：

> gstack 可以将你的 artifact（CEO 计划、设计、报告）发布到 GBrain 在多台机器间索引的私有 GitHub 仓库。你希望同步多少内容？

选项：
- A）全部 allowlisted（推荐）
- B）仅 artifact
- C）拒绝，并保持全部内容在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-artifacts-init`。不要阻塞 skill。

在 skill 结束（END）并在 telemetry 之前：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```

## 针对 claude 的模型级行为补丁

以下提示为 claude 模型族做了微调。它们
**从属**于 skill 工作流、STOP points、AskUserQuestion gates、plan-mode
安全，以及 /ship review gates。若下方某条 nudges 与 skill 指令冲突，以 skill 为准。把这些当作偏好，而非规则。

**Todo-list discipline。** 在执行多步计划时，请在完成每个任务后单独标记其完成。不要在最后一次性批量完成。如果某个任务最终不需要了，请用一句话说明原因并标记为已跳过。

**在执行重操作前先思考。** 对于复杂操作（重构、迁移、非平凡新功能），在执行前先简要说明你的做法。这样用户可以在中途偏离前低成本纠偏。

**优先使用专用工具而非 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是等价的 shell 命令（cat、sed、find、grep）。专用工具更省成本，输出也更清晰。

## Voice

直接、具体、面向开发者。提及文件、函数、命令，并说明对用户可见影响。无废话。

不使用长破折号。不要使用 AI 术语：delve、crucial、robust、comprehensive、nuanced、multifaceted。避免公司化或学术化表达。短段落。以“接下来做什么”结尾。

## 完成状态协议

在完成一个 skill 工作流时，用以下之一汇报状态：
- **DONE** — 已完成并附证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出担忧。
- **BLOCKED** — 无法继续；说明阻塞点和已尝试内容。
- **NEEDS_CONTEXT** — 信息不足；明确说明需要什么。

在 3 次尝试失败、不确定安全敏感改动，或你无法验证的范围后升级。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 运行时自我改进

在完成前，如果你发现了一个耐久的项目异状或可节省 5 分钟以上的命令修复，请记录：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性瞬时错误。

## 遥测（最后执行）

工作流完成后，记录遥测。使用 frontmatter 中的 `name:`。`OUTCOME` 的取值为 success/error/abort/unknown。

**PLAN MODE EXCEPTION — ALWAYS RUN:** 此命令将遥测写入
`~/.gstack/analytics/`，与前置分析写入保持一致。

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
    --used-browse "USED_BROWSE" --session-id "$_SESSION_ID" 2>/dev/null &
fi
```

在运行前替换 `SKILL_NAME`、`OUTCOME` 和 `USED_BROWSE`。

## 计划状态页脚

运行计划评审的技能（`/plan-*-review`、`/codex review`）在技能末尾包含退出计划模式前置检查清单（`## GSTACK REVIEW REPORT`），用于验证计划文件以 `## GSTACK REVIEW REPORT` 结尾后才会调用 `ExitPlanMode`。不运行计划评审的技能（如操作类技能 `/ship`、`/qa`、`/review`）通常不会以计划模式运行，因而没有待校验的评审报告；该页脚对它们是空操作。计划模式下允许编辑的唯一文件是计划文件本身。

# 设置浏览器 Cookie

将已登录会话从你的真实 Chromium 浏览器导入到无头浏览会话中。

## CDP 模式检测

先检查 `browse` 是否已连接到用户的真实浏览器：
```bash
$B status 2>/dev/null | grep -q "Mode: cdp" && echo "CDP_MODE=true" || echo "CDP_MODE=false"
```
如果 `CDP_MODE=true`：向用户输出「不需要操作——你已通过 CDP 连接到真实浏览器，Cookie 和会话已可用。」然后停止，不需要导入 Cookie。

## 工作原理

1. 查找 browse 可执行文件
2. 运行 `cookie-import-browser` 以检测已安装的浏览器并打开选择器界面
3. 用户在浏览器中选择要导入的 Cookie 域名
4. Cookie 被解密并加载到 Playwright 会话中

## 操作步骤

### 1. 查找 browse 可执行文件

## SETUP（在任何 browse 命令前先执行此检查）

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

若返回 `NEEDS_SETUP`：
1. 告知用户：「gstack browse 需要一次性构建（约 10 秒）。可以继续吗？」然后停止并等待。
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

这会自动检测已安装的 Chromium 浏览器，并在你的默认浏览器中打开一个交互式选择界面，你可以：
- 在已安装的浏览器之间切换
- 搜索域名
- 点击「+」导入某个域名的 cookie
- 点击垃圾桶移除已导入的 cookie

向用户输出：**「Cookie 选择器已打开 — 请在浏览器中选择要导入的域名，完成后告诉我。」**

### 3. 直接导入（替代方案）

如果用户直接指定了某个域名（例如 `/setup-browser-cookies github.com`），可跳过界面：

```bash
$B cookie-import-browser comet --domain github.com
```

将 `comet` 替换为用户指定的对应浏览器。

### 4. 校验

用户确认完成后：

```bash
$B cookies
```

向用户展示导入 Cookie 的汇总信息（按域名统计的数量）。

## 注意事项

- 在 macOS 上，每个浏览器的首次导入可能会触发钥匙串弹窗，请点击“Allow / Always Allow”
- 在 Linux 上，`v11` cookie 可能需要 `secret-tool`/libsecret 访问；`v10` cookie 则使用 Chromium 的标准回退密钥
- Cookie 选择器与 browse 服务运行在同一端口（不额外启动进程）
- UI 仅展示域名和 cookie 数量，不会泄露 cookie 值
- browse 会话会在命令间保留 cookie，因此导入后可立即生效
