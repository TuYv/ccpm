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
> **${var}** — 模式选择器；以空格分隔的标记，顺序无关，均为可选：
> - **mode** (`sync` | `report`，默认 `sync`) — `sync` 会通过 PR 提交框架变更；`report` 会计算差异并通知，不修改任何内容（试运行）。
> - **`repo=owner/name`** — 覆盖上游源仓库（否则从此实例的 `parent` 自动解析，回退到 `aeonfun/aeon`）。
> - **`reset=<sha|fork-point>`** — 在运行前强制将存储的基线设为 `<sha>`（或与上游的 merge-base）。用于恢复 / 回填。
>
> 空值 ⇒ 从自动解析的上游执行 **sync**。示例：`` · `report` · `repo=aeonfun/aeon` · `reset=fork-point`。

今天是 ${today}。这是该集群的**下游更新器**，是 `fork-fleet` 的对应工具。`fork-fleet` 从父级向*外*查找值得从分叉仓库向*上*拉取的工作；此 skill 则在实例*内部*运行，将父级已发布的框架变更向*下*拉取，包括新 skill、脚本/运行工具修复、工作流和文档更新，并以可审查的 PR 形式提交。它让实例能够持续与 `aeonfun/aeon` 保持同步，无需手动运行 rsync-overlay rebase。

## 运行原则

- **创建 PR，绝不直接推送到 `main`。** 每项框架变更都通过一个可审查的 PR 发布。由操作员合并。
- **绝不覆盖操作员配置。** `aeon.yml`、`STRATEGY.md`、`soul/`、`memory/`、`output/`、`.mcp.json` 和由 git 派生的目录清单归实例所有。上游对它们的变更会**在 PR 正文中提示以供人工审查**，绝不会写入工作树。
- **使用三方合并，不盲目覆盖。** 对于操作员已定制的框架文件，当本地编辑与上游编辑修改不相交的区域时，会自动合并（真正的 `git merge-file` 三方合并，S6）；仅当双方修改同一行时，才将其列为需要人工处理的**冲突**。这样，手动精简过的工作流仍能持续接收无关的上游修复，无需每次运行都手动合并。
- **同步时保持静默。** 基线 == 上游 HEAD ⇒ 无需处理，不发送通知。
- **基线是水位线，并通过合并推进。** 新的基线 SHA 写入*PR 分支*，因此水位线仅在操作员合并 PR 时才会推进。未解决的冲突会单独跟踪，因此推进基线绝不会悄然丢弃它们。

---

## 步骤

### S0. 初始化 + 加载状态

```bash
mkdir -p memory/topics
[ -f memory/topics/aeon-update-state.json ] || echo '{"baseline_sha":null,"upstream":null,"last_run":null,"last_pr":null,"pending_conflicts":[]}' > memory/topics/aeon-update-state.json
```

读取 `memory/MEMORY.md` 以了解上下文，并扫描 `memory/logs/` 最近约 3 天的内容——移除已报告的事项，避免重复运行时再次发送。读取状态文件：
- `BASELINE` = `.baseline_sha`（此实例上次同步到的上游提交）。
- `PENDING` = `.pending_conflicts`（先前运行中作为冲突提示、尚未解决的文件）。

### S1. 解析 `${var}`

- 如果存在标记 `report`（或 `dry`），则 `MODE` = `report`，否则为 `sync`。
- `REPO_OVERRIDE` = `repo=owner/name` 标记的值（如果存在）。
- `RESET` = `reset=` 标记的值（如果存在，`fork-point` 或 7-40 个字符的 SHA）。

### S2. 解析上游源

```bash
SELF=$(gh repo view --json nameWithOwner -q .nameWithOwner)
UPSTREAM="${REPO_OVERRIDE:-$(gh api "repos/${SELF}" --jq '.parent.full_name // empty')}"
[ -z "$UPSTREAM" ] && UPSTREAM="aeonfun/aeon"
```

如果 `UPSTREAM` == `SELF`，此实例**就是规范源**，无需从上游拉取任何内容。将状态 `AEON_UPDATE_IS_UPSTREAM` 写入 `memory/logs/${today}.md`，**不要**发送通知，然后停止。

