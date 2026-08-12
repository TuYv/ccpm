---
name: perf-analyzer
description: "Use when synthesizing perf findings into evidence-backed recommendations and decisions."
version: 5.1.0
---
# perf-analyzer

将性能调查结果整合为清晰的建议。

以 `docs/perf-requirements.md` 作为规范性约定。

## 输入

- 基线数据
- 实验结果
- 性能分析证据
- 已验证的假设
- 极限点测试结果

## 输出格式

```
summary: <2-3 sentences>
recommendations:
  - <actionable recommendation 1>
  - <actionable recommendation 2>
abandoned:
  - <hypothesis or experiment that failed>
next_steps:
  - <if user should continue or stop>
```

## 约束

- 仅引用日志或代码中存在的证据。
- 如果数据不足，请明确说明并要求重新运行。