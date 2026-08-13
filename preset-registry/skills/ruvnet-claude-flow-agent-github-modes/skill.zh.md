---
name: agent-github-modes
description: Agent skill for github-modes - invoke with $agent-github-modes
---
---
name: github-modes
description: 提供用于工作流编排、PR 管理和仓库协同的综合 GitHub 集成模式，具备批量优化能力
tools: mcp__claude-flow__swarm_init, mcp__claude-flow__agent_spawn, mcp__claude-flow__task_orchestrate, Bash, TodoWrite, Read, Write
color: purple
type: development
capabilities:
  - GitHub 工作流编排
  - 拉取请求管理与评审
  - Issue 跟踪与协同
  - 发布管理与部署
  - 仓库架构与组织
  - CI/CD 流水线协调
priority: medium
hooks:
  pre: |
    echo "Starting github-modes..."
    echo "Initializing GitHub workflow coordination"
    gh auth status || (echo "GitHub CLI authentication required" && exit 1)
    git status > $dev$null || (echo "Not in a git repository" && exit 1)
  post: |
    echo "Completed github-modes"
    echo "GitHub operations synchronized"
    echo "Workflow coordination finalized"
---

# GitHub 集成模式

## 概览
本文档描述了 Claude-Flow 中可用的所有 GitHub 集成模式，并配合 ruv-swarm 协同。每种模式都针对特定 GitHub 工作流进行优化，并集成批量工具以实现最高效率。

## GitHub 工作流模式

### gh-coordinator
**GitHub 工作流编排与协调**
- **协调模式**: 分层
- **最大并行操作数**: 10
- **是否批量优化**: 是
- **工具**: gh CLI commands, TodoWrite, TodoRead, Task, Memory, Bash
- **用法**: `$github gh-coordinator <GitHub workflow description>`
- **适用于**: 复杂 GitHub 工作流、多仓库协同

### pr-manager
**拉取请求管理与评审协调**
- **评审模式**: 自动化
- **多评审人**: 是
- **冲突解决**: 智能
- **工具**: gh pr create, gh pr view, gh pr review, gh pr merge, TodoWrite, Task
- **用法**: `$github pr-manager <PR management task>`
- **适用于**: PR 评审、合并协调、冲突解决

### issue-tracker
**Issue 管理与项目协调**
- **Issue 工作流**: 自动化
- **标签管理**: 智能
- **进度跟踪**: 实时
- **工具**: gh issue create, gh issue edit, gh issue comment, gh issue list, TodoWrite
- **用法**: `$github issue-tracker <issue management task>`
- **适用于**: 项目管理、Issue 协调、进度跟踪

### release-manager
**发布协调与部署**
- **发布流水线**: 自动化
- **版本控制**: 语义化
- **部署方式**: 多阶段
- **工具**: gh pr create, gh pr merge, gh release create, Bash, TodoWrite
- **用法**: `$github release-manager <release task>`
- **适用于**: 发布管理、版本协调、部署流水线

## 仓库管理模式

### repo-architect
**仓库结构与组织**
- **结构优化**: 是
- **多仓库**: 支持
- **模板管理**: 高级
- **工具**: gh repo create, gh repo clone, git commands, Write, Read, Bash
- **用法**: `$github repo-architect <repository management task>`
- **适用于**: 仓库搭建、结构优化、多仓库管理

### code-reviewer
**自动化代码评审与质量保障**
- **评审深度**: 深入
- **安全分析**: 是
- **性能检查**: 自动化
- **工具**: gh pr view --json files, gh pr review, gh pr comment, Read, Write
- **用法**: `$github code-reviewer <review task>`
- **适用于**: 代码质量、安全评审、性能分析

### branch-manager
**分支管理与工作流协调**
- **分支策略**: GitFlow
- **合并策略**: 智能
- **冲突预防**: 主动
- **工具**: gh api (for branch operations), git commands, Bash
- **用法**: `$github branch-manager <branch management task>`
- **适用于**: 分支协调、合并策略、工作流管理

## 集成命令

### sync-coordinator
**多包同步**
- **包同步**: 智能
- **版本对齐**: 自动
- **依赖解析**: 高级
- **工具**: git commands, gh pr create, Read, Write, Bash
- **用法**: `$github sync-coordinator <sync task>`
- **适用于**: 包同步、版本管理、依赖更新

### ci-orchestrator
**CI/CD 流水线协调**
- **流水线管理**: 高级
- **测试协调**: 并行
- **部署**: 自动化
- **工具**: gh pr checks, gh workflow list, gh run list, Bash, TodoWrite, Task
- **用法**: `$github ci-orchestrator <CI/CD task>`
- **适用于**: CI/CD 协调、测试管理、部署自动化

### security-guardian
**安全与合规管理**
- **安全扫描**: 自动化
- **合规检查**: 持续
- **漏洞管理**: 主动
- **工具**: gh search code, gh issue create, gh secret list, Read, Write
- **用法**: `$github security-guardian <security task>`
- **适用于**: 安全审计、合规检查、漏洞管理

## 使用示例

### 创建协同拉取请求工作流:
```bash
$github pr-manager "Review and merge feature$new-integration branch with automated testing and multi-reviewer coordination"
```

### 管理仓库同步:
```bash
$github sync-coordinator "Synchronize claude-code-flow and ruv-swarm packages, align versions, and update cross-dependencies"
```

### 设置自动化 Issue 跟踪:
```bash
$github issue-tracker "Create and manage integration issues with automated progress tracking and swarm coordination"
```

## 批处理操作

所有 GitHub 模式都支持批处理操作以实现最大效率:

### 并行 GitHub 操作示例:
```javascript
[Single Message with BatchTool]:
  Bash("gh issue create --title 'Feature A' --body '...'")
  Bash("gh issue create --title 'Feature B' --body '...'")
  Bash("gh pr create --title 'PR 1' --head 'feature-a' --base 'main'")
  Bash("gh pr create --title 'PR 2' --head 'feature-b' --base 'main'")
  TodoWrite { todos: [todo1, todo2, todo3] }
  Bash("git checkout main && git pull")
```

## 与 ruv-swarm 集成

所有 GitHub 模式都可以通过 ruv-swarm 协同进行增强:

```javascript
// Initialize swarm for GitHub workflow
mcp__claude-flow__swarm_init { topology: "hierarchical", maxAgents: 5 }
mcp__claude-flow__agent_spawn { type: "coordinator", name: "GitHub Coordinator" }
mcp__claude-flow__agent_spawn { type: "reviewer", name: "Code Reviewer" }
mcp__claude-flow__agent_spawn { type: "tester", name: "QA Agent" }

// Execute GitHub workflow with coordination
mcp__claude-flow__task_orchestrate { task: "GitHub workflow", strategy: "parallel" }
```
