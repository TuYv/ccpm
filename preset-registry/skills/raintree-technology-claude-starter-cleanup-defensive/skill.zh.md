---
name: cleanup-defensive
description: "Remove pointless try/catch blocks and defensive guards that hide errors or add no value. Preserves catches at true system boundaries (HTTP handlers, CLI entry, message consumers). Use when the user asks to remove try/catch, fix error hiding, clean up defensive code, or stop swallowing errors. Example queries — \"remove pointless try/catch\", \"we're swallowing errors\", \"stop hiding bugs in catch blocks\", \"clean up the defensive code\"."
argument-hint: "[scope (optional path or glob)]"
user-invocable: true
---
移除那些并不发挥实际作用的 try/catch 和防御性空值检查。目标是让错误干净地传播到知道如何处理它的边界，而不是用静默回退来掩盖 bug。

**核心原则**：只在你能做出比默认传播更有用的事情时才去 catch——而“记录日志后重新抛出”很少比直接让它抛出更有用。

## 预检

1. **语言检测**：TS/JS、Python、Go（`if err != nil` 模式）、Rust（带有防御气息的 `unwrap_or`/`map_err` 链）。
2. **Git 状态**：工作区不干净（dirty tree）时拒绝执行。
3. **报告目录**：确认其存在。
4. **识别边界文件**——保留以下位置的 catch：
   - HTTP 请求处理器（`app/api/`、`routes/`、Hono/Express/FastAPI 处理器）
   - CLI 入口点（包含 `if __name__ == "__main__"` 的文件、`bin/*`、`cmd/*`）
   - 消息/队列消费者（worker 入口点、cron 处理器）
   - 测试文件（测试运行器需要将失败局部化）

## 检测

### TypeScript / JavaScript
```bash
# Find every try/catch
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" -B1 -A5 "try {" \
  --exclude-dir=node_modules --exclude-dir=.next . > /tmp/try-catches.txt

# ESLint can flag the obvious useless ones
npx eslint --rule '{"no-useless-catch": "error"}' --no-eslintrc . 2>&1 | grep no-useless-catch > /tmp/useless-catch.txt
```

按内容对每个 catch 块进行分类：
- **仅重新抛出**：`catch (e) { throw e }`，或未添加任何上下文的 `catch (e) { throw new Error(...) }`
- **吞掉 + 返回 null/空值**：`catch { return null }`、`catch { return [] }`、`catch { return {} }`
- **吞掉 + 仅记录日志**：`catch (e) { console.error(e) }` 然后静默继续
- **记录日志 + 重新抛出**：`catch (e) { logger.error(e); throw e }`——如果已有全局处理器负责日志，这通常毫无意义
- **实质性处理**：确实执行清理、重试、返回带类型的 Result，或对错误进行有意义的转换

### Python
```bash
grep -rn --include="*.py" -B1 -A5 "try:" . > /tmp/py-try.txt
# Bare except is always defensive
grep -rn --include="*.py" -E "except\s*:|except\s+Exception\s*:" . > /tmp/py-bare-except.txt
```

### Go
```bash
# Find error-swallowing patterns: ignored errors, generic fallbacks
grep -rn --include="*.go" -E "_ = .*\.Err|_, _ =" . > /tmp/go-ignored.txt
```

### Rust
```bash
grep -rn --include="*.rs" -E "\.unwrap_or\(|\.unwrap_or_default\(|\.ok\(\)" . > /tmp/rust-defensive.txt
```

## 评估

写入 `.claude/cleanup-reports/cleanup-defensive-{YYYY-MM-DD}.md`：

