---
name: cli-release
description: Release and recover first-party Composio CLI binaries through Build CLI Binaries, including automatic beta builds, promote-stable dispatches, beta-tag selection, asset and installation verification, and failed release recovery. Use when a contributor asks to build a CLI beta, publish or promote a stable CLI version, choose a release candidate, monitor a CLI release, or diagnose a failed CLI release. Do not use for TypeScript SDK Changesets releases or CLI source implementation.
---
# CLI 发布

此技能用于为独立的 `composio` 二进制文件和安装程序提供支持的 GitHub Release。

在选择候选版本或触发工作流之前，请阅读 `references/release-workflow.md`。

## 发布契约

- 切勿为 `@composio/cli` 或 `@composio/cli-local-tools` 添加 Changeset；Changesets 会忽略这两个包，而此类文件会导致 `ts.release.yml` 卡住。
- 将任何涉及 CLI 路径且合并到 `next` 的变更视为 beta 构建。对于常规的稳定版本发布流程，请使用 `promote-stable` 工作流操作来提升经过测试的 beta 版本。
- 切勿通过修改私有 CLI 的 `package.json` 版本号来选择二进制文件版本。对于有意进行的次版本或主版本发布，请构建一个明确指定版本号的 beta 版本，并通过相同的稳定版本发布流程提升该已测试的 beta 版本。
- 在执行操作之前，立即从 GitHub 获取 beta 标签和工作流状态。切勿凭记忆臆造候选版本或复用已过期的候选版本。
- 稳定版本提升属于生产环境写入操作。如果用户未指定确切的 beta 标签，请展示解析出的候选版本，并在触发工作流前获得明确确认。
- 持续跟进发布流程，直至完成资产验证和安装测试。不要在触发成功后就停止。

## 执行

1. 将请求分类为自动 beta、手动 beta、稳定版本提升或恢复。
2. 执行操作手册中的只读预检，并确定确切的源提交和发布标签。
3. 仅触发请求的工作流操作，并监视生成的运行直至完成。
4. 验证已发布的 Release，以及操作手册中指定的下游检查。
5. 报告已发布的标签、源 beta 或提交、工作流 URL、资产状态、安装测试结果，以及任何剩余的后续事项。