---
name: codexbar
description: "CodexBar read. Provider usage, limits, credits, config health. JSON. No writes."
---
# CodexBar

读取 CodexBar 的数据。绝不修改配置/认证信息。

## 运行

```bash
skill="${CODEX_HOME:-$HOME/.codex}/skills/codexbar"
"$skill/scripts/codexbar" doctor
"$skill/scripts/codexbar" providers
"$skill/scripts/codexbar" usage
"$skill/scripts/codexbar" usage --provider codex
"$skill/scripts/codexbar" usage --all
```

所有 stdout 均为 JSON。保持上游 CodexBar 的数据结构。减少偏差，节省 token。

## 规则

- 安装/配置状态未知时，先运行 `doctor`。
- `usage` 读取已启用的 provider。优先使用此项。
- `usage --provider ID` 读取单个 provider。
- `usage --all` 开销较大；仅在需要时使用。
- 身份信息默认隐藏。仅当用户明确需要时才使用 `--include-identities`。
- 密钥始终隐藏。
- 辅助脚本为只读：仅有固定的允许列表。不写入配置、不修复认证、不执行启用/禁用、不存储密钥。
- 超时意味着上游卡住。缩小 provider 范围或调高 `CODEXBAR_TIMEOUT`（默认 120 秒）。

## 二进制文件

自动查找顺序：`CODEXBAR_BIN`、PATH、应用安装包（app bundle）、Homebrew cask。若缺失：打开 CodexBar，进入 Preferences > Advanced > Install CLI；或设置 `CODEXBAR_BIN`。

每个 stdout/stderr 流的上限为 1 MiB，同时确保完全读取排空。超时会终止整个进程组。
