---
name: instinct-apply
description: Surfaces relevant instincts during work. Use when starting a task to check if any learned behaviors apply.
---
# 本能应用

你已经习得了一些行为。请运用它们。

## 何时检查

- 开始编码任务时
- 准备以之前见过的模式使用工具时
- 对代码风格、测试、git 做出决定时

## 如何检查

```bash
# Read all personal instincts
for f in .claude/homunculus/instincts/personal/*.md; do
  [ -f "$f" ] && echo "=== $(basename "$f") ===" && cat "$f" && echo
done 2>/dev/null

# Also check inherited instincts
for f in .claude/homunculus/instincts/inherited/*.md; do
  [ -f "$f" ] && echo "=== $(basename "$f") ===" && cat "$f" && echo
done 2>/dev/null
```

## 如何应用

1. 阅读任务/上下文
2. 检查本能触发条件
3. 如果触发条件匹配，则遵循相应操作
4. 留意置信度——置信度越高，确定性越强

## 本能结构

```yaml
---
trigger: "when [condition]"
confidence: 0.7
domain: "code-style"
---

# Name

## Action
What to do

## Evidence
Why this exists
```

## 置信度解读

- **0.3-0.5**：试探性。如果感觉合适，就应用。
- **0.5-0.7**：中等。除非有理由不这样做，否则应当应用。
- **0.7-0.9**：强。始终如一地应用。
- **0.9+**：几乎确定。始终应用。

## 如果本能似乎有误

当某项本能被触发，但相应操作似乎不适合当前情况时：

1. 不要盲目应用
2. 记录不匹配之处
3. 这对观察者来说是有用的数据

本能可能出错。它们是从模式中学习而来的，而模式存在例外。

## 轻量应用

不要每次执行操作时都读取所有本能。将相关本能保留在工作记忆中。

快速领域检查：
- 编写代码？→ 检查 `code-style` 本能
- 运行测试？→ 检查 `testing` 本能
- 创建提交？→ 检查 `git` 本能
- 调试？→ 检查 `debugging` 本能

保持高效。本能旨在提供帮助，而不是拖慢速度。