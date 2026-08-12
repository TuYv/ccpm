---
name: perf-code-paths
description: "Use when mapping code paths, entrypoints, and likely hot files before profiling."
version: 5.1.0
---
# perf-code-paths

识别性能场景可能涉及的实现路径。

以 `docs/perf-requirements.md` 作为规范性约定。

## 必需步骤

1. 如果 repo-intel 可用，则使用它；否则使用 grep 查找入口点和处理程序。
2. 列出与该场景相关性最高的候选文件/符号。
3. 在相关时包含导入/导出关系或调用链。

## 输出格式

```
keywords: <comma-separated list>
paths:
  - file: <path>
    symbols: [<symbol1>, <symbol2>]
    evidence: <short reason>
```

## 约束

- 仅关注支持的语言（Rust、Java、JS/TS、Go、Python）。
- 保留相关性最高的 10-15 个文件。