---
name: iterative-development
description: TDD iteration loops using Claude Code Stop hooks - runs tests after each response, feeds failures back automatically
when-to-use: When setting up or configuring TDD loops via Stop hooks
user-invocable: false
effort: medium
---
# 迭代式开发技能（Stop Hook TDD 循环）


**概念：** Claude Code 的 Stop hook 会在 Claude 即将结束响应之前触发。退出码 2 会将 stderr 反馈给模型并继续对话。这样无需任何插件即可创建真正的 TDD 循环。

---

## 实际工作原理

Claude Code 提供了一个 **Stop hook**，它会在 Claude 即将结束响应时运行。如果钩子脚本以代码 2 退出，其 stderr 会显示给模型，并自动继续对话。

```
┌─────────────────────────────────────────────────────────────┐
│  1. User asks Claude to implement a feature                 │
├─────────────────────────────────────────────────────────────┤
│  2. Claude writes tests + implementation                    │
├─────────────────────────────────────────────────────────────┤
│  3. Claude finishes its response                            │
├─────────────────────────────────────────────────────────────┤
│  4. Stop hook runs: executes tests, lint, typecheck         │
├─────────────────────────────────────────────────────────────┤
│  5a. All pass (exit 0) → Claude stops, work is done         │
│  5b. Failures (exit 2) → stderr fed back to Claude          │
├─────────────────────────────────────────────────────────────┤
│  6. Claude sees failures, fixes code, response ends         │
├─────────────────────────────────────────────────────────────┤
│  7. Stop hook runs again → repeat until green or max tries  │
└─────────────────────────────────────────────────────────────┘
```

**关键洞见：** 不需要虚假的插件，也不需要 `/ralph-loop` 命令。该钩子是真实的 Claude Code 基础设施，会自动运行。

---

## 设置：Stop Hook 配置

将以下内容添加到项目的 `.claude/settings.json` 中：

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "scripts/tdd-loop-check.sh",
            "timeout": 60,
            "statusMessage": "Running tests..."
          }
        ]
      }
    ]
  }
}
```

### TDD 循环检查脚本

在项目中创建 `scripts/tdd-loop-check.sh`：

```bash
#!/bin/bash
# TDD Loop Check - runs after each Claude response
# Exit 0 = all good, Claude stops
# Exit 2 = failures, stderr fed back to Claude to fix

MAX_ITERATIONS=25
ITERATION_FILE=".claude/.tdd-iteration-count"

# Track iteration count
if [ -f "$ITERATION_FILE" ]; then
    count=$(cat "$ITERATION_FILE")
    count=$((count + 1))
else
    count=1
fi
echo "$count" > "$ITERATION_FILE"

# Safety: stop after max iterations
if [ "$count" -ge "$MAX_ITERATIONS" ]; then
    rm -f "$ITERATION_FILE"
    echo "Max iterations ($MAX_ITERATIONS) reached. Stopping loop." >&2
    exit 0
fi

# Skip if no test files exist yet
if ! find . -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" 2>/dev/null | grep -q .; then
    rm -f "$ITERATION_FILE"
    exit 0
fi

# Run tests
TEST_OUTPUT=$(npm test 2>&1) || {
    echo "ITERATION $count/$MAX_ITERATIONS - Tests failing:" >&2
    echo "$TEST_OUTPUT" | tail -30 >&2
    echo "" >&2
    echo "Fix the failing tests and try again." >&2
    exit 2
}

# Run lint (if configured)
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
    LINT_OUTPUT=$(npm run lint 2>&1) || {
        echo "ITERATION $count/$MAX_ITERATIONS - Lint errors:" >&2
        echo "$LINT_OUTPUT" | tail -20 >&2
        echo "" >&2
        echo "Fix lint errors and try again." >&2
        exit 2
    }
fi

# Run typecheck (if configured)
if [ -f "tsconfig.json" ]; then
    TYPE_OUTPUT=$(npx tsc --noEmit 2>&1) || {
        echo "ITERATION $count/$MAX_ITERATIONS - Type errors:" >&2
        echo "$TYPE_OUTPUT" | tail -20 >&2
        echo "" >&2
        echo "Fix type errors and try again." >&2
        exit 2
    }
fi

# All green - reset counter and let Claude stop
rm -f "$ITERATION_FILE"
exit 0
```

### Python 版本

```bash
#!/bin/bash
# Python TDD Loop Check

MAX_ITERATIONS=25
ITERATION_FILE=".claude/.tdd-iteration-count"

if [ -f "$ITERATION_FILE" ]; then
    count=$(cat "$ITERATION_FILE")
    count=$((count + 1))
