---
name: perf-benchmarker
description: "Use when running performance benchmarks, establishing baselines, or validating regressions with sequential runs. Enforces 60s minimum runs (30s only for binary search) and no parallel benchmarks."
version: 5.1.0
argument-hint: "[command] [duration]"
---
# perf-benchmarker

按照严格的时长规则依次运行基准测试。

以 `docs/perf-requirements.md` 作为规范性约定。

## 解析参数

```javascript
const args = '$ARGUMENTS'.split(' ').filter(Boolean);
const command = args.find(a => !a.match(/^\d+$/)) || '';
const duration = parseInt(args.find(a => a.match(/^\d+$/)) || '60', 10);
```

## 必须遵守的规则

- 基准测试必须依次运行（绝不能并行运行）。
- 每次运行的最短时长：60 秒（二分查找时可为 30 秒）。
- 预热：测量前至少预热 10 秒。
- 出现异常时重新运行。

## 输出格式

```
command: <benchmark command>
duration: <seconds>
warmup: <seconds>
results: <metrics summary>
notes: <anomalies or reruns>
```

## 输出约定

基准测试必须在标记之间输出 JSON 指标块：

```
PERF_METRICS_START
{"scenarios":{"low":{"latency_ms":120},"high":{"latency_ms":450}}}
PERF_METRICS_END
```

## 约束

- 除非处于二分查找阶段，否则不得缩短运行时长。
- 进行基准测试时不要修改代码。