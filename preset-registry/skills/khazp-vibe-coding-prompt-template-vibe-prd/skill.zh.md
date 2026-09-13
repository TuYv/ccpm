---
name: vibe-prd
description: "Write or revise an MVP product requirements document with scope and observable acceptance criteria."
allowed-tools: Read, Write, Glob, Grep, AskUserQuestion
---
# 产品需求

使用现有研究、用户请求和 Handoff Context 来定义产品成果。不要重复询问已有答案的访谈内容。仅针对会影响范围或验收的未解决需求提问；明确说明可逆假设，并在需求简述充分时继续推进。

编写与产品规模相称的 PRD。涵盖目标用户和问题、核心旅程、MVP 范围、不在范围内的工作、有意义的失败状态、约束条件以及可观察的验收标准。仅在产品确有需要时纳入 AI、账户、支付、分析、合规或自动化内容。

对于小型项目，简短文档即可。对于复杂项目，在依赖关系和会阻碍实现的关键决策明确之前，先予以澄清。避免固定的功能数量、强制要求的人物角色，或不会改变产品决策的市场调研。区分已达成共识的事实与假设。

使用 manifest 配置的 PRD 路径，或 `docs/PRD-[AppName]-MVP.md`。以 Handoff Context 结尾，其中包含应用、已知用户水平、平台、预算、时间线、模式、约束、决策、源文件和开放问题。不要将计划中的验收检查呈现为已执行的证据。如果用户请求完整工作流，则在该范围内继续进行技术设计。

对于仍有未解决需求的引导式访谈，请查阅相关的[可选问题提示](references/question-bank.md)。

为 `vibeworkflow` 生成文档时，请包含精确的 [CLI 输出元数据](references/cli-output.md)。这是解析器契约，不是可选的 prose 模板。