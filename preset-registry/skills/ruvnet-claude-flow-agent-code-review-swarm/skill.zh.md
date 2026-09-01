---
name: agent-code-review-swarm
description: Agent skill for code-review-swarm - invoke with $agent-code-review-swarm
---
---
name: code-review-swarm
description: 部署专门化的 AI 代理执行全面且智能的代码评审，超越传统静态分析
tools: mcp__claude-flow__swarm_init, mcp__claude-flow__agent_spawn, mcp__claude-flow__task_orchestrate, Bash, Read, Write, TodoWrite
color: blue
type: development
capabilities:
  - 自动化多智能体代码评审
  - 安全漏洞分析
  - 性能瓶颈检测
  - 架构模式验证
  - 风格与规范执行
priority: high
hooks:
  pre: |
    echo "Starting code-review-swarm..."
    echo "Initializing multi-agent review system"
    gh auth status || (echo "GitHub CLI not authenticated" && exit 1)
  post: |
    echo "Completed code-review-swarm"
    echo "Review results posted to GitHub"
    echo "Quality gates evaluated"
---

# 代码评审群 - 使用 AI 代理进行自动化代码评审

## 概览
部署专门化的 AI 代理，执行全面且智能的代码评审，超越传统静态分析。

## 核心功能

### 1. 多智能体评审系统
```bash
# Initialize code review swarm with gh CLI
# Get PR details
PR_DATA=$(gh pr view 123 --json files,additions,deletions,title,body)
PR_DIFF=$(gh pr diff 123)

# Initialize swarm with PR context
npx ruv-swarm github review-init \
  --pr 123 \
  --pr-data "$PR_DATA" \
  --diff "$PR_DIFF" \
  --agents "security,performance,style,architecture,accessibility" \
  --depth comprehensive

# Post initial review status
gh pr comment 123 --body "🔍 Multi-agent code review initiated"
```

### 2. 专用评审代理

#### 安全代理
```bash
# Security-focused review with gh CLI
# Get changed files
CHANGED_FILES=$(gh pr view 123 --json files --jq '.files[].path')

# Run security review
SECURITY_RESULTS=$(npx ruv-swarm github review-security \
  --pr 123 \
  --files "$CHANGED_FILES" \
  --check "owasp,cve,secrets,permissions" \
  --suggest-fixes)

# Post security findings
if echo "$SECURITY_RESULTS" | grep -q "critical"; then
  # Request changes for critical issues
  gh pr review 123 --request-changes --body "$SECURITY_RESULTS"
  # Add security label
  gh pr edit 123 --add-label "security-review-required"
else
  # Post as comment for non-critical issues
  gh pr comment 123 --body "$SECURITY_RESULTS"
fi
```

#### 性能代理
```bash
# Performance analysis
npx ruv-swarm github review-performance \
  --pr 123 \
  --profile "cpu,memory,io" \
  --benchmark-against main \
  --suggest-optimizations
```

#### 架构代理
```bash
# Architecture review
npx ruv-swarm github review-architecture \
  --pr 123 \
  --check "patterns,coupling,cohesion,solid" \
  --visualize-impact \
  --suggest-refactoring
```

### 3. 评审配置
```yaml
# .github$review-swarm.yml
version: 1
review:
  auto-trigger: true
  required-agents:
    - security
    - performance
    - style
  optional-agents:
    - architecture
    - accessibility
    - i18n
  
  thresholds:
    security: block
    performance: warn
    style: suggest
    
  rules:
    security:
      - no-eval
      - no-hardcoded-secrets
      - proper-auth-checks
    performance:
      - no-n-plus-one
      - efficient-queries
      - proper-caching
    architecture:
      - max-coupling: 5
      - min-cohesion: 0.7
      - follow-patterns
```

## 评审代理

### 安全评审代理
```javascript
// Security checks performed
{
  "checks": [
    "SQL injection vulnerabilities",
    "XSS attack vectors",
    "Authentication bypasses",
    "Authorization flaws",
    "Cryptographic weaknesses",
    "Dependency vulnerabilities",
    "Secret exposure",
    "CORS misconfigurations"
  ],
  "actions": [
    "Block PR on critical issues",
    "Suggest secure alternatives",
    "Add security test cases",
    "Update security documentation"
  ]
}
```

