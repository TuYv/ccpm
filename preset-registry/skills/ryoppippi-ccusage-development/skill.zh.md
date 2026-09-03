---
name: development
description: Guides ccusage monorepo development. Use when editing workspace packages, the npm launcher or native packaging, dependencies, or shared configuration, and when running the `just` build, typecheck, test, format, or check recipes.
---
# ccusage 开发

根目录的 `AGENTS.md` 说明了仓库的整体结构和长期有效的规范。本技能关注的是如何在代码树中开展工作：npm 打包接缝、配方（recipes），以及验证。

## npm 打包接缝

`apps/ccusage` 是包裹 Rust 二进制文件的 npm 外壳——包含包元数据、`config-schema.json`，以及打包和基准测试脚本。它的 `src/cli.js` 启动器会从匹配的 `@ccusage/ccusage-<platform>-<arch>` 可选依赖中解析出平台二进制文件并将其拉起；这些包位于 `packages/ccusage-<platform>-<arch>`，其中只包含 `bin/ccusage`。

`apps/ccusage/scripts/` 中的 Nushell 脚本负责二进制这一侧，并共享 `native-binary.nu`：`ensure-native-binary.nu` 会为本地构建准备好一个可用的、可移植的二进制文件，`stage-native-package.nu` 用于填充某个平台包，而 `verify-native-package.nu` 则从每个平台包的 `prepack` 中运行。一次打包改动通常需要同时修改启动器和这些脚本。

## 注意事项

- `.claude/skills` 是由 `nix/agent-skills.nix` 从 `.agents/skills` 生成的。请编辑源码树；生成的目录不要提交。
- `LOG_LEVEL` 用于控制运行时噪声（`rust/crates/ccusage-core/src/logger.rs`）：`0` 会抑制进度输出和边框标题，`>= 4` 会记录定价刷新的细节。只要涉及捕获或比对输出，就使用 `LOG_LEVEL=0`。

`references/commands.md` 涵盖了 `just` 的用法、新依赖或工具应放置的位置、验证，以及发布。
