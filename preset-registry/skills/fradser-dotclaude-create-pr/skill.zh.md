---
name: create-pr
allowed-tools: Task, Bash(gh:*), Bash(git:*), Skill
description: Creates comprehensive GitHub pull requests with automated quality validation and security scanning, then hands off to /github:review-pr for CI monitoring and reviewer-comment triage. This skill should be used when the user asks to "create a PR", "submit a pull request", or needs to merge completed work with full compliance checks.
argument-hint: "[optional description or issue reference] [--no-monitor] [--auto-merge]"
user-invocable: true
---
# 创建 GitHub Pull Request

执行自动化 PR 创建工作流，并进行全面的质量验证和安全扫描。

## 上下文

- 当前 git 状态：!`git status`
- 当前分支：!`git branch --show-current`
- 未推送的提交：!`git log --oneline -5`
- GitHub 身份验证：!`gh auth status`
- 仓库变更：!`git diff --stat HEAD~1..HEAD`

## 要求摘要

确保仓库处于就绪状态，包括工作区干净且身份验证有效。在创建 PR 前完成所有质量检查（lint、test、build、security）。使用自动关闭关键字关联相关 issue，并应用准确的标签。完整检查清单请参阅 `references/requirements.md`。

## 阶段 1：验证与分析

**目标**：验证仓库状态、分析变更、检测模板并识别阻塞项。

**操作**：
1. 根据上下文验证 GitHub 身份验证状态
2. 检查分支状态和未推送的提交
3. 分析提交历史是否符合约定式提交规范
4. 识别已变更文件并确定 PR 范围
5. 检查贡献指南（`CONTRIBUTING.md`）并遵循其要求
6. 检测 PR 模板（`.github/PULL_REQUEST_TEMPLATE.md` 或根目录/docs 目录中的模板）
7. 检测潜在阻塞项（合并冲突、缺少测试等）

有关模板检测和合规性详情，请参阅 `references/repository-templates.md`。

## 阶段 2：质量与安全检查

**目标**：执行全面的质量验证和安全扫描。

**操作**：
1. 运行项目特定的质量检查（命令请参阅 `references/quality-validation.md`）
2. 对敏感文件和硬编码密钥执行安全扫描
3. 根据规范验证提交消息格式
4. 如果检查失败：按照 `references/failure-resolution.md` 中的失败解决流程处理
5. 重新运行所有检查，直至全部通过

## 阶段 3：PR 组装与创建

**目标**：创建具备正确结构、元数据和关联链接的 Pull Request。

**操作**：
1. **在推导任何内容之前先使用 `$ARGUMENTS`。** 它可能包含以下内容的任意组合：
   - **issue 引用**（`Closes #456`、`Fixes #12` 或单独的 `#456`）——在 PR 正文中将其原样用作自动关闭关键字；不要重新推导或质疑它。`/github:resolve-issues` 会委托给此处，并以这种方式传递其刚刚解决的 issue。
   - **自由文本描述**——将其作为 PR 标题和 What/Why 部分的基础。
   - `--draft`——在第 6 步中原样传递给 `gh pr create`。
   - `--no-monitor`——仅用于选择退出阶段 4；绝不能将其视为描述文本。
   - `--auto-merge`——在阶段 4 中原样传递给 `/github:review-pr`；在审查循环中，当所有检查通过后启用自动合并。绝不能将其视为描述文本。
   在将剩余内容用作描述/issue 文本之前，先移除这些标志。
2. 使用 GitHub CLI 识别并关联任何*其他*相关 issue（除 `$ARGUMENTS` 中的任何引用之外）
3. 生成 PR 标题（≤70 个字符、使用祈使语气、不使用 emoji）
4. 按照 `references/pr-structure.md` 中的模板组装 PR 正文
5. 根据文件变更自动应用标签
6. **关键：自动关闭关键字仅在 PR 合并到仓库默认分支时生效。** 如果目标是非默认分支（例如 `develop`），请明确警告用户：关联的 issue 在合并后不会自动关闭，必须手动关闭——完整规则和关键字表请参阅 `references/auto-closing-keywords.md`。
7. 使用 `gh pr create` 及所有元数据创建 PR
   - 如果 `$ARGUMENTS` 请求了 `--draft`，或者 PR 需要早期反馈或尚未完全完成，请使用 `--draft`
   - 如有要求，使用 `--reviewer` 设置审查者，并使用 `--assignee` 设置受理人
   - 对于简单变更，使用 `--fill` 自动填充标题/正文