### 性能评审代理
```javascript
// Performance analysis
{
  "metrics": [
    "Algorithm complexity",
    "Database query efficiency",
    "Memory allocation patterns",
    "Cache utilization",
    "Network request optimization",
    "Bundle size impact",
    "Render performance"
  ],
  "benchmarks": [
    "Compare with baseline",
    "Load test simulations",
    "Memory leak detection",
    "Bottleneck identification"
  ]
}
```

### 风格与规范代理
```javascript
// Style enforcement
{
  "checks": [
    "Code formatting",
    "Naming conventions",
    "Documentation standards",
    "Comment quality",
    "Test coverage",
    "Error handling patterns",
    "Logging standards"
  ],
  "auto-fix": [
    "Formatting issues",
    "Import organization",
    "Trailing whitespace",
    "Simple naming issues"
  ]
}
```

### 架构评审代理
```javascript
// Architecture analysis
{
  "patterns": [
    "Design pattern adherence",
    "SOLID principles",
    "DRY violations",
    "Separation of concerns",
    "Dependency injection",
    "Layer violations",
    "Circular dependencies"
  ],
  "metrics": [
    "Coupling metrics",
    "Cohesion scores",
    "Complexity measures",
    "Maintainability index"
  ]
}
```

## 高级评审功能

### 1. 上下文感知评审
```bash
# Review with full context
npx ruv-swarm github review-context \
  --pr 123 \
  --load-related-prs \
  --analyze-impact \
  --check-breaking-changes
```

### 2. 从历史中学习
```bash
# Learn from past reviews
npx ruv-swarm github review-learn \
  --analyze-past-reviews \
  --identify-patterns \
  --improve-suggestions \
  --reduce-false-positives
```

### 3. 跨 PR 分析
```bash
# Analyze related PRs together
npx ruv-swarm github review-batch \
  --prs "123,124,125" \
  --check-consistency \
  --verify-integration \
  --combined-impact
```

## 评审自动化

### 推送时自动评审
```yaml
# .github$workflows$auto-review.yml
name: Automated Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  swarm-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions$checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup GitHub CLI
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
          
      - name: Run Review Swarm
        run: |
          # Get PR context with gh CLI
          PR_NUM=${{ github.event.pull_request.number }}
          PR_DATA=$(gh pr view $PR_NUM --json files,title,body,labels)
          
          # Run swarm review
          REVIEW_OUTPUT=$(npx ruv-swarm github review-all \
            --pr $PR_NUM \
            --pr-data "$PR_DATA" \
            --agents "security,performance,style,architecture")
          
          # Post review results
          echo "$REVIEW_OUTPUT" | gh pr review $PR_NUM --comment -F -
          
          # Update PR status
          if echo "$REVIEW_OUTPUT" | grep -q "approved"; then
            gh pr review $PR_NUM --approve
          elif echo "$REVIEW_OUTPUT" | grep -q "changes-requested"; then
            gh pr review $PR_NUM --request-changes -b "See review comments above"
          fi
```

### 评审触发器
```javascript
// Custom review triggers
{
  "triggers": {
    "high-risk-files": {
      "paths": ["**$auth/**", "**$payment/**"],
      "agents": ["security", "architecture"],
      "depth": "comprehensive"
    },
    "performance-critical": {
      "paths": ["**$api/**", "**$database/**"],
      "agents": ["performance", "database"],
      "benchmarks": true
    },
    "ui-changes": {
      "paths": ["**$components/**", "**$styles/**"],
      "agents": ["accessibility", "style", "i18n"],
      "visual-tests": true
    }
  }
}
```

## 评审评论

### 智能评论生成
```bash
# Generate contextual review comments with gh CLI
# Get PR diff with context
PR_DIFF=$(gh pr diff 123 --color never)
PR_FILES=$(gh pr view 123 --json files)

# Generate review comments
COMMENTS=$(npx ruv-swarm github review-comment \
  --pr 123 \
  --diff "$PR_DIFF" \
  --files "$PR_FILES" \
  --style "constructive" \
  --include-examples \
  --suggest-fixes)

# Post comments using gh CLI
echo "$COMMENTS" | jq -c '.[]' | while read -r comment; do
  FILE=$(echo "$comment" | jq -r '.path')
  LINE=$(echo "$comment" | jq -r '.line')
  BODY=$(echo "$comment" | jq -r '.body')
  
  # Create review with inline comments
  gh api \
    --method POST \
    $repos/:owner/:repo$pulls/123$comments \
    -f path="$FILE" \
    -f line="$LINE" \
    -f body="$BODY" \
    -f commit_id="$(gh pr view 123 --json headRefOid -q .headRefOid)"
done
```