```bash
UP_DEFAULT=$(gh api "repos/${UPSTREAM}" --jq '.default_branch')
HEAD_SHA=$(gh api "repos/${UPSTREAM}/commits/${UP_DEFAULT}" --jq '.sha')
```

### S3. 建立 / 重置基线

- **`reset=fork-point`** → `BASELINE=$(gh api "repos/${UPSTREAM}/compare/${HEAD_SHA}...$(git rev-parse HEAD)" --jq '.merge_base_commit.sha')`。`reset=<sha>` → `BASELINE=<sha>`。立即将其持久化到状态中，然后继续。
- **首次运行（`BASELINE` 为 null 且没有 `reset`）：** 新实例已经携带了规范源在 fork 时的全部内容，因此没有需要应用的差异，只需**锚定水位标记**。设置 `baseline_sha = HEAD_SHA`，写入状态，记录 `AEON_UPDATE_BASELINE_SET`，发送一行通知（`baseline initialized at <head7>; future runs sync from here`），然后停止。（如需回填 fork 点之后的所有内容，请使用 `reset=fork-point` 重新运行。）
- **`BASELINE` == `HEAD_SHA`：** 已同步。重新验证 `PENDING`（S8），以防先前的冲突现已解决，更新状态，记录 `AEON_UPDATE_IN_SYNC`，不发送通知，然后停止。

### S4. 比较基线 → HEAD

```bash
gh api "repos/${UPSTREAM}/compare/${BASELINE}...${HEAD_SHA}" --jq '{
  ahead: .ahead_by, behind: .behind_by, status,
  commits: [.commits[]? | {sha: .sha[0:7], msg: (.commit.message | split("\n")[0]), date: .commit.author.date}],
  files:   [.files[]?   | {filename, status, previous_filename, additions, deletions}]
}' > /tmp/aeon-update-compare.json
```

错误处理：
- **404 / `status: "diverged"` 且没有 merge base**（基线不是 HEAD 的祖先，表示历史被重写或仓库无关）：以 `AEON_UPDATE_BASELINE_UNREACHABLE` 状态停止；通知操作员使用 `reset=fork-point` 或 `reset=<sha>` 重新运行。
- 跨仓库比较最多返回 **300 个文件**；如果 `.files` 看起来被截断，请在报告中记录 `files_truncated=true` - 操作员可以在合并后再次运行，以获取剩余内容。

### S5. 划分变更文件

按路径对 `.files` 中的每个条目进行分类。如果文件路径匹配以下任一项，则该文件属于 **OPERATOR-owned**（只展示，不自动写入）：

```
aeon.yml            STRATEGY.md         soul/**             memory/**
output/**           .mcp.json           .env*               aeon.db
skills.lock         eyebrowlock.json    catalog/*.json      .claude/**  (except .claude/skills/aeon/**)
apps/dashboard/outputs/**
```

其他所有文件均属于 **OWNED**（可自动应用的候选文件）：`skills/**`、`scripts/**`、`bin/**`、`harness-adapter/**`、`.github/**`、`apps/**`（`apps/dashboard/outputs/**` 除外）、`CLAUDE.md`、`AGENTS.md`、`docs/**`、`.github/README.md`、`LICENSE`、`CHANGELOG.md`、`.gitignore`、`eyebrow.policy.json`，以及受跟踪的根目录辅助工具（`aeon`，...）。

`catalog/*.json` 和 `eyebrowlock.json` 在此处仅由 OPERATOR 所有，因此它们不会被盲目复制，而是根据 S7 中同步的源文件重新生成，这是协调它们的正确方式。

### S6. 对每个 OWNED 文件进行三方分类

设置工作区，然后针对每个 OWNED 文件 `f`，获取上游的 HEAD 和 BASELINE blob：

```bash
WORK=$(mktemp -d)
fetch() { gh api "repos/${UPSTREAM}/contents/$1?ref=$2" --jq '.content' 2>/dev/null | base64 -d; }   # $1=path $2=ref
h() { sha256sum 2>/dev/null | cut -d' ' -f1; }
```

根据其 `status` 以及内容三方比较（local-current 与 upstream@BASELINE、upstream@HEAD），决定 `f` 的处置方式：

