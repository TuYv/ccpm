---
name: codex-review
description: OpenAI Codex CLI code review with GPT-5.2-Codex, CI/CD integration
when-to-use: When user requests Codex-powered code review or multi-engine review
user-invocable: true
effort: medium
---
# OpenAI Codex 代码审查 Skill


使用 OpenAI 的 Codex CLI，通过专为检测错误、安全漏洞和代码质量问题而训练的 GPT-5.2-Codex 进行专业代码审查。

**来源：** [Codex CLI](https://developers.openai.com/codex/cli/) | [GitHub](https://github.com/openai/codex) | [代码审查指南](https://cookbook.openai.com/examples/codex/build_code_review_with_codex_sdk)

---

## 为什么使用 Codex 进行代码审查？

| 特性 | 优势 |
|---------|---------|
| **GPT-5.2-Codex** | 针对代码审查进行专门训练 |
| **88% 检出率** | 检测错误、安全漏洞和风格问题（LiveCodeBench） |
| **结构化输出** | 使用 JSON schema 确保审查结果格式一致 |
| **GitHub 原生集成** | 在 PR 评论中使用 `@codex review` |
| **无头模式** | 无需 TUI 即可实现 CI/CD 自动化 |

---

## 安装

### 前置条件

```bash
# Check Node.js version (requires 22+)
node --version

# Install Node.js 22 if needed
# macOS
brew install node@22

# Or via nvm
nvm install 22
nvm use 22
```

### 安装 Codex CLI

```bash
# Via npm (recommended)
npm install -g @openai/codex

# Via Homebrew (macOS)
brew install --cask codex

# Verify installation
codex --version
```

### 身份验证

**选项 1：ChatGPT 订阅**（Plus、Pro、Team、Edu、Enterprise）
```bash
codex
# Follow prompts to sign in with ChatGPT account
```

**选项 2：OpenAI API Key**
```bash
# Set environment variable
export OPENAI_API_KEY=sk-proj-...

# Or add to shell profile
echo 'export OPENAI_API_KEY=sk-proj-...' >> ~/.zshrc

# Run Codex
codex
```

### Shell 自动补全（可选）

```bash
# Bash
codex completion bash >> ~/.bashrc

# Zsh
codex completion zsh >> ~/.zshrc

# Fish
codex completion fish > ~/.config/fish/completions/codex.fish
```

---

## 交互式代码审查

### 启动审查模式

```bash
# Start Codex
codex

# In the TUI, type:
/review
```

### 审查预设

| 预设 | 使用场景 |
|--------|----------|
| **与基础分支比较审查** | 创建 PR 之前——与上游分支比较差异 |
| **审查未提交的更改** | 提交之前——包括已暂存、未暂存和未跟踪的更改 |
| **审查某个提交** | 分析历史记录中的特定 SHA |
| **自定义指令** | 例如，“重点关注安全漏洞” |

### 示例会话

```
$ codex
> /review

Select review type:
❯ Review against a base branch
  Review uncommitted changes
  Review a commit
  Custom review instructions

Select base branch: main

Reviewing changes...

┌─────────────────────────────────────────────────────────────┐
│ CODE REVIEW FINDINGS                                        │
├─────────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL: SQL Injection vulnerability                    │
│    File: src/api/users.ts:45                                │
│    Issue: User input directly interpolated in query         │
│    Fix: Use parameterized queries                           │
├─────────────────────────────────────────────────────────────┤
│ 🟠 HIGH: Missing authentication check                       │
│    File: src/api/admin.ts:23                                │
│    Issue: Admin endpoint accessible without auth            │
│    Fix: Add requireAuth middleware                          │
├─────────────────────────────────────────────────────────────┤
│ 🟡 MEDIUM: Inefficient database query                       │
│    File: src/services/orders.ts:89                          │
│    Issue: N+1 query pattern in loop                         │
│    Fix: Use batch query or JOIN                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 无头模式（自动化）

### 基本用法

```bash
# Simple review
codex exec "review the code for bugs and security issues"

# Review with JSON output
codex exec --json "review uncommitted changes" > review.json

# Save final message to file
codex exec --output-last-message review.txt "review the diff against main"
```

### 完全自动化（CI/CD）

```bash
# Full auto mode (use only in isolated runners!)
codex exec \
  --full-auto \
  --json \
  --output-last-message findings.txt \
  --sandbox read-only \
  -m gpt-5.2-codex \
  "Review this code for bugs, security issues, and performance problems"
```

### 使用 Schema 的结构化输出

```bash
# Define output schema
cat > review-schema.json << 'EOF'
{
  "type": "object",
  "properties": {
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": { "enum": ["critical", "high", "medium", "low"] },
          "title": { "type": "string" },
          "file": { "type": "string" },
          "line": { "type": "integer" },
          "description": { "type": "string" },
          "suggestion": { "type": "string" }
        },
        "required": ["severity", "title", "file", "description"]
      }
    },
    "summary": { "type": "string" },
    "approved": { "type": "boolean" }
  },
  "required": ["findings", "summary", "approved"]
}
EOF

# Run with schema validation
codex exec \
  --output-schema review-schema.json \
  --output-last-message review.json \
  "Review the staged changes and output findings"
