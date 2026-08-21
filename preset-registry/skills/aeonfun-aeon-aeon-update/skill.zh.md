---
name: aeon-update
description: Pull framework updates from the upstream Aeon repo into this instance - 3-way merges canon's new commits into a PR, never clobbering operator config.
metadata:
  title: Aeon Update
  category: core
  var: ""
  tags:
    - dev
    - meta
  cron: "0 11 * * 1"
  mode: write
---
> **${var}** — 模式选择器；以空格分隔的令牌，顺序无关，全部可选：
> - **模式**（`sync` | `report`，默认为 `sync`）— `sync` 会创建一个包含框架变更的 PR；`report` 会计算差异并发送通知，不进行任何修改（试运行）。
> - **`repo=owner/name`** — 覆盖上游源仓库（否则从此实例的 `parent` 自动解析，解析失败时回退到 `aeonfun/aeon`）。
> - **`reset=<sha|fork-point>`** — 运行前，强制将已存储的基线设置为 `<sha>`（或与上游的合并基点）。用于恢复/回填。
>
> 空值 ⇒ 从自动解析的上游执行 **sync**。示例：`` · `report` · `repo=aeonfun/aeon` · `reset=fork-point`。

今天是 ${today}。这是舰队的**下游更新器**——与 `fork-fleet` 相对应。`fork-fleet` 从父仓库向*外*查看，寻找分叉中值得向*上*拉取的工作；此技能则在实例*内部*运行，将父仓库已经发布的框架变更向*下*拉取——包括新技能、脚本/测试工具修复、工作流和文档更新——并通过一个可供审查的 PR 提交这些变更。实例借此与 `aeonfun/aeon` 保持同步，无需手动执行 rsync 覆盖式变基。

## 运行原则

- **创建 PR，绝不推送到 `main`。** 每项框架变更都通过一个可供审查的 PR 发布。由操作员负责合并。
- **绝不覆盖操作员配置。** `aeon.yml`、`STRATEGY.md`、`soul/`、`memory/`、`output/`、`.mcp.json` 以及从 git 派生的目录清单均归实例所有。上游对它们的变更**会在 PR 正文中呈现以供手动审查**，绝不会写入工作树。
- **采用三方合并，而非盲目覆盖。** 如果操作员已经自定义了某个框架文件，当其本地编辑与上游编辑涉及不同区域时，系统会对其执行**自动合并**（真正的 `git merge-file` 三方合并，S6）；只有当双方修改了相同的行时，才会将其列为需要人工处理的**冲突**。这样，经过手动精简的工作流仍可持续接收上游不相关的修复，而无需每次运行都手动合并。
- **同步时保持静默。** 基线 == 上游 HEAD ⇒ 无需执行任何操作，也不发送通知。
- **基线就是水位线，并通过合并推进。** 新的基线 SHA 会写入 *PR 分支*，因此只有当操作员合并 PR 时，水位线才会向前推进。未解决的冲突会单独跟踪，因此推进基线绝不会悄无声息地丢弃它们。

---

## 步骤

### S0. 初始化并加载状态

```bash
mkdir -p memory/topics
[ -f memory/topics/aeon-update-state.json ] || echo '{"baseline_sha":null,"upstream":null,"last_run":null,"last_pr":null,"pending_conflicts":[]}' > memory/topics/aeon-update-state.json
```

读取 `memory/MEMORY.md` 以获取上下文，并扫描 `memory/logs/` 中最近约 3 天的内容——排除所有已经报告过的内容，避免重复运行时再次发送。读取状态文件：
- `BASELINE` = `.baseline_sha`（此实例上次同步到的上游提交）。
- `PENDING` = `.pending_conflicts`（在之前的运行中呈现为冲突、但尚未解决的文件）。

### S1. 解析 `${var}`

- 如果存在令牌 `report`（或 `dry`），则 `MODE` = `report`；否则为 `sync`。
- `REPO_OVERRIDE` = `repo=owner/name` 令牌的值（如果存在）。
- `RESET` = `reset=` 令牌的值（如果存在，可以是 `fork-point` 或 7-40 个字符的 SHA）。

