---
name: refresh-index
description: "Sync every enabled repo in the curated skill index and open a confirmation-gated PR. Use when refreshing already-indexed sources. Don't use for adding new repos, improving a single skill, or installing skills locally."
license: MIT
compatibility: "Claude Code"
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.1.0
  author: luongnv89
---
# 刷新索引

重新摄取 `data/skill-index-resources.json` 中每个已启用的仓库，使 `data/skill-index/{owner}_{repo}.json` 与上游保持一致。将每个仓库分类为 **已更新 / 未更改 / 失败 / 已跳过**，验证目录是否能够重新构建，然后在获得明确确认后仅提交一个数据变更 PR。

这是 `skill-index-updater` 的逆向操作（该 skill **会添加**仓库）。以 SKILL.md 为主干，并从 `references/` 加载步骤详情，以便控制 agent 的上下文预算。

## 使用时机

- 用户要求“刷新索引”“更新已索引的 skills”“同步目录”“重新摄取所有仓库”或“批量维护 skill 索引”
- 到了计划刷新的时间，或某个版本发布需要最新的上游 skill 元数据

以下情况**不要**触发：添加新仓库（`skill-index-updater`）、编写或改进单个 skill（`skill-creator`、`skill-auto-improver`）、发起上游 PR（`skill-upstream-pr`），或在本地机器上安装/更新 skills（`asm install`、`asm update`）。

## 编辑前同步仓库（必需）

在重新摄取任何内容之前，拉取最新的远程分支：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
dirty=0
if [ -n "$(git status --porcelain)" ]; then
  git stash push -u -m "pre-refresh-index: ${branch}"
  dirty=1
fi
git fetch origin
git pull --rebase origin "$branch"
if [ "$dirty" -eq 1 ]; then
  git stash pop || {
    echo "✗ Stash pop failed — recover with: git stash list && git stash show -p stash@{0}"
    exit 1
  }
