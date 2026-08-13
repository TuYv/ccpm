---
name: code-review
description: Mandatory code reviews via /code-review before commits and deploys
when-to-use: When user asks to review code, before commits, or when /code-review is invoked
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
effort: high
---
# 代码审查技能


**目的：** 在每次提交和部署前强制执行自动化代码审查，将其作为必需的防护措施。可选择 Claude、OpenAI Codex、Google Gemini，或使用多个引擎进行全面分析。

**子技能：**
- [adr-gate.md](./adr-gate.md) — 审查前 ADR 和规范执行

---

## 审查前：ADR 门禁（强制）

在任何审查引擎运行之前，ADR 门禁都会自动执行：

1. **分类** — 琐碎变更（拼写错误、依赖项、仅测试）会跳过门禁
2. **发现** — 扫描 `docs/adr/`、`_project_specs/`、iCPG ReasonNodes 和 git 历史记录，查找关联的 ADR 和规范
3. **执行** — 如果未找到与非琐碎变更相关的 ADR：
   - **交互式**（默认）：根据 git 历史记录起草 ADR，并请求用户确认
   - **无人值守**（CI）：以 `Status: proposed` 写入并继续
   - **严格**：阻止审查，直到 ADR 存在
4. **注入** — 将发现的 ADR 和规范作为架构上下文提供给审查提示词

### ADR 合规性审查维度

在标准的 7 个审查类别中新增：

| 类别 | 检查内容 |
|----------|----------------|
| **ADR 合规性** | 变更符合已记录的决策，不存在未记录的架构变更 |

| 发现项 | 严重程度 |
|---------|----------|
| 变更与已接受的 ADR 相矛盾 | 严重 |
| 架构决策未记录在任何 ADR 中 | 高 |
| ADR 存在但已过时或陈旧 | 中 |
| 与 ADR 意图存在轻微偏差 | 低 |

有关完整协议、逆向工程规则和配置，请参阅 [adr-gate.md](./adr-gate.md)。

---

## 审查引擎选择

运行 `/code-review` 时，用户可以选择偏好的审查引擎：

```
┌─────────────────────────────────────────────────────────────────┐
│  CODE REVIEW - Choose Your Engine                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ○ Claude (default)                                             │
│    Built-in, no extra setup, full conversation context          │
│                                                                 │
│  ○ OpenAI Codex CLI                                             │
│    GPT-5.2-Codex specialized for code review, 88% detection     │
│    Requires: npm install -g @openai/codex                       │
│                                                                 │
│  ○ Google Gemini CLI                                            │
│    Gemini 2.5 Pro with 1M token context, free tier available    │
│    Requires: npm install -g @google/gemini-cli                  │
│                                                                 │
│  ○ Dual Engine (any two)                                        │
│    Run two engines, compare findings, catch more issues         │
│                                                                 │
│  ○ All Three (maximum coverage)                                 │
│    Run Claude + Codex + Gemini for critical/security code       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 引擎对比

| 方面 | Claude | Codex | Gemini | 多引擎 |
|--------|--------|-------|--------|--------------|
| **设置** | 无需设置 | npm + OpenAI API | npm + Google 账号 | 所有设置 |
| **速度** | 快 | 快 | 快 | 耗时 2-3 倍 |
| **上下文** | 对话 | 每次审查均为全新上下文 | 100 万个 token | 不适用 |
| **检测能力** | 良好 | 88%（最佳） | 63.8% SWE-Bench | 综合 |
| **免费额度** | 不适用 | 有限 | 每天 1,000 次 | 视情况而定 |
| **最适合** | 快速审查 | 高准确率 | 大型代码库 | 关键代码 |

### 设置默认引擎

```toml
# ~/.claude/settings.toml or project CLAUDE.md
[code-review]
default_engine = "claude"  # Options: claude, codex, gemini, dual, all
```

### 使用示例

```bash
# Use default engine
/code-review

