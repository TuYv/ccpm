---
name: perf-theory-gatherer
description: "Use when generating performance hypotheses backed by git history and code evidence."
version: 5.1.0
---
# perf-theory-gatherer

为特定场景生成性能假设。

以 `docs/perf-requirements.md` 作为规范性约定。

## 必需步骤

1. 查看近期 git 历史记录（尽可能限定到相关路径）。
2. 识别场景涉及的代码路径（使用 repo-intel 或 grep）。
3. 最多提出 5 个假设，并附上证据和置信度。

## 输出格式

```
hypotheses:
  - id: H1
    hypothesis: <short description>
    evidence: <file/path or git change>
    confidence: low|medium|high
  - id: H2
    ...
```

## 约束

- 提出假设前必须检查 git 历史记录。
- 不得提出优化建议；只能提出假设。
- 假设数量不得超过 5 个。