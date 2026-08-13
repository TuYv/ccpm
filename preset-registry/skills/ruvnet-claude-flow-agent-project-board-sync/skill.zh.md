---
name: agent-project-board-sync
description: Agent skill for project-board-sync - invoke with $agent-project-board-sync
---
---
name: project-board-sync
description: Synchronize AI swarms with GitHub Projects for visual task management, progress tracking, and team coordination
type: coordination
color: "#A8E6CF"
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
  - mcp__claude-flow__github_issue_track
  - mcp__claude-flow__github_metrics
  - mcp__claude-flow__workflow_create
  - mcp__claude-flow__workflow_execute
hooks:
  pre:
    - "gh auth status || (echo 'GitHub CLI not authenticated' && exit 1)"
    - "gh project list --owner @me --limit 1 >$dev$null || echo 'No projects accessible'"
    - "git status --porcelain || echo 'Not in git repository'"
    - "gh api user | jq -r '.login' || echo 'API access check'"
  post:
    - "gh project list --owner @me --limit 3 | head -5"
    - "gh issue list --limit 3 --json number,title,state"
    - "git branch --show-current || echo 'Not on a branch'"
    - "gh repo view --json name,description"
---

# 项目看板同步 - GitHub Projects 集成

## 概览
将 AI 集群与 GitHub Projects 同步，用于可视化任务管理、进度跟踪和团队协作。

## 核心特性

### 1. 看板初始化
```bash
# Connect swarm to GitHub Project using gh CLI
# Get project details
PROJECT_ID=$(gh project list --owner @me --format json | \
  jq -r '.projects[] | select(.title == "Development Board") | .id')

# Initialize swarm with project
npx ruv-swarm github board-init \
  --project-id "$PROJECT_ID" \
  --sync-mode "bidirectional" \
  --create-views "swarm-status,agent-workload,priority"

# Create project fields for swarm tracking
gh project field-create $PROJECT_ID --owner @me \
  --name "Swarm Status" \
  --data-type "SINGLE_SELECT" \
  --single-select-options "pending,in_progress,completed"
```

### 2. 任务同步
```bash
# Sync swarm tasks with project cards
npx ruv-swarm github board-sync \
  --map-status '{
    "todo": "To Do",
    "in_progress": "In Progress",
    "review": "Review",
    "done": "Done"
  }' \
  --auto-move-cards \
  --update-metadata
```

### 3. 实时更新
```bash
# Enable real-time board updates
npx ruv-swarm github board-realtime \
  --webhook-endpoint "https:/$api.example.com$github-sync" \
  --update-frequency "immediate" \
  --batch-updates false
```

## 配置

### 看板映射配置
```yaml
# .github$board-sync.yml
version: 1
project:
  name: "AI Development Board"
  number: 1
  
mapping:
  # Map swarm task status to board columns
  status:
    pending: "Backlog"
    assigned: "Ready"
    in_progress: "In Progress"
    review: "Review"
    completed: "Done"
    blocked: "Blocked"
    
  # Map agent types to labels
  agents:
    coder: "🔧 Development"
    tester: "🧪 Testing"
    analyst: "📊 Analysis"
    designer: "🎨 Design"
    architect: "🏗️ Architecture"
    
  # Map priority to project fields
  priority:
    critical: "🔴 Critical"
    high: "🟡 High"
    medium: "🟢 Medium"
    low: "⚪ Low"
    
  # Custom fields
  fields:
    - name: "Agent Count"
      type: number
      source: task.agents.length
    - name: "Complexity"
      type: select
      source: task.complexity
    - name: "ETA"
      type: date
      source: task.estimatedCompletion
```

### 视图配置
```javascript
// Custom board views
{
  "views": [
    {
      "name": "Swarm Overview",
      "type": "board",
      "groupBy": "status",
      "filters": ["is:open"],
      "sort": "priority:desc"
    },
    {
      "name": "Agent Workload",
      "type": "table",
      "groupBy": "assignedAgent",
      "columns": ["title", "status", "priority", "eta"],
      "sort": "eta:asc"
    },
    {
      "name": "Sprint Progress",
      "type": "roadmap",
      "dateField": "eta",
      "groupBy": "milestone"
    }
  ]
}
```

