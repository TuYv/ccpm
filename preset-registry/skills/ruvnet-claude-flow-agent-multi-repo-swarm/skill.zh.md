---
name: agent-multi-repo-swarm
description: Agent skill for multi-repo-swarm - invoke with $agent-multi-repo-swarm
---
---
name: multi-repo-swarm
description: 面向组织级自动化与智能协作的跨仓库 Swarm 编排
type: coordination
color: "#FF6B35"
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
  - mcp__claude-flow__github_repo_analyze
  - mcp__claude-flow__github_pr_manage
  - mcp__claude-flow__github_sync_coord
  - mcp__claude-flow__github_metrics
hooks:
  pre:
    - "gh auth status || (echo 'GitHub CLI not authenticated' && exit 1)"
    - "git status --porcelain || echo 'Not in git repository'"
    - "gh repo list --limit 1 >$dev$null || (echo 'No repo access' && exit 1)"
  post:
    - "gh pr list --state open --limit 5 | grep -q . && echo 'Active PRs found'"
    - "git log --oneline -5 | head -3"
    - "gh repo view --json name,description,topics"
---

# Multi-Repo Swarm - 跨仓库 Swarm 编排

## 概览
在多个仓库之间协调 AI Swarm，实现组织级自动化和智能的跨项目协作。

## 核心功能

### 1. 跨仓库初始化
```bash
# Initialize multi-repo swarm with gh CLI
# List organization repositories
REPOS=$(gh repo list org --limit 100 --json name,description,languages \
  --jq '.[] | select(.name | test("frontend|backend|shared"))')

# Get repository details
REPO_DETAILS=$(echo "$REPOS" | jq -r '.name' | while read -r repo; do
  gh api repos$org/$repo --jq '{name, default_branch, languages, topics}'
done | jq -s '.')

# Initialize swarm with repository context
npx ruv-swarm github multi-repo-init \
  --repo-details "$REPO_DETAILS" \
  --repos "org$frontend,org$backend,org$shared" \
  --topology hierarchical \
  --shared-memory \
  --sync-strategy eventual
```

### 2. 仓库发现
```bash
# Auto-discover related repositories with gh CLI
# Search organization repositories
REPOS=$(gh repo list my-organization --limit 100 \
  --json name,description,languages,topics \
  --jq '.[] | select(.languages | keys | contains(["TypeScript"]))')

# Analyze repository dependencies
DEPS=$(echo "$REPOS" | jq -r '.name' | while read -r repo; do
  # Get package.json if it exists
  if gh api repos$my-organization/$repo$contents$package.json --jq '.content' 2>$dev$null; then
    gh api repos$my-organization/$repo$contents$package.json \
      --jq '.content' | base64 -d | jq '{name, dependencies, devDependencies}'
  fi
done | jq -s '.')

# Discover and analyze
npx ruv-swarm github discover-repos \
  --repos "$REPOS" \
  --dependencies "$DEPS" \
  --analyze-dependencies \
  --suggest-swarm-topology
```

### 3. 同步操作
```bash
# Execute synchronized changes across repos with gh CLI
# Get matching repositories
MATCHING_REPOS=$(gh repo list org --limit 100 --json name \
  --jq '.[] | select(.name | test("-service$")) | .name')

# Execute task and create PRs
echo "$MATCHING_REPOS" | while read -r repo; do
  # Clone repo
  gh repo clone org/$repo $tmp/$repo -- --depth=1
  
  # Execute task
  cd $tmp/$repo
  npx ruv-swarm github task-execute \
    --task "update-dependencies" \
    --repo "org/$repo"
  
  # Create PR if changes exist
  if [[ -n $(git status --porcelain) ]]; then
    git checkout -b update-dependencies-$(date +%Y%m%d)
    git add -A
    git commit -m "chore: Update dependencies"
    
    # Push and create PR
    git push origin HEAD
    PR_URL=$(gh pr create \
      --title "Update dependencies" \
      --body "Automated dependency update across services" \
      --label "dependencies,automated")
    
    echo "$PR_URL" >> $tmp$created-prs.txt
  fi
  cd -
done

# Link related PRs
PR_URLS=$(cat $tmp$created-prs.txt)
npx ruv-swarm github link-prs --urls "$PR_URLS"
```

## 配置