# Explicitly choose engine
/code-review --engine claude
/code-review --engine codex
/code-review --engine gemini

# Dual engine (pick any two)
/code-review --engine claude,codex
/code-review --engine claude,gemini
/code-review --engine codex,gemini

# All three engines
/code-review --engine all

# Quick shortcuts
/code-review              # Uses default
/code-review --codex      # Use Codex
/code-review --gemini     # Use Gemini
/code-review --all        # All three engines
```

---

## 多引擎输出

使用多个引擎时，会对发现的问题进行比较和去重：

### 双引擎示例

```
┌─────────────────────────────────────────────────────────────────┐
│  CODE REVIEW RESULTS - DUAL ENGINE (Claude + Codex)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ AGREED (Found by both):                                     │
│  🔴 SQL injection in auth.ts:45                                 │
│  🟡 Missing error handling in api.ts:112                        │
│                                                                 │
│  🔷 CLAUDE ONLY:                                                │
│  🟠 Potential race condition in worker.ts:89                    │
│  🟢 Consider extracting helper function                         │
│                                                                 │
│  🔶 CODEX ONLY:                                                 │
│  🟠 Memory leak - unclosed stream in upload.ts:34               │
│  🟡 N+1 query pattern in orders.ts:156                          │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SUMMARY                                                        │
│  Agreed: 2 | Claude only: 2 | Codex only: 2                     │
│  Critical: 1 | High: 2 | Medium: 2 | Low: 1                     │
│  Status: ❌ BLOCKED - Fix critical/high issues                  │
└─────────────────────────────────────────────────────────────────┘
```

### 三引擎示例（全部三个）

```
┌─────────────────────────────────────────────────────────────────┐
│  CODE REVIEW RESULTS - TRIPLE ENGINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ UNANIMOUS (All 3 found):                                    │
│  🔴 SQL injection in auth.ts:45                                 │
│                                                                 │
│  ✅ MAJORITY (2 of 3 found):                                    │
│  🟠 Memory leak - unclosed stream in upload.ts:34 (Codex+Gemini)│
│  🟡 Missing error handling in api.ts:112 (Claude+Codex)         │
│                                                                 │
│  🔷 CLAUDE ONLY:                                                │
│  🟠 Potential race condition in worker.ts:89                    │
│                                                                 │
│  🔶 CODEX ONLY:                                                 │
│  🟡 N+1 query pattern in orders.ts:156                          │
│                                                                 │
│  🟢 GEMINI ONLY:                                                │
│  🟡 Consider using batch API for better performance             │
│  🟢 Type could be more specific in types.ts:23                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SUMMARY                                                        │
│  Unanimous: 1 | Majority: 2 | Single: 5                         │
│  Critical: 1 | High: 2 | Medium: 3 | Low: 2                     │
│  Status: ❌ BLOCKED - Fix critical/high issues                  │
└─────────────────────────────────────────────────────────────────┘
```

### 何时使用各个模式

| 模式 | 适用场景 |
|------|----------|
| **单一（Claude）** | 快速进行流程内审查、探索 |
| **单一（Codex）** | CI/CD 自动化、需要高准确性 |
| **单一（Gemini）** | 大型代码库（100+ 个文件）、免费层级 |
| **双重** | 重要 PR、合并前审查 |
| **三重（全部）** | 安全关键型代码、支付系统、身份验证 |

---

## 核心理念

```
┌─────────────────────────────────────────────────────────────────┐
│  CODE REVIEW IS NON-NEGOTIABLE                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Every commit must pass code review.                            │
│  Every PR must be reviewed before merge.                        │
│  Every deployment must include review sign-off.                 │
│                                                                 │
│  AI catches what humans miss. Humans catch what AI misses.      │
│  Together: fewer bugs, cleaner code, better security.           │
├─────────────────────────────────────────────────────────────────┤
│  INVOKE: /code-review                                           │
│  PLUGIN: code-review@claude-plugins-official                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 何时运行代码审查

