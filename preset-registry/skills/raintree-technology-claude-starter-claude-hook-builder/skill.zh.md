---
name: claude-hook-builder
description: Interactive hook creator for Claude Code. Triggers when user mentions creating hooks, PreToolUse, PostToolUse, hook validation, hook configuration, settings.json hooks, or wants to automate tool execution workflows.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---
# Claude Code Hook 构建器

创建围绕工具使用或会话事件的 Claude Code hook，使其范围明确、可测试且能够安全失败。

## 快速工作流

1. 在编写代码之前，明确 hook 事件、匹配器、预期决策、预期副作用以及失败行为。
2. 对于安全敏感的验证，优先使用小型、确定性的脚本，而不是基于宽泛提示的检查。
3. 除非用户明确需要面向所有用户的行为，否则将 hook 限定在项目范围内。
4. 在将 hook 接入设置之前，先使用具有代表性的 JSON 负载直接测试 hook 脚本。

## 详细参考

当你需要 hook 事件负载、匹配器示例、验证脚本、设置片段和故障排除指导时，请阅读 `references/full-guide.md`。始终先加载此入口文档，然后仅加载与任务相关的参考部分。

## 文档

当事件负载或权限语义很重要时，请阅读最新的 Claude Code hook 文档。

## 输出

提供具体的文件路径、命令、验证步骤，以及任何重启/重新加载要求。如果只需一个小型生成文件或设置即可解决问题，避免进行宽泛的重写。