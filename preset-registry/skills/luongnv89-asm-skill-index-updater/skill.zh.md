---
name: skill-index-updater
description: "Add GitHub skill repos to the ASM index: clone, audit, eval, regenerate index, rebuild catalog, open PR. Use when given GitHub URLs to onboard. Don't use for authoring (skill-creator), improving (skill-auto-improver), or install (asm install)."
license: MIT
compatibility: Claude Code
allowed-tools: Bash Read Write Edit Grep Glob WebFetch Agent
effort: high
metadata:
  version: 2.0.0
  author: luongnv89
---
# Skill 索引更新器

你正在向 ASM（Agent Skill Manager）精选索引添加新的 skill 仓库来源。这是驱动 skill 目录（https://luongnv.com/asm/）的流水线——你在此处添加的每个仓库都会被数千名用户发现并安装。

## 示例

```
User: add github.com/anthropics/skills to the index
Skill output:
  Step 1: Parsed 1 URL → anthropics/skills (NEW)
  Step 2: Discovered 14 SKILL.md files
  Step 3: Audit OK on 14/14, eval scores 71–94
  Step 6–8: data/skill-index-resources.json + data/skill-index/anthropics_skills.json updated, catalog rebuilt
  Step 10: PR #312 opened — feat(index): add anthropics/skills (14 skills)
```

## 编辑前同步仓库（强制）

在修改任何文件之前，拉取最新的远程分支：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作区不干净：先 stash，同步，然后 pop。如果缺少 `origin` 或发生冲突：停止操作并询问用户，然后再继续。

## 输入

用户会提供一个或多个 GitHub 仓库 URL。这些 URL 可以采用多种格式：

- `https://github.com/owner/repo`
- `github.com/owner/repo`
- `github:owner/repo`
- `owner/repo`（简写形式）

规范化所有输入，以提取 `owner` 和 `repo`。

## 流水线

按顺序执行以下步骤。每个步骤都有验证检查——如果验证失败，不要继续下一步。

你是**协调器**。第 2 步和第 3 步是主要工作步骤，需要将这两步委派出去：每个步骤都要说明其工作器所需的 `references/` 片段，并将该片段作为工作器的 `Input` 传入。在这两步中，你绝不能自行克隆仓库、读取 `SKILL.md` 或运行 `asm eval`，也绝不能打开两个契约文件——这些工作由工作器完成。（第 7 步的手动生成回退方案是唯一允许你直接调用 `asm eval` 的地方。）

**没有 Agent 工具？** 请优雅降级：自行读取 `references/discovery-contract.md` 和 `references/audit-eval-contract.md`，按顺序内联执行第 2 步和第 3 步，并在第 9 步摘要中说明这一点。流水线保持不变；改变的只是上下文成本。

### 第 1 步：解析并验证输入 URL

对于每个提供的 URL：

1. 从 URL 中提取 `owner` 和 `repo`
2. 通过检查 `https://api.github.com/repos/{owner}/{repo}`，验证仓库是否存在
3. 检查仓库是否已存在于 `data/skill-index-resources.json` 中——如果存在，则将其标记为**更新**，而不是**添加**

输出摘要表：

```
| # | Owner/Repo          | Status   | Notes                    |
|---|---------------------|----------|--------------------------|
| 1 | owner/repo          | NEW      | Will be added            |
| 2 | other/repo          | EXISTS   | Will be re-indexed       |
| 3 | bad/repo            | INVALID  | 404 - repo not found     |
```

如果所有仓库均无效，则停止并告知用户。

### 第 2 步：发现每个仓库中的 Skills（每个仓库一个工作器）

为每个有效仓库启动一个发现工作器，**在同一轮中启动，以便并发运行**。每个工作器的契约如下：

- 输入：`references/discovery-contract.md`，以及该仓库的 `owner` 和 `repo`
- 输出：该契约中规定的固定 JSON — `{owner, repo, tempRoot, clonePath, status, error, skills[]}`，每个仓库一个对象
- 不要自行读取 `references/discovery-contract.md`；由 worker 读取

保留每个 worker 的 `tempRoot` 和 `clonePath`：第 3 步针对克隆仓库运行，清理步骤会删除 `tempRoot`。你的 shell 中没有共享的 `$TEMP_DIR` —— 克隆操作是在各个 worker 中完成的。

报告每个仓库发现了多少个 skill。返回 `status: "no-skills"` 的仓库需要标记出来——询问用户是否仍要包含它（之后可能会添加 skill）。返回 `status: "clone-failed"` 的仓库将被跳过，并报告其 `error`；其他仓库继续处理。

### 第 3 步：审核并评估发现的 Skill（workers，每批一个）

每个仓库启动一个审核 worker——对于大型仓库，也可以每约 20 个 skill 为一批启动一个 worker——同样在同一轮中执行。每个 worker 的契约：

- 输入：`references/audit-eval-contract.md`、该仓库在第 2 步中的 `clonePath`，以及该批次的 `relPath` 列表
- 输出：该契约中规定的固定 JSON 数组——每个 skill 一个对象，`{relPath, name, auditStatus, notes[], overallScore, grade}`
- 不要自行读取 `references/audit-eval-contract.md`，并且任何 worker 都不重新克隆：它们针对第 2 步中的克隆仓库运行

