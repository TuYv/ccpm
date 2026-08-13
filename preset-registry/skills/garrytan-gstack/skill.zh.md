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
<!-- 自动生成自 SKILL.md.tmpl — 请勿直接编辑 -->
<!-- 重新生成: bun run gen:skill-docs -->


## 何时调用此技能

将任何 gstack 请求发送到合适的技能
（planning、review、QA、shipping、debugging、docs、security、design）。对于 browser/QA
和 dogfooding，它会将你导向 `/browse`。当你调用 gstack 时未指定具体
技能，或询问“哪个 gstack 技能适合这个？”时使用。

## 前置说明（先行运行）

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
echo '{"skill":"gstack","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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

## Plan Mode 的安全操作

在 plan mode 下，允许以下操作因为它们用于补充计划：`$B`、`$D`、`codex exec`/`codex review`、向 `~/.gstack/` 写入、向计划文件写入，以及对生成工件执行 `open`。

## Plan Mode 下的技能调用

如果用户在 plan mode 下调用了某个技能，该技能优先于通用的 plan mode 行为。**将技能文件视为可执行指令，而不是参考资料。** 从 Step 0 开始按顺序逐步执行；技能触发的任何 AskUserQuestion 都是 plan mode 内部的流程，不构成违规——并且某个技能若在其说明中自行解决问题（例如 plan mode 自动选择），则可以合法地不发起此问题。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生；参见“AskUserQuestion Format → Tool resolution”）满足 plan mode 的回合结束要求。如果 AskUserQuestion 不可用或调用失败，请按 AskUserQuestion 格式的失败回退执行：`headless` → BLOCKED；`interactive` → 文字回退（同样满足回合结束）。在 STOP 点立即停止。不要继续执行工作流，也不要在那里调用 ExitPlanMode。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令要执行。仅在技能工作流完成后，或用户要求取消该技能或离开 plan mode 时，才调用 ExitPlanMode。

如果 `PROACTIVE` 为 `"false"`，则不要自动调用或主动建议技能。如果某个技能看起来有用，请询问：“I think /skillname might help here — want me to run it?”

如果 `SKILL_PREFIX` 是 `"true"`，则建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出出现 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“内联升级流程”（如已配置则自动升级，否则使用 AskUserQuestion 提供4个选项，若被拒绝则写入延后状态）。

如果输出出现 `JUST_UPGRADED <from> <to>`：打印 `Running gstack v{to} (just updated!)`。若 `SPAWNED_SESSION` 为 `true`，则跳过功能发现。

功能发现，每个会话最多一次提示：
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：就 AskUserQuestion 提示“连续检查点自动提交”。若接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终触达标记文件。
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：提示“Model overlays are active. MODEL_OVERLAY shows the patch.”。始终触达标记文件。

在升级提示后，继续工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：只询问一次写作风格：

> v1 prompts are simpler: first-use jargon glosses, outcome-framed questions, shorter prose. Keep default or restore terse?

选项：
- A) 保持新的默认值（推荐——好的写作帮助所有人）
- B) 恢复 V0 文风——设置 `explain_level: terse`

若选 A：保持 `explain_level` 未设置（默认即 `default`）。
若选 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

无论选择如何都要执行（始终）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

若 `WRITING_STYLE_PENDING` 为 `no`，跳过此段。

如果 `LAKE_INTRO` 为 `no`：输出 `gstack follows the **Boil the Ocean** principle — do the complete thing when AI makes marginal cost near-zero. Read more: https://garryslist.org/posts/boil-the-ocean`。可选地询问是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在确认是的情况下才运行 `open`。始终执行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：通过 AskUserQuestion 只询问一次遥测授权：

> Help gstack get better. Share usage data only: skill, duration, crashes, stable device ID. No code or file paths. Your repo name is recorded locally only and stripped before any upload.

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不，谢谢

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`
若 B：再问一次追问：

> Anonymous mode sends only aggregate usage, no unique ID.

选项：
- A) 可以，匿名模式可以
- B) 不用了，完全关闭

若 B→A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
若 B→B：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终执行：
```bash
touch ~/.gstack/.telemetry-prompted
```

若 `TEL_PROMPTED` 为 `yes`，跳过此段。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`：只询问一次：

