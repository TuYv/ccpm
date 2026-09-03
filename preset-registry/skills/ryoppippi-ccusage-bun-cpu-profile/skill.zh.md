---
name: bun-cpu-profile
description: Profiles Bun TypeScript and JavaScript package scripts. Use for launcher, benchmark, or packaging hot paths; use ccusage-rust-profile for native CLI performance.
---
# Bun CPU 性能分析

此技能适用于 TypeScript 包脚本。生产环境 CLI 以 Rust 为先，
因此原生命令的性能工作应改用 `ccusage-rust-profile` 技能。

## 工作流程

在进行性能分析之前，请先阅读 `references/profile-workflow.md`。其中包含 Bun
分析器命令、ccusage 分支与 main 的对比设置、hyperfine 验证、
分析结果阅读检查清单、Bun 参考资料查阅，以及过往 ccusage 性能工作中总结的经验教训。