### 多仓库配置文件
```yaml
# .swarm$multi-repo.yml
version: 1
organization: my-org
repositories:
  - name: frontend
    url: github.com$my-org$frontend
    role: ui
    agents: [coder, designer, tester]
    
  - name: backend
    url: github.com$my-org$backend
    role: api
    agents: [architect, coder, tester]
    
  - name: shared
    url: github.com$my-org$shared
    role: library
    agents: [analyst, coder]

coordination:
  topology: hierarchical
  communication: webhook
  memory: redis:/$shared-memory
  
dependencies:
  - from: frontend
    to: [backend, shared]
  - from: backend
    to: [shared]
```

### 仓库角色
```javascript
// Define repository roles and responsibilities
{
  "roles": {
    "ui": {
      "responsibilities": ["user-interface", "ux", "accessibility"],
      "default-agents": ["designer", "coder", "tester"]
    },
    "api": {
      "responsibilities": ["endpoints", "business-logic", "data"],
      "default-agents": ["architect", "coder", "security"]
    },
    "library": {
      "responsibilities": ["shared-code", "utilities", "types"],
      "default-agents": ["analyst", "coder", "documenter"]
    }
  }
}
```

## 编排命令

### 依赖管理
```bash
# Update dependencies across all repos with gh CLI
# Create tracking issue first
TRACKING_ISSUE=$(gh issue create \
  --title "Dependency Update: typescript@5.0.0" \
  --body "Tracking issue for updating TypeScript across all repositories" \
  --label "dependencies,tracking" \
  --json number -q .number)

# Get all repos with TypeScript
TS_REPOS=$(gh repo list org --limit 100 --json name | jq -r '.[].name' | \
  while read -r repo; do
    if gh api repos$org/$repo$contents$package.json 2>$dev$null | \
       jq -r '.content' | base64 -d | grep -q '"typescript"'; then
      echo "$repo"
    fi
  done)

# Update each repository
echo "$TS_REPOS" | while read -r repo; do
  # Clone and update
  gh repo clone org/$repo $tmp/$repo -- --depth=1
  cd $tmp/$repo
  
  # Update dependency
  npm install --save-dev typescript@5.0.0
  
  # Test changes
  if npm test; then
    # Create PR
    git checkout -b update-typescript-5
    git add package.json package-lock.json
    git commit -m "chore: Update TypeScript to 5.0.0

Part of #$TRACKING_ISSUE"
    
    git push origin HEAD
    gh pr create \
      --title "Update TypeScript to 5.0.0" \
      --body "Updates TypeScript to version 5.0.0\n\nTracking: #$TRACKING_ISSUE" \
      --label "dependencies"
  else
    # Report failure
    gh issue comment $TRACKING_ISSUE \
      --body "❌ Failed to update $repo - tests failing"
  fi
  cd -
done
```

### 重构操作
```bash
# Coordinate large-scale refactoring
npx ruv-swarm github multi-repo-refactor \
  --pattern "rename:OldAPI->NewAPI" \
  --analyze-impact \
  --create-migration-guide \
  --staged-rollout
```

### 安全更新
```bash
# Coordinate security patches
npx ruv-swarm github multi-repo-security \
  --scan-all \
  --patch-vulnerabilities \
  --verify-fixes \
  --compliance-report
```

## 协作策略

### 1. 基于 Webhook 的协调
```javascript
// webhook-coordinator.js
const { MultiRepoSwarm } = require('ruv-swarm');

const swarm = new MultiRepoSwarm({
  webhook: {
    url: 'https:/$swarm-coordinator.example.com',
    secret: process.env.WEBHOOK_SECRET
  }
});

// Handle cross-repo events
swarm.on('repo:update', async (event) => {
  await swarm.propagate(event, {
    to: event.dependencies,
    strategy: 'eventual-consistency'
  });
});
```

### 2. GraphQL Federation
```graphql
# Federated schema for multi-repo queries
type Repository @key(fields: "id") {
  id: ID!
  name: String!
  swarmStatus: SwarmStatus!
  dependencies: [Repository!]!
  agents: [Agent!]!
}

type SwarmStatus {
  active: Boolean!
  topology: Topology!
  tasks: [Task!]!
  memory: JSON!
}
```

### 3. 事件流
```yaml
# Kafka configuration for real-time coordination
kafka:
  brokers: ['kafka1:9092', 'kafka2:9092']
  topics:
    swarm-events: 
      partitions: 10
      replication: 3
    swarm-memory:
      partitions: 5
      replication: 3
```

## 高级功能

### 1. 分布式任务队列
```bash
# Create distributed task queue
npx ruv-swarm github multi-repo-queue \
  --backend redis \
  --workers 10 \
  --priority-routing \
  --dead-letter-queue
```

### 2. 跨仓库测试
```bash
# Run integration tests across repos
npx ruv-swarm github multi-repo-test \
  --setup-test-env \
  --link-services \
  --run-e2e \
  --tear-down
```