### S2. 解析上游源

```bash
SELF=$(gh repo view --json nameWithOwner -q .nameWithOwner)
UPSTREAM="${REPO_OVERRIDE:-$(gh api "repos/${SELF}" --jq '.parent.full_name // empty')}"
[ -z "$UPSTREAM" ] && UPSTREAM="aeonfun/aeon"
```

如果 `UPSTREAM` == `SELF`，则此实例**就是**规范源——没有可供拉取的上游。将状态 `AEON_UPDATE_IS_UPSTREAM` 写入 `memory/logs/${today}.md`，**不要**发送通知，然后停止。

```bash
UP_DEFAULT=$(gh api "repos/${UPSTREAM}" --jq '.default_branch')
HEAD_SHA=$(gh api "repos/${UPSTREAM}/commits/${UP_DEFAULT}" --jq '.sha')
```

### S3. 建立 / 重置基线

- **`reset=fork-point`** → `BASELINE=$(gh api "repos/${UPSTREAM}/compare/${HEAD_SHA}...$(git rev-parse HEAD)" --jq '.merge_base_commit.sha')`。`reset=<sha>` → `BASELINE=<sha>`。立即持久化到状态中，然后继续。
- **首次运行（`BASELINE` 为 null 且没有 `reset`）：**新实例在创建分叉时已经包含规范源的全部内容，因此没有需要应用的增量——只需**锚定水位线**。设置 `baseline_sha = HEAD_SHA`，写入状态，记录 `AEON_UPDATE_BASELINE_SET`，发送单行通知（`baseline initialized at <head7>; future runs sync from here`），然后停止。（如果要回填自分叉点以来的所有内容，请使用 `reset=fork-point` 重新运行。）
- **`BASELINE` == `HEAD_SHA`：**已同步。重新验证 `PENDING`（S8），以防之前的冲突现已解决；更新状态，记录 `AEON_UPDATE_IN_SYNC`，不发送任何通知，然后停止。

### S4. 比较基线 → HEAD

```bash
gh api "repos/${UPSTREAM}/compare/${BASELINE}...${HEAD_SHA}" --jq '{
  ahead: .ahead_by, behind: .behind_by, status,
  commits: [.commits[]? | {sha: .sha[0:7], msg: (.commit.message | split("\n")[0]), date: .commit.author.date}],
  files:   [.files[]?   | {filename, status, previous_filename, additions, deletions}]
}' > /tmp/aeon-update-compare.json
```

错误处理：
- **404 / `status: "diverged"` 且没有合并基点**（基线不是 HEAD 的祖先——历史记录被重写或仓库不相关）：停止并记录 `AEON_UPDATE_BASELINE_UNREACHABLE`；通知操作人员使用 `reset=fork-point` 或 `reset=<sha>` 重新运行。
- 跨仓库比较最多返回 **300 个文件**；如果 `.files` 看起来被截断，请在报告中注明 `files_truncated=true`——操作人员可以在合并后再次运行，以获取其余内容。

### S5. 对变更文件进行分区

按路径对 `.files` 中的每个条目进行分类。如果文件路径匹配以下任一模式，则该文件归**操作人员所有**（仅展示，绝不自动写入）：

```
aeon.yml            STRATEGY.md         soul/**             memory/**
output/**           .mcp.json           .env*               aeon.db
skills.lock         eyebrowlock.json    catalog/*.json      .claude/**  (except .claude/skills/aeon/**)
apps/dashboard/outputs/**
```

其他所有文件均为**系统所有**（可作为自动应用的候选项）：`skills/**`、`scripts/**`、`bin/**`、`harness-adapter/**`、`.github/**`、`apps/**`（`apps/dashboard/outputs/**` 除外）、`CLAUDE.md`、`AGENTS.md`、`docs/**`、`.github/README.md`、`LICENSE`、`CHANGELOG.md`、`.gitignore`、`eyebrow.policy.json`，以及已跟踪的根目录辅助文件（`aeon`、...）。

