---
name: skill-index-updater
description: "Add GitHub skill repos to the ASM index: clone, audit, eval, regenerate index, rebuild catalog, open PR. Use when given GitHub URLs to onboard. Don't use for authoring (skill-creator), improving (skill-auto-improver), or install (asm install)."
license: MIT
compatibility: Claude Code
allowed-tools: Bash Read Write Edit Grep Glob WebFetch Agent
effort: high
metadata:
  version: 1.3.0
  author: luongnv89
---
# Skill 索引更新器

你正在向 ASM（Agent Skill Manager）精选索引添加新的 Skill 仓库源。该流水线为 https://luongnv.com/asm/ 上的 Skill 目录提供支持——你在此处添加的每个仓库都将可供数千名用户发现和安装。

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

如果工作树存在未提交的更改：先暂存更改，再进行同步，之后恢复暂存的更改。如果缺少 `origin` 或发生冲突：停止操作，并在继续之前询问用户。

## 输入

用户会提供一个或多个 GitHub 仓库 URL。这些 URL 可以采用多种格式：

- `https://github.com/owner/repo`
- `github.com/owner/repo`
- `github:owner/repo`
- `owner/repo`（简写）

规范化所有输入，以提取 `owner` 和 `repo`。

## 流水线

按顺序执行以下步骤。每个步骤都有验证检查——如果验证失败，不要继续执行下一步。

### 步骤 1：解析并验证输入 URL

对于提供的每个 URL：

1. 从 URL 中提取 `owner` 和 `repo`
2. 通过检查 `https://api.github.com/repos/{owner}/{repo}` 验证仓库是否存在
3. 检查该仓库是否已存在于 `data/skill-index-resources.json` 中——如果存在，则将其标记为**更新**而不是**添加**

输出汇总表：

```
| # | Owner/Repo          | Status   | Notes                    |
|---|---------------------|----------|--------------------------|
| 1 | owner/repo          | NEW      | Will be added            |
| 2 | other/repo          | EXISTS   | Will be re-indexed       |
| 3 | bad/repo            | INVALID  | 404 - repo not found     |
```

如果所有仓库均无效，请停止并告知用户。

### 步骤 2：发现每个仓库中的 Skill

对于每个有效仓库，将其克隆到临时目录，并扫描 SKILL.md 文件（最深 5 层）。这就是 ASM 工具内部所执行的操作，此处我们复现了该逻辑：

```bash
# Clone to temp
TEMP_DIR=$(mktemp -d)
git clone --depth 1 "https://github.com/{owner}/{repo}.git" "$TEMP_DIR/{repo}"

# Find SKILL.md files (max 5 levels deep, matching ASM's discoverSkills)
find "$TEMP_DIR/{repo}" -maxdepth 5 -name "SKILL.md" -type f
```

`discoverSkills`（由 `asm index ingest` 和预索引使用）会在存在**根目录** `SKILL.md` 时将其编入索引，**同时**继续扫描子目录以查找其他 Skill。同时包含根目录 Skill 和嵌套 Skill 的仓库应在索引条目中列出每个 Skill——而不只是根目录 Skill。

对于发现的每个 SKILL.md，解析 YAML frontmatter 以提取：

- `name`（必填）
- `description`（必填）
- `version`（默认为 "0.0.0"）
- `license`
- `creator`
- `compatibility`
- `allowed-tools` / `allowedTools`

报告每个仓库中发现的技能数量。如果某个仓库中 **没有任何** SKILL.md 文件，请将其标记出来，并询问用户是否仍要将其纳入（该仓库以后可能会添加技能）。

### 步骤 3：审计并评估发现的技能

对于每个发现的技能，执行两项检查——轻量级审计**以及**使用 `asm eval` 进行质量评估。两项检查都针对步骤 2 中的临时克隆运行；不要重新克隆。

#### 3a. 轻量级审计