| `status` | Test | Disposition |
|----------|------|-------------|
| `added` | 本地不存在该路径 | **CLEAN-ADD**（写入 HEAD blob） |
| `added` | 本地存在该路径（冲突，例如仅 fork 拥有的 skill） | **CONFLICT** |
| `modified` | `sha256(local) == sha256(HEAD blob)` | 已经同步 → **SKIP** |
| `modified` | `sha256(local) == sha256(BASELINE blob)`（operator 未修改过它） | **CLEAN-UPDATE**（写入 HEAD blob） |
| `modified` | 其他情况（operator 对其进行了自定义） | **3-WAY MERGE** → CLEAN-MERGE 或 CONFLICT（见下文） |
| `removed` | `sha256(local) == sha256(BASELINE blob)` | **CLEAN-DELETE**（`git rm`） |
| `removed` | 本地内容不同或不存在 | **CONFLICT**（或已经删除 → 如果不存在则 **SKIP**） |
| `renamed` | 按照上述规则，将其视为 `removed previous_filename` + `added filename` | 按各部分处理 |

绝不要 CLEAN-DELETE 一个 `skills/<name>/` 目录，除非 `<name>` 存在于上游的 tree 中。fork 专属的 skill 属于 operator 的工作内容，应保持其结构不变（上游的 compare 只能引用上游存在的路径）。

同样，绝不要 CLEAN-DELETE 一个 `skills/<name>/` 目录，前提是 operator 的 `aeon.yml` 中当前将 `<name>` 设置为 `enabled: true`（`grep -E "^  ${name}: *\{[^}]*enabled: true" aeon.yml`）。上游废弃一个 operator 已主动调度的 skill，正是 `validate-config.js` 的 skill-refs 检查用于捕获的情况，但只有在 PR 合并后才会执行；否则 PR 审查本身不会对此发出提示。将此情况降级为 **CONFLICT**（原因：`enabled-skill-removed-upstream`），而不是删除该目录；该目录会保留，S9 会将其作为 PR 正文中单独的醒目章节展示，而不是将其归入“Applied cleanly”或通用冲突列表。

**仅针对 OWNED 文件进行三方内容合并。** 一个进入 `otherwise` 行的 `modified` 文件意味着 operator 与 BASELINE 存在差异，同时上游也修改了该文件。不要因此放弃处理它：大多数情况下，两组修改位于文件的不同部分（例如，operator 缩小了工作流的 `env:` secrets 块，而上游在其他位置增加了 `timeout` 并修改了重试循环），真正的三方合并可以无损地组合两者的修改。在声明冲突之前先尝试合并：

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

`git merge-file` 仅在合并干净时才以 `0` 退出（operator 和 upstream 修改了不相交的区域）；合并后的输出会保留 operator 的定制内容，**并且**应用 upstream 的变更。非零退出意味着真实的重叠：将其保留为 **CONFLICT**，并在列表中附上 upstream diff（S9）。**仅 OWNED 文件会进行 3-way merge；OPERATOR-owned 路径始终只会被呈现，绝不会被写入。** 合并后的文件会接受与任何已写入文件相同的 S7 YAML/JSON 解析检查：如果合并生成的内容不再可解析，则中止对该文件的应用并将其恢复为 CONFLICT。

### S7. 在分支上应用 CLEAN 变更（仅 sync 模式）

如果 `MODE == report`，跳至 S9。否则：

```bash
BR="aeon-update/sync-$(echo "$HEAD_SHA" | cut -c1-7)"
git checkout -b "$BR"
```

写入每个 **CLEAN-ADD** / **CLEAN-UPDATE**（`mkdir -p "$(dirname f)"`，然后将 HEAD blob 写入 `f`），写入每个 **CLEAN-MERGE**（将 S6 中合并后的文件 `$WORK/merged.$$` 覆盖现有的 `f`），并对每个 **CLEAN-DELETE** 执行 `git rm`。**CONFLICT** 和 **OPERATOR** 文件*不得*触碰，它们仅进入 PR 正文。（在下方的“未应用任何 CLEAN”测试中，CLEAN-MERGE 计作一次干净应用。）

如果应用了任何 `skills/**` 路径，则从已同步的源重新生成派生目录（绝不从 upstream 复制它们）：

```bash
bin/generate-skills-json && bin/generate-packs-json && bin/generate-skill-icons
node scripts/gen-agents-md.js || true
```