```

---

## GitHub 集成

### 选项 1：PR 评论触发

在任意拉取请求中添加一条评论：
```
@codex review
```

Codex 将以标准的 GitHub 代码审查形式进行回复。

### 选项 2：GitHub Action

```yaml
# .github/workflows/codex-review.yml
name: Codex Code Review

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

      - name: Codex Review
        uses: openai/codex-action@main
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          model: gpt-5.2-codex
          safety_strategy: drop-sudo
```

### 选项 3：在 CI 中手动以无头模式运行

```yaml
# .github/workflows/codex-review.yml
name: Codex Code Review

on:
  pull_request:

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Codex CLI
        run: npm install -g @openai/codex

      - name: Run Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          # Get diff
          git diff origin/${{ github.base_ref }}...HEAD > diff.txt

          # Run Codex review
          codex exec \
            --full-auto \
            --sandbox read-only \
            --output-last-message review.md \
            "Review this git diff for bugs, security issues, and code quality: $(cat diff.txt)"

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
              body: `## 🤖 Codex Code Review\n\n${review}`
            });
```

---

## GitLab CI/CD

```yaml
# .gitlab-ci.yml
codex-review:
  image: node:22
  stage: review
  script:
    - npm install -g @openai/codex
    - |
      codex exec \
        --full-auto \
        --sandbox read-only \
        --output-last-message review.md \
        "Review the merge request changes for bugs and security issues"
    - cat review.md
  artifacts:
    paths:
      - review.md
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

---

## Jenkins 流水线

```groovy
pipeline {
    agent any

    environment {
        OPENAI_API_KEY = credentials('openai-api-key')
    }

    stages {
        stage('Install Codex') {
            steps {
                sh 'npm install -g @openai/codex'
            }
        }

        stage('Code Review') {
            steps {
                sh '''
                    codex exec \
                      --full-auto \
                      --sandbox read-only \
                      --output-last-message review.md \
                      "Review the code changes for bugs and security issues"
                '''
            }
        }

        stage('Publish Results') {
            steps {
                archiveArtifacts artifacts: 'review.md'
                script {
                    def review = readFile('review.md')
                    echo "Code Review Results:\n${review}"
                }
            }
        }
    }
}
```

---

## 配置

### 配置文件

```toml
# ~/.codex/config.toml

[model]
default = "gpt-5.2-codex"  # Best for code review

[sandbox]
default = "read-only"  # Safe for reviews

[review]
# Custom review instructions applied to all reviews
instructions = """
Focus on:
1. Security vulnerabilities (OWASP Top 10)
2. Performance issues (N+1 queries, memory leaks)
3. Error handling gaps
4. Type safety issues
"""
```

### 每项目配置

```toml
# .codex/config.toml (in project root)

[review]
instructions = """
This is a Python FastAPI project. Focus on:
- Async/await correctness
- Pydantic model validation
- SQL injection via SQLAlchemy
- Authentication/authorization gaps
"""
```

---

## CLI 快速参考

```bash
# Interactive
codex                          # Start TUI
/review                        # Open review presets

# Headless
codex exec "prompt"            # Non-interactive execution
codex exec --json "prompt"     # JSON output
codex exec --full-auto "prompt"  # No approval prompts

# Key Flags
--output-last-message FILE     # Save response to file
--output-schema FILE           # Validate against JSON schema
--sandbox read-only            # Restrict file access
-m gpt-5.2-codex              # Use best review model
--json                         # Machine-readable output

# Resume
codex exec resume SESSION_ID   # Continue previous session
```

---

## 对比：Claude 与 Codex 审查

| 方面 | Claude（内置） | Codex CLI |
|--------|-------------------|-----------|
| **设置** | 无需设置（已集成在 Claude Code 中） | 安装 CLI 并进行身份验证 |
| **模型** | Claude | GPT-5.2-Codex（专用模型） |
| **上下文** | 完整的对话上下文 | 每次审查使用全新的上下文 |
| **集成** | 原生集成 | GitHub、GitLab、Jenkins |
| **输出** | Markdown | 支持 JSON schema |
| **最适合** | 快速审查、工作流内审查 | CI/CD、关键 PR |

---

## 安全注意事项

### CI/CD 安全

```yaml
# Always use these flags in CI/CD:
--sandbox read-only           # Prevent file modifications
--safety-strategy drop-sudo   # Revoke elevated permissions
```

### API 密钥保护

```yaml
# GitHub Actions - use secrets
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

# Never hardcode keys
# Never echo keys in logs
```

### 公共仓库

对于公共仓库，请使用 `drop-sudo` 安全策略，以防止 Codex 在执行期间读取其自身的 API 密钥。

---

## 故障排除

| 问题 | 解决方案 |
|-------|----------|
| `codex: command not found` | 运行 `npm install -g @openai/codex` |
| `Node.js version error` | 升级到 Node.js 22+ |
| `Authentication failed` | 重新运行 `codex` 并再次登录 |
| `API key invalid` | 检查 `OPENAI_API_KEY` 环境变量 |
| `Timeout in CI` | 添加 `--timeout 300` 标志 |
| `Rate limited` | 降低频率或升级套餐 |

---

## 反模式

- **随意使用 `--dangerously-bypass-approvals-and-sandbox`** - 仅限在隔离的 CI 运行器中使用
- **在日志中暴露 API 密钥** - 使用密钥管理
- **在 CI 中跳过沙箱** - 始终使用 `--sandbox read-only`
- **忽略发现的问题** - 审查并解决问题，或记录例外情况
- **在每次提交时运行** - 仅在 PR 上使用以节省成本