1. **Frontmatter 完整性**：是否至少包含 `name` 和 `description`？
2. **内容检查**：SKILL.md 是否包含有实际意义的指令内容（而不只是 frontmatter）？
3. **安全扫描**：检查技能文件中是否存在可疑模式：
   - Shell 执行（`exec`、`spawn`、`child_process`、`bash -c`）
   - 网络访问（`curl`、`wget`、`fetch(`、`axios`）
   - 凭据模式（`API_KEY=`、`SECRET_KEY=`、`PASSWORD=`）
   - 混淆（`atob(`、base64 编码字符串、十六进制转义序列）

这是一项轻量级检查——完整的安全审计会在用户通过 `asm install` 安装各个技能时运行。此处的目标是在将仓库添加到精选索引之前发现明显的危险信号。

#### 3b. 使用 `asm eval` 进行质量评估

对每个发现的技能目录运行 `asm eval`，并获取 JSON 报告。这能在仓库进入索引**之前**为审核者提供质量信号（结构、描述、提示工程、安全性、可测试性、命名），以便他们尽早发现明显的质量问题：

```bash
asm eval "$TEMP_DIR/{repo}/{relPath}" --json
```

JSON 报告包含 `overallScore`（0-100）、字母 `grade`（A/B/C/D/F），以及包含各类别分数的 `categories[]` 数组。建立索引时无需重新运行评估——`npm run preindex`（步骤 7）会通过提取器调用评估器，并自动将 `evalSummary` + `tokenCount` 写入 `data/skill-index/{owner}_{repo}.json`。此处的显式运行仅用于提供**提交前可见性**。

#### 综合报告

将两项检查合并到一张表中，使用户能够一目了然地查看质量和安全性：

```
Repo: owner/repo (N skills discovered)

  skill-name-1        OK     92 / A    name + description present, no security flags
  skill-name-2        WARN   58 / D    missing description
  skill-name-3        FLAG   71 / C    contains shell execution patterns (exec, spawn)
```

列：`audit status`、`eval overallScore / grade`、备注。

当前策略是**宽松的**——接受所有至少包含一个有效技能（具有 name + description）的仓库。安全警告和较低的评估分数仅供参考，不会阻止纳入；它们的作用是帮助审核者做出知情判断。如果用户询问“我们真的应该添加这个吗？”，请根据评估类别指出具体情况。此策略在未来版本中可能会变得更加严格。

#### 评估结果最终位于何处

步骤 7 重新生成索引后，`data/skill-index/{owner}_{repo}.json` 中的每个技能条目都会新增两个派生字段：

- `tokenCount`：对 SKILL.md 正文 token 数量的启发式估算
- `evalSummary`：`{ overallScore, grade, categories[], evaluatedAt, evaluatedVersion }`

这些字段为网站目录、TUI 和 `asm inspect` 中显示的“预估 token 数”和“评估分数”徽章提供数据。无需手动编辑——提取器会在 `preindex` 过程中填充它们。

### 第 4 步：检查需要更新的现有仓库

对于索引中已存在的仓库（第 1 步中的 `EXISTS` 状态）：

1. 将现有索引文件（`data/skill-index/{owner}_{repo}.json`）与新发现的技能进行比较
2. 报告发生的变化：
   - 新增的技能
   - 已移除的技能
   - 元数据（版本、描述等）已更新的技能

在继续操作之前，请用户确认更新。

### 第 5 步：创建功能分支

仅当确实有新仓库需要添加或现有仓库需要更新时才继续。

```bash
git checkout -b feat/index-add-{repo-names}
```

使用描述清晰的分支名称。如果要添加多个仓库，请使用缩写形式：`feat/index-add-multiple-repos-{date}`。

### 第 6 步：更新 skill-index-resources.json

对于每个新仓库，在 `data/skill-index-resources.json` 的 `repos` 数组中添加一个条目：

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

同时，将顶层的 `updatedAt` 时间戳更新为当前 ISO 日期。

### 第 7 步：生成索引文件

为每个仓库（新增和更新的仓库）生成索引 JSON 文件。尽可能使用项目内置的 `preindex` 脚本：

```bash
cd "$(git rev-parse --show-toplevel)"
npm run preindex
```

如果 `npm run preindex` 失败或耗时过长，请手动创建具有以下结构的 `data/skill-index/{owner}_{repo}.json`，以生成索引文件：

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

