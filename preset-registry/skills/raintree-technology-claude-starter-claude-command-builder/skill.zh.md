---
name: claude-command-builder
description: Interactive slash command creator for Claude Code. Triggers when user mentions creating commands, slash commands, command templates, command arguments, or wants to build a new command workflow.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---
# Claude Code 命令构建器

创建易于维护的 Claude Code 斜杠命令，并提供清晰的参数处理、作用域行为和验证指导。

## 快速工作流

1. 明确命令名称、面向用户的触发方式、参数、预期副作用，以及它应属于项目作用域还是用户作用域。
2. 让命令正文专注于任务；如果可复用示例或较长的参考内容不是每次运行都需要，请将其放在命令之外。
3. 在声称命令已准备就绪之前，验证命令名称、frontmatter、参数提示和文件放置位置。
4. 向用户提供已安装路径以及一个切合实际的调用示例。

## 详细参考

当你需要完整的斜杠命令模板、参数模式、示例、反模式和故障排除说明时，阅读 `references/full-guide.md`。先加载此入口文件，然后仅加载与任务相关的参考章节。

## 文档

当行为取决于已安装的 Claude Code 版本时，阅读当前的 Claude Code 命令文档。

## 输出

提供具体的文件路径、命令、验证步骤，以及任何重启/重新加载要求。如果生成一个小文件或修改一项设置就足够，请避免进行大范围重写。