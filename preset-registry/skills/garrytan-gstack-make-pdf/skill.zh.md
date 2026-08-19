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
<!-- AUTO-GENERATED from SKILL.md.tmpl — do not edit directly -->
<!-- Regenerate: bun run gen:skill-docs -->


## 何时调用此 skill

规范的 1in 页边距、智能分页、页码、封面、页眉、弯引号和 em dash、可点击的目录、对角线 DRAFT 水印。不是草稿产物——而是完成的成品。在用户要求“制作 PDF”、“导出为 PDF”、“将此 markdown 转换为 PDF”或“生成文档”时使用。

语音触发词（语音转文本别名）：“make this a pdf”、“make it a pdf”、“export to pdf”、“turn this into a pdf”、“turn this markdown into a pdf”、“generate a pdf”、“make a pdf from”、“pdf this markdown”。

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
echo '{"skill":"make-pdf","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","repo":"'$(_repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null | tr -cd 'a-zA-Z0-9._-'); echo "${_repo:-unknown}")'"}'  >> ~/.gstack/analytics/skill-usage.jsonl 2>/dev/null || true
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
~/.claude/skills/gstack/bin/gstack-timeline-log '{"skill":"make-pdf","event":"started","branch":"'"$_BRANCH"'","session":"'"$_SESSION_ID"'"}' 2>/dev/null &
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

如果输出 `MAKE_PDF_NOT_AVAILABLE`：告知用户该二进制文件尚未构建。让用户从 gstack 仓库运行 `./setup`，然后重试。

如果输出 `MAKE_PDF_READY`：`$P` 是此技能其余部分所使用的二进制文件路径。使用 `$P`（而不是显式路径），以便技能正文保持可移植。

核心命令：
- `$P generate <input.md> [output.pdf]` — 将 markdown 渲染为 PDF（适用于 80% 的场景）
- `$P generate --cover --toc essay.md out.pdf` — 完整的出版物布局
- `$P generate --watermark DRAFT memo.md draft.pdf` — 添加对角线 DRAFT 水印
- `$P preview <input.md>` — 渲染 HTML 并在浏览器中打开（快速迭代）
- `$P setup` — 验证 browse + Chromium + pdftotext 并运行冒烟测试
- `$P --help` — 完整的标志参数参考

输出约定：
- `stdout`：成功时仅输出路径。一行。
- `stderr`：进度信息（`Rendering HTML... Generating PDF...`），除非使用 `--quiet`。
- 退出码 0 表示成功 / 1 表示参数错误 / 2 表示渲染错误 / 3 表示 Paged.js 超时 / 4 表示 browse 不可用。

## 计划模式下的安全操作

在计划模式下，以下操作是允许的，因为它们有助于制定计划：`$B`、`$D`、`codex exec`/`codex review`、写入 `~/.gstack/`、写入计划文件，以及对生成的构件使用 `open`。

## 计划模式下调用技能

如果用户在计划模式下调用技能，则技能优先于通用的计划模式行为。**将技能文件视为可执行指令，而不是参考资料。** 从第 0 步开始逐步执行；技能触发的任何 AskUserQuestion 都是计划模式中的工作流操作，不违反计划模式要求——而且，如果技能的指令自行解决了某个问题（例如计划模式自动选择），则可以不提问。AskUserQuestion（任何变体——`mcp__*__AskUserQuestion` 或原生版本；请参阅“AskUserQuestion 格式 → 工具解析”）满足计划模式结束时的要求。如果 AskUserQuestion 不可用或调用失败，请遵循 AskUserQuestion 格式的失败回退方案：`headless` → BLOCKED；`interactive` → 使用文字回退方案（同样满足结束时的要求）。在 STOP 点立即停止。不要继续工作流，也不要在此处调用 ExitPlanMode。标记为“计划模式例外 — 始终运行”的命令必须执行。只有在技能工作流完成后，或者用户要求取消技能或离开计划模式时，才能调用 ExitPlanMode。

如果 `PROACTIVE` 为 `"false"`，不要自动调用或主动建议技能。如果某个技能似乎对此有帮助，请询问：“我认为 /skillname 可能会对此有所帮助——要我运行它吗？”