### 3. Monorepo 迁移
```bash
# Assist in monorepo migration
npx ruv-swarm github to-monorepo \
  --analyze-repos \
  --suggest-structure \
  --preserve-history \
  --create-migration-prs
```

## 监控与可视化

### 多仓库仪表盘
```bash
# Launch monitoring dashboard
npx ruv-swarm github multi-repo-dashboard \
  --port 3000 \
  --metrics "agent-activity,task-progress,memory-usage" \
  --real-time
```

### 依赖关系图
```bash
# Visualize repo dependencies
npx ruv-swarm github dep-graph \
  --format mermaid \
  --include-agents \
  --show-data-flow
```

### 健康监控
```bash
# Monitor swarm health across repos
npx ruv-swarm github health-check \
  --repos "org/*" \
  --check "connectivity,memory,agents" \
  --alert-on-issues
```

## 同步模式

### 1. 最终一致性
```javascript
// Eventual consistency for non-critical updates
{
  "sync": {
    "strategy": "eventual",
    "max-lag": "5m",
    "retry": {
      "attempts": 3,
      "backoff": "exponential"
    }
  }
}
```

### 2. 强一致性
```javascript
// Strong consistency for critical operations
{
  "sync": {
    "strategy": "strong",
    "consensus": "raft",
    "quorum": 0.51,
    "timeout": "30s"
  }
}
```

### 3. 混合方案
```javascript
// Mix of consistency levels
{
  "sync": {
    "default": "eventual",
    "overrides": {
      "security-updates": "strong",
      "dependency-updates": "strong",
      "documentation": "eventual"
    }
  }
}
```

## 使用场景

### 1. 微服务协调
```bash
# Coordinate microservices development
npx ruv-swarm github microservices \
  --services "auth,users,orders,payments" \
  --ensure-compatibility \
  --sync-contracts \
  --integration-tests
```

### 2. 库更新
```bash
# Update shared library across consumers
npx ruv-swarm github lib-update \
  --library "org$shared-lib" \
  --version "2.0.0" \
  --find-consumers \
  --update-imports \
  --run-tests
```

### 3. 组织级变更
```bash
# Apply org-wide policy changes
npx ruv-swarm github org-policy \
  --policy "add-security-headers" \
  --repos "org/*" \
  --validate-compliance \
  --create-reports
```

## 最佳实践

### 1. 仓库组织
- 清晰的仓库角色和边界
- 一致的命名规范
- 已记录的依赖关系
- 统一的共享配置标准

### 2. 通信
- 使用合适的同步策略
- 实施断路器
- 监控延迟和故障
- 清晰的错误传播

### 3. 安全
- 安全的跨仓库身份认证
- 加密通信通道
- 所有操作的审计追踪
- 最小权限原则

## 性能优化

### 缓存策略
```bash
# Implement cross-repo caching
npx ruv-swarm github cache-strategy \
  --analyze-patterns \
  --suggest-cache-layers \
  --implement-invalidation
```

### 并行执行
```bash
# Optimize parallel operations
npx ruv-swarm github parallel-optimize \
  --analyze-dependencies \
  --identify-parallelizable \
  --execute-optimal
```

### 资源池化
```bash
# Pool resources across repos
npx ruv-swarm github resource-pool \
  --share-agents \
  --distribute-load \
  --monitor-usage
```

## 故障排查

### 连接问题
```bash
# Diagnose connectivity problems
npx ruv-swarm github diagnose-connectivity \
  --test-all-repos \
  --check-permissions \
  --verify-webhooks
```

### 内存同步
```bash
# Debug memory sync issues
npx ruv-swarm github debug-memory \
  --check-consistency \
  --identify-conflicts \
  --repair-state
```

### 性能瓶颈
```bash
# Identify performance issues
npx ruv-swarm github perf-analysis \
  --profile-operations \
  --identify-bottlenecks \
  --suggest-optimizations
```

## 示例

### 全栈应用更新
```bash
# Update full-stack application
npx ruv-swarm github fullstack-update \
  --frontend "org$web-app" \
  --backend "org$api-server" \
  --database "org$db-migrations" \
  --coordinate-deployment
```

### 跨团队协作
```bash
# Facilitate cross-team work
npx ruv-swarm github cross-team \
  --teams "frontend,backend,devops" \
  --task "implement-feature-x" \
  --assign-by-expertise \
  --track-progress
```

另见：[swarm-pr.md](.$swarm-pr.md), [project-board-sync.md](.$project-board-sync.md)
