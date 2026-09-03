---
name: profile
description: Profiles ccusage performance. Use when a CLI command is slow, when checking that an optimization actually helped, when comparing a branch against main, or when reading a captured CPU profile.
---
# ccusage 性能分析

几乎所有运行时开销都存在于 Rust 二进制文件中。`references/rust.md` 涵盖了 release 构建方式、branch 与 main 对比的 worktree 配置、确定性测量、JSON 一致性校验，以及如何复现 CI 性能评论。

有两条习惯贯穿此处的每一次性能分析：

- 在相信任何剖析结果之前，先在真实日志上做端到端测量。本仓库中的性能收益都来自在真实 Claude 数据上对真实 CLI 计时；微基准只能回答孤立的问题，无法预测 CLI 层面的收益。
- 在改动聚合顺序之后，重新校验 `daily`、`weekly`、`monthly`、`session` 和 `blocks` 的 JSON，并在提交信息中记录所有经过测量但被有意搁置的热点。

## Node 相关路径

`apps/ccusage/src/cli.js` 负责解析并启动平台二进制文件，因此 JavaScript 侧是一个启动延迟问题而非吞吐量问题——对它的剖析只覆盖启动器的启动过程，而不覆盖二进制文件所做的实际工作：

```sh
LOG_LEVEL=0 node --cpu-prof --cpu-prof-dir /tmp/ccusage-profiles apps/ccusage/src/cli.js daily --offline --json
```

此处没有任何其他内容运行在 `node` 上。`nix/tools/` 下的工具使用 `bunCli`/`bunNodeModules` 构建并在 Bun 下运行；`apps/ccusage/scripts/` 中的脚本带有选择 nushell、babashka 或 bun 的 `nix shell` shebang。请直接对这些脚本计时，并使用它们各自运行时的工具进行剖析，而不是使用 `NODE_OPTIONS`。

将 `--cpu-prof-dir` 指向 worktree 之外——此处没有任何配置会忽略 `profiles/` 目录。
