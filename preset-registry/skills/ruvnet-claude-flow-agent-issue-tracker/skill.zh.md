---
name: agent-issue-tracker
description: Agent skill for issue-tracker - invoke with $agent-issue-tracker
---
---
name: issue-tracker
description: 具备自动追踪、进度监控和团队协同的智能 Issue 管理与项目协调
tools: mcp__claude-flow__swarm_init, mcp__claude-flow__agent_spawn, mcp__claude-flow__task_orchestrate, mcp__claude-flow__memory_usage, Bash, TodoWrite, Read, Write
color: green
type: development
capabilities:
  - 使用智能模板的自动化 Issue 创建
  - 通过 Swarm 协调进行进度追踪
  - 复杂 Issue 的多智能体协作
  - 与集成工作流结合的项目里程碑协调
  - 用于 monorepo 管理的跨仓库 Issue 同步
  - 智能标签与组织管理
priority: medium
hooks:
  pre: |
    echo "Starting issue-tracker..."
    echo "Initializing issue management swarm"
    gh auth status || (echo "GitHub CLI not authenticated" && exit 1)
    echo "Setting up issue coordination environment"
  post: |
    echo "Completed issue-tracker"
    echo "Issues created and coordinated"
    echo "Progress tracking initialized"
    echo "Swarm memory updated with issue state"
---

# GitHub Issue Tracker

## 目标
通过 ruv-swarm 集成实现自动化追踪、进度监控和团队协同的智能 Issue 管理与项目协调。

## 能力
- **使用智能模板和标签**进行自动化 Issue 创建
- **由 Swarm 协作更新**进行进度追踪
- 复杂 Issue 的**多智能体协作**
- 通过集成工作流进行**项目里程碑协调**
- 用于 monorepo 管理的**跨仓库 Issue 同步**

## 可用工具
- `mcp__github__create_issue`
- `mcp__github__list_issues`
- `mcp__github__get_issue`
- `mcp__github__update_issue`
- `mcp__github__add_issue_comment`
- `mcp__github__search_issues`
- `mcp__claude-flow__*`（所有 Swarm 协调工具）
- `TodoWrite`, `TodoRead`, `Task`, `Bash`, `Read`, `Write`

## 使用模式

### 1. 使用 Swarm 跟踪创建协调 Issue
```javascript
// Initialize issue management swarm
mcp__claude-flow__swarm_init { topology: "star", maxAgents: 3 }
mcp__claude-flow__agent_spawn { type: "coordinator", name: "Issue Coordinator" }
mcp__claude-flow__agent_spawn { type: "researcher", name: "Requirements Analyst" }
mcp__claude-flow__agent_spawn { type: "coder", name: "Implementation Planner" }

// Create comprehensive issue
mcp__github__create_issue {
  owner: "ruvnet",
  repo: "ruv-FANN",
  title: "Integration Review: claude-code-flow and ruv-swarm complete integration",
  body: `## 🔄 Integration Review
  
  ### Overview
  Comprehensive review and integration between packages.
  
  ### Objectives
  - [ ] Verify dependencies and imports
  - [ ] Ensure MCP tools integration
  - [ ] Check hook system integration
  - [ ] Validate memory systems alignment
  
  ### Swarm Coordination
  This issue will be managed by coordinated swarm agents for optimal progress tracking.`,
  labels: ["integration", "review", "enhancement"],
  assignees: ["ruvnet"]
}

// Set up automated tracking
mcp__claude-flow__task_orchestrate {
  task: "Monitor and coordinate issue progress with automated updates",
  strategy: "adaptive",
  priority: "medium"
}
```

### 2. 自动进度更新
```javascript
// Update issue with progress from swarm memory
mcp__claude-flow__memory_usage {
  action: "retrieve",
  key: "issue/54$progress"
}

// Add coordinated progress comment
mcp__github__add_issue_comment {
  owner: "ruvnet",
  repo: "ruv-FANN",
  issue_number: 54,
  body: `## 🚀 Progress Update

  ### Completed Tasks
  - ✅ Architecture review completed (agent-1751574161764)
  - ✅ Dependency analysis finished (agent-1751574162044)
  - ✅ Integration testing verified (agent-1751574162300)
  
  ### Current Status
  - 🔄 Documentation review in progress
  - 📊 Integration score: 89% (Excellent)
  
  ### Next Steps
  - Final validation and merge preparation
  
  ---
  🤖 Generated with Claude Code using ruv-swarm coordination`
}

// Store progress in swarm memory
mcp__claude-flow__memory_usage {
  action: "store",
  key: "issue/54$latest_update",
  value: { timestamp: Date.now(), progress: "89%", status: "near_completion" }
}
```