### 评论模板
```markdown
<!-- 安全问题模板 -->
🔒 **安全问题: [类型]**

**严重程度**: 🔴 Critical / 🟡 High / 🟢 Low

**描述**: 
[对安全问题的清晰说明]

**影响**:
[如果未修复可能产生的后果]

**建议修复**:
```language
[修复的代码示例]
```

**参考资料**:
- [OWASP Guide](link)
- [Security Best Practices](link)
```

### 批量评论管理
```bash
# 高效管理审查评论
npx ruv-swarm github review-comments \
  --pr 123 \
  --group-by "agent,severity" \
  --summarize \
  --resolve-outdated
```

## 与 CI/CD 集成

### 状态检查
```yaml
# Required status checks
protection_rules:
  required_status_checks:
    contexts:
      - "review-swarm$security"
      - "review-swarm$performance"
      - "review-swarm$architecture"
```

### 质量门禁
```bash
# Define quality gates
npx ruv-swarm github quality-gates \
  --define '{
    "security": {"threshold": "no-critical"},
    "performance": {"regression": "<5%"},
    "coverage": {"minimum": "80%"},
    "architecture": {"complexity": "<10"}
  }'
```

### 审查指标
```bash
# Track review effectiveness
npx ruv-swarm github review-metrics \
  --period 30d \
  --metrics "issues-found,false-positives,fix-rate" \
  --export-dashboard
```

## 最佳实践

### 1. 审查配置
- 定义清晰的审查标准
- 设置合适的阈值
- 配置 Agent 专业化
- 建立覆盖流程

### 2. 评论质量
- 提供可执行的反馈
- 包含代码示例
- 参考文档
- 保持语气礼貌

### 3. 性能
- 缓存分析结果
- 对大型 PR 进行增量审查
- 并行执行 Agents
- 智能聚合评论

## 高级功能

### 1. AI 学习
```bash
# Train on your codebase
npx ruv-swarm github review-train \
  --learn-patterns \
  --adapt-to-style \
  --improve-accuracy
```

### 2. 自定义审查 Agent
```javascript
// Create custom review agent
class CustomReviewAgent {
  async review(pr) {
    const issues = [];
    
    // Custom logic here
    if (await this.checkCustomRule(pr)) {
      issues.push({
        severity: 'warning',
        message: 'Custom rule violation',
        suggestion: 'Fix suggestion'
      });
    }
    
    return issues;
  }
}
```

### 3. 审查编排
```bash
# Orchestrate complex reviews
npx ruv-swarm github review-orchestrate \
  --strategy "risk-based" \
  --allocate-time-budget \
  --prioritize-critical
```

## 示例

### 安全关键 PR
```bash
# Auth system changes
npx ruv-swarm github review-init \
  --pr 456 \
  --agents "security,authentication,audit" \
  --depth "maximum" \
  --require-security-approval
```

### 性能敏感 PR
```bash
# Database optimization
npx ruv-swarm github review-init \
  --pr 789 \
  --agents "performance,database,caching" \
  --benchmark \
  --profile
```

### UI 组件 PR
```bash
# New component library
npx ruv-swarm github review-init \
  --pr 321 \
  --agents "accessibility,style,i18n,docs" \
  --visual-regression \
  --component-tests
```

## 监控与分析

### 审查仪表盘
```bash
# Launch review dashboard
npx ruv-swarm github review-dashboard \
  --real-time \
  --show "agent-activity,issue-trends,fix-rates"
```

### 审查报告
```bash
# Generate review reports
npx ruv-swarm github review-report \
  --format "markdown" \
  --include "summary,details,trends" \
  --email-stakeholders
```

也可参见: [swarm-pr.md](.$swarm-pr.md), [workflow-automation.md](.$workflow-automation.md)
