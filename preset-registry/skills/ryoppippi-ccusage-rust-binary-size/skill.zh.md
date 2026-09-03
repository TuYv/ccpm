---
name: rust-binary-size
description: Guides Rust binary size reduction for ccusage. Use when changing the rust/Cargo.toml release profile, dependency features, native packaging size, or investigating executable bloat with cargo bloat.
paths:
  - 'rust/Cargo.toml'
  - 'rust/**/*.rs'
  - 'rust/**/*.toml'
  - 'apps/ccusage/scripts/**'
globs: 'rust/**/*.rs,rust/**/*.toml,apps/ccusage/scripts/**'
---
# Rust 二进制文件体积

https://github.com/johnthagen/min-sized-rust

## 基线

`rust/Cargo.toml` 中的 `[profile.release]` 已经应用了 `min-sized-rust` 的设置，其中包括为依赖项单独设置的 `opt-level`。在添加任何内容之前先阅读它，并且仅在有测量结果支持时才修改它。

最终进入已发布平台包的，是由 `apps/ccusage/scripts/` 中的 Nushell 脚本暂存的单个 `bin/ccusage`，因此打包体积几乎完全跟随该二进制文件的变化。`development` 技能涵盖了这一打包衔接处。

## 排查

在修改代码或依赖之前先进行测量：

```sh
direnv exec . cargo build --manifest-path rust/Cargo.toml --release --bin ccusage
ls -lh rust/target/release/ccusage
```

当 release profile 无法解释体积回退时，检查 feature 标志（`cargo tree -e features -p ccusage`）和大型符号（`cargo bloat --release --bin ccusage --crates`），两者都针对同一份 manifest 执行。`cargo bloat` 不在开发 shell 中；`missing-tools` 技能介绍了如何在不对 flake 进行更改的情况下运行它。

## 更改顺序

低风险优先：一旦测试表明依赖的默认特性未被使用就去掉这些不必要的默认特性，收窄可选特性而非更换契合良好的 crate，并删除仅用于 release 的死代码路径或资源。除非用户另有要求，CLI 行为、JSON 输出、表格输出和打包语义保持不变。

这些属于可选实验，仅当用户要求激进地将体积压至最小时才适用：仅限 nightly 的标志（`-Zlocation-detail`、`-Zfmt-debug`、`panic=immediate-abort`、`build-std`）、配合手动 stdio 的 `#![no_std]`/`#![no_main]`、诸如 UPX 之类的二进制打包器，以及 `prefer-dynamic` 链接。

## 验证

对于 release profile 或打包方面的更改，重新构建原生 CLI，与之前的测量结果进行对比，并将所用命令和结果记录在 PR 正文或评审回复中。仓库范围的格式化与测试配方在 `development` 技能中。
