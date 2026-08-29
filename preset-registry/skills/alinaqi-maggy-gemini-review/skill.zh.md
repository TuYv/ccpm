---
name: gemini-review
description: Google Gemini CLI code review with Gemini 2.5 Pro, 1M token context, CI/CD integration
when-to-use: When user requests Gemini-powered code review or needs large-context review
user-invocable: true
effort: medium
---
# Google Gemini 代码审查 Skill


使用 Google 的 Gemini CLI 和 Gemini 2.5 Pro 进行代码审查——具备超大的 1M token 上下文窗口，一次即可分析整个代码仓库。

**来源：** [Gemini CLI](https://github.com/google-gemini/gemini-cli) | [代码审查扩展](https://github.com/gemini-cli-extensions/code-review) | [Gemini Code Assist](https://codeassist.google/) | [GitHub Action](https://github.com/google-github-actions/run-gemini-cli)

---

## 为什么选择 Gemini 进行代码审查？

| 特性 | 优势 |
|---------|---------|
| **Gemini 2.5 Pro** | 最先进的代码推理能力 |
| **1M token 上下文** | 可容纳整个代码仓库——无需分块 |
| **免费层级** | 使用 Google 账号每天可发送 1,000 个请求 |
| **输出一致** | 格式整洁、结构可预测 |
| **原生支持 GitHub** | Gemini Code Assist 应用可自动审查 PR |

### 基准性能

| 基准测试 | 得分 | 备注 |
|-----------|-------|-------|
| SWE-Bench Verified | 63.8% | Agentic coding 基准测试 |
| Qodo PR Benchmark | 56.3% | PR 审查质量 |
| LiveCodeBench v5 | 70.4% | 代码生成 |
| WebDev Arena | #1 | Web 开发 |

---

## 安装

### 前置条件

```bash
# Check Node.js version (requires 20+)
node --version

# Install Node.js 20 if needed
# macOS
brew install node@20

# Or via nvm
nvm install 20
nvm use 20
```

### 安装 Gemini CLI

```bash
# Via npm (recommended)
npm install -g @google/gemini-cli

# Via Homebrew (macOS)
brew install gemini-cli

# Or run without installing
npx @google/gemini-cli

# Verify installation
gemini --version
```

### 安装代码审查扩展

```bash
# Requires Gemini CLI v0.4.0+
gemini extensions install https://github.com/gemini-cli-extensions/code-review

# Verify extension
gemini extensions list
```

---

## 身份验证

### 选项 1：Google 账号（推荐）

**免费层级：每天 1,000 个请求，每分钟 60 个请求**

```bash
# Run gemini and follow browser login
gemini

# Select: "Login with Google Account"
# Opens browser for OAuth
```

这将授予你使用 Gemini 2.5 Pro 的权限，并提供完整的 1M token 上下文窗口。

### 选项 2：Gemini API 密钥

**免费层级：每天 100 个请求**

```bash
# Get API key from https://aistudio.google.com/apikey

# Set environment variable
export GEMINI_API_KEY="your-api-key"

# Or add to shell profile
echo 'export GEMINI_API_KEY="your-api-key"' >> ~/.zshrc

# Run Gemini
gemini
```

### 选项 3：Vertex AI（企业版）

```bash
# For Google Cloud projects
export GOOGLE_API_KEY="your-api-key"
export GOOGLE_GENAI_USE_VERTEXAI=true
export GOOGLE_CLOUD_PROJECT="your-project-id"

gemini
```

---

## 交互式代码审查

### 使用代码审查扩展

```bash
# Start Gemini CLI
gemini

# Run code review on current branch
/code-review
```

该扩展会分析：
- 当前分支上的代码变更
- 识别质量问题
- 提出修复建议

### 手动审查提示

```bash
# In interactive mode
gemini

# Then ask:
> Review the changes in this branch for bugs and security issues
> Analyze src/api/users.ts for potential vulnerabilities
> What are the code quality issues in the last 3 commits?
```

---

## 无头模式（自动化）

### 基本用法

```bash
# Simple prompt execution
gemini -p "Review the code changes for bugs and security issues"

# With JSON output (for parsing)
gemini -p "Review the changes" --output-format json

# Stream JSON events (real-time)
gemini -p "Review and fix issues" --output-format stream-json

# Specify model
gemini -m gemini-2.5-pro -p "Deep code review of this PR"
```

### 完整 CI/CD 示例

```bash
# Get diff and review
git diff origin/main...HEAD > diff.txt

gemini -p "Review this code diff for:
1. Security vulnerabilities
2. Performance issues
3. Code quality problems
4. Missing error handling

Diff:
$(cat diff.txt)
" --output-format json > review.json
```

### 会话跟踪

```bash
# Track token usage and costs
gemini -p "Review changes" --session-summary metrics.json

# View metrics
cat metrics.json
```

---

## GitHub 集成

### 选项 1：Gemini Code Assist 应用（最简单）

从 [GitHub Marketplace](https://github.com/marketplace/gemini-code-assist) 安装：

1. 前往 GitHub Marketplace → Gemini Code Assist
2. 点击 "Install" 并选择存储库
3. 打开 PR 后会自动进行审查

**PR 评论中的命令：**
```
/gemini review     # Request code review
/gemini summary    # Get PR summary
/gemini help       # Show available commands
```

**配额：**
- 免费版：每天 33 个 PR
- 企业版：每天 100+ 个 PR

### 选项 2：GitHub Action

```yaml
# .github/workflows/gemini-review.yml
name: Gemini Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Review
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          # Get diff
          git diff origin/${{ github.base_ref }}...HEAD > diff.txt

          # Run Gemini review
          gemini -p "Review this pull request diff for bugs, security issues, and code quality problems. Be specific about file names and line numbers.

          $(cat diff.txt)" > review.md

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.md', 'utf8');
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🤖 Gemini Code Review\n\n${review}`
            });
