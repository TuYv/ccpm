---
name: make-pdf
preamble-tier: 1
version: 1.0.0
description: Turn any markdown file into a publication-quality PDF. (gstack)
triggers:
  - markdown to pdf
  - generate pdf
  - make pdf
  - export pdf
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---
<!-- AUTO-GENERATED from SKILL.md.tmpl — 请勿直接编辑 -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此技能

1 英寸标准页边距、智能分页、页码、封面页、运行页眉、弯引号和长破折号、可点击目录、对角线 DRAFT 水印。不是草稿产物，而是最终产物。用于当被要求“make a PDF”、“export to PDF”、“turn this markdown into a PDF”或“generate a document”时。

语音触发（语音转文本别名）：“make this a pdf”“make it a pdf”“export to pdf”“turn this into a pdf”“turn this markdown into a pdf”“generate a pdf”“make a pdf from”“pdf this markdown”。

## 预备操作（先运行）

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
echo '{"skill":"make-pdf","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"make-pdf","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

## MAKE-PDF 设置（在任何 make-pdf 命令之前运行此检查）

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
P=""
[ -n "$MAKE_PDF_BIN" ] && [ -x "$MAKE_PDF_BIN" ] && P="$MAKE_PDF_BIN"
[ -z "$P" ] && [ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/make-pdf/dist/pdf" ] && P="$_ROOT/.claude/skills/gstack/make-pdf/dist/pdf"
[ -z "$P" ] && P="$HOME/.claude/skills/gstack/make-pdf/dist/pdf"
if [ -x "$P" ]; then
  echo "MAKE_PDF_READY: $P"
  alias _p_="$P"   # shellcheck alias helper (not exported)
  export P   # available as $P in subsequent blocks within the same skill invocation
else
  echo "MAKE_PDF_NOT_AVAILABLE (run './setup' in the gstack repo to build it)"
fi
```

如果打印了 `MAKE_PDF_NOT_AVAILABLE`，请告知用户二进制文件尚未构建。让他们在 gstack 仓库中运行 `./setup`，然后重试。

如果打印了 `MAKE_PDF_READY`：`$P` 是该技能后续步骤中二进制文件的路径。使用 `$P`（而不是显式路径），以保持技能体可移植。

核心命令：
- `$P generate <input.md> [output.pdf]` — 将 markdown 渲染为 PDF（80% 的使用场景）
- `$P generate --cover --toc essay.md out.pdf` — 完整发布版布局
- `$P generate --watermark DRAFT memo.md draft.pdf` — 对角线 DRAFT 水印
- `$P preview <input.md>` — 渲染 HTML 并在浏览器中打开（快速迭代）
- `$P setup` — 验证 browse + Chromium + pdftotext 并运行烟雾测试
- `$P --help` — 完整标志参考

**输出契约**
- `stdout`: 成功时仅输出输出路径。仅一行。
- `stderr`: 显示进度 (`Rendering HTML... Generating PDF...`)，除非使用 `--quiet`。
- 退出码：0 成功 / 1 参数错误 / 2 渲染失败 / 3 Paged.js 超时 / 4 浏览不可用。

## 计划模式安全操作

在计划模式下允许以下行为，因为它们用于制定计划：`$B`、`$D`、`codex exec`/`codex review`，写入 `~/.gstack/`，写入计划文件，以及对生成产物执行 `open`。

## 计划模式中的技能调用

如果用户在计划模式下调用技能，则该技能优先于通用计划模式行为。**将技能文件视为可执行指令，而非参考资料。** 从第 0 步开始逐步执行。任何技能触发的 `AskUserQuestion` 都是计划模式内的工作流，不构成违规——并且某些可自行解决问题的技能（例如 plan-mode 自动选择）可能会合法地不发起该提问。`AskUserQuestion`（任意变体——`mcp__*__AskUserQuestion` 或原生；见“AskUserQuestion Format → Tool resolution”）满足计划模式回合结束要求。如果 `AskUserQuestion` 不可用或调用失败，按 AskUserQuestion 格式失败回退处理：`headless` → `BLOCKED`；`interactive` → 文字回退（同样满足回合结束）。在 `STOP` 点立即停止。不要继续工作流，也不要在此处调用 `ExitPlanMode`。标记为“PLAN MODE EXCEPTION — ALWAYS RUN”的命令执行。仅在技能工作流完成后或用户要求你取消该技能或离开计划模式时才调用 `ExitPlanMode`。

如果 `PROACTIVE` 是 `"false"`，不要自动触发或主动建议技能。如果某技能有帮助，询问：“我认为 /skillname 可能有用，要我运行一下吗？”

如果 `SKILL_PREFIX` 是 `"true"`，建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并按“Inline upgrade flow”执行（自动升级若已配置，否则用 4 个选项进行 AskUserQuestion；若拒绝则写入延后设置状态）。
如果输出显示 `JUST_UPGRADED <from> <to>`：打印 `Running gstack v{to} (just updated!)`。如果 `SPAWNED_SESSION` 为 true，请跳过功能发现。

功能发现，每会话最多一次提示：
- 若缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`，询问是否启用持续检查点自动提交；若同意，执行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终创建该标记文件。
- 若缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`，提示“模型覆盖已启用。MODEL_OVERLAY 显示补丁。”始终创建该标记文件。

在升级提示后继续流程。

如果 `WRITING_STYLE_PENDING` 为 `yes`，一次性询问写作风格：

> v1 提示更简洁：首次使用术语会附带释义、结果导向的问题、文本更短。保持默认还是恢复 terse 风格？

- A) 保持新的默认设置（推荐——好的写作有益于每个人）
- B) 恢复 V0 文风——设置 `explain_level: terse`

如果选 A：保持 `explain_level` 不设置（默认为 `default`）。
如果选 B：执行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

无论选择如何始终执行（始终运行）：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，跳过。

如果 `LAKE_INTRO` 为 `no`，输出：
“gstack 遵循 **Boil the Ocean** 原则——当 AI 把边际成本降到接近零时，就把整件事做完。更多说明见 https://garryslist.org/posts/boil-the-ocean”
并提供是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在用户同意时才执行 `open`。始终执行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`，仅一次询问遥测设置：

> 帮助 gstack 持续改进。仅共享使用数据：技能、时长、崩溃、稳定设备 ID。不会上传代码或文件路径。你的仓库名仅本地记录，并在上传前被去除。

- A) 帮助 gstack 做得更好！（推荐）
- B) 不用了

