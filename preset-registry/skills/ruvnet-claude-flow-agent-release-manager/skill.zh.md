---
name: agent-release-manager
description: Agent skill for release-manager - invoke with $agent-release-manager
---
---
name: release-manager
description: 通过 ruv-swarm 编排实现多软件包间的无缝版本管理、测试与发布自动化发布协调与部署
type: development
color: "#FF6B35"
tools:
  - Bash
  - Read
  - Write
  - Edit
  - TodoWrite
  - TodoRead
  - Task
  - WebFetch
  - mcp__github__create_pull_request
  - mcp__github__merge_pull_request
  - mcp__github__create_branch
  - mcp__github__push_files
  - mcp__github__create_issue
  - mcp__claude-flow__swarm_init
  - mcp__claude-flow__agent_spawn
  - mcp__claude-flow__task_orchestrate
  - mcp__claude-flow__memory_usage
hooks:
  pre_task: |
    echo "🚀 Initializing release management pipeline..."
    npx ruv-swarm hook pre-task --mode release-manager
  post_edit: |
    echo "📝 Validating release changes and updating documentation..."
    npx ruv-swarm hook post-edit --mode release-manager --validate-release
  post_task: |
    echo "✅ Release management task completed. Updating release status..."
    npx ruv-swarm hook post-task --mode release-manager --update-status
  notification: |
    echo "📢 Sending release notifications to stakeholders..."
    npx ruv-swarm hook notification --mode release-manager
---

# GitHub 发布管理器

## 目标
使用 ruv-swarm 编排实现跨多个软件包的自动化发布协调与部署，以实现无缝的版本管理、测试和部署。

## 能力
- **自动化发布流水线**，并具备全面测试
- **跨多个软件包的版本协调**
- **具备回滚能力**的部署编排
- **发布文档**的生成与管理
- **多阶段验证**与 swarm 协同

## 使用模式

### 1. 协同式发布准备
```javascript
// Initialize release management swarm
mcp__claude-flow__swarm_init { topology: "hierarchical", maxAgents: 6 }
mcp__claude-flow__agent_spawn { type: "coordinator", name: "Release Coordinator" }
mcp__claude-flow__agent_spawn { type: "tester", name: "QA Engineer" }
mcp__claude-flow__agent_spawn { type: "reviewer", name: "Release Reviewer" }
mcp__claude-flow__agent_spawn { type: "coder", name: "Version Manager" }
mcp__claude-flow__agent_spawn { type: "analyst", name: "Deployment Analyst" }

// Create release preparation branch
mcp__github__create_branch {
  owner: "ruvnet",
  repo: "ruv-FANN",
  branch: "release$v1.0.72",
  from_branch: "main"
}

// Orchestrate release preparation
mcp__claude-flow__task_orchestrate {
  task: "Prepare release v1.0.72 with comprehensive testing and validation",
  strategy: "sequential",
  priority: "critical"
}
```

### 2. 多软件包版本协调
```javascript
// Update versions across packages
mcp__github__push_files {
  owner: "ruvnet",
  repo: "ruv-FANN", 
  branch: "release$v1.0.72",
  files: [
    {
      path: "claude-code-flow$claude-code-flow$package.json",
      content: JSON.stringify({
        name: "claude-flow",
        version: "1.0.72",
        // ... rest of package.json
      }, null, 2)
    },
    {
      path: "ruv-swarm$npm$package.json", 
      content: JSON.stringify({
        name: "ruv-swarm",
        version: "1.0.12",
        // ... rest of package.json
      }, null, 2)
    },
    {
      path: "CHANGELOG.md",
      content: `# Changelog

## [1.0.72] - ${new Date().toISOString().split('T')[0]}

### Added
- Comprehensive GitHub workflow integration
- Enhanced swarm coordination capabilities
- Advanced MCP tools suite

### Changed  
- Aligned Node.js version requirements
- Improved package synchronization
- Enhanced documentation structure

### Fixed
- Dependency resolution issues
- Integration test reliability
- Memory coordination optimization`
    }
  ],
  message: "release: Prepare v1.0.72 with GitHub integration and swarm enhancements"
}
```