### 强制审查节点

| 触发条件 | 操作 | 命令 |
|---------|--------|---------|
| **提交前** | 审查暂存的更改 | `/code-review` |
| **创建 PR 前** | 审查相对于基础分支的所有更改 | `/code-review` |
| **合并前** | 对 PR 进行最终审查 | `/code-review` |
| **部署前** | 审查部署差异 | `/code-review` |

### 自动集成

**在每次提交前自动运行代码审查：**

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMIT WORKFLOW                                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  1. Write code                                                  │
│  2. Run tests (TDD - must pass)                                 │
│  3. Run /code-review  ← MANDATORY                               │
│  4. Address critical/high issues                                │
│  5. Commit                                                      │
│  6. Push                                                        │
│                                                                 │
│  Skip step 3? ❌ NO COMMIT ALLOWED                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 使用代码审查插件

### 基本用法

```bash
# Review current changes
/code-review

# Review specific files
/code-review src/auth/*.ts

# Review a PR
/code-review --pr 123

# Review with specific focus
/code-review --focus security
/code-review --focus performance
/code-review --focus architecture
```

### 审查类别

代码审查插件会分析：

| 类别 | 检查内容 |
|----------|----------------|
| **安全性** | 漏洞、注入风险、身份验证问题、密钥 |
| **性能** | N+1 查询、内存泄漏、低效算法 |
| **架构** | 设计模式、SOLID 原则、耦合度 |
| **代码质量** | 可读性、复杂度、重复代码 |
| **最佳实践** | 语言惯用法、框架约定 |
| **测试** | 覆盖率缺口、测试质量、边界情况 |
| **文档** | 缺失的文档、过时的注释 |

### 严重程度级别

| 级别 | 所需操作 | 可以提交吗？ |
|-------|-----------------|-------------|
| 🔴 **严重** | 必须立即修复 | ❌ 否 |
| 🟠 **高** | 应在提交前修复 | ❌ 否 |
| 🟡 **中** | 尽快修复，可以提交 | ✅ 是 |
| 🟢 **低** | 最好修复 | ✅ 是 |
| ℹ️ **信息** | 仅作为建议 | ✅ 是 |

---

## Pre-Commit Hook 集成

### 安装 Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running code review..."

# Run Claude code review on staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|py|go|rs)$')

if [ -n "$STAGED_FILES" ]; then
    # Invoke code review (requires claude CLI)
    claude --print "/code-review $STAGED_FILES" > /tmp/code-review-result.txt 2>&1

    # Check for critical/high issues
    if grep -q "🔴\|Critical\|🟠\|High" /tmp/code-review-result.txt; then
        echo "❌ Code review found critical/high issues:"
        cat /tmp/code-review-result.txt
        echo ""
        echo "Fix these issues before committing."
        exit 1
    fi

    echo "✅ Code review passed"
fi

exit 0
```

### 使 Hook 可执行

```bash
chmod +x .git/hooks/pre-commit
```

---

## Codex CLI 设置（适用于 Codex/双引擎模式）

如果要使用 Codex 或双引擎模式，请安装 Codex CLI：

```bash
# Prerequisites: Node.js 22+
node --version  # Must be 22+

# Install Codex CLI
npm install -g @openai/codex

# Authenticate (choose one):
# Option 1: ChatGPT subscription (Plus, Pro, Team, Enterprise)
codex  # Follow prompts to sign in

# Option 2: API key
export OPENAI_API_KEY=sk-proj-...
```

### 验证安装

```bash
# Check Codex is installed
codex --version

# Test review
codex
> /review
```

有关 Codex 的完整文档，请参阅 `codex-review.md` skill。

---

## Gemini CLI 设置（适用于 Gemini/多引擎模式）

如果要使用 Gemini 或多引擎模式，请安装 Gemini CLI：

```bash
# Prerequisites: Node.js 20+
node --version  # Must be 20+

