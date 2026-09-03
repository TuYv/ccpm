---
name: ccusage-rust
description: Guides ccusage Rust implementation work. Use when editing rust/crates, native packaging, parser/module layout, pricing embedding, or Rust/TypeScript parity.
paths:
  - 'rust/**/*.rs'
  - 'rust/**/*.toml'
  - 'rust/**/build.rs'
globs: 'rust/**/*.rs,rust/**/*.toml,rust/**/build.rs'
---
# ccusage Rust

使用此技能来处理位于 `rust/crates/ccusage` 和 `rust/crates/ccusage-terminal` 下的原生 Rust CLI。

## 源码一致性

Rust 是生产环境的实现。除非用户明确限定了行为变更的范围，否则应保留现有的 Rust 行为。在实现或重构某个 agent 之前，先查看当前的 Rust 适配器以及该 agent 的源码参考文档：

```sh
fd . rust/crates/ccusage/src/adapter/<agent>
sed -n '1,220p' .agents/skills/ccusage-agent-sources/references/<agent>.md
```

在从历史 TypeScript 实现移植行为时，先找到仍包含 `apps/ccusage/src/adapter` 的相关 commit 或 tag，再与该源码进行对比。不要假设 `origin/main` 仍包含 TypeScript 适配器。

保留报告语义、JSON 字段、表格列、进度/加载指示器文本、agent 分组、日期过滤、`--offline`、`CLAUDE_CONFIG_DIR` 以及各数据源专属的环境变量。

## 模块布局

不要让 `main.rs` 或单个庞大的适配器文件继续膨胀。在可行的情况下，采用以下职责边界：

- `adapter/<agent>/mod.rs` — 适配器的公开接口与命令接线。
- `adapter/<agent>/paths.rs` — 环境变量、默认值以及路径发现。
- `adapter/<agent>/parser.rs` — 原始记录解析以及 token/模型映射。
- `adapter/<agent>/loader.rs` — 文件遍历、SQLite 读取、去重以及日期过滤入口点。
- `adapter/<agent>/report.rs` — 在 agent 特有情况下的 JSON/表格行整形。
- 共享模块保留在 `types.rs`、`summary.rs`、`output.rs`、`pricing.rs`、`progress.rs` 和 `date_utils.rs` 中。

保持公开的 `pub(crate)` 接口面尽可能窄。测试应随其覆盖的代码一起移动，而不是把所有 Rust 测试都留在 `main.rs` 中。

在拆分大型 Rust 模块或消除重复代码时，使用 `reduce-similarities` 技能，它会对 `.rs` 文件运行 `similarity-rs`。

## 价格内嵌

TypeScript 使用构建/宏展开时期的价格快照。Rust 不应仅依赖手工编辑的 `claude-pricing.json` 作为唯一的内嵌来源。

在修改价格时：

- 使用 `litellm` flake input 作为内嵌价格的权威固定版本。
- 对于 Nix 构建，通过 `CCUSAGE_PRICING_JSON_PATH` 将已锁定的 LiteLLM `model_prices_and_context_window.json` 传给 `build.rs`。
- 对于非 Nix 的 Cargo 构建，让 `build.rs` 从 `flake.lock` 读取相同的 `litellm` 版本，并在构建时拉取该固定版本的原始 JSON。
- 不要把生成的 LiteLLM 价格快照提交到仓库中。
- 将价格 JSON 的过滤与压缩保留在 `build.rs` 中，使运行时代码按顺序加载：先生成于构建期的快照，再是内置的模型覆盖，最后在未使用 `--offline` 时进行运行时拉取。
- 为内嵌/离线价格以及上下文上限添加测试。

## 验证

使用 `ccusage-testing` 技能获取 Rust 测试命令。使用 `ccusage-rust-profile` 进行性能相关工作以及分支与主干的对比。对于一致性验证工作，在更改行为之前，先针对当前 main 分支、某个历史发布版本或某个固定的历史 TypeScript commit，在稳定的测试夹具窗口上进行对比。
