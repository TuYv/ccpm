---
name: reduce-similarities
description: Detects duplicated Rust code with the dev-shell similarity-rs CLI. Use when reviewing .rs files for repeated functions, impl methods, or parallel struct and enum definitions, or before extracting a shared helper.
argument-hint: '[path] [--threshold 0.85] [--print]'
allowed-tools: Bash(similarity-rs *) Read Grep Glob
paths: '**/*.rs'
---
# Rust 代码相似度检测

`similarity-rs` 来自 Nix 开发环境 shell（即 `nix/dev-shell.nix` 中的 `similarity`）；在
shell 外部使用时需加上 `direnv exec .` 前缀。
TypeScript 的重复代码属于 `typescript` 和 `ast-grep` 技能的范畴。

对 `$ARGUMENTS` 运行它；若未给出参数，则对 `.` 运行。函数和类型定义是分开的两次扫描，因此
默认运行会静默遗漏平行的 struct 和 enum：

```bash
similarity-rs . --threshold 0.85 --min-lines 5
similarity-rs . --threshold 0.85 --experimental-types
```

`--print` 会显示匹配的代码片段，其余选项见 `similarity-rs --help`；
当形状类似 fixture 的测试函数淹没了真正的发现时，值得加上 `--skip-test`。

## 结果甄别

分数只是起点，而非定论。通常值得重构的情况：

- 100% 匹配：提取共享函数或泛型。
- 跨不同类型 95-100% 匹配：带 trait 约束的泛型函数。
- 多个类型上重复的 impl 方法：带默认实现的 trait。
- 85-95% 匹配的 match 分支或错误处理：共享辅助函数或宏。
- 字段完全相同的平行 struct：共享基类或泛型 struct。

通常可保留不动：简短的 `new()` 构造函数、简单的 `From`/`Into` impl，以及
任何可由 derive 生成的内容。

将每个保留下来的候选项报告为具体的前后对比形态，而不是一份分数清单。
