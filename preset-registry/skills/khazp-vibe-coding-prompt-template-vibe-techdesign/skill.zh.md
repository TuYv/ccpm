---
name: vibe-techdesign
description: "Write an MVP technical design from agreed requirements, including architecture choices and relevant tradeoffs."
allowed-tools: Read, Write, Glob, Grep, WebSearch, AskUserQuestion
---
# MVP 技术设计

阅读已达成一致的需求并复用 Handoff Context。在提出替代方案之前，先检查现有项目的技术栈和相关实现。

只询问仍未解决且会产生重大影响的选择；已有明确答案的内容无需再次确认。

描述核心流程所需的架构：组件/服务边界、数据所有权、集成契约、部署目标以及相关故障行为。优先采用满足需求的最小设计。只有在有充分理由时，才添加身份验证、存储、基础设施、AI 或付费服务。通过已安装的代码或官方来源验证供应商信息的变更。

记录有意义的权衡、兼容性约束、适用时的迁移/恢复要求，以及检查结果的方式。区分本地测试操作、外部发送、生产环境写入和部署。不要将机密信息写入生成的文档。不要分配宽泛的工具权限，也不要要求团队中的多个代理来执行普通实现工作。

使用清单中配置的设计路径，或使用 `docs/TechDesign-[AppName]-MVP.md`。

快速模式可以只包含简短的架构和实现计划；更深入的模式应仅在不确定性或风险确实需要时扩展内容。以包含 App、已知用户水平、平台、预算、时间线、模式、约束、决策、源文件和开放问题的 Handoff Context 结尾。继续进入下一个已授权的工作流阶段，不要仅仅因为文档已经存在就停止。

对于仍有未解决需求的引导式访谈，请参考相关的[可选问题提示](references/question-bank.md)。

为 `vibeworkflow` 生成文档时，必须包含准确的[CLI 输出元数据](references/cli-output.md)。这是解析器契约，不是可选的说明模板。