8. 向用户报告最终 PR URL 和状态。不要在此处运行前台 `gh pr checks --watch`——阶段 4 会移交给 `/github:review-pr`，由其负责持续监控 CI；阻塞式 `--watch` 会使当前轮次停滞，并造成重复监控。
9. **关键：继续执行阶段 4。** 创建 PR 并不意味着此技能已经结束。仅当 `$ARGUMENTS` 包含 `--no-monitor` 或用户明确选择退出时，才能跳过阶段 4——绝不能因为 CI 看起来已通过、未分配审查者或变更看起来很简单而跳过。

## 阶段 4：PR 创建后的移交（默认启用）

**触发条件**：默认行为——除非 `$ARGUMENTS` 包含 `--no-monitor` 或用户选择退出，否则进行移交。

**目标**：将 CI 监控和审阅者评论分类处理委托给专用技能。

**操作**：创建 PR 后，调用 `Skill("github:review-pr", "<PR#>")` 以运行基线审查，并启动持续的 CI 和评论监控。review-pr 技能负责 Monitor 脚本、持怀疑态度的分类处理智能体，以及审查 → 修复 → 提交并推送 → 等待审查的循环，直至做出合并决定并完成合并后的分支清理（清理远程和本地 head、`fetch --prune`、快进 `main`/`develop`）。**一旦 CI 变为绿色且所有评论都已完成分类处理，review-pr 会在执行收尾流程之前，通过 `AskUserQuestion` 询问用户是否合并（合并提交/squash/rebase/不合并）**——只有选择合并时，才会运行摘要评论和正文重写。该合并询问由插件的 Stop hook 强制执行：一旦满足停止条件，review-pr 就会启用收尾状态，并且在决定得出之前，每个用户轮次都会阻止一次轮次结束——移交过程无法静默跳过该询问。有关包括合并后清理在内的移交契约，请参阅 `references/pr-creation-handoff.md`。此技能不会重复执行该清理；这是移交目标的职责。

**`--auto-merge` 透传**：如果 `$ARGUMENTS` 携带了 `--auto-merge`，则将其透传给 review-pr 调用，即 `Skill("github:review-pr", "<PR#> --auto-merge")`。它会指示 review-pr 跳过合并 `AskUserQuestion`——收尾流程（摘要评论 + 正文重写）仍会先运行——并在 CI 变为绿色且所有非 escalate 评论都已完成分类处理后，使用 `gh pr merge --merge` 自动合并——有关契约和 escalate 回退机制，请参阅 `references/pr-creation-handoff.md`。**仅**当用户明确设置该选项时才进行透传；绝不能自行推断。

**关键：此技能是插件中唯一创建 PR 的路径。** 其他技能（例如 `/github:resolve-issues`）会委托给此技能，而不是自行调用 `gh pr create`，正是为了确保任何 PR 都不会绕过质量门禁或此移交流程。有关完整契约，请参阅 `references/pr-creation-handoff.md`。不要添加绕过方式。

## 参考资料

- **要求**：`references/requirements.md` - 创建前检查清单和提交标准
- **仓库模板**：`references/repository-templates.md` - 贡献指南和 PR 模板
- **质量验证**：`references/quality-validation.md` - Node.js/Python 验证命令
- **PR 结构**：`references/pr-structure.md` - 标题指南、正文模板、标签
- **自动关闭关键字**：`references/auto-closing-keywords.md` - 默认分支限制和关键字表
- **PR 创建移交**：`references/pr-creation-handoff.md` - 唯一 PR 创建路径契约
- **故障解决**：`references/failure-resolution.md` - 用于修复故障的智能体协作
- **示例**：`references/examples.md` - 提交消息示例