```

### 选项 3：官方 GitHub Action

```yaml
# .github/workflows/gemini-review.yml
name: Gemini Code Review

on:
  pull_request:
    types: [opened, synchronize]
  issue_comment:
    types: [created]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write

    steps:
      - uses: actions/checkout@v4

      - name: Run Gemini CLI
        uses: google-github-actions/run-gemini-cli@v1
        with:
          gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
          prompt: "Review this pull request for code quality, security issues, and potential bugs."
```

**注释中的按需命令：**
```
@gemini-cli /review
@gemini-cli explain this code change
@gemini-cli write unit tests for this component
```

---

## GitLab CI/CD

```yaml
# .gitlab-ci.yml
gemini-review:
  image: node:20
  stage: review
  script:
    - npm install -g @google/gemini-cli
    - |
      gemini -p "Review the merge request changes for bugs, security issues, and code quality" > review.md
    - cat review.md
  artifacts:
    paths:
      - review.md
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  variables:
    GEMINI_API_KEY: $GEMINI_API_KEY
```

---

## 配置

### 全局配置

```bash
# ~/.gemini/settings.json
{
  "model": "gemini-2.5-pro",
  "theme": "dark",
  "sandbox": true
}
```

### 项目配置 (GEMINI.md)

在项目根目录中创建 `GEMINI.md` 文件，以提供项目特定的上下文：

```markdown
# Project Context for Gemini

## Tech Stack
- TypeScript with strict mode
- React 18 with hooks
- FastAPI backend
- PostgreSQL database

## Code Review Focus Areas
1. Type safety - ensure proper TypeScript types
2. React hooks rules - check for dependency array issues
3. SQL injection - verify parameterized queries
4. Authentication - check all endpoints have proper auth

## Conventions
- Use camelCase for variables
- Use PascalCase for components
- All API errors should use AppError class
```

---

## CLI 快速参考

```bash
# Interactive
gemini                          # Start interactive mode
/code-review                    # Run code review extension

# Headless
gemini -p "prompt"              # Single prompt, exit
gemini -p "prompt" --output-format json   # JSON output
gemini -m gemini-2.5-flash -p "prompt"    # Use faster model

# Extensions
gemini extensions list          # List installed
gemini extensions install URL   # Install extension
gemini extensions update        # Update all

# Key Flags
--output-format json            # Structured output
--output-format stream-json     # Real-time events
--session-summary FILE          # Track metrics
-m MODEL                        # Select model
```

---

## 对比：Claude 与 Codex 与 Gemini

| 方面 | Claude | Codex CLI | Gemini CLI |
|--------|--------|-----------|------------|
| **设置** | 无（内置） | npm + OpenAI API | npm + Google Account |
| **模型** | Claude | GPT-5.2-Codex | Gemini 2.5 Pro |
| **上下文** | 对话 | 每次审查全新 | 1M tokens（超大） |
| **免费层级** | 不适用 | 有限 | 1,000/天 |
| **最适合** | 快速审查 | 高准确率 | 大型代码库 |
| **GitHub 原生支持** | 否 | @codex | Gemini Code Assist |

### 何时使用各引擎

| 场景 | 推荐引擎 |
|----------|-------------------|
| 快速的流程内审查 | Claude |
| 关键安全审查 | Codex（88% 检测率） |
| 大型代码库（100+ 个文件） | Gemini（1M 上下文） |
| 免费的自动化审查 | Gemini |
| 多种视角 | 三者全部（双引擎/三引擎） |

---

## 故障排除

| 问题 | 解决方案 |
|-------|----------|
| `gemini: command not found` | `npm install -g @google/gemini-cli` |
| `Node.js version error` | 升级到 Node.js 20+ |
| `Authentication failed` | 重新运行 `gemini` 并再次登录 |
| `Extension not found` | `gemini extensions install https://github.com/gemini-cli-extensions/code-review` |
| `Rate limited` | 等待或升级到 Vertex AI |
| `Hangs in CI` | 确保未设置 `DEBUG` 环境变量 |
|

---

## 反模式

- **跳过身份验证设置** - 始终在 CI/CD 之前完成配置
- **在日志中使用 API 密钥** - 使用密钥管理
- **忽略上下文限制** - 即使是 1M tokens，对于超大型 monorepo 也存在限制
- **在每次提交时运行** - 仅在 PR 上运行，以节省配额
- **未设置项目上下文** - 添加 GEMINI.md 以获得更好的审查效果