fi
```

如果缺少 `origin` 或发生 rebase 冲突，**停止并询问用户**后再继续。绝不静默覆盖 `data/skill-index/` 或 `data/skill-index-resources.json` 中的本地编辑。

## 前置条件

在进行任何摄取之前逐项验证。任何一项失败都要停止并告知用户。

- `node` 位于 PATH 中（`command -v node`）——根据 `package.json` 的 engines 要求，Node >= 22
- `npm` 位于 PATH 中（`command -v npm`）——`npm run preindex` 所需
- `asm` 位于 PATH 中（`command -v asm`）——摄取器会传递调用 `asm eval`
- `gh` 位于 PATH 中且已完成身份验证（`gh auth status`）——创建 PR 所需
- `git` 位于 PATH 中，且当前位于 ASM 仓库工作树内（`git rev-parse --show-toplevel`）
- 可访问 `github.com` 的网络——每次摄取都会克隆上游仓库

## 流程

按顺序执行以下步骤。每一步都有验证检查——如果检查失败，不要继续。较长的脚本和模板位于 `references/` 中；到达相应步骤时读取所链接的文件。

### 第 1 步：枚举索引

读取 `data/skill-index-resources.json`，并以 `source` 字符串（`github:owner/repo`）为键拆分条目，因为这是 `preindex` 回显的标识符：

```bash
ROOT="$(git rev-parse --show-toplevel)"
RES="$ROOT/data/skill-index-resources.json"
jq -r '.repos[] | select(.enabled == true)  | .source' "$RES"
jq -r '.repos[] | select(.enabled == false) | .source' "$RES"
jq -r '.repos[] | select(.enabled == true) | "\(.source)\t\(.owner)_\(.repo)"' "$RES"
jq empty data/skill-index/*.json   # exits non-zero if any file is invalid
```

- `enabled[]` — `"enabled": true`. 这些仓库将被刷新。
- `disabled[]` — `"enabled": false`。这些仓库将以原因 `"disabled in skill-index-resources.json"` 归入 **skipped**。

验证：两个列表都不为空（索引始终至少包含一个启用的仓库和一个禁用的自引用），且现有的每个仓库 JSON 都可解析。如果 `enabled[]` 为空或预验证失败，则停止。

### 步骤 2：记录运行前的 skill 数量

记录每个启用仓库当前的 `skillCount`，以便步骤 7 报告变化量。运行 `references/snapshot.md` 中的循环。缺少索引文件时，将运行前数量记为 `0`。

### 步骤 3：运行 `npm run preindex`

重新摄取每个启用的仓库。捕获 stdout 和退出代码 — 如果任一仓库失败，`preindex` 将以 1 退出，但**不要中止**。部分结果仍应进行分类。

```bash
LOG="/tmp/refresh-index/preindex.log"
cd "$ROOT"
set +e
npm run preindex 2>&1 | tee "$LOG"
PREINDEX_EXIT=$?
set -e
```

验证：日志存在，并且每个启用仓库各有一行：`  {source} ... {N} skills` 或 `  {source} ... FAILED: {error}`。如果日志为空或没有任何匹配的行，则停止 — 这是环境问题，而不是单个仓库失败。

### 步骤 4：为每个仓库分类

将每个 `{source}` 日志行与 `data/skill-index/{owner}_{repo}.json` 在 `git diff` 中的变更进行匹配。阅读 `references/classify.md` 了解四行信号表。记录运行后的 `skillCount`；失败的仓库保留运行前的数量。

### 步骤 5：重建网站目录（仅用于验证）

确认刷新后的索引在结构上有效。**`website/catalog.json` 被 git 忽略 — 永远不要暂存它。**

```bash
cd "$ROOT"
npx tsx scripts/build-catalog.ts
jq empty website/catalog.json
```

验证：两个命令都以 0 退出。如果任一命令失败，则停止 — 数据文件内部不一致，PR 不得合并。

### 步骤 6：检测意外的变更范围

确认发生变更的文件仅位于 `data/skill-index/` 下（且仅当用户明确更新了 `updatedAt` 时，才允许包含 `data/skill-index-resources.json`）：

```bash
UNEXPECTED=$(git diff --name-only \
  | grep -v -E '^data/skill-index/' \
  | grep -v -E '^data/skill-index-resources\.json$' \
  || true)
if [ -n "$UNEXPECTED" ]; then
  echo "⚠ Unexpected files in diff:"
  printf '%s\n' "$UNEXPECTED"
fi
```

`npm run preindex` **不会**修改 `data/skill-index-resources.json`。如果出现意外文件，则停止。不要提交混合变更。

### 步骤 7：打印四类汇总

渲染 `references/summary-template.md` 中的 Markdown。如果 `X + Y + Z + W` 不等于 `len(enabled) + len(disabled)`，则停止并重新检查步骤 4。

### 步骤 8：确认门禁、提交和 PR

**未经用户明确确认（仅接受** `yes` **）不得继续**。阅读 `references/commit-and-pr.md`，了解 diff-stat 提示、约定式提交消息以及 `gh pr create` 正文。**仅**暂存 `data/skill-index/`（以及有意修改的资源文件）。永远不要暂存 `website/catalog.json`。

验证：`gh pr view --json url` 返回新 PR 的 URL。将其打印回用户。

## 步骤完成报告

每个步骤完成后输出一个紧凑的状态块：

```
◆ Step N — [step name]
··································································
  [check 1]:         √ pass
  [check 2]:         × fail — [reason]
  Result:            PASS | FAIL | PARTIAL
```

使用 `√` 表示通过，使用 `×` 表示失败，使用 `—` 表示上下文。每个步骤的检查项：

- **仓库同步** — `branch up to date`、`stash restored (if dirty)`
- **步骤 1** — `enabled[] non-empty`、`disabled[] non-empty`、`per-repo JSON parseable`
- **步骤 2** — `snapshot written`
- **步骤 3** — `log exists`、`one line per enabled source`
- **步骤 4** — `every repo in exactly one bucket`、`totals add up`
- **步骤 5** — `build-catalog exit 0`、`catalog.json valid JSON`
- **步骤 6** — `diff scope contained`
- **步骤 7** — `summary printed`、`X+Y+Z+W matches list sizes`
- **步骤 8** — `user confirmed yes`、`PR URL returned`（如果用户拒绝，则跳过此状态块）

## 预期输出

成功运行时，验证以下所有内容：

1. **仓库已同步** — 分支已与 `origin` 保持最新；任何本地编辑都已暂存，并且已成功恢复。
2. **`npm run preindex` 已完成** — 已捕获退出代码；日志中可见每个仓库对应的行。
3. **四个分类均已填充** — 每个启用的仓库恰好归入 updated / unchanged / failed 之一，并且每个禁用的仓库都归入 skipped。总数相加正确。
4. **`npx tsx scripts/build-catalog.ts` 已成功执行** — `website/catalog.json` 已重建且为有效 JSON。**不得暂存。**
5. **差异范围受控** — `git diff` 中仅出现 `data/skill-index/*.json`（如果明确刷新，也可以包含 `data/skill-index-resources.json`）。
6. **用户已确认** — 在提交 + 推送之前已记录明确的 `yes`。
7. **PR 已创建** — 使用约定式提交标题（`chore(index): refresh indexed skill sources`），正文根据步骤 8 模板填写，并将 URL 返回给用户。

如果第 1–5 项中的任何一项失败，则**不要**继续执行此列表中的步骤 6–7。

## 验收标准

- 暂存的文件必须恰好位于 `data/skill-index/` 下（以及可选的 `data/skill-index-resources.json`）
- `website/catalog.json` 已作为检查项重建，且**未被暂存**
- 四个分类的总数等于 `len(enabled) + len(disabled)`
- 提交消息符合 `references/commit-and-pr.md` 中的模板
- `gh pr view --json url` 返回一个 URL

## 示例

假设有 2 个启用的仓库（其中一个新增了一个 skill）和 1 个禁用的自引用仓库，预期的输出摘要如下：

```
## Refresh summary — 3 repos processed

### ✓ Updated (1)
| Repo | Before | After | Δ |
|------|--------|-------|---|
| anthropics/skills | 14 | 15 | +1 |

### · Unchanged (1)
| Repo | Skills |
|------|--------|
| obra/superpowers | 22 |

### ○ Skipped (1)
| Repo | Reason |
|------|--------|
| luongnv89/asm | disabled in skill-index-resources.json |
```

## 边界情况

阅读 `references/edge-cases.md` 以获取完整列表（启用集合为空、上游不可访问、摄取内容为空、目录重建失败、用户拒绝确认、`gh` 未进行身份验证）。处理这些情况时不要导致程序崩溃；绝不要对用户未暂存的文件执行 `git checkout --`。

## 清理

PR 创建后（或流水线中止后），移除临时产物：

```bash
rm -rf /tmp/refresh-index
```

保持工作树为用户离开时的状态。不要对用户未暂存的任何内容执行 `git checkout`。

## 参考资料

- `references/snapshot.md` — 第 2 步技能数量快照循环
- `references/classify.md` — 第 4 步信号表（已更新 / 未更改 / 失败 / 已跳过）
- `references/summary-template.md` — 第 7 步四类 Markdown
- `references/commit-and-pr.md` — 第 8 步确认、提交和 PR 命令
- `references/edge-cases.md` — 边界情况和错误处理