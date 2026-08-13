---
name: agent-release-swarm
description: Agent skill for release-swarm - invoke with $agent-release-swarm
---
---
name: release-swarm
description: 使用 AI 群体编排复杂的软件发布，处理从变更日志生成到多平台部署的全部流程
type: coordination
color: "#4ECDC4"
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
  - mcp__claude-flow__parallel_execute
  - mcp__claude-flow__load_balance
hooks:
  pre_task: |
    echo "🐝 Initializing release swarm coordination..."
    npx ruv-swarm hook pre-task --mode release-swarm --init-swarm
  post_edit: |
    echo "🔄 Synchronizing release swarm state and validating changes..."
    npx ruv-swarm hook post-edit --mode release-swarm --sync-swarm
  post_task: |
    echo "🎯 Release swarm task completed. Coordinating final deployment..."
    npx ruv-swarm hook post-task --mode release-swarm --finalize-release
  notification: |
    echo "📡 Broadcasting release completion across all swarm agents..."
    npx ruv-swarm hook notification --mode release-swarm --broadcast
---

# Release Swarm - 智能发布自动化

## 概览
使用 AI 蜂群编排复杂的软件发布，处理从变更日志生成到多平台部署的全部内容。

## 核心功能

### 1. 发布规划
```bash
# Plan next release using gh CLI
# Get commit history since last release
LAST_TAG=$(gh release list --limit 1 --json tagName -q '.[0].tagName')
COMMITS=$(gh api repos/:owner/:repo$compare/${LAST_TAG}...HEAD --jq '.commits')

# Get merged PRs
MERGED_PRS=$(gh pr list --state merged --base main --json number,title,labels,mergedAt \
  --jq ".[] | select(.mergedAt > \"$(gh release view $LAST_TAG --json publishedAt -q .publishedAt)\")")  

# Plan release with commit analysis
npx ruv-swarm github release-plan \
  --commits "$COMMITS" \
  --merged-prs "$MERGED_PRS" \
  --analyze-commits \
  --suggest-version \
  --identify-breaking \
  --generate-timeline
```

### 2. 自动化版本管理
```bash
# Smart version bumping
npx ruv-swarm github release-version \
  --strategy "semantic" \
  --analyze-changes \
  --check-breaking \
  --update-files
```

### 3. 发布编排
```bash
# Full release automation with gh CLI
# Generate changelog from PRs and commits
CHANGELOG=$(gh api repos/:owner/:repo$compare/${LAST_TAG}...HEAD \
  --jq '.commits[].commit.message' | \
  npx ruv-swarm github generate-changelog)

# Create release draft
gh release create v2.0.0 \
  --draft \
  --title "Release v2.0.0" \
  --notes "$CHANGELOG" \
  --target main

# Run release orchestration
npx ruv-swarm github release-create \
  --version "2.0.0" \
  --changelog "$CHANGELOG" \
  --build-artifacts \
  --deploy-targets "npm,docker,github"

# Publish release after validation
gh release edit v2.0.0 --draft=false

# Create announcement issue
gh issue create \
  --title "🎉 Released v2.0.0" \
  --body "$CHANGELOG" \
  --label "announcement,release"
```

## 发布配置

### 发布配置文件
```yaml
# .github$release-swarm.yml
version: 1
release:
  versioning:
    strategy: semantic
    breaking-keywords: ["BREAKING", "!"]
    
  changelog:
    sections:
      - title: "🚀 Features"
        labels: ["feature", "enhancement"]
      - title: "🐛 Bug Fixes"
        labels: ["bug", "fix"]
      - title: "📚 Documentation"
        labels: ["docs", "documentation"]
        
  artifacts:
    - name: npm-package
      build: npm run build
      publish: npm publish
      
    - name: docker-image
      build: docker build -t app:$VERSION .
      publish: docker push app:$VERSION
      
    - name: binaries
      build: .$scripts$build-binaries.sh
      upload: github-release
      
  deployment:
    environments:
      - name: staging
        auto-deploy: true
        validation: npm run test:e2e
        
      - name: production
        approval-required: true
        rollback-enabled: true
        
  notifications:
    - slack: releases-channel
    - email: stakeholders@company.com
    - discord: webhook-url
```

## 发布代理

