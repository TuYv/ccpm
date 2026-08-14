---
description: Validate a Composio CLI beta release and promote it to a stable release by dispatching the CLI binary workflow with an existing beta tag.
---
# CLI 发布晋级

在处理 Composio CLI 发布流水线，或代理需要测试 beta 版 CLI 二进制文件并触发最终的稳定版晋级时，请使用此技能。

## 涵盖内容

- 查找由 Changesets 发布 PR 生成的 beta 发布标签
- 通过现有安装路径对该 beta 版本进行冒烟测试
- 仅将现有 beta 版本晋级为稳定版 CLI

## Beta 发布模型

- Beta 版本由 `.github/workflows/build-cli-binaries.yml` 创建
- 它们由标题为 `Release: update version` 的 Changesets 发布 PR 触发
- Beta 标签采用 `@composio/cli@<version>-beta.<pr-number>` 格式
- 稳定版本通过同一工作流，从现有 beta 标签手动晋级

## 验证 Beta 版本

选择要晋级的 beta 标签，然后在晋级前进行测试。

如果只需要在仓库侧进行验证，请使用现有的安装健康检查工作流：

```bash
gh workflow run cli.test-installation.yml -f version='@composio/cli@0.2.18-beta.123'
```

如需进行本地冒烟测试，请安装该确切 beta 二进制文件并验证升级路径：

```bash
curl -fsSL https://raw.githubusercontent.com/ComposioHQ/composio/main/install.sh | bash -s -- '@composio/cli@0.2.18-beta.123'
composio --version
composio upgrade --beta
```

`composio upgrade --beta` 应保持在 beta 渠道并解析到最新的预发布版本，而不是最新的稳定版本。

## 晋级为稳定版

只能通过引用现有 beta 标签进行晋级。

使用该 beta 标签手动运行 CLI 二进制文件工作流：

```bash
gh workflow run build-cli-binaries.yml -f beta_tag='@composio/cli@0.2.18-beta.123'
```

该工作流将：

- 验证 beta 版本是否存在
- 拒绝非预发布标签
- 派生稳定版标签 `@composio/cli@0.2.18`
- 从 beta 版本记录的提交重新构建
- 发布稳定版 GitHub Release

## 参考文件

需要了解实现细节时，请阅读以下文件：

- `.github/workflows/build-cli-binaries.yml`
- `ts/packages/cli/src/commands/upgrade.cmd.ts`
- `ts/packages/cli/src/services/upgrade-binary.ts`
- `ts/docs/internal/release.md`