## 自动化功能

### 1. 自动分配
```bash
# Automatically assign cards to agents
npx ruv-swarm github board-auto-assign \
  --strategy "load-balanced" \
  --consider "expertise,workload,availability" \
  --update-cards
```

### 2. 进度跟踪
```bash
# Track and visualize progress
npx ruv-swarm github board-progress \
  --show "burndown,velocity,cycle-time" \
  --time-period "sprint" \
  --export-metrics
```

### 3. 智能卡片流转
```bash
# Intelligent card state transitions
npx ruv-swarm github board-smart-move \
  --rules '{
    "auto-progress": "when:all-subtasks-done",
    "auto-review": "when:tests-pass",
    "auto-done": "when:pr-merged"
  }'
```

## 看板命令

### 从 Issue 创建卡片
```bash
# Convert issues to project cards using gh CLI
# List issues with label
ISSUES=$(gh issue list --label "enhancement" --json number,title,body)

# Add issues to project
echo "$ISSUES" | jq -r '.[].number' | while read -r issue; do
  gh project item-add $PROJECT_ID --owner @me --url "https:/$github.com/$GITHUB_REPOSITORY$issues/$issue"
done

# Process with swarm
npx ruv-swarm github board-import-issues \
  --issues "$ISSUES" \
  --add-to-column "Backlog" \
  --parse-checklist \
  --assign-agents
```

### 批量操作
```bash
# Bulk card operations
npx ruv-swarm github board-bulk \
  --filter "status:blocked" \
  --action "add-label:needs-attention" \
  --notify-assignees
```

### 卡片模板
```bash
# Create cards from templates
npx ruv-swarm github board-template \
  --template "feature-development" \
  --variables '{
    "feature": "User Authentication",
    "priority": "high",
    "agents": ["architect", "coder", "tester"]
  }' \
  --create-subtasks
```

## 高级同步

### 1. 多看板同步
```bash
# Sync across multiple boards
npx ruv-swarm github multi-board-sync \
  --boards "Development,QA,Release" \
  --sync-rules '{
    "Development->QA": "when:ready-for-test",
    "QA->Release": "when:tests-pass"
  }'
```

### 2. 跨组织同步
```bash
# Sync boards across organizations
npx ruv-swarm github cross-org-sync \
  --source "org1/Project-A" \
  --target "org2/Project-B" \
  --field-mapping "custom" \
  --conflict-resolution "source-wins"
```

### 3. 外部工具集成
```bash
# Sync with external tools
npx ruv-swarm github board-integrate \
  --tool "jira" \
  --mapping "bidirectional" \
  --sync-frequency "5m" \
  --transform-rules "custom"
```

## 可视化与报告

### 看板分析
```bash
# Generate board analytics using gh CLI data
# Fetch project data
PROJECT_DATA=$(gh project item-list $PROJECT_ID --owner @me --format json)

# Get issue metrics
ISSUE_METRICS=$(echo "$PROJECT_DATA" | jq -r '.items[] | select(.content.type == "Issue")' | \
  while read -r item; do
    ISSUE_NUM=$(echo "$item" | jq -r '.content.number')
    gh issue view $ISSUE_NUM --json createdAt,closedAt,labels,assignees
  done)

# Generate analytics with swarm
npx ruv-swarm github board-analytics \
  --project-data "$PROJECT_DATA" \
  --issue-metrics "$ISSUE_METRICS" \
  --metrics "throughput,cycle-time,wip" \
  --group-by "agent,priority,type" \
  --time-range "30d" \
  --export "dashboard"
```

### 自定义仪表盘
```javascript
// Dashboard configuration
{
  "dashboard": {
    "widgets": [
      {
        "type": "chart",
        "title": "Task Completion Rate",
        "data": "completed-per-day",
        "visualization": "line"
      },
      {
        "type": "gauge",
        "title": "Sprint Progress",
        "data": "sprint-completion",
        "target": 100
      },
      {
        "type": "heatmap",
        "title": "Agent Activity",
        "data": "agent-tasks-per-day"
      }
    ]
  }
}
```

