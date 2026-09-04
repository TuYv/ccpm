---
name: rust
description: Guides ccusage Rust implementation work. Use when editing rust/crates or rust/adapters, adapter module layout, crate visibility and hawk findings, embedded pricing, or Rust behavior parity.
paths:
  - 'rust/**/*.rs'
  - 'rust/**/*.toml'
  - 'rust/**/build.rs'
globs: 'rust/**/*.rs,rust/**/*.toml,rust/**/build.rs'
---
# ccusage Rust

原生 Rust CLI 是生产环境使用的实现。`rust/adapters/<agent>` 中的每个
crate 对应一个用量来源；`rust/crates` 存放与单一来源无关的所有内容。

编辑前先阅读：

- `rust/adapters/README.md` 和 `rust/adapters/AGENTS.md` —— 适配器架构、
  共享代码与来源专属代码的分界、模块形态，以及新增 agent 的核对清单。
  `rust/adapters/opencode/src/` 是一个紧凑的完整示例。
- crate 自己的 `README.md` —— 它负责什么、构建时属于哪一层 Crane 产物，
  这也正是改动它的代价所在。部分适配器还会添加一个 `src/README.md`
  来描述来源格式。

crate 命名背后隐藏的两条分界线：`ccusage-cli` 存放纯参数类型，而
`ccusage-cli-parser` 存放解析器、帮助渲染器以及仅二进制文件依赖的嵌入式
帮助 JSON；`rust/crates/ccusage` 刻意保持精简，只包含分发逻辑以及那些
不属于 agent 报告的命令。两个适配器都需要的行为应移入
`ccusage-adapter-common`（`rust/adapters/common`），而不是变成适配器
之间的相互依赖。

拆分大型模块或排查重复代码时，使用 `reduce-similarities`
技能。

## 行为一致性

除非用户明确限定行为变更的范围，否则保持现有 Rust 行为不变：报告语义、
JSON 字段、表格列、进度与加载动画（spinner）文案、agent 分组、日期过滤、
`--offline`、`CLAUDE_CONFIG_DIR`，以及各来源专属的环境变量。

`origin/main` 已不再包含 TypeScript 适配器。移植历史行为时，应与仍包含
它们的某个提交做对比（`git log -1 -- apps/ccusage/src/adapter`）。在修改
行为之前，先固定比较窗口 —— 是当前 main、某个历史发布，还是那个固定的
提交。

## 可见性

在本工作区中，`pub` 仅用于另一个 crate 确实会用到的内容；其余一切均为
`pub(crate)`，包括同一 crate 内其他模块经由模块链访问的条目。

`just hawk` 会报告差异，而 `nix flake check` 通过
`checks.<system>.ccusage-hawk` 对同一项进行门禁。当某条结果看起来不对时，
先检查 `rust/hawk.toml` 是否缺少已发布的入口点，再做任何收窄；给底层的
`cargo hawk check` 加上 `--fix` 即可应用该收窄。

hawk 只能在它编译时所用的工具链上运行，因此 `rust-toolchain.toml` 与
`nix/cargo-hawk.nix` 需要一起变动 —— 后者的文件头说明了版本固定的方式，
并列出了版本升级时必须同步修改的哈希值。

https://github.com/astral-sh/hawk

## 价格数据嵌入

二进制文件内置了两份快照，均由固定的（pinned）flake 输入提供，并由
`rust/crates/ccusage-core/src/pricing.rs` 加载；
`rust/crates/ccusage-core/README.md` 及其 `build.rs` 负责构建时那一半。

LiteLLM 是主表。它在构建时被压缩进 `OUT_DIR`，从不提交到仓库：Nix 构建
和开发 shell 通过 `CCUSAGE_PRICING_JSON_PATH` 将锁定的快照交给
`build.rs`，而默认关闭的 `fetch-litellm-pricing` feature 则在 Nix 无法
覆盖的平台上为普通 `cargo build` 下载该快照。保持它默认关闭 —— 它的
rustls 栈是整个工作区中最昂贵的构建依赖。`just update-litellm-pricing`
会重新锁定输入并进行校验。

models.dev 是已提交的离线回退方案：
`rust/crates/ccusage-core/src/models-dev-pricing.json` 和
`rust/adapters/codex/src/codex-auto-review-fallbacks.json`，两者均由
`just gen-models-dev-pricing` 重新生成（`just update-models-dev-pricing`
会先更新固定输入的版本）。`rust/crates/ccusage-core/src/fast-multiplier-overrides.json`
与它们放在一起，但由人工维护。

过滤与压缩逻辑应放在 `build.rs` 中，因此运行时代码先加载构建时生成的
快照，再加载内置的模型覆盖，最后在未指定 `--offline` 时进行运行时抓取。
通过测试覆盖嵌入/离线价格与上下文限制。

## 校验

测试命令位于 `testing` 技能中；性能工作与分支对 main 的对比位于
`profile`；仓库范围的格式化与检查配方位于 `development`。
