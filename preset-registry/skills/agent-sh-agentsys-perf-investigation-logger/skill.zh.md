---
name: perf-investigation-logger
description: "Use when appending structured perf investigation notes and evidence."
version: 5.1.0
---
# perf-investigation-logger

将结构化的调查记录追加到 `{state-dir}/perf/investigations/<id>.md`。

遵循 `docs/perf-requirements.md`，将其作为规范性约定。

## 必需内容

1. 用户原话（逐字引用）
2. 阶段摘要
3. 决策及理由
4. 证据指引（文件、指标、命令）

## 输出格式

```
## <Phase Name> - <YYYY-MM-DD>

**User Quote:** "<exact quote>"

**Summary**
- ...

**Evidence**
- Command: `...`
- File: `path:line`

**Decision**
- ...
```

## 约束

- 使用 `AI_STATE_DIR` 作为状态路径（默认为 `.claude`）。
- 不要改述用户原话。