---
name: ROSA AWS Context
description: "Cross-check AWS-facing code and docs against official ROSA and AWS references before changing behavior."
---
# ROSA AWS 上下文

在以下情况下使用此技能：

- 修改 `pkg/aws/` 或与 AWS 相关的命令流程
- 编辑 AWS 设置、先决条件或故障排除文档
- 修改有关 HCP、classic、STS、IAM、OIDC、VPC、子网、配额或区域行为的措辞

## 工作流程

1. 阅读 `AGENTS.md` 和 `guidelines/aws-guidelines.md`，然后优先使用其中链接的外部 ROSA 和 AWS 参考资料。
2. 确定变更是仅适用于 HCP、仅适用于 classic，还是二者共用。
3. 在修改代码注释、帮助文本或文档之前，对照 ROSA 架构文档核实架构相关说明。
4. 对照 ROSA 设置文档确认有关先决条件的说明，尤其是配额、支持计划、SCP 限制和 STS 令牌版本说明。
5. 在编辑示例之前，对照 AWS CLI 官方文档验证有关 AWS CLI 安装、配置文件和配置的指导。
6. 优先使用现有的 AWS 辅助函数和客户端封装，而不是临时直接使用 SDK。
7. 不要在未说明的情况下升级 AWS SDK 或相关依赖项的版本；如果确实需要升级，请明确指出，解释原因，并验证对下游的影响。
8. 不要硬编码凭证，也不要添加会暴露机密材料的日志记录。
9. 如果代码行为与官方文档看似不一致，请明确指出这种差异，而不要猜测。

## 验证

- 重新阅读支持所变更行为或措辞的确切文档章节。
- 检查面向用户的示例是否使用当前有效的命令和选项。
- 运行 `CONTRIBUTING.md` 和 `Makefile` 中相关的本地检查。