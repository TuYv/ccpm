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
## 何时调用此技能

在同一提示下并行运行 Claude、GPT（经由 Codex CLI）和 Gemini，比较延迟、Token、成本，
并可选通过 LLM judge 评估质量。它用数据回答“哪个模型才是这个技能的最佳选择”，而非凭感觉判断。
与 `/benchmark` 分离，后者用于衡量网页性能。适用于：
“benchmark models”、“compare models”、“which model is best for X”、“cross-model comparison”、“model shootout”。

语音触发词（语音转文本别名）：“compare models”、“model shootout”、“which model is best”。

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
echo '{"skill":"benchmark-models","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"benchmark-models","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

在计划模式中，允许执行的操作包括：`$B`、`$D`、`codex exec` / `codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成产物执行 `open`，因为这些操作会用于更新计划。

## 计划模式下的技能调用

如果用户在计划模式中调用技能，则该技能优先于通用计划模式行为。**将技能文件视为可执行指令，而非参考文档。**从 Step 0 开始严格按步骤执行；技能触发的任何 `AskUserQuestion` 都是计划模式内的工作流，而非违规；同时，若某个技能的指令自行解决问题（例如计划模式自动选择），则该技能可能不会发出提问。`AskUserQuestion`（任意变体——`mcp__*__AskUserQuestion` 或本地实现；见“AskUserQuestion Format → Tool resolution”）满足计划模式的回合结束要求。若 `AskUserQuestion` 不可用或调用失败，则按失败回退规则处理：`headless` → `BLOCKED`；`interactive` → 使用文本兜底（同样满足回合结束）。在 `STOP` 点应立即停止，不要继续执行工作流，也不要在此时调用 `ExitPlanMode`。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令应执行。仅在技能工作流完成后，或用户要求取消技能/退出计划模式时，才调用 `ExitPlanMode`。

如果 `PROACTIVE` 是 `"false"`，请不要自动调用或主动建议 skills。如果某个 skill 看起来有用，请询问："我觉得 /skillname 可能在这里有帮助，要不要我运行它？"

如果 `SKILL_PREFIX` 是 `"true"`，则建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“内联升级流程”（若已配置自动升级则自动升级，否则通过 AskUserQuestion 提供 4 个选项，若被拒绝则写入延迟状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印 "Running gstack v{to} (just updated!)"。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

特性发现，每次会话最多一次提示：
- 缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：通过 AskUserQuestion 询问持续检查点自动提交功能。若接受，运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。无论是否接受都要触碰该标记。
- 缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：提示“Model overlays are active. MODEL_OVERLAY shows the patch.”。无论如何都要触碰该标记。

完成升级提示后继续流程。

如果 `WRITING_STYLE_PENDING` 为 `yes`：仅询问一次写作风格偏好：

> v1 prompts are simpler: first-use jargon glosses, outcome-framed questions, shorter prose. Keep default or restore terse?

选项：
- A) 保持新的默认设置（推荐——好的表达能帮助所有人）
- B) 恢复 V0 文风——设置 `explain_level: terse`

若选择 A：不设置 `explain_level`（默认为 `default`）。
若选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

始终执行（不受选择影响）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

若 `WRITING_STYLE_PENDING` 为 `no`，跳过此项。

如果 `LAKE_INTRO` 为 `no`：输出 "gstack follows the **Boil the Ocean** principle — do the complete thing when AI makes marginal cost near-zero. Read more: https://garryslist.org/posts/boil-the-ocean"。并提供是否打开的选项：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在用户同意时执行 `open`。无论如何都要执行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 仅询问一次：

> Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths. Your repo name is recorded locally only and stripped before any upload.

选项：
- A) 帮助 gstack 做得更好！（推荐）
- B) 不用了

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`
若 B：再询问后续：

> Anonymous mode sends only aggregate usage, no unique ID.

选项：
- A) 可以，匿名模式也可以
- B) 不用了，完全关闭

如果 B → A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
如果 B → B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终执行：
```bash
touch ~/.gstack/.telemetry-prompted
```

若 `TEL_PROMPTED` 为 `yes`，跳过。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：通过 AskUserQuestion 仅询问一次：

> Let gstack proactively suggest skills, like /qa for "does this work?" or /investigate for bugs?

选项：
- A) 保持开启（推荐）
- B) 关掉——我会自己手动输入 /commands

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终执行：
```bash
touch ~/.gstack/.proactive-prompted
```