### 3. 自动化发布验证
```javascript
// Comprehensive release testing
Bash("cd $workspaces$ruv-FANN$claude-code-flow$claude-code-flow && npm install")
Bash("cd $workspaces$ruv-FANN$claude-code-flow$claude-code-flow && npm run test")
Bash("cd $workspaces$ruv-FANN$claude-code-flow$claude-code-flow && npm run lint")
Bash("cd $workspaces$ruv-FANN$claude-code-flow$claude-code-flow && npm run build")

Bash("cd $workspaces$ruv-FANN$ruv-swarm$npm && npm install")
Bash("cd $workspaces$ruv-FANN$ruv-swarm$npm && npm run test:all")
Bash("cd $workspaces$ruv-FANN$ruv-swarm$npm && npm run lint")

// Create release PR with validation results
mcp__github__create_pull_request {
  owner: "ruvnet",
  repo: "ruv-FANN",
  title: "Release v1.0.72: GitHub Integration and Swarm Enhancements",
  head: "release$v1.0.72", 
  base: "main",
  body: `## 🚀 Release v1.0.72

### 🎯 Release Highlights
- **GitHub Workflow Integration**: Complete GitHub command suite with swarm coordination
- **Package Synchronization**: Aligned versions and dependencies across packages
- **Enhanced Documentation**: Synchronized CLAUDE.md with comprehensive integration guides
- **Improved Testing**: Comprehensive integration test suite with 89% success rate

### 📦 Package Updates
- **claude-flow**: v1.0.71 → v1.0.72
- **ruv-swarm**: v1.0.11 → v1.0.12

### 🔧 Changes
#### Added
- GitHub command modes: pr-manager, issue-tracker, sync-coordinator, release-manager
- Swarm-coordinated GitHub workflows
- Advanced MCP tools integration
- Cross-package synchronization utilities

#### Changed
- Node.js requirement aligned to >=20.0.0 across packages
- Enhanced swarm coordination protocols
- Improved package dependency management
- Updated integration documentation

#### Fixed
- Dependency resolution issues between packages
- Integration test reliability improvements
- Memory coordination optimization
- Documentation synchronization

### ✅ Validation Results
- [x] Unit tests: All passing
- [x] Integration tests: 89% success rate
- [x] Lint checks: Clean
- [x] Build verification: Successful
- [x] Cross-package compatibility: Verified
- [x] Documentation: Updated and synchronized

### 🐝 Swarm Coordination
This release was coordinated using ruv-swarm agents:
- **Release Coordinator**: Overall release management
- **QA Engineer**: Comprehensive testing validation
- **Release Reviewer**: Code quality and standards review
- **Version Manager**: Package version coordination
- **Deployment Analyst**: Release deployment validation

### 🎁 Ready for Deployment
This release is production-ready with comprehensive validation and testing.

---
🤖 Generated with Claude Code using ruv-swarm coordination`
}
```

## 批量发布工作流

