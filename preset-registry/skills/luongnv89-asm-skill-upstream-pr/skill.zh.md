---
name: skill-upstream-pr
description: "Improve an open-source GitHub skill and open a friendly suggestion PR upstream: fork, run skill-auto-improver, attach asm eval before/after metrics. Don't use for local-only skills, authoring from scratch, bulk repos, or registry publish."
license: MIT
compatibility: Claude Code
allowed-tools: Bash Read Write Edit Grep Glob
effort: high
metadata:
  version: 1.0.0
  author: luongnv89
---
# 技能上游 PR

你正在为他人的开源技能贡献质量改进。工作流程为：复刻 → 克隆 → 通过 `skill-auto-improver` 改进 → 推送到复刻仓库 → 向上游发起一份友好的建议性 PR。你并不拥有目标仓库。每个步骤都假定你是一名礼貌的贡献者，而不是维护者。

## 编辑前同步仓库（强制）

在对已克隆的复刻仓库进行任何修改之前，从该复刻仓库所跟踪的分支拉取最新内容：

```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
git fetch origin
git pull --rebase origin "$branch"
```

如果工作树中有未提交的更改：暂存、同步，然后恢复暂存的更改。如果缺少 `origin` 或发生冲突：停止并询问用户。基于昨天的过期代码树发起 PR，还不如不发 PR。

## 使用时机

- 用户分享了一个公开技能仓库的 GitHub URL，并要求“改进”“提升”或“为其做贡献”
- 用户提出“为这个技能发起 PR”或“向上游建议改进”
- 目标技能在 `asm eval` 中的评分低于 85/8，并且用户希望上游作者也能从中受益

在以下情况中**不要**触发：编辑没有上游的本地技能、编写全新技能、发布到 ASM 注册表，或一次性批量改进多个仓库。一个技能 → 一个 PR。

## 前提条件

在克隆任何内容之前逐项验证。如果有任何一项失败，请停止并告知用户。

- `asm` 位于 PATH 中（`command -v asm`）
- `gh` 位于 PATH 中且已完成身份验证（`gh auth status`）
- `git` 位于 PATH 中
- 能够通过网络访问 GitHub
- 对自己的 GitHub 账户拥有写入权限（用于创建复刻仓库）

## 输入

用户提供一个指向技能的 GitHub 引用。接受以下任意格式：

- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/<branch>/<path/to/skill>`
- `github:owner/repo[#ref][:path]`

将其规范化为 `owner`、`repo`、可选的 `ref` 和可选的 `path`。如果未提供 `path`，并且仓库中有多个 `SKILL.md` 文件，请询问用户要选择哪一个。

## 工作流程

按顺序执行各个阶段。不要跳过或重新排序。

### 阶段 0 — 复刻并克隆

```bash
cd "$(mktemp -d)"
gh repo fork "$OWNER/$REPO" --clone --remote
cd "$REPO"
# If a ref was provided:
git checkout "$REF"
```

`gh repo fork --clone --remote` 会在你的账户下创建复刻仓库，将其克隆到本地，把 `origin` 设置为你的复刻仓库，并把 `upstream` 设置为原始仓库。继续之前，使用 `git remote -v` 进行验证。

为此次改进创建专用分支：

```bash
git checkout -b "skill-upstream-pr/improve-$(date +%Y%m%d-%H%M%S)"
```

### 阶段 1 — 定位目标 SKILL.md

如果用户提供了 `path`，则使用该路径。否则：

```bash
find . -maxdepth 5 -name "SKILL.md" -type f
```

如果匹配项多于一个且未提供 `path`，请列出候选项并让用户选择。绝不要猜测——发起错误的 PR 比延迟发起更糟糕。

将 `SKILL_PATH` 设置为包含所选 SKILL.md 的**目录**（而不是文件本身）——`asm eval` 接受的是目录。

### 阶段 2 — 委托给 skill-auto-improver

此技能不会重新实现改进循环。以 `$SKILL_PATH` 作为目标，遵循 `skills/skill-auto-improver/SKILL.md` 中的工作流程：

1. 该技能的阶段 0：捕获 `.asm-improver/baseline.json`
2. 阶段 1：`asm eval --fix`
3. 阶段 2-4：按类别循环，并以 85/8 为最低标准
4. 阶段 5：`.asm-improver/report.md`

如果基线已经达到 85/8，则停止并告知用户——对于已经达到最低标准的技能，无需提交 PR。可以提出查找其他技能或设定其他目标。

### 阶段 3——收集 PR 指标

读取自动改进器生成的两个文件：

- `.asm-improver/baseline.json`——改进前的快照
- 最新的 `.asm-improver/iter-N.json`——改进后的快照

从两者中提取：

- `overallScore`、`grade`
- 每个 `categories[].score`（共 7 个类别）
- `topSuggestions` 摘要（用于提供背景信息，不要逐字引用）

计算差值。如果总分提升不足 3 分，**或者**没有任何类别从低于 8 分提升到至少 8 分，则停止并告知用户——这项改动不够显著，不足以证明提交 PR 的合理性。可以改为提供自动改进器报告，供他们作为非正式反馈分享。

### 阶段 4——编写 PR 正文

读取 `references/pr-template.md` 并填写内容。该模板要求采用友好、建议式的语气。关键部分包括：

- **改动内容**——一句话摘要
- **改进前/后指标**——包含 overallScore、grade 和全部 7 个类别的表格
- **涉及的文件**——列出 `$SKILL_PATH` 下每个被修改的路径
- **迭代次数**——自动改进器循环的 8 次中实际执行了 N 次
- **验证方式**——维护者可以在本地运行的 `asm eval` 命令

语气规则（阅读 `references/tone-guide.md`）：

- 以“你好——注意到 X，想分享 Y”开头
- 将其表述为建议，而不是修复：“如果这个方向不合适，我很乐意调整”
- 绝不要暗示维护者做错了什么
- 感谢他们将该技能开源
- 以“没有合并的义务——如果这个方向不合适，直接关闭也完全没问题”结尾

### 阶段 5——最终确认（强制）

在他人的仓库中创建 PR 是公开操作，而且很难撤销。在推送任何内容之前，向用户展示：

1. PR 标题
2. 完整的 PR 正文（渲染后的 Markdown）
3. 确切的差异内容（`git diff upstream/<default-branch>`）
4. 即将运行的命令

请求用户确认。如果他们希望修改，则应用修改并重新预览。在用户说“开始”或同等含义的话之前，不要推送。

### 阶段 6——推送并创建 PR

获得批准后：

```bash
# Commit the changes
git add -A
git commit -m "$(cat <<'EOF'
improve SKILL.md: clarify triggers, add acceptance criteria, fix frontmatter

Suggested via skill-upstream-pr. See PR body for before/after metrics.
EOF
)"

# Push to the fork
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"

# Open the PR upstream
gh pr create \
  --repo "$OWNER/$REPO" \
  --title "$PR_TITLE" \
  --body-file .asm-improver/pr-body.md
```

绝不要推送到 `upstream`。绝不要使用 `--no-verify` 或其他跳过钩子的标志。如果 `gh pr create` 失败，则停止并报告——不要循环重试。

输出 `gh pr create` 返回的 PR URL，以便用户打开。

## 步骤完成报告（强制）

在每个阶段结束后输出一个紧凑的状态块：

```
◆ Phase N — [phase name] ([N of 6])
··································································
  [check 1]:         √ pass
  [check 2]:         √ pass (note if relevant)
  [check 3]:         × fail — [reason]
  Criteria:          √ M/K met
  ______________________________
  Result:            PASS | FAIL | PARTIAL
```

各阶段的检查项：

- **阶段 0** — `Fork created`、`Clone succeeded`、`Branch created`、`Remotes correct`
- **阶段 1** — `SKILL.md located`、`Path unambiguous`
- **阶段 2** — `Baseline captured`、`Auto-improver ran`、`Final score >= 85`、`All categories >= 8`
- **阶段 3** — `Before/after delta >= 3 points OR category promoted`
- **阶段 4** — `PR body rendered`、`Tone checks passed`
- **阶段 5** — `User approved`
- **阶段 6** — `Push succeeded`、`PR opened`、`URL printed`

## 验收标准

- 必须通过 `gh repo fork --clone --remote` 完成复刻和克隆——绝不能直接克隆上游仓库
- 在进行任何编辑之前，创建专用的功能分支
- 对目标运行 `skill-auto-improver` 工作流；将基线和最终 JSON 保存在 `.asm-improver/` 下
- 总分提升 ≥ 3 分，或者至少有一个类别从低于 8 分提升至 ≥ 8 分
- 使用 `references/pr-template.md` 构建 PR 正文，并包含完整的前后对比表
- 推送前，用户明确批准了 PR 预览
- `git push` 的目标必须是 `origin`（复刻仓库），绝不能是 `upstream`
- 使用 `gh pr create --repo $OWNER/$REPO`——PR 的目标是上游仓库
- 最后向用户输出 PR URL

### 预期输出

- 用户所复刻的 `$OWNER/$REPO` 上有一个新分支
- `$OWNER/$REPO` 上有一个公开 PR，其中包含前后指标对比表，并采用友好的语气
- 本地有一个 `.asm-improver/` 目录，其中包含基线、迭代记录、报告和 `pr-body.md`

## 边界情况

- **技能已经达到 85/8** — 在阶段 2 停止；不要为已经达到最低标准的技能创建 PR
- **改进幅度太小**（总分提升 < 3 分且没有任何类别获得提升）— 在阶段 3 停止；改为提供自动改进器报告，作为非正式反馈
- **仓库中存在多个 SKILL.md 文件** — 询问用户要处理哪一个；绝不要批量处理
- **之前运行时已经创建了复刻仓库** — `gh repo fork --clone --remote` 会复用该仓库；编辑前，在上游的默认分支上执行变基
- **上游执行了强制推送或重写了历史记录** — 停止并询问用户；不要通过强制推送复刻仓库来使其“追上”上游
- **`asm eval --fix` 写入了你不同意的更改** — 恢复 `SKILL.md.bak`，并仅进行针对性编辑；如果自动修复损害了技能，请勿提交该修复
- **维护者提供了 CONTRIBUTING.md 或 PR 模板** — 在阶段 4 之前阅读它，并使 PR 正文符合其规范；其模板优先于我们的模板

## 参考资料

- `references/pr-template.md` — 包含前后对比表的 PR 标题和正文模板
- `references/tone-guide.md` — 用于友好、建议式贡献的措辞模式
- `skills/skill-auto-improver/SKILL.md` — 此技能委托执行的改进循环
- `asm eval --help` — 评估器的标志参数参考