`catalog/*.json` 和 `eyebrowlock.json` 在这里由 OPERATOR 所有，**只是**为了确保它们永远不会被盲目复制——它们会根据 S7 中同步的源文件**重新生成**，这才是协调它们的正确方式。

### S6. 对每个 OWNED 文件进行三方分类

创建一个工作区，并针对每个 OWNED 文件 `f`，获取上游的 HEAD 和 BASELINE blob：

```bash
WORK=$(mktemp -d)
fetch() { gh api "repos/${UPSTREAM}/contents/$1?ref=$2" --jq '.content' 2>/dev/null | base64 -d; }   # $1=path $2=ref
h() { sha256sum 2>/dev/null | cut -d' ' -f1; }
```

根据 `f` 的 `status` 及内容三方比较（本地当前版本、upstream@BASELINE、upstream@HEAD）决定其处置方式：

| `status` | 检查 | 处置方式 |
|----------|------|-------------|
| `added` | 本地不存在该路径 | **CLEAN-ADD**（写入 HEAD blob） |
| `added` | 本地存在该路径（发生冲突，例如仅存在于分叉中的 skill） | **CONFLICT** |
| `modified` | `sha256(local) == sha256(HEAD blob)` | 已同步 → **SKIP** |
| `modified` | `sha256(local) == sha256(BASELINE blob)`（operator 从未修改过它） | **CLEAN-UPDATE**（写入 HEAD blob） |
| `modified` | 其他情况（operator 自定义过它） | **3-WAY MERGE** → CLEAN-MERGE 或 CONFLICT（见下文） |
| `removed` | `sha256(local) == sha256(BASELINE blob)` | **CLEAN-DELETE**（`git rm`） |
| `removed` | 本地版本不同或不存在 | **CONFLICT**（如果已经不存在，则 → SKIP） |
| `renamed` | 按照上述规则，将其视为 `removed previous_filename` + `added filename` | 分别处理各部分 |

绝不要对 `<name>` 不存在于上游目录树中的 `skills/<name>/` 目录执行 CLEAN-DELETE——仅存在于分叉中的 skill 属于 operator 的工作成果，在结构上不得改动（上游的比较结果只能引用存在于上游的路径）。

此外，如果 `<name>` 当前在 operator 的 `aeon.yml` 中为 `enabled: true`（`grep -E "^  ${name}: *\{[^}]*enabled: true" aeon.yml`），也绝不要对 `skills/<name>/` 目录执行 CLEAN-DELETE——上游停用一个已被 operator 主动调度的 skill，正是 `validate-config.js` 的 skill 引用检查旨在捕获的情况，但该检查只会在 PR 合并**之后**运行；否则，PR 审查本身不会对此发出任何警告。应将此情况降级为 **CONFLICT**（原因：`enabled-skill-removed-upstream`），而不是将其删除——保留该目录，并由 S9 将其作为 PR 正文中一个单独且醒目的部分展示，而不是将其归入“Applied cleanly”或通用冲突列表。

**三方内容合并（仅限 OWNED 文件）。** 一个进入 `otherwise` 行的 `modified` 文件，意味着 operator 已偏离 BASELINE，*并且*上游也修改了该文件。不要就此放弃——大多数情况下，两组修改位于文件的不同部分（例如，operator 缩减了工作流的 `env:` 密钥块，而上游在其他位置提高了 `timeout` 并更新了重试循环），真正的三方合并可以无损地结合双方的修改。在声明冲突之前先尝试合并：

```bash
fetch "$f" "$BASELINE"  > "$WORK/base"    # upstream@BASELINE (the common ancestor)
fetch "$f" "$HEAD_SHA"  > "$WORK/head"    # upstream@HEAD (what to bring in)
cp "$f" "$WORK/local"                      # operator's current copy (ours)
if git merge-file -p --diff3 "$WORK/local" "$WORK/base" "$WORK/head" > "$WORK/merged.$$" 2>/dev/null; then
  disposition=CLEAN-MERGE   # exit 0 = disjoint hunks; the merged file carries BOTH edits - write it in S7
else
  disposition=CONFLICT      # exit >0 = the same lines changed on both sides; surface for a human as before
fi
```