若选 A：执行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

若选 B，继续追问：

> 匿名模式仅发送聚合使用信息，不包含唯一 ID。

- A) 匿名模式可以
- B) 不用了，完全关闭

若 B→A：执行 `~/.claude/skills/gstack/bin/gstack-config set telemetry anonymous`
若 B→B：执行 `~/.claude/skills/gstack/bin/gstack-config set telemetry off`

始终执行：
```bash
touch ~/.gstack/.telemetry-prompted
```

若 `TEL_PROMPTED` 为 `yes`，跳过该步骤。

如果 `PROACTIVE_PROMPTED` 为 `no` 且 `TEL_PROMPTED` 为 `yes`，仅一次询问：

> 允许 gstack 主动推荐技能，比如使用 `/qa` 检查“是否可用？”，或 `/investigate` 定位问题？

- A) 保持开启（推荐）
- B) 关闭——我会手动输入 /commands

若 A：执行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
若 B：执行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终执行：
```bash
touch ~/.gstack/.proactive-prompted
```

若 `PROACTIVE_PROMPTED` 为 `yes`，跳过。

## 首次运行引导（一次性）

如果 `ACTIVATED` 为 `no`（本机首次运行该技能）且前言中打印了非空 `FIRST_TASK:` 值且不是 `nongit`，显示一条项目相关的简短提示作为提前说明，然后继续执行用户的原始任务——不要阻断任务。映射如下：  
`greenfield` → “新仓库——先用 `/spec` 或 `/office-hours` 先定形。”  
`code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里有代码——用 `/qa` 查看它是否正常，或若有问题可用 `/investigate`。”  
`branch_ahead` → “分支上有未发布工作——先 `/review` 再 `/ship`。”  
`dirty_default` → “有未提交更改——提交前先 `/review`。”  
`clean_default` → “请选择一项：`/spec`、`/investigate` 或 `/qa`。”
然后按该步骤执行（尽力而为），并标记已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

若 `ACTIVATED` 为 `no` 但 `FIRST_TASK:` 为空或 `nongit`（无头、非 git，或无可操作项）：不显示提示，仅执行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则若 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`，先显示一次提醒（随后继续）：

> 提示：gstack 在你完成一个循环时最划算——**plan → review → ship**。一个常见起步循环是：`/office-hours` 或 `/spec` 先定形，`/plan-eng-review` 锁定方案，然后 `/ship`。

然后执行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

若 `ACTIVATED` 与 `FIRST_LOOP_SHOWN` 同时为 `yes`，跳过该部分。

