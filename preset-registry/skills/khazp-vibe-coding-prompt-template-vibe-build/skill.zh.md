---
name: vibe-build
description: Implement an approved new-project slice and report actual checks. For changes to an existing app use vibe-change.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# Vibe 构建

阅读 AGENTS.md、MEMORY.md、manifest 的产品文档以及相关的 agent_docs。为一个可用切片建立验收标准，并在现有授权范围内实现。保留未提交的工作，并在进行高风险更改前记录实际的恢复检查点；绝不伪造提交或备份。

从一个可运行的屏幕或等效的可观察输出开始。只有在需求确有必要时，才添加身份验证、数据库、基础设施和 AI。查看命令后运行项目适用的检查；doctor 仅用于设置验证。使用 `../vibe-verify/SKILL.md` 执行实际操作流程。对于 AI 功能，还要在适用时检查失败行为、数据边界和权限拒绝。

在 MEMORY.md 中更新当前进度和后续步骤；稳定规则保留在 AGENTS.md 中。报告 Changed、Checked（包含命令和结果）、Not checked、Next decision 和 Recovery。不要将构建通过视为行为正常运行的证明。