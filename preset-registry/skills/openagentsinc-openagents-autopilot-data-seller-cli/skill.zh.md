---
name: autopilot-data-seller-cli
description: Shell-first OpenAgents DS-first Data Market packaging and publication workflow using the deterministic packaging helper, autopilotctl, and the no-window headless runtime.
metadata:
  oa:
    project: openagents
    identifier: autopilot-data-seller-cli
    version: "0.3.0"
    expires_at_unix: 1798761600
    capabilities:
      - codex:shell
      - data-market:packaging
      - data-market:cli-publication
      - data-market:headless-control
      - data-market:conversation-redaction
---
# Autopilot 数据卖家 CLI

当任务是将本地材料打包出售，并通过 CLI 而非可见的 `Data Seller` 窗格发布或管理这些材料时，请使用此技能。

## 快速开始

- 对于实际发布，请将无头运行时指向你真正想要使用的中继；在以 DS 为先的卖家/买家流程中，你不需要 `nexus-control` 或 `OA_CONTROL_*`。
- 使用 [`scripts/package_data_asset.sh`](scripts/package_data_asset.sh) 打包本地文件或文件夹。
- 使用 [`scripts/package_codex_conversations.sh`](scripts/package_codex_conversations.sh) 打包经过脱敏的 Codex 对话。
- 需要时启动无窗口运行时：
  `cargo run -p autopilot-desktop --bin autopilot_headless_data_market -- --manifest-path ...`
- 首先使用以下命令检查真实状态：
  `cargo run -p autopilot-desktop --bin autopilotctl -- --manifest ... --json data-market seller-status`
- 遵循语义化 CLI 顺序：
  草拟资产 -> 预览资产 -> 发布资产 -> 快照 -> 草拟授权 ->
  预览授权 -> 发布授权 -> 付款 -> 交付 -> 撤销
- 仅当你有意在终端会话中使用对话式卖家通道时，才使用 `seller-prompt`。若要实现确定性的 DS 优先发布，请优先使用打包式 CLI 路径。

## 必须遵守的操作规则

1. 仅使用语义化 CLI 命令。不要模拟窗格点击。
2. 如果本地文件仍需确定摘要/来源的真实信息，请先打包再草拟。
3. 每次发布前都要预览。
4. 仅在预览或意图已得到明确检查后，才为发布或撤销传递 `--confirm`。
5. 每次变更后，都要使用 `seller-status` 或 `snapshot` 回读状态。
6. 不要编造 `content_digest`、`provenance_ref`、策略、价格或交付方式。
7. 保持打包元数据扁平化且值为字符串，以确保其与卖家工具契约兼容。
8. 对于 Codex 会话包，默认使用经过脱敏的对话打包器，而不是手动编辑 rollout JSONL 或打包原始 `.codex` 文件。
9. 除非用户明确要求在脱敏后包含开发者/系统提示词材料，否则应始终将其排除。
10. 发布前，检查导出的包中是否仍有需要清理的项目特定名称或字面值；必要时使用 `--scrub` 重新运行打包。
11. 将 DS 上架信息和 DS 报价发布视为公开市场的真实信息，并将 DS-DVM 请求/结果流量视为定向履约层。
12. 使用 `scripts/autopilot/verify-data-market-cli-headless.sh` 作为可移植的本地启动门禁。将公共中继测试工具视为运维探针，而非确定性门禁。
13. 如果计划依赖 `seller-prompt`，请勿设置 `OPENAGENTS_DISABLE_CODEX=true`；该标志用于仓库自有的类型化验证流程。

## 何时阅读参考资料

- 在打包或编辑生成的 JSON 之前，阅读 [references/packaging-contract.md](references/packaging-contract.md)。
- 在打包 Codex 会话或编辑经过脱敏的对话包之前，阅读
  [references/codex-conversation-redaction.md](references/codex-conversation-redaction.md)。
- 阅读 [references/cli-workflow.md](references/cli-workflow.md)，了解从打包到发布资产/授权的端到端流程。
- 在选择 `default_policy` 或 `policy_template` 时，阅读
  [references/policy-template-cheatsheet.md](references/policy-template-cheatsheet.md)。

## 脚本

- `scripts/package_data_asset.sh`：对确定性本地打包辅助工具的轻量封装。
- `scripts/package_codex_conversations.sh`：对近期或明确指定的 Codex 推演会话进行脱敏，并将其转换为常规的数据市场草稿产物。
- `scripts/publish_asset.sh`：语义化的资产草稿/预览/发布/快照流程。
- `scripts/publish_grant.sh`：语义化的授权草稿/预览/发布/快照流程。

## 边界

- 此技能以 shell 为主，但仍通过 `autopilotctl` 对接归应用所有的数据卖方逻辑。
- 对于应用内的对话式卖方工作，请使用专用的窗格技能。
- 不要创建绕过预览、确认或由中继支持的状态/快照回读机制的并行发布路径。

## 验证依据

- 可移植的本地验证器：
  `scripts/autopilot/verify-data-market-cli-headless.sh`
- 最新的付费本地 DS 优先审计：
  `docs/audits/2026-03-21-ds-first-headless-data-market-paid-e2e-audit.md`
- 实时公共中继探测：
  `scripts/autopilot/headless-data-market-public-e2e.sh`