如果 `SKILL_PREFIX` 为 `"true"`，建议/调用 `/gstack-*` 名称。磁盘路径保持为 `~/.claude/skills/gstack/[skill-name]/SKILL.md`。

如果 `UPDATE_CHECK` 为 `"false"`，跳过接下来的两行——更新检查二进制程序在该模式下不会输出任何内容，因此没有 `UPGRADE_AVAILABLE` / `JUST_UPGRADED` 输出需要处理。

如果输出显示 `UPGRADE_AVAILABLE <old> <new>`：读取 `~/.claude/skills/gstack/gstack-upgrade/SKILL.md` 并遵循“Inline upgrade flow”（如果已配置则自动升级，否则使用 4 个选项调用 AskUserQuestion；如果拒绝，则写入暂缓状态）。

如果输出显示 `JUST_UPGRADED <from> <to>`：打印“正在运行 gstack v{to}（刚刚更新！）”。如果 `SPAWNED_SESSION` 为 true，则跳过功能发现。

功能发现，每个会话最多提示一次：
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-continuous-checkpoint`：使用 AskUserQuestion 询问是否启用 Continuous checkpoint 自动提交。如果接受，则运行 `~/.claude/skills/gstack/bin/gstack-config set checkpoint_mode continuous`。始终更新标记文件的时间戳。
- 如果缺少 `~/.claude/skills/gstack/.feature-prompted-model-overlay`：告知“模型覆盖层已启用。MODEL_OVERLAY 会显示补丁。”始终更新标记文件的时间戳。

升级提示之后，继续工作流。

如果 `WRITING_STYLE_PENDING` 为 `yes`：询问一次写作风格：

> v1 提示更简洁：首次使用术语时提供释义、以结果为导向提问、使用更短的正文。保留默认设置，还是恢复简洁风格？

选项：
- A) 保留新的默认设置（推荐——良好的写作对每个人都有帮助）
- B) 恢复 V0 正文——设置 `explain_level: terse`

如果选择 A：保持 `explain_level` 未设置（默认为 `default`）。
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set explain_level terse`。

无论选择如何，始终运行：
```bash
rm -f ~/.gstack/.writing-style-prompt-pending
touch ~/.gstack/.writing-style-prompted
```

如果 `WRITING_STYLE_PENDING` 为 `no`，则跳过。

如果 `LAKE_INTRO` 为 `no`：说“gstack 遵循 **Boil the Ocean** 原则——当 AI 使边际成本接近于零时，就把事情完整地做完。了解更多：https://garryslist.org/posts/boil-the-ocean” 提供是否打开：

```bash
open https://garryslist.org/posts/boil-the-ocean
touch ~/.gstack/.completeness-intro-seen
```

仅在选择是时运行 `open`。始终运行 `touch`。

如果 `TEL_PROMPTED` 为 `no` 且 `LAKE_INTRO` 为 `yes`：使用 AskUserQuestion 询问一次是否允许遥测：

> 帮助 gstack 变得更好。仅分享使用数据：技能、持续时间、崩溃情况、稳定的设备 ID。不包含代码或文件路径。你的仓库名称仅记录在本地，并会在上传前删除。

