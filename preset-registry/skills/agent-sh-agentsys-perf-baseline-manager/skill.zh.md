---
name: perf-baseline-manager
description: "Use when managing perf baselines, consolidating results, or comparing versions. Ensures one baseline JSON per version."
version: 5.1.0
---
# perf-baseline-manager

管理基线的存储与比较。

遵循 `docs/perf-requirements.md`，将其作为规范性约定。

## 必须遵守的规则

- 每个版本对应一个基线 JSON。
- 存储在 `{state-dir}/perf/baselines/<version>.json`。
- 记录指标和环境元数据。

## 输出格式

```
baseline_version: <version>
metrics: <summary>
file: <path>
```

## 约束

- 覆盖同一版本的旧基线。
- 不要为一个版本创建多个文件。