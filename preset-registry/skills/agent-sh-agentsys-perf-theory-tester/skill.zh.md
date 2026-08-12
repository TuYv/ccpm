---
name: perf-theory-tester
description: "Use when running controlled perf experiments to validate hypotheses."
version: 5.1.0
---
# perf-theory-tester

使用受控实验检验假设。

将 `docs/perf-requirements.md` 作为规范性约定。

## 必需步骤

1. 确认基线处于干净状态。
2. 应用一项与假设相关的变更。
3. 运行 2 次或更多次验证。
4. 在进行下一个实验前恢复到基线。

## 输出格式

```
hypothesis: <id>
change: <summary>
delta: <metrics>
verdict: accept|reject|inconclusive
evidence:
  - command: <benchmark command>
  - files: <changed files>
```

## 约束

- 每个实验只能进行一项变更。
- 不得并行运行基准测试。
- 记录每次运行的证据。