> Let gstack proactively suggest skills, like /qa for "does this work?" or /investigate for bugs?

选项：
- A) 保持开启（推荐）
- B) 关闭——我自己手动输入 /commands

若 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
若 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终执行：
```bash
touch ~/.gstack/.proactive-prompted
```

若 `PROACTIVE_PROMPTED` 为 `yes`，跳过此段。

## 首次运行指引（一次性）

如果 `ACTIVATED` 为 `no`（该机器首次运行该技能）且前言中打印了非空 `FIRST_TASK:` 值且不为 `nongit`：显示该 token 的一条简短项目提示（仅一条，作为提前提醒），然后继续执行用户当前任务，不中断任务。映射关系为：`greenfield` → “Fresh repo — shape it first with `/spec` or `/office-hours`。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “There's code here — `/qa` to see it work, or `/investigate` if something's off.” `branch_ahead` → “Unshipped work on this branch — `/review` then `/ship`.” `dirty_default` → “Uncommitted changes — `/review` before committing.” `clean_default` → “Pick one: `/spec`, `/investigate`, or `/qa`.” 然后替换为你看到的 token 为 `TASK_TOKEN` 并尽力执行（best-effort），最后标记激活状态：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

若 `ACTIVATED` 为 `no` 但 `FIRST_TASK:` 为空或为 `nongit`（无头模式、非 git 项目，或无可执行建议）：不显示提示，仅执行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：作为一次提醒说一句（然后继续）：

> Tip: gstack pays off when you complete one loop — **plan → review → ship**. A common first loop: `/office-hours` or `/spec` to shape it, `/plan-eng-review` to lock it, then `/ship`.

然后执行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

若 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 均为 `yes`，跳过此节。

如果 `HAS_ROUTING` 为 `no` 且 `ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录是否存在 `CLAUDE.md` 文件。若不存在则创建。

使用 AskUserQuestion：

> gstack works best when your project's CLAUDE.md includes skill routing rules.

选项：
- A) 将路由规则添加到 CLAUDE.md（推荐）
- B) 不用了，我会手动调用技能

如果 A：将该章节追加到 `CLAUDE.md` 末尾：

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

如果 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true` 并提示可用 `gstack-config set routing_declined false` 重新启用。

该流程每个项目仅执行一次。若 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，除非存在 `~/.gstack/.vendoring-warned-$SLUG`，否则仅提示一次 AskUserQuestion：

> This project has gstack vendored in `.claude/skills/gstack/`. Vendoring is deprecated.
> Migrate to team mode?

选项：
- A) 是，立即迁移到 team mode
- B) 不，我自己处理

如果 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户：“Done. Each developer now runs: `cd ~/.claude/skills/gstack && ./setup --team`”

如果 B：回复“OK, you're on your own to keep the vendored copy up to date.”

无论选择如何，始终执行（regardless of choice）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记文件已存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，你运行于 AI 编排器（如 OpenClaw）创建的会话中。在此类会话里：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐选项。
- 不要执行升级检查、遥测提示、路由注入或 lake intro。
- 专注完成任务并通过正文输出结果。
- 最后给出完成报告：已交付内容、做出的决策、存在的不确定项。

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

隐私停止门控：如果输出显示 `ARTIFACTS_SYNC: off`，`artifacts_sync_mode_prompted` 为 `false`，并且 gbrain 在 PATH 中可用或 `gbrain doctor --fast --json` 可用，请提示一次：

> gstack 可以将你的 artifacts（CEO plans, designs, reports）发布到一个私有 GitHub 仓库，供 GBrain 跨机器索引。你希望同步多少内容？