选项：
- A) 帮助 gstack 变得更好！（推荐）
- B) 不用了

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set telemetry community`

如果选择 B：进行后续询问：

> 匿名模式仅发送汇总使用数据，不包含唯一 ID。

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

> 让 gstack 主动建议技能，例如用 /qa 检查“这样能运行吗？”，或用 /investigate 排查错误？

选项：
- A) 保持开启（推荐）
- B) 关闭 — 我会自己输入 /commands

如果选择 A：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive true`
如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set proactive false`

始终运行：
```bash
touch ~/.gstack/.proactive-prompted
```

如果 `PROACTIVE_PROMPTED` 为 `yes`，则跳过。

## 首次运行引导（一次性）

如果 `ACTIVATED` 为 `no`（这台机器上首次运行技能），且前置内容打印了非空的 `FIRST_TASK:` 值，并且该值不是 `nongit`：根据该令牌显示一行简短的、针对项目的提示，然后继续执行用户实际请求的内容——不要停止用户的任务。令牌映射如下：`greenfield` → “全新仓库 — 先用 `/spec` 或 `/office-hours` 规划好它。” `code_node`/`code_python`/`code_rust`/`code_go`/`code_ruby`/`code_ios` → “这里已有代码 — 用 `/qa` 看看它是否正常运行，或在出现异常时使用 `/investigate`。” `branch_ahead` → “此分支上有尚未发布的工作 — 先用 `/review`，然后用 `/ship`。” `dirty_default` → “有未提交的更改 — 提交前先用 `/review`。” `clean_default` → “任选其一：`/spec`、`/investigate` 或 `/qa`。” 然后将你看到的令牌替换为 TASK_TOKEN，并运行以下命令（尽力执行），同时标记为已激活：
```bash
~/.claude/skills/gstack/bin/gstack-telemetry-log --event-type first_task_scaffold_shown --skill "TASK_TOKEN" --outcome shown 2>/dev/null || true
touch ~/.gstack/.activated 2>/dev/null || true
```

如果 `ACTIVATED` 为 `no`，但 `FIRST_TASK:` 为空或为 `nongit`（无头模式、非 git 仓库或没有可执行的操作）：不显示任何内容，只运行 `touch ~/.gstack/.activated 2>/dev/null || true`。

否则，如果 `ACTIVATED` 为 `yes` 且 `FIRST_LOOP_SHOWN` 为 `no`：提示一次（然后继续）：

> 提示：完成一个循环后，gstack 才能真正发挥作用 — **规划 → 评审 → 发布**。一个常见的首次循环是：使用 `/office-hours` 或 `/spec` 进行规划，用 `/plan-eng-review` 确定方案，然后使用 `/ship`。

然后运行 `touch ~/.gstack/.first-loop-tip-shown 2>/dev/null || true`。

如果 `ACTIVATED` 和 `FIRST_LOOP_SHOWN` 均为 `yes`，则跳过本节。

如果 `HAS_ROUTING` 为 `no`、`ROUTING_DECLINED` 为 `false` 且 `PROACTIVE_PROMPTED` 为 `yes`：
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

如果选择 B：运行 `~/.claude/skills/gstack/bin/gstack-config set routing_declined true`，并说明他们可以通过 `gstack-config set routing_declined false` 重新启用。

每个项目只会执行一次。如果 `HAS_ROUTING` 为 `yes` 或 `ROUTING_DECLINED` 为 `true`，则跳过。

如果 `VENDORED_GSTACK` 为 `yes`，且 `~/.gstack/.vendoring-warned-$SLUG` 不存在，则通过 AskUserQuestion 警告一次：

> 此项目已将 gstack vendored 到 `.claude/skills/gstack/` 中。不再建议使用 vendoring。
> 是否迁移到团队模式？

选项：
- A) 是，现在迁移到团队模式
- B) 否，我会自行处理

如果选择 A：
1. 运行 `git rm -r .claude/skills/gstack/`
2. 运行 `echo '.claude/skills/gstack/' >> .gitignore`
3. 运行 `~/.claude/skills/gstack/bin/gstack-team-init required`（或 `optional`）
4. 运行 `git add .claude/ .gitignore CLAUDE.md && git commit -m "chore: migrate gstack from vendored to team mode"`
5. 告知用户："完成。现在每位开发者都需要运行：`cd ~/.claude/skills/gstack && ./setup --team`"

如果选择 B：说明“好的，vendored 副本的更新由你自行负责。”

无论选择如何，都始终运行：
```bash
eval "$(~/.claude/skills/gstack/bin/gstack-slug 2>/dev/null)" 2>/dev/null || true
touch ~/.gstack/.vendoring-warned-${SLUG:-unknown}
```

如果标记已存在，则跳过。

如果 `SPAWNED_SESSION` 为 `"true"`，则表示你正在由 AI 编排器（例如 OpenClaw）创建的会话中运行。在创建的会话中：
- 不要对交互式提示使用 AskUserQuestion。自动选择推荐的选项。
- 不要运行升级检查、遥测提示、路由注入或 lake 介绍。
- 专注于完成任务，并通过自然语言输出报告结果。
- 以完成报告结束：说明已交付的内容、做出的决策以及任何不确定之处。

## 工件同步（技能启动时）

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

> gstack 可以将你的构建产物（CEO 计划、设计、报告）发布到一个私有 GitHub 仓库，GBrain 会在不同机器之间为其建立索引。你希望同步多少内容？

选项：
- A) 所有允许列表中的内容（推荐）
- B) 仅构建产物
- C) 拒绝，同步内容全部保留在本地

回答后：

```bash
# Chosen mode: full | artifacts-only | off
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode <choice>
"$_BRAIN_CONFIG_BIN" set artifacts_sync_mode_prompted true
```

如果选择 A/B 且 `~/.gstack/.git` 不存在，请询问是否运行 `gstack-artifacts-init`。不要阻塞 skill。

在 skill 结束时、遥测之前：

```bash
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --discover-new 2>/dev/null || true
"$HOME/.claude/skills/gstack/bin/gstack-brain-sync" --once 2>/dev/null || true
```


## 特定模型的行为补丁（claude）

以下提示针对 claude 模型系列进行了调整。它们服从 skill 工作流、停止点、AskUserQuestion 门、计划模式安全措施以及 /ship 审查门。如果以下提示与 skill 指令冲突，以 skill 为准。将这些内容视为偏好，而非规则。

**待办列表规范。** 执行多步骤计划时，每完成一项任务就单独将其标记为完成。不要在最后批量完成。如果某项任务后来变得不必要，请将其标记为跳过，并附上一行原因。

**执行高风险操作前先思考。** 对于复杂操作（重构、迁移、非简单的新功能），在执行前简要说明你的方案。这样用户可以在成本较低时调整方向，而不是等到执行过程中才调整。

**优先使用专用工具，而不是 Bash。** 优先使用 Read、Edit、Write、Glob、Grep，而不是对应的 shell 命令（cat、sed、find、grep）。专用工具成本更低，也更清晰。

## 语气

直接、具体，面向构建者。说清文件、函数、命令以及对用户可见的影响。不要填充内容。

不要使用破折号。不要使用 AI 术语：delve、crucial、robust、comprehensive、nuanced、multifaceted。绝不使用企业化或学术化表达。使用简短段落。以接下来要做什么结尾。

用户掌握你不了解的上下文。跨模型一致性只是建议，不是决定。由用户决定。

## 完成状态协议

完成 skill 工作流时，使用以下状态之一报告：
- **DONE** — 已完成，并提供证据。
- **DONE_WITH_CONCERNS** — 已完成，但列出注意事项。
- **BLOCKED** — 无法继续；说明阻塞原因以及已尝试的操作。
- **NEEDS_CONTEXT** — 缺少信息；准确说明需要哪些信息。

在 3 次尝试失败、对安全敏感的更改存在不确定性，或无法验证范围时升级处理。格式：`STATUS`、`REASON`、`ATTEMPTED`、`RECOMMENDATION`。

## 操作性自我改进

完成前，检查本次会话并记录所有可长期复用的经验。此步骤始终执行，不以是否觉得发现了值得记录的内容为条件（#2402：44 条经验中有 43 条来自明确的 /learn，因为有人将“如果你发现了”理解成了可选步骤）。可长期复用的经验包括项目特有行为、命令修复、容易踩坑的地方，或能在未来会话中节省 5 分钟以上的模式。如果检查确实没有发现任何经验，请在完成摘要中写明“No durable learnings this session”，这是明确的空结果，而不是跳过该步骤。

```bash
~/.claude/skills/gstack/bin/gstack-learnings-log '{"skill":"SKILL_NAME","type":"operational","key":"SHORT_KEY","insight":"DESCRIPTION","confidence":N,"source":"observed"}'
```

不要记录显而易见的事实或一次性的暂时性错误。

## Telemetry（最后运行）

工作流完成后，记录遥测数据。使用 frontmatter 中的 skill `name:`。OUTCOME 是 success/error/abort/unknown。

**PLAN MODE EXCEPTION — ALWAYS RUN：**此命令会将遥测数据写入
`~/.gstack/analytics/`，与前置步骤中的 analytics 写入位置一致。

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
否则使用空字符串 ""；如果 outcome 为 error，则将 `FAILED_STEP` 替换为发生
失败的步骤名称或编号；否则使用空字符串 ""。

## Plan Status Footer

运行计划审查的 Skills（`/plan-*-review`、`/codex review`）会在 skill 末尾包含 EXIT PLAN MODE GATE 阻塞检查清单，用于在调用 ExitPlanMode 前验证计划文件是否以 `## GSTACK REVIEW REPORT` 结尾。未运行计划审查的 Skills（如 `/ship`、`/qa`、`/review` 等操作型 skills）通常不会在计划模式下运行，也没有需要验证的审查报告；此页脚对它们不执行任何操作。在计划模式下唯一允许的编辑是写入计划文件。