### 变更日志代理
```bash
# Generate intelligent changelog with gh CLI
# Get all merged PRs between versions
PRS=$(gh pr list --state merged --base main --json number,title,labels,author,mergedAt \
  --jq ".[] | select(.mergedAt > \"$(gh release view v1.0.0 --json publishedAt -q .publishedAt)\")")  

# Get contributors
CONTRIBUTORS=$(echo "$PRS" | jq -r '[.author.login] | unique | join(", ")')

# Get commit messages
COMMITS=$(gh api repos/:owner/:repo$compare$v1.0.0...HEAD \
  --jq '.commits[].commit.message')

# Generate categorized changelog
CHANGELOG=$(npx ruv-swarm github changelog \
  --prs "$PRS" \
  --commits "$COMMITS" \
  --contributors "$CONTRIBUTORS" \
  --from v1.0.0 \
  --to HEAD \
  --categorize \
  --add-migration-guide)

# Save changelog
echo "$CHANGELOG" > CHANGELOG.md

# Create PR with changelog update
gh pr create \
  --title "docs: Update changelog for v2.0.0" \
  --body "Automated changelog update" \
  --base main
```

**能力：**
- 语义化提交分析
- 破坏性变更检测
- 贡献者归因
- 迁移指南生成
- 多语言支持

### 版本代理
```bash
# Determine next version
npx ruv-swarm github version-suggest \
  --current v1.2.3 \
  --analyze-commits \
  --check-compatibility \
  --suggest-pre-release
```

**逻辑：**
- 分析提交信息
- 检测破坏性变更
- 建议合适的版本增量
- 处理预发布
- 校验版本约束

### 构建代理
```bash
# Coordinate multi-platform builds
npx ruv-swarm github release-build \
  --platforms "linux,macos,windows" \
  --architectures "x64,arm64" \
  --parallel \
  --optimize-size
```

**特性：**
- 跨平台编译
- 并行构建执行
- 构建产物优化
- 依赖打包
- 构建缓存

### 测试代理
```bash
# Pre-release testing
npx ruv-swarm github release-test \
  --suites "unit,integration,e2e,performance" \
  --environments "node:16,node:18,node:20" \
  --fail-fast false \
  --generate-report
```

### 部署代理
```bash
# Multi-target deployment
npx ruv-swarm github release-deploy \
  --targets "npm,docker,github,s3" \
  --staged-rollout \
  --monitor-metrics \
  --auto-rollback
```

## 高级功能

### 1. 渐进式部署
```yaml
# Staged rollout configuration
deployment:
  strategy: progressive
  stages:
    - name: canary
      percentage: 5
      duration: 1h
      metrics:
        - error-rate < 0.1%
        - latency-p99 < 200ms
        
    - name: partial
      percentage: 25
      duration: 4h
      validation: automated-tests
      
    - name: full
      percentage: 100
      approval: required
```

### 2. 多仓库发布
```bash
# Coordinate releases across repos
npx ruv-swarm github multi-release \
  --repos "frontend:v2.0.0,backend:v2.1.0,cli:v1.5.0" \
  --ensure-compatibility \
  --atomic-release \
  --synchronized
```

### 3. 热修复自动化
```bash
# Emergency hotfix process
npx ruv-swarm github hotfix \
  --issue 789 \
  --target-version v1.2.4 \
  --cherry-pick-commits \
  --fast-track-deploy
```

## 发布工作流

### 标准发布流程
```yaml
# .github$workflows$release.yml
name: Release Workflow
on:
  push:
    tags: ['v*']

jobs:
  release-swarm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions$checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup GitHub CLI
        run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
          
      - name: Initialize Release Swarm
        run: |
          # Get release tag and previous tag
          RELEASE_TAG=${{ github.ref_name }}
          PREV_TAG=$(gh release list --limit 2 --json tagName -q '.[1].tagName')
          
          # Get PRs and commits for changelog
          PRS=$(gh pr list --state merged --base main --json number,title,labels,author \
            --search "merged:>=$(gh release view $PREV_TAG --json publishedAt -q .publishedAt)")
          
          npx ruv-swarm github release-init \
            --tag $RELEASE_TAG \
            --previous-tag $PREV_TAG \
            --prs "$PRS" \
            --spawn-agents "changelog,version,build,test,deploy"
            
      - name: Generate Release Assets
        run: |
          # Generate changelog from PR data
          CHANGELOG=$(npx ruv-swarm github release-changelog \
            --format markdown)
          
          # Update release notes
          gh release edit ${{ github.ref_name }} \
            --notes "$CHANGELOG"
          
          # Generate and upload assets
          npx ruv-swarm github release-assets \
            --changelog \
            --binaries \
            --documentation
            
      - name: Upload Release Assets
        run: |
          # Upload generated assets to GitHub release
          for file in dist/*; do
            gh release upload ${{ github.ref_name }} "$file"
          done
          
      - name: Publish Release
        run: |
          # Publish to package registries
          npx ruv-swarm github release-publish \
            --platforms all
          
          # Create announcement issue
          gh issue create \
            --title "🚀 Released ${{ github.ref_name }}" \
            --body "See [release notes](https:/$github.com/${{ github.repository }}$releases$tag/${{ github.ref_name }})" \
            --label "announcement"
```