若 `PROACTIVE_PROMPTED` 为 `yes`，跳过。

## 首次运行指引（一次性）

如果 `ACTIVATED` 为 `no`（该机器上第一次运行该 skill）且前言中打印了非空且不是 `nongit` 的 `FIRST_TASK:` 值，显示该 token 映射的单行项目提示作为前置说明，然后继续执行用户当前任务，不要中断。映射规则为：`greenfield` → "Fresh repo — shape it first with `/spec` or `/office-hours`."，`code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → "There's code here — `/qa` to see it work, or `/investigate` if something's off."，`branch_ahead` → "Unshipped work on this branch — `/review` then `/ship`."，`dirty_default` → "Uncommitted changes — `/review` before committing."，`clean_default` → "Pick one: `/spec`, `/investigate`, or `/qa`."。然后将看到的 token 替换为 TASK_TOKEN 并执行（尽力而为），再标记已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no` 但 `FIRST_TASK:` 为空或 `nongit`（无头、非 git、或无可执行事项）：什么都不显示，只执行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：先以提示语输出一次（然后继续）：

> Tip: gstack pays off when you complete one loop — **plan → review → ship**. A common first loop: `/office-hours` or `/spec` to shape it, `/plan-eng-review` to lock it, then `/ship`.

然后执行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 均为 `yes`，跳过该部分。

如果 `HAS_ROUTING` 为 `no` 且 `ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录是否存在 CLAUDE.md。若不存在则创建。
使用 AskUserQuestion 询问：

> gstack works best when your project's CLAUDE.md includes skill routing rules.

选项：
- A) 将路由规则写入 CLAUDE.md（推荐）
- B) 不用了，我将手动调用 skills

若 A：将以下内容追加到 CLAUDE.md 末尾：

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

然后提交该变更：`git add CLAUDE.md && git commit -m "chore: add gstack skill routing rules to CLAUDE.md"`

若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并告知可使用 `gstack-config set routing_declined false` 重新启用。

该流程每个项目仅执行一次。若 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true` 则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，除非 `~/.gstack/.vendoring-warned-$SLUG` 已存在，否则通过 AskUserQuestion 提醒一次：

> This project has gstack vendored in `.claude/skills/gstack/`. Vendoring is deprecated.
> Migrate to team mode?

选项：
- A) 是，立即迁移到 team mode
- B) 不，之后我自己处理

若 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户："Done. Each developer now runs: `cd ~/.claude/skills/gstack && ./setup --team`"

若 B：回复 "OK, you're on your own to keep the vendored copy up to date."

无论选择如何，都始终执行（始终运行）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

若标记已存在则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你在由 AI 编排器（例如 OpenClaw）启动的会话中运行。在 spawned sessions：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐项。
- 不执行升级检查、遥测提示、路由注入或 lake intro。
- 专注于完成任务并用文字输出结果。
- 结束时给出完成报告：已交付内容、做出的决策、尚不确定之处。

## 工件同步（skill start）

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



隐私停机点：如果输出显示 `ARTIFACTS_SYNC: off`、`artifacts_sync_mode_prompted` 为 `false`，并且 `gbrain` 在 PATH 中或 `gbrain doctor --fast --json` 可运行，请询问一次：

> gstack can publish your artifacts (CEO plans, designs, reports) to a private GitHub repo that GBrain indexes across machines. How much should sync?

> gstack 可以将你的工件（CEO 计划、设计、报告）发布到一个私有 GitHub 仓库，由 GBrain 在多台机器间建立索引。你希望同步多少内容？

Options:
Options:
> 选项：

- A) Everything allowlisted (recommended)
- A) 全部允许同步（推荐）
- B) Only artifacts
- B) 仅工件
- C) Decline, keep everything local
- C) 不同步，全部保留在本地

After answer:
回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，请询问是否运行 `gstack-artifacts-init`。不要阻塞该 skill。

在 skill 结束前、写入遥测之前执行：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 模型专属行为补丁（claude）

下面的提示为 claude 模型系列做了调优。它们是
**从属**于 skill 工作流、STOP 点、AskUserQuestion 门控、plan 模式安全性和 /ship 复核门控的规则。如果下方提示与 skill 指令冲突，以 skill 为准。将这些当作偏好而非规则。

**Todo-list discipline.** 当按多步计划执行时，完成每个任务后都要逐项标记为完成，不要在最后一次性批量完成。如果某项任务证明不需要，需在一行内说明原因并标记为跳过。