# make-pdf：从 Markdown 生成出版质量的 PDF

将 `.md` 文件转换为具有 Faber & Faber 随笔风格的 PDF：1 英寸页边距、
正文左对齐、全文使用 Helvetica、弯引号和 em dash，可选封面页和可点击的目录，
并可在需要时添加对角线 DRAFT 水印。
从 PDF 复制粘贴时会得到整洁的文字，绝不会出现 “S a i l i n g”。

在 Linux 上，安装 `fonts-liberation` 以确保正确渲染——默认情况下系统中不存在 Helvetica
和 Arial，而 Liberation Sans 是符合标准度量的回退字体。CI 和 Docker 构建会通过 Dockerfile.ci
自动安装它。

Emoji 需要彩色 Emoji 字体。macOS（Apple Color Emoji）和 Windows（Segoe UI
Emoji）自带此类字体；大多数 Linux 发行版和容器都不自带，因此 Emoji 会渲染为空框（▯）。`./setup` 会在 Linux
上自动安装 `fonts-noto-color-emoji`（通过 apt/dnf/pacman/apk，尽力而为），打印 CSS 则会依次回退到 Apple /
Segoe / Noto Emoji 字体族。设置 `GSTACK_SKIP_FONTS=1` 可跳过安装（适用于没有 sudo 权限的 CI、受管控或离线机器）。