# Install Gemini CLI
npm install -g @google/gemini-cli

# Or via Homebrew (macOS)
brew install gemini-cli

# Install Code Review extension
gemini extensions install https://github.com/gemini-cli-extensions/code-review
```

### 身份验证

```bash
# Option 1: Google Account (recommended, 1000 req/day free)
gemini  # Follow browser login prompts

# Option 2: API key (100 req/day free)
export GEMINI_API_KEY="your-key-from-aistudio.google.com"
```

### 验证安装

```bash
# Check Gemini is installed
gemini --version

# List extensions
gemini extensions list

# Test review
gemini
> /code-review
```

有关 Gemini 的完整文档，请参阅 `gemini-review.md` Skill。

---

## CI/CD 集成

### GitHub Actions - 仅 Claude

```yaml
# .github/workflows/code-review.yml
name: Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  code-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed-files
        run: |
          echo "files=$(git diff --name-only origin/${{ github.base_ref }}...HEAD | tr '\n' ' ')" >> $GITHUB_OUTPUT

      - name: Run Claude Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx @anthropic-ai/claude-code --print "/code-review ${{ steps.changed-files.outputs.files }}" > review.md

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
              body: `## 🔍 Claude Code Review\n\n${review}`
            });

      - name: Check for Critical Issues
        run: |
          if grep -q "Critical\|🔴" review.md; then
            echo "❌ Critical issues found"
            exit 1
          fi
```

### GitHub Actions - 仅 Codex

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

      - name: Codex Review
        uses: openai/codex-action@main
        with:
          openai_api_key: ${{ secrets.OPENAI_API_KEY }}
          model: gpt-5.2-codex
          safety_strategy: drop-sudo
```

### GitHub Actions - 两种引擎

```yaml
# .github/workflows/dual-review.yml
name: Dual Code Review

on:
  pull_request:

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx @anthropic-ai/claude-code --print "/code-review" > claude-review.md

      - uses: actions/upload-artifact@v4
        with:
          name: claude-review
          path: claude-review.md

  codex-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Codex
        run: npm install -g @openai/codex

      - name: Codex Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex exec --full-auto --sandbox read-only \
            --output-last-message codex-review.md \
            "Review this code for bugs, security issues, and quality problems"

      - uses: actions/upload-artifact@v4
        with:
          name: codex-review
          path: codex-review.md

  combine-reviews:
    needs: [claude-review, codex-review]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4

      - name: Combine Reviews
        run: |
          echo "## 🔍 Dual Code Review Results" > combined-review.md
          echo "" >> combined-review.md
          echo "### Claude Findings" >> combined-review.md
          cat claude-review/claude-review.md >> combined-review.md
          echo "" >> combined-review.md
          echo "### Codex Findings" >> combined-review.md
          cat codex-review/codex-review.md >> combined-review.md

      - name: Post Combined Review
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('combined-review.md', 'utf8');
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: review
            });
```

### GitHub Actions - 仅使用 Gemini

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

      - name: Check for Critical Issues
        run: |
          if grep -qi "critical\|security vulnerability\|injection" review.md; then
            echo "❌ Critical issues found"
            exit 1
          fi
```

### GitHub Actions - 全部三个引擎

```yaml
# .github/workflows/triple-review.yml
name: Triple Engine Code Review

on:
  pull_request:

jobs:
  claude-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx @anthropic-ai/claude-code --print "/code-review" > claude-review.md

      - uses: actions/upload-artifact@v4
        with:
          name: claude-review
          path: claude-review.md

  codex-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install Codex
        run: npm install -g @openai/codex

      - name: Codex Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          codex exec --full-auto --sandbox read-only \
            --output-last-message codex-review.md \
            "Review this code for bugs, security issues, and quality problems"

      - uses: actions/upload-artifact@v4
        with:
          name: codex-review
          path: codex-review.md

  gemini-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Gemini Review
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          git diff origin/${{ github.base_ref }}...HEAD > diff.txt
          gemini -p "Review this code diff for bugs, security, and quality issues:
          $(cat diff.txt)" > gemini-review.md

      - uses: actions/upload-artifact@v4
        with:
          name: gemini-review
          path: gemini-review.md

  combine-reviews:
    needs: [claude-review, codex-review, gemini-review]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4

      - name: Combine Reviews
        run: |
          echo "## 🔍 Triple Engine Code Review Results" > combined-review.md
          echo "" >> combined-review.md
          echo "### 🟣 Claude Findings" >> combined-review.md
          cat claude-review/claude-review.md >> combined-review.md
          echo "" >> combined-review.md
          echo "---" >> combined-review.md
          echo "### 🟢 Codex Findings" >> combined-review.md
          cat codex-review/codex-review.md >> combined-review.md
          echo "" >> combined-review.md
          echo "---" >> combined-review.md
          echo "### 🔵 Gemini Findings" >> combined-review.md
          cat gemini-review/gemini-review.md >> combined-review.md

      - name: Post Combined Review
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('combined-review.md', 'utf8');
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: review
            });

      - name: Check Critical Issues
        run: |
          # Fail if any engine found critical issues
          if grep -qi "critical\|🔴" combined-review.md; then
            echo "❌ Critical issues found by at least one engine"
            exit 1
          fi
```

---

## 审查清单

### 每次提交前

- [ ] 对暂存的更改运行 `/code-review`
- [ ] 没有严重（🔴）问题
- [ ] 没有高优先级（🟠）问题
- [ ] 安全隐患已处理
- [ ] 已考虑性能问题

### 每次创建 PR 前

- [ ] 对所有更改进行完整代码审查
- [ ] 所有严重/高优先级问题均已解决
- [ ] 已为新功能添加测试
- [ ] 已按需更新文档

### 每次部署前

- [ ] 对部署差异进行最终审查
- [ ] 安全扫描已通过
- [ ] 未引入新的漏洞
- [ ] 已记录回滚计划

---

## 常见审查发现

### 安全问题（必须修复）

| 问题 | 示例 | 修复方式 |
|-------|---------|-----|
| SQL 注入 | `query = f"SELECT * FROM users WHERE id = {id}"` | 使用参数化查询 |
| XSS | `innerHTML = userInput` | 进行净化处理或使用 textContent |
| 代码中存在密钥 | `apiKey = "sk-xxx"` | 使用环境变量 |
| 缺少身份认证 | 未受保护的端点 | 添加身份认证中间件 |
| 不安全的加密方式 | 使用 MD5/SHA1 处理密码 | 使用 bcrypt/argon2 |

### 性能问题（应当修复）

| 问题 | 示例 | 修复方式 |
|-------|---------|-----|
| N+1 查询 | 在循环中执行单独查询 | 使用批量加载/预加载 |
| 内存泄漏 | 未关闭的连接 | 使用连接池 |
| 缺少索引 | 查询缓慢 | 添加数据库索引 |
| 载荷过大 | 获取未使用的字段 | 仅选择所需字段 |
| 无分页 | 加载所有记录 | 实现分页 |

### 代码质量（最好修复）

| 问题 | 示例 | 修复方式 |
|-------|---------|-----|
| 函数过长 | 超过 100 行 | 拆分为更小的函数 |
| 嵌套过深 | 超过 5 层 | 提前返回、提取方法 |
| 魔法数字 | `if (status === 3)` | 使用具名常量 |
| 重复代码 | 复制粘贴的代码块 | 提取共享函数 |
| 缺少类型 | 到处使用 `any` | 添加适当的 TypeScript 类型 |

---

## 审查后：决策提取

审查完成后，自动提取架构决策：

1. 如果审查标记了新的架构选择 → 提示在 `docs/adr/` 中创建 ADR
2. 如果审查批准了一种新模式 → 记录到 `_project_specs/session/decisions.md`
3. 如果审查发现 ADR 偏离 → 标记该 ADR 以进行更新或取代

```markdown
### Auto-Log Entry (decisions.md)
- [YYYY-MM-DD] **[Review Finding]**: Brief description
  - Source: Code review of [PR/commit]
  - ADR: Created/Updated ADR-NNNN
  - Impact: What changed
