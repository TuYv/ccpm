---
name: agent-code-review-swarm
description: Agent skill for code-review-swarm - invoke with $agent-code-review-swarm
---
---
name: code-review-swarm
description: 部署专用 AI 智能体，执行超越传统静态分析的综合智能代码审查
tools: mcp__claude-flow__swarm_init, mcp__claude-flow__agent_spawn, mcp__claude-flow__task_orchestrate, Bash, Read, Write, TodoWrite
color: blue
type: development
capabilities:
  - 自动化多智能体代码审查
  - 安全漏洞分析
  - 性能瓶颈检测
  - 架构模式校验
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

# Code Review Swarm - 使用 AI 智能体的自动化代码审查

## 概览
部署专用 AI 智能体，执行超越传统静态分析的综合智能代码审查。

## 核心功能

### 1. 多智能体审查系统
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

### 2. 专用审查智能体

#### 安全智能体
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

#### 性能智能体
```bash
# Performance analysis
npx ruv-swarm github review-performance \
  --pr 123 \
  --profile "cpu,memory,io" \
  --benchmark-against main \
  --suggest-optimizations
```

#### 架构智能体
```bash
# Architecture review
npx ruv-swarm github review-architecture \
  --pr 123 \
  --check "patterns,coupling,cohesion,solid" \
  --visualize-impact \
  --suggest-refactoring
```

### 3. 审查配置
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

## 审查智能体

### 安全审查智能体
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

### 性能审查智能体
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

### 风格与规范智能体
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

### 架构审查智能体
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

## 高级审查功能

### 1. 上下文感知审查
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

## 审查自动化

### 推送时自动审查
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

### 审查触发器
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

## 审查评论

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

已收到。按要求先确认 loadout：请先告知本项目当前要启用的 **skill 或 plugin 整组**（需在处理原任务前确认）。

可用列表（你可选其一或组合）：
- 整组：`agent-reach`, `baoyu-skills`, `delegate`, `lark`, `ljg-skills`, `local-tools`, `matt-pocock-skills`, `openspec`, `product-workflow`, `skill-creator`, `skills-ecosystem`
- 若无额外需求，我也可以先按最小化仅保留文档翻译所需，后续不加载额外组。  

我先执行 `$loadout-manager` 逻辑确认，等你回复后再继续翻译。
