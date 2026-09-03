---
name: testing
description: Guides ccusage Rust and Node tests. Use when adding or fixing cargo tests, Node test files, CLI snapshots, Claude model pricing, LiteLLM compatibility, or fixture-backed tests.
---
# ccusage 测试

`tdd` 技能负责 Red-Green-Refactor（红-绿-重构）循环以及聚焦式运行器命令。本技能负责 ccusage 特有的内容：fixtures（测试固定数据）、适配器覆盖、定价与模型行为、快照、CLI 输出以及打包工具链。

- 优先编写聚焦行为的测试而非校验结构外形的测试，除非结构规范化本身就是被测行为。
- 分支行为应放在独立的测试或表驱动用例中，而不是在测试体内使用 `if`。
- 当真实用户日志目录能够捕获结构漂移（schema drift）时，跳过本地数据冒烟测试是可以接受的，前提是它们在干净的 CI 机器上能够通过。

## Rust

单元测试位于其所测试的模块旁边的 `#[cfg(test)] mod tests` 中。当大型模块被拆分时，其测试应随代码一同迁移，而不是留在 `main.rs` 中。

关于 fixtures、快照、定价和模型名称，请阅读 `references/rust.md`。

## Node

请阅读 `references/node-test.md`。Node 仅覆盖包启动器和 Nix 侧的 JS 工具；生产环境 CLI 的运行时行为在 Rust 中测试。