如果 `HAS_ROUTING` 为 `no` 且 `ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
检查项目根目录是否存在 `CLAUDE.md`。若不存在则创建。

执行 AskUserQuestion：

> gstack 在项目的 `CLAUDE.md` 包含技能路由规则时效果最佳。

- A) 向 `CLAUDE.md` 添加路由规则（推荐）
- B) 不用了，我会手动调用技能

若选 A：将以下内容追加到 `CLAUDE.md` 末尾：

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

如果是 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并告知他们可以使用 `gstack-config set routing_declined false` 重新开启。  

这仅在每个项目中发生一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。  

如果 `VENDORED_GSTACK` 为 `yes`，除非 `~/.gstack/.vendoring-warned-$SLUG` 已存在，否则通过 AskUserQuestion 提示一次：

> 本项目已将 gstack vendored 到 `.claude/skills/gstack/`。vendoring 已弃用。  
> 是否迁移到团队模式？

选项：
- A) 是，立即迁移到团队模式
- B) 否，我会自行处理

如果是 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户："Done. Each developer now runs: `cd ~/.claude/skills/gstack && ./setup --team`"

如果是 B：说明“OK，你需要自行保持 vendored 副本为最新。”

始终执行（无论选择如何）：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

若标记文件存在则跳过。  

如果 `SPAWNED_SESSION` 为 `"true"`，说明你在 AI orchestrator（例如 OpenClaw）创建的会话中运行。在此类会话中：
- 不要使用 AskUserQuestion 进行交互式提示。自动选择推荐项。
- 不要运行升级检查、遥测提示、路由注入或 lake intro。
- 专注于完成任务，并通过正文输出报告结果。
- 以完成报告结束：已交付内容、已做决策、存在的不确定项。  

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

隐私停滞门控：如果输出显示 `ARTIFACTS_SYNC: off`、`artifacts_sync_mode_prompted` 为 `false`，且 gbrain 在 PATH 中或 `gbrain doctor --fast --json` 可用，则提示一次：

> gstack can publish your artifacts (CEO plans, designs, reports) to a private GitHub repo that GBrain indexes across machines. How much should sync?

选项：
- A) 全部允许（推荐）
- B) 仅 artifacts
- C) 拒绝，全部保留本地

答复后执行：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，询问是否运行 `gstack-artifacts-init`。不要阻塞该 skill。  

在 skill 结束、遥测前执行：

```bash
"~/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"~/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```

## 模型专用行为修正（claude）

以下 nudges 由 claude 模型家族定制。它们**从属**于 skill 工作流、STOP 点、AskUserQuestion 门槛、计划模式安全机制以及 /ship 审查门槛。若下方 nudges 与 skill 指令冲突，以 skill 为准。请将其视为偏好而非规则。  

**待办事项规范。** 在执行多步计划时，在完成每项任务时单独标记为已完成。不要在最后一次性批量标记。如果某个任务被证明不必要，请用一行理由标记为已跳过。

**在执行复杂操作前先思考。** 对于复杂操作（重构、迁移、非平凡新功能），先简要说明你的做法再执行。这样用户可以在中途低成本校正，而不是在执行中途返工。  

**优先使用专用工具而非 Bash。** 偏向使用 Read、Edit、Write、Glob、Grep 而不是 shell 等价命令（cat、sed、find、grep）。专用工具更省成本，且更清晰。  

## 声音风格

直接、具体、偏工程者之间的交流方式。命名文件、函数、命令和用户可见的影响。不要冗余。  

不要使用破折号。不要使用 AI 词汇：delve、crucial、robust、comprehensive、nuanced、multifaceted。不要企业化或学术化。段落要短。以可执行的下一步结尾。  

用户有上下文你没有。跨模型一致只是建议，不是决策。最终由用户决定。  

## 完成状态协议

完成一个 skill 工作流时，按以下状态之一汇报：

- **DONE** —— 完成且有证据。  
- **DONE_WITH_CONCERNS** —— 已完成，但列出关注点。  
- **BLOCKED** —— 无法继续；说明阻塞原因和已尝试内容。  
- **NEEDS_CONTEXT** —— 缺少信息；准确说明所需信息。  

在 3 次尝试失败、对安全敏感变更不确定，或范围无法核实后升级。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。  

## Operational Self-Improvement

在完成前，如果你发现了可复用的项目技巧或可节省 5 分钟以上的命令修复，应记录它：

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录明显事实或一次性临时错误。  

## Telemetry (run last)

工作流完成后，记录遥测。使用 frontmatter 中的 `name:`。OUTCOME 取值为 success/error/abort/unknown。  

**PLAN MODE EXCEPTION — ALWAYS RUN:** 此命令写入遥测到 `~/.gstack/analytics/`，符合预启动分析写入行为。  

执行以下命令：

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

将 `SKILL_NAME`、`OUTCOME`、`USED_BROWSE` 替换后再运行。  

## Plan Status Footer

运行计划评审的 skill（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 EXIT PLAN MODE GATE 阻塞清单，用于验证计划文件是否以 `## GSTACK REVIEW REPORT` 结尾后再调用 ExitPlanMode。  
不运行计划评审的 skill（如操作类 `/ship`、`/qa`、`/review`）通常不在 plan mode 运作，也没有可核验的 review report；该 footer 对它们是空操作。  
在 plan mode 下允许编辑的唯一文件是计划文件。  