else
    count=1
fi
echo "$count" > "$ITERATION_FILE"

if [ "$count" -ge "$MAX_ITERATIONS" ]; then
    rm -f "$ITERATION_FILE"
    echo "Max iterations ($MAX_ITERATIONS) reached." >&2
    exit 0
fi

if ! find . -name "test_*" -o -name "*_test.py" 2>/dev/null | grep -q .; then
    rm -f "$ITERATION_FILE"
    exit 0
fi

TEST_OUTPUT=$(pytest -v 2>&1) || {
    echo "ITERATION $count/$MAX_ITERATIONS - Tests failing:" >&2
    echo "$TEST_OUTPUT" | tail -30 >&2
    exit 2
}

if command -v ruff &>/dev/null; then
    LINT_OUTPUT=$(ruff check . 2>&1) || {
        echo "ITERATION $count/$MAX_ITERATIONS - Lint errors:" >&2
        echo "$LINT_OUTPUT" | tail -20 >&2
        exit 2
    }
fi

if command -v mypy &>/dev/null; then
    TYPE_OUTPUT=$(mypy . 2>&1) || {
        echo "ITERATION $count/$MAX_ITERATIONS - Type errors:" >&2
        echo "$TYPE_OUTPUT" | tail -20 >&2
        exit 2
    }
fi

rm -f "$ITERATION_FILE"
exit 0
```

---

## 用于质量保障的其他钩子

### PreToolUse 钩子：写入文件前进行代码检查

在任何 Write/Edit 操作生效前运行代码检查工具：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "scripts/pre-write-lint.sh",
            "timeout": 10,
            "statusMessage": "Checking code quality..."
          }
        ]
      }
    ]
  }
}
```

### SessionStart 钩子：自动注入上下文

在会话开始时运行，以注入项目信息：

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'TDD loop active. Tests run automatically after each response. Fix failures to continue.'",
            "statusMessage": "Loading project context..."
          }
        ]
      }
    ]
  }
}
```

---

## 核心理念

```
┌─────────────────────────────────────────────────────────────┐
│  ITERATION > PERFECTION                                     │
│  ─────────────────────────────────────────────────────────  │
│  Don't aim for perfect on first try.                        │
│  Let the loop refine the work. Each iteration builds on     │
│  previous attempts visible in files and git history.        │
├─────────────────────────────────────────────────────────────┤
│  FAILURES ARE DATA                                          │
│  ─────────────────────────────────────────────────────────  │
│  Failed tests, lint errors, type mismatches are signals.    │
│  The Stop hook feeds them directly to Claude as context.    │
├─────────────────────────────────────────────────────────────┤
│  CLEAR COMPLETION CRITERIA                                  │
│  ─────────────────────────────────────────────────────────  │
│  The hook defines "done": tests pass, lint clean, types ok. │
│  No ambiguity about when to stop.                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 错误分类

并非所有失败都应该进入循环。钩子脚本应区分：

| 类型 | 示例 | 操作 |
|------|----------|--------|
| **代码错误** | 逻辑缺陷、错误的断言、类型不匹配 | 退出码 2 → 循环继续 |
| **访问错误** | 缺少 API 密钥、数据库连接被拒绝 | 退出码 0 → 停止并向用户报告 |
| **环境错误** | 缺少软件包、运行时版本错误 | 退出码 0 → 停止并向用户报告 |

上面的示例脚本已对此进行了处理——它们仅在测试、代码检查或类型检查失败时以退出码 2 退出，而不会对环境问题如此处理。

---

## 何时使用 TDD 循环

### 适合
| 使用场景 | 原因 |
|----------|-----|
| 功能开发 | 测试可提供明确的通过/失败信号 |
| 缺陷修复 | 编写失败的测试，修复问题，并循环直至测试通过 |
| 重构 | 现有测试可发现回归问题 |
| API 开发 | 每个端点都可独立测试 |

### 不适合
| 使用场景 | 原因 |
|----------|-----|
| UI/UX 工作 | 需要人工判断 |
| 一次性操作 | 无需迭代 |
| 需求不明确 | 没有明确的“完成”标准 |
| 主观设计 | 没有客观的成功衡量标准 |

---

## 禁用循环

要在某个会话中暂时禁用 TDD 循环：

1. 移除或重命名 `.claude/settings.json` 中的 Stop 钩子
2. 或在脚本中设置 `MAX_ITERATIONS=1`
3. 或删除 `scripts/tdd-loop-check.sh`

仅当脚本存在且已配置时，钩子才会触发。

---

## Gitignore 新增内容

```gitignore
# TDD loop state
.claude/.tdd-iteration-count
```