---
name: perf-profiler
description: "Use when profiling CPU/memory hot paths, generating flame graphs, or capturing JFR/perf evidence."
version: 5.1.0
argument-hint: "[tool] [command]"
---
# perf-profiler

运行性能分析工具，并提供有证据支持的热点信息。

以 `docs/perf-requirements.md` 作为规范性约定。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const tool = args[0] || '';
const command = args.slice(1).join(' ');
```

## 必须遵守的规则

- 在性能分析前验证调试符号。
- 捕获热点的 file:line。
- 尽可能提供火焰图或等效输出。

## 输出格式

```
tool: <profiler>
command: <command>
hotspots:
  - file:line - reason
artifacts:
  - <path to flame graph or profile>
```

## 约束

- 没有明确场景时不得进行性能分析。
- 输出应保持精简，并以证据为依据。