# make-pdf: publication-quality PDFs from markdown

将 `.md` 文件转换为高质量 PDF，风格接近 Faber & Faber 的随笔：1 英寸页边距、正文左对齐、全程 Helvetica、弯引号与破折号、可选封面页和可点击 TOC、需要时添加斜向 DRAFT 水印。  
从 PDF 复制粘贴可得到干净文字，不会出现 “S a i l i n g”。

在 Linux 上安装 `fonts-liberation` 可获得正确渲染，默认没有 Helvetica 和 Arial，Liberation Sans 是标准的度量兼容替代字体。CI 和 Docker 构建会通过 Dockerfile.ci 自动安装。

Emoji 需要一个彩色 emoji 字体。macOS（Apple Color Emoji）和 Windows（Segoe UI Emoji）自带；多数 Linux 发行版和容器里没有，因此 emoji 会显示为空方块（▯）。`./setup` 在 Linux 上会自动安装 `fonts-noto-color-emoji`（apt/dnf/pacman/apk，尽力而为），打印 CSS 会回退到 Apple / Segoe / Noto emoji 字体系列。设置 `GSTACK_SKIP_FONTS=1` 可跳过安装（CI 无 sudo、受管或离线机器）。

## Core patterns

### 80% 场景：memo/letter

单条命令，无标志。默认生成带活动页眉、页码和 CONFIDENTIAL 页脚的清爽 PDF。

```bash
$P generate letter.md                 # writes /tmp/letter.pdf
$P generate letter.md letter.pdf      # explicit output path
```

### 出版模式：封面 + TOC + 章节分页

```bash
$P generate --cover --toc --author "Garry Tan" --title "On Horizons" \
  essay.md essay.pdf
```

每个顶级 H1 在 markdown 中都会从新页开始。对包含多个 H1 的 memo，可用 `--no-chapter-breaks` 禁用。  

### 草稿阶段水印

```bash
$P generate --watermark DRAFT memo.md draft.pdf
```

每页都有 10% 不透明度的斜向 DRAFT 水印。草稿完成后去掉该标志并重新生成。  

### 通过 preview 快速迭代

```bash
$P preview essay.md
```

使用相同的打印 CSS 渲染 HTML 并在浏览器中打开。编辑 markdown 时可刷新。等你准备好了再跳过 PDF 往返。  

### 无品牌化（无 CONFIDENTIAL 页脚）

```bash
$P generate --no-confidential memo.md memo.pdf
```

### 图表 — mermaid 与 excalidraw 代码块以图像方式渲染

markdown 中位于列 0 的 ` ```mermaid ` 或 ` ```excalidraw ` 代码围栏会渲染为清晰的矢量图，完全离线（内置 bundle，无 CDN）。缩进的代码围栏（列表内）按设计保留为纯代码块。坏的代码围栏会生成可见红色诊断块并显示解析错误，不会静默留白代码。  

围栏信息字符串选项：

```
```mermaid title="Auth flow"        ← caption + aria-label
```mermaid render=false             ← keep it as a code block (today's behavior)
```mermaid page=landscape           ← force this diagram onto a landscape page
```mermaid page=portrait            ← veto auto-landscape for this diagram
```