**Think before heavy actions.** 对于复杂操作（重构、迁移、非平凡新功能），请在执行前简要说明你的做法。这有助于用户在执行中途前低成本纠偏，而不是飞行中改方向。

**Dedicated tools over Bash.** 优先使用 Read、Edit、Write、Glob、Grep，而非 shell 等价命令（cat、sed、find、grep）。专用工具更省资源、也更清晰。

## Voice

Direct, concrete, builder-to-builder. Name the file, function, command, and user-visible impact. No filler.

直接、具体、工程师之间的沟通。要点名文件、函数、命令和对用户可见影响。不要废话。

No em dashes. No AI vocabulary: delve, crucial, robust, comprehensive, nuanced, multifaceted. Never corporate or academic. Short paragraphs. End with what to do.

不要使用 em dash。不要使用 AI 风格词汇：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要用公司或学术化措辞。段落要短。以“接下来要做什么”收尾。

## Completion Status Protocol

完成 skill 工作流时，用以下之一进行状态汇报：
- **DONE** — 已完成并有证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出关注点。
- **BLOCKED** — 无法继续；说明阻塞原因和已尝试内容。
- **NEEDS_CONTEXT** — 缺少信息；明确说明所需信息。

连续 3 次尝试失败、不确定的安全敏感改动，或无法验证的范围问题时需要上报。格式：`STATUS`, `REASON`, `ATTEMPTED`, `RECOMMENDATION`。

## Operational Self-Improvement

在完成前，如果你发现了一个耐用的项目特性或命令修复，可在下次节省 5 分钟以上，请记录它：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录明显事实或一次性偶发错误。

## 遥测（最后执行）

工作流完成后，记录遥测。使用 frontmatter 中的 `name:`。`OUTCOME` 为 success/error/abort/unknown。

**PLAN MODE 例外 — 必须始终运行：** 此命令将遥测写入 `~/.gstack/analytics/`，与前导分析写入保持一致。

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

在运行前将 `SKILL_NAME`、`OUTCOME` 和 `USED_BROWSE` 替换为实际值。

## 计划状态页脚

运行计划审查的技能（`/plan-*-review`、`/codex review`）在技能末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于在调用 ExitPlanMode 前验证计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。未运行计划审查的技能（如 `/ship`、`/qa`、`/review` 这类操作技能）通常不在计划模式下运行，也不需要审核报告来验证；该页脚对它们是空操作。计划模式下允许编辑的唯一文件是计划文件本身。

# /benchmark-models — 跨模型技能基准测试

你正在运行 `/benchmark-models` 工作流。它通过交互式流程封装了 `gstack-model-benchmark` 二进制：选择提示词、确认模型提供商、预览鉴权，并运行基准测试。

它不同于 `/benchmark`，后者测量网页性能（Core Web Vitals、加载时间）。该技能测量的是 gstack 技能或任意提示词上的 AI 模型性能。

---

## 步骤 0：定位二进制文件

```bash
BIN="$HOME/.claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || BIN=".claude/skills/gstack/bin/gstack-model-benchmark"
[ -x "$BIN" ] || { echo "ERROR: gstack-model-benchmark not found. Run ./setup in the gstack install dir." >&2; exit 1; }
echo "BIN: $BIN"
```

如果未找到，停止并告知用户重新安装 gstack。

## 步骤 1：选择提示词

使用 AskUserQuestion 并按如下前导语格式：
- **重述：** 当前项目 + 分支。
- **简化：** “跨模型基准测试会使用同一提示词在 2-3 个 AI 模型间运行，并告诉你它们在速度、成本与输出质量上的差异。我们应使用哪个提示词？”
- **推荐：** A，因为对真实 skill 的基准测试能暴露工具使用差异，而不仅是纯文本生成差异。
- **选项：**
  - A) 对我其中一个 gstack skill 进行基准测试（下一步再选择具体 skill）。完整度：10/10。
  - B) 使用内嵌提示词——下一轮输入具体内容。完整度：8/10。
  - C) 指向磁盘上的某个提示词文件——下一轮输入路径。完整度：8/10。

若选择 A：列出有 `SKILL.md` 文件的顶层 gstack skill（来自 `find . -maxdepth 2 -name SKILL.md -not -path './.*'`），并通过第二次 AskUserQuestion 让用户选择一个。将所选 `SKILL.md` 的路径作为提示词文件使用。

若选择 B：请求用户提供内嵌提示词，并通过 `--prompt "<text>"` 原样使用。

