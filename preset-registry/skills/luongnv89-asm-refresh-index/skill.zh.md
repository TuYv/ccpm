---
name: refresh-index
description: "Re-ingest every already-enabled repo in data/skill-index-resources.json: sync the working tree, run preindex, rebuild the catalog for verification, summarize updated/unchanged/failed/skipped, then gate commit + PR behind explicit confirmation. Use when asked to refresh the index, re-ingest indexed repos, or batch-maintain already-indexed skill sources. Don't use for adding new repos (use skill-index-updater), improving a single skill (use skill-auto-improver), or installing/updating skills on the local machine (use asm install or asm update)."
license: MIT
compatibility: Claude Code
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.0.0
  author: luongnv89
---
# 刷新索引

你正在刷新 ASM 精选 Skill 索引中所有已启用的仓库。目标是重新摄取每个源，使 `data/skill-index/{owner}_{repo}.json` 反映最新的上游状态，将每个仓库分类为**已更新 / 未更改 / 失败 / 已跳过**，验证目录仍可正常重建，并创建一个仅包含数据更改的 PR——在任何提交或推送之前，必须获得用户的明确确认。

这与 `skill-index-updater` 的作用相反。该 Skill 会根据用户提供的 URL **添加新仓库**。本 Skill 则会**刷新 `data/skill-index-resources.json` 中已经启用的仓库**。

## 编辑前同步仓库（强制）

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

如果缺少 `origin` 或发生 rebase 冲突，**请停止并询问用户**，然后再继续。绝不能静默覆盖对 `data/skill-index/` 或 `data/skill-index-resources.json` 的本地编辑。

## 前置条件

在进行任何摄取之前，逐项验证以下条件。如果任何一项失败，请停止并告知用户。

- `node` 和 `npm` 位于 PATH 中（`command -v node`、`command -v npm`）——`npm run preindex` 需要使用
- `asm` 位于 PATH 中（`command -v asm`）——摄取程序会间接调用它来执行 `asm eval`
- `gh` 位于 PATH 中且已完成身份验证（`gh auth status`）——创建 PR 时需要使用
- `git` 位于 PATH 中，且当前处于 ASM 仓库工作树内（`git rev-parse --show-toplevel`）
- 能够通过网络访问 `github.com`（每次摄取都会克隆上游仓库）

## 流程

按顺序执行以下步骤。每个步骤都有验证检查——如果检查失败，请勿继续。

### 第 1 步：枚举索引

读取 `data/skill-index-resources.json` 并将条目拆分为两个列表：

```bash
ROOT="$(git rev-parse --show-toplevel)"
RES="$ROOT/data/skill-index-resources.json"
```

使用 `jq`（或等效的 JSON 读取器）构建两个列表，并以 `source` 字符串（`github:owner/repo`）作为键，因为这是 `preindex` 在其日志行中输出的标识符：

- `enabled[]`——所有 `"enabled": true` 的仓库。这些仓库将被刷新。
- `disabled[]`——所有 `"enabled": false` 的仓库。这些仓库会预先归入**已跳过**类别，原因设为 `"disabled in skill-index-resources.json"`。

```bash
jq -r '.repos[] | select(.enabled == true)  | .source' "$RES"   # e.g. github:anthropics/skills
jq -r '.repos[] | select(.enabled == false) | .source' "$RES"
```

还需要为每个已启用的仓库派生磁盘文件键（`{owner}_{repo}`）——`data/skill-index/{owner}_{repo}.json` 正是以此命名：

```bash
jq -r '.repos[] | select(.enabled == true) | "\(.source)\t\(.owner)_\(.repo)"' "$RES"
```

验证：两个列表均非空（索引始终至少包含一个已启用的仓库和一个已禁用的自身引用）。此外，在重新摄取之前，还应验证现有的各仓库 JSON 均可解析——否则刷新操作会掩盖预先存在的损坏：