`git merge-file` 仅在合并干净时退出并返回 `0`（操作者与上游修改了互不重叠的区域）；合并后的输出既保留操作者的自定义内容，又应用上游的更改。非零退出码意味着存在真正的重叠——将其保留为 **CONFLICT**，并与上游差异一起列出（S9）。**只有 OWNED 文件才会进行三方合并；OPERATOR 所有的路径始终只会被报告，绝不会写入。** 合并后的文件与任何写入的文件一样，都要接受 S7 YAML/JSON 解析检查——如果合并结果无法再被解析，则中止该文件的提交并将其恢复为 CONFLICT。

### S7. 在分支上应用 CLEAN 更改（仅限同步模式）

如果 `MODE == report`，则跳到 S9。否则：

```bash
BR="aeon-update/sync-$(echo "$HEAD_SHA" | cut -c1-7)"
git checkout -b "$BR"
```

写入每个 **CLEAN-ADD** / **CLEAN-UPDATE**（先执行 `mkdir -p "$(dirname f)"`，然后将 HEAD blob 写入 `f`），写入每个 **CLEAN-MERGE**（使用 S6 中合并后的文件 `$WORK/merged.$$` 覆盖现有的 `f`），并对每个 **CLEAN-DELETE** 执行 `git rm`。**CONFLICT** 和 **OPERATOR** 文件不会被改动——它们只会出现在 PR 正文中。（在下方“未应用任何 CLEAN 更改”的测试中，CLEAN-MERGE 视为一次干净应用。）

如果应用了任何 `skills/**` 路径，则从同步后的源文件重新生成派生目录（绝不从上游复制）：

```bash
bin/generate-skills-json && bin/generate-packs-json && bin/generate-skill-icons
node scripts/gen-agents-md.js || true
```

**为任何 NEWLY-ADDED skill 刷新 eyebrow 完整性锁。** 当某个现有 skill 的 `skills/<slug>/SKILL.md` 在 `eyebrowlock.json` 中没有对应的 `"discoveredFrom": "skills/<slug>/SKILL.md"` 条目时，`ci-skill-integrity` 会导致 PR 检查失败。该条目只能由 `eyebrow` 二进制文件生成，而此二进制文件**未预安装在本次运行环境中**——因此，新 skill 的 CLEAN-ADD 否则会使 PR 在落地时 CI 失败。获取该二进制文件（使用 `ci-skill-integrity.yml` 固定的版本——当前为 `alexverify/eyebrow` 的 `v0.4.1`），根据**固定的 SHA256** 验证发布资产（标签可变，且此操作在包含完整密钥的环境中运行），然后重新扫描：

```bash
EYEBROW_OK=0
EB=$(command -v eyebrow || true)
if [ -z "$EB" ]; then
  # SHA256-pin the release asset (trust-on-first-pin). The v0.4.1 tag is mutable -
  # a re-uploaded asset would otherwise be fetched AND executed in this run's full
  # secret env. Verify the tarball hash against the constant below BEFORE extract
  # or exec; a mismatch means the tag moved, so do NOT run it - fall through to the
  # fail-safe. Linux runner (ubuntu-latest) assumed; unknown arch => skip.
  case "$(uname -m)" in
    x86_64)        A=amd64; EB_SHA=f1b6b88f80565082dfc37e3b91d3579c87dc6aaf0de70874ef41f461f711a48c ;;
    aarch64|arm64) A=arm64; EB_SHA=a848055492dd545ad3f73890379098e103b5bed4f18009d81d3a4bbbf1f985b6 ;;
    *)             A=; EB_SHA= ;;
  esac
  TB="eyebrow_0.4.1_linux_${A}.tar.gz"
  if [ -n "$EB_SHA" ] && gh release download v0.4.1 -R alexverify/eyebrow -p "$TB" -D "$WORK/eb" 2>/dev/null; then
    GOT=$(sha256sum "$WORK/eb/$TB" | awk '{print $1}')
    if [ "$GOT" = "$EB_SHA" ]; then
      tar xzf "$WORK/eb/$TB" -C "$WORK/eb" 2>/dev/null \
        && EB=$(find "$WORK/eb" -type f -name eyebrow | head -1) && chmod +x "$EB" 2>/dev/null || true
    else
      echo "::warning::eyebrow $TB sha256 mismatch (got $GOT, pinned $EB_SHA) - tag moved, not executing"; EB=
    fi
  fi
fi
# Run with a SCRUBBED env (allowlist PATH+HOME only). eyebrow scan is a local
# file-hasher - it needs no secrets and no network - so denying it the run's
# secret env (GH_GLOBAL + provider/notify keys) means even a bad binary that
# slipped the SHA pin cannot read or exfiltrate them. If the scan fails, EYEBROW_OK
# stays 0 and the fail-safe below covers it.
[ -n "$EB" ] && env -i PATH="$PATH" HOME="$HOME" "$EB" scan --path . --lockfile eyebrowlock.json 2>/dev/null && EYEBROW_OK=1
```