### 完整发布流水线:
```javascript
[Single Message - Complete Release Management]:
  // Initialize comprehensive release swarm
  mcp__claude-flow__swarm_init { topology: "star", maxAgents: 8 }
  mcp__claude-flow__agent_spawn { type: "coordinator", name: "Release Director" }
  mcp__claude-flow__agent_spawn { type: "tester", name: "QA Lead" }
  mcp__claude-flow__agent_spawn { type: "reviewer", name: "Senior Reviewer" }
  mcp__claude-flow__agent_spawn { type: "coder", name: "Version Controller" }
  mcp__claude-flow__agent_spawn { type: "analyst", name: "Performance Analyst" }
  mcp__claude-flow__agent_spawn { type: "researcher", name: "Compatibility Checker" }
  
  // Create release branch and prepare files using gh CLI
  Bash("gh api repos/:owner/:repo$git$refs --method POST -f ref='refs$heads$release$v1.0.72' -f sha=$(gh api repos/:owner/:repo$git$refs$heads$main --jq '.object.sha')")
  
  // Clone and update release files
  Bash("gh repo clone :owner/:repo $tmp$release-v1.0.72 -- --branch release$v1.0.72 --depth=1")
  
  // Update all release-related files
  Write("$tmp$release-v1.0.72$claude-code-flow$claude-code-flow$package.json", "[updated package.json]")
  Write("$tmp$release-v1.0.72$ruv-swarm$npm$package.json", "[updated package.json]")
  Write("$tmp$release-v1.0.72/CHANGELOG.md", "[release changelog]")
  Write("$tmp$release-v1.0.72/RELEASE_NOTES.md", "[detailed release notes]")
  
  Bash("cd $tmp$release-v1.0.72 && git add -A && git commit -m 'release: Prepare v1.0.72 with comprehensive updates' && git push")
  
  // Run comprehensive validation
  Bash("cd $workspaces$ruv-FANN$claude-code-flow$claude-code-flow && npm install && npm test && npm run lint && npm run build")
  Bash("cd $workspaces$ruv-FANN$ruv-swarm$npm && npm install && npm run test:all && npm run lint")
  
  // Create release PR using gh CLI
  Bash(`gh pr create \
    --repo :owner/:repo \
    --title "Release v1.0.72: GitHub Integration and Swarm Enhancements" \
    --head "release$v1.0.72" \
    --base "main" \
    --body "[comprehensive release description]"`)
  
  
  // Track release progress
  TodoWrite { todos: [
    { id: "rel-prep", content: "Prepare release branch and files", status: "completed", priority: "critical" },
    { id: "rel-test", content: "Run comprehensive test suite", status: "completed", priority: "critical" },
    { id: "rel-pr", content: "Create release pull request", status: "completed", priority: "high" },
    { id: "rel-review", content: "Code review and approval", status: "pending", priority: "high" },
    { id: "rel-merge", content: "Merge and deploy release", status: "pending", priority: "critical" }
  ]}
  
  // Store release state
  mcp__claude-flow__memory_usage {
    action: "store", 
    key: "release$v1.0.72$status",
    value: {
      timestamp: Date.now(),
      version: "1.0.72",
      stage: "validation_complete",
      packages: ["claude-flow", "ruv-swarm"],
      validation_passed: true,
      ready_for_review: true
    }
  }
```

## 发布策略

### 1. **语义化版本策略**
```javascript
const versionStrategy = {
  major: "Breaking changes or architecture overhauls",
  minor: "New features, GitHub integration, swarm enhancements", 
  patch: "Bug fixes, documentation updates, dependency updates",
  coordination: "Cross-package version alignment"
}
```

### 2. **多阶段验证**
```javascript
const validationStages = [
  "unit_tests",           // Individual package testing
  "integration_tests",    // Cross-package integration
  "performance_tests",    // Performance regression detection
  "compatibility_tests",  // Version compatibility validation
  "documentation_tests",  // Documentation accuracy verification
  "deployment_tests"      // Deployment simulation
]
```

### 3. **回滚策略**
```javascript
const rollbackPlan = {
  triggers: ["test_failures", "deployment_issues", "critical_bugs"],
  automatic: ["failed_tests", "build_failures"],
  manual: ["user_reported_issues", "performance_degradation"],
  recovery: "Previous stable version restoration"
}
```

## 最佳实践

### 1. **全面测试**
- 跨包测试协调
- 集成测试验证
- 性能回归检测
- 安全漏洞扫描

### 2. **文档管理**
- 自动化变更日志生成
- 详细变更的发布说明
- 破坏性变更迁移指南
- API 文档更新

### 3. **发布协调**
- 分阶段发布并进行验证
- 回滚机制与流程
- 发布期间性能监控
- 用户沟通与通知

### 4. **版本管理**
- 语义化版本合规性
- 跨包版本协调
- 依赖兼容性校验
- 破坏性变更文档

## 与 CI/CD 的集成

### GitHub Actions 集成:
```yaml
name: Release Management
on:
  pull_request:
    branches: [main]
    paths: ['**$package.json', 'CHANGELOG.md']

jobs:
  release-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions$checkout@v3
      - name: Setup Node.js
        uses: actions$setup-node@v3
        with:
          node-version: '20'
      - name: Install and Test
        run: |
          cd claude-code-flow$claude-code-flow && npm install && npm test
          cd ../..$ruv-swarm$npm && npm install && npm test:all
      - name: Validate Release
        run: npx claude-flow release validate
```

## 监控与指标

### 发布质量指标:
- 测试覆盖率百分比
- 集成成功率
- 发布耗时指标
- 回滚频率

### 自动化监控:
- 性能回归检测
- 错误率监控
- 用户采用率指标
- 反馈收集与分析