`installUrl` 的格式非常重要——`asm install` 会通过它定位技能。对于单技能仓库（SKILL.md 位于根目录），请省略路径部分。对于多技能仓库，请包含技能目录的相对路径。

如果回退到手动生成方式，可以对每个技能目录调用 `asm eval <path> --json`，并将 `overallScore`、`grade`、`categories`、`evaluatedAt` 字段提取到技能条目中，以填充 `tokenCount` 和 `evalSummary`。当 `preindex` 成功运行时，提取器会自动为你处理这些内容。

### 步骤 8：重新构建网站目录

运行目录构建脚本以重新生成 `website/catalog.json`：

```bash
npx tsx scripts/build-catalog.ts
```

验证输出：

- `website/catalog.json` 已更新
- 技能总数有所增加（如果仅为更新，则也可能保持不变）
- 构建输出中没有错误

### 步骤 9：验证所有内容

执行最终检查：

1. `data/skill-index-resources.json` 是有效的 JSON，并且包含新条目
2. 每个新的 `data/skill-index/{owner}_{repo}.json` 均存在且为有效的 JSON
3. 这些索引文件中的每个技能条目都已填充 `tokenCount`（数字）和 `evalSummary`（包含 `overallScore`、`grade`、`categories` 的对象）——如果缺少任何内容，请重新运行 `npm run preindex`，或按照步骤 7 中的说明回退到手动填充
4. `website/catalog.json` 是有效的 JSON，并且包含新技能
5. `git diff --stat` 显示仅有预期文件发生更改

向用户报告摘要：

```
Added N new repo(s), updated M existing repo(s)
Total new skills indexed: X
Files changed: list of files

Ready to commit and create PR.
```

### 步骤 10：提交、推送并创建 PR

使用约定式提交格式暂存并提交：

注意：`website/catalog.json` 已被 git 忽略，并由 CI（`deploy-website.yml`）在合并时重新构建。不要暂存该文件——仅暂存数据文件。

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

每一行都列出了条件、负责处理该条件的步骤以及所需的响应。如有疑问，应将问题告知用户，而不是静默丢弃仓库——审核策略是**宽松的**，但也是**透明的**。

| 条件                                                           | 响应                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **仓库 URL 返回 404 / 私有仓库**                                | 在步骤 1 的表格中标记为 `INVALID` 并跳过；如果其他 URL 有效，则不要中止。                 |
| **Git 克隆失败**                                                 | 跳过该仓库，报告错误，然后继续处理其他仓库。                                       |
| **仓库中没有 SKILL.md 文件**                                    | 在步骤 2 中标记，并询问是否仍要包含（有些仓库最初为空，稍后才会添加技能）。 |
| **仓库中有 50 个以上的 SKILL.md 文件**                                     | 继续处理，但警告运行时间——对大量技能执行 `asm eval` 会很慢。                         |
| **仓库已在索引中，且未发生更改**                                | 报告 `EXISTS, no diff`，并跳过该仓库的索引重新生成。                               |
| **仓库已在索引中，且存在破坏性更改**（技能被移除/重命名） | 在步骤 4 中显示差异，并要求用户明确确认后再覆盖。                  |
| **`npm run preindex` 缺失或失败**                             | 按照步骤 7 回退到手动生成；不要阻止创建 PR。                                   |
| **`npx tsx scripts/build-catalog.ts` 失败**                        | 在步骤 8 停止——这是结构性问题；不得合入目录损坏的 PR。                            |
| **`gh` 未通过身份验证**                                          | 提示运行 `gh auth login`；未经身份验证，不要尝试推送。                                      |
| **`gh pr create` 失败**（身份验证、网络、缺少远程仓库）            | 输出已提交的 SHA，以便用户手动推送并创建 PR。                            |
| **非 GitHub URL**（GitLab、Bitbucket）                              | 在步骤 1 中拒绝——此技能仅为 github.com 编制索引。                                            |
| **指向单个技能子目录的 URL**（`.../tree/main/skills/foo`） | 将其视为父仓库 URL；让步骤 2 的发现程序仅提取该技能。                    |

## 清理

完成后，删除用于克隆的所有临时目录：

```bash
rm -rf "$TEMP_DIR"
```