---
name: ccusage-development
description: Guides ccusage monorepo development. Use when editing packages, docs, shared configuration, bundled CLI packaging, dependencies, exports, or validation commands.
---
# ccusage 开发

## 仓库结构

这是一个 monorepo。在编辑某个包之前，请先查看离它最近的包专属 `CLAUDE.md`：

- `apps/ccusage/CLAUDE.md` - 主要的 Claude Code 用量 CLI 与库
- `docs/CLAUDE.md` - VitePress 文档站点

生产环境的 CLI 实现以 Rust 为先，位于 `rust/crates/ccusage` 下。`apps/ccusage` 包现在主要提供 npm 元数据、TypeScript 的 bin 启动器、生成的 schema 产物、基准测试以及发布打包。

面向用户的规范命令是 `ccusage` 及其 agent 子命令：

```sh
ccusage daily
ccusage codex daily
ccusage opencode daily
ccusage amp daily
ccusage pi daily
```

独立的 agent 包装器包已被移除。在文档、测试、示例和新行为中应优先使用 `ccusage <agent> ...`，并且不要重新引入诸如 `ccusage-codex`、`ccusage-opencode`、`ccusage-amp` 或 `ccusage-pi` 之类的包装器命令。

Agent 实现位于 Rust CLI 中，除非该工作明确针对剩余的 TypeScript 包接口面。请将包的运行时库视为随包捆绑的资产：除非用户明确要求，否则将依赖添加到各包的 `devDependencies` 中。

## 常用命令

除非范围更窄的包命令更为合适，否则请使用根命令。根命令与主 CLI 命令的示例请参阅 `references/commands.md`。

`LOG_LEVEL` 控制日志的详细程度，从 `0`（静默）到 `5`（trace）。

## 环境与工具

本仓库要求贡献者使用带 nix-direnv 的 Nix flake 开发环境进行配置。请使用已激活的 direnv shell，以便固定版本的 Rust、Bun、pnpm、git hooks、agent skills 以及仓库 CLI 都位于 `PATH` 上。

日常工作时请使用已激活的 `direnv` 环境。若要在 shell 之外执行非交互式的一次性任务，请优先使用 `direnv exec . <command>`。

工具由 `flake.nix` 和 `package.json` 管理。在合适的情况下可以使用 `comma` 或 `nix run` 进行一次性排查，但应将经常使用的项目工具添加到仓库中：

- 将系统/dev-shell CLI 添加到 `flake.nix`，并将相应的 `flake.lock` 更新包含在同一提交中。
- 将 JavaScript/TypeScript 工具和脚本添加到 `package.json`，并将相应的 lockfile 更新包含在同一提交中。
- 保持每个工具的添加均可独立回滚；不要在没有解释其来源的 manifest 变更的情况下提交 lockfile 更新。
- `.claude/skills` 下的项目本地 Claude skills 由 `agent-skills-nix` 从 `.agents/skills` 生成；请勿编辑或提交 `.claude/skills`。

## 代码风格

- 对于 Rust CLI 工作，在编辑 `rust/crates/**`、原生打包行为或 Rust 定价嵌入之前，请先使用 `ccusage-rust` skill。Rust 性能工作请使用 `ccusage-rust-profile`。
- 保持 Rust 模块小巧且职责聚焦。优先使用 `pub(crate)` 而非更宽泛的可见性，避免在热路径中进行不必要的 `String` 克隆，并将单元测试放在其所测试的模块旁边。
- 对于 TypeScript 包/工具代码，在编辑之前请先使用 `ccusage-typescript` skill 和 `typescript-style`。将 `satisfies` 和 `as const satisfies` 的相关指引保留在那里，而不要把 TypeScript 细节混入 Rust 工作流规则。
- 只导出被其他模块使用的常量、函数和类型。
- 尽可能将仅内部使用的文件和辅助工具保持私有。
- 对于捆绑/私有的包，新增依赖应放入 `devDependencies`。

## 变更后工作流

代码变更后，如果可能适用格式化，请先运行格式化，因为它会修改文件：

```sh
pnpm run format
```

Git hooks 和 CI 覆盖标准验证路径。当变更涉及行为、类型、包代码，或 hooks/CI 未覆盖所编辑的文件时，请手动运行类型检查和测试：

```sh
pnpm typecheck
pnpm run test
```

对于包内局部的工作，如果范围更窄的包脚本运行更快，可在迭代期间运行这些脚本，然后在结束前运行根工作流。

## 性能与 CLI 输出

原生 CLI 性能优化、Rust 性能分析、hyperfine A/B 对比以及分支与 main 的对比性能分析，请使用 `ccusage-rust-profile`。TypeScript 启动器、基准测试或打包脚本请使用 `bun-cpu-profile`。

在验证终端渲染、响应式表格、长时间运行的 CLI 输出，或依赖真实终端几何特征的输出时，请使用 `cmux-debug` skill。

## 提交与 PR 命名

提交结构、Conventional Commits、scope 选择以及详细的提交信息要求，请使用 `commit` skill。

在开启 PR 或推送后续提交之后，请使用 `create-pr` skill，以确保 AI 和人工的评审意见被请求、检视、答复，并通过小的可回滚提交加以落实。