```markdown
# Defensive Code Assessment — YYYY-MM-DD

## Summary
- try/catch blocks scanned: N
- HIGH (remove): X — pure rethrow, swallow-and-return-null, useless wrappers
- MEDIUM (review): Y — log+rethrow, broad excepts with context
- LOW (preserve): Z — substantive handling, boundary code

## Findings

### HIGH — `lib/parse.ts:45`
```ts
try {
  return JSON.parse(s)
} catch (e) {
  return null
}
```
**Problem**: caller can't distinguish "valid JSON null" from "parse failed". Hides bugs.
**Fix**: remove try; let JSON.parse throw. If callers need optional, change return to `Result<T, ParseError>` or have caller wrap.

### HIGH — `services/user.ts:88`
```ts
try {
  return await fetchUser(id)
} catch (e) {
  throw e
}
```
**Problem**: literally a no-op wrapper.
**Fix**: remove try/catch entirely.

### MEDIUM — `services/payment.ts:120`
```ts
try {
  await charge(amount)
} catch (e) {
  logger.error('charge failed', { e, userId })
  throw e
}
```
**Problem**: log+rethrow. If global handler also logs, this is duplication.
**Recommendation**: check if there's a global error logger. If yes, remove. If the contextual data (`userId`) isn't otherwise captured, keep but add a note.

### LOW — `app/api/[...path]/route.ts:34` — preserve, this is the API boundary.

## Critical Assessment
[2-3 paragraphs on patterns: is this codebase prone to silent fallbacks? Are there layers wrapping errors unnecessarily?]
```

## 执行

**仅自动移除 HIGH 级别项。**

### 置信度评分标准

**HIGH（自动移除）：**
- `try { x } catch { } `（静默吞掉，无返回）
- `try { x } catch (e) { throw e }`（无操作）
- `try { x } catch (e) { throw new Error(e.message) }`（丢失堆栈，无任何增益）
- `try { x } catch { return null/undefined/[]/{}/0 }`（掩盖错误的静默回退）——仅当该文件不是边界文件时
- Python 的 `except: pass` 块
- Go：`_ = someCall()`，且被丢弃的值是 `error`

**MEDIUM（仅报告）：**
- 记录日志 + 重新抛出（可能是有意的可观测性设计）
- 带重试逻辑的 catch
- 中间件中的 catch（可能是有意的最后防线）
- `unwrap_or(default)`，且 default 是一个真实值（可能是有意为之）

**LOW（保留）：**
- 位于边界文件内部（见预检清单）
- 位于 `__init__.py` 导入时错误处理器内部（兼容性回退）
- 对异常类型进行有意义转换的 catch（例如 `catch DBError { throw new ValidationError() }`）
- 通过 `finally` 执行实际清理工作的 catch

### 执行步骤

对每个 HIGH 项：
1. 移除 try 包装，保留主体中的表达式。
2. 如果函数签名曾因该 catch 而暗示“出错时可能返回 null”，那么该签名现在就是在撒谎——标记为待人工审查（不要自动修改签名）。
3. 单次提交：`chore(cleanup): cleanup-defensive — removed N useless try/catch blocks`。

## 验证

```bash
bun run check 2>&1 || npx tsc --noEmit && npx eslint .
bun test 2>&1
pytest 2>&1
go test ./... 2>&1
cargo test 2>&1
```

此步骤中测试至关重要——移除被吞掉的错误往往会暴露之前被隐藏的真实 bug。如果测试失败：
1. 仔细阅读失败信息——是被暴露出来的真实 bug（好事，不要回退；标记给人工处理），还是我们移除了对测试起到承重作用的 catch（将该处回退）。
2. 默认动作：回退并降级为 MEDIUM。由人来决定暴露出的失败是否属于“其实应当修复的 bug”。

## 输出

- “已移除 N 个无用的 try/catch 块。M 个已延后待审查。”
- 报告路径。
- 验证状态。如果测试暴露了之前被隐藏的错误：用“⚠️ 真实错误已暴露——详见报告。”醒目标注。

## 绝不

- 移除请求处理器、路由、消息消费者或 CLI 入口点中的 catch。
- 移除带有 `finally` 且执行清理工作（关闭资源、释放锁）的 catch。
- 移除将一种错误类型转换为另一种语义上有意义的错误类型的 catch。
- “修复” Go 的 `if err != nil { return err }` 模式——那正是 Go 的正规写法，不是防御性代码。
- 在不理解前置条件的情况下移除 Rust 的 `unwrap()`；替代方案至少应为 `expect("reason")`，或进行妥善处理。
- 在未确认某个 Python `except` 捕获的是特定的预期异常之前就将其移除。
- 为了“让测试通过”而修改错误处理——测试失败本身可能就是真正的 bug。