## 核心模式

### 80% 的场景 — 备忘录/信函

一条命令，无需参数。默认生成带页眉、页码和 CONFIDENTIAL 页脚的整洁 PDF。

```bash
$P generate letter.md                 # writes /tmp/letter.pdf
$P generate letter.md letter.pdf      # explicit output path
```

### 出版模式 — 封面 + 目录 + 章节分页

```bash
$P generate --cover --toc --author "Garry Tan" --title "On Horizons" \
  essay.md essay.pdf
```

Markdown 中每个顶级 H1 都会从新页面开始。对于碰巧包含多个 H1 的备忘录，可使用
`--no-chapter-breaks` 禁用此行为。

### 草稿阶段水印

```bash
$P generate --watermark DRAFT memo.md draft.pdf
```

每一页都会显示斜向、10% 不透明度的 DRAFT。草稿定稿后，移除该参数并重新生成。

### 通过预览快速迭代

```bash
$P preview essay.md
```

使用相同的打印 CSS 渲染 HTML，并在浏览器中打开。编辑 Markdown 时刷新页面。
在准备好之前，可以跳过生成 PDF 的往返过程。

### 无品牌标识（无 CONFIDENTIAL 页脚）

```bash
$P generate --no-confidential memo.md memo.pdf
```

### 图表 — mermaid 和 excalidraw 围栏会渲染为图片

Markdown 中位于第 0 列的 ` ```mermaid ` 或 ` ```excalidraw ` 围栏会渲染为清晰的矢量图表，完全离线运行（使用内置 bundle，不依赖 CDN）。缩进的围栏（列表中的围栏）会按设计保留为普通代码块。围栏内容损坏时，会显示包含解析错误的可见红色诊断块——绝不会静默显示原始代码。

围栏信息字符串选项：

```
```mermaid title="Auth flow"        ← caption + aria-label
```mermaid render=false             ← keep it as a code block (today's behavior)
```mermaid page=landscape           ← force this diagram onto a landscape page
```mermaid page=portrait            ← veto auto-landscape for this diagram
```