#### 合并报告

合并各 worker 的 JSON——不要重新读取任何 skill 文件——整理成一个表格，让用户可以一目了然地看到质量和安全性：

```
Repo: owner/repo (N skills discovered)

  skill-name-1        OK     92 / A    name + description present, no security flags
  skill-name-2        WARN   58 / D    missing description
  skill-name-3        FLAG   71 / C    contains shell execution patterns (exec, spawn)
```

列：`audit status`、`eval overallScore / grade`、notes。

当前策略是**宽松的**——接受所有至少包含一个有效 skill（具有 name + description）的仓库。安全警告和较低的评估分数仅供参考，不会阻止纳入；它们用于帮助审核者做出知情判断。如果用户问“我们真的应该添加这个吗？”，请针对具体情况指出评估类别。未来版本可能会采用更严格的策略。

#### 评估结果的去向

第 7 步重新生成索引后，`data/skill-index/{owner}_{repo}.json` 中的每个 skill 条目都会新增两个派生字段：

- `tokenCount`：对 SKILL.md 正文的启发式 token 数量估算
- `evalSummary`：`{ overallScore, grade, categories[], evaluatedAt, evaluatedVersion }`

这些字段用于网站目录、TUI 和 `asm inspect` 中显示的“估算 tokens”和“评估分数”徽章。无需手动编辑——ingester 会在 `preindex` 过程中填充这些字段。

### 第 4 步：检查现有仓库以进行更新

对于已经存在于索引中的仓库（第 1 步中的 `EXISTS` 状态）：

1. 将现有索引文件（`data/skill-index/{owner}_{repo}.json`）与新发现的 skill 进行比较
2. 报告发生的变更：
   - 新增的 skill
   - 移除的 skill
   - 元数据已更新的 skill（版本、描述等）

在继续之前，请用户确认更新。

### 步骤 5：创建功能分支

仅当确实有新的仓库需要添加或现有仓库需要更新时才继续。

```bash
git checkout -b feat/index-add-{repo-names}
```

使用描述性分支名称。如果要添加多个仓库，请缩写为：`feat/index-add-multiple-repos-{date}`。

### 步骤 6：更新 skill-index-resources.json

对于每个新仓库，将一个条目添加到 `data/skill-index-resources.json` 的 `repos` 数组中：

```json
{
  "source": "github:{owner}/{repo}",
  "url": "https://github.com/{owner}/{repo}",
  "owner": "{owner}",
  "repo": "{repo}",
  "description": "{repo description from GitHub API}",
  "maintainer": "@{owner}",
  "enabled": true
}
```

同时将顶层的 `updatedAt` 时间戳更新为当前 ISO 日期。

### 步骤 7：生成索引文件

为每个仓库（新仓库和已更新仓库）生成索引 JSON 文件。如果可能，请使用项目内置的 `preindex` 脚本：

```bash
cd "$(git rev-parse --show-toplevel)"
npm run preindex
```

如果 `npm run preindex` 失败或耗时过长，则通过创建 `data/skill-index/{owner}_{repo}.json` 手动生成索引文件，结构如下：

```json
{
  "repoUrl": "https://github.com/{owner}/{repo}.git",
  "owner": "{owner}",
  "repo": "{repo}",
  "updatedAt": "{ISO timestamp}",
  "skillCount": N,
  "skills": [
    {
      "name": "skill-name",
      "description": "Skill description from frontmatter",
      "version": "0.0.0",
      "license": "",
      "creator": "",
      "compatibility": "",
      "allowedTools": [],
      "installUrl": "github:{owner}/{repo}:{relative/path/to/skill}",
      "relPath": "relative/path/to/skill",
      "tokenCount": 0,
      "evalSummary": {
        "overallScore": 0,
        "grade": "F",
        "categories": [
          { "id": "structure", "name": "Structure & completeness", "score": 0, "max": 10 }
        ],
        "evaluatedAt": "{ISO timestamp}",
        "evaluatedVersion": "0.0.0"
      }
    }
  ]
}
```

`installUrl` 的格式很重要——`asm install` 通过它定位 skill。对于单 skill 仓库（根目录下有 SKILL.md），省略路径部分。对于多 skill 仓库，请包含 skill 目录的相对路径。

如果需要手动生成，可以通过对每个 skill 目录调用 `asm eval <clonePath>/<relPath> --json` 来填充 `tokenCount` 和 `evalSummary` ——这两个值都来自该仓库步骤 2 worker 的结果；根目录级别的 skill 的 `relPath` 为空，因此其路径就是 `clonePath` ——然后将 `overallScore`、`grade`、`categories`、`evaluatedAt` 字段提取到 skill 条目中。如果 `preindex` 成功，ingester 会自动为你处理这些内容。

### 步骤 8：重新构建网站目录

运行目录构建脚本以重新生成 `website/catalog.json`：

```bash
npx tsx scripts/build-catalog.ts
```

验证输出：

- `website/catalog.json` 已更新
- skill 总数增加（如果只是更新，则保持不变）
- 构建输出中没有错误