```bash
jq empty data/skill-index/*.json   # exits non-zero if any file is invalid
```

如果 `enabled[]` 为空或预验证失败，则停止——没有任何内容可以安全地刷新。

### 步骤 2：记录运行前的技能数量快照

重新摄取之前，记录每个已启用仓库当前的 `skillCount`。这样，步骤 7 就可以报告技能数量的变化。

```bash
mkdir -p /tmp/refresh-index
SNAPSHOT="/tmp/refresh-index/pre-snapshot.json"
echo "{}" > "$SNAPSHOT"
for entry in $(jq -r '.repos[] | select(.enabled == true) | "\(.owner)_\(.repo)"' "$RES"); do
  file="$ROOT/data/skill-index/${entry}.json"
  if [ -f "$file" ]; then
    count=$(jq -r '.skillCount // 0' "$file")
    jq --arg k "$entry" --argjson v "$count" '. + {($k): $v}' "$SNAPSHOT" > "$SNAPSHOT.tmp" && mv "$SNAPSHOT.tmp" "$SNAPSHOT"
  fi
done
```

如果某个仓库已启用但没有现有的索引文件，则将运行前的数量视为 `0`。随后，该仓库将在步骤 7 的**已更新**项中显示为正增量。

### 步骤 3：运行 `npm run preindex`

通过项目的 preindex 脚本重新摄取每个已启用的仓库。同时捕获标准输出和退出代码——如果任何仓库失败，`preindex` 会以状态码 1 退出，但**不要中止本次运行**。我们仍然需要部分结果，以便摘要能够显示哪些操作成功了。

```bash
LOG="/tmp/refresh-index/preindex.log"
cd "$ROOT"
set +e
npm run preindex 2>&1 | tee "$LOG"
PREINDEX_EXIT=$?
set -e
```

验证：日志文件存在，并且每个已启用的仓库都有一行，其格式为 `  {source} ... {N} skills`（成功）或 `  {source} ... FAILED: {error}`（失败），其中 `{source}` 与步骤 1 中的 `github:owner/repo` 字符串匹配。如果日志为空或没有任何一行匹配，则停止并报告错误。

### 步骤 4：对每个仓库进行分类

根据三个信号构建每个仓库的状态——preindex 日志、`data/skill-index/` 上的 `git diff`，以及步骤 1 中的 `disabled[]` 列表。

```bash
DIFF_FILES=$(git diff --name-only -- data/skill-index/ | sort -u)
```

对于每个已启用的仓库，通过其 `{source}` 字符串（`github:owner/repo`）匹配 preindex 日志行，并通过 `{owner}_{repo}` 查找磁盘上的文件：

| `preindex.log` 中的信号（每个 `{source}` 行） | `git diff` 中是否存在 `data/skill-index/{owner}_{repo}.json` | 分类                                             |
| -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| `  {source} ... N skills`                    | 是                                                         | **已更新**                                       |
| `  {source} ... N skills`                    | 否                                                         | **未更改**                                       |
| `  {source} ... FAILED: ...`                 | （任一情况）                                               | **失败**（捕获错误消息）                         |
| （没有此 `{source}` 对应的行）               | （任一情况）                                               | **失败**（记录为 `"no output from preindex"`）   |

对于每个 `disabled[]` 仓库：标记为 **skipped**，并注明禁用原因。

通过读取（可能已更新的）`data/skill-index/{owner}_{repo}.json`，记录每个仓库运行后的 `skillCount`。对于 **failed** 仓库，运行后的数量 = 运行前的数量（磁盘上的文件未发生变化）。

### 第 5 步：重新构建网站目录（仅用于验证）

运行目录构建，以确认刷新后的索引在结构上有效。**`website/catalog.json` 已被 git 忽略——绝不要暂存它。** 如果此步骤失败，说明数据文件内部不一致，该 PR 不得合入。

```bash
cd "$ROOT"
npx tsx scripts/build-catalog.ts
```