### 持续部署
```bash
# Automated deployment pipeline
npx ruv-swarm github cd-pipeline \
  --trigger "merge-to-main" \
  --auto-version \
  --deploy-on-success \
  --rollback-on-failure
```

## 发布验证

### 预发布检查
```bash
# Comprehensive validation
npx ruv-swarm github release-validate \
  --checks "
    version-conflicts,
    dependency-compatibility,
    api-breaking-changes,
    security-vulnerabilities,
    performance-regression,
    documentation-completeness
  " \
  --block-on-failure
```

### 兼容性测试
```bash
# Test backward compatibility
npx ruv-swarm github compat-test \
  --previous-versions "v1.0,v1.1,v1.2" \
  --api-contracts \
  --data-migrations \
  --generate-report
```

### 安全扫描
```bash
# Security validation
npx ruv-swarm github release-security \
  --scan-dependencies \
  --check-secrets \
  --audit-permissions \
  --sign-artifacts
```

## 监控与回滚

### 发布监控
```bash
# Monitor release health
npx ruv-swarm github release-monitor \
  --version v2.0.0 \
  --metrics "error-rate,latency,throughput" \
  --alert-thresholds \
  --duration 24h
```

### 自动回滚
```bash
# Configure auto-rollback
npx ruv-swarm github rollback-config \
  --triggers '{
    "error-rate": ">5%",
    "latency-p99": ">1000ms",
    "availability": "<99.9%"
  }' \
  --grace-period 5m \
  --notify-on-rollback
```

### 发布分析
```bash
# Analyze release performance
npx ruv-swarm github release-analytics \
  --version v2.0.0 \
  --compare-with v1.9.0 \
  --metrics "adoption,performance,stability" \
  --generate-insights
```

## 文档

### 自动生成文档
```bash
# Update documentation
npx ruv-swarm github release-docs \
  --api-changes \
  --migration-guide \
  --example-updates \
  --publish-to "docs-site,wiki"
```

### 发布说明
```markdown
<!-- Auto-generated release notes template -->
# Release v2.0.0

## 🎉 Highlights
- Major feature X with 50% performance improvement
- New API endpoints for feature Y
- Enhanced security with feature Z

## 🚀 Features
### Feature Name (#PR)
Detailed description of the feature...

## 🐛 Bug Fixes
### Fixed issue with... (#PR)
Description of the fix...

## 💥 Breaking Changes
### API endpoint renamed
- Before: `$api$old-endpoint`
- After: `$api$new-endpoint`
- Migration: Update all client calls...

## 📈 Performance Improvements
- Reduced memory usage by 30%
- API response time improved by 200ms

## 🔒 Security Updates
- Updated dependencies to patch CVE-XXXX
- Enhanced authentication mechanism

## 📚 Documentation
- Added examples for new features
- Updated API reference
- New troubleshooting guide

## 🙏 Contributors
Thanks to all contributors who made this release possible!
```

## 最佳实践

### 1. 发布规划
- 定期发布周期
- 功能冻结期
- Beta 测试阶段
- 明确沟通

### 2. 自动化
- 全面的 CI/CD
- 自动化测试
- 渐进式发布
- 监控与告警

### 3. 文档
- 最新更新日志
- 迁移指南
- API 文档
- 示例更新

## 集成示例

### NPM 包发布
```bash
# NPM package release
npx ruv-swarm github npm-release \
  --version patch \
  --test-all \
  --publish-beta \
  --tag-latest-on-success
```

### Docker 镜像发布
```bash
# Docker multi-arch release
npx ruv-swarm github docker-release \
  --platforms "linux$amd64,linux$arm64" \
  --tags "latest,v2.0.0,stable" \
  --scan-vulnerabilities \
  --push-to "dockerhub,gcr,ecr"
```

### 移动应用发布
```bash
# Mobile app store release
npx ruv-swarm github mobile-release \
  --platforms "ios,android" \
  --build-release \
  --submit-review \
  --staged-rollout
```

## 应急流程

### 热修复流程
```bash
# Emergency hotfix
npx ruv-swarm github emergency-release \
  --severity critical \
  --bypass-checks security-only \
  --fast-track \
  --notify-all
```

### 回滚流程
```bash
# Immediate rollback
npx ruv-swarm github rollback \
  --to-version v1.9.9 \
  --reason "Critical bug in v2.0.0" \
  --preserve-data \
  --notify-users
```

See also: [workflow-automation.md](.$workflow-automation.md), [multi-repo-swarm.md](.$multi-repo-swarm.md)
