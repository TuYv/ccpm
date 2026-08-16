---
name: github-pr-creation
description: Creates GitHub Pull Requests with automated validation and task tracking. Use when user wants to create PR, open pull request, submit for review, or check if ready for PR. Analyzes commits, validates task completion, generates Conventional Commits title and description, suggests labels. NOTE - for merging existing PRs, use github-pr-merge instead.
---
# 创建 GitHub PR

创建拉取请求，并进行任务验证、执行测试及采用 Conventional Commits 格式。

## 当前状态

!`git rev-parse --abbrev-ref HEAD 2>/dev/null`
!`git log @{u}..HEAD --oneline 2>/dev/null || echo "(no upstream tracking)"`

## 核心工作流

### 1. 确认目标分支

**继续之前务必询问用户：**

```
Creating PR from [current-branch] to [target-branch]. Correct?
```

| 分支流向 | 典型目标分支 |
|-------------|---------------|
| feature/* | develop |
| fix/* | develop |
| hotfix/* | main/master |
| develop | main/master |

### 2. 搜索任务文档

查找描述此 PR 应完成内容的任务/规范文件。各工具的常见位置如下：

| 工具/约定 | 路径 |
|-----------------|------|
| Spec2Ship (s2s) | `.s2s/plans/*.md`（查找与分支名称或提交匹配的活动计划） |
| AWS Kiro | `.kiro/specs/*/tasks.md` |
| Cursor | `.cursor/rules/*.md`、`.cursorrules` |
| Trae | `.trae/rules/*.md` |
| GitHub Issues | `gh issue list --assignee @me --state open` |
| 通用 | `docs/specs/`、`specs/`、`tasks.md`、`TODO.md` |

找到后，提取任务 ID、标题、描述和需求引用。

### 3. 分析提交

对于此分支上的每个提交，识别其类型、作用域、任务引用和破坏性变更。存在任务文件时，将提交映射到已记录的任务。

### 4. 验证任务完成情况

如果存在任务文档：

1. 根据分支名称识别主任务（例如，`feature/task-2-*` -> 任务 2）
2. 查找所有子任务（例如，任务 2.1、2.2、2.3）
3. 检查提交中引用了哪些子任务
4. 报告缺失的子任务

**如果任务未完成**，请停止并显示状态：
```
Task 2 INCOMPLETE: 1/3 sub-tasks missing
- Task 2.1: done
- Task 2.2: done
- Task 2.3: MISSING
```

询问用户是要完成缺失的任务，还是仍然继续。

### 5. 运行测试

运行项目测试套件。创建 PR 之前，测试**必须**通过。

### 6. 确定 PR 类型并生成标题

| 分支流向 | 标题前缀 |
|-------------|-------------|
| feature/* -> develop | `feat(scope):` |
| fix/* -> develop | `fix(scope):` |
| hotfix/* -> main | `hotfix(scope):` |
| develop -> main | `release:` |
| refactor/* -> develop | `refactor(scope):` |
| chore/* -> develop | `chore(scope):` |
| ci/* -> develop | `ci(scope):` |
| docs/* -> develop | `docs(scope):` |

**标题格式**：`<type>(<scope>): <description>`
- 类型：分析得出的主要提交类型（feat > fix > refactor > ci > chore）
- 作用域：提交中最常见的作用域（kebab-case）
- 描述：使用祈使语气、小写、不加句号，最多 50 个字符

**破坏性变更**：如果任何提交包含 `BREAKING CHANGE:` 或类型后带有 `!`：
- 如果项目中存在 `breaking` 标签，则添加该标签
- 在 PR 正文中加入 `## Breaking changes` 部分

### 7. 生成 PR 正文

根据 PR 类型，从 `references/pr_templates.md` 中选择合适的模板，并使用收集到的数据填充。

### 8. 建议标签

**务必先检查可用标签：**

```bash
gh label list
```

将提交类型与可用的项目标签相匹配。项目使用的名称可能与标准名称不同（例如，使用 "feature" 而不是 "enhancement"）。

| 提交类型 | 常见标签名称 |
|-------------|-------------------|
| feat | feature, enhancement |
| fix | bug, bugfix |
| refactor | refactoring, tech-debt |
| docs | documentation |
| ci | ci/cd, infrastructure |
| security | security |
| hotfix | urgent, priority:high |

**如果不存在匹配的标签**：建议创建一个。用户可能已移除默认标签，因此可以适当提议添加相关标签。

### 9. 确定里程碑

检查开放的里程碑：

```bash
gh api repos/$(gh repo view --json nameWithOwner -q '.nameWithOwner')/milestones \
  --jq '.[] | select(.state == "open") | "\(.number): \(.title)"'
```

- 如果存在一个活跃的里程碑：将 PR 分配给该里程碑（所有进行中的工作都属于下一个版本）
- 如果存在多个里程碑：询问用户应使用哪一个
- 如果不存在里程碑：跳过（不要自动创建）

### 10. 创建 PR

**务必先展示标题、正文、标签和里程碑，供用户审批。**

```bash
gh pr create \
  --title "[title]" \
  --body "$(cat <<'EOF'
[body content]
EOF
)" \
  --base [base_branch] \
  --label "[label1]" --label "[label2]" \
  --milestone "[milestone-title]" \
  --reviewer "[username]"          # if teammates are known
```

如果 PR 尚未准备好接受合并审查（工作仍在进行中、等待 CI，或创建 PR 只是为了在该分支上触发 AI 机器人审查），请使用 `--draft`。

## 重要规则

- **务必**与用户确认目标分支
- **务必**在创建 PR 前运行测试
- **务必**在创建 PR 前展示 PR 内容以供审批
- **务必**在提出建议前使用 `gh label list` 检查可用标签
- **务必**对正文使用 HEREDOC，以保留格式
- **务必**为每个标签分别添加 `--label`（不要在一个字符串中使用逗号分隔）
- **务必**检查开放的里程碑，并在存在活跃里程碑时进行分配
- **绝不**在未经用户确认的情况下创建 PR
- **绝不**修改仓库文件（仅进行只读分析）
- **绝不**自动创建里程碑——只能分配现有里程碑
- 对尚未准备好接受合并审查的 PR 使用 `--draft`
- 当可从团队配置或 CODEOWNERS 中获知团队成员时，使用 `--reviewer`

## 参考资料

- `references/pr_templates.md` - 适用于所有类型（功能、发布、错误修复、热修复、重构、文档、CI/CD）的 PR 正文模板