` ```excalidraw ` 围栏包含完整的 .excalidraw 场景文件（即
excalidraw.com 保存的文件）。从英文创作新图表是 `/diagram` 的职责——它会生成一组三件套，可编辑（源文件、.excalidraw 和 SVG/PNG），并与此 skill 配合使用：将 `.mmd` 源文件嵌入 Markdown，而不是 PNG。

### 图片 — 正确缩放，绝不截断

本地图片会自动内联（相对路径以 Markdown 文件所在目录为基准解析）。每张图片都会限制在内容框范围内——绝不发生截断。超大的照片会缩小到打印分辨率（300dpi），从而在不产生可见质量损失的情况下保持较小的载荷。

默认情况下，远程（http/https）图片会被**阻止并显示可见占位符**——这是离线优先的设计；传入 `--allow-network` 可获取这些图片。解析结果位于 Markdown 所在目录之外的图片（即使是通过符号链接解析到目录之外）仍会被内联，但会发出醒目警告；`--strict` 会使其成为致命错误。大小超过 64MB 的文件或非普通文件（FIFO、设备文件）会降级为占位符，而不是导致运行过程挂起。

图像后紧接着书写的单图指令：

```text
![chart](data.png){width=full}      ← stretch to content-box width
![chart](data.png){width=50%}       ← percentage or 3in/8cm/200px
![wide](arch.png){page=landscape}   ← give it its own landscape page
![wide](shot.png){page=portrait}    ← veto auto-landscape
```

宽幅、小字号的图表图像会自动单独放置到横向页面中  
（采用保守判断：宽高比 ≥ 1.8，宽度超过内容框约 2.5 倍，并且包含图表类替代文字 — diagram/architecture/flowchart/chart/graph）。自动提升后的页面内容会垂直居中。当启发式判断错误时，`{page=portrait}` 可覆盖该行为；如果未能自动识别，只需使用 `{page=landscape}`。

### 其他格式 — 单文件 HTML 和 Word

```bash
$P generate readme.md out.html --to html    # ONE self-contained file: inline
                                            # SVG diagrams, data-URI images,
                                            # zero network refs, screen-readable
$P generate readme.md out.docx --to docx    # Word: content fidelity (headings,
                                            # tables, code, diagrams as PNG) —
                                            # layout is Word's, not ours
```

`--to` 是输出格式。`--format` 完全是另一回事（`--page-size` 的别名）——不要将两者混淆。

### CI 模式 — 缺少资源时明确失败

```bash
$P generate docs.md --strict     # missing, remote, out-of-tree, oversized,
                                 # and non-regular-file images exit non-zero
                                 # instead of warn + placeholder
```

## 常用标志

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

## Claude 应运行它的情况

留意将 markdown 转换为 PDF 的意图。出现以下任一模式 → 运行 `$P generate`：

- “你能把这个 markdown 制作成 PDF 吗”
- “将其导出为 PDF”
- “把这封信转换成 PDF”
- “我需要这篇文章的 PDF”
- “帮我将其打印为 PDF”

如果用户打开了一个 `.md` 文件，并说“让它看起来更漂亮”，建议使用
`$P generate --cover --toc`，并在运行前询问确认。

## 调试

- 输出看起来为空白 → 检查 browse 守护进程是否正在运行：`$B status`。
- 复制粘贴时文本碎片化 → 这是 highlight.js 的输出（阶段 4）。待该标志可用后，使用
  `--no-syntax` 重试。目前，请移除围栏代码块并重新生成。
- Paged.js 超时 → 可能是 markdown 中没有标题。移除 `--toc`。
- 输出中出现“[remote image blocked]”占位符 → 添加 `--allow-network`
  （请注意，这会授予 markdown 文件从其图片 URL 获取内容的权限）。
- 生成的 PDF 过高或过宽 → 使用 `--page-size a4` 或 `--margins 0.75in`。

## 输出契约

```
stdout: /tmp/letter.pdf          ← just the path, one line
stderr: Rendering HTML...        ← progress spinner (unless --quiet)
        Generating PDF...
        Done in 1.5s. 43 words · 22KB · /tmp/letter.pdf

exit code: 0 success / 1 bad args / 2 render error / 3 Paged.js timeout
           / 4 browse unavailable
```

捕获路径：`PDF=$($P generate letter.md)` — 然后使用 `$PDF`。