```

---

## 与 TDD 工作流集成

```
┌─────────────────────────────────────────────────────────────────┐
│  TDD + CODE REVIEW WORKFLOW                                     │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  1. RED: Write failing tests                                    │
│  2. GREEN: Write code to pass tests                             │
│  3. REFACTOR: Clean up code                                     │
│  4. REVIEW: Run /code-review  ← NEW STEP                        │
│  5. FIX: Address critical/high issues                           │
│  6. VALIDATE: Lint + TypeCheck + Coverage                       │
│  7. COMMIT: Only after review passes                            │
│                                                                 │
│  Review catches what tests miss:                                │
│  - Security vulnerabilities                                     │
│  - Performance issues                                           │
│  - Architecture problems                                        │
│  - Code maintainability                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 审查响应模板

当代码审查发现问题时，请按以下格式响应：

```markdown
## Code Review Results

### 🔴 Critical Issues (Must Fix)
1. **SQL Injection in userController.ts:45**
   - Issue: User input directly interpolated into query
   - Fix: Use parameterized query
   - Code: `db.query('SELECT * FROM users WHERE id = $1', [userId])`

### 🟠 High Issues (Should Fix)
1. **Missing authentication on /api/admin endpoints**
   - Issue: Admin routes accessible without auth
   - Fix: Add auth middleware

### 🟡 Medium Issues (Fix Soon)
1. **N+1 query in getOrders function**
   - Consider eager loading or batch query

### 🟢 Low Issues (Nice to Have)
1. **Consider extracting validation logic to separate file**

### ✅ Strengths
- Good test coverage
- Clear function names
- Proper error handling

### 📊 Summary
- Critical: 1 | High: 1 | Medium: 1 | Low: 1
- **Status: ❌ BLOCKED** - Fix critical/high issues before commit
```

---

## Claude 指令

### 何时调用代码审查

Claude 应在以下情况下自动建议或运行代码审查：

1. **完成一项功能后** → “提交之前，让我运行一次代码审查”
2. **创建 PR 之前** → “正在对所有更改运行代码审查”
3. **当用户说“提交”时** → “首先，让我审查这些更改”
4. **修复错误后** → “正在审查此修复是否存在任何问题”

### 审查重点领域

根据更改类型确定审查的优先重点：

| 更改类型 | 重点领域 |
|-------------|-------------|
| 身份验证/安全代码 | 安全性、输入验证、加密 |
| 数据库代码 | SQL 注入、N+1、事务 |
| API 端点 | 身份验证、速率限制、验证 |
| 前端代码 | XSS、状态管理、性能 |
| 基础设施 | 密钥、权限、日志记录 |

---

## 快速参考

### 命令

```bash
# Basic review
/code-review

# Review specific files
/code-review src/auth.ts src/users.ts

# Review with focus
/code-review --focus security

# Review PR
/code-review --pr 123
```

### 严重程度对应措施

```
🔴 Critical → STOP. Fix now. No commit.
🟠 High     → STOP. Fix now. No commit.
🟡 Medium   → Note it. Fix soon. Can commit.
🟢 Low      → Optional. Nice to have.
ℹ️ Info     → FYI only.
```

### 工作流

```
Code → Test → Review → Fix → Commit → Push → PR → Review → Merge → Deploy
              ↑                              ↑                    ↑
           /code-review                /code-review          /code-review
```