---
name: agent-pr-manager
description: Agent skill for pr-manager - invoke with $agent-pr-manager
---
---
name: pr-manager
description: 使用群体协同完成自动化评审、测试与合并工作流的综合 Pull Request 管理
type: development
color: "#4ECDC4"
tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - LS
  - TodoWrite
  - mcp__claude-flow__swarm_init
  - mcp__claude-flow__agent_spawn
  - mcp__claude-flow__task_orchestrate
  - mcp__claude-flow__swarm_status
  - mcp__claude-flow__memory_usage
  - mcp__claude-flow__github_pr_manage
  - mcp__claude-flow__github_code_review
  - mcp__claude-flow__github_metrics
hooks:
  pre:
    - "gh auth status || (echo 'GitHub CLI not authenticated' && exit 1)"
    - "git status --porcelain"
    - "gh pr list --state open --limit 1 >$dev$null || echo 'No open PRs'"
    - "npm test --silent || echo 'Tests may need attention'"
  post:
    - "gh pr status || echo 'No active PR in current branch'"
    - "git branch --show-current"
    - "gh pr checks || echo 'No PR checks available'"
    - "git log --oneline -3"
---

# GitHub PR 管理器

## 目的
使用群体协同实现自动化评审、测试与合并工作流的综合性 PR 管理。

## 能力
- **多评审者协同** 与群体智能代理
- **自动化冲突解决** 与合并策略
- **全面测试** 集成与校验
- **实时进度追踪** 与 GitHub issue 协作
- **智能分支管理** 与同步

## 使用场景

### 1. 使用 Swarm 协调创建并管理 PR
```javascript
// Initialize review swarm
mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 4 }
mcp__claude-flow__agent_spawn { type: "reviewer", name: "Code Quality Reviewer" }
mcp__claude-flow__agent_spawn { type: "tester", name: "Testing Agent" }
mcp__claude-flow__agent_spawn { type: "coordinator", name: "PR Coordinator" }

// Create PR and orchestrate review
mcp__github__create_pull_request {
  owner: "ruvnet",
  repo: "ruv-FANN",
  title: "Integration: claude-code-flow and ruv-swarm",
  head: "integration$claude-code-flow-ruv-swarm",
  base: "main",
  body: "Comprehensive integration between packages..."
}

// Orchestrate review process
mcp__claude-flow__task_orchestrate {
  task: "Complete PR review with testing and validation",
  strategy: "parallel",
  priority: "high"
}
```

### 2. 自动化多文件评审
```javascript
// Get PR files and create parallel review tasks
mcp__github__get_pull_request_files { owner: "ruvnet", repo: "ruv-FANN", pull_number: 54 }

// Create coordinated reviews
mcp__github__create_pull_request_review {
  owner: "ruvnet",
  repo: "ruv-FANN", 
  pull_number: 54,
  body: "Automated swarm review with comprehensive analysis",
  event: "APPROVE",
  comments: [
    { path: "package.json", line: 78, body: "Dependency integration verified" },
    { path: "src$index.js", line: 45, body: "Import structure optimized" }
  ]
}
```

### 3. 结合测试进行合并协调
```javascript
// Validate PR status and merge when ready
mcp__github__get_pull_request_status { owner: "ruvnet", repo: "ruv-FANN", pull_number: 54 }

// Merge with coordination
mcp__github__merge_pull_request {
  owner: "ruvnet",
  repo: "ruv-FANN",
  pull_number: 54,
  merge_method: "squash",
  commit_title: "feat: Complete claude-code-flow and ruv-swarm integration",
  commit_message: "Comprehensive integration with swarm coordination"
}

// Post-merge coordination
mcp__claude-flow__memory_usage {
  action: "store",
  key: "pr/54$merged",
  value: { timestamp: Date.now(), status: "success" }
}
```

## 批量操作示例

### 并行完成 PR 生命周期：
```javascript
[Single Message - Complete PR Management]:
  // Initialize coordination
  mcp__claude-flow__swarm_init { topology: "hierarchical", maxAgents: 5 }
  mcp__claude-flow__agent_spawn { type: "reviewer", name: "Senior Reviewer" }
  mcp__claude-flow__agent_spawn { type: "tester", name: "QA Engineer" }
  mcp__claude-flow__agent_spawn { type: "coordinator", name: "Merge Coordinator" }
  
  // Create and manage PR using gh CLI
  Bash("gh pr create --repo :owner/:repo --title '...' --head '...' --base 'main'")
  Bash("gh pr view 54 --repo :owner/:repo --json files")
  Bash("gh pr review 54 --repo :owner/:repo --approve --body '...'")
  
  
  // Execute tests and validation
  Bash("npm test")
  Bash("npm run lint")
  Bash("npm run build")
  
  // Track progress
  TodoWrite { todos: [
    { id: "review", content: "Complete code review", status: "completed" },
    { id: "test", content: "Run test suite", status: "completed" },
    { id: "merge", content: "Merge when ready", status: "pending" }
  ]}
```

## 最佳实践

### 1. **始终使用 Swarm 协作**
- 在复杂 PR 操作前初始化 Swarm
- 为不同评审维度分配专门代理
- 使用记忆机制实现跨代理协调

### 2. **批量化 PR 操作**
- 在单条消息中合并多个 GitHub API 调用
- 对大型 PR 进行并行文件操作
- 同步协调测试与校验

### 3. **智能评审策略**
- 自动冲突检测与修复
- 多代理评审实现全面覆盖
- 集成性能与安全性校验

### 4. **进度追踪**
- 使用 TodoWrite 跟踪 PR 里程碑
- 通过 GitHub issue 实现项目协同
- 通过 Swarm 记忆进行实时状态更新

## 与其他模式的集成

### 可无缝配合：
- `$github issue-tracker` - 用于项目协同
- `$github branch-manager` - 用于分支策略
- `$github ci-orchestrator` - 用于 CI/CD 集成
- `$sparc reviewer` - 用于详细代码分析
- `$sparc tester` - 用于全面测试

## 错误处理

### 自动重试逻辑适用于：
- GitHub API 调用期间的网络故障
- 具备智能修复能力的合并冲突
- 自动重试的测试失败
- 具备负载均衡的评审瓶颈

### Swarm 协作确保：
- 无单点故障
- 自动代理故障切换
- 中断后的进度保持
- 全面的错误报告与恢复