若选择 C：请求路径并校验其是否存在，然后作为位置参数使用。

## 步骤 2：选择提供商

```bash
"$BIN" --prompt "unused, dry-run" --models claude,gpt,gemini --dry-run
```

显示 dry-run 输出。`Adapter availability` 区域会告诉用户哪些提供商会实际运行（OK）以及哪些会被跳过（NOT READY——并附有修复提示）。

如果三者全部为 NOT READY：停止并给出明确提示——没有至少一个已鉴权提供商，基准测试无法运行。建议执行 `claude login`、`codex login`，或 `gemini login` / `export GOOGLE_API_KEY`。

如果至少有一个为 OK：使用 AskUserQuestion：
- **简化：** “我们应包含哪些模型？上面的 dry-run 已显示哪些已鉴权。未鉴权的模型将被干净地跳过，不会中止整个批次。”
- **推荐：** A（所有已鉴权提供商），因为包含越多模型，对比越充分。
- **选项：**
  - A) 所有已鉴权提供商。完整度：10/10。
  - B) 仅 Claude。完整度：6/10（缺少跨模型信号——单模型可改用 `/ship` 的 review）。
  - C) 选择两个——下一轮指定。完整度：8/10。

## 步骤 3：决定是否启用评委

```bash
[ -n "$ANTHROPIC_API_KEY" ] || grep -q 'ANTHROPIC' "$HOME/.claude/.credentials.json" 2>/dev/null && echo "JUDGE_AVAILABLE" || echo "JUDGE_UNAVAILABLE"
```

如果评委可用，使用 AskUserQuestion：
- **简化：** “质量评委会使用 Anthropic 的 Claude 对每个模型输出打 0-10 分并用于平局裁定。会额外增加约 $0.05/次。若你关心输出质量而不仅是延迟与成本，建议启用。”
- **推荐：** A——核心目标是比较质量，而不仅是速度。
- **选项：**
  - A) 启用评委（额外约 $0.05）。完整度：10/10。
  - B) 跳过评委——仅看速度、成本和 token。完整度：7/10。

若评委不可用，则跳过此问题并省略 `--judge` 参数。

## 步骤 4：运行基准测试

根据步骤 1、2、3 的决策拼装命令：

```bash
"$BIN" <prompt-spec> --models <picked-models> [--judge] --output table
```

其中 `<prompt-spec>` 为 `--prompt "<text>"`（步骤 1B）、文件路径（步骤 1A 或 1C）之一；`<picked-models>` 为步骤 2 中以逗号分隔的模型列表。

持续流式输出结果。此过程较慢——每个提供商都会完整运行一次提示词。根据提示词复杂度及是否开启 `--judge`，预计耗时 30 秒到 5 分钟。

## 步骤 5：解读结果

表格输出后，向用户总结：
- **最快** — 延迟最低的提供商。
- **最便宜** — 成本最低的提供商。
- **最高质量**（若启用了 `--judge`）— 分数最高的提供商。
- **总体最佳** — 用主观判断。若启用评委：按质量加权；否则说明用户需要在权衡中做出的取舍。

如果有任何提供商出现错误（鉴权、超时、速率限制），需要指出并给出修复路径。

## 步骤 6：询问是否保存结果

使用 AskUserQuestion：
- **简化：** “要将本次基准结果保存为 JSON，以便将来运行时对比吗？”
- **推荐：** A——各提供商会不断更新模型，保存基线有助于捕捉质量回退。
- **选项：**
  - A) 保存到 `~/.gstack/benchmarks/<date>-<skill-or-prompt-slug>.json`。完整度：10/10。
  - B) 只打印，不保存。完整度：5/10（会丢失趋势数据）。

若选择 A：使用 `--output json` 重新运行，并用 `tee` 写入按日期命名的文件。输出该路径，便于用户对未来运行进行 diff。

## 重要规则

- **不要在未先执行步骤 2 的 dry-run 的情况下运行真实基准测试。** 用户应先看到鉴权状态，以免浪费 API 调用。
- **不要硬编码模型名称。** 始终使用用户在步骤 2 的选择传入；其余解析由二进制处理。
- **不要自动包含 `--judge`。** 它会产生实际费用；用户必须主动同意。
- **如果没有可用鉴权提供商，请停止。** 不要尝试运行基准测试，结果无实际价值。
- **需显示成本。** 每次运行都会在表格中展示每个提供商的成本，用户应在下一次运行前看到。