**故障安全机制——保证即使没有二进制文件也能生成绿色 PR。** 如果 `EYEBROW_OK` 仍为 `0`（二进制文件不可用或扫描失败），并且本次运行包含任何针对 `skills/**` SKILL.md 的 **CLEAN-ADD**，则不要交付锁文件无法覆盖的 skill：从分支中还原每个这样的新 skill（`git rm -r --cached skills/<slug>`，并将其从工作树中移除），然后将其重新分类为 **CONFLICT**，原因为 `needs-eyebrowlock-scan`。S9 会向操作者显示确切命令（先运行 `eyebrow scan --path . --lockfile eyebrowlock.json`，然后提交）。对现有 skill 的 **CLEAN-UPDATE / CLEAN-MERGE** 无需重新扫描——`eyebrow verify` 允许内容发生变化（仅在出现新的出站主机或新的 CRITICAL 时失败），而且该 skill 已有锁条目。这是以放弃自动安装全新的上游 skill（这种情况很少见）为代价，确保绝不会合入红色 PR；该 skill 仍会到达，只是在 PR 中变成一个单行手动步骤。

然后验证配置：

```bash
node scripts/validate-config.js aeon.yml || echo "validate-config flagged (may be pre-existing drift; note, do not abort on it)"
```

如果**没有应用任何 CLEAN 变更**（每项上游变更都属于 CONFLICT 或 OPERATOR）：不要创建 PR。将所有变更汇总到报告中，记录 `AEON_UPDATE_MANUAL_ONLY`，然后转到 S10（通知操作者此次同步需要手动合并）。如果我们写入的文件导致 YAML/JSON 解析失败，则中止：`git checkout . && git checkout ${UP_DEFAULT} && git branch -D "$BR"`，以 `AEON_UPDATE_VALIDATION_FAILED` 退出，并通知操作者失败的文件。

### S8. 推进基线并协调冲突（在分支中）

重新计算 `PENDING`：对于本次运行中的每个 CONFLICT 文件以及每个先前的 `PENDING` 条目，仅当 `sha256(local) != sha256(HEAD blob)` 时才保留（即仍然确实存在差异）。删除其余条目（已解决）。**本次运行中通过 CLEAN-MERGE 应用的文件已得到解决——绝不能将其继续保留为 pending**（因为该文件仍保留着操作者的编辑，所以其 `sha256(local) != sha256(HEAD blob)`，但上游变更现已合入，因此简单判断会错误地将其永久保留；只有当*未来*的上游变更与操作者修改的行重叠时，经过三方合并的文件才会再次成为 CONFLICT）。同样，删除本次运行中通过 CLEAN-MERGE 或 CLEAN-UPDATE 应用的文件所对应的任何先前 PENDING 条目。例外：`enabled-skill-removed-upstream` 条目没有可供比较的 HEAD blob（该路径已在上游删除）——应在以下情况下将其视为已解决：该 skill 在操作者当前的 `aeon.yml` 中不再是 `enabled: true`（操作者已将其禁用，因此 CLEAN-DELETE 规则可在下次运行时应用），或者上游重新添加了同名路径（按照常规规则将其重新分类为 CONFLICT/modified 或 CLEAN-UPDATE）。