### 步骤 9：验证所有内容

执行最终检查：

1. `data/skill-index-resources.json` 是有效的 JSON，并包含新增条目
2. 每个新增的 `data/skill-index/{owner}_{repo}.json` 都存在且是有效的 JSON
3. 这些索引文件中的每个技能条目都已填充 `tokenCount`（数字）和 `evalSummary`（包含 `overallScore`、`grade`、`categories` 的对象）——如果有任何字段缺失，请重新运行 `npm run preindex`，或按照步骤 7 中的说明手动填充
4. `website/catalog.json` 是有效的 JSON，并包含新增技能
5. `git diff --stat` 仅显示预期变更的文件

向用户报告摘要：

```
Added N new repo(s), updated M existing repo(s)
Total new skills indexed: X
Files changed: list of files

Ready to commit and create PR.
```

### 步骤 10：提交、推送并创建 PR

使用约定式提交格式暂存并提交：

注意：`website/catalog.json` 被 git 忽略，并由 CI（`deploy-website.yml`）在合并时重新构建。不要暂存它——只暂存 data 文件。

```bash
git add data/skill-index-resources.json data/skill-index/*.json
git commit -m "feat(index): add {owner}/{repo} to curated skill index"
```

对于多个仓库：

```bash
git commit -m "feat(index): add N new skill sources

Added:
- owner1/repo1 (X skills)
- owner2/repo2 (Y skills)
"
```

推送并创建 PR：

```bash
git push -u origin HEAD
gh pr create --title "feat(index): add {description}" --body "$(cat <<'EOF'
## Summary
- Added N new skill repository source(s) to the curated index
- Total new skills: X

### New Repos
| Repo | Skills | Description |
|------|--------|-------------|
| [owner/repo](url) | N | description |

### Audit Summary
All skills passed the lightweight audit. No critical security flags.

## Test Plan
- [ ] `data/skill-index-resources.json` is valid JSON
- [ ] Index files generated in `data/skill-index/`
- [ ] `website/catalog.json` rebuilt successfully
- [ ] CI passes
EOF
)"
```

## 边界情况与错误处理

每一行都说明一种情况、负责处理该情况的步骤以及所需的响应。如有疑问，应将问题告知用户，而不是静默丢弃仓库——审核策略是**宽松但透明**的。

| Condition                                                           | Response                                                                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Repo URL is a 404 / private repo**                                | Mark `INVALID` in the Step 1 table and skip; don't abort if other URLs are valid.                                                      |
| **Git clone fails**                                                 | The Step 2 worker returns `status: clone-failed`; skip that repo, report its `error`, continue with the others.                        |
| **Repo has zero SKILL.md files**                                    | The Step 2 worker returns `status: no-skills`; flag it and ask whether to include anyway (some repos seed empty and add skills later). |
| **Repo has 50+ SKILL.md files**                                     | Keep going, but warn about runtime — `asm eval` over many skills is slow.                                                              |
| **Repo already in index, unchanged**                                | Report `EXISTS, no diff` and skip index regeneration for that repo.                                                                    |
| **Repo already in index, breaking changes** (skill removed/renamed) | Show a diff in Step 4 and require explicit user confirmation before overwriting.                                                       |
| **`npm run preindex` missing or fails**                             | Fall back to manual generation per Step 7; do not block the PR.                                                                        |
| **`npx tsx scripts/build-catalog.ts` fails**                        | Stop in Step 8 — structural; a PR with a broken catalog must not land.                                                                 |
| **`gh` not authenticated**                                          | Prompt `gh auth login`; do not attempt to push without auth.                                                                           |
| **`gh pr create` fails** (auth, network, missing remote)            | Print the committed SHA so the user can push and open the PR manually.                                                                 |
| **Non-GitHub URL** (GitLab, Bitbucket)                              | Reject in Step 1 — this skill only indexes github.com.                                                                                 |
| **URL to a single skill subdirectory** (`.../tree/main/skills/foo`) | Treat as the parent repo URL; let the Step 2 worker pick up just that skill.                                                           |
| **Agent tool unavailable**                                          | Read both contract files yourself, run Steps 2 and 3 inline, and say so in the Step 9 summary.                                         |

## 清理

完成后，删除步骤 2 创建的每个临时目录。委派步骤 2 时，逐字使用每个 worker 返回的 `tempRoot`——克隆内容位于 worker 的临时目录中，因此你的 shell 中没有可供删除的 `$TEMP_DIR`。如果由于 Agent 工具不可用而在内联执行步骤 2，则 `mktemp -d` 创建的目录属于你自己：改为删除该目录。无论哪种情况，都不要从 `clonePath` 推导目标路径：

```bash
# one per repo, the tempRoot from that repo's Step 2 result
rm -rf "<tempRoot>"
```

## 参考资料

- `references/discovery-contract.md` — 步骤 2 worker 的工作范围：克隆、发现并将每个 SKILL.md 报告为固定 JSON（包括清理操作要删除的 `tempRoot`）
- `references/audit-eval-contract.md` — 步骤 3 worker 的工作范围：轻量审计 + `asm eval`，以固定 JSON 行返回