验证：脚本以状态码 0 退出，并且 `website/catalog.json` 是有效的 JSON（`jq empty website/catalog.json`）。如果失败，请停止流水线——在提交任何内容之前调查数据问题。

### 第 6 步：检测意外的差异范围

确认发生变化的只有预期文件——`data/skill-index/` 下各仓库的数据；以及仅当用户明确更新了顶层 `updatedAt` 时，才包括 `data/skill-index-resources.json`：

```bash
UNEXPECTED=$(git diff --name-only \
  | grep -v -E '^data/skill-index/' \
  | grep -v -E '^data/skill-index-resources\.json$' \
  || true)
if [ -n "$UNEXPECTED" ]; then
  echo "⚠ Unexpected files in diff:"
  printf '%s\n' "$UNEXPECTED"
  # stop and surface to user
fi
```

注意：`npm run preindex` **不会**修改 `data/skill-index-resources.json`——它只会写入 `data/skill-index/` 下各仓库对应的文件。只有当用户同时刷新顶层 `updatedAt` 时间戳时，资源文件才应该出现在差异中（此操作可选——除非用户要求，否则不要修改）。

如果出现意外文件（例如有人在 `src/` 或 `skills/` 中遗留了编辑），请停止并告知用户。不要提交混杂的变更。

### 第 7 步：输出四类汇总

按类别呈现 Markdown 表格，并包含技能数量变化。这是用户用来决定是否确认创建 PR 的内容。

```
## Refresh summary — N repos processed

### ✓ Updated (X)
| Repo | Before | After | Δ |
|------|--------|-------|---|
| anthropics/skills | 14 | 15 | +1 |
| obra/superpowers  | 22 | 22 |  0 |

### · Unchanged (Y)
| Repo | Skills |
|------|--------|
| owner1/repo1 | 7 |

### ✗ Failed (Z)
| Repo | Error |
|------|-------|
| owner2/repo2 | clone failed: 404 Not Found |

### ○ Skipped (W)
| Repo | Reason |
|------|--------|
| luongnv89/asm | disabled in skill-index-resources.json |
```

如果 `X + Y + Z + W` 不等于 `len(enabled) + len(disabled)`，则分类不一致——请停止并重新检查第 4 步，然后再继续。

### 第 8 步：确认关卡、提交和 PR

**未经用户明确确认，不得继续。** 输出差异统计并询问：

```bash
git diff --stat -- data/skill-index/ data/skill-index-resources.json
echo
echo "Ready to commit the files above and open a PR."
echo "Type 'yes' to continue, anything else to abort."
```

当输入 `yes` 时（且仅限 `yes`），仅暂存索引数据文件——绝不要暂存 `website/catalog.json`，也绝不要暂存 `data/skill-index/` 之外的任何内容——使用下方的约定式提交消息进行提交、推送并创建 PR：