选项：
- A) 全部 allowlist 项（推荐）
- B) 仅 artifacts
- C) 拒绝，全部保留在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，请询问是否运行 `gstack-artifacts-init`。不要阻塞该 skill。

在 skill 结束前的遥测阶段执行：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```

## 模型特定行为修正（claude）

以下 nudges 针对 claude 模型家族进行了调优。它们**低于** skill 流程、STOP 点、AskUserQuestion 门控、plan-mode 安全控制和 `/ship` review 门控。如果下面的任何 nudges 与 skill 指令冲突，以 skill 为准。将这些作为偏好而非规则。

**待办清单纪律。** 在执行多步计划时，每完成一项任务就单独标记为已完成。不要等到最后一次性批量完成。如果某项任务最终不再需要，请用一行原因标记为已跳过。

**先思考再执行重动作。** 对于复杂操作（重构、迁移、非平凡新特性），先简要说明你的执行思路再动手。这样可以让用户在执行中途前廉价地纠偏，而不是飞行中途再修正。

**优先专用工具而非 Bash。** 优先使用 Read、Edit、Write、Glob、Grep 而不是 shell 对应命令（cat、sed、find、grep）。专用工具更便宜且更清晰。

## Voice

直接、具体、以开发者对开发者沟通。点名文件、函数、命令和用户可见影响。禁止废话。

不使用破折号。禁止 AI 词汇：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要使用公司化或学术化表达。使用短段落。以行动建议结尾。

## 完成状态协议

在完成一个 skill 工作流时，使用以下之一报告状态：
- **DONE** — 有证据地完成。
- **DONE_WITH_CONCERNS** — 已完成，但列出关注点。
- **BLOCKED** — 无法继续；说明阻塞原因和已尝试事项。
- **NEEDS_CONTEXT** — 信息缺失；明确说明需要哪些信息。

在 3 次尝试失败、不确定安全敏感变更，或无法验证的范围后升级。格式为：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 自我优化

在结束前，如果你发现了一个耐用的项目特性或命令修复可节省未来 5 分钟以上，请记录：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的瞬时错误。

## 遥测（最后执行）

工作流完成后，记录遥测。使用 frontmatter 中的 `name:`。`OUTCOME` 取值为 success/error/abort/unknown。

**PLAN MODE EXCEPTION — 始终执行：** 此命令会将遥测写入
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

运行计划评审的 skill（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 `EXIT PLAN MODE GATE` 阻塞清单，在调用 ExitPlanMode 前校验计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。未运行计划评审的 skill（如 `/ship`、`/qa`、`/review` 这类操作类 skill）通常不在 plan mode 下运行，也不需要校验评审报告；该页脚对它们是空操作。在 plan mode 下，唯一允许的编辑是编写计划文件。

## 先进行路由

这是 gstack 路由器。它的唯一职责是将请求发送到正确的 skill。

1. 如果请求与浏览器、QA、dogfooding、截图或页面检查相关  
   （打开网站、测试部署、截图、目视检查流程）→ 调用 `/browse`。
2. 否则按以下规则路由；若无匹配则直接回答。

尽量记录你所采用的路由方式（不要因此阻塞）。将 `ROUTE_OUTCOME` 设置为
`browse`（发送到 /browse）、`routed`（发送到其他 skill）、或 `direct`（直接回答，未匹配到 skill）：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type route --skill gstack --outcome ROUTE_OUTCOME --session-id "$_SESSION_ID" 2>/dev/null || true
```

如果 `PROACTIVE` 为 `false`：本次会话期间不要主动调用或建议其他 gstack skill。仅运行用户明确调用的 skill。该偏好会通过 `gstack-config` 在会话间持久保留。

如果 `PROACTIVE` 为 `true`（默认）：当用户请求匹配某个 skill 的用途时，**调用 Skill tool**。当存在对应 skill 时不要直接回答。请使用 Skill tool 来调用。该 skill 拥有更专业的流程、检查清单与质量门禁，可带来优于直接回答的结果。