写入 `memory/topics/aeon-update-state.json`，并将其与同步变更**一起**提交，以便合并操作推进水位线：

```json
{
  "baseline_sha": "${HEAD_SHA}",
  "upstream": "${UPSTREAM}",
  "last_run": "${today}",
  "last_pr": null,
  "applied": { "added": N, "updated": N, "deleted": N },
  "pending_conflicts": [
    { "path": "scripts/foo.sh", "reason": "operator-customized", "upstream_commits": ["abc1234"] }
  ]
}
```

将 `baseline_sha` 推进到 HEAD，意味着无冲突的文件永远不会再次触发通知，而 `pending_conflicts` 会独立地将未解决的合并问题延续下去——因此它们会在每次运行时重新出现，直到操作员真正完成协调，并且也会被写入 PR 正文。（在 `report` 模式下，**不要**写入状态——试运行不会改变任何内容。）

### S9. 提交并创建 PR（同步模式；报告模式下跳过）

```bash
git add -A
git commit -F /tmp/aeon-update-commit.txt      # never inline the message with -m (backticks/`$()` in commit text get shell-substituted)
git push -u origin "$BR"
gh pr create --repo "$SELF" --base "$UP_DEFAULT" \
  --title "aeon-update: sync ${N_COMMITS} upstream commits (${BASE7}..${HEAD7})" \
  --body-file /tmp/aeon-update-pr-body.md
```

`/tmp/aeon-update-commit.txt`：
```
aeon-update: sync upstream ${BASE7}..${HEAD7}

${N_COMMITS} upstream commits from ${UPSTREAM}. ${N_APPLIED} files applied cleanly, ${N_CONFLICT} need manual review. Baseline advanced to ${HEAD7}.
```

PR 正文（`/tmp/aeon-update-pr-body.md`）——仅包含有内容的章节：
```markdown
## Upstream sync: `${UPSTREAM}` `${BASE7}..${HEAD7}`

**${N_COMMITS} commits** ({earliest date} → {latest date}) · **${N_APPLIED} applied** · **${N_CONFLICT} manual** · baseline → `${HEAD7}`.

### Applied cleanly
- **New skills:** `foo`, `bar`   _(regenerated catalogs + agents.md + skill-icons)_
- **Modified skills:** `baz`
- **Scripts / harness:** `scripts/notify.sh`, ...
- **Workflows:** `.github/workflows/...`
- **Auto-merged (3-way):** `.github/workflows/aeon.yml`, ...  _(your local customization kept; upstream's disjoint changes applied - review the merged hunks)_
- **Docs / other:** `docs/...`, `CLAUDE.md`, ...

### ⚠️ Currently-enabled skills removed upstream
For each CONFLICT with reason `enabled-skill-removed-upstream` (S6):
- `verdikta-hunter` — enabled in your `aeon.yml`, deleted upstream in {commit(s)}. **Not deleted here** so nothing breaks. Pick one: keep it as a fork-only skill going forward (nothing else to do), or disable it in `aeon.yml` to match upstream's current default set.

### Needs manual review (conflicts - your local copy diverges from upstream)
For each *other* conflict reason (`enabled-skill-removed-upstream` is covered above, don't duplicate it here): what upstream changed and why it wasn't auto-applied.
- `scripts/foo.sh` — you customized this locally; upstream changed it in {commits}. Upstream diff:
  ```diff
  {short upstream base..head diff for the file}
  ```

### Operator config changed upstream (not auto-applied - reconcile by hand)
- `aeon.yml` — upstream added skills / changed defaults: {summary}. Merge the new entries you want (keep your enable/schedule/model choices).
- `soul/…`, `STRATEGY.md` — {summary, if changed}

### Upstream commits
| SHA | Summary |
|-----|---------|
| abc1234 | ... |
```

获取 PR URL；将其写回分支状态文件中的 `last_pr`（修正该状态提交），以便合并后的水位标记记录其自身的 PR。

### S10. 记录日志并发送通知

