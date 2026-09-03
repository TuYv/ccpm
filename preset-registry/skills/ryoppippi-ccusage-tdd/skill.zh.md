---
name: tdd
description: Guides t-wada Red-Green-Refactor TDD for ccusage logic changes. Use when implementing a feature, writing a regression test for a bug, or refactoring Rust or TypeScript behavior test-first.
---
# TDD

此处的逻辑变更——bug 修复、新功能、重构——遵循 t-wada 风格的
Red-Green-Refactor（红-绿-重构）。对于不熟悉的 API、原型和数据探索，
先执行-观察-调整；并非每次试探都需要测试。

`testing` 技能负责 ccusage 特有的部分：测试夹具、适配器覆盖、
定价、模型名称、快照以及 CLI 输出。

## 循环

1. 将行为以占位符形式勾画出来——Node 测试中用 `it.todo(...)`，Rust 中用
   `#[ignore]`——然后逐个处理，最简单的优先。bug 修复从复现该 bug 的
   回归测试开始。
2. **红**——编写失败的测试，并确认它因预期的原因而失败。
3. **绿**——编写能通过测试的最少生产代码。先伪造，再弄真，
   然后用更多测试进行三角定位。
4. **重构**——在一切保持绿色（通过）的同时清理测试代码和生产代码。
   只在绿色时重构；当测试为红色时，先修复生产代码。
5. 每次变绿和每次重构步骤之后都运行受影响的测试。完整套件的运行用于
   最终验证和 CI。

让每个测试只针对一个可观察行为，以该行为命名，并通过公共接口进行断言；
绝不为了获得绿色构建而削弱一个有效的测试。断言某个文档包含特定措辞的
测试只是在固化文本，而不是证明一个契约。

三种值得点名的失败模式：

- 横向切片。一条接缝、一个测试、一个最小实现，然后再下一个——
  不是先写完所有测试再实现。
- 同义反复的期望值。期望值应来自独立来源，而不是在测试中
  重新运行生产算法来得出。
- 在系统内部 mock。只替换真实的边界——定价抓取和
  日志目录——通过代码已有的接缝：`--offline`、
  `CLAUDE_CONFIG_DIR` 及其同类，以及 `ccusage-test-support`。工作区自有的
  协作者应通过其公共接口来驱动。

## 聚焦运行

Rust 测试位于 `rust/Cargo.toml` 工作区中。当 `cargo` 尚不在
`PATH` 上时，需加前缀 `direnv exec .`。

```sh
direnv exec . cargo test --manifest-path rust/Cargo.toml --workspace <name-filter>
direnv exec . cargo test --manifest-path rust/Cargo.toml --workspace -- --ignored

node --test --test-name-pattern '<name-filter>' apps/ccusage/src/cli.test.ts
```

`just test` 运行两个套件，`just rust::test` 运行 Rust 套件，`just test-node` 运行
Node 套件。