**为任何新添加的 skill 刷新 eyebrow 完整性锁。** 当一个已存在 skill 的 `skills/<slug>/SKILL.md` 在 `eyebrowlock.json` 中没有对应的 `"discoveredFrom": "skills/<slug>/SKILL.md"` 条目时，`ci-skill-integrity` 会使 PR 失败。该条目只能由 `eyebrow` 二进制程序生成，而它在此次运行中**未预装**，因此新 skill 的 CLEAN-ADD 否则会使 PR CI 变红。从 `ci-skill-integrity.yml` 固定的**精确版本**获取该二进制程序，该版本应从工作流的 `alexverify/eyebrow/action@<sha> # vX.Y.Z` 行解析而来，以确保永不偏离 CI：硬编码版本会写入一个锁，而 CI 的（更新版）`eyebrow verify` 随后会将其视为漂移并拒绝，这正是 sync PR 反复变红的原因。在运行前，根据发布版本自身的 `checksums.txt` 验证下载的 tarball（与 action 使用的经校验安装方式相同），然后重新扫描：

```bash
EYEBROW_OK=0
EB=$(command -v eyebrow || true)
if [ -z "$EB" ]; then
  # Use the SAME eyebrow version ci-skill-integrity.yml pins, parsed from the
  # workflow's `alexverify/eyebrow/action@<sha> # vX.Y.Z` comment. A hardcoded
  # version silently drifts from CI (the lock this writes with an older binary
  # then fails CI's newer `eyebrow verify` as drift - the recurring sync red);
  # deriving it self-heals across action bumps. Fall back to v0.4.2 if unparsable.
  EBV=$(grep -oE 'alexverify/eyebrow/action@[0-9a-f]+ *# *v[0-9]+\.[0-9]+\.[0-9]+' .github/workflows/ci-skill-integrity.yml | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  EBV=${EBV:-v0.4.2}
  # Linux runner (ubuntu-latest) assumed; unknown arch => skip to the fail-safe.
  case "$(uname -m)" in
    x86_64)        A=amd64 ;;
    aarch64|arm64) A=arm64 ;;
    *)             A= ;;
  esac
  TB="eyebrow_${EBV#v}_linux_${A}.tar.gz"
  # Download the tarball + the release's checksums.txt and verify the tarball
  # against it BEFORE extract or exec (mirrors the action's checksum-verified
  # install). A tampered or moved asset fails the check, so we do NOT run it and
  # fall through to the fail-safe. --ignore-missing checks only the asset present.
  if [ -n "$A" ] && gh release download "$EBV" -R alexverify/eyebrow -p "$TB" -p checksums.txt -D "$WORK/eb" 2>/dev/null; then
    if (cd "$WORK/eb" && shasum -a 256 --check --ignore-missing --strict checksums.txt >/dev/null 2>&1); then
      tar xzf "$WORK/eb/$TB" -C "$WORK/eb" 2>/dev/null \
        && EB=$(find "$WORK/eb" -type f -name eyebrow | head -1) && chmod +x "$EB" 2>/dev/null || true
    else
      echo "::warning::eyebrow $TB failed checksums.txt verification - not executing"; EB=
    fi
  fi