追加到 `memory/logs/${today}.md` 的 `### aeon-update` 下：状态、`UPSTREAM`、`${BASE7}..${HEAD7}`、已应用/冲突数量、PR URL（或 `report`/`manual-only`），以及 `pending_conflicts` 数量。

**仅在有明确信号时通知**——如果存在 `soul/`，则匹配其表达风格。在存在 PR、有变更的报告或仅能手动处理的情况时发送通知；对于 `IN_SYNC` / 无任何内容的 `BASELINE_SET` 保持静默。通知不超过 4000 个字符：

```
*aeon-update — ${today}*
{verdict: "synced N commits → PR" | "N changes need manual merge" | "report: N commits behind"}

Upstream `${UPSTREAM}` is ${AHEAD} commits ahead. Applied ${N_APPLIED} cleanly, ${N_CONFLICT} need review.
{Top applied highlight: e.g. "new skill: `token-radar`; harness fix in run-harness"}
{If conflicts: "Manual: `aeon.yml` (new skills), `scripts/foo.sh` (local edit)"}

PR: {url}   (or "dry run — nothing changed")
```

传入 `--mute-key "aeon-update:${HEAD7}"`，这样已静音的同步不会针对同一个上游 HEAD 再次发出通知。

## 退出状态分类

| 代码 | 触发条件 | 是否通知 |
|------|------|--------|
| `AEON_UPDATE_OK` | 已创建 PR，且包含 ≥1 个无冲突文件（如有冲突，也会列在其中） | 是——提供 PR 链接 |
| `AEON_UPDATE_MANUAL_ONLY` | 上游仅更改了由操作员所有或存在冲突的文件——没有可无冲突应用的内容，也没有 PR | 是——提示需要手动处理 |
| `AEON_UPDATE_REPORT` | `report` 模式——已计算差异，但未进行任何变更 | 是——提供试运行摘要 |
| `AEON_UPDATE_IN_SYNC` | 基线已与上游 HEAD 相同 | 否（仅记录日志） |
| `AEON_UPDATE_BASELINE_SET` | 首次运行——已锚定水位线，未应用任何内容 | 发送单行通知 |
| `AEON_UPDATE_IS_UPSTREAM` | 此实例本身就是上游仓库 | 否（仅记录日志） |
| `AEON_UPDATE_BASELINE_UNREACHABLE` | 基线不是 HEAD 的祖先（历史已重写） | 是——要求提供 `reset=` |
| `AEON_UPDATE_VALIDATION_FAILED` | 已应用的文件导致 YAML/JSON 解析失败 → 分支已回滚 | 是——指出失败的文件 |

## 约束

- **绝不**推送到 `main`，也绝不自动写入由 OPERATOR 所有的路径（`aeon.yml`、`soul/`、`memory/`、`STRATEGY.md`、`.mcp.json`、`output/`）。
- **绝不**删除仅存在于分叉中的 skill，也**绝不**从上游复制 `catalog/*.json` / `eyebrowlock.json`——应重新生成它们。
- 在未通过 `pending_conflicts` 继续保留未解决冲突的情况下，**绝不**推进 `baseline_sha`。
- 跨仓库比较最多处理 300 个文件——记录 `files_truncated=true`，并让后续运行处理剩余文件。
- 无变更且已同步的运行结果是**正确的**，不是失败——它不会发送任何通知。

## 网络说明

每个网络调用都使用 `gh api`，它会通过 `GITHUB_TOKEN` 自动进行身份验证——不使用 `curl`，不使用 `./secretcurl`，不在命令行中使用 `$SECRET`，从而避免被 Bash 权限层拒绝，且除了默认的 `GITHUB_TOKEN` 之外不使用任何密钥。不存在不可逆的副作用：该 skill 唯一的变更操作，是针对本实例自己的仓库创建 PR，由操作员审查并合并。重试策略：遇到带有 `X-RateLimit-Remaining: 0` 的 `403` 时，等待 60 秒并重试一次；如果某个文件的 contents API 持续失败，则在报告中将其标记为 `UNREADABLE`，并继续执行部分同步，而不是中止整个运行。