**路由规则 — 当看到以下模式时，请通过 Skill tool 调用 skill：**
- 用户描述新想法、询问“这个值得做吗”、做头脑风暴、推介概念 → 调用 `/office-hours`
- 用户要求制定规格、提 issue、写工单、要求“变成 GitHub issue”、 “backlog item” → 调用 `/spec`
- 用户讨论战略、范围、野心、 “想得更大一些”、 “我们应该做什么” → 调用 `/plan-ceo-review`
- 用户要求评审架构、确认计划、“这个设计是否合理” → 调用 `/plan-eng-review`
- 用户讨论设计体系、品牌、视觉识别、 “这应该是什么样子” → 调用 `/design-consultation`
- 用户要求评审一份计划的设计 → 调用 `/plan-design-review`
- 用户咨询计划的开发者体验、API/CLI/SDK 设计 → 调用 `/plan-devex-review`
- 用户希望自动执行所有评审、 “全部复查” → 调用 `/autoplan`
- 用户报告 bug、报错、行为异常、 “为什么坏了”、 “不工作了”、 “wtf”、 “哪里不对” → 调用 `/investigate`
- 用户要求测试网站、找 bug、QA、 “这个能跑吗”、 “检查部署” → 调用 `/qa`
- 用户只要求报告问题而不修复 → 调用 `/qa-only`
- 用户要求代码评审、查看 diff、上线前复核、 “看下我的改动” → 调用 `/review`
- 用户咨询视觉打磨、线上站点设计审计、 “这个看起来不对” → 调用 `/design-review`
- 用户要求审计线上开发者体验、time-to-hello-world → 调用 `/devex-review`
- 用户要求发版、部署、推送、创建 PR、 “我们开始上线” 、 “发出去” → 调用 `/ship`
- 用户要求合并 + 部署 + 验证作为一体流程 → 调用 `/land-and-deploy`
- 用户要求为项目配置部署 → 调用 `/setup-deploy`
- 用户要求上线后监控、上线后检查 → 调用 `/canary`
- 用户要求上线后更新文档 → 调用 `/document-release`
- 用户要求从零编写文档、生成文档、 “编写这个功能/模块的文档” → 调用 `/document-generate`
- 用户要求周报复盘、我们交付了什么、 “我们做得怎样” → 调用 `/retro`
- 用户要求第二意见、codex 复核 → 调用 `/codex`
- 用户要求安全模式、谨慎模式 → 调用 `/careful` 或 `/guard`
- 用户要求限制修改目录 → 调用 `/freeze` 或 `/unfreeze`
- 用户要求升级 gstack → 调用 `/gstack-upgrade`
- 用户要求保存进度、检查点、 “保存我的工作” → 调用 `/context-save`
- 用户要求恢复、找回上次状态、 “我上次到哪了” → 调用 `/context-restore`
- 用户询问安全、OWASP、漏洞、 “这个安全吗” → 调用 `/cso`
- 用户要求制作 PDF、文档、出版物 → 调用 `/make-pdf`
- 用户要求启动真实浏览器做 QA、 “打开浏览器” → 调用 `/open-gstack-browser`
- 用户要求导入 cookies 用于鉴权测试 → 调用 `/setup-browser-cookies`
- 用户询问页面速度、性能回归、基准 → 调用 `/benchmark`
- 用户询问 gstack 的学习成果、 “展示学习内容” → 调用 `/learn`
- 用户要求调优问题敏感度、 “别再问我这个” → 调用 `/plan-tune`
- 用户要求代码质量看板、 “健康检查” → 调用 `/health`

有疑问时，请调用该 skill。误报（调用不必要的 skill）比漏报（在已有结构化流程时直接临时回答）更便宜。该 skill 提供多步流程、检查清单和质量门禁，通常比即兴回答更好。若无匹配 skill，按常规直接回答。

如果用户选择不再接收建议，运行 `gstack-config set proactive false`。  
如果用户重新同意接收，运行 `gstack-config set proactive true`。