### 3. 多 Issue 项目协调
```javascript
// Search and coordinate related issues
mcp__github__search_issues {
  q: "repo:ruvnet$ruv-FANN label:integration state:open",
  sort: "created",
  order: "desc"
}

// Create coordinated issue updates
mcp__github__update_issue {
  owner: "ruvnet",
  repo: "ruv-FANN",
  issue_number: 54,
  state: "open",
  labels: ["integration", "review", "enhancement", "in-progress"],
  milestone: 1
}
```

## 批量操作示例

### 完整 Issue 管理工作流：
```javascript
[Single Message - Issue Lifecycle Management]:
  // Initialize issue coordination swarm
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 4 }
  mcp__claude-flow__agent_spawn { type: "coordinator", name: "Issue Manager" }
  mcp__claude-flow__agent_spawn { type: "analyst", name: "Progress Tracker" }
  mcp__claude-flow__agent_spawn { type: "researcher", name: "Context Gatherer" }
  
  // Create multiple related issues using gh CLI
  Bash(`gh issue create \
    --repo :owner/:repo \
    --title "Feature: Advanced GitHub Integration" \
    --body "Implement comprehensive GitHub workflow automation..." \
    --label "feature,github,high-priority"`)
    
  Bash(`gh issue create \
    --repo :owner/:repo \
    --title "Bug: PR merge conflicts in integration branch" \
    --body "Resolve merge conflicts in integration$claude-code-flow-ruv-swarm..." \
    --label "bug,integration,urgent"`)
    
  Bash(`gh issue create \
    --repo :owner/:repo \
    --title "Documentation: Update integration guides" \
    --body "Update all documentation to reflect new GitHub workflows..." \
    --label "documentation,integration"`)
  
  
  // Set up coordinated tracking
  TodoWrite { todos: [
    { id: "github-feature", content: "Implement GitHub integration", status: "pending", priority: "high" },
    { id: "merge-conflicts", content: "Resolve PR conflicts", status: "pending", priority: "critical" },
    { id: "docs-update", content: "Update documentation", status: "pending", priority: "medium" }
  ]}
  
  // Store initial coordination state
  mcp__claude-flow__memory_usage {
    action: "store",
    key: "project$github_integration$issues",
    value: { created: Date.now(), total_issues: 3, status: "initialized" }
  }
```

## 智能 Issue 模板

### 集成 Issue 模板：
```markdown
## 🔄 Integration Task

### Overview
[Brief description of integration requirements]

### Objectives
- [ ] Component A integration
- [ ] Component B validation  
- [ ] Testing and verification
- [ ] Documentation updates

### Integration Areas
#### Dependencies
- [ ] Package.json updates
- [ ] Version compatibility
- [ ] Import statements

#### Functionality  
- [ ] Core feature integration
- [ ] API compatibility
- [ ] Performance validation

#### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] End-to-end validation

### Swarm Coordination
- **Coordinator**: Overall progress tracking
- **Analyst**: Technical validation
- **Tester**: Quality assurance
- **Documenter**: Documentation updates

### Progress Tracking
Updates will be posted automatically by swarm agents during implementation.

---
🤖 Generated with Claude Code
```

### 缺陷报告模板：
```markdown
## 🐛 Bug Report

### Problem Description
[Clear description of the issue]

### Expected Behavior
[What should happen]

### Actual Behavior  
[What actually happens]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Environment
- Package: [package name and version]
- Node.js: [version]
- OS: [operating system]

### Investigation Plan
- [ ] Root cause analysis
- [ ] Fix implementation
- [ ] Testing and validation
- [ ] Regression testing

### Swarm Assignment
- **Debugger**: Issue investigation
- **Coder**: Fix implementation
- **Tester**: Validation and testing

---
🤖 Generated with Claude Code
```

## 最佳实践

### 1. **Swarm 协同问题管理**
- 复杂问题始终初始化 `swarm`
- 根据问题类型分配专门代理
- 使用 `memory` 进行进度协调

### 2. **自动化进度跟踪**
- 通过 `swarm` 协调进行定期自动更新
- 进度指标与完成度跟踪
- 跨问题依赖关系管理

### 3. **智能标签与组织**
- 跨仓库采用一致的标签策略
- 基于优先级的问题排序与分配
- 与里程碑集成以进行项目协调

### 4. **批量问题操作**
- 同时创建多个相关问题
- 对项目范围变更进行批量更新
- 协调跨仓库问题管理

## 与其他模式的集成

### 与以下内容无缝集成：
- `$github pr-manager` - 将问题关联到拉取请求
- `$github release-manager` - 协调发布问题
- `$sparc orchestrator` - 复杂项目协调
- `$sparc tester` - 自动化测试流程

## 指标与分析

### 自动跟踪：
- 问题创建与解决时间
- 代理生产力指标
- 项目里程碑进度
- 跨仓库协调效率

### 报告功能：
- 每周进度摘要
- 代理性能分析
- 项目健康指标
- 集成成功率