` ```excalidraw ` 围栏包含完整的 .excalidraw 场景文件（即 excalidraw.com 保存的文件）。从英文创建新图的工作由 `/diagram` 负责，它会输出可编辑三件套（source、.excalidraw、SVG/PNG）并与该 skill 配套：在 markdown 中嵌入 `.mmd` source，而不是 PNG。  

### 图片 — 缩放正确，绝不截断

本地图片会自动内联（相对路径按 markdown 文件解析）。每张图片都限制在内容框宽度以内——永远不截断。  
超大照片会降采样到打印分辨率（300dpi），在不明显损失质量的前提下保持体积较小。  

远程（http/https）图片默认**被替换为可见占位符**，出于离线策略；使用 `--allow-network` 可获取。  
解析路径在 markdown 目录之外的图片（即使是符号链接）仍会内联，但会发出较强警告；`--strict` 会将其变为致命错误。超过 64MB 或非常规文件（FIFO、设备文件）会降级为占位符，而不是导致运行卡住。  

每张图片可用指令，紧跟在图片后面：

```
![chart](data.png){width=full}      ← stretch to content-box width
![chart](data.png){width=50%}       ← percentage or 3in/8cm/200px
![wide](arch.png){page=landscape}   ← give it its own landscape page
![wide](shot.png){page=portrait}    ← veto auto-landscape
```

宽版小字的图表图片会自动提升到单独的横向页（保守条件：宽高比≥1.8、宽度超过内容框约2.5倍，且 alt 文本带 diagram-ish 关键词——diagram/architecture/flowchart/chart/graph）。  
被提升的页面会垂直居中。启发式判断错误时，用 `{page=portrait}` 可取消提升；误判为未提升时加 `{page=landscape}` 即可。

### 其他格式 — 单文件 HTML 与 Word

```bash
$P generate readme.md out.html --to html    # ONE self-contained file: inline
                                            # SVG diagrams, data-URI images,
                                            # zero network refs, screen-readable
$P generate readme.md out.docx --to docx    # Word: content fidelity (headings,
                                            # tables, code, diagrams as PNG) —
                                            # layout is Word's, not ours
```

`--to` 是输出格式。`--format` 是另一回事（一个 `--page-size` 别名）——不要把它们混淆。

### CI 模式 — 在缺少资源时直接报错

```bash
$P generate docs.md --strict     # missing, remote, out-of-tree, oversized,
                                 # and non-regular-file images exit non-zero
                                 # instead of warn + placeholder
```

## 通用参数

```
Page layout:
  --margins <dim>            1in (default) | 72pt | 2.54cm | 25mm
  --page-size letter|a4|legal

Structure:
  --cover                    Cover page (title, author, date, hairline rule)
  --toc                      Clickable TOC with page numbers
  --no-chapter-breaks        Don't start a new page at every H1

Branding:
  --watermark <text>         Diagonal watermark ("DRAFT", "CONFIDENTIAL")
  --header-template <html>   Custom running header
  --footer-template <html>   Custom footer (mutex with --page-numbers)
  --no-confidential          Suppress the CONFIDENTIAL right-footer

Output:
  --to pdf|html|docx         Output format (default: pdf). html = single
                             self-contained file; docx = content fidelity.
  --strict                   Missing, remote, out-of-tree, oversized, or
                             non-regular-file images fail the run (CI mode).
  --page-numbers             "N of M" footer (default on)
  --tagged                   Accessible PDF (default on)
  --outline                  PDF bookmarks from headings (default on)
  --quiet                    Suppress progress on stderr
  --verbose                  Per-stage timings

Network:
  --allow-network            Fetch external images. Off by default: remote
                             images render as a visible blocked placeholder
                             (no tracking pixels fetch at print time).

Metadata:
  --title "..."              Document title (defaults to first H1)
  --author "..."             Author for cover + PDF metadata
  --date "..."               Date for cover (defaults to today)
```

## 何时由 Claude 触发执行

关注 markdown 转 PDF 的意图。任何以下表述 → 运行 `$P generate`：

- “Can you make this markdown a PDF”
- “Export it as a PDF”
- “Turn this letter into a PDF”
- “I need a PDF of the essay”
- “Print this as a PDF for me”

如果用户打开了 `.md` 文件并说“make it look nice”，请先建议 `$P generate --cover --toc`，然后再询问是否执行。

## 调试

- 输出为空白 / 显示空白内容 → 检查浏览器守护进程是否运行：`$B status`。
- 复制粘贴出现断裂文字 → 来自 highlight.js 输出（阶段 4）。当该参数可用时，使用 `--no-syntax` 重试。当前请移除围栏代码块并重新生成。
- Paged.js 超时 → 可能是 markdown 中没有标题。去掉 `--toc`。
- 输出中出现 “[remote image blocked]” 占位符 → 添加 `--allow-network`（表示允许该 markdown 文件从其图片 URL 获取内容）。
- 生成的 PDF 过高/过宽 → 使用 `--page-size a4` 或 `--margins 0.75in`。

## 输出约定

````
stdout: /tmp/letter.pdf          ← just the path, one line
stderr: Rendering HTML...        ← progress spinner (unless --quiet)
        Generating PDF...
        Done in 1.5s. 43 words · 22KB · /tmp/letter.pdf

exit code: 0 success / 1 bad args / 2 render error / 3 Paged.js timeout
           / 4 browse unavailable
````

Capture the path: `PDF=$($P generate letter.md)` — then use `$PDF`.
