---
name: ccusage-rust-profile
description: Profiles ccusage native Rust CLI performance. Use when debugging slow Rust commands, comparing branch speed, reading profiles, or validating optimization work.
paths:
  - 'rust/**/*.rs'
  - 'rust/**/*.toml'
  - 'rust/**/build.rs'
globs: 'rust/**/*.rs,rust/**/*.toml,rust/**/build.rs'
---
# ccusage Rust 性能分析

将该技能用于原生 CLI 的性能工作。仅在涉及 TypeScript 启动器、基准测试或打包脚本时使用 `bun-cpu-profile`。

## 准备工作

在进行非平凡的优化之前，先阅读本地 Rust Performance Book 的相关页面。请先定位克隆位置，而不是假设某个机器特定的路径：

```fish
set perf_book_dir (ghq list --full-path nnethercote/perf-book | head -n 1)
sed -n '1,220p' "$perf_book_dir/src/profiling.md"
sed -n '1,220p' "$perf_book_dir/src/io.md"
sed -n '1,220p' "$perf_book_dir/src/heap-allocations.md"
sed -n '1,220p' "$perf_book_dir/src/parallelism.md"
sed -n '1,220p' "$perf_book_dir/src/type-sizes.md"
```

如果没有本地克隆，则使用在线托管的 Rust Performance Book 作为后备：
`https://nnethercote.github.io/perf-book/`。

在计时之前先构建 release 二进制文件：

```sh
direnv exec . cargo build --manifest-path rust/Cargo.toml --release --bin ccusage
```

## 端到端对比

为分支与 main 的对比创建一个单独的 main 工作树：

```sh
command git fetch origin main
command git worktree add /tmp/ccusage-main origin/main
direnv exec . cargo build --manifest-path rust/Cargo.toml --release --bin ccusage
cd /tmp/ccusage-main
direnv exec . cargo build --manifest-path rust/Cargo.toml --release --bin ccusage
```

使用确定性的输出设置对真实命令进行测量：

```sh
hyperfine --warmup 4 --runs 10 --shell none \
	"env LOG_LEVEL=0 COLUMNS=200 NO_COLOR=1 TZ=UTC rust/target/release/ccusage daily --offline --json" \
	"env LOG_LEVEL=0 COLUMNS=200 NO_COLOR=1 TZ=UTC /tmp/ccusage-main/rust/target/release/ccusage daily --offline --json" \
	--export-json /tmp/ccusage-rust-hyperfine.json
```

为了核对 JSON 输出的一致性，将两份输出分别写入文件并用 `jq` 验证：

```sh
env LOG_LEVEL=0 COLUMNS=200 NO_COLOR=1 TZ=UTC rust/target/release/ccusage daily --offline --json >/tmp/head.json
env LOG_LEVEL=0 COLUMNS=200 NO_COLOR=1 TZ=UTC /tmp/ccusage-main/rust/target/release/ccusage daily --offline --json >/tmp/main.json
jq -e . /tmp/head.json >/dev/null
jq -e . /tmp/main.json >/dev/null
```

## 检查要点

- 在进行只针对 CPU 的调优之前，先关注 I/O 次数与缓冲。
- 避免在热路径上进行不必要的 `String` 分配与克隆；在需要所有权时，优先使用借用的
  `&str`、`Arc<str>` 或类型化摘要。
- 当聚合可以更早完成且不改变输出时，避免返回庞大的中间对象向量。
- 仅在并行化确实能在真实 fixture 数据形态上缩短端到端命令时间时才使用。
- 在新增依赖或启用特性时，保持对二进制体积的关注。

## 验证

在提交优化之前先进行性能分析。使用端到端 `hyperfine` 以及 JSON/表格一致性来验证，而不仅仅是微基准测试。

当 CI 性能评论相关时，可使用 `--help` 查看选项，但不要把帮助输出当作性能分析的工作负载：

```sh
nix develop --command pnpm exec bun apps/ccusage/scripts/compare-pr-performance.ts --head-runtime rust --help
```

要在本地复现该工作流程的形态，请传入真实的 fixture 和工作树输入：

```sh
nix develop --command pnpm exec bun apps/ccusage/scripts/compare-pr-performance.ts \
	--base-dir /tmp/ccusage-main \
	--head-dir "$PWD" \
	--head-runtime rust \
	--fixture-dir apps/ccusage/test/fixtures/claude \
	--codex-fixture-dir apps/ccusage/test/fixtures/codex \
	--runs 1 \
	--warmup 0 \
	--output /tmp/ccusage-rust-perf-comment.md
```
