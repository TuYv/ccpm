---
name: existing-repo
description: Analyze existing repositories, maintain structure, setup guardrails and best practices
when-to-use: When working with an existing codebase for the first time or adding guardrails
user-invocable: true
allowed-tools: [Read, Glob, Grep, Bash]
effort: high
---
# 现有仓库技能


用于处理现有代码库——分析结构、遵循约定，并在不破坏任何内容的前提下设置适当的防护措施。

**来源：** [Husky](https://typicode.github.io/husky/) | [lint-staged](https://github.com/lint-staged/lint-staged) | [pre-commit](https://pre-commit.com/) | [commitlint](https://commitlint.js.org/)

---

## 核心原则

**先理解，再修改。** 现有仓库有自己的约定、模式和历史。你的任务是在这些约束内开展工作，而不是重新组织它们。

---

## 阶段 1：仓库分析

**加入现有仓库时，务必先执行此分析。**

### 1.1 基础检测

```bash
# Check git status
git remote -v 2>/dev/null
git branch -a 2>/dev/null
git log --oneline -5 2>/dev/null

# Check for existing configs
ls -la .* 2>/dev/null | head -20
ls *.json *.toml *.yaml *.yml 2>/dev/null
```

### 1.2 技术栈检测

```bash
# JavaScript/TypeScript
ls package.json tsconfig.json 2>/dev/null

# Python
ls pyproject.toml setup.py requirements*.txt 2>/dev/null

# Mobile
ls pubspec.yaml 2>/dev/null          # Flutter
ls android/build.gradle 2>/dev/null   # Android
ls ios/*.xcodeproj 2>/dev/null        # iOS

# Other
ls Cargo.toml 2>/dev/null             # Rust
ls go.mod 2>/dev/null                 # Go
ls Gemfile 2>/dev/null                # Ruby
```

### 1.3 仓库结构类型

| 模式 | 检测方式 | 含义 |
|---------|-----------|---------|
| **单体仓库** | `packages/`、`apps/`，或 package.json 中存在 `workspaces` | 多个项目，共享工具链 |
| **全栈单体应用** | 同一仓库中包含 `frontend/` 和 `backend/` | 单一团队，紧密耦合 |
| **职责分离** | 仅包含前端或后端代码 | 仓库拆分，独立部署 |
| **微服务** | 包含多个 `service-*` 或领域目录 | 分布式架构 |

```bash
# Detect repo structure type
if [ -d "packages" ] || [ -d "apps" ]; then
    echo "MONOREPO detected"
elif [ -d "frontend" ] && [ -d "backend" ]; then
    echo "FULL-STACK MONOLITH detected"
elif [ -d "src" ] || [ -d "app" ]; then
    # Check if it's frontend or backend
    grep -q "react\|vue\|angular" package.json 2>/dev/null && echo "FRONTEND detected"
    grep -q "fastapi\|express\|django" package.json pyproject.toml 2>/dev/null && echo "BACKEND detected"
fi
```

### 1.4 目录映射

```bash
# Get directory structure (max 3 levels)
find . -type d -maxdepth 3 \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/venv/*" \
    -not -path "*/__pycache__/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    2>/dev/null | head -50

# Identify key directories
for dir in src app lib core services api routes components pages hooks utils models; do
    [ -d "$dir" ] && echo "Found: $dir/"
done
```

### 1.5 入口点

```bash
# Find main entry points
ls index.ts index.js main.ts main.py app.py server.ts server.js 2>/dev/null
cat package.json 2>/dev/null | grep -A1 '"main"'
cat pyproject.toml 2>/dev/null | grep -A1 'scripts'
```

---

## 阶段 2：约定检测

**在进行更改之前，识别并记录现有模式。**

### 2.1 代码风格

```bash
# Check for formatters
ls .prettierrc* .editorconfig .eslintrc* biome.json 2>/dev/null  # JS/TS
ls pyproject.toml | xargs grep -l "ruff\|black\|isort" 2>/dev/null  # Python

# Check indent style from existing files
head -20 src/**/*.ts 2>/dev/null | grep "^\s" | head -1  # tabs vs spaces
```

### 2.2 测试设置

```bash
# JS/TS testing
grep -l "jest\|vitest\|mocha\|playwright" package.json 2>/dev/null
ls jest.config.* vitest.config.* playwright.config.* 2>/dev/null

# Python testing
grep -l "pytest\|unittest" pyproject.toml 2>/dev/null
ls pytest.ini conftest.py 2>/dev/null

# Test directories
ls -d tests/ test/ __tests__/ spec/ 2>/dev/null
```

### 2.3 CI/CD 设置

```bash
# Check existing workflows
ls -la .github/workflows/ 2>/dev/null
ls .gitlab-ci.yml Jenkinsfile .circleci/ 2>/dev/null

# Check deploy configs
ls vercel.json render.yaml fly.toml railway.json Dockerfile 2>/dev/null
```

### 2.4 文档风格

```bash
# Find README pattern
head -30 README.md 2>/dev/null

# Find existing docs
ls -la docs/ documentation/ wiki/ 2>/dev/null
ls CONTRIBUTING.md CHANGELOG.md 2>/dev/null
```

---

## 阶段 3：防护措施审计

**检查现有的防护措施以及缺失的防护措施。**

### 3.1 预提交钩子状态

```bash
# Check for hook managers
ls .husky/ 2>/dev/null && echo "Husky installed"
ls .pre-commit-config.yaml 2>/dev/null && echo "pre-commit framework installed"
ls .git/hooks/pre-commit 2>/dev/null && echo "Manual pre-commit hook exists"

# Check what hooks run
cat .husky/pre-commit 2>/dev/null
cat .pre-commit-config.yaml 2>/dev/null
```

### 3.2 代码检查状态

```bash
# JS/TS linting
grep -q "eslint" package.json && echo "ESLint configured"
grep -q "biome" package.json && echo "Biome configured"
ls .eslintrc* biome.json 2>/dev/null

# Python linting
grep -q "ruff" pyproject.toml && echo "Ruff configured"
grep -q "flake8" pyproject.toml setup.cfg && echo "Flake8 configured"
```

### 3.3 类型检查状态

```bash
# TypeScript
ls tsconfig.json 2>/dev/null && echo "TypeScript configured"
grep "strict" tsconfig.json 2>/dev/null

# Python type checking
grep -q "mypy" pyproject.toml && echo "mypy configured"
grep -q "pyright" pyproject.toml && echo "pyright configured"
ls py.typed 2>/dev/null
```

### 3.4 提交消息规范执行

```bash
# commitlint
ls commitlint.config.* 2>/dev/null && echo "commitlint configured"
cat .husky/commit-msg 2>/dev/null
grep "conventional" package.json 2>/dev/null
```

### 3.5 安全扫描

```bash
# Check for security tools
grep -q "detect-secrets\|trufflehog" .pre-commit-config.yaml package.json 2>/dev/null
ls .github/workflows/*.yml | xargs grep -l "security\|audit" 2>/dev/null
```

---

## 阶段 4：防护措施设置

**仅添加缺失的防护措施。切勿覆盖现有配置。**

### 4.1 JavaScript/TypeScript 项目

#### Husky + lint-staged（如果尚未配置）

```bash
# Check if already installed
if [ ! -d ".husky" ]; then
    # Install Husky
    npm install -D husky lint-staged
    npx husky init

    # Create pre-commit hook
    echo 'npx lint-staged' > .husky/pre-commit
    chmod +x .husky/pre-commit
fi
```

**lint-staged 配置**（如果缺失，请添加到 package.json）：

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

#### ESLint（如果尚未配置）

```bash
# Check if eslint exists
if ! grep -q "eslint" package.json; then
    npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
fi
```

**eslint.config.js**（ESLint 9+ 扁平配置）：

```javascript
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }]
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/']
  }
)
```

#### Prettier（如果尚未配置）

```bash
if ! grep -q "prettier" package.json; then
    npm install -D prettier
fi
```

**.prettierrc**（遵循现有风格，或使用合理的默认值）：

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

#### commitlint（如果尚未配置）

```bash
if [ ! -f "commitlint.config.js" ]; then
    npm install -D @commitlint/cli @commitlint/config-conventional
    echo "npx commitlint --edit \$1" > .husky/commit-msg
    chmod +x .husky/commit-msg
fi
```

**commitlint.config.js**：

```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ci', 'perf', 'revert']
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
}
```

### 4.2 Python 项目

#### pre-commit 框架（如果尚未配置）

```bash
# Install pre-commit
if [ ! -f ".pre-commit-config.yaml" ]; then
    pip install pre-commit
    pre-commit install
fi
```

**.pre-commit-config.yaml**：

```yaml
repos:
  # Ruff - linting and formatting (replaces black, isort, flake8)
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.14.13
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  # Type checking
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.16.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
        args: [--ignore-missing-imports]

  # Security
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.5.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']

  # General
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  # Commit messages
  - repo: https://github.com/compilerla/conventional-pre-commit
    rev: v4.0.0
    hooks:
      - id: conventional-pre-commit
        stages: [commit-msg]
```

#### pyproject.toml 补充内容（如果尚未存在）

```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "UP",  # pyupgrade
    "S",   # flake8-bandit (security)
]
ignore = ["E501"]  # line length handled by formatter

[tool.mypy]
python_version = "3.12"
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=src --cov-report=term-missing --cov-fail-under=80"
```

### 4.3 分支保护（提供给用户的文档）

建议采用以下 GitHub 分支保护规则：

```markdown
## Recommended Branch Protection (main branch)

1. **Require pull request before merging**
   - Require 1 approval
   - Dismiss stale reviews on new commits

2. **Require status checks**
   - Lint
   - Type check
   - Tests
   - Security scan

3. **Require signed commits** (optional but recommended)

4. **Do not allow bypassing above settings**
```

---

## 阶段 5：结构保留规则

### 绝对不要做这些事

- **不要重组目录结构** - 在现有模式内开展工作
- **不要为了“统一性”重命名文件** - 遵循现有的命名约定
- **不要添加新模式** - 使用代码库中已有的模式
- **不要更改导入风格** - 遵循现有风格（相对导入与绝对导入等）
- **不要更改格式** - 遵循现有风格，或使用现有的格式化工具配置
- **不要轻易添加新依赖项** - 检查是否已有功能等效的依赖项

### 始终要做这些事

- **先阅读现有代码** - 在编写新代码之前理解现有模式
- **遵循现有约定** - 包括命名、结构和错误处理
- **使用现有工具函数** - 不要重复实现已有功能
- **遵循现有测试模式** - 与测试文件的命名和结构保持一致
- **保留现有配置** - 只进行添加，除非是为了修复错误，否则不要修改

### 约定检测检查清单

在编写任何代码之前，识别以下内容：

| 约定 | 示例 | 检查位置 |
|------------|---------|----------------|
| 命名 | camelCase 与 snake_case | 现有文件名 |
| 文件结构 | feature/ 与 type/ | 目录布局 |
| 导出风格 | 默认导出与命名导出 | 现有模块 |
| 错误处理 | throw 与 return Error | 现有函数 |
| 日志记录 | console 与 logger | 现有代码 |
| 测试 | describe/it 与 test() | 现有测试 |
| 注释 | JSDoc 与行内注释 | 现有代码 |

---

## 阶段 6：分析报告模板

运行分析后，生成以下报告：

```markdown
# Repository Analysis Report

## Overview
- **Repo Type**: [Monorepo | Full-Stack | Frontend | Backend | Microservices]
- **Primary Language**: [TypeScript | Python | ...]
- **Framework**: [React | FastAPI | ...]
- **Age**: [X commits, Y contributors]

## Directory Structure
```
[tree output]
```

## Tech Stack
| Category | Technology | Config File |
|----------|------------|-------------|
| Language | TypeScript | tsconfig.json |
| Framework | React | - |
| Testing | Vitest | vitest.config.ts |
| Linting | ESLint | eslint.config.js |
| Formatting | Prettier | .prettierrc |

## Guardrails Status

### Present
- [x] ESLint configured
- [x] Prettier configured
- [x] TypeScript strict mode

### Missing (Recommended)
- [ ] Pre-commit hooks (Husky + lint-staged)
- [ ] Commit message validation (commitlint)
- [ ] Security scanning in CI

## Conventions Detected
| Pattern | Observed | Example |
|---------|----------|---------|
| Naming | camelCase | `getUserById.ts` |
| Imports | Absolute | `@/components/Button` |
| Testing | Colocated | `Button.test.tsx` |
| Exports | Named | `export { Button }` |

## Recommendations
1. Add Husky + lint-staged for pre-commit hooks
2. Add commitlint for conventional commits
3. Add security workflow to GitHub Actions

## Files to Review First
- `src/index.ts` - Main entry point
- `src/utils/` - Shared utilities
- `tests/setup.ts` - Test configuration
```

---

## 渐进式实施策略

不要一次性添加所有防护措施。请遵循以下时间表：

| 周次 | 重点 | 原因 |
|------|-------|-----|
| 1 | 格式化（Prettier/Ruff） | 不会造成破坏，且易于取得成效 |
| 2 | 代码检查（ESLint/Ruff） | 发现明显问题 |
| 3 | 预提交钩子 | 自动执行第 1-2 周的措施 |
| 4 | 提交消息验证 | 保持团队一致性 |
| 5 | 类型检查严格度 | 发现运行时错误 |
| 6 | 安全扫描 | 发现漏洞 |

---

## 使用独立仓库

当前端和后端位于不同仓库时：

### 前端仓库设置

```bash
# Clone and analyze
git clone [frontend-repo]
cd frontend

# Run analysis
# Expect: React/Vue/Angular, no backend code

# Add frontend-specific guardrails
# - Husky + lint-staged
# - ESLint + Prettier
# - Component testing (Vitest/Jest)
```

### 后端仓库设置

```bash
# Clone and analyze
git clone [backend-repo]
cd backend

# Run analysis
# Expect: FastAPI/Express/Django, no frontend code

# Add backend-specific guardrails
# - pre-commit framework
# - Ruff + mypy
# - API testing (pytest/Jest)
```

### 跨仓库协调

| 关注点 | 解决方案 |
|---------|----------|
| 共享类型 | 根据 OpenAPI 规范生成 |
| API 契约 | 契约测试（Pact） |
| 部署 | 通过 CI/CD 触发器进行协调 |
| 版本管理 | 两个仓库都使用语义化版本控制 |

---

## 反模式

- **添加未使用的防护措施** - 只添加团队会使用的措施
- **从第 1 天起采用严格规则** - 逐步引入
- **因警告而阻塞流程** - 初期保持宽松，随后逐步收紧
- **忽略现有模式** - 基于现有情况开展工作
- **过度工程化** - 简单规则 > 复杂系统
- **跳过分析阶段** - 在进行更改前始终先充分了解情况

---

## 快速参考：检测命令

```bash
# One-liner repo analysis
echo "=== Repo Type ===" && \
ls -d packages apps frontend backend 2>/dev/null || echo "Standard repo" && \
echo "=== Tech Stack ===" && \
ls *.json *.toml *.yaml 2>/dev/null && \
echo "=== Existing Guardrails ===" && \
ls .husky .pre-commit-config.yaml .eslintrc* 2>/dev/null || echo "None detected" && \
echo "=== Entry Points ===" && \
ls index.* main.* app.* server.* 2>/dev/null
```