### 报表
```bash
# Generate reports
npx ruv-swarm github board-report \
  --type "sprint-summary" \
  --format "markdown" \
  --include "velocity,burndown,blockers" \
  --distribute "slack,email"
```

## 工作流集成

### 冲刺管理
```bash
# Manage sprints with swarms
npx ruv-swarm github sprint-manage \
  --sprint "Sprint 23" \
  --auto-populate \
  --capacity-planning \
  --track-velocity
```

### 里程碑跟踪
```bash
# Track milestone progress
npx ruv-swarm github milestone-track \
  --milestone "v2.0 Release" \
  --update-board \
  --show-dependencies \
  --predict-completion
```

### 发布计划
```bash
# Plan releases using board data
npx ruv-swarm github release-plan-board \
  --analyze-velocity \
  --estimate-completion \
  --identify-risks \
  --optimize-scope
```

## 团队协作

### 工作分配
```bash
# Distribute work among team
npx ruv-swarm github board-distribute \
  --strategy "skills-based" \
  --balance-workload \
  --respect-preferences \
  --notify-assignments
```

### 站会自动化
```bash
# Generate standup reports
npx ruv-swarm github standup-report \
  --team "frontend" \
  --include "yesterday,today,blockers" \
  --format "slack" \
  --schedule "daily-9am"
```

### 评审协调
```bash
# Coordinate reviews via board
npx ruv-swarm github review-coordinate \
  --board "Code Review" \
  --assign-reviewers \
  --track-feedback \
  --ensure-coverage
```

## 最佳实践

### 1. 看板组织
- 清晰的列定义
- 一致的标签体系
- 定期看板梳理
- 自动化规则

### 2. 数据完整性
- 双向同步校验
- 冲突解决策略
- 审计追踪
- 定期备份

### 3. 团队采纳
- 培训材料
- 清晰工作流
- 定期复盘
- 反馈闭环

## 故障排查

### 同步问题
```bash
# Diagnose sync problems
npx ruv-swarm github board-diagnose \
  --check "permissions,webhooks,rate-limits" \
  --test-sync \
  --show-conflicts
```

### 性能
```bash
# Optimize board performance
npx ruv-swarm github board-optimize \
  --analyze-size \
  --archive-completed \
  --index-fields \
  --cache-views
```

### 数据恢复
```bash
# Recover board data
npx ruv-swarm github board-recover \
  --backup-id "2024-01-15" \
  --restore-cards \
  --preserve-current \
  --merge-conflicts
```

## 示例

### 敏捷开发看板
```bash
# Setup agile board
npx ruv-swarm github agile-board \
  --methodology "scrum" \
  --sprint-length "2w" \
  --ceremonies "planning,review,retro" \
  --metrics "velocity,burndown"
```

### 看板流程看板
```bash
# Setup kanban board
npx ruv-swarm github kanban-board \
  --wip-limits '{
    "In Progress": 5,
    "Review": 3
  }' \
  --cycle-time-tracking \
  --continuous-flow
```

### 研究项目看板
```bash
# Setup research board
npx ruv-swarm github research-board \
  --phases "ideation,research,experiment,analysis,publish" \
  --track-citations \
  --collaborate-external
```

## 指标与KPI

### 性能指标
```bash
# Track board performance
npx ruv-swarm github board-kpis \
  --metrics '[
    "average-cycle-time",
    "throughput-per-sprint",
    "blocked-time-percentage",
    "first-time-pass-rate"
  ]' \
  --dashboard-url
```

### 团队指标
```bash
# Track team performance
npx ruv-swarm github team-metrics \
  --board "Development" \
  --per-member \
  --include "velocity,quality,collaboration" \
  --anonymous-option
```

另请参阅：[swarm-issue.md](.$swarm-issue.md), [multi-repo-swarm.md](.$multi-repo-swarm.md)