fi
# Run with a SCRUBBED env (allowlist PATH+HOME only). eyebrow scan is a local
# file-hasher - it needs no secrets and no network - so denying it the run's
# secret env (GH_GLOBAL + provider/notify keys) means even a bad binary that
# slipped the checksum cannot read or exfiltrate them. If the scan fails, EYEBROW_OK
# stays 0 and the fail-safe below covers it.
[ -n "$EB" ] && env -i PATH="$PATH" HOME="$HOME" "$EB" scan --path . --lockfile eyebrowlock.json 2>/dev/null && EYEBROW_OK=1
```

**故障安全机制 - 在缺少二进制文件时保证 PR 通过。** 如果 `EYEBROW_OK` 仍为 `0`（二进制文件不可用或扫描失败），且本次运行包含任何 `skills/**` 下 `SKILL.md` 的 **CLEAN-ADD**，则不要交付锁文件无法覆盖的 skill：从分支中还原每个此类新 skill（`git rm -r --cached skills/<slug>` + 从工作树中删除），并将其重新分类为 **CONFLICT**，原因是 `needs-eyebrowlock-scan`。S9 使用精确的操作员命令展示它（`eyebrow scan --path . --lockfile eyebrowlock.json`，然后提交）。现有 skill 的 **CLEAN-UPDATE / CLEAN-MERGE** 无需重新扫描 - `eyebrow verify` 允许内容漂移（仅在出现新的出口主机或新的 CRITICAL 时失败），并且该 skill 已有锁文件条目。这是在自动安装全新的上游 skill（罕见）与绝不合入红色 PR 之间的权衡；该 skill 仍会到达，只是作为 PR 中的一行手动操作步骤。

然后验证配置：

```bash
node scripts/validate-config.js aeon.yml || echo "validate-config flagged (may be pre-existing drift; note, do not abort on it)"
```

如果**没有任何 CLEAN 变更被应用**（每个上游变更均为 CONFLICT 或 OPERATOR）：不要创建 PR。将所有变更纳入报告，记录 `AEON_UPDATE_MANUAL_ONLY`，并进入 S10（通知操作员该同步需要手动合并）。如果我们写入的文件导致 YAML/JSON 解析失败，则中止：`git checkout . && git checkout ${UP_DEFAULT} && git branch -D "$BR"`，以 `AEON_UPDATE_VALIDATION_FAILED` 退出，并通知包含失败文件的操作员。

### S8. 推进基线并协调冲突（在分支中）

重新计算 `PENDING`：对于本次运行中的每个 CONFLICT 文件**以及**每个先前的 `PENDING` 条目，仅当 `sha256(local) != sha256(HEAD blob)`（仍确实存在分歧）时才保留。其余均删除（已解决）。**本次运行中以 CLEAN-MERGE 应用的文件已解决 - 绝不能将其保留为 pending**（其 `sha256(local) != sha256(HEAD blob)`，因为它仍保留操作员的编辑，但上游变更已经合并，因此朴素的检测会错误地永久保留它；三方合并的文件仅在未来的上游变更与操作员的行重叠时才再次成为 CONFLICT）。同样，删除本次运行中以 CLEAN-MERGE 或 CLEAN-UPDATE 应用的文件对应的任何先前 PENDING 条目。例外：`enabled-skill-removed-upstream` 条目没有可比较的 HEAD blob（该路径已在上游删除）- 当操作员当前 `aeon.yml` 中该 skill 不再为 `enabled: true` 时，将其视为已解决（他们已禁用它，因此 CLEAN-DELETE 规则可在下次运行中应用）；或者当上游重新添加同名路径时，依据常规规则将其重新分类为 CONFLICT/modified 或 CLEAN-UPDATE。

写入 `memory/topics/aeon-update-state.json`，并将其**与**同步一同提交，以便合并能够推进水位线：

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

推进 `baseline_sha` 到 HEAD 意味着干净文件不会再次通知，而 `pending_conflicts` 会独立地将未解决的合并延续下去 - 因此它们会在每次运行时重新出现，直到操作员真正协调它们，并且也会写入 PR 正文。（在 `report` 模式下，**不要**写入状态 - dry run 不会变更任何内容。）

### S9. 提交并打开 PR（sync 模式；report 模式跳过）

```bash
git add -A
git commit -F /tmp/aeon-update-commit.txt      # never inline the message with -m (backticks/`$()` in commit text get shell-substituted)
git push -u origin "$BR"
gh pr create --repo "$SELF" --base "$UP_DEFAULT" \
  --title "aeon-update: sync ${N_COMMITS} upstream commits (${BASE7}..${HEAD7})" \
  --body-file /tmp/aeon-update-pr-body.md
```

`/tmp/aeon-update-commit.txt`:
```
aeon-update: sync upstream ${BASE7}..${HEAD7}

${N_COMMITS} upstream commits from ${UPSTREAM}. ${N_APPLIED} files applied cleanly, ${N_CONFLICT} need manual review. Baseline advanced to ${HEAD7}.
```

PR 正文（`/tmp/aeon-update-pr-body.md`）- 只包含有内容的章节：
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

捕获 PR URL；将它写回分支状态文件中的 `last_pr`（修订状态提交），这样合并后的水位标记会记录它自己的 PR。

### S10. 记录日志并通知

我先检查现有的 `aeon-update` 实现、日志格式和通知入口，确认今天的运行状态以及需要追加的字段，然后再按现有约定执行或补齐记录。追加到 `memory/logs/${today}.md` 的 `### aeon-update` 下：状态、`UPSTREAM`、`${BASE7}..${HEAD7}`、已应用/冲突计数、PR URL（或 `report`/`manual-only`），以及 `pending_conflicts` 计数。

**仅在有信号时通知**：如果存在 `soul/`，匹配其语气。在存在 PR、有变更的报告或仅需手动处理的情况下发送通知；对于 `IN_SYNC` / 没有任何内容的 `BASELINE_SET` 保持静默。长度不超过 4000 个字符：

```
*aeon-update — ${today}*
{verdict: "synced N commits → PR" | "N changes need manual merge" | "report: N commits behind"}

Upstream `${UPSTREAM}` is ${AHEAD} commits ahead. Applied ${N_APPLIED} cleanly, ${N_CONFLICT} need review.
{Top applied highlight: e.g. "new skill: `token-radar`; harness fix in run-harness"}
{If conflicts: "Manual: `aeon.yml` (new skills), `scripts/foo.sh` (local edit)"}

PR: {url}   (or "dry run — nothing changed")
```

传入 `--mute-key "aeon-update:${HEAD7}"`，这样被静音的同步不会针对同一个上游 HEAD 再次发送通知。

## 退出分类

| 代码 | 条件 | 通知 |
|------|------|------|
| `AEON_UPDATE_OK` | 已打开 PR，且至少有 1 个文件被干净应用（如有冲突，则在 PR 中列出） | 是 - PR 链接 |
| `AEON_UPDATE_MANUAL_ONLY` | 上游仅变更了操作员负责的文件或存在冲突的文件，没有干净应用，不创建 PR | 是 - 手动处理提示 |
| `AEON_UPDATE_REPORT` | `report` 模式 - 计算差异，不进行任何变更 | 是 - 试运行摘要 |
| `AEON_UPDATE_IN_SYNC` | 基线已等于上游 HEAD | 否（仅记录日志） |
| `AEON_UPDATE_BASELINE_SET` | 首次运行 - 锚定水位线，没有应用任何内容 | 发送一行通知 |
| `AEON_UPDATE_IS_UPSTREAM` | 此实例本身就是上游仓库 | 否（仅记录日志） |
| `AEON_UPDATE_BASELINE_UNREACHABLE` | 基线不是 HEAD 的祖先（历史被重写） | 是 - 要求提供 `reset=` |
| `AEON_UPDATE_VALIDATION_FAILED` | 某个已应用文件破坏了 YAML/JSON 解析 → 分支已回退 | 是 - 指出失败文件 |

## 约束

- **绝不**推送到 `main`，也不自动写入 OPERATOR-owned 路径（`aeon.yml`、`soul/`、`memory/`、`STRATEGY.md`、`.mcp.json`、`output/`）。
- **绝不**删除仅存在于 fork 中的 skill，也**绝不**从上游复制 `catalog/*.json` / `eyebrowlock.json` - 重新生成它们。
- **绝不**在未将未解决的冲突延续到 `pending_conflicts` 的情况下推进 `baseline_sha`。
- 跨仓库比较最多处理 300 个文件 - 标记 `files_truncated=true`，让后续运行继续处理剩余文件。
- 干净且同步的运行是**正确状态**，不是失败 - 不发送通知。

## 网络说明

每次网络调用都使用 `gh api`，它会自动通过 `GITHUB_TOKEN` 进行身份验证 - 不使用 `curl`、`./secretcurl`，不在命令行中传入 `$SECRET` 以免被 Bash 权限层拒绝，也不使用默认 `GITHUB_TOKEN` 之外的任何密钥。不存在不可逆的副作用：此 skill 唯一的变更是针对当前实例自身仓库创建 PR，由操作员审核并合并。重试策略：当 `403` 且 `X-RateLimit-Remaining: 0` 时，等待 60 秒后重试一次；如果某个文件的 contents API 持续失败，则在报告中将其标记为 `UNREADABLE`，并使用部分同步继续运行，而不是中止整个运行。