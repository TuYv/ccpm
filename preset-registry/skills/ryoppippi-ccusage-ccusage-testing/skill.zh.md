---
name: ccusage-testing
description: Guides ccusage Rust tests. Use when adding or fixing cargo tests, CLI snapshots, Claude model pricing, LiteLLM compatibility, or Rust fixture-backed parser and loader tests.
---
# ccusage 测试

逻辑变更和通用测试可读性规则请使用 `tdd` 技能，其中包括当重复能提升清晰度时避免对测试过度 DRY 的指导。本技能补充了 ccusage 特有的 Rust、fixture、模型和定价规则。Vitest 和 TypeScript 文件系统 fixture 请使用 `ccusage-typescript`。

## Rust 测试

当当前 shell 尚未暴露 Rust 工具链时，使用 `direnv exec .`：

```sh
direnv exec . cargo test --manifest-path rust/Cargo.toml --workspace
direnv exec . cargo test --manifest-path rust/Cargo.toml --workspace <test_name>
direnv exec . cargo test --manifest-path rust/Cargo.toml --workspace -- --ignored
```

对于整个仓库的验证，优先使用包脚本，因为它会同时运行 Vitest 和 Rust 测试：

```sh
direnv exec . pnpm run test
```

用 `#[cfg(test)] mod tests` 将 Rust 单元测试放在其测试的模块附近。拆分大型模块时，应将对应的测试随代码一起移动，而不是把无关的测试留在 `main.rs` 中。

针对解析器、路径发现、SQLite 加载、去重、聚合、定价以及 CLI 输出一致性，使用由 fixture 支撑的 Rust 测试。临时文件系统设置优先使用 `ccusage-test-support`，而不是手写的 `env::temp_dir()` 路径。要了解聚焦的 cargo 命令，请阅读 `../tdd/references/rust-running.md`；要了解 Rust 测试语法示例，请阅读 `../tdd/references/rust-test-examples.md`。

## Rust 文件系统 Fixture

需要临时文件或目录的 Rust 测试请使用内部的 `ccusage-test-support` crate。该 fixture 持有一个 `assert_fs::TempDir`，因此在测试结束时 fixture 变量被 drop 时，所有内容都会被自动移除。

对于小型内联目录树，优先使用 `fs_fixture!`：

```rust
use ccusage_test_support::fs_fixture;

let fixture = fs_fixture!({
    "projects/example/session.jsonl": "{}\n",
});

let file_path = fixture.path("projects/example/session.jsonl");
```

对于增量式设置，直接使用 `Fixture`：

```rust
use ccusage_test_support::Fixture;

let fixture = Fixture::new();
fixture.create_dir_all("projects/example/session");
fixture.write_file("projects/example/session/chat.jsonl", "{}\n");
```

只要其下的路径还在使用，就让 fixture 变量保持存活。不要从较短的内层作用域只返回或存储一个 `PathBuf`，因为 fixture 被 drop 时会删除该目录。

## 测试可读性

- 对于预期失败，避免在测试中使用 `try`/`catch`。使用 `Result` 测试、`matches!` 或显式的错误断言。
- 避免在测试体内部使用 `if` 分支。应将不同行为拆分为独立的测试；在 crate 已可用时使用 `rstest` 用例；在单个表驱动测试中迭代显式的 Rust case 结构体；或者为重复断言添加一个小的局部宏。
- 测试不需要 DRY。当重复、显式的设置能让行为更易读时，优先在每个测试中重复编写。
- 不要把一次性使用的值从测试中提取出去。当共享字面量和直接的设置值会让行为更难阅读时，应在测试体中以内联方式编写。

具体的 Rust 示例请阅读 `../tdd/references/rust-test-examples.md`。

## CLI 输出测试

针对人类可读表格输出的集成测试应使用聚焦的 golden output（黄金输出）或显式布局断言，使表格布局和响应式行为对每个受影响的 agent/report 组合都保持可审查性。

结构化行为优先使用 JSON 断言，终端布局优先使用快照断言。

## Claude 模型

在测试中使用当前的 Claude 4 模型名：

```text
claude-sonnet-4-20250514
claude-opus-4-20250514
```

首选的命名模式是 `claude-{model-type}-{generation}-{date}`。仅在测试明确覆盖定价查找、别名处理或遗留兼容行为时，才使用诸如 `claude-4-sonnet-*` 的兼容或别名形式。

当模型覆盖范围很重要时，应同时包含 Sonnet 和 Opus。除非测试专门覆盖遗留输入，否则避免使用过时的 Claude 3 模型名。

## LiteLLM 定价

成本计算需要与 LiteLLM 定价数据完全匹配的模型名。如果要添加模型测试：

1. 验证该模型存在于 LiteLLM 的定价数据中。
2. 使用定价数据库中的精确模型名。
3. 在包中已有该模式的地方，优先使用离线/打桩（stubbed）的定价加载器。

与定价相关的测试失败可能意味着外部模型数据库发生了变化，或某个模型名不受支持。