```bash
git add data/skill-index/
# Only add the resources file if it was intentionally modified (e.g., updatedAt bump):
if git diff --name-only | grep -q '^data/skill-index-resources\.json$'; then
  git add data/skill-index-resources.json
fi

git commit -m "$(cat <<'EOF'
chore(index): refresh indexed skill sources

Re-ingested all enabled repos in data/skill-index-resources.json.

Updated: <X> repo(s)
Unchanged: <Y> repo(s)
Failed: <Z> repo(s)
Skipped: <W> repo(s)
EOF
)"

branch="$(git rev-parse --abbrev-ref HEAD)"
git push -u origin "$branch"

gh pr create --title "chore(index): refresh indexed skill sources" --body "$(cat <<'EOF'
## Summary
Re-ingested all enabled repos in `data/skill-index-resources.json` to bring the catalog up to date with upstream.

## Results
- **Updated:** <X> repo(s)
- **Unchanged:** <Y> repo(s)
- **Failed:** <Z> repo(s) (see body for details)
- **Skipped:** <W> repo(s) (disabled in resources file)

### Updated repos
| Repo | Before | After | Δ |
|------|--------|-------|---|
| ... | ... | ... | ... |

### Failed repos
| Repo | Error |
|------|-------|
| ... | ... |

## Test Plan
- [ ] `data/skill-index/*.json` files are valid JSON
- [ ] `npx tsx scripts/build-catalog.ts` rebuilds `website/catalog.json` without errors
- [ ] No files outside `data/skill-index/` and `data/skill-index-resources.json` are staged
- [ ] CI passes
EOF
)"
```

在运行 `gh pr create` 之前，使用步骤 7 中的实际数字填充 `<X>` / `<Y>` / `<Z>` / `<W>` 占位符以及各分类表格。

验证：`gh pr view --json url` 返回新 PR 的 URL。将其输出给用户。

## 边缘情况与错误处理

每一行都列出了一个条件、负责处理该条件的步骤以及所需的响应。当两行涉及同一条防护规则（绝不暂存 `website/catalog.json`；仅接受 `yes` 的门禁）时，请在每个操作点都遵守该规则——运行中途遗忘的代价是错误的推送。

| 条件                                                               | 响应                                                                                                                         |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **没有已启用的仓库**（`enabled[]` 为空）                                | 在步骤 1 中停止——没有需要刷新的内容。                                                                                             |
| **预先存在损坏的 `data/skill-index/*.json`**                      | 步骤 1 中的 `jq empty` 会发现它——在刷新掩盖问题之前停止。                                                                 |
| **`data/skill-index/` 中存在本地编辑**                         | 强制执行的编辑前 stash 会捕获这些编辑；如果运行后 pop 发生冲突，请按照 stash 代码块中的恢复提示操作并停止。 |
| **单个上游仓库无法访问**（404、短暂的网络故障）              | `preindex` 将其标记为 `FAILED` 并继续；它会归入**失败**。PR 仍会提交其余内容。                                 |
| **所有上游仓库均失败**（无网络、服务中断）                        | 每个仓库都会归入**失败**；差异为空；在步骤 8 之前停止——没有可提交的内容。                                       |
| **摄取产生的 `skillCount` 为零**（上游删除了所有 SKILL.md） | 将其视为具有负增量的**已更新**——这是一项值得提交的真实变更。                                                       |
| **`preindex` 在产生任何日志行之前出错**                               | 在步骤 3 中停止——这是环境问题，而非单个仓库的问题。提示运行 `npm install`，然后重试。                                                    |
| **`preindex` 以 1 退出并留下部分日志**                               | 继续执行步骤 4——部分结果仍然有用。                                                                           |
| **`build-catalog` 在 preindex 后失败**                                | 在步骤 5 中停止——索引内部不一致。提交前先调查问题。                                            |
| **`git status` 中出现 `website/catalog.json`**                              | 它已被 gitignore；如果 `.gitignore` 失效，请修复它。**绝不要执行 `git add website/catalog.json`。**                                       |
| **差异中出现非预期文件**（`src/`、`skills/` 中的 WIP）             | 在步骤 6 中停止——不要提交混合变更。要求用户还原这些变更，或在干净的分支上运行。                                  |
| **用户拒绝步骤 8 的门禁**                                       | 正常停止。将刷新后的文件留在工作树中供检查。不要对任何内容执行 `git checkout --`。                   |
| **`gh` 未经身份验证**                                              | 提示运行 `gh auth login`，然后重试步骤 8。                                                                                   |
| **`gh pr create` 失败**（身份验证、网络、缺少远程仓库）                | 输出已提交的 SHA，以便用户手动推送并创建 PR。                                                           |

## 清理

在 PR 创建后（或流水线中止后），移除临时产物：

```bash
rm -rf /tmp/refresh-index
```

保持工作树处于用户留下的状态。不要对用户未暂存的